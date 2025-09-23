/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform;

import java.util.logging.Logger;

import javax.servlet.ServletContext;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.auth.DefaultEntitlementSrv;
import com.ibm.concord.viewer.platform.component.ComponentRegistry;
import com.ibm.concord.viewer.platform.component.IComponent;
import com.ibm.concord.viewer.platform.util.DocsEntitlementCheck;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.entitlement.IEntitlementService;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.concord.viewer.spi.util.MimeTypeUtil;
import com.ibm.websphere.asynchbeans.WorkManager;
import com.ibm.websphere.cache.DistributedMap;

public final class Platform
{
  private static final Logger LOG = Logger.getLogger(Platform.class.getName());

  private static final Platform _instance = new Platform();

  private static ServletContext context;

  private static WorkManager workManager;

  private static WorkManager uploadWorkManager;

  private static DistributedMap docEntryCacheMap;

  private static DistributedMap docsEntitleCacheMap;

  private static DefaultEntitlementSrv entitlementSrv;

  private static boolean isNativeLock = false;

  // // Presents the context path of rtc4web_server.war, the default context path is "/concord/rtc".
  // private static String rtcContextPath = "/concord/rtc";

  private Platform()
  {
  }

  static void setServletContext(ServletContext sc)
  {
    context = sc;
    /*
     * try { ServletContextFacade facede = (ServletContextFacade) context; WebAppImpl webApp = (WebAppImpl) facede.getIServletContext();
     * Module currentModule = webApp.getDeployedModule().getModule(); Module rtcServerModule =
     * currentModule.getApplication().getFirstModule("rtc4web_server.war"); String rtcContextRoot = ((WebModule)
     * rtcServerModule).getContextRoot(); if (rtcContextRoot != null) { rtcContextPath = rtcContextRoot.startsWith("/") ? rtcContextRoot :
     * ("/" + rtcContextRoot); } LOG.log(Level.FINER, "The context path of war rtc4web_server is: " + rtcContextPath); } catch (Throwable
     * ex) { LOG.log(Level.WARNING, "Can not get the context path of rtc4web_server.war: ", ex); }
     */
  }

  public static IEntitlementService getEntitlementSrv()
  {
    if (entitlementSrv == null)
    {
      entitlementSrv = new DefaultEntitlementSrv();
    }

    return entitlementSrv;
  }

  public static ServletContext getServletContext()
  {
    return context;
  }

  // /**
  // * Get the context path of the war "rtc4web_server".
  // *
  // * @return
  // */
  // public static String getRtcContextPath()
  // {
  // return rtcContextPath;
  // }

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

  public static ViewerConfig getViewerConfig()
  {
    return ViewerConfig.getInstance();
  }

  public static boolean checkSnapshotEntitlement(UserBean user, boolean forceRefresh)
  {
    LOG.entering(Platform.class.getName(), "checkEntitlement", new Object[] { user.getId(), forceRefresh });

    if (!Platform.getViewerConfig().isSnapshotMode())
    {
      LOG.exiting(Platform.class.getName(), "checkEntitlement - snopshot not enabled", false);
      return false;
    }
    String thirdPartyProp = user.getProperty(UserProperty.PROP_ISTHIRDPARTY.toString());
    if (thirdPartyProp != null && Boolean.valueOf(thirdPartyProp))
    {
      LOG.exiting(Platform.class.getName(), "checkEntitlement - 3rd party", false);
      return false;
    }

    boolean bSnap = false;
    if (user != null)
    {
      bSnap = DocsEntitlementCheck.getInstance().getEntitlement(user, forceRefresh);
    }

    LOG.exiting(Platform.class.getName(), "checkEntitlement - docs", bSnap);
    return bSnap;
  }

  public static void setWorkManager(WorkManager wm)
  {
    workManager = wm;
  }

  public static WorkManager getWorkManager()
  {
    return workManager;
  }

  /**
   * Store the dynamic cache map instance for document entry as the static member of Platform.
   * 
   * @param cacheMap
   */
  static void setDocEntryCacheMap(DistributedMap cacheMap)
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

  /**
   * Store the dynamic cache map instance for user docs entitlement as the static member of Platform.
   * 
   * @param cacheMap
   */
  static void setDocsEntitleCacheMap(DistributedMap cacheMap)
  {
    docsEntitleCacheMap = cacheMap;
  }

  /**
   * Get the dynamic cache map instance for user docs entitlement.
   * 
   * @return
   */
  public static DistributedMap getDocEntitleCacheMap()
  {
    return docsEntitleCacheMap;
  }

  public static WorkManager getUploadWorkManager()
  {
    return uploadWorkManager;
  }

  public static void setUploadWorkManager(WorkManager uploadWorkManager)
  {
    Platform.uploadWorkManager = uploadWorkManager;
  }

  public static void setUseNativeLock(boolean isNativeLock)
  {
    Platform.isNativeLock = isNativeLock;
  }

  public static boolean useNativeLock()
  {
    return Platform.isNativeLock;
  }
}
