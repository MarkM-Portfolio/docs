/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletContext;

import org.eclipse.jst.j2ee.application.Module;
import org.eclipse.jst.j2ee.application.WebModule;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.docs.common.util.MimeTypeUtil;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.docs.framework.IComponent;
import com.ibm.websphere.asynchbeans.WorkManager;
import com.ibm.websphere.cache.DistributedMap;
import com.ibm.websphere.scheduler.Scheduler;
import com.ibm.ws.webcontainer.webapp.WebAppImpl;
import com.ibm.wsspi.webcontainer.facade.ServletContextFacade;
import commonj.timers.TimerManager;

public final class Platform
{
  private static final Logger LOG = Logger.getLogger(Platform.class.getName());

  private static final Platform _instance = new Platform();

  private static ServletContext context;

  private static Scheduler houseKeepingSchduler;

  private static WorkManager workManager;

  private static WorkManager autoSaveWorkManager;

  private static WorkManager convertInUploadWorkManager;

  private static WorkManager autoPublishWorkManager;

  private static DistributedMap docEntryCacheMap;

  private static TimerManager timerManager;

  // Presents the context path of rtc4web_server.war, the default context path is "/docs/rtc".
  private static String rtcContextPath = "/docs/rtc";

  private Platform()
  {
  }

  public static void setServletContext(ServletContext sc)
  {
    context = sc;

    try
    {
      ServletContextFacade facede = (ServletContextFacade) context;
      WebAppImpl webApp = (WebAppImpl) facede.getIServletContext();
      Module currentModule = webApp.getDeployedModule().getModule();
      Module rtcServerModule = currentModule.getApplication().getFirstModule("rtc4web_server.war");
      String rtcContextRoot = ((WebModule) rtcServerModule).getContextRoot();
      if (rtcContextRoot != null)
      {
        rtcContextPath = rtcContextRoot.startsWith("/") ? rtcContextRoot : ("/" + rtcContextRoot);
      }
      LOG.log(Level.FINER, "The context path of war rtc4web_server is: " + rtcContextPath);
    }
    catch (Throwable ex)
    {
      LOG.log(Level.WARNING, "Can not get the context path of rtc4web_server.war: ", ex);
    }
  }

  public static ServletContext getServletContext()
  {
    return context;
  }

  /**
   * Get the context path of the war "rtc4web_server".
   * 
   * @return
   */
  public static String getRtcContextPath()
  {
    return rtcContextPath;
  }

  public static IComponent getComponent(String id)
  {
    return ComponentRegistry.getInstance().getComponent(id);
  }

  /**
   * @deprecated
   */
  public static Platform getInstance()
  {
    return _instance;
  }

  public static String getMimeType(String path)
  {
    return MimeTypeUtil.MIME_TYPE_MAP.getContentType(path);
  }

  public static ConcordConfig getConcordConfig()
  {
    return ConcordConfig.getInstance();
  }

  public static void setHouseKeepingScheduler(Scheduler hks)
  {
    houseKeepingSchduler = hks;
  }

  public static Scheduler getHouseKeepingScheduler()
  {
    return houseKeepingSchduler;
  }

  public static void setWorkManager(WorkManager wm)
  {
    workManager = wm;
  }

  public static WorkManager getWorkManager()
  {
    return workManager;
  }

  public static void setAutoSaveWorkManager(WorkManager wm)
  {
    autoSaveWorkManager = wm;
  }

  public static WorkManager getAutoSaveWorkManager()
  {
    return autoSaveWorkManager;
  }

  public static void setConvertInUploadWorkManager(WorkManager wm)
  {
    convertInUploadWorkManager = wm;
  }

  public static WorkManager getConvertInUploadWorkManager()
  {
    return convertInUploadWorkManager;
  }

  public static void setAutoPublishWorkManager(WorkManager wm)
  {
    autoPublishWorkManager = wm;
  }

  public static WorkManager getAutoPublishWorkManager()
  {
    return autoPublishWorkManager;
  }

  public static void setHouseKeepingTimerManager(TimerManager tm)
  {
    timerManager = tm;
  }

  public static TimerManager getHouseKeepingTimerManager()
  {
    return timerManager;
  }

  /**
   * Store the dynamic cache map instance for document entry as the static member of Platform.
   * 
   * @param cacheMap
   */
  public static void setDocEntryCacheMap(DistributedMap cacheMap)
  {
    docEntryCacheMap = cacheMap;
  }

  /**
   * Get the dynamic cache map instance for document entry.
   * 
   * @return
   */
  public static DistributedMap getDocEntryCacheMap()
  {
    return docEntryCacheMap;
  }
}
