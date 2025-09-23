/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversion;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.GetMethod;

import com.ibm.concord.viewer.platform.auth.S2SCallHelper;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class CancelTask
{
  private static final Logger LOG = Logger.getLogger(CancelTask.class.getName());

  private static final String JOB_ID = "JOBID";

  public static final String ACTION = "action";

  private String jobID;

  private String url;

  private HttpClient httpClient;

  public CancelTask(HttpClient httpClient, String jobID, String url)
  {
    this.httpClient = httpClient;
    this.jobID = jobID;
    this.url = url;
  }

  public JSONObject exec() throws Exception
  {
    List<NameValuePair> parameters = new ArrayList<NameValuePair>();
    parameters.add(new NameValuePair(JOB_ID, jobID));
    parameters.add(new NameValuePair(ACTION, "cancel")); //$NON-NLS-1$

    GetMethod getMethod = new GetMethod(url);
    NameValuePair[] paras = new NameValuePair[parameters.size()];
    paras = parameters.toArray(paras);
    getMethod.setQueryString(paras);

    try
    {
      getMethod.setRequestHeader(S2SCallHelper.CONFIG_S2S_NAME, S2SCallHelper.getEncodedToken());
      int nHttpStatus = httpClient.executeMethod(getMethod);
      
      Header responseHeaders = getMethod.getResponseHeader(HttpSettingsUtil.PROBLEM_ID);
      if (responseHeaders != null && !"".equals(responseHeaders.getValue()))
      {
        String responseID = responseHeaders.getValue();
        LOG.fine(new LogEntry(URLConfig.getRequestID(), responseID, String.format("Response back by call url : %s .", url)).toString());
      }
      
      if (HttpStatus.SC_OK == nHttpStatus || HttpStatus.SC_ACCEPTED == nHttpStatus)
      {
        LOG.log(Level.INFO, "http call status: ", nHttpStatus);
      }
      else
      {
        LOG.log(Level.WARNING, "http call status: ", nHttpStatus);
      }
    }
    catch (SocketTimeoutException e)
    {
      LOG.log(Level.SEVERE, "Socket connection is timed out.", e);
      throw e;
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "IO error happened.", e);
      throw e;
    }
    catch (Exception e)
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
    return null;
  }
}
