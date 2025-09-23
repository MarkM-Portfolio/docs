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

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URL;
import java.nio.ByteOrder;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipFile;

import javax.management.MBeanServer;
import javax.management.ObjectInstance;
import javax.management.ObjectName;
import javax.management.StandardMBean;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.mbean.DomainListMgr;
import com.ibm.concord.viewer.platform.mbean.DomainListMgrMBean;
import com.ibm.concord.viewer.platform.util.SharedStorageMgr;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.platform.util.ViewerVersionCheck;
import com.ibm.concord.viewer.platform.util.SharedStorageMgr.StorageType;
import com.ibm.docs.common.util.WinRegistryUtil;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.WorkManager;
import com.ibm.websphere.cache.DistributedMap;
import com.ibm.websphere.cache.EntryInfo;
import com.ibm.websphere.management.AdminServiceFactory;

public class PlatformInitializer implements ServletContextListener, HttpSessionListener
{
  private static final Logger LOG = Logger.getLogger(PlatformInitializer.class.getName());

  // JNDI name of the WAS work manager for all self-managed threads.
  private static final String WORKMANAGER = "java:comp/env/com/ibm/concord/viewer/workmanager";

  // JNDI name of the WAS dynamic cache instance for document entry.
  private static final String DYNAMICCACHE_DOCENTRY = "com/ibm/concord/viewer/cache/docentry";
  private static final String DYNAMICCACHE_DOCSENTITLE = "com/ibm/concord/viewer/cache/docsentitle";

  // JNDI name of the WAS Upload work manager for all self-managed threads.
  private static final String UPLOADWORKMANAGER = "java:comp/env/com/ibm/concord/viewer/upload/convert/workmanager";

  private static String jniLibPath = null;
  private static String tmpJNILibFile = null;

  private static final String SLES_RELEASE = "/etc/SuSE-release";

  private static final String RHEL_RELEASE = "/etc/redhat-release";
  
  private static final String TEMP = "temp";

  private static final String[] STORAGE_UNIT_SET = {"docs", "viewer", "files"};
  
  private static final String STORAGE_TYPE = "type";

  private static final String STORAGE_SERVER = "server";

  private static final String STORAGE_REMOTE_PATH = "from";

  private static final String STORAGE_LOCAL_PATH = "to";

  private static final String STORAGE_MAP_TIMEOUT = "timeo";
  
  private static final String STORAGE_NFS_LOCK = "lock";

  private static final String STORAGE_MAP_RETRY_COUNT = "retry";
  
  private static ObjectInstance domainListMgrOI = null;
  
  private static StorageType storageType = null; 

