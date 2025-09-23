/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.spellcheck.servlets;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.rcp.json.spellchecker.Configuration;
import com.ibm.rcp.json.spellchecker.SpellCheck;

public class ConfigurationServlet extends HttpServlet
{
  private static final Logger LOGGER = Logger.getLogger(ConfigurationServlet.class.toString());
  
  private static final long serialVersionUID = 1L;

  private static String webAppVersion;

  public static final String VERSION = "VERSION";

  public ConfigurationServlet()
  {
  }

  public void destroy()
  {
    super.destroy();
    SpellCheck.setConfiguration(null);
  }

  public void init(ServletConfig config) throws ServletException
  {
    super.init(config);
    LOGGER.log(Level.INFO, "Initializing spellcheck...");
    Configuration localConfiguration = new Configuration();
    String str = config.getInitParameter(Configuration.KEY_POOLSIZE);
    LOGGER.log(Level.INFO, "Pool size of SpellCheck is " + str);
    localConfiguration.setPoolSize(Integer.valueOf(str).intValue());
    str = config.getInitParameter(Configuration.KEY_USESPELLCHECKPOOL);
    LOGGER.log(Level.INFO, "The value of USESPELLCHECKPOOL is " + str);
    localConfiguration.setUseSpellcheckPool(Boolean.valueOf(str).booleanValue());
    SpellCheck.setConfiguration(localConfiguration);
    webAppVersion = config.getInitParameter("VERSION");
    LOGGER.log(Level.INFO, "The version is " + webAppVersion);
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
  }

  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
  }

  public static String getWebAppVersion()
  {
    return webAppVersion;
  }

}
