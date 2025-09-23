package com.ibm.docs.sanity.check.docs;

import java.util.Properties;
import java.util.logging.Logger;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.check.AbstractCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;

public class ReverseProxyCheckPoint extends AbstractCheckPoint
{
  private static final Logger LOG = Logger.getLogger(ReverseProxyCheckPoint.class.getName());

  private static final Properties messages;

  static
  {
    String className = ReverseProxyCheckPoint.class.getSimpleName();
    messages = new Properties();

    messages.put(className + "@setUp@1", "");
    messages.put(className + "@setUp@2", "");
    messages.put(className + "@setUp@3", "");

    messages.put(className + "@doCheck@1", "");
    messages.put(className + "@doCheck@2", "");
    messages.put(className + "@doCheck@3", "");

    messages.put(className + "@tearDown@1", "");
    messages.put(className + "@tearDown@2", "");
    messages.put(className + "@tearDown@3", "");
  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(ReverseProxyCheckPoint.class.getSimpleName(),
      "This checkpoint is sanity check for reverse proxy.", messages);

  public ReverseProxyCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  public void setUp() throws SanityCheckException
  {
    super.setUp();
    LOG.entering(ReverseProxyCheckPoint.class.getName(), "setUp");
    LOG.exiting(ReverseProxyCheckPoint.class.getName(), "setUp");
    return;
  }

  public void doCheck() throws SanityCheckException
  {
    LOG.entering(ReverseProxyCheckPoint.class.getName(), "doCheck");
    LOG.exiting(ReverseProxyCheckPoint.class.getName(), "doCheck");
  }

  public void tearDown() throws SanityCheckException
  {
    super.tearDown();
    LOG.entering(ReverseProxyCheckPoint.class.getName(), "tearDown");
    LOG.exiting(ReverseProxyCheckPoint.class.getName(), "tearDown");
    return;
  }

  public SanityCheckPointItem report()
  {
    LOG.entering(ReverseProxyCheckPoint.class.getName(), "report");

    prepare(cpItem);

    LOG.exiting(ReverseProxyCheckPoint.class.getName(), "report", cpItem.getResult().isSanity());
    return cpItem;
  }
}