  static
  {
    InputStream in = null;
    FileOutputStream out = null;
    try
    {
      URL location = PlatformInitializer.class.getProtectionDomain().getCodeSource().getLocation();
      if (System.getProperty("os.name").toUpperCase().indexOf("WIN") == -1)
      {
        ZipFile zf = new ZipFile(location.getPath());
        if (new File(SLES_RELEASE).exists())
        {
          if (ByteOrder.nativeOrder() == ByteOrder.LITTLE_ENDIAN)
          {
            LOG.info("Detected " + SLES_RELEASE + ", load SLES native library.");
            in = zf.getInputStream(zf.getEntry("native/libFileUtilSuSE11SP3.so"));
          }
          else
          {
            LOG.info("Detected " + SLES_RELEASE + ", load SLES (big endian)native library.");
            in = zf.getInputStream(zf.getEntry("native/libFileUtilSuSE11SP3_bigendian.so"));
          }
        }       
        else if (new File(RHEL_RELEASE).exists() && ByteOrder.nativeOrder() == ByteOrder.LITTLE_ENDIAN)
        {
          LOG.info("Detected " + RHEL_RELEASE + ", load RHEL native library.");
          in = zf.getInputStream(zf.getEntry("native/libFileUtil.so"));
        }
        else
        {
          LOG.log(Level.WARNING, "Can not detect " + SLES_RELEASE + " and " + RHEL_RELEASE + ". load default native library.");
          in = zf.getInputStream(zf.getEntry("native/libFileUtil.so"));
        }
      } else {  // Windows
        // check if the native lock jni dll has already been loaded by the shared library;
        // If not loaded, still use the java file locker
        try {
          com.ibm.concord.viewer.services.fileUtil.FileLockLoader loader = new com.ibm.concord.viewer.services.fileUtil.FileLockLoader();
          loader.check();
          Platform.setUseNativeLock(true);
          LOG.info("Using Windows native file lock.");
        } catch (java.lang.NoClassDefFoundError t) {
          // When exception happened, do nothing, then still use the default java file locker
          LOG.info("Windows native file lock is not configured, using Java file lock.");
        } catch (java.lang.UnsatisfiedLinkError t) {
          // When exception happened, do nothing, then still use the default java file locker
          LOG.info("Windows native file lock is not loaded, using Java file lock.");
        } catch (Exception e) {
          // When exception happened, do nothing, then still use the default java file locker
          LOG.log(Level.WARNING, "Error happened when trying to load the native lock, using Java file lock.", e);
        }

        //
        // below code copy the jni dll from installed jar and load it
        //
        // libext = ".dll";
        // boolean isamd64 = false;
        // if (System.getProperty("os.arch").indexOf("64") != -1) {
        // isamd64 = true;
        // }
        // String arch_str = "32bit";
        // String jnidllname = "native/FileUtil32.dll";
        // if (isamd64) {
        // arch_str = "64bit";
        // jnidllname = "native/FileUtil64.dll";
        // }
        // LOG.info("Detected Windows " + arch_str + ", load Windows native library.");
        //
        // String clpath = location.getPath();
        // if (clpath.endsWith(".jar")) {
        // File jarf = new File(location.toURI());
        // ZipFile zf = new ZipFile(jarf);
        //
        // //@TODO temporarily disable jni loading for Windows
        // //in = zf.getInputStream(zf.getEntry(jnidllname));
        // } else { // local development environment, load the jni library directly
        // /* File clp = new File(location.toURI());
        // File dllf = new File(clp, jnidllname);
        // try {
        // jniLibPath = dllf.getName();
        // System.load(dllf.getAbsolutePath());
        // LOG.info("Windows JNI library load successfully.");
        // } catch (java.lang.UnsatisfiedLinkError e) {
        // LOG.log(Level.SEVERE, "Windows JNI library load failed", e);
        // } */
        //
        // com.ibm.concord.viewer.services.fileUtil.FileLockLoader loader = new com.ibm.concord.viewer.services.fileUtil.FileLockLoader();
        // loader.check();
        //
        // LOG.info("Local development env, not using JNI lock.");
        // }
      }
      
      if (in != null) { // only when source library found, create a temp lib
        String userInstallRoot = System.getProperty("user.install.root");        
        File tempFolder = new File(userInstallRoot + File.separator + TEMP + File.separator + UUID.randomUUID().toString());
        tempFolder.mkdirs();
        LOG.info("Create temp folder for JNI library.");
        File f = new File(tempFolder, "libFileUtil.so");
        f.createNewFile();
        jniLibPath = f.getName();
        tmpJNILibFile = f.getAbsolutePath();
        LOG.info("Create temp JNI library: " + f.getAbsolutePath());
        out = new FileOutputStream(f);
        byte[] buf = new byte[1024];
        int len;
        while ((len = in.read(buf)) > 0)
          out.write(buf, 0, len);
        in.close();
        out.close();

        System.load(tmpJNILibFile);
        LOG.info("Temp JNI library load successfully.");

        if (f.delete())
        {
          LOG.info("Temp JNI library delete successfully.");
          if (tempFolder.delete())
            LOG.info("Temp folder for JNI library delete successfully.");
        }

        Platform.setUseNativeLock(true);
      }
    }
    catch (Exception e)
    {
      LOG.info("Temp JNI library loaded failed.");
    }
    finally
    {
      try
      {
        if (in != null)
          in.close();
        if (out != null)
          out.close();
      }
      catch (IOException e)
      {
        LOG.warning("Close stream error while load temp JNI library.");
      }
    }
  }

  public void contextDestroyed(ServletContextEvent evt)
  {
    if (jniLibPath != null)
    {
      // only unload it on Linux
      // for windows, we assume the classloader will unload it when restart viewer app
      // remove this function because it can not work well with the ibm jre
      //if (System.getProperty("os.name").toUpperCase().indexOf("WIN") == -1)
        //unLoadNativeLibrary(jniLibPath);
      if (tmpJNILibFile != null)
      {
        File libfile = new File(tmpJNILibFile);
        if (libfile.exists())
        { // try to delete the lib again
          if (libfile.delete())
            LOG.info("Temp JNI library delete successfully.");
        }
        tmpJNILibFile = null;
      }
      jniLibPath = null;
    }

    uninitSharedStorages();

    uninitDomainListMBean();
  }

  public void contextInitialized(ServletContextEvent evt)
  {
    Platform.setServletContext(evt.getServletContext());
    JMSConnection.initDataSource();
    // DBConnection.initDataSource();
    initWorkManager();
    initDocEntryCacheInstance();
    initDocsEntitleCacheInstance();
    // initHouseKeeper();

    ViewerUtil.initBuildVersion(evt.getServletContext().getRealPath("/"));
    if (ViewerConfig.getInstance().isOnpremise())
    {
      if (!ViewerVersionCheck.isValidVersion())
      {
        LOG.severe("Viewer application version is incompatible with Conversion.");
      }
      else
      {
        LOG.info("Viewer application version is compatible with Conversion.");
      }
    }
    else
    {
      LOG.info("Not On-premise env, skip version check.");
    }

    initSharedStorages();
    
    if(!ViewerConfig.getInstance().isSmartCloud())
    {
      WinRegistryUtil.initCiftsRegistries();
    }
    
    initDomainListMBean();
  }

