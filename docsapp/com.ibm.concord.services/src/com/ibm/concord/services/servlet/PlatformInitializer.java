/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.servlet;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.ByteOrder;
import java.rmi.RemoteException;
import java.util.Date;
import java.util.Iterator;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipFile;

import javax.management.InstanceAlreadyExistsException;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanRegistrationException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.NotCompliantMBeanException;
import javax.management.ObjectInstance;
import javax.management.ObjectName;
import javax.management.StandardMBean;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.log.ConcordErrorCode;
import com.ibm.concord.log.ConcordLogger;
import com.ibm.concord.migration.IMigrationService;
import com.ibm.concord.migration.MigrationComponent;
import com.ibm.concord.platform.DBConnection;
import com.ibm.concord.platform.JMSConnection;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.journal.JournalComponentImpl;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.ConcordVersionCheck;
import com.ibm.concord.services.mbean.CustomerCredentialMBean;
import com.ibm.concord.services.mbean.CustomerCredentialMgr;
import com.ibm.concord.services.mbean.DomainListMgr;
import com.ibm.concord.services.mbean.DomainListMgrMBean;
import com.ibm.concord.services.mbean.EntitlementsMgr;
import com.ibm.concord.services.mbean.HouseKeeping;
import com.ibm.concord.services.mbean.SharedStorageMgr;
import com.ibm.concord.session.SessionConfig;
import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.docs.common.util.WASConfigHelper;
import com.ibm.docs.common.util.WinRegistryUtil;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.docs.framework.Components;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.housekeeping.HouseKeepingMonitor;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.WorkManager;
import com.ibm.websphere.cache.DistributedMap;
import com.ibm.websphere.cache.EntryInfo;
import com.ibm.websphere.management.AdminServiceFactory;
import com.ibm.websphere.runtime.ServerName;
import com.ibm.websphere.scheduler.BeanTaskInfo;
import com.ibm.websphere.scheduler.NotificationException;
import com.ibm.websphere.scheduler.NotificationSinkInvalid;
import com.ibm.websphere.scheduler.Scheduler;
import com.ibm.websphere.scheduler.SchedulerNotAvailableException;
import com.ibm.websphere.scheduler.TaskHandlerHome;
import com.ibm.websphere.scheduler.TaskInfo;
import com.ibm.websphere.scheduler.TaskInfoInvalid;
import com.ibm.websphere.scheduler.TaskInvalid;
import com.ibm.websphere.scheduler.TaskPending;
import com.ibm.websphere.scheduler.TaskStatus;
import com.ibm.websphere.scheduler.UserCalendarInvalid;
import com.ibm.websphere.scheduler.UserCalendarPeriodInvalid;
import com.ibm.websphere.scheduler.UserCalendarSpecifierInvalid;
import commonj.timers.TimerManager;

public class PlatformInitializer implements ServletContextListener, HttpSessionListener
{
  private static final Logger LOG = Logger.getLogger(PlatformInitializer.class.getName());

  // JNDI name of the WAS work manager for all self-managed threads.
  private static final String WORKMANAGER = "java:comp/env/com/ibm/concord/workmanager";

  // JNDI name of the WAS work manager for auto saving threads.
  private static final String AUTOSAVE_WORKMANAGER = "java:comp/env/com/ibm/docs/autosave/workmanager";

  // JNDI name of the WAS work manager for conversion during uploading jobs.
  private static final String CONVERTINUPLOAD_WORKMANAGER = "java:comp/env/com/ibm/docs/upload/convert/workmanager";

  // JNDI name of the WAS work manager for auto publish
  private static final String AUTOPUBLISH_WORKMANAGER = "java:comp/env/com/ibm/docs/autopublish/workmanager";

  // JNDI name of the WAS dynamic cache instance for document entry.
  private static final String DYNAMICCACHE_DOCENTRY = "com/ibm/concord/cache/docentry";

  // JNDI name of the WAS scheduler for house keeping.
  private static final String HOUSE_KEEPING_SCHEDULER = "java:comp/env/com/ibm/concord/house_keeping_scheduler";

