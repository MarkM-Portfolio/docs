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
import java.io.IOException;
import java.io.InputStream;
import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.PostMethod;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.platform.auth.S2SCallHelper;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.util.FormatUtil;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class ConversionTask
{
  private static final Logger LOG = Logger.getLogger(ConversionTask.class.getName());

  private static final String CLASS_NAME = ConversionTask.class.getName();

  private String conversionServiceURL;

  private HttpClient httpClient;

  public ConversionTask(String conversionServiceURL, String conversionResultURL, HttpClient httpClient)
  {
    this.conversionServiceURL = conversionServiceURL;
    this.httpClient = httpClient;
  }

  public JSONObject convertRequest(String path, String sourceType, String targetType, String targetPath, Map<String, Object> options)
      throws Exception
  {
    LOG.entering(CLASS_NAME, "convertRequest", new Object[] { path, sourceType, targetType, targetPath });

    List<NameValuePair> parameters = new ArrayList<NameValuePair>();
    parameters.add(new NameValuePair(ConversionConstants.SOURCE_MIME_TYPE, sourceType));
    parameters.add(new NameValuePair(ConversionConstants.TARGET_MIME_TYPE, targetType));
    String sharedRoot = ConcordConfig.getInstance().getSharedDataRoot();
    path = new Path(sharedRoot, path).resolveToRelativePath();
    path = "${" + ConcordConfig.getInstance().getSharedDataName() + "}" + path;
    parameters.add(new NameValuePair(ConversionConstants.FILE_PATH, path));
    if (targetPath != null)
    {
      targetPath = new Path(sharedRoot, targetPath).resolveToRelativePath();
      targetPath = "${" + ConcordConfig.getInstance().getSharedDataName() + "}" + targetPath;
      parameters.add(new NameValuePair(ConversionConstants.TARGET_PATH, targetPath));
    }

    if (options != null)
    {
      Iterator<Map.Entry<String, Object>> iter = options.entrySet().iterator();
      while (iter.hasNext())
      {
        Map.Entry<String, Object> entry = (Map.Entry<String, Object>) iter.next();
        Object value = entry.getValue();
        if (value instanceof String[])
        {
          value = makeValue(entry.getValue());
        }
        parameters.add(new NameValuePair(entry.getKey(), (String) value));
      }
    }
    
    JSONObject convertResponse = new JSONObject();
    PostMethod postMethod = new PostMethod(conversionServiceURL);
    postMethod.setRequestHeader(S2SCallHelper.CONFIG_S2S_NAME, S2SCallHelper.getToken());   
    try
    {      
      NameValuePair[] paras = new NameValuePair[parameters.size()];
      paras = parameters.toArray(paras);
      postMethod.addParameters(paras);
      httpClient.executeMethod(postMethod);
      
      int statusCode = postMethod.getStatusCode();
      convertResponse.put(ConversionConstants.STATUS_CODE, statusCode);
      Header responseHeaders = postMethod.getResponseHeader(HttpSettingsUtil.PROBLEM_ID);
      if (responseHeaders != null)
      {
        String responseID = responseHeaders.getValue();
        convertResponse.put(HttpSettingsUtil.RESPONSE_ID, responseID);
        LOG.info(new LogEntry(URLConfig.getRequestID(), responseID, String.format("Response back by call url : %s .", conversionServiceURL))
            .toString());
      }
      
      if (statusCode == 202)
      {        
        InputStream is = postMethod.getResponseBodyAsStream();
        if (is != null)
        {
          JSONObject responseObj = JSONObject.parse(is);
          String jobID = (String) responseObj.get(ConversionConstants.JOB_ID);
          convertResponse.put(ConversionConstants.JOB_ID, jobID);
          convertResponse.put(ConversionConstants.TARGET_PATH, targetPath);
          LOG.fine(Messages.getString("ConversionTask.0") + jobID); //$NON-NLS-1$
        }
      }
      else if (statusCode == 415)
      {
        InputStream is = postMethod.getResponseBodyAsStream();
        if (is != null)
        {
          JSONObject responseObj = JSONObject.parse(is);
          String correctSourceMime = (String) responseObj.get("correctSourceMIMEType");
          String format = FormatUtil.MS_FORMATS.get(correctSourceMime);
          if (format == null)
          {
            format = FormatUtil.ODF_FORMATS.get(correctSourceMime);
          }
          if(format == null)
          {
            format = FormatUtil.ODF_TEMPLATE_FORMATS.get(correctSourceMime);
          }
          if (format == null)
          {
            format = "unsupported " + correctSourceMime;
          }
          convertResponse.put("asFormat", format);
          LOG.fine(Messages.getString("ConversionTask.0") + correctSourceMime); //$NON-NLS-1$
        }
      }
      else
      {
        LOG.warning(Messages.getString("ConversionTask.1") + statusCode); //$NON-NLS-1$
      }
    }
    catch(SocketTimeoutException e)
    {
      LOG.log(Level.SEVERE, "Socket connection is timed out.", e);
      throw e;
    }
    catch(IOException e)
    {
      LOG.log(Level.SEVERE, "IO error happened.", e);
      throw e;
    }
    catch(Exception e)
    {
      LOG.log(Level.SEVERE, "Unknown error happened.", e);
      throw e;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
    }    
    
    LOG.exiting(CLASS_NAME, "convertRequest", new Object[] {path, sourceType, targetType, targetPath});
    return convertResponse;
  }
  
  public JSONObject repeatConvertRequest(String path, String sourceType, String targetType, String targetPath, Map<String, Object> options)
      throws Exception
  {      
    File source = new File(path);
    if(!source.equals(targetPath))
    {
      if(!new File(path).getParent().equals(targetPath))
      {
        FileUtil.cleanDirectory(new File(targetPath));  
      }
    }
    return convertRequest(path, sourceType, targetType, targetPath, options);
  }

  private String makeValue(Object value)
  {
    if (value instanceof String[])
    {
      String[] strs = (String[]) value;
      StringBuffer buffer = new StringBuffer();
      for (int i = 0; i < strs.length; i++)
      {
        buffer.append(strs[i]);
        buffer.append(";");
      }
      return buffer.toString();
    }
    return null;
  }
}
