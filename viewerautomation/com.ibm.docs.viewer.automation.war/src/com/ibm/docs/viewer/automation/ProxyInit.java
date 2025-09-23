package com.ibm.docs.viewer.automation;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

public class ProxyInit implements ServletContextListener, HttpSessionListener
{

  private static final Logger logger = Logger.getLogger(ProxyInit.class.getName());

  @Override
  public void sessionCreated(HttpSessionEvent arg0)
  {

  }

  @Override
  public void sessionDestroyed(HttpSessionEvent arg0)
  {

  }

  @Override
  public void contextDestroyed(ServletContextEvent arg0)
  {

  }

  @Override
  public void contextInitialized(ServletContextEvent arg0)
  {
    ViewerConfig2 config = ViewerConfig2.getInstance();
    if (config == null)
    {
      logger.log(Level.WARNING, "Failed to ready Viewer configuration");
    }

    ProxyConfig pConfig = ProxyConfig.getConfig();
    if (pConfig == null)
    {
      logger.log(Level.WARNING, "Failed to ready Proxy configuration");
    }
  }

}
