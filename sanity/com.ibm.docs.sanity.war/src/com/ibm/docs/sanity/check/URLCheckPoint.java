package com.ibm.docs.sanity.check;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.params.HttpClientParams;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.exception.SanityCheckException;

public abstract class URLCheckPoint extends AbstractCheckPoint
{
  private static final Logger LOG = Logger.getLogger(URLCheckPoint.class.getName());

  protected static final Properties messages;

  static
  {
    String className = URLCheckPoint.class.getSimpleName();
    messages = new Properties();

    messages.put(className + "@doCheck@1", "The check url was not found.");
    messages.put(className + "@doCheck@2", "Http Status Check Failed. Expectation: {0}, Actual: {1}.");
  }

  public URLCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  public void doCheck() throws SanityCheckException
  {
    LOG.entering(URLCheckPoint.class.getName(), "doCheck");

    SanityCheckPointItem cpItem = getCheckPointItem();

    HttpClient aHttpClient = getHttpClient();

    String checkUrl = getURL();

    if (checkUrl == null)
    {
      throw new SanityCheckException(this, cpItem, URLCheckPoint.class, "doCheck", 1);
    }

    GetMethod getMethod = new GetMethod(checkUrl);

    Header[] reqHeaders = getRequestHeaders();
    for (int i = 0; i < reqHeaders.length; i++)
    {
      getMethod.setRequestHeader(reqHeaders[i]);
    }

    LOG.log(Level.FINE, "Checking URL: {0}", checkUrl);

    try
    {
      aHttpClient.executeMethod(getMethod);
      int nHttpStatus = getMethod.getStatusCode();
      if (nHttpStatus >= 200 && nHttpStatus < 300)
      {
        cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
        doCheckMore(nHttpStatus, getMethod);
      }
      else
      {
        cpItem.setResult(CheckResult.RESULT_FAILED(this.getFormatMime()));
        cpItem.getResult().compile(cpItem.getErrorMessage(URLCheckPoint.class, "doCheck", 2, new Object[] { "2XX", nHttpStatus }));
        doCheckMore(nHttpStatus, getMethod);
      }
    }
    catch (HttpException e)
    {
      throw new SanityCheckException(this, cpItem, URLCheckPoint.class, "doCheck", e);
    }
    catch (IOException e)
    {
      throw new SanityCheckException(this, cpItem, URLCheckPoint.class, "doCheck", e);
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }

    LOG.exiting(URLCheckPoint.class.getName(), "doCheck");
  }

  protected String resolveLocalhostIP() throws UnknownHostException
  {
    LOG.entering(URLCheckPoint.class.getName(), "resolveLocalhostIP");

    String ipAddrStr;
    try
    {
      InetAddress addr = InetAddress.getLocalHost();
      byte[] ipAddr = addr.getAddress();

      ipAddrStr = "";
      for (int i = 0; i < ipAddr.length; i++)
      {
        if (i > 0)
        {
          ipAddrStr += ".";
        }
        ipAddrStr += ipAddr[i] & 0xFF;
      }
    }
    catch (UnknownHostException e)
    {
      throw e;
    }

    LOG.exiting(URLCheckPoint.class.getName(), "resolveLocalhostIP", ipAddrStr);
    return ipAddrStr;
  }

  protected Header[] getRequestHeaders()
  {
    return new Header[0];
  }
  
  protected HttpClient getHttpClient()
  {
    HttpClient httpClient = new HttpClient();
    HttpClientParams clientParams = httpClient.getParams();
    clientParams.setParameter("http.socket.timeout", 10000);
    clientParams.setParameter("http.connection.timeout", 10000);
    return httpClient;
  }

  public abstract void doCheckMore(int httpStatus, HttpMethod httpMethod) throws SanityCheckException;

  public abstract String getURL();

  public abstract SanityCheckPointItem getCheckPointItem();
}