  // JNDI name of the session bean for house keeping.
  private static final String HOUSE_KEEPING_BEAN = "java:comp/env/ejb/HouseKeeping";

  // JNDI name of the WAS timer for house keeping.
  private static final String TIMERMANAGER = "java:comp/env/com/ibm/docs/housekeeping/timermanager";

  private static ObjectInstance hkOI = null;

  private static ObjectInstance sharedStorageOI = null;

  private static ObjectInstance entitleMgrOI = null;

  private static ObjectInstance credentialMgrOI = null;

  private static ObjectInstance domainListMgrOI = null;

  private String APP_STATUS_FILE = ServerName.getFullName().replace('\\', '_') + ".lck";

  private Timer statusFileTouchTimer = null;

  private static final String SLES_RELEASE = "/etc/SuSE-release";

  private static final String RHEL_RELEASE = "/etc/redhat-release";

  private static final String TEMP = "temp";

  private static SmartCloudInitializer scInitializer;

  /**
   * Set corePoolSize
   */
  private static final int INIT_CORE_POOL_SIZE = 10;

  /**
   * Set maximumPoolSize
   */
  private static final int MAX_CORE_POOL_SIZE = 50;

  /**
   * Set keepAliveTime
   */
  private static final long ASYNC_SERVLET_TIME = 30L;

