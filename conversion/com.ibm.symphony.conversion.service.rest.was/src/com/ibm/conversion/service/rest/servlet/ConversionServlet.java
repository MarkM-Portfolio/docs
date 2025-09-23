/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet;

import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.ibm.conversion.service.rest.servlet.auth.S2SCallHelper;
import com.ibm.conversion.service.rest.servlet.util.ServletUtil;
import com.ibm.conversion.service.rest.servlet.util.WASConfigHelper;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.ThreadConfig;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.IConversionTaskManager;
import com.ibm.symphony.conversion.service.IFormatConverter;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.common.ErrCodeConstants;
import com.ibm.symphony.conversion.service.common.g11n.G11NConfigFileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

/**
 * Servlet implementation class ConversionServlet
 * 
 */
public class ConversionServlet extends HttpServlet
{
  private static final long serialVersionUID = 1L;

  private static final String INSTALL_ROOT_V = "CONVERSION_INSTALL_ROOT";

  /** Logger */
  private static final Logger LOG = Logger.getLogger(ConversionServlet.class.getName());

  private static final int LOG_ID = 1220;// 1220-1229

  // max file length
  private long maxFileSize;

  private File incomingFolder = null;

  private String installRoot = null;

  // Conversion service
  private IConversionService conversionService = null;

  private IConversionTaskManager conversionTaskManager = null;

  private S2SCallHelper s2sCallHelper = null; /* good to make it non static? */

  private int maxConvQSize = 24;
  
  public void init(ServletConfig servletConfig) throws ServletException
  {
    LOG.entering(getClass().getName(), "init", servletConfig);
    super.init(servletConfig);
    try
    { 
      conversionService = ConversionService.getInstance();

      //Set config path for G11NConfigFileUtil from WebSphere variable
      installRoot = WASConfigHelper.getCellVariable(INSTALL_ROOT_V);
      if (installRoot != null)
      {
        ConversionLogger.log(LOG, Level.INFO, LOG_ID, "CONVERSION_INSTALL_ROOT=" + installRoot);
        G11NConfigFileUtil.setConfigPath(installRoot + File.separator + "config" + File.separator + "g11n");
      }

      File repository = new File(conversionService.getRepositoryPath());
      if (!repository.exists())
      {
        repository.mkdirs();
      }
      incomingFolder = new File(repository, Constants.INCOMING_FOLDER_NAME);
      if (!incomingFolder.exists())
      {
        incomingFolder.mkdirs();
      }
      maxFileSize = 1024 * Long.valueOf(conversionService.getConfig(Constants.MAX_FILE_SIZE).toString());
      if (ConversionWorkManager.supportWorkManager())
      {
        conversionTaskManager = ConversionWorkManager.getInstance();
        ConversionWorkManager.getInstance().setConversionService(conversionService);
        maxConvQSize = ConversionWorkManager.getInstance().getWorkManagerMaxThreads()
                    + ConversionWorkManager.getInstance().getWorkManagerMaxQSize();
        TaskMapCleanHeartBeat.getInstance().start();
        UploadConvertJobHeartBeat.getInstance().start();
        ConversionLogger.log(LOG, Level.INFO, LOG_ID,
            "ConversionServlet init: WAS ConversionWorkManager is used for conversion job management. " + ConversionWorkManager.getInstance().getWorkManagerMaxThreads() + "/" + ConversionWorkManager.getInstance().getWorkManagerMaxQSize());
      }
      else
      {
        conversionTaskManager = conversionService;
        ConversionLogger.log(LOG, Level.INFO, LOG_ID,
            "ConversionServlet init: WAS ConversionTaskManager is used for conversion job management.");
      }

      s2sCallHelper = new S2SCallHelper(conversionService);
    }
    catch (Exception e)
    {
      ConversionLogger.log(LOG, Level.SEVERE, ErrCodeConstants.CONVERSION_SERVLET_INIT_ERR, "Conversion servlet init error", e);
      throw new ServletException(e.getMessage());
    }

    LOG.exiting(getClass().getName(), "init");
  }

