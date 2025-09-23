package com.ibm.docs.sanity.task;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.GetMethod;

import com.ibm.docs.sanity.constants.ConversionConstants;
import com.ibm.docs.sanity.util.FileUtil;
import com.ibm.docs.sanity.util.FormatUtil;
import com.ibm.docs.sanity.util.PathUtil;
import com.ibm.json.java.JSONObject;

public class GetResultTask
{
  private static final Logger LOG = Logger.getLogger(GetResultTask.class.getName());

  private static final String CLASS_NAME = GetResultTask.class.getName();

  private String url;

  private HttpClient httpClient;

  private JSONObject rootConfig;

  public GetResultTask(String url, HttpClient httpClient, JSONObject rootConfig)
  {
    this.url = url;
    this.httpClient = httpClient;
    this.rootConfig = rootConfig;
  }

  public JSONObject exec(String jobID, String relativeTargetFolder) throws IOException
  {
    LOG.entering(CLASS_NAME, "exec", new Object[] { jobID, relativeTargetFolder });

    JSONObject convertResult = new JSONObject();

    List<NameValuePair> parameters = new ArrayList<NameValuePair>();
    parameters.add(new NameValuePair(ConversionConstants.JOB_ID, jobID));
    parameters.add(new NameValuePair(ConversionConstants.TARGET_PATH, relativeTargetFolder));
    parameters.add(new NameValuePair(ConversionConstants.RETURN_PATH, "true"));
    
    GetMethod getMethod = new GetMethod(url);
    NameValuePair[] paras = new NameValuePair[parameters.size()];
    paras = parameters.toArray(paras);
    getMethod.setQueryString(paras);

    String token = (String) rootConfig.get("token");
    if (token == null)
    {
      LOG.log(Level.SEVERE, "The s2s token was not found in the configuration file.");
      convertResult.put("token", "null");
      return convertResult;
    }
    String headertoken = FileUtil.encodeToken(token);
    getMethod.setRequestHeader("token", headertoken);

    try
    {      
      int statuscode = httpClient.executeMethod(getMethod);      
      convertResult.put(ConversionConstants.STATUS_CODE, statuscode);
      
      if (statuscode == 200)
      {
        LOG.log(Level.INFO, "The conversion server returns {0}/Done.", statuscode);
      }
      else if (statuscode == 415)
      {
        String responseBody = getMethod.getResponseBodyAsString();
        JSONObject responseObj = JSONObject.parse(responseBody);
        String mime = (String) responseObj.get("correctSourceMIMEType");
        String format = FormatUtil.MS_FORMATS.get(mime);
        if (format == null)
        {
          format = FormatUtil.ODF_FORMATS.get(mime);
        }
        if (format == null)
        {
          format = FormatUtil.ODF_TEMPLATE_FORMATS.get(mime);
        }
        if (format == null)
        {
          format = "unsupported " + mime;
        }
        convertResult.put("asFormat", format);
      }
      else if (statuscode == 526)
      {
        String responseBody = getMethod.getResponseBodyAsString();
        JSONObject json = JSONObject.parse(responseBody);
        String filePath = (String) json.get(ConversionConstants.FILE_PATH);
        if (filePath != null)
        {
          String sharedDataRoot = (String) ((JSONObject) rootConfig.get("shared_storage")).get("shared_to");
          filePath = new PathUtil(sharedDataRoot, filePath).resolveToAbsolutePath();
          convertResult.put(ConversionConstants.FILE_PATH, filePath);
        }
      }
      else if (statuscode == 202)
      {
        LOG.log(Level.INFO, "The conversion server returns {0}/Pending.", statuscode);
      }
      else
      {
        LOG.log(Level.SEVERE, "The conversion server returns {0}/Error.", statuscode);
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Failed with I/O exception.", e);
      LOG.exiting(CLASS_NAME, "exec", new Object[] { convertResult, e });
      throw e;
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }

    LOG.exiting(CLASS_NAME, "exec", new Object[] { convertResult });
    return convertResult;
  }

  public JSONObject exec2(String jobID, String relativeTargetFolder, String targetFolder) throws IOException
  {
    LOG.entering(CLASS_NAME, "exec2", new Object[] { jobID, relativeTargetFolder, targetFolder });

    JSONObject convertResult = null;

    StringBuffer buffer = new StringBuffer();
    buffer.append(targetFolder);
    buffer.append(File.separator);
    buffer.append(ConversionConstants.RESULT_FILE_NAME);
    if (!FileUtil.exists(new File(buffer.toString())))
    {
      convertResult = new JSONObject();
      convertResult.put(ConversionConstants.STATUS_CODE, HttpServletResponse.SC_ACCEPTED);
    }
    else
    {
      convertResult = exec(jobID, relativeTargetFolder);
    }

    LOG.exiting(CLASS_NAME, "exec2", convertResult);
    return convertResult;
  }
}
