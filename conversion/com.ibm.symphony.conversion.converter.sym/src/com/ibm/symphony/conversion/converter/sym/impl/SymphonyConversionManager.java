/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.sym.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.sym.SymConversionResult;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class SymphonyConversionManager
{
  private ConversionTaskQueue taskQue;

  private SymphonyManager symphonyMgr;

  private volatile static SymphonyConversionManager instance;

  private static final Logger LOG = Logger.getLogger(SymphonyConversionManager.class.getName());

  private String conversionFolder;

  private static int MAX_RETRY_TIMES = 3;
  
  private static Set<String> ERRORS_NEED_KILL = new HashSet<String>();
  static 
  {
    ERRORS_NEED_KILL.add(ConversionConstants.ERROR_SYM_JOB_OVERTIME);
    ERRORS_NEED_KILL.add(ConversionConstants.ERROR_WORK_MANAGER_OVERTIME);
    ERRORS_NEED_KILL.add(ConversionConstants.ERROR_UNKNOWN);
  }

  
  public static SymphonyConversionManager getInstance()
  {
    if (instance == null)
    {
      synchronized (SymphonyConversionManager.class)
      {
        if (instance == null)
        {
          instance = new SymphonyConversionManager();
        }
      }
    }
    return instance;
  }

  private SymphonyConversionManager()
  {
    taskQue = new ConversionTaskQueue();
    symphonyMgr = new SymphonyManager();
    conversionFolder = ConversionService.getInstance().getRepositoryPath() + File.separator + "output" + File.separator
        + "symphony";
  }

  public SymConversionResult convert(String source, String sourceType, String targetType, HashMap<String, String> options) throws Exception
  {
    // TODO temporary converted location should be configurable
    // Integer code = source.hashCode();
    UUID code = UUID.randomUUID();
    String targetDir = conversionFolder + File.separator + code.toString();
    return convert(source, targetDir, sourceType, targetType, options);

  }

  public SymConversionResult convert(String source, String targetFolder, String sourceType, String targetType,
      HashMap<String, String> options) throws Exception
  {
    ConversionTask task = new ConversionTask(source, targetFolder, sourceType, targetType, options);
    return doConvert(task, 0);
  }

  private SymConversionResult doConvert(ConversionTask task, int times) throws Exception
  {
    if (LOG.isLoggable(Level.FINEST))
    {
      LOG.log(Level.FINEST, "Idle symphony count: " + symphonyMgr.getIdleSymphonyNumber() + ", idle standby symphony count: " + symphonyMgr.getIdleStandbySymphonyNumber());
      LOG.log(Level.FINEST, "Task Que size : " + taskQue.size() + ", maxQue size : " + symphonyMgr.getMaxQueueSize());      
    }
    
    task.setConnectCount(times);
    
    SymphonyDescriptor descriptor = null;
    if (task.symphonyDesc != null)
    {
      LOG.log(Level.FINER, "For retry case, try to find the available soffice in standby list firstly.");
      
      // For retry case, poll an available soffice in standby queue and push the bad soffice into the standby queue.
      descriptor = symphonyMgr.getStandBySymphonyDescriptor(task.symphonyDesc);
      if (descriptor == null)
      {
        // If the standby queue is empty, then should try to get a soffice instance in the normal queue.
        descriptor = symphonyMgr.getSymphonyDescriptor();
        if (descriptor != null)
        {
          // Find a soffice instance in the normal soffice queue, need to release the current soffice to the queue.
          releaseSymphony(task.symphonyDesc);
          LOG.log(Level.FINER, "Standby soffice queue is empty, use the soffice in normal queue, the port is: " + descriptor.port);
        }
        else
        {
          // This is for retry case, just wait 3 seconds until the soffice is recovered, then continue to connect the current soffice.
          Thread.sleep(3000);
          LOG.log(Level.FINER, "No available soffice, wait 3 seconds and contine using the current soffice connection");
        }
      }
      else
      {
        LOG.log(Level.FINER, "Uses the soffice instance in standby queue, the port is: " + descriptor.port);
      }
    }
    else
    {
      // This is the first time to do the conversion task, get the soffice instance from the normal soffice queue.
      descriptor = symphonyMgr.getSymphonyDescriptor();
    }
    
    if (descriptor != null)
    {
      task.setSymphonyDescriptor(descriptor);
    }
    
    if (task.symphonyDesc == null)
    {
      synchronized (taskQue)
      {
        // Check if exceeds the max number of the task queue or not.
        if (taskQue.size() >= symphonyMgr.getMaxQueueSize())
        {
          LOG.log(Level.WARNING, "Symphony queue(size: " + symphonyMgr.getMaxQueueSize() + ") is full, reject conversion: " + task.sourceFile);
          SymConversionResult result = new SymConversionResult();
          result.setErrorCode(ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE);
          result.setErrorMsg("Symphony queue is full!");
          result.setSucceed(false);
          return result;
        }
        taskQue.add(task);
        
        while ((descriptor = symphonyMgr.getSymphonyDescriptor()) == null)
        {
          try
          {
            taskQue.wait();
          }
          catch (InterruptedException e)
          {
            LOG.log(Level.SEVERE, "InterruptedException in task wait - may be caused by Conversion Work thread is time-out : " + task.sourceFile);
            SymConversionResult result = new SymConversionResult();
            result.setErrorCode(ConversionConstants.ERROR_WORK_MANAGER_OVERTIME);
            result.setErrorMsg(e.getMessage());
            result.setSucceed(false);
            taskQue.remove(task);
            LOG.log(Level.INFO, "Task wait interrupted, return doConvert, idle symphony count: " + symphonyMgr.getIdleSymphonyNumber());
            return result;
          }
        }
        
        task.setSymphonyDescriptor(descriptor);
        LOG.log(Level.INFO, "Task wait, set symphony descriptor: " + descriptor.port);
      }
    }

    String connectionStr = "uno:socket,host=" + task.symphonyDesc.host + ",port=" + task.symphonyDesc.port
        + ";urp;StarOffice.ServiceManager";
    SymFileConvert fileConverter = new SymFileConvert(connectionStr);
    SymConversionResult result = new SymConversionResult();
    File sofficeFile = null;
    long startTime = System.currentTimeMillis();
    try
    {
      if (LOG.isLoggable(Level.FINEST))
      {
        LOG.log(Level.FINEST, "Start to convert the file (" + task.sourceFile + ") using connection: " + connectionStr);        
      }
      
      // record symphony soffice host, port, and start time
      
      sofficeFile = sofficeStartState(task);
      String converted = fileConverter.convert(task.sourceFile, task.targetDir, task.sourceType, task.targetType, task.options);
      result.setTargetFile(converted);
    }
    catch (com.sun.star.connection.NoConnectException connectErr)
    {
      LOG.log(Level.SEVERE, "NoConnectException - soffice connection is unavailable : " + task.sourceFile, connectErr);
      if (task.connectCount < MAX_RETRY_TIMES) // retry to convert because the soffice may be in recovery phase
      {
        LOG.log(Level.WARNING,"retry to connect to another available soffice because the current soffice may be in recovery phase");
        result = doConvert(task, task.connectCount + 1);
      }
      else
      {
        result.setErrorCode(ConversionConstants.ERROR_SYM_CONNECTION_UNAVAILABLE);
        result.setErrorMsg(connectErr.getMessage());
        result.setSucceed(false);
      }
    }
    catch (InterruptedException e)
    {
      LOG.log(Level.SEVERE, "InterruptedException - may be caused by Conversion Work thread is time-out : " + task.sourceFile);
      result.setErrorCode(ConversionConstants.ERROR_WORK_MANAGER_OVERTIME);
      result.setErrorMsg(e.getMessage());
      result.setSucceed(false);
    }
    catch (com.sun.star.task.ErrorCodeIOException errIO)
    {
      result.setSucceed(false);
      int errCode = errIO.ErrCode;
      if (errCode == 19211 || errCode == 68367)
      {
        LOG.log(Level.WARNING, "Password Protected document of : " + task.sourceFile, errIO);
        result.setErrorCode(ConversionConstants.ERROR_INVALID_FILE_PASSWORD);
        result.setErrorMsg("Invalid File Password!");
      }
      else if (errCode == 68368 || errCode == 68369)// 68369 ppt
      {
        LOG.log(Level.WARNING, "Unsupported Password Protected document of : " + task.sourceFile, errIO);
        result.setErrorCode(ConversionConstants.ERROR_UNSUPPORT_FILE_PASSWORD);
        result.setErrorMsg("Unsupported File Password!");
      }
      else if(errCode == 296)// file size too large
      {
//        XPropertySet propSet = (XPropertySet)UnoRuntime.queryInterface(XPropertySet.class, errIO.Context);
//        String editorType = (String) propSet.getPropertyValue("editorType");
//        String failedPoint = (String) propSet.getPropertyValue("failedPoint");
//        String checkValue = String.valueOf(propSet.getPropertyValue("checkValue"));
//        System.out.println(editorType);
//        System.out.println(failedPoint);
//        System.out.println(checkValue);
        LOG.log(Level.WARNING, "File size is too large.");
        result.setErrorCode(ConversionConstants.ERROR_FILE_IS_TOO_LARGE);
        result.setErrorMsg("File size is too large!");
      }
      else
      {
        LOG.log(Level.SEVERE, "failed to convert document: " + task.sourceFile, errIO);
        result.setErrorCode(ConversionConstants.ERROR_UNKNOWN);
        result.setErrorMsg(errIO.getMessage());
      }
    }
    catch (RuntimeException e)
    {
      LOG.log(Level.WARNING, "Symphony RuntimeException,which may be caused by the conversion job is canceled or Symphony is crashed,"
          + "or Symphony job is timeout, or other reasons etc.", e);
      result.setSucceed(false);
      if (e.getMessage() != null && e.getMessage().equals(ConversionConstants.ERROR_SYM_JOB_OVERTIME)
          || (System.currentTimeMillis() - startTime)/1000 > 120)
      {
        result.setErrorCode(ConversionConstants.ERROR_SYM_JOB_OVERTIME);
      }
      else
      {
        result.setErrorCode(ConversionConstants.ERROR_UNKNOWN);
      }
      result.setErrorMsg(e.getMessage());
    }
    catch(com.sun.star.lang.IllegalArgumentException e)
    {
      File f = new File(task.sourceFile);
      LOG.log(Level.SEVERE, "failed to convert document: " + task.sourceFile + "; the file is exist: " + f.exists()  + "; server is: " + connectionStr, e);
      result.setSucceed(false);
      result.setErrorCode(ConversionConstants.ERROR_ILLEGAL_ARGUMENT);
      result.setErrorMsg(e.getMessage());
    }
    catch (Exception e)
    {
      if((System.currentTimeMillis() - startTime)/1000 > 120)
      {
        result.setErrorCode(ConversionConstants.ERROR_SYM_JOB_OVERTIME);
      }
      else
      {
        result.setErrorCode(ConversionConstants.ERROR_UNKNOWN);
      }
      result.setSucceed(false);
      result.setErrorMsg(e.getMessage());
    }
    finally
    {
      if (sofficeFile != null && sofficeFile.exists())
      {
        if(result.isSucceed() || !ERRORS_NEED_KILL.contains(result.getErrorCode()))
        {
          sofficeEndState(sofficeFile); //may have file access conflict for retry connections case
        }
      }

      if (!result.isSucceed())
      {
        LOG.log(Level.INFO, "Soffice convert fail, port: " + (descriptor != null ? descriptor.port : task.symphonyDesc.port) +", return error code: "+ result.getErrorCode());
      }
      
      if (times < 1)
      {
        // If the soffice will be killed, switch the bad soffice in the normal queue with a good soffice in the standby soffice queue.
        if (ERRORS_NEED_KILL.contains(result.getErrorCode()) && task.symphonyDesc != null)
        {
          LOG.log(Level.FINE, "The conversion result has error, the soffice may be killed, should switch the bad soffice to standby soffice queue");
          SymphonyDescriptor desc = symphonyMgr.getStandBySymphonyDescriptor(task.symphonyDesc);
          if (desc != null)
          {
            task.setSymphonyDescriptor(desc);
          }
        }
        convertDone(task);
      }
    }
    LOG.log(Level.INFO, "return doConvert, idle symphony count: " + symphonyMgr.getIdleSymphonyNumber());
    return result;
  }

  private File sofficeStartState(ConversionTask task)
  {
    LOG.entering(getClass().getName(), "sofficeStartState_" + task.symphonyDesc.port, "soffice.json");

    String strFolder = task.symphonyDesc.host + "-" + task.symphonyDesc.port;
    strFolder = strFolder.replaceAll("\\.", "-");
    File sFolder = new File(conversionFolder + File.separator + strFolder);
    if (!sFolder.exists())
      sFolder.mkdirs();
    File sFile = new File(sFolder, "soffice.json");

    OutputStream os = null;
    InputStream is = null;
    JSONObject sObj = null;
    try
    {
      if (!sFile.exists())
      {
        sFile.createNewFile();
        sObj = new JSONObject();
        sObj.put("host", task.symphonyDesc.host);
        sObj.put("port", task.symphonyDesc.port);
        sObj.put("conversionCount", 0);
      }
      else
      {
        is = new FileInputStream(sFile);
        if (is.available() == 0)
        {
          sObj = new JSONObject();
          sObj.put("host", task.symphonyDesc.host);
          sObj.put("port", task.symphonyDesc.port);
          sObj.put("conversionCount", 0);
        }
        else
        {
          sObj = JSONObject.parse(is);
        }

        is.close();
        is = null;
      }
      sObj.put("startTime", System.currentTimeMillis() / 1000);
      sObj.put("sourceFile", task.sourceFile);
      sObj.put("targetFolder", task.targetDir);
      os = new FileOutputStream(sFile);
      sObj.serialize(os);
      os.close();
      os = null;
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Fail to access soffice.json for Symphony converter! " + strFolder, e);
      sFile = null;
    }
    finally
    {
      if (is != null)
      {
        try
        {
          is.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Fail to close soffice.json input stream!", e);
        }
      }
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Fail to close soffice.json output stream!", e);
        }
      }
    }

    LOG.exiting(getClass().getName(), "sofficeStartState_" + strFolder);
    return sFile;
  }

  private void sofficeEndState(File sofficeFile)
  {
    String strFolder = sofficeFile.getAbsolutePath();
    LOG.entering(getClass().getName(), "sofficeEndState_" + strFolder, "soffice.json");

    InputStream is = null;
    OutputStream os = null;
    try
    {
      is = new FileInputStream(sofficeFile);
      JSONObject sObj = JSONObject.parse(is);
      is.close();
      is = null;
      sObj.put("startTime", 0L);
      long convCount = (Long) sObj.get("conversionCount");
      sObj.put("conversionCount", ++convCount);
      os = new FileOutputStream(sofficeFile);
      sObj.serialize(os);
      os.close();
      os = null;
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.SEVERE, "soffice.json is not found", e);
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Error to parse soffice.json", e);
    }
    finally
    {
      if (is != null)
      {
        try
        {
          is.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Fail to close soffice.json input stream!", e);
        }
      }
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Fail to close soffice.json output stream!", e);
        }
      }
    }

    LOG.exiting(getClass().getName(), "sofficeEndState_" + strFolder);
  }

  /**
   * Convert done, remove the task from the queue, release the soffice and notify other tasks in waiting status.
   * 
   * @param task
   */
  private void convertDone(ConversionTask task)
  {
    synchronized (taskQue)
    {
      taskQue.remove(task);
      if (task.symphonyDesc != null)
      {
        symphonyMgr.addSymphonyDescriptor(task.symphonyDesc);
        taskQue.notifyAll();
      }
    }
  }
  
  /**
   * Release the soffice and notify other tasks in waiting status.
   * 
   * @param descriptor
   */
  private void releaseSymphony(SymphonyDescriptor descriptor)
  {
    synchronized (taskQue)
    {
      if (descriptor != null)
      {
        symphonyMgr.addSymphonyDescriptor(descriptor);
        taskQue.notifyAll();
      }
    }
  }
  
  /**
   * Get the count of idle soffice instances in the queue.
   * 
   * @return the count of idle soffice instances in the queue
   */
  public int getIdleSymphonyNumber()
  {
    return symphonyMgr.getIdleSymphonyNumber();
  }

  /**
   * Get the max symphony instances count
   * @return
   */
  public int getMaxSymInstances()
  {
    return symphonyMgr.getMaxSymInstances();
  }
}
