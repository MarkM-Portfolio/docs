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
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.conversion.service.rest.servlet.auth.S2SCallHelper;
import com.ibm.conversion.service.rest.servlet.util.FileUtil;
import com.ibm.conversion.service.rest.servlet.util.MultipartResponse;
import com.ibm.conversion.service.rest.servlet.util.ServletUtil;
import com.ibm.conversion.service.rest.servlet.util.WASConfigHelper;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.ThreadConfig;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.IConversionTaskManager;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.common.ErrCodeConstants;
import com.ibm.symphony.conversion.service.common.g11n.G11NConfigFileUtil;
import com.ibm.symphony.conversion.service.exception.ClusterNodeDownException;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.exception.TaskNotFoundException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

/**
 * Servlet implementation class ConversionServlet
 * 
 */
public class ConversionResultServlet extends HttpServlet
{
  private static final long serialVersionUID = 1L;

  /** Logger */
  private static final Logger LOG = Logger.getLogger(ConversionResultServlet.class.getName());

  private static final int LOG_ID = 1200;// 1200-1219

  // Conversion service
  private IConversionService conversionService = null;

  // Conversion task manager
  private IConversionTaskManager conversionTaskManager = null;

  private S2SCallHelper s2sCallHelper = null; /* good to make it non static? */

  private String installRoot = null;
  
  private static final String INSTALL_ROOT_V = "CONVERSION_INSTALL_ROOT";
  
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
      