  private void initWorkManager()
  {
    try
    {
      InitialContext context = new InitialContext();
      WorkManager wm = (WorkManager) context.lookup(WORKMANAGER);
      Platform.setWorkManager(wm);

      WorkManager uploadWM = (WorkManager) context.lookup(UPLOADWORKMANAGER);
      Platform.setUploadWorkManager(uploadWM);
    }
    catch (NamingException e)
    {
      e.printStackTrace();
    }
  }

  /**
   * Get the time in seconds that the cache entry should remain in the cache from concord configuration file.
   * 
   * @return
   */
  private int getDocEntryCacheTimeToLive()
  {
    // The default document entry's live time in cache is 60 seconds.
    int cacheLiveTime = 60;
    try
    {
      JSONObject config = Platform.getViewerConfig().getSubConfig("docentrycache");
      if (config != null)
      {
        cacheLiveTime = Integer.parseInt(config.get("timetolive-seconds").toString());
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "failed to get the live time of document entry in dynamic cache from concord configuration file ", e);
    }
    return cacheLiveTime;
  }

  /**
   * Lookup the defined WebSphere dynamic cache instance for document entry, the JNDI name is "com/ibm/viewer/cache/docentry".
   * 
   */
  private void initDocEntryCacheInstance()
  {
    DistributedMap cacheMap = null;
    try
    {
      InitialContext context = new InitialContext();

      cacheMap = (DistributedMap) context.lookup(DYNAMICCACHE_DOCENTRY);
      if (cacheMap != null)
      {
        cacheMap.setSharingPolicy(EntryInfo.NOT_SHARED);
        cacheMap.setTimeToLive(getDocEntryCacheTimeToLive());
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "failed to initialize dynamic cache for document entry", e);
    }
    Platform.setDocEntryCacheMap(cacheMap);
  }

  private void initDocsEntitleCacheInstance()
  {
    DistributedMap cacheMap = null;
    try
    {
      InitialContext context = new InitialContext();

      cacheMap = (DistributedMap) context.lookup(DYNAMICCACHE_DOCSENTITLE);
      if (cacheMap != null)
      {
        cacheMap.setSharingPolicy(EntryInfo.NOT_SHARED);
        cacheMap.setTimeToLive(getDocEntryCacheTimeToLive());
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "failed to initialize dynamic cache for docs entitlement entry", e);
    }
    Platform.setDocsEntitleCacheMap(cacheMap);
  }

  public void sessionCreated(HttpSessionEvent evt)
  {
    evt.getSession().setAttribute("secureToken", UUID.randomUUID().toString());
  }

  public void sessionDestroyed(HttpSessionEvent evt)
  {
  }

  // remove this function because it can not work well with the ibm jre
  /*
  private static synchronized void unLoadNativeLibrary(String libName)
  {
    try
    {
      ClassLoader cl = PlatformInitializer.class.getClassLoader();
      Field field = ClassLoader.class.getDeclaredField("nativeLibraries");
      field.setAccessible(true);
      Vector<Object> libs = (Vector<Object>) field.get(cl);
      Iterator it = libs.iterator();
      while (it.hasNext())
      {
        Object object = it.next();
        Field[] fs = object.getClass().getDeclaredFields();
        for (int k = 0; k < fs.length; k++)
        {
          if (fs[k].getName().equals("name"))
          {
            fs[k].setAccessible(true);
            String jniPath = fs[k].get(object).toString();
            LOG.info("JNI :" + jniPath);
            if (jniPath.endsWith(libName))
            {
              Method finalize = object.getClass().getDeclaredMethod("finalize");
              finalize.setAccessible(true);
              finalize.invoke(object);
            }
          }
        }
      }
    }
    catch (Exception th)
    {
      th.printStackTrace();
    }
  }*/

