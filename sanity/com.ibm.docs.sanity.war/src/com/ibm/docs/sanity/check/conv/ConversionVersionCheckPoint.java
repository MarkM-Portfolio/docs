package com.ibm.docs.sanity.check.conv;

import java.io.IOException;
import java.util.logging.Logger;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpMethod;

import com.ibm.docs.sanity.DeploymentEnvType;
import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.URLCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.util.ServerTypeUtil;

public class ConversionVersionCheckPoint extends URLCheckPoint
{
  private static final Logger LOG = Logger.getLogger(ConversionVersionCheckPoint.class.getName()); 
  
  private static final String hostURl = "http://127.0.0.1";
  
  private String DEFAULT_WC_DEFAULTHOST_PORT = "9080";
  
  private static final String versionService = "/conversion/version";

  static
  {
    String className = ConversionVersionCheckPoint.class.getSimpleName();
    
    messages.put(className + "@doCheckMore@1", "Http Status: {0}, Response Body: \"{1}\"");

  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(ConversionVersionCheckPoint.class.getSimpleName(),
      "This checkpoint is sanity check for the Docs version.", messages);

  private String resUrl;
  
  public ConversionVersionCheckPoint(String formatMime,int nPort)
  {
    super(formatMime);
    DEFAULT_WC_DEFAULTHOST_PORT = Integer.toString(nPort);
  }

  public void setUp() throws SanityCheckException
  {
    super.setUp();
    LOG.entering(ConversionVersionCheckPoint.class.getName(), "setUp");    
    resUrl = hostURl + ":" + DEFAULT_WC_DEFAULTHOST_PORT + versionService;
    LOG.exiting(ConversionVersionCheckPoint.class.getName(), "setUp");
    return;
  }
  
  public void doCheckMore(int httpStatus, HttpMethod httpMethod) throws SanityCheckException
  {
    LOG.entering(ConversionVersionCheckPoint.class.getName(), "doCheckMore", new Object[] { httpStatus });
  
    if (httpStatus == 404)
    {
      try
      {
        String respStr = httpMethod.getResponseBodyAsString();
        if (respStr.contains("t find task with given JOBID"))
        {
          cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
        }
        else
        {
          throw new SanityCheckException(this, cpItem, ConversionVersionCheckPoint.class, "doCheckMore", 1, new Object[] { httpStatus, respStr });
        }
      }
      catch (IOException e)
      {
        throw new SanityCheckException(this, getCheckPointItem(), URLCheckPoint.class, "doCheckMore", e);
      }
    }
  
    LOG.exiting(ConversionVersionCheckPoint.class.getName(), "doCheckMore");
  }

  public void tearDown() throws SanityCheckException
  {
    super.tearDown();
    LOG.entering(ConversionVersionCheckPoint.class.getName(), "tearDown");
    LOG.exiting(ConversionVersionCheckPoint.class.getName(), "tearDown");
    return;
  }

  public SanityCheckPointItem report()
  {
    LOG.entering(ConversionVersionCheckPoint.class.getName(), "report");

    cpItem.setDescription(getURL() == null ? cpItem.getDescription() : getURL());
    prepare(cpItem);

    LOG.exiting(ConversionVersionCheckPoint.class.getName(), "report", cpItem.getResult().isSanity());
    return cpItem;
  }

  public String getURL()
  {
    if (resUrl == null)
    {
      return null;
    }
    else
    {
      return resUrl;
    }
  }

  public SanityCheckPointItem getCheckPointItem()
  {
    return cpItem;
  }

  protected Header[] getRequestHeaders()
  {
    //Header header = new Header();
   // header.setName("token");
   // header.setValue(code);
    //return new Header[] { header };
    return new Header[] { };
  }
}
