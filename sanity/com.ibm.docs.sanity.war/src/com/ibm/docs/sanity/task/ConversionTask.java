package com.ibm.docs.sanity.task;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.PostMethod;

import com.ibm.docs.sanity.constants.ConversionConstants;
import com.ibm.docs.sanity.util.FileUtil;
import com.ibm.docs.sanity.util.FormatUtil;
import com.ibm.json.java.JSONObject;

public class ConversionTask
{
  private static final Logger LOG = Logger.getLogger(ConversionTask.class.getName());

  private static final String CLASS_NAME = ConversionTask.class.getName();

  private String conversionServiceURL;

  private HttpClient httpClient;

  private JSONObject rootConfig;

  public ConversionTask(String conversionServiceURL, HttpClient httpClient, JSONObject rootConfig)
  {
    this.conversionServiceURL = conversionServiceURL;
    this.httpClient = httpClient;
    this.rootConfig = rootConfig;
  }

  public JSONObject convertRequest(String path, String targetPath, String souceType, String tagetType, String sharedDataRoot) throws IOException
  {
    LOG.entering(CLASS_NAME, "convertRequest", new Object[] { path, targetPath, souceType, tagetType,sharedDataRoot });
    
    if (sharedDataRoot!=null)
    {
      int nLength = sharedDataRoot.length();      
      if (path.startsWith(sharedDataRoot))
      {
        path = path.substring(nLength);
        path = "${DOCS_SHARE}" + path; 
        //replaceFirst("w:", "${DOCS_SHARE}");
      }
      if (targetPath.startsWith(sharedDataRoot))
      {
        targetPath = targetPath.substring(nLength);
        targetPath = "${DOCS_SHARE}" + targetPath;
      }
    }
    List<NameValuePair> parameters = new ArrayList<NameValuePair>();
    parameters.add(new NameValuePair(ConversionConstants.SOURCE_MIME_TYPE, souceType));
    parameters.add(new NameValuePair(ConversionConstants.TARGET_MIME_TYPE, tagetType));
    parameters.add(new NameValuePair(ConversionConstants.FILE_PATH, path));
    parameters.add(new NameValuePair(ConversionConstants.TARGET_PATH, targetPath));
    
    JSONObject convertResponse = new JSONObject();
    String token = (String) rootConfig.get("token");
    if (token == null)
    {
      LOG.log(Level.SEVERE, "The s2s token was not found in the configuration file.");
      convertResponse.put("token", "null");
      return convertResponse;
    }
    String headertoken = FileUtil.encodeToken(token);
    
    PostMethod postMethod = new PostMethod(conversionServiceURL); 
    postMethod.setRequestHeader("token", headertoken);

    try
    {      
      NameValuePair[] paras = new NameValuePair[parameters.size()];
      paras = parameters.toArray(paras);
      postMethod.addParameters(paras);
      httpClient.executeMethod(postMethod);
      
      int statuscode = postMethod.getStatusCode();
      convertResponse.put(ConversionConstants.STATUS_CODE, statuscode);

      if (statuscode == 202)
      {
        InputStream is = postMethod.getResponseBodyAsStream();
        if (is != null)
        {
          JSONObject responseObj = JSONObject.parse(is);
          String jobID = (String) responseObj.get(ConversionConstants.JOB_ID);
          convertResponse.put(ConversionConstants.JOB_ID, jobID);
          convertResponse.put(ConversionConstants.TARGET_PATH, targetPath);
          LOG.log(Level.FINE, "Conversion server returns 202. Job ID: {0}", jobID);
        }
      }
      else if (statuscode == 415)
      {
        InputStream is = postMethod.getResponseBodyAsStream();
        if (is != null)
        {
          JSONObject responseObj = JSONObject.parse(is);
          String correctSourceMime = (String) responseObj.get(ConversionConstants.CORRECT_MIMETYPE);
          String format = FormatUtil.MS_FORMATS.get(correctSourceMime);
          if (format == null)
          {
            format = FormatUtil.ODF_FORMATS.get(correctSourceMime);
          }
          if (format == null)
          {
            format = FormatUtil.ODF_TEMPLATE_FORMATS.get(correctSourceMime);
          }
          if (format == null)
          {
            format = "unsupported " + correctSourceMime;
          }
          convertResponse.put("asFormat", format);
          LOG.log(Level.SEVERE, "Conversion server returns 415. Correct Mime: {0}", correctSourceMime);
        }
      }
      else
      {
        LOG.log(Level.SEVERE, "Conversion server returns {0}.", statuscode);
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Failed with I/O exception.", e);
      LOG.exiting(CLASS_NAME, "convertRequest", new Object[] { convertResponse, e });
      throw e;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
    }

    LOG.exiting(CLASS_NAME, "convertRequest", convertResponse);
    return convertResponse;
  }
}
