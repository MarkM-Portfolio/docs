/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.rcp.spellcheck.webapp.framework;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.equinox.servletbridge.FrameworkLauncher;

public class SpellCheckFrameworkLauncher extends FrameworkLauncher
{
  private static final Logger LOGGER = Logger.getLogger(SpellCheckFrameworkLauncher.class.toString());
  
  @Override
  public void init()
  {
    File servletTemp = (File)this.context.getAttribute("javax.servlet.context.tempdir");
    LOGGER.log(Level.INFO, "the temporary directory of servlet for spellcheck is " + servletTemp.getAbsolutePath());
    File platformDirectory = new File(servletTemp, "eclipse");
    if (!platformDirectory.exists()) 
    {
      platformDirectory.mkdirs();
    }
    File temp = new File(platformDirectory, "configuration");
    deleteDirectory(temp);
    LOGGER.log(Level.INFO, "removing configuration folder for spellcheck " + temp.getAbsolutePath());
    temp = new File(platformDirectory, "features");
    deleteDirectory(temp);
    LOGGER.log(Level.INFO, "removing features folder for spellcheck " + temp.getAbsolutePath());
    temp = new File(platformDirectory, "plugins");
    deleteDirectory(temp);
    LOGGER.log(Level.INFO, "removing plugins folder for spellcheck " + temp.getAbsolutePath());
    temp = new File(platformDirectory, "workspace");
    deleteDirectory(temp);
    LOGGER.log(Level.INFO, "removing workspace folder for spellcheck " + temp.getAbsolutePath());
  }
  
  @Override
  public synchronized void deploy()
  {
    super.deploy();
    LOGGER.log(Level.INFO, "deploying spellcheck framework...");
  }
}
