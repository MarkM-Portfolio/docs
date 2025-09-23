package com.ibm.docs.sanity.check.docs;

import java.net.UnknownHostException;
import java.text.MessageFormat;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpMethod;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.check.URLCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;

public class BSSProvisionCheckPoint extends URLCheckPoint
{
  private static final Logger LOG = Logger.getLogger(BSSProvisionCheckPoint.class.getName());

  private static final String ENDPOINT_URL = "{0}://{1}:{2}/docs/provisioning/endpoint";

  static
  {
    String className = BSSProvisionCheckPoint.class.getSimpleName();

    messages.put(className + "@setUp@1", "The IP address of localhost was not found.");
  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(BSSProvisionCheckPoint.class.getSimpleName(),
      "This checkpoint is sanity check for the BSS provisioning end point.", messages);

  private String ipAddrStr;

  public BSSProvisionCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  public void setUp() throws SanityCheckException
  {
    super.setUp();
    LOG.entering(BSSProvisionCheckPoint.class.getName(), "setUp");

    try
    {
      ipAddrStr = resolveLocalhostIP();
    }
    catch (UnknownHostException e)
    {
      throw new SanityCheckException(this, cpItem, BSSProvisionCheckPoint.class, "setUp", e);
    }

    if (ipAddrStr == null || ipAddrStr.length() == 0)
    {
      throw new SanityCheckException(this, cpItem, BSSProvisionCheckPoint.class, "setUp", 1);
    }

    LOG.exiting(BSSProvisionCheckPoint.class.getName(), "setUp");
    return;
  }

  public void doCheckMore(int httpStatus, HttpMethod httpMethod) throws SanityCheckException
  {
    LOG.entering(BSSProvisionCheckPoint.class.getName(), "doCheckMore", new Object[] { httpStatus });
    LOG.exiting(BSSProvisionCheckPoint.class.getName(), "doCheckMore");
  }

  public void tearDown() throws SanityCheckException
  {
    super.tearDown();
    LOG.entering(BSSProvisionCheckPoint.class.getName(), "tearDown");
    LOG.exiting(BSSProvisionCheckPoint.class.getName(), "tearDown");
    return;
  }

  public SanityCheckPointItem report()
  {
    LOG.entering(BSSProvisionCheckPoint.class.getName(), "report");

    cpItem.setDescription(getURL() == null ? cpItem.getDescription() : getURL());
    prepare(cpItem);

    LOG.exiting(BSSProvisionCheckPoint.class.getName(), "report", cpItem.getResult().isSanity());
    return cpItem;
  }

  public String getURL()
  {
    if (ipAddrStr == null)
    {
      return null;
    }
    else
    {
      return MessageFormat.format(ENDPOINT_URL, new Object[] { "http", ipAddrStr, "9080" });
    }
  }

  public SanityCheckPointItem getCheckPointItem()
  {
    return cpItem;
  }
}