  /**
   * Initialize shared storages used in Verse environment
   */
  private void initSharedStorages()
  {
    boolean isVerse = Platform.getViewerConfig().getIsVerseEnv();
    Map config = (Map) Platform.getViewerConfig().getSharedStorageConfig();
    if (config != null)
    {
      SharedStorageMgr mgr = new SharedStorageMgr();
      for (String unit : STORAGE_UNIT_SET)
      {
        String unitKey = unit.toLowerCase();
        Map unitConfig = null;
        Object unitConfigObj = config.containsKey(unitKey) ? config.get(unitKey) : null;
        if (unitConfigObj != null)
        {
          try
          {
            unitConfig = (Map) unitConfigObj;
          }
          catch (ClassCastException e)
          {
            // LOG.log(Level.INFO, "Not a valid shared storage setting for " + unitKey);
          }
        }
        LOG.log(Level.INFO, "shared storages:" + unit + " " + unitConfig);
        if (unitConfig != null)
        {
          String type = unitConfig.containsKey(STORAGE_TYPE) ? (String) unitConfig.get(STORAGE_TYPE) : null;
          
          String host = unitConfig.containsKey(STORAGE_SERVER) ? (String) unitConfig.get(STORAGE_SERVER) : null;
          String from = unitConfig.containsKey(STORAGE_REMOTE_PATH) ? (String) unitConfig.get(STORAGE_REMOTE_PATH) : null;
          String to = unitConfig.containsKey(STORAGE_LOCAL_PATH) ? (String) unitConfig.get(STORAGE_LOCAL_PATH) : null;
          int retry = unitConfig.containsKey(STORAGE_MAP_RETRY_COUNT) ? Integer.valueOf((String) unitConfig.get(STORAGE_MAP_RETRY_COUNT))
              .intValue() : -1;
          int timeout = unitConfig.containsKey(STORAGE_MAP_TIMEOUT) ? Integer.valueOf((String) unitConfig.get(STORAGE_MAP_TIMEOUT))
              .intValue() : -1;
          boolean lock = unitConfig.containsKey(STORAGE_NFS_LOCK) ? Boolean.valueOf((String) unitConfig.get(STORAGE_NFS_LOCK))
              .booleanValue() : true;
          if (type != null && host != null && from != null && to != null)
          {
            storageType = StorageType.valueOf(type.trim().toUpperCase());
            if (storageType == StorageType.NFS || storageType == StorageType.NFS4 || storageType == StorageType.GLUSTER)
            {
              if (isVerse)
              {
                mgr.mount(host, from, to, retry, timeout, lock, storageType);
              }
              else
              {
                if (!mgr.validate(to))
                {
                  LOG.log(
                      Level.SEVERE,
                      "Setting for {0} shared storage is not supported to mount automatically, please make sure {1} mount is ready before starting server. You can follow installation guide to mount this type of storage.",new String[] { type, type });
                }
              }
            }
            else if (storageType == StorageType.LOCAL)
            {
              LOG.log(Level.INFO, "Local directory is configurated, no need to auto mount shared storage for {0}.", unit);
            }
            else if (storageType == StorageType.CIFS)
            {
              if (!mgr.validate(to))
              {
                LOG.log(
                    Level.SEVERE,
                    "Setting for CIFS shared storage for Viewer is not supported to mount automatically, please follow installation guide to mount this type of storage.");
              }
            }
            else
            {
              LOG.log(Level.WARNING, "Setting for shared storage {0} for {1} is not supported, assuming local directory will be used.",
                  new String[] { type, unit });
            }
          }
          else
          {
            LOG.log(Level.WARNING, "Setting for shared storage for {0} was not found, assuming local directory will be used.", unit);
          }
        }
        else
        {
          LOG.log(Level.WARNING, "Setting for shared storage for {0} was not found, assuming local directory will be used.", unit);
        }
      }
    }
    else
    {
      LOG.log(Level.WARNING, "Setting for shared storage was not found, auto mount shared storage was skipped.");
    }
  }

  /**
   * 
   */
  private void uninitSharedStorages()
  {
    if (Platform.getViewerConfig().getIsVerseEnv())
    {
      SharedStorageMgr mgr = new SharedStorageMgr();
      mgr.umount("all", storageType);
    }
  }

  /**
   * Registe DomainListMrg MBean
   */
  private void initDomainListMBean()
  {
    LOG.entering(this.getClass().getName(), "initDomainListMBean");
    try
    {
      MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
      ObjectName anON = new ObjectName("com.ibm.concord.viewer.admin.mbean:type=DomainListMrg");
      if (!mbServer.isRegistered(anON))
      {
        StandardMBean mbean = new StandardMBean(new DomainListMgr(), DomainListMgrMBean.class, false);
        domainListMgrOI = mbServer.registerMBean(mbean, anON);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens while registering DomainListMrg MBean.", e);
    }
    LOG.exiting(this.getClass().getName(), "initDomainListMBean");
  }
  

  /**
   * Unregiste DomainListMrg MBean
   */
  private void uninitDomainListMBean()
  {
    LOG.entering(this.getClass().getName(), "uninitDomainListMBean");
    if (domainListMgrOI != null)
    {
      try
      {
        MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
        mbServer.unregisterMBean(domainListMgrOI.getObjectName());
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Error happens while unregistering DomainListMrg MBean.", e);
      }
    }
    LOG.exiting(this.getClass().getName(), "uninitDomainListMBean");
  }
}
