/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.management.InstanceAlreadyExistsException;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanRegistrationException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.NotCompliantMBeanException;
import javax.management.ObjectInstance;
import javax.management.ObjectName;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import com.ibm.docs.common.util.WinRegistryUtil;
import com.ibm.conversion.service.mbean.SharedStorageMgr;
import com.ibm.conversion.service.mbean.StorageType;
import com.ibm.conversion.service.rest.servlet.util.WASConfigHelper;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.common.ErrCodeConstants;
import com.ibm.symphony.conversion.service.impl.ConversionConfig;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.ibm.websphere.management.AdminServiceFactory;
import com.ibm.websphere.runtime.ServerName;

public class PlatformInitializer implements ServletContextListener
{
  private static final Logger LOG = Logger.getLogger(PlatformInitializer.class.getName());

  private static final String INSTALL_ROOT_V = "CONVERSION_INSTALL_ROOT";

  private static final int LOG_ID = 1250;// 1250-1259

  private static final String[] STORAGE_UNIT_SET = { "Docs", "Viewer" };

  private static final String VIEWER_STORAGE_UNIT_KEY = "viewer";

  private static final String STORAGE_TYPE = "type";

  private static final String STORAGE_SERVER = "server";

  private static final String STORAGE_REMOTE_PATH = "from";

  private static final String STORAGE_LOCAL_PATH = "to";

  private static final String STORAGE_MAP_TIMEOUT = "timeo";

  private static final String STORAGE_MAP_RETRY_COUNT = "retry";

  private static String serverProcessId = null;

  private static String userInstallRoot = null;

  private static ObjectInstance sharedStorageOI = null;

  private static IConversionService conversionService = null;

  private static boolean isCloud = false;
  
  private static StorageType storageType = null;
  
  public static final String DOCS_CONFIG_JSON_SUB_DIR = "IBMDocs-config";

  public PlatformInitializer()
  {
    // TBD
  }

  public void contextDestroyed(ServletContextEvent arg0)
  {
    ServerMonitorHeartBeat.getInstance().cancel();
    TaskMapCleanHeartBeat.getInstance().cancel();
    UploadConvertJobHeartBeat.getInstance().cancel();
    CleanTempFilesHeartBeat.getInstance().cancel();

    File serverMonitorFile = ConversionWorkManager.getInstance().getServerMonitorFile();
    if (serverMonitorFile != null && serverMonitorFile.exists())
    {
      if (serverMonitorFile.delete())
      {
        ConversionLogger.log(LOG, Level.INFO, LOG_ID, "Delete the server monitor file: " + serverMonitorFile.getAbsolutePath());
      }
      else
      {
        ConversionLogger.log(LOG, Level.INFO, LOG_ID, "Fail to delete the server monitor file: " + serverMonitorFile.getAbsolutePath());
      }
    }

    uninitSharedStorage();
    uninitMBean4SharedStorage();
  }

  public void contextInitialized(ServletContextEvent evt)
  { 
    userInstallRoot = System.getenv("USER_INSTALL_ROOT");
    ConversionLogger.log(LOG, Level.INFO, LOG_ID + 1, "User install root path: " + userInstallRoot);
    LOG.log(Level.INFO, "Begin to initialize the AWT graphics environment");
    try
    {
      // Initializes the AWT graphics environment after Conversion application was started. This is a work around for problem(Defect is
      // 16876, it's
      // caused by a JDK bug): Static initialization causes threads dead lock between sun.awt.Win32GraphicsEnvironment and
      // sun.awt.windows.WToolkit.
      java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment();
    }
    catch (Throwable ex)
    {
      LOG.log(Level.WARNING, "Exception happens while initializing the AWT graphics environment", ex);
    }
    LOG.log(Level.INFO, "Initializes the AWT graphics environment successfully");

    try
    {
      // Now try to load configuration folder from WebSphere variable
      String installRoot = WASConfigHelper.getCellVariable(INSTALL_ROOT_V);
      String configFS = null;
      if (userInstallRoot != null)
      {
          String cellName = WASConfigHelper.getCellName();
          configFS = (new StringBuilder()).append(userInstallRoot).append(File.separator).append("config").append(File.separator)
          .append("cells").append(File.separator).append(cellName).append(File.separator).append(DOCS_CONFIG_JSON_SUB_DIR).toString();
          LOG.info("CONVERSION_CONFIG_PATH: " + configFS);
      }else if (installRoot!=null)
      {
        if ((!installRoot.endsWith("\\")) && (!installRoot.endsWith("/")))
          installRoot = installRoot + File.separator;
        configFS = (new StringBuilder()).append(installRoot).append(File.separator).append("config").toString();
      }
      
      if (configFS!=null)        
        ConversionConfig.getInstance().load(configFS);
      
      conversionService = ConversionService.getInstance();
      if (conversionService != null)
      {
        // set software mode
        String softwareMode = (String) conversionService.getConfig("software_mode");
        if (softwareMode != null && softwareMode.trim().equalsIgnoreCase("sc"))
        {
          isCloud = true;
        }
        ConversionLogger.log(LOG, Level.INFO, LOG_ID, "Load conversion configurations successfully.");
      }
    }
    catch (Exception e)
    {
      ConversionLogger.log(LOG, Level.SEVERE, ErrCodeConstants.CONVERSION_SERVICE_MISSING_ERR, "Can't get conversion service.", e);
    }

    // start clean temp files heart beat
    CleanTempFilesHeartBeat.getInstance().start(conversionService);

    initSharedStorage();
    if(!isCloud)
    {
      WinRegistryUtil.initCiftsRegistries();
    }
    initMBean4SharedStorage();
  }

