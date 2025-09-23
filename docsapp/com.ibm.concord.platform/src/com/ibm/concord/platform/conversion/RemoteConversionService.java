/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.conversion;

import java.io.File;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;

import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.platform.util.Constant;
import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.common.security.HttpClientCreator;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class RemoteConversionService implements IConversionService
{
  private static final Logger LOG = Logger.getLogger(RemoteConversionService.class.getName());

  private static final String SERVICE_URL = "serviceurl"; //$NON-NLS-1$

  private static final String RESULT_URL = "resulturl"; //$NON-NLS-1$

  private static final String NUMBER_OF_RETRY = "numberofretry"; //$NON-NLS-1$

  private static final String INTERVAL_OF_RETRY = "intervalofretry"; //$NON-NLS-1$
  
  private static final String S2S_METHOD = "s2s_method"; //$NON-NLS-1$
  
  private static final String J2C_ALIAS = "j2c_alias"; //$NON-NLS-1$
  
  private static final String J2C_ALIAS_DEFAULT = "docsAdmin";
  
  private static final String S2S_METHOD_LIVE = "conn_live";
  
  private static final String S2S_METHOD_LOCAL = "local";

  private String conversionServiceURL;

  private String conversionResultURL;
  
  private String j2cAlias; 

  private int maximumConversionRetry;
  
  private int timeInterval;
  
  private HttpClient httpClient;
  
  private boolean isCloud;
  
  private boolean isLocal;

  public RemoteConversionService(JSONObject config)
  {
    if (config != null)
    {
      conversionServiceURL = (String) config.get(SERVICE_URL);
      conversionResultURL = (String) config.get(RESULT_URL);
      String retry = (String) config.get(NUMBER_OF_RETRY);
      String interval = (String) config.get(INTERVAL_OF_RETRY);
      String s2sMethod = (String) config.get(S2S_METHOD);
      j2cAlias = (String) config.get(J2C_ALIAS);
      if(s2sMethod != null)
      {
    	  if(s2sMethod.equalsIgnoreCase(S2S_METHOD_LIVE))
    	  {
    		  isCloud = true;  
    	  }
    	  else if(s2sMethod.equalsIgnoreCase(S2S_METHOD_LOCAL))
    	  {
    		  isLocal = true;
    	  }
    	  else
    	  {
    		  LOG.log(Level.SEVERE, "s2sMethod is incorrect: " + s2sMethod);
    	  }
      }  
      else
      {
        LOG.log(Level.INFO, "j2cAlias is : " + j2cAlias);
        if(j2cAlias == null || j2cAlias.length() == 0)
        {
          LOG.log(Level.SEVERE, "j2cAlias is missed for on-premise env!");
          j2cAlias = J2C_ALIAS_DEFAULT;
        }
      }

      maximumConversionRetry = (retry != null) ? Integer.valueOf(retry) : 30;
      timeInterval = (interval != null) ? Integer.valueOf(interval) : 1000;
      
      if(isCloud || isLocal)
      {
        HttpClientCreator httpClientCreator = new HttpClientCreator();
        httpClientCreator.config(config);
        httpClient = httpClientCreator.create();        
      }
      else
      {
        httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
        ((ServerToServerHttpClient) httpClient).set_authHeaderChecking(false);
      }
    }
  }

  public String convert(String path, String sourceType, String targetType) throws ConversionException, UnsupportedMimeTypeException
  {
    return convert(path, sourceType, targetType, getDefaultOutputPath(path), null);
  }

  public String convert(String path, String sourceType, String targetType, String targetPath) throws ConversionException,
      UnsupportedMimeTypeException
  {
    return convert(path, sourceType, targetType, targetPath, null);
  }

  public String convert(String path, String sourceType, String targetType, Map<String, Object> options) throws ConversionException,
      UnsupportedMimeTypeException
  {
    return convert(path, sourceType, targetType, getDefaultOutputPath(path), options);
  }

  public String convert(String path, String sourceType, String targetType, String targetPath, Map<String, Object> options)
      throws ConversionException, UnsupportedMimeTypeException
  {
    ConversionTask task = new ConversionTask(conversionServiceURL, conversionResultURL, httpClient);
    int maxTryiedNumber = maximumConversionRetry;

    boolean backgroundConvert = false;
    String uploadConvertTarget = null;
    JSONObject conversionResult = null;
    if (options != null)
    {
      backgroundConvert = Boolean.parseBoolean((String) options.get(Constant.KEY_BACKGROUND_CONVERT));
      // Remove following properties because these are no useful for conversion job.
      conversionResult = (JSONObject) options.remove(Constant.KEY_BACKGROUND_CONVERT_RESULT);
    }

    int statusCode = HttpStatus.SC_OK;
    String resultFilePath = null;
    boolean tryAgain = true;
    int triedNumber = 0;
    String jobID = null;
    try
    {
      if (conversionResult == null)
      {
        LOG.log(Level.INFO, "Conversion Request Start: source=" + path + "; target=" + targetPath + "; backgroundConvert="
            + backgroundConvert + "; ConvertTarget=" + uploadConvertTarget);
        options.put("detect", "true");
        conversionResult = task.convertRequest(path, sourceType, targetType, targetPath, options);
      }
      else
      {
        // If there an uploading conversion job is running or completed, then do not need to submit a editing conversion job.
        options.put(ConversionConstants.TARGET_PATH, targetPath);
        LOG.log(Level.INFO, "Uploading conversion job is running at target=" + targetPath);
      }
      statusCode = (Integer) conversionResult.get(ConversionConstants.STATUS_CODE);
      jobID = (String) conversionResult.get(ConversionConstants.JOB_ID);
      LOG.log(Level.INFO, "Conversion Request Returned: code=" + statusCode + ";source=" + path + "; target=" + targetPath);

      String relativeTargetPath = (String) conversionResult.get(ConversionConstants.TARGET_PATH);
      
      String responseID = (String) conversionResult.get(HttpSettingsUtil.RESPONSE_ID);
      LOG.info(new LogEntry(URLConfig.getRequestID(), responseID, " Conversion ConversionTask JobID " + jobID).toString());
      if (responseID != null && !"".equals(responseID))
      {
        URLConfig.setResponseID(responseID);
      }

      GetResultTask getTask = new GetResultTask(httpClient, conversionResultURL);

      do
      {
        if (statusCode == 202)
        {
          if (backgroundConvert)
          {
            // Do not need to query the conversion result for uploading conversion jobs.
            return targetPath;
          }

          try
          {
            Thread.sleep(timeInterval);
          }
          catch (InterruptedException e)
          {
            LOG.log(Level.WARNING, "Thread is interrupted abnormaly.", e);
          }
          conversionResult = getTask.exec2(jobID, relativeTargetPath, targetPath);

          statusCode = (Integer) conversionResult.get(ConversionConstants.STATUS_CODE);
          
          if (statusCode == 526)
          {
            resultFilePath = (String) conversionResult.get(ConversionConstants.FILE_PATH);
            return resultFilePath;
          }
          else if (statusCode == 202)
          {
            triedNumber++;
            continue;
          }
          else
          {
            break;
          }
        }
        else if (tryAgain && (statusCode == 404 || statusCode == 500 || statusCode == 503 || statusCode == 504 || statusCode == 494))
        {
          LOG.info("Conversion Result Request: code=" + statusCode + ";source=" + path + "; target=" + targetPath);
          // Reset the number of trying to convert.
          triedNumber = 0;
          tryAgain = false;
          conversionResult = task.repeatConvertRequest(path, sourceType, targetType, targetPath, options);
          jobID = (String) conversionResult.get(ConversionConstants.JOB_ID);
          relativeTargetPath = (String) conversionResult.get(ConversionConstants.TARGET_PATH);
        }
        else if (tryAgain && (statusCode == 493))
        {
          LOG.info("Conversion Result Request: code=" + statusCode + ";source=" + path + "; target=" + targetPath);
          // Reset the number of trying to convert.
          triedNumber = 0;
          tryAgain = false;
          conversionResult = task.repeatConvertRequest(path, sourceType, targetType, targetPath, options);
          jobID = (String) conversionResult.get(ConversionConstants.JOB_ID);
          relativeTargetPath = (String) conversionResult.get(ConversionConstants.TARGET_PATH);
          LOG.log(Level.INFO, "Retry to connect to conversion server " + " ;source=" + path + "; target=" + targetPath);
        }
        else
        {
          break;
        }
        statusCode = (Integer) conversionResult.get(ConversionConstants.STATUS_CODE);
        triedNumber++;
      }
      while (triedNumber < maxTryiedNumber);

      resultFilePath = processConversionResult(httpClient, statusCode, triedNumber, maxTryiedNumber, conversionResult, jobID);
    }
    catch (ConversionException e)
    {
      if (statusCode == 202)
      {
        statusCode = 521;
      }
      LOG.log(Level.WARNING, "Conversion Result Failed: code=" + statusCode + ";source=" + path + "; target=" + targetPath);
      e.setNativeErrorCode(statusCode);
      e.getData().put("source", path);
      e.getData().put("target", targetPath);
      throw e;
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, "Conversion request could not be processed successfully", e); //$NON-NLS-1$
      ConversionException ce = new ConversionException("Conversion request could not be processed successfully.", e); //$NON-NLS-1$
      ce.setNativeErrorCode(statusCode);
      ce.getData().put("source", path);
      ce.getData().put("target", targetPath);
      ce.getData().put("jobid", jobID);
      throw ce;
    }
    return resultFilePath;
  }

  /**
   * Process the result of converting document on conversion server.
   * 
   * @param statusCode
   *          presents the returned HTTP status code
   * @param triedNumber
   *          presents the number of trying to converting
   * @param conversionResult
   *          presents the result of conversion
   * @return the convert result file path
   * @throws ConversionException
   */
  private String processConversionResult(HttpClient httpClient, int statusCode, int triedNumber, int maxTryiedNumber,
      JSONObject conversionResult, String jobID) throws Exception
  {
    if (statusCode == HttpStatus.SC_OK && conversionResult != null)
    {
      return (String) conversionResult.get(ConversionConstants.FILE_PATH);
    }
    else if (statusCode == HttpStatus.SC_ACCEPTED && triedNumber >= maxTryiedNumber)
    {
      // cancel this conversion job
      CancelTask cancel = new CancelTask(httpClient, jobID, conversionResultURL);
      cancel.exec();
      // Conversion timeout.
      ConversionException ce = new ConversionException(ConversionException.EC_CONV_CONVERT_TIMEOUT);
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("It takes too long time to convert the document from conversion server"); //$NON-NLS-1$
      throw ce;
    }
    else if (statusCode == HttpStatus.SC_NOT_ACCEPTABLE)
    {
      ConversionException ce = new ConversionException(ConversionErrorCodeUtil.mapErrorCode(statusCode));
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("Unsupported document type"); //$NON-NLS-1$
      throw ce;
    }
    else if (statusCode == HttpStatus.SC_LENGTH_REQUIRED)
    {
      ConversionException ce = new ConversionException(ConversionErrorCodeUtil.mapErrorCode(statusCode));
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("Length Required"); //$NON-NLS-1$
      throw ce;
    }
    else if (statusCode == HttpStatus.SC_REQUEST_TOO_LONG)
    {
      ConversionException ce = new ConversionException(ConversionErrorCodeUtil.mapErrorCode(statusCode));
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("File is too large to process"); //$NON-NLS-1$

      JSONObject limits = processConvertLimits(conversionResult);
      if (limits != null && !limits.isEmpty())
      {
        ce.getData().put("limits", limits);
      }
      Object conv_err_code = conversionResult.get("conv_err_code");
      if (conv_err_code != null)
      {
        ce.getData().put("conv_err_code", conv_err_code);
      }
      throw ce;
    }
    else if (statusCode == HttpStatus.SC_UNSUPPORTED_MEDIA_TYPE)
    {
      String format = (String) conversionResult.get("asFormat");
      ConversionException ce = new ConversionException(ConversionErrorCodeUtil.mapErrorCode(statusCode));
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("Invalid document type: asFormat=" + format); //$NON-NLS-1$
      ce.getData().put("correctFormat", format);
      throw ce;
    }
    else if (statusCode == HttpStatus.SC_NOT_IMPLEMENTED)
    {
      ConversionException ce = new ConversionException(ConversionErrorCodeUtil.mapErrorCode(statusCode));
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("Unable to make the call to conversion server"); //$NON-NLS-1$
      throw ce;
    }
    else if (statusCode == ConversionErrorCodeUtil.SC_SERVER_BUSY)
    {
      ConversionException ce = new ConversionException(ConversionErrorCodeUtil.mapErrorCode(statusCode));
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("Conversion server is busy"); //$NON-NLS-1$
      throw ce;
    }
    else if (statusCode == ConversionErrorCodeUtil.SC_INVALID_FORMAT)
    {
      ConversionException ce = new ConversionException(ConversionErrorCodeUtil.mapErrorCode(statusCode));
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("Invalid document format"); //$NON-NLS-1$
      throw ce;
    }
    else if (statusCode == ConversionErrorCodeUtil.SC_INVALID_PASSWORD)
    {
      ConversionException ce = new ConversionException(ConversionErrorCodeUtil.mapErrorCode(statusCode));
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("Invalid password"); //$NON-NLS-1$
      throw ce;
    }
    else if (statusCode == 528)
    {
      ConversionException ce = new ConversionException(ConversionException.EC_CONV_EMPTY_FILE_ERROR);
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("The file is empty"); //$NON-NLS-1$
      throw ce;
    }
    else if (statusCode == 521)
    {
      ConversionException ce = new ConversionException(ConversionException.EC_CONV_CONVERT_TIMEOUT);
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("It takes too long time to convert the document from conversion server"); //$NON-NLS-1$
      throw ce;
    }
    else
    {
      ConversionException ce = new ConversionException(ConversionErrorCodeUtil.mapErrorCode(statusCode));
      ce.getData().put("jobid", jobID);
      ce.setDefaultErrDetail("Server returned unexpected status"); //$NON-NLS-1$
      throw ce;
    }
  }

  private String getDefaultOutputPath(String path)
  {
    File f = new File(path);
    if (!f.isDirectory())
    {
      File p;
      if (f != null && ((p = f.getParentFile()) != null))
        return p.getAbsolutePath();
      return null;
    }
    else
      return path;
  }

  /**
   * Get the limitations of conversion server on documents.
   * 
   * @param result
   * @return
   */
  private JSONObject processConvertLimits(JSONObject result)
  {
    JSONObject limits = new JSONObject();
    if (result != null && result.get("config") instanceof JSONObject)
    {
      JSONObject config = (JSONObject) result.get("config");
      if (config.get("document") instanceof JSONObject)
      {
        limits.put("text", config.get("document"));
      }
      if (config.get("spreadSheet") instanceof JSONObject)
      {
        limits.put("sheet", config.get("spreadSheet"));
      }
      if (config.get("presentation") instanceof JSONObject)
      {
        limits.put("pres", config.get("presentation"));
      }
    }
    return limits;
  }

}
