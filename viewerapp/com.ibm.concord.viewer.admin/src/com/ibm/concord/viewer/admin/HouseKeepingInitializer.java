/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.admin;

import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import com.ibm.concord.viewer.admin.mbean.HouseKeeping;
import com.ibm.concord.viewer.admin.mbean.Image2HtmlConversion;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.websphere.management.AdminServiceFactory;

import commonj.timers.Timer;
import commonj.timers.TimerListener;
import commonj.timers.TimerManager;

import javax.management.InstanceAlreadyExistsException;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanRegistrationException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.NotCompliantMBeanException;
import javax.management.ObjectInstance;
import javax.management.ObjectName;

public class HouseKeepingInitializer implements ServletContextListener
{
  private static final Logger LOG = Logger.getLogger(HouseKeepingInitializer.class.getName());

  private static final String TIMERMANAGER = "java:comp/env/com/ibm/concord/viewer/timermanager";

  private TimerManager timerManager;

  private static HouseKeepingInitializer houseKeepingInitializer;

  private static ObjectInstance hkOI = null;

  private static ObjectInstance img2htmlOI = null;

  public static HouseKeepingInitializer getHouseKeepingInitializer()
  {
    if (houseKeepingInitializer == null)
      houseKeepingInitializer = new HouseKeepingInitializer();
    return houseKeepingInitializer;
  }

  public void setTimerManager(TimerManager timerManager)
  {
    this.timerManager = timerManager;
  }

  public TimerManager getTimerManager()
  {
    return timerManager;
  }

  @Override
  public void contextDestroyed(ServletContextEvent arg0)
  {
    uninitMBean4HK();
    uninitMBean4Img2HTML();
    
  }

  @Override
  public void contextInitialized(ServletContextEvent arg0)
  {
    initMBean4HK();
    initTimerManager();

    intiMBean4IMG2HTML();
  }

  public void initTimerManager()
  {
    try
    {
      InitialContext context = new InitialContext();

      TimerManager tm = (TimerManager) context.lookup(TIMERMANAGER);

      getHouseKeepingInitializer().setTimerManager(tm);

      HouseKeepingBean.getHouseKeepingBean().initListeners();
    }
    catch (NamingException e)
    {
      LOG.log(Level.WARNING, "Failed to initialize the TimerManager." + e.getMessage());
    }
    LOG.log(Level.FINE, "Initialize the TimerManager successfully.");
  }

  private void initMBean4HK()
  {
    MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
    try
    {
      ObjectName anON = new ObjectName("com.ibm.concord.viewer.admin.mbean:type=HouseKeeping");
      if (!mbServer.isRegistered(anON))
      {
        hkOI = mbServer.registerMBean(new HouseKeeping(), anON);
        LOG.log(Level.INFO, "MBean:HouseKeeping is created.");
      }
    }
    catch (InstanceAlreadyExistsException e)
    {
      LOG.log(Level.WARNING, "Register MBean for House Keeping Failed.", e);
    }
    catch (MBeanRegistrationException e)
    {
      LOG.log(Level.WARNING, "Register MBean for House Keeping Failed.", e);
    }
    catch (NotCompliantMBeanException e)
    {
      LOG.log(Level.WARNING, "Register MBean for House Keeping Failed.", e);
    }
    catch (MalformedObjectNameException e)
    {
      LOG.log(Level.WARNING, "Register MBean for House Keeping Failed.", e);
    }
    catch (NullPointerException e)
    {
      LOG.log(Level.WARNING, "Register MBean for House Keeping Failed.", e);
    }
  }

  private void intiMBean4IMG2HTML()
  {
    MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
    try
    {
      ObjectName anON = new ObjectName("com.ibm.concord.viewer.admin.mbean:type=Img2HTML");
      if (!mbServer.isRegistered(anON))
      {
        img2htmlOI = mbServer.registerMBean(new Image2HtmlConversion(), anON);
        LOG.log(Level.INFO, "MBean:Img2HTML is registered.");
      }
    }
    catch (InstanceAlreadyExistsException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Img2HTML background conversion Failed.", e);
    }
    catch (MBeanRegistrationException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Img2HTML background conversion Failed.", e);
    }
    catch (NotCompliantMBeanException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Img2HTML background conversion Failed.", e);
    }
    catch (MalformedObjectNameException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Img2HTML background conversion Failed.", e);
    }
    catch (NullPointerException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Img2HTML background conversion Failed.", e);
    }
  }

  private void uninitMBean4HK()
  {
    if (hkOI != null)
    {
      MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
      try
      {
        mbServer.unregisterMBean(hkOI.getObjectName());
        LOG.log(Level.INFO, "HouseKeeping MBean is destoryed.");
      }
      catch (MBeanRegistrationException e)
      {
        LOG.log(Level.WARNING, "Un-Register MBean for House Keeping Failed.", e);
      }
      catch (InstanceNotFoundException e)
      {
        LOG.log(Level.WARNING, "Un-Register MBean for House Keeping Failed.", e);
      }
    }
  }

  private void uninitMBean4Img2HTML()
  {
    if (img2htmlOI != null)
    {
      MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
      try
      {
        mbServer.unregisterMBean(img2htmlOI.getObjectName());
        LOG.log(Level.INFO, "Img2HTML MBean is destoryed.");
      }
      catch (MBeanRegistrationException e)
      {
        LOG.log(Level.WARNING, "Un-Register MBean for Img2HTML background conversion failed.", e);
      }
      catch (InstanceNotFoundException e)
      {
        LOG.log(Level.WARNING, "Un-Register MBean for Img2HTML background conversion failed.", e);
      }
    }
  }
}

class CacheTimerListener implements TimerListener
{
  private static final Logger LOG = Logger.getLogger(CacheTimerListener.class.getName());

  /**
   * Determines whether the immediate execution
   */
  protected boolean isExecution = false;

  public CacheTimerListener(Boolean isExecution)
  {
    this.isExecution = isExecution;
  }

  public void setExecution(Boolean isExecution)
  {
    this.isExecution = isExecution;
  }

  public void timerExpired(Timer arg0)
  {
    if (isExecution)
    {

      Random random = new Random(10000);
      LOG.log(Level.FINE, "Task-" + random + ":Cache clean is starting.");

      HouseKeepingBean.getHouseKeepingBean().initConfig();// read the newest config
      HouseKeepingBean.getHouseKeepingBean().processCacheAndThumbnails();

      LOG.log(Level.FINE, "Task-" + random + ":Cache clean is end.");
    }
    else
      isExecution = true;
  }
}