  public static String getServerProcessId()
  {
    if (serverProcessId == null)
    {
      String pIdFilePath = userInstallRoot + File.separator + "logs" + File.separator + ServerName.getDisplayName() + File.separator
          + ServerName.getDisplayName() + ".pid";
      File pIdFile = new File(pIdFilePath);
      // the process id file may be created in the later phase of the server starting.
      if (pIdFile.exists())
      {
        BufferedReader br = null;
        try
        {
          br = new BufferedReader(new FileReader(pIdFile));
          serverProcessId = br.readLine();
          ConversionLogger.log(LOG, Level.INFO, LOG_ID + 2, "Conversion server process id : " + serverProcessId);
        }
        catch (FileNotFoundException e)
        {
          ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_SERVER_PROCESSID_READ_ERR,
              "can not find conversion server process id file: " + pIdFilePath);
        }
        catch (IOException e)
        {
          ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_SERVER_PROCESSID_READ_ERR,
              "Clustor node monitor will fail because of IOException when reading conversion server process id file: " + pIdFilePath);
        }
        finally
        {
          if (br != null)
          {
            try
            {
              br.close();
            }
            catch (IOException e)
            {
              ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_FILESTREAM_CLOSE_ERR,
                  "Fail to close conversion server process id file stream : " + pIdFilePath);
            }
          }
        }
      }
      else
      {
        ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_SERVER_PROCESSID_READ_ERR,
            "Cluster node monitor will fail becasue conversion server process id  file does not exist: " + pIdFilePath);
      }
    }
    return serverProcessId;
  }

  public static String getUserInstallRoot()
  {
    return userInstallRoot;
  }

  private void initMBean4SharedStorage()
  {
    MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
    try
    {
      ObjectName anON = new ObjectName("com.ibm.conversion.service.mbean:type=SharedStorageMgr");
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
   * 
   */
  private void initSharedStorage()
  {
    if (conversionService != null)
    {
      Map config = (Map) conversionService.getConfig("shared_storage");
      if (config != null)
      {
        SharedStorageMgr mgr = new SharedStorageMgr();
        for (String unit : STORAGE_UNIT_SET)
        {
          String unitKey = unit.toLowerCase();
          Map unitConfig = config.containsKey(unitKey) ? (Map) config.get(unitKey) : null;
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
            if (type != null && host != null && from != null && to != null)
            {
              storageType = StorageType.valueOf(type.trim().toUpperCase());
              if (storageType == StorageType.NFS || storageType == StorageType.NFS4 || storageType == StorageType.GLUSTER)
              {
                if (isCloud)
                {
                  mgr.mount(host, from, to, retry, timeout, storageType);
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
              else if (storageType == StorageType.CIFS && VIEWER_STORAGE_UNIT_KEY.equalsIgnoreCase(unitKey))
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
    else
    {
      LOG.log(Level.WARNING, "The conversion config was not initialized, auto mount shared storage was skipped.");
    }
  }

  /**
   * 
   */
  private void uninitSharedStorage()
  {
    if (isCloud)
    {
      SharedStorageMgr mgr = new SharedStorageMgr();
      mgr.umount("all", storageType);
    }
  }
}