  /**
   * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    LOG.entering(getClass().getName(), "doPost");    
    response.addHeader("Connection", "close");
    int status = s2sCallHelper.verify(request, response);
    if (status != HttpServletResponse.SC_OK)
    {
      return;
    }    
    
    response.addHeader(Constants.NO_CACHE_HEADER_KEY, Constants.NO_CACHE_HEADER_VALUE);
    Map<String, String> parameters = new HashMap<String, String>();
    File sourceFile = null;
    if (ServletFileUpload.isMultipartContent(request))
    {
      try
      {
        sourceFile = ServletUtil.parseMultipart(request, incomingFolder, parameters);
      }
      catch (Exception e)
      {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        ConversionLogger.log(LOG, Level.WARNING, HttpServletResponse.SC_BAD_REQUEST, new LogEntry(ThreadConfig.getRequestID(), " Exception " + e.getMessage()).toString(), e);
        return;
      }
    }
    else
    {
      Map<String, String[]> parameters1 = request.getParameterMap();
      for (String key : parameters1.keySet())
      {
        parameters.put(key, parameters1.get(key)[0]);
      }
    }

    String sourceMIMEType = parameters.get(Constants.PARAMETER_SOURCETYPE);
    String targetMIMEType = parameters.get(Constants.PARAMETER_TARGETTYPE);
    String sourceFilePath = parameters.get(Constants.PARAMETER_FILEPATH);
    String targetFolderPath = parameters.get(Constants.PARAMETER_TARGETFOLDER);
   
    Object[] logParas = new Object[4];
    logParas[0] = sourceFilePath;
    logParas[1] = targetFolderPath;
    logParas[2] = sourceMIMEType;
    logParas[3] = targetMIMEType;

    // not supported, return 406-Not acceptable
    try
    {
      if (!conversionService.supports(sourceMIMEType, targetMIMEType))
      {
        response.sendError(HttpServletResponse.SC_NOT_ACCEPTABLE);
        ConversionLogger.log(LOG, Level.WARNING, HttpServletResponse.SC_NOT_ACCEPTABLE, logParas, new LogEntry(ThreadConfig.getRequestID(), sourceMIMEType + " to " + targetMIMEType
            + " is not supported.").toString(), null);
        return;
      }
    }
    catch (ConversionException e1)
    {
      response.sendError(Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR, e1.getMessage());
      ConversionLogger.log(LOG, Level.WARNING, Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR, logParas,
          new LogEntry(ThreadConfig.getRequestID(), String.format("ConversionException %s .", new Object[] { e1 })).toString(), null);
      return;
    }
    if (request.getContentLength() < 0)
    {
      response.sendError(HttpServletResponse.SC_LENGTH_REQUIRED);
      ConversionLogger.log(LOG, Level.WARNING, HttpServletResponse.SC_LENGTH_REQUIRED, logParas, new LogEntry(ThreadConfig.getRequestID(),
          "Content-length is not set.").toString(), null);
      return;
    }
    if (request.getContentLength() > maxFileSize)
    {
      response.sendError(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
      ConversionLogger.log(LOG, Level.WARNING, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, logParas,
          new LogEntry(ThreadConfig.getRequestID(), "File is too large.").toString(), null);
      return;
    }

    if(!Boolean.valueOf((String)parameters.get(Constants.PARAMETER_UPLOAD_CONVERT)))
    {
      if(ConversionWorkManager.getInstance().getTaskMap().size() >= maxConvQSize)
      {
        response.sendError(Integer.valueOf(ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE));
        Map<String, ConversionWork> tskM = ConversionWorkManager.getInstance().getTaskMap();
        ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE), logParas,
            new LogEntry(ThreadConfig.getRequestID(), "Conversion Job Queue is full now. Task map Size: " + tskM.size() + "/"
                + maxConvQSize).toString(), null);
        if(LOG.isLoggable(Level.FINEST))
        {
          Iterator<Entry<String, ConversionWork>> it = tskM.entrySet().iterator();
          while(it.hasNext())
          {
            Entry<String, ConversionWork> entry = it.next();
            LOG.log(Level.FINEST, new LogEntry(ThreadConfig.getRequestID(), "jobId:" + entry.getKey() + ", info: sourceFile="
                + entry.getValue().getSourceFile().getAbsolutePath() + ",targetFolder="
                + entry.getValue().getTargetFolder().getAbsolutePath()).toString());
          }
        }
        return;
      }
    }
    
    try
    {
      if (Boolean.valueOf(parameters.get(Constants.PARAMETER_DETECT)))
      {
        IFormatConverter converter = conversionService.getConverter(sourceMIMEType, targetMIMEType);
        if (!ServletUtil.isRunnableAvailable(converter, sourceMIMEType, targetMIMEType, targetFolderPath))
        {
          response.sendError(Integer.valueOf(ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE));
          ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE), logParas, new LogEntry(
              ThreadConfig.getRequestID(), "No avaiable Symphony or Stellent instance at the time!").toString(), null);
          return;
        }
      }
      if (sourceFilePath != null && sourceFilePath.length() > 0)
      {
        ConversionLogger.log(LOG, Level.FINEST, LOG_ID + 1, "Submit conversion job: the sourceFilePath before transform: " + sourceFilePath);
        sourceFilePath = ServletUtil.transformPath(sourceFilePath);// transform relative path to absolute
        ConversionLogger.log(LOG, Level.INFO, LOG_ID + 1, "Submit conversion job: the sourceFilePath after transform: " + sourceFilePath);
        sourceFile = new File(sourceFilePath);
      }
      File targetFolder = getAbsoluteTargetFolder(targetFolderPath, parameters);
      
      if (targetFolder != null && !(targetFolder.exists()))
      {
        response.sendError(Integer.valueOf(ConversionConstants.ERROR_NFS_IO_EXCEPTION));
        ConversionLogger
            .log(
                LOG,
                Level.WARNING,
                Integer.valueOf(ConversionConstants.ERROR_NFS_IO_EXCEPTION),
                logParas,
                new LogEntry(
                    ThreadConfig.getRequestID(),
                    "Conversion is cancelled because the target folder does not exist.\nPls check the shared storage for Document Format Conversion Server. If it is a mounted NFS/CIFS directory on Document Format Conversion Server, make sure the mount is working properly.")
                    .toString(), null);
        return;
      }
      getThumbnailTargetFolder(parameters);
      // transform the picture folder path from relative path to absolute path
      String picFolderPath = parameters.get(Constants.PARAMETER_PICTURE_FOLDER);
      if (picFolderPath != null)
      {
        picFolderPath = ServletUtil.transformPath(picFolderPath);
        parameters.put(Constants.PARAMETER_PICTURE_FOLDER, picFolderPath);
      }

      if (ThreadConfig.getRequestID() != null && !"".equals(ThreadConfig.getRequestID()))
      {
        parameters.put(HttpSettingsUtil.REQUEST_ID, ThreadConfig.getRequestID());
        LOG.info(new LogEntry(ThreadConfig.getRequestID(), " Set into paramater ").toString());
      }
      
      String jobId = (targetFolder == null) ? conversionTaskManager.submitConversionTask(sourceMIMEType, targetMIMEType,
          sourceFile, parameters) : conversionTaskManager.submitConversionTask(sourceMIMEType, targetMIMEType, sourceFile,
          targetFolder, parameters);

      response.setStatus(HttpServletResponse.SC_ACCEPTED);
      JSONObject obj = new JSONObject();
      obj.put(Constants.PARAMETER_JOBID, jobId);
      response.getOutputStream().print(obj.serialize());
    }
    catch (ConversionException e)
    {
      if (ConversionConstants.ERROR_FILE_IS_TOO_LARGE.equals(e.getMessage()))
      {
        response.sendError(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "File is too large");
        ConversionLogger.log(LOG, Level.WARNING, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, logParas, new LogEntry(ThreadConfig.getRequestID(), "File is too large.").toString(), null);
      }
      else
      {
        response.sendError(Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR, e.getMessage());
        ConversionLogger.log(LOG, Level.WARNING, Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR, logParas, new LogEntry(ThreadConfig.getRequestID(), " exception " + e.getMessage()).toString(), null);
      }
      return;
    }
    catch (Exception e)
    {
      response.sendError(Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR);
      ConversionLogger.log(LOG, Level.WARNING, Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR, logParas + new LogEntry(ThreadConfig.getRequestID(), "Exception" + e.toString()).toString(), e.getMessage(), null);
      return;
    }
    LOG.exiting(getClass().getName(), "doPost");
  }
  
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  {
    int status = s2sCallHelper.verify(req, resp);
    if (status != HttpServletResponse.SC_OK)
    {
      return;
    }

    resp.addHeader(Constants.NO_CACHE_HEADER_KEY, Constants.NO_CACHE_HEADER_VALUE);
    
    resp.setContentType("application/json");
    resp.setCharacterEncoding("UTF-8");
    JSONObject r = new JSONObject();

    if ("viewer".equals(req.getParameter("from")))
    {
      try
      {
        String path = req.getParameter("f");
        path = URLDecoder.decode(path, "UTF-8");
        String resolvedPath = ServletUtil.transformPath(path);
        File f = new File(resolvedPath);
        f.getParentFile().list();

        if(f.exists())
        {
          r.put("status", "succ");
        }
        else
        {
          r.put("status", "fail");
        }
      }
      catch (Exception e)
      {
        LOG.warning(new LogEntry(ThreadConfig.getRequestID(), "Failed to detect the viewer sanity check file. " + e.getMessage())
            .toString());
        r.put("status", "fail");
      }
      r.serialize(resp.getOutputStream());
    }
  }

  private File getAbsoluteTargetFolder(String targetFolderPath, Map<String, String> parameters)
  {
    File targetFolder = null;
    if (targetFolderPath != null && targetFolderPath.length() > 0)
    {
      ConversionLogger.log(LOG, Level.FINEST, LOG_ID + 1, "Submit conversion job: the targetFolderPath before transform: "
          + targetFolderPath);
      targetFolderPath = ServletUtil.transformPath(targetFolderPath);// transform relative path to absolute
      ConversionLogger.log(LOG, Level.INFO, LOG_ID + 1, "Submit conversion job: the targetFolderPath after transform: " + targetFolderPath);
      targetFolder = new File(targetFolderPath);
    }

    parameters.put(Constants.PARAMETER_NFS_TARGET_FOLDER, targetFolderPath);

    return targetFolder;
  }

  private void getThumbnailTargetFolder(Map<String, String> parameters)
  {
    String targetFolderPath=parameters.remove("thumbnailFolder");
    if (targetFolderPath != null && targetFolderPath.length() > 0)
    {
      ConversionLogger.log(LOG, Level.FINEST, LOG_ID + 1, "Submit conversion job: the thumbnailTargetPath before transform: "
          + targetFolderPath);
      targetFolderPath = ServletUtil.transformPath(targetFolderPath);// transform relative path to absolute
      ConversionLogger.log(LOG, Level.INFO, LOG_ID + 1, "Submit conversion job: the thumbnailTargetPath after transform: "
          + targetFolderPath);
      parameters.put("thumbnailFolder", targetFolderPath);
    }
  }
}