      if (ConversionWorkManager.supportWorkManager())
      {
        conversionTaskManager = ConversionWorkManager.getInstance();
        ConversionWorkManager.getInstance().setConversionService(conversionService);
        ConversionLogger.log(LOG, Level.INFO, LOG_ID,
            "ConversionResultServlet Init: WAS ConversionWorkManager is used for conversion job management.");
      }
      else
      {
        conversionTaskManager = conversionService;
        ConversionLogger.log(LOG, Level.INFO, LOG_ID,
            "ConversionResultServlet Init: JDK thread pool is used for conversion job management.");
      }
      s2sCallHelper = new S2SCallHelper(conversionService);
    }
    catch (Exception e)
    {
      ConversionLogger.log(LOG, Level.SEVERE, ErrCodeConstants.CONVERSION_SERVICE_MISSING_ERR, new LogEntry(ThreadConfig.getRequestID(), "Can't get conversion service.").toString(), e);
      throw new ServletException(e.getMessage());
    }

    if (conversionService == null)
    {
      ConversionLogger.log(LOG, Level.SEVERE, ErrCodeConstants.CONVERSION_SERVICE_MISSING_ERR, new LogEntry(ThreadConfig.getRequestID(), "Can't get conversion service.").toString());
      throw new ServletException("Can't get conversion service");
    }
    LOG.exiting(getClass().getName(), "init");
  }

  /**
   * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    LOG.entering(getClass().getName(), "doGet");
    long start = System.currentTimeMillis();
    response.addHeader("Connection", "close");
    int status = s2sCallHelper.verify(request, response);
    if (status != HttpServletResponse.SC_OK)
    {
      return;
    }

    response.addHeader(Constants.NO_CACHE_HEADER_KEY, Constants.NO_CACHE_HEADER_VALUE);
    
    String jobId = request.getParameter(Constants.PARAMETER_JOBID);
    String action = request.getParameter(Constants.PARAMETER_ACTION);
    String targetFolderPath = request.getParameter(Constants.PARAMETER_TARGETFOLDER);

    Object[] logParas = new Object[4];
    logParas[0] = request.getParameter(Constants.PARAMETER_FILEPATH);
    logParas[1] = targetFolderPath;
    logParas[2] = request.getParameter(Constants.PARAMETER_SOURCETYPE);
    logParas[3] = request.getParameter(Constants.PARAMETER_TARGETTYPE);

    if (jobId == null || jobId.length() == 0)
    {
      ConversionLogger.log(LOG, Level.WARNING, HttpServletResponse.SC_BAD_REQUEST, logParas, "JOBID is not set or is null.", null);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST, "JOBID is not set or is null.");
      return;
    }
    try
    {
      if (action != null && action.endsWith("cancel"))// cancel the conversion job
      {
        conversionTaskManager.cancelConversionTask(jobId);
        response.setStatus(HttpServletResponse.SC_OK);
        ConversionLogger.log(LOG, Level.INFO, LOG_ID + 1, "Conversion job is canceled");
        return;
      }
      
      if (targetFolderPath != null && !targetFolderPath.isEmpty())
      {
        // here to get the NFS path from the target folder path, also verify if the path is valid
        ConversionLogger.log(LOG, Level.FINEST, "GetConversionResult: the target folder before transform: " + targetFolderPath);
        targetFolderPath = ServletUtil.transformPath(targetFolderPath);
        ConversionLogger.log(LOG, Level.FINEST, "GetConversionResult: the target folder after transform: " + targetFolderPath);
      }

      if (!conversionTaskManager.isCompleted(jobId, targetFolderPath))
      {
        response.setStatus(HttpServletResponse.SC_ACCEPTED);
        ConversionLogger.log(LOG, Level.FINER, HttpServletResponse.SC_ACCEPTED, logParas, " for JOBID=" + jobId, null);
        return;
      }
      else
      {
        ConversionResult result = conversionTaskManager.getConversionResult(jobId, targetFolderPath);
        if(result == null)
        {
          //read conversion result error, return and try again next time
          response.setStatus(HttpServletResponse.SC_ACCEPTED);
          ConversionLogger.log(LOG, Level.FINER, HttpServletResponse.SC_ACCEPTED, logParas, " for JOBID=" + jobId, null);
          return;
        }
        File targetFile = result.getConvertedFile();
        if (!result.isSucceed() || targetFile == null)
        {
          String msg = null;
          if (result.getWarnings().size() > 0)
          {

        	// Get error feature ID and error message
            ConversionWarning warning = result.getWarnings().get(result.getWarnings().size() - 1);
            msg = warning.getDescription();
            JSONObject warningObj = ServletUtil.map2JSONObject(warning.getParameters());

            if (ConversionConstants.ERROR_FILE_IS_TOO_LARGE.equals(warning.getFetureID()))
            {
              response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
              JSONObject objCfg = new JSONObject();
              objCfg.put("document", ServletUtil.map2JSONObject((Map)conversionService.getConfig("document")));
              objCfg.put("spreadSheet", ServletUtil.map2JSONObject((Map)conversionService.getConfig("spreadSheet")));
              objCfg.put("presentation", ServletUtil.map2JSONObject((Map)conversionService.getConfig("presentation")));
              JSONObject obj = new JSONObject();
              obj.put("message", msg);
              obj.put("config", objCfg);
              if (warningObj != null)
              {
                Object conv_err_code = warningObj.get("conv_err_code");
                if (conv_err_code != null)
                    obj.put("conv_err_code", conv_err_code);
              }
              response.setContentType("text/json");
              response.getOutputStream().print(obj.serialize());
              ConversionLogger.log(LOG, Level.WARNING, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, logParas, new LogEntry(ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_INVALID_FILE_PASSWORD.equals(warning.getFetureID()))
            {
              response.sendError(Integer.valueOf(ConversionConstants.ERROR_INVALID_FILE_PASSWORD), msg);
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_INVALID_FILE_PASSWORD), logParas,
                  new LogEntry(ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_UNSUPPORT_FILE_PASSWORD.equals(warning.getFetureID()))
            {
              response.sendError(Integer.valueOf(ConversionConstants.ERROR_UNSUPPORT_FILE_PASSWORD), msg);
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_UNSUPPORT_FILE_PASSWORD), logParas,
                  new LogEntry(ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_WORK_MANAGER_OVERTIME.equals(warning.getFetureID())
                || ConversionConstants.ERROR_SYM_JOB_OVERTIME.equals(warning.getFetureID()))
            {
              response.sendError(Integer.valueOf(ConversionConstants.ERROR_WORK_MANAGER_OVERTIME), msg);
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_WORK_MANAGER_OVERTIME), logParas,
                  new LogEntry(ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE.equals(warning.getFetureID()))
            {
              response.sendError(Integer.valueOf(ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE), msg);
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE), logParas,
                  new LogEntry(ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_SYM_CONNECTION_UNAVAILABLE.equals(warning.getFetureID()))
            {
              response.sendError(Integer.valueOf(ConversionConstants.ERROR_SYM_CONNECTION_UNAVAILABLE), msg);
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_SYM_CONNECTION_UNAVAILABLE), logParas,
                  new LogEntry(ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_NFS_IO_EXCEPTION.equals(warning.getFetureID()))
            {
              response.sendError(Integer.valueOf(ConversionConstants.ERROR_NFS_IO_EXCEPTION), msg);
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_NFS_IO_EXCEPTION), logParas, new LogEntry(
                  ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_INVALID_FILE_MIME_TYPE.equals(warning.getFetureID()))
            {
              response.addHeader("Content-Type", "application/json");
              response.setStatus(Integer.valueOf(ConversionConstants.ERROR_INVALID_FILE_MIME_TYPE));
              response.getOutputStream().print(warningObj.serialize());
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_INVALID_FILE_MIME_TYPE), logParas,
                  new LogEntry(ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.STATUS_MIME_TYPE_MODIFIED.equals(warning.getFetureID()))
            {
              response.addHeader("Content-Type", "application/json");
              response.setStatus(Integer.valueOf(ConversionConstants.STATUS_MIME_TYPE_MODIFIED));
              response.getOutputStream().print(warningObj.serialize());
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.STATUS_MIME_TYPE_MODIFIED), logParas,
                  new LogEntry(ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_IO_EXCEPTION.equals(warning.getFetureID()))
            {
              response.sendError(Integer.valueOf(ConversionConstants.ERROR_IO_EXCEPTION), msg);
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_IO_EXCEPTION), logParas, new LogEntry(
                  ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_SINGLE_PAGE_OVERTIME.equals(warning.getFetureID()))
            {
              response.sendError(Integer.valueOf(ConversionConstants.ERROR_SINGLE_PAGE_OVERTIME), msg);
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_SINGLE_PAGE_OVERTIME), logParas,
                  new LogEntry(ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_DOWNSIZE_ERROR.equals(warning.getFetureID()))
            {
              response.sendError(Integer.valueOf(ConversionConstants.ERROR_DOWNSIZE_ERROR), msg);
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_DOWNSIZE_ERROR), logParas, new LogEntry(
                  ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_EMPTY_FILE_ERROR.equals(warning.getFetureID()))
            {
              response.sendError(Integer.valueOf(ConversionConstants.ERROR_EMPTY_FILE_ERROR), msg);
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_EMPTY_FILE_ERROR), logParas, new LogEntry(
                  ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }
            else if (ConversionConstants.ERROR_CONVERSION_LIB.equals(warning.getFetureID()))
            {
              response.sendError(Integer.valueOf(ConversionConstants.ERROR_CONVERSION_LIB), msg);
              ConversionLogger.log(LOG, Level.WARNING, Integer.valueOf(ConversionConstants.ERROR_CONVERSION_LIB), logParas, new LogEntry(
                  ThreadConfig.getRequestID(), msg).toString(), null);
              return;
            }            
          }
          if (msg == null)
          {
            msg = "Conversion failed";
          }
          response.sendError(Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR, msg);
          ConversionLogger.log(LOG, Level.WARNING, Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR, logParas,
              new LogEntry(ThreadConfig.getRequestID(), msg).toString(), null);
          return;
        }
        MultipartResponse mresp = new MultipartResponse(response);
        mresp.startResponse("text/json");
        ServletUtil.writeWarnings(response, result.getWarnings());
        mresp.endResponse();

        if (targetFile != null)
        {
          if (request.getParameter(Constants.PARAMETER_RETURNPATH) != null
              && request.getParameter(Constants.PARAMETER_RETURNPATH).equalsIgnoreCase("true"))
          {
            JSONObject obj = new JSONObject();
            ConversionLogger.log(LOG, Level.INFO, LOG_ID + 2,
                "GetConversionResult: the file path before transform: " + result.getConvertedFilePath());
            String transformedTargetPath = ServletUtil.transformPath(result.getConvertedFilePath());
            ConversionLogger.log(LOG, Level.FINEST, LOG_ID + 2, "GetConversionResult: the file path after transform: "
                + transformedTargetPath);
            obj.put(Constants.PARAMETER_FILEPATH, transformedTargetPath);
            mresp.startResponse("text/json");
            response.getOutputStream().print(obj.serialize());
          }
          else
          {
            mresp.startResponse(result.getMimeType());
            FileUtil.writeFileToStream(targetFile, response.getOutputStream());
          }
          // delete file after returned to user. There is a scheduled task to do the job so commented this.
          // FileUtil.deleteFile(targetFile);
        }
        mresp.finish();
      }
    }
    catch (TaskNotFoundException e)
    {
      response.sendError(HttpServletResponse.SC_NOT_FOUND, "Can't find task with given JOBID.");
      ConversionLogger.log(LOG, Level.WARNING, HttpServletResponse.SC_NOT_FOUND, logParas, new LogEntry(ThreadConfig.getRequestID(),
          "Can't find task with given JOBID (" + jobId + ")").toString(), null);
      return;
    }
    catch (ClusterNodeDownException e)
    {
      response.sendError(Constants.HTTP_RESPONSE_CLUSTER_NODE_DOWN, "The cluster node that conversion is working on is down.");
      ConversionLogger.log(LOG, Level.WARNING, Constants.HTTP_RESPONSE_CLUSTER_NODE_DOWN, logParas,
          new LogEntry(ThreadConfig.getRequestID(), "The cluster node that conversion is working on is down.").toString(), null);
      return;
    }
    catch (ConversionException e)
    {
      response.sendError(Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR);
      ConversionLogger.log(LOG, Level.WARNING, Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR, logParas,
          new LogEntry(ThreadConfig.getRequestID(), " ConversionException " + e.getMessage()).toString(), null);
      return;
    }
    catch (Exception e)
    {
      response.sendError(Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR);
      ConversionLogger.log(LOG, Level.WARNING, Constants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR, logParas,
          new LogEntry(ThreadConfig.getRequestID(), " Exception " + e.toString()).toString(), e);
      return;
    }
    finally
    {
      long end = System.currentTimeMillis();
      if( ( end - start) > 3000)
      {
        LOG.log(Level.INFO,"GetConversionResult cost time: " + (end - start)/1000 + " seconds");
      }
    }

    LOG.exiting(getClass().getName(), "doGet");
  }
}