  static
  {
    if (System.getProperty("os.name").toUpperCase().indexOf("WIN") == -1)
    {
      InputStream in = null;
      FileOutputStream out = null;
      try
      {
        URL location = PlatformInitializer.class.getProtectionDomain().getCodeSource().getLocation();
        ZipFile zf = new ZipFile(location.getPath());
        if (new File(SLES_RELEASE).exists())
        {
          if (ByteOrder.nativeOrder() == ByteOrder.LITTLE_ENDIAN)
          {
            LOG.info("Detected " + SLES_RELEASE + ", load SLES native library.");
            in = zf.getInputStream(zf.getEntry("native_lock_lib/libFileUtilSuSE11SP3.so"));
          }
          else
          {
            LOG.info("Detected " + SLES_RELEASE + ", load SLES (big endian)native library.");
            in = zf.getInputStream(zf.getEntry("native_lock_lib/libFileUtilSuSE11SP3_bigendian.so"));
          }
        }
        else if (new File(RHEL_RELEASE).exists() && ByteOrder.nativeOrder() == ByteOrder.LITTLE_ENDIAN)
        {
          LOG.info("Detected " + RHEL_RELEASE + ", load RHEL native library.");
          in = zf.getInputStream(zf.getEntry("native_lock_lib/libFileUtil.so"));
        }
        else
        {
          LOG.log(Level.WARNING, "Can not detect " + SLES_RELEASE + " and " + RHEL_RELEASE + ". load default native library.");
          in = zf.getInputStream(zf.getEntry("native_lock_lib/libFileUtil.so"));
        }
        String userInstallRoot = System.getProperty("user.install.root");
        File tempFolder = new File(userInstallRoot + File.separator + TEMP + File.separator + UUID.randomUUID().toString());
        tempFolder.mkdirs();
        LOG.info("Create temp folder for JNI library.");
        File f = new File(tempFolder, "libFileUtil.so");
        f.createNewFile();
        LOG.info("Create temp JNI library: " + f.getAbsolutePath());
        out = new FileOutputStream(f);
        byte[] buf = new byte[1024];
        int len;
        while ((len = in.read(buf)) > 0)
          out.write(buf, 0, len);

        System.load(f.getAbsolutePath());
        LOG.info("libFileUtil.so JNI library load successfully.");
        if (f.delete())
        {
          LOG.info("libFileUtil.so JNI library is deleted successfully.");
          if (tempFolder.delete())
            LOG.info("Temp folder for libFileUtil.so is deleted successfully.");
        }
      }
      catch (Exception e)
      {
        LOG.info("libFileUtil.so JNI library fails to load.");
      }
      finally
      {
        try
        {
          if (in != null)
          {
            in.close();
          }
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "Close input stream error while load libFileUtil.so JNI library.", e);
        }
        try
        {
          if (out != null)
          {
            out.close();
          }
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "Close output stream error while load libFileUtil.so JNI library.", e);
        }
      }
    }
  }

  public static SmartCloudInitializer getSmartCloudInitializer()
  {
    return scInitializer;
  }

  public void contextDestroyed(ServletContextEvent evt)
  {
    if (Platform.getConcordConfig().isCloud() && (scInitializer != null && scInitializer.isZookeeperEnabled()))
      scInitializer.closeZookeeperClient();

    // Cancel the status file touching task while stopping the application, that presents the application is not available.
    statusFileTouchTimer.cancel();
    uninitSharedStorage();
    uninitMBean4SharedStorage();
    uninitMBean4HK();
    uninitEntitlementsMBean();
    uninitCustomerCredentialMBean();
    // JMSConnection.close();
    uninitComponents();

    /**
     * Destroy threadPool for asyncServlet when application shutdown.
     */
    uninitAsyncServletContext(evt);

    uninitDomainListMBean();
  }

  public void contextInitialized(ServletContextEvent evt)
  {
    // initialize concord-config.json
    ConcordConfig.getInstance().init();

    // initialize database connection
    DBConnection.initDataSource();
    // initialize SessionConfig
    SessionConfig.toJSON();
    // initialize version information
    ConcordUtil.initVersion();

    Platform.setServletContext(evt.getServletContext());

    initComponents();
    // Start a timer to touch the status file every 5 seconds, that presents this application is available.
    statusFileTouchTimer = new Timer();
    boolean bSCInitialized = false;
    if (Platform.getConcordConfig().isCloud())
    {
      try
      {
        scInitializer = new SmartCloudInitializer();
        if (scInitializer.isZookeeperEnabled())
        {
          bSCInitialized = scInitializer.initZookeeperClient();
        }
        else
          scInitializer = null;
      }
      catch (Exception e)
      {
        scInitializer = null;
        LOG.log(Level.SEVERE, "ZooKeeper: init zookeeper client failed!", e);
      }
    }

    // always touch status file on NFS even zookeeper is enabled for zookeeper connection failure
    statusFileTouchTimer.schedule(new StatusFileTouchTask(), 0, 5000);
    initWorkManager();
    initDocEntryCacheMap();
    initHouseKeeper();
    initHouseKeepingTimer();
    initSharedStorage();
    if (!Platform.getConcordConfig().isCloud())
    {
      WinRegistryUtil.initCiftsRegistries();
    }
    if (!ConcordConfig.getInstance().isCloud())
      JMSConnection.initDataSource();
    initMBean4SharedStorage();
    initMBean4HK();
    initEntitlementsMBean();
    initCustomerCredentialMBean();
    if (!ConcordVersionCheck.isValidVersion())
      LOG.severe("HCL Docs version is incompatible with Conversion! Please make sure they are using the same version.");
    /**
     * Set threadPool for asyncServlet when application startup.
     */
    initAsyncServletContext(evt);

    initDomainListMBean();
  }

  private void initWorkManager()
  {
    try
    {
      InitialContext context = new InitialContext();
      WorkManager wm = (WorkManager) context.lookup(WORKMANAGER);
      Platform.setWorkManager(wm);

      WorkManager aswm = (WorkManager) context.lookup(AUTOSAVE_WORKMANAGER);
      Platform.setAutoSaveWorkManager(aswm);

      WorkManager cusm = (WorkManager) context.lookup(CONVERTINUPLOAD_WORKMANAGER);
      Platform.setConvertInUploadWorkManager(cusm);

      WorkManager apwm = (WorkManager) context.lookup(AUTOPUBLISH_WORKMANAGER);
      Platform.setAutoPublishWorkManager(apwm);
    }
    catch (NamingException e)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.WORKMANAGER_INIT_ERROR, "failed to initialize concord work manager", e);
    }
  }

  /**
   * Get the time in seconds that the cache entry should remain in the cache for document entry from concord configuration file.
   *
   * @return
   */
  private int getDocEntryCacheTimeToLive()
  {
    // The default document entry's live time in cache is 60 seconds.
    int cacheLiveTime = 60;
    try
    {
      JSONObject config = Platform.getConcordConfig().getSubConfig("docentrycache");
      if (config != null)
      {
        cacheLiveTime = Integer.parseInt(config.get("timetolive-seconds").toString());
      }
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, "failed to get the live time of document entry in dynamic cache from concord configuration file ", e);
    }
    return cacheLiveTime;
  }

  /**
   * Lookup the defined WebSphere dynamic cache instance for document entry, the JNDI name is "com/ibm/concord/cache/docentry".
   *
   */
  private void initDocEntryCacheMap()
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
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, "failed to initialize dynamic cache for document entry", e);
    }
    Platform.setDocEntryCacheMap(cacheMap);
  }

  private void initHouseKeepingTimer()
  {
    if (!Platform.getConcordConfig().isCloud())
    {
      LOG.log(Level.INFO, "New House Keeping is not supported on OnPremise environments.");
      return;
    }
    try
    {
      InitialContext context = new InitialContext();
      TimerManager tm = (TimerManager) context.lookup(TIMERMANAGER);
      Platform.setHouseKeepingTimerManager(tm);
      boolean isMA = (getSmartCloudInitializer() == null) ? false : getSmartCloudInitializer().isDocsMA();
      HouseKeepingMonitor.getInstance().initListeners(isMA);
      LOG.log(Level.INFO, "Initialize the housekeeping TimerManager successfully.");
    }
    catch (NamingException e)
    {
      LOG.log(Level.WARNING, "Failed to initialize the TimerManager: " + e.getMessage());
    }
  }

  private static Scheduler hks = null;

  private void initHouseKeeper()
  {
    if (hks == null)
    {
      try
      {
        InitialContext context = new InitialContext();
        hks = (Scheduler) context.lookup(HOUSE_KEEPING_SCHEDULER);
        Platform.setHouseKeepingScheduler(hks);
      }
      catch (NamingException e)
      {
        ConcordLogger.log(LOG, Level.WARNING, ConcordErrorCode.HUOSEKEEPING_INIT_ERROR,
            "The house keeping scheduler was not found, skip to set house keeping task.");
        return;
      }
    }
    String hkFrequency;
    {
      String configName = "House_Keeping";
      if (Platform.getConcordConfig().getSubConfig(configName).get("frequency") == null)
      {
        hkFrequency = "weekly";
        LOG.log(Level.INFO, "\"frequency\" settings for \"House_Keeping\" was not found, \"weekly\" as default.");
      }
      else
      {
        hkFrequency = (String) Platform.getConcordConfig().getSubConfig(configName).get("frequency");
        LOG.log(Level.INFO, "\"frequency\" settings for \"House_Keeping\" was found: " + hkFrequency);
      }
    }

    initHouseKeeping(hkFrequency);
  }

  private static TaskHandlerHome houseKeepingHome = null;

  public static void initHouseKeeping(String hkFrequency)
  {
    if (houseKeepingHome == null)
    {
      try
      {
        Object hkh = new InitialContext().lookup(HOUSE_KEEPING_BEAN);
        houseKeepingHome = (TaskHandlerHome) javax.rmi.PortableRemoteObject.narrow(hkh, TaskHandlerHome.class);
      }
      catch (NamingException e)
      {
        LOG.log(Level.WARNING, "The house keeping bean was not found, please check <ejb-ref> element in web.xml and ejb-jar.xml.", e);
      }
    }

    if (hks != null && houseKeepingHome != null)
    {
      try
      {
        BeanTaskInfo hkTaskInfo = (BeanTaskInfo) hks.createTaskInfo(BeanTaskInfo.class);
        hkTaskInfo.setName("house_keeping");
        hkTaskInfo.setQOS(TaskInfo.QOS_ONLYONCE);
        hkTaskInfo.setTaskExecutionOptions(TaskInfo.EXECUTION_DELAYEDUPDATE);
        hkTaskInfo.setExpectedDuration(Integer.MAX_VALUE);

        hkTaskInfo.setUserCalendar(null, "CRON");
        hkTaskInfo.setTaskHandler(houseKeepingHome);

        /*
         * second minute hourOfDay DayOfMonth Month DayOfWeek
         *
         * Month: JAN,FEB,MAR,APR,MAY,JUN,JUL,AUG,SEP,OCT,NOV,DEC DayOfWeek: MON,FRI,SAT,SUN
         */
        if ("monthly".equalsIgnoreCase(hkFrequency))
        {
          String cronTableEntry = "0 0 23 L * ?";
          hkTaskInfo.setStartTimeInterval(cronTableEntry);
          hkTaskInfo.setRepeatInterval(cronTableEntry);
          hkTaskInfo.setNumberOfRepeats(-1);
        }
        else if ("weekly".equalsIgnoreCase(hkFrequency))
        {
          String cronTableEntry = "0 0 23 ? * SUN";
          hkTaskInfo.setStartTimeInterval(cronTableEntry);
          hkTaskInfo.setRepeatInterval(cronTableEntry);
          hkTaskInfo.setNumberOfRepeats(-1);
        }
        else if ("daily".equalsIgnoreCase(hkFrequency))
        {
          String cronTableEntry = "0 0 23 * * ?";
          hkTaskInfo.setStartTimeInterval(cronTableEntry);
          hkTaskInfo.setRepeatInterval(cronTableEntry);
          hkTaskInfo.setNumberOfRepeats(-1);
        }
        else if ("hourly".equalsIgnoreCase(hkFrequency))
        {
          String cronTableEntry = "0 59 * * * ?";
          hkTaskInfo.setStartTimeInterval(cronTableEntry);
          hkTaskInfo.setRepeatInterval(cronTableEntry);
          hkTaskInfo.setNumberOfRepeats(-1);
        }
        else if ("now".equalsIgnoreCase(hkFrequency))
        {
          hkTaskInfo.setStartTime(new Date(System.currentTimeMillis() + 30 * 1000));
          hkTaskInfo.setNumberOfRepeats(1);
        }
        else if ("none".equalsIgnoreCase(hkFrequency))
        {
          hkTaskInfo.setNumberOfRepeats(0);
        }
        else
        {
          hkTaskInfo.setStartTimeInterval(hkFrequency);
          hkTaskInfo.setRepeatInterval(hkFrequency);
          hkTaskInfo.setNumberOfRepeats(-1);
        }

        if (!"none".equalsIgnoreCase(hkFrequency))
        {
          Exception validationE = null;
          try
          {
            hkTaskInfo.validate();
          }
          catch (UserCalendarSpecifierInvalid e)
          {
            validationE = e;
          }
          catch (UserCalendarPeriodInvalid e)
          {
            validationE = e;
          }
          catch (UserCalendarInvalid e)
          {
            validationE = e;
          }
          finally
          {
            if (validationE != null)
            {
              hkFrequency = "weekly";
              LOG.log(Level.WARNING, validationE.getMessage(), validationE);
              LOG.log(Level.INFO, "\"frequency\" settings for \"House_Keeping\" was invalid, \"weekly\" as default.");
              hkTaskInfo.setStartTimeInterval(hkFrequency);
              hkTaskInfo.setRepeatInterval(hkFrequency);
            }
          }
        }

        boolean shouldSchedule = hkTaskInfo.getNumberOfRepeats() != 0;
        Iterator<?> existedTasksIter = hks.findTasksByName("house_keeping");
        while (existedTasksIter.hasNext())
        {
          TaskInfo prevTask = (TaskInfo) existedTasksIter.next();
          String prevRepeatInterval = prevTask.getRepeatInterval() == null ? "" : prevTask.getRepeatInterval();
          String currRepeatInterval = hkTaskInfo.getRepeatInterval() == null ? "" : hkTaskInfo.getRepeatInterval();
          if (!prevRepeatInterval.equalsIgnoreCase(currRepeatInterval) || prevTask.getNumberOfRepeats() != hkTaskInfo.getNumberOfRepeats())
          {
            // no matter task is running or scheduled, cancel it! defect 28681
            hks.cancel(prevTask.getTaskId(), true);
            LOG.log(Level.INFO, "Previous House Keeping Task Cancelled: " + prevTask.getTaskId());
          }
          else
          {
            shouldSchedule = false;

            LOG.log(Level.INFO, "Previous House Keeping Task Scheduled: " + prevTask.getTaskId());
          }
        }

        if (shouldSchedule)
        {
          TaskStatus ts = hks.create(hkTaskInfo);

          LOG.log(Level.INFO, "House Keeping Task Scheduled: {0}, {1}", new Object[] { ts.getTaskId(), hkFrequency });
        }
      }
      catch (TaskPending e)
      {
        LOG.log(Level.INFO, "House Keeping Init Error: ", e);
      }
      catch (TaskInfoInvalid e)
      {
        LOG.log(Level.INFO, "House Keeping Init Error: ", e);
      }
      catch (UserCalendarSpecifierInvalid e)
      {
        LOG.log(Level.INFO, "House Keeping Init Error: ", e);
      }
      catch (UserCalendarInvalid e)
      {
        LOG.log(Level.INFO, "House Keeping Init Error: ", e);
      }
      catch (UserCalendarPeriodInvalid e)
      {
        LOG.log(Level.INFO, "House Keeping Init Error: ", e);
      }
      catch (TaskInvalid e)
      {
        LOG.log(Level.INFO, "House Keeping Init Error: ", e);
      }
      catch (SchedulerNotAvailableException e)
      {
        LOG.log(Level.INFO, "House Keeping Init Error: ", e);
      }
      catch (NotificationSinkInvalid e)
      {
        LOG.log(Level.INFO, "House Keeping Init Error: ", e);
      }
      catch (NotificationException e)
      {
        LOG.log(Level.INFO, "House Keeping Init Error: ", e);
      }
      catch (RemoteException e)
      {
        LOG.log(Level.INFO, "House Keeping Init Error: ", e);
      }
    }
  }

  private void initMBean4SharedStorage()
  {
    MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
    try
    {
      ObjectName anON = new ObjectName("com.ibm.concord.platform.mbean:type=SharedStorageMgr");
      if (!mbServer.isRegistered(anON))
      {
        sharedStorageOI = mbServer.registerMBean(new SharedStorageMgr(), anON);
      }
    }
    catch (InstanceAlreadyExistsException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Shared Storage Failed.", e);
    }
    catch (MBeanRegistrationException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Shared Storage Failed.", e);
    }
    catch (NotCompliantMBeanException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Shared Storage Failed.", e);
    }
    catch (MalformedObjectNameException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Shared Storage Failed.", e);
    }
    catch (NullPointerException e)
    {
      LOG.log(Level.WARNING, "Register MBean for Shared Storage Failed.", e);
    }
  }

  private void initMBean4HK()
  {
    MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
    try
    {
      ObjectName anON = new ObjectName("com.ibm.concord.platform.mbean:type=HouseKeeping");
      if (!mbServer.isRegistered(anON))
      {
        hkOI = mbServer.registerMBean(new HouseKeeping(), anON);
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

  private void uninitMBean4HK()
  {
    if (hkOI != null)
    {
      MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
      try
      {
        mbServer.unregisterMBean(hkOI.getObjectName());
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

  private void uninitMBean4SharedStorage()
  {
    if (sharedStorageOI != null)
    {
      MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
      try
      {
        mbServer.unregisterMBean(sharedStorageOI.getObjectName());
      }
      catch (MBeanRegistrationException e)
      {
        LOG.log(Level.WARNING, "Un-Register MBean for Shared Storage Failed.", e);
      }
      catch (InstanceNotFoundException e)
      {
        LOG.log(Level.WARNING, "Un-Register MBean for Shared Storage Failed.", e);
      }
    }
  }

  /**
   * Register the MBean to manage the entitlements of subscribers on IBM Docs services.
   *
   */
  private void initEntitlementsMBean()
  {
    try
    {
      MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
      ObjectName anON = new ObjectName("com.ibm.concord.platform.mbean:type=EntitlementsMgr");
      if (!mbServer.isRegistered(anON))
      {
        entitleMgrOI = mbServer.registerMBean(new EntitlementsMgr(), anON);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens while registering entitlements MBean.", e);
    }
  }

  /**
   * Unregister the MBean to manage the entitlements of subscribers on IBM Docs services.
   *
   */
  private void uninitEntitlementsMBean()
  {
    if (entitleMgrOI != null)
    {
      try
      {
        MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
        mbServer.unregisterMBean(entitleMgrOI.getObjectName());
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Error happens while unregistering entitlements MBean.", e);
      }
    }
  }

  /**
   *
   */
  private void initSharedStorage()
  {
    JSONObject config = Platform.getConcordConfig().getSubConfig("shared_storage");
    if (config != null)
    {
      SharedStorageMgr mgr = new SharedStorageMgr();
      String serverHost = config.containsKey("storage_server") ? (String) config.get("storage_server") : null;
      String sharedFrom = config.containsKey("shared_from") ? (String) config.get("shared_from") : null;
      String sharedTo = config.containsKey("shared_to") ? (String) config.get("shared_to") : null;
      int retry = config.containsKey("retry") ? Integer.valueOf((String) config.get("retry")).intValue() : -1;
      int timeo = config.containsKey("timeo") ? Integer.valueOf((String) config.get("timeo")).intValue() : -1;
      mgr.mount(serverHost, sharedFrom, sharedTo, retry, timeo);
    }
    else
    {
      LOG.log(Level.WARNING, "Setting for shared storage was not found, auto mount shared storage was skipped.");
    }
  }

  /**
   *
   */
  private void uninitSharedStorage()
  {
    SharedStorageMgr mgr = new SharedStorageMgr();
    mgr.umount("all");
  }

  private void initCustomerCredentialMBean()
  {
    try
    {
      MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
      ObjectName anON = new ObjectName("com.ibm.concord.platform.mbean:type=CustomerCredentialMgr");
      if (!mbServer.isRegistered(anON))
      {
        CustomerCredentialMgr ccMgr = new CustomerCredentialMgr();
        StandardMBean mbean = new StandardMBean(ccMgr, CustomerCredentialMBean.class, false);
        credentialMgrOI = mbServer.registerMBean(mbean, anON);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens while registering CustomerCredential MBean.", e);
    }
  }

  private void uninitCustomerCredentialMBean()
  {
    if (credentialMgrOI != null)
    {
      try
      {
        MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
        mbServer.unregisterMBean(credentialMgrOI.getObjectName());
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Error happens while unregistering CustomerCredential MBean.", e);
      }
    }
  }

  /**
   * Initialize server side components.
   */
  private void initComponents()
  {
    String filePath = WASConfigHelper.getDocsConfigPath() + File.separator + "concord-config.json";
    Components.initialize(filePath);
    Platform.getComponent(JournalComponentImpl.COMPONENT_ID).getService(IJournalAdapter.class);
    IComponent migrationCmp = Platform.getComponent(MigrationComponent.COMPONENT_ID);
    if (migrationCmp != null)
    {
      IMigrationService migrationService = (IMigrationService) migrationCmp.getService(IMigrationService.class);
    }
    // initialize repository at the very beginning incase the housekeeping ejb(CMP) try to initialize repository component which cause db
    // resource limitation
    // because 3rd party repository need get OAuth client id/secret from db
    Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(RepositoryProviderRegistry.class);
  }

  /**
   * Un-Initialize server side components.
   */
  private void uninitComponents()
  {
    ComponentRegistry.getInstance().destroy();
  }

  public void sessionCreated(HttpSessionEvent evt)
  {
    evt.getSession().setAttribute("secureToken", UUID.randomUUID().toString());
  }

  public void sessionDestroyed(HttpSessionEvent evt)
  {
  }

  /**
   * Define a task to touch the status file of the server to present the Docs application is available.
   *
   */
  class StatusFileTouchTask extends TimerTask
  {
    private File statusFile = null;

    public StatusFileTouchTask()
    {
      String sharedDataRoot = ConcordConfig.getInstance().getSharedDataRoot();
      String statusFilePath = sharedDataRoot + File.separator + "status" + File.separator + APP_STATUS_FILE;
      statusFile = new File(statusFilePath);
    }

    /*
     * (non-Javadoc)
     *
     * @see java.util.TimerTask#run()
     */
    public void run()
    {
      FileOutputStream fileStream = null;
      try
      {
        if (!statusFile.getParentFile().exists())
        {
          statusFile.getParentFile().mkdirs();
        }
        if (!statusFile.exists())
        {
          statusFile.createNewFile();
          LOG.log(Level.INFO, "Create the status file: " + statusFile.getAbsolutePath());
        }
        else
        {
          // Write a byte(48) into the status file to touch it.
          fileStream = new FileOutputStream(statusFile);
          fileStream.write(48);
          fileStream.flush();
        }
      }
      catch (Throwable ex)
      {
        ConcordLogger
            .log(
                LOG,
                Level.SEVERE,
                ConcordErrorCode.TOUCH_STATUS_FILE_ERROR,
                "Exception happens while try to touch the status file("
                    + statusFile.getAbsolutePath()
                    + "). Check the shared storage for Editor Server. If it is a mounted NFS/CIFS directory on Editor Server, make sure the mount is working properly.",
                ex);
      }
      finally
      {
        try
        {
          if (fileStream != null)
          {
            fileStream.close();
          }
        }
        catch (Throwable ex)
        {
          ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.TOUCH_STATUS_FILE_ERROR,
              "Exception happens while try to close the status file stream(" + statusFile.getAbsolutePath() + ")", ex);
        }
      }
    }
  }

  /**
   * Set threadPool for asyncServlet when application startup.
   *
   * @param servletContextEvent
   */
  private void initAsyncServletContext(ServletContextEvent servletContextEvent)
  {
    ThreadPoolExecutor executor = new ThreadPoolExecutor(INIT_CORE_POOL_SIZE, MAX_CORE_POOL_SIZE, ASYNC_SERVLET_TIME, TimeUnit.SECONDS,
        new ArrayBlockingQueue<Runnable>(INIT_CORE_POOL_SIZE));
    servletContextEvent.getServletContext().setAttribute("asyncExecutor", executor);
  }

  /**
   * Destroy threadPool for asyncServlet when application shutdown.
   *
   * @param servletContextEvent
   */
  private void uninitAsyncServletContext(ServletContextEvent servletContextEvent)
  {
    ThreadPoolExecutor executor = (ThreadPoolExecutor) servletContextEvent.getServletContext().getAttribute("asyncExecutor");
    executor.shutdown();
  }

  /**
   * Registe DomainListMrg MBean
   */
  private void initDomainListMBean()
  {
    try
    {
      MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
      ObjectName anON = new ObjectName("com.ibm.concord.platform.mbean:type=DomainListMrg");
      if (!mbServer.isRegistered(anON))
      {
        DomainListMgr ccMgr = new DomainListMgr();
        StandardMBean mbean = new StandardMBean(ccMgr, DomainListMgrMBean.class, false);
        domainListMgrOI = mbServer.registerMBean(mbean, anON);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens while registering DomainListMrg MBean.", e);
    }
  }

  /**
   * Unregiste DomainListMrg MBean
   */
  private void uninitDomainListMBean()
  {
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
  }
}
