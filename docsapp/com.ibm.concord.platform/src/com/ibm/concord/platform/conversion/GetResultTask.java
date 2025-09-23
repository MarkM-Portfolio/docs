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
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.james.mime4j.MimeException;
import org.apache.james.mime4j.parser.MimeTokenStream;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.platform.auth.S2SCallHelper;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.util.ErrMsgGenerator;
import com.ibm.docs.common.util.FormatUtil;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class GetResultTask
{
  private static final Logger LOG = Logger.getLogger(GetResultTask.class.getName());

  private String url;

  private HttpClient httpClient;

  public GetResultTask(HttpClient httpClient, String url)
  {
    this.httpClient = httpClient;
    this.url = url;
  }

  public JSONObject exec(String jobID, String relativeTargetFolder) throws Exception
  {
    JSONObject convertResult = new JSONObject();

    List<NameValuePair> parameters = new ArrayList<NameValuePair>();
    parameters.add(new NameValuePair(ConversionConstants.JOB_ID, jobID));
    parameters.add(new NameValuePair(ConversionConstants.TARGET_PATH, relativeTargetFolder));
    parameters.add(new NameValuePair(ConversionConstants.RETURN_PATH, "true")); //$NON-NLS-1$
    
    GetMethod getMethod = new GetMethod(url);
    NameValuePair[] paras = new NameValuePair[parameters.size()];
    paras = parameters.toArray(paras);
    getMethod.setQueryString(paras);
    
    try
    {
      getMethod.setRequestHeader(S2SCallHelper.CONFIG_S2S_NAME, S2SCallHelper.getToken());
      int statusCode = httpClient.executeMethod(getMethod);      
      convertResult.put(ConversionConstants.STATUS_CODE, statusCode);
      
      Header responseHeaders = getMethod.getResponseHeader(HttpSettingsUtil.PROBLEM_ID);
      if (responseHeaders != null && !"".equals(responseHeaders.getValue()))
      {
        String responseID = responseHeaders.getValue();
        LOG.fine(new LogEntry(URLConfig.getRequestID(), responseID, String.format("Response back by call url : %s .", url)).toString());
      }
      
      if (statusCode == 200)
      {        
        String resultPath = getResult(getMethod);
        convertResult.put(ConversionConstants.FILE_PATH, resultPath);
        LOG.info(Messages.getString("ConversionTask.2") + resultPath); //$NON-NLS-1$
      }
      else if (statusCode == 413)
      {
        try
        {
          String config = getResult(getMethod);
          if (config != null)
          {
            JSONObject obj = JSONObject.parse(config);
            if (obj.containsKey("config"))
              convertResult.put("config", obj.get("config"));
            if (obj.containsKey("conv_err_code"))
              convertResult.put("conv_err_code", obj.get("conv_err_code"));
          }
        }
        catch (Throwable ex)
        {
          LOG.log(Level.WARNING, "Exception happens while getting the conversion result", ex);
        }
      }
      else if (statusCode == 415)
      {
        String responseBody = getMethod.getResponseBodyAsString();
        JSONObject responseObj = JSONObject.parse(responseBody);
        String mime = (String) responseObj.get("correctSourceMIMEType");
        String format = FormatUtil.MS_FORMATS.get(mime);
        if (format == null)
        {
          format = FormatUtil.ODF_FORMATS.get(mime);
        }
        if(format == null)
        {
          format = FormatUtil.ODF_TEMPLATE_FORMATS.get(mime);
        }
        if (format == null)
        {
          format = "unsupported " + mime;
        }
        convertResult.put("asFormat", format);
      }
      else if (statusCode == 526)
      {
        String responseBody = getMethod.getResponseBodyAsString();
        JSONObject json = JSONObject.parse(responseBody);
        String filePath = (String) json.get(ConversionConstants.FILE_PATH);
        if (filePath != null)
        {
          String sharedRoot = ConcordConfig.getInstance().getSharedDataRoot();
          filePath = new Path(sharedRoot, filePath).resolveToAbsolutePath();
          convertResult.put(ConversionConstants.FILE_PATH, filePath);          
        }
      }
      else
      {
        LOG.fine(Messages.getString("ConversionTask.4") + statusCode + Messages.getString("ConversionTask.5")); //$NON-NLS-1$ //$NON-NLS-2$
      }
    }
    catch (MimeException e)
    {
      LOG.log(Level.WARNING, Messages.getString("ConversionTask.3"), e); //$NON-NLS-1$
      throw e;
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
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }
    return convertResult;
  }
  
  /**
   * Check whether the result file exists or not, if the file exists, then send a request to 
   * conversion server to query the conversion result, otherwise continue to check the file.
   * 
   * @param jobID specifies the conversion job id
   * @param relativeTargetFolder specifies the relative target folder
   * @param targetFolder specifies the target folder
   * 
   * @return conversion result
   * 
   * @throws Exception
   */
  public JSONObject exec2(String jobID, String relativeTargetFolder, String targetFolder) throws Exception
  {
    JSONObject convertResult = null;
    
    StringBuffer buffer = new StringBuffer();
    buffer.append(targetFolder);
    buffer.append(File.separator);
    buffer.append(ConversionConstants.RESULT_FILE_NAME);
    
    if (!FileUtil.exists(new File(buffer.toString())))
    {
      // Still in converting status if the result.json file does not exist.
      convertResult = new JSONObject();
      convertResult.put(ConversionConstants.STATUS_CODE, HttpServletResponse.SC_ACCEPTED);
    }
    else
    {
      convertResult = exec(jobID, relativeTargetFolder);
    }
    
    return convertResult;
  }
  
  private String getResult(GetMethod getMethod) throws IOException, MimeException
  {
    MimeTokenStream stream = new MimeTokenStream();
    String contentType = getMethod.getResponseHeader("Content-Type").getValue();
    InputStream is = getMethod.getResponseBodyAsStream();
    String result = null;
    try
    {
      stream.parseHeadless(is, contentType);
      for (int state = stream.getState(); state != MimeTokenStream.T_END_OF_STREAM; state = stream.next())
      {
        switch (state)
          {
            case MimeTokenStream.T_BODY :
              InputStream inStream = stream.getInputStream();
              try
              {
                JSONObject obj = JSONObject.parse(inStream);
                if (obj.containsKey(ConversionConstants.FILE_PATH))
                {
                  result = (String) obj.get(ConversionConstants.FILE_PATH);
                  String sharedRoot = ConcordConfig.getInstance().getSharedDataRoot();
                  result = new Path(sharedRoot, result).resolveToAbsolutePath();
                }
                else if (obj.containsKey(ConversionConstants.CORRECT_MIMETYPE))
                {
                  result = (String) obj.get(ConversionConstants.CORRECT_MIMETYPE);
                }
                else if (obj.get("config") instanceof JSONObject)
                {
                  JSONObject config = (JSONObject) obj.get("config");
                  if (!config.isEmpty())
                  {
                    return obj.serialize();
                  }
                }
              }
              catch (IOException e)
              {
                LOG.log(Level.WARNING, Messages.getString("ConversionTask.6"), e); //$NON-NLS-1$
              }
              finally
              {
                inStream.close();
              }
              break;
            case MimeTokenStream.T_FIELD :
              break;
            case MimeTokenStream.T_END_BODYPART :
              break;
          }
      }  
    }
    finally
    {
    }
    return result;
  }
}
