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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FilenameFilter;
import java.io.IOException;
import java.math.BigInteger;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Set;
import java.util.TimeZone;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.abdera.model.AtomDate;
import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.spi.impl.HashRule;
import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.config.ConfigConstants.CacheType;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.RepositoryComponent;
import com.ibm.concord.viewer.platform.repository.RepositoryProviderRegistry;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.docs.viewer.ecm.repository.ECMRepository;
import com.ibm.json.java.JSONObject;

public class HouseKeepingBean
{
  private static final Logger LOG = Logger.getLogger(HouseKeepingBean.class.getName());

  // private static int oldVersionAgeThreshold;

  private static int renditionAgeThreshold;

  private static int mailAttachmentThreshold;

  private static int thumbnailSrvAgeThreshold;

  private static Float cacheSizeThreshold;

  private static CacheTimerListener cacheTimerListener;

  private static String frequency;

  private int previousCopyCount = 0;

  private int validCacheCount = 0;

  private int successUploadCount = 0;

  private int failedUploadCount = 0;

  private HashMap<String, Integer> mimeCounterMap;

  private ECMRepository ecmAdapter;

  private String sharedRoot;

  private static final int DIRECTORYLAYER = 3;

  private final static Long MILLISECOND_TO_HOUR = (long) (60 * 60 * 1000);

  private static final String RESULTS = "result.json";

  private static final Object PICTURES = "pictures";

  private static final Object ISSUCCESS = "isSuccess";

  private static final String META = "meta.json";

  private static HashMap<String, Calendar> cacheBuildTimeMap = new HashMap<String, Calendar>();

  private static HashMap<String, String> cachePathMap = new HashMap<String, String>();

  private static HouseKeepingBean houseKeepingBean = new HouseKeepingBean(); // singleton

  public static long HOUSEKEEPING_FAILOVER_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

  public static String HOUSEKEEPING_FILENAME = "HouseKeeping";

  public static String HOUSEKEEPINGLASTOPERATION_FILENAME = "HouseKeepingLastOperation";

  public static long HOUSEKEEPING_LASTOPERATION_INTERVAL = 24 * 60 * 60 * 1000; // 1 day

  private static final int DEFAULT_HOUSEKEEPING_STALE_AGE = 7;

  private static int HOUSEKEEPING_STALE_AGE = DEFAULT_HOUSEKEEPING_STALE_AGE;

  private static int HOUSEKEEPING_STALE_AGE_LOCAL = DEFAULT_HOUSEKEEPING_STALE_AGE;

  private static final float HOUSEKEEPING_TARGET_CLEAN_THRESHOLD = 0.7f;

  private static final int UPDATE_LOCK_FILE_THRESHOLD = 1000; // update lockfile modified time after clean 100 caches.

  private static final int SLEEP_INTERVAL = 20; // 20ms interval

  private static final int HK_FILES_INTERVAL = 300; // check 300 file caches per loop

  private HouseKeepingBean()
  {
    // private constructor
  }

  public static HouseKeepingBean getHouseKeepingBean()
  {
    return houseKeepingBean;
  }

  /**
   * Description The configuration files for initialization.
   */
  public void initConfig()
  {
    {
      if (Platform.getViewerConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.MAILATTACHMENT_AGE_THRESHOLD_KEY) == null)
      {
        mailAttachmentThreshold = 5;
        LOG.log(
            Level.INFO,
            new StringBuffer(getInfoPrefix()).append(
                "\"age_threshold_of_mail_attachment\" settings for \"House_Keeping\" was not found, \"5\" days as default.").toString());
      }
      else
      {
        try
        {
          mailAttachmentThreshold = Integer.parseInt((String) Platform.getViewerConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
              .get(ConfigConstants.MAILATTACHMENT_AGE_THRESHOLD_KEY));
          if (mailAttachmentThreshold < 0)
          {
            mailAttachmentThreshold = 5;
            LOG.log(
                Level.INFO,
                new StringBuffer(getInfoPrefix()).append(
                    "\"age_threshold_of_mail_attachment\" settings for \"House_Keeping\" was illegal, \"5\" days as default.").toString());
          }
          else
          {
            LOG.log(
                Level.INFO,
                new StringBuffer(getInfoPrefix()).append(
                    "\"age_threshold_of_mail_attachment\" settings for \"House_Keeping\" found: " + mailAttachmentThreshold).toString());
          }
        }
        catch (Exception e)
        {
          mailAttachmentThreshold = 5;
          LOG.log(
              Level.INFO,
              new StringBuffer(getInfoPrefix()).append(
                  "\"age_threshold_of_mail_attachment\" settings for \"House_Keeping\" was illegal, \"5\" days as default.").toString());
        }
      }
      // stale age must less than threshold
      if (mailAttachmentThreshold < DEFAULT_HOUSEKEEPING_STALE_AGE)
      {
        HOUSEKEEPING_STALE_AGE_LOCAL = mailAttachmentThreshold;
      }
    }

    {
      if (Platform.getViewerConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.RENDITION_AGE_THRESHOLD_KEY) == null)
      {
        renditionAgeThreshold = 10;
        LOG.log(
            Level.INFO,
            new StringBuffer(getInfoPrefix()).append(
                "\"age_threshold_of_rendition\" settings for \"House_Keeping\" was not found, \"10\" days as default.").toString());
      }
      else
      {
        try
        {
          renditionAgeThreshold = Integer.parseInt((String) Platform.getViewerConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
              .get(ConfigConstants.RENDITION_AGE_THRESHOLD_KEY));

          if (renditionAgeThreshold < 0)
          {
            renditionAgeThreshold = 10;
            LOG.log(
                Level.INFO,
                new StringBuffer(getInfoPrefix()).append(
                    "\"age_threshold_of_rendition_latest_version\" settings for \"House_Keeping\" was illegal, \"10\" days as default.")
                    .toString());
          }
          else
          {
            LOG.log(
                Level.INFO,
                new StringBuffer(getInfoPrefix()).append(
                    "\"age_threshold_of_rendition_latest_version\" settings for \"House_Keeping\" found: " + renditionAgeThreshold)
                    .toString());
          }
        }
        catch (Exception e)
        {
          renditionAgeThreshold = 10;
          LOG.log(
              Level.INFO,
              new StringBuffer(getInfoPrefix()).append(
                  "\"age_threshold_of_rendition_latest_version\" settings for \"House_Keeping\" was illegal, \"10\" days as default.")
                  .toString());
        }
      }
      // stale age must less than threshold
      if (renditionAgeThreshold < DEFAULT_HOUSEKEEPING_STALE_AGE)
      {
        HOUSEKEEPING_STALE_AGE = renditionAgeThreshold;
      }
    }

    {
      if (Platform.getViewerConfig().getSubConfig(ConfigConstants.THUMBNAILS_KEY).get(ConfigConstants.THUMBNAILSRV_AGE_THRESHOLD_KEY) == null)
      {
        thumbnailSrvAgeThreshold = 1;
        LOG.log(
            Level.INFO,
            new StringBuffer(getInfoPrefix()).append(
                "\"age_threshold_of_thumbnailSrv\" settings for \"House_Keeping\" was not found, \"1\" hour as default.").toString());
      }
      else
      {
        try
        {
          thumbnailSrvAgeThreshold = Integer.parseInt((String) Platform.getViewerConfig().getSubConfig(ConfigConstants.THUMBNAILS_KEY)
              .get(ConfigConstants.THUMBNAILSRV_AGE_THRESHOLD_KEY));

          if (thumbnailSrvAgeThreshold < 0)
          {
            thumbnailSrvAgeThreshold = 1;
            LOG.log(
                Level.INFO,
                new StringBuffer(getInfoPrefix()).append(
                    "\"age_threshold_of_thumbnailSrv\" settings for \"House_Keeping\" was illegal, \"1\" hour as default.").toString());
          }
          else
          {
            LOG.log(
                Level.INFO,
                new StringBuffer(getInfoPrefix()).append(
                    "\"age_threshold_of_thumbnailSrv\" settings for \"House_Keeping\" found: " + thumbnailSrvAgeThreshold).toString());
          }
        }
        catch (Exception e)
        {
          thumbnailSrvAgeThreshold = 1;
          LOG.log(
              Level.INFO,
              new StringBuffer(getInfoPrefix()).append(
                  "\"age_threshold_of_thumbnailSrv\" settings for \"House_Keeping\" was illegal, \"1\" hour as default.").toString());
        }
      }
    }

    {
      if (Platform.getViewerConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.CACHE_SIZE_THRESHOLD_KEY) == null)
      {
        cacheSizeThreshold = 256f;
        LOG.log(
            Level.INFO,
            new StringBuffer(getInfoPrefix()).append(
                "\"size_threshold_of_rendition_cache\" settings for \"House_Keeping\" was not found, \"256\" GBs as default.").toString());
      }
      else
      {
        try
        {
          cacheSizeThreshold = Float.parseFloat((String) Platform.getViewerConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
              .get(ConfigConstants.CACHE_SIZE_THRESHOLD_KEY));

          if (cacheSizeThreshold.compareTo(new Float(0)) > 0 && cacheSizeThreshold.compareTo(new Float(1)) < 0)
          {
            LOG.log(
                Level.INFO,
                new StringBuffer(getInfoPrefix()).append(
                    "\"size_threshold_of_rendition_cache\" settings for \"House_Keeping\" found (RATIO): " + cacheSizeThreshold).toString());
          }
          else
          {
            if (cacheSizeThreshold < new Float(16))
            {
              cacheSizeThreshold = 256f;
              LOG.log(
                  Level.INFO,
                  new StringBuffer(getInfoPrefix()).append(
                      "\"size_threshold_of_rendition_cache\" settings for \"House_Keeping\" was illegal, \"256\" GBs as default.")
                      .toString());
            }
            else
            {
              LOG.log(
                  Level.INFO,
                  new StringBuffer(getInfoPrefix()).append(
                      "\"size_threshold_of_rendition_cache\" settings for \"House_Keeping\" found: " + cacheSizeThreshold).toString());

              if (cacheSizeThreshold < new Float(64))
              {
                LOG.log(
                    Level.WARNING,
                    new StringBuffer(getWarningPrefix()).append(
                        "\"size_threshold_of_rendition_cache\" settings is recommended to be any number between [64, ~].").toString());
              }
            }
          }
        }
        catch (Exception e)
        {
          cacheSizeThreshold = 256f;
          LOG.log(
              Level.INFO,
              new StringBuffer(getInfoPrefix()).append(
                  "\"size_threshold_of_rendition_cache\" settings for \"House_Keeping\" was illegal, \"256\" GBs as default.").toString());
        }
      }
    }

    LOG.log(Level.FINE, new StringBuffer(getInfoPrefix()).append("Reading HouseKeeping config successfully.").toString());
  }

  /**
   * Description Initialize listener.
   */
  public void initListeners()
  {
    LOG.log(Level.FINE, "HouseKeeping start initialization");
    {
      try
      {
        if (Platform.getViewerConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.CACHE_FREQUENCY_KEY) == null)
        {
          frequency = "weekly";
          LOG.log(
              Level.INFO,
              new StringBuffer(getInfoPrefix()).append(
                  "\"frequency\" settings for \"House_Keeping\" was not found, \"weekly\" days as default.").toString());
        }
        else
        {
          frequency = (String) Platform.getViewerConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
              .get(ConfigConstants.CACHE_FREQUENCY_KEY);
          if (!validateFrequency(frequency))
          {
            frequency = "weekly";
            LOG.log(
                Level.INFO,
                new StringBuffer(getInfoPrefix()).append(
                    "\"frequency\" settings for \"House_Keeping\" was illegal, \"weekly\" days as default.").toString());
          }
          else
          {
            LOG.log(Level.INFO, new StringBuffer(getInfoPrefix())
                .append("\"frequency\" settings for \"House_Keeping\" found: " + frequency).toString());
          }
        }
      }
      catch (Exception e)
      {
        frequency = "weekly";
        LOG.log(Level.INFO, "\"frequency\" settings for \"House_Keeping\" was illegal, \"weekly\" days as default.");
      }
    }

    int interval = 7 * 24;// default weekly

    boolean isExecution = false; // mark whether immediate execution
    if ("now".equalsIgnoreCase(frequency))
    {
      isExecution = true;
    }
    else if ("hourly".equalsIgnoreCase(frequency))
    {
      interval = 1;
    }
    else if ("daily".equalsIgnoreCase(frequency))
    {
      interval = 24;
    }
    else if ("weekly".equalsIgnoreCase(frequency))
    {
      interval = 7 * 24;
    }
    else if ("monthly".equalsIgnoreCase(frequency))
    {
      interval = 7 * 24 * 30;
    }

    if (cacheTimerListener != null)
    {
      cacheTimerListener.setExecution(isExecution ? true : false);
    }
    else
    {
      cacheTimerListener = new CacheTimerListener(isExecution ? true : false);
    }

    HouseKeepingInitializer.getHouseKeepingInitializer().getTimerManager().schedule(cacheTimerListener, 0, interval * MILLISECOND_TO_HOUR);

    LOG.log(Level.FINE, "HouseKeeping initialization end.");
  }

  private boolean isHKStale(String rootFolder, int age)
  {
    LOG.entering(HouseKeepingBean.class.getName(), "isHKStale");
    File houseKeepingLastOperation = new File(new File(rootFolder), HOUSEKEEPINGLASTOPERATION_FILENAME);
    boolean isStale = true;
    if (houseKeepingLastOperation.exists())
    {
      // files older than 14 days should be removed. This setting is 7 + age threshold now.
      isStale = System.currentTimeMillis() - houseKeepingLastOperation.lastModified() > age * HOUSEKEEPING_LASTOPERATION_INTERVAL;
    }
    if (!isStale && Platform.getViewerConfig().isSmartCloud()) // Within 7 days from last HK operation
    {
      // If now is NY Sunday 0:00 - 1:00, HK job will start.
      TimeZone zone = TimeZone.getDefault();
      zone.setID("America/New_York");
      Calendar cal = Calendar.getInstance(zone);
      int hour = cal.get(Calendar.HOUR_OF_DAY);
      int day = cal.get(Calendar.DAY_OF_WEEK);
      if (day == Calendar.SUNDAY && hour == 0)
      {
        isStale = true;
      }
    }
    if (isStale)
    {
      LOG.log(Level.FINE, "The last operation of houseKeeping is stale. Run housekeeping now");
    }
    else
    {
      LOG.log(Level.FINE,
          "The last operation of houseKeeping is fresh. Housekeeping will be ignored this time if the disk usage is under limitation.");
    }

    LOG.exiting(HouseKeepingBean.class.getName(), "isHKStale");
    return isStale;
  }

  private void markHKTime(String rootFolder)
  {
    LOG.entering(HouseKeepingBean.class.getName(), "markHKTime");
    File houseKeepingLastOperation = new File(new File(rootFolder), HOUSEKEEPINGLASTOPERATION_FILENAME);
    try
    {
      if (!houseKeepingLastOperation.createNewFile())
      {
        houseKeepingLastOperation.setLastModified(System.currentTimeMillis());
        LOG.log(Level.FINE, "HouseKeeping check file exists.");
      }
      else
      {
        LOG.log(Level.FINE, "Create HouseKeeping check file successfully.");
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, new StringBuffer(getWarningPrefix()).append("HouseKeeping status file cannot be created.").toString());
    }
    finally
    {
      LOG.exiting(HouseKeepingBean.class.getName(), "markHKTime");
    }
    return;
  }

  private boolean isDiskFull(String rootFolder, float ratio)
  {
    LOG.entering(HouseKeepingBean.class.getName(), "isDiskFull");
    File cacheHome = new File(rootFolder);
    if (!cacheHome.exists())
    {
      return false;
    }

    BigInteger totalSize = BigInteger.valueOf(0);
    BigInteger quotaSize = BigInteger.valueOf(0);

    float currentCacheSizeThreshold = cacheSizeThreshold * ratio;
    if ((int) currentCacheSizeThreshold > 0)
    {
      quotaSize = BigInteger.valueOf((int) currentCacheSizeThreshold);
      quotaSize = quotaSize.multiply(BigInteger.valueOf(1024 * 1024 * 1024));
    }

    boolean isFull = false;
    if ((int) currentCacheSizeThreshold == 0)
    {
      Float usageRatio = 1.0f - ((float) cacheHome.getUsableSpace()) / cacheHome.getTotalSpace();
      LOG.log(Level.INFO, "Usable space: {0}, Total space: {1}.", new Object[] { cacheHome.getUsableSpace(), cacheHome.getTotalSpace() });
      if (usageRatio.compareTo(currentCacheSizeThreshold) > 0)
      {
        isFull = true;
        LOG.log(
            Level.INFO,
            new StringBuffer(getInfoPrefix()).append("Cache Size Calculation: volumn usage is ").append(usageRatio.toString())
                .append(", quota usage is ").append(String.valueOf(currentCacheSizeThreshold)).append(".  Start to do further cleaning.")
                .toString());
      }
    }
    else
    {
      long usedSpace = cacheHome.getTotalSpace() - cacheHome.getUsableSpace();
      totalSize = totalSize.add(BigInteger.valueOf(usedSpace));
      LOG.log(Level.INFO, "Used space: {0}.  Quota size: {1}.", new Object[] { usedSpace, quotaSize });
      if (totalSize.compareTo(quotaSize) > 0)
      {
        isFull = true;
        LOG.log(
            Level.INFO,
            new StringBuffer(getInfoPrefix()).append("Cache Size Calculation: volumn used bytes is ").append(totalSize.toString())
                .append(", quota bytes is ").append(quotaSize).append(".  Start to do further cleaning.").toString());
      }
    }

    LOG.exiting(HouseKeepingBean.class.getName(), "isDiskFull");
    return isFull;
  }

  private boolean isDiskFull(String rootFolder)
  {
    return isDiskFull(rootFolder, 1.0f);
  }

  /*
   * Main entry api for housekeeping
   */
  private boolean HK_RUNING = false;

  private void updateLockFile(String path)
  {
    if (path != null && path.length() > 0 && (new File(path).exists()))
    {
      File localHouseKeepingLock = new File(new File(path), HOUSEKEEPING_FILENAME);
      if (localHouseKeepingLock.exists())
      {
        localHouseKeepingLock.setLastModified(new Date().getTime());
      }
    }
  }

  public void processCacheAndThumbnails()
  {
    LOG.entering(HouseKeepingBean.class.getName(), "processCacheAndThumbnails");

    if (HK_RUNING)
    {
      return; // HK is still running
    }
    synchronized (houseKeepingBean)
    {
      HK_RUNING = true;
    }

    try
    {
      String localCache = ViewerConfig.getInstance().getDataRoot(CacheType.LOCAL);
      if (localCache != null && localCache.length() > 0)
      {
        LOG.log(Level.INFO, "Execute HK on local cache.");
        executeHKOnCache(localCache, false, HOUSEKEEPING_STALE_AGE_LOCAL, mailAttachmentThreshold, (int) (mailAttachmentThreshold * 0.1));
      }

      String sharedCache = ViewerConfig.getInstance().getDataRoot(CacheType.NFS);
      if (sharedCache != null && sharedCache.length() > 0)
      {
        LOG.log(Level.INFO, "Execute HK on shared cache.");
        executeHKOnCache(sharedCache, true, HOUSEKEEPING_STALE_AGE, renditionAgeThreshold, (int) (renditionAgeThreshold * 0.1));
      }

      // reset frequency from now to default weekly after triggered once
      if ("now".equalsIgnoreCase(frequency))
      {
        frequency = "weekly";
      }
    }
    finally
    {
      synchronized (houseKeepingBean)
      {
        HK_RUNING = false;
      }
    }

    LOG.exiting(HouseKeepingBean.class.getName(), "processCacheAndThumbnails");
  }

  private void executeHKOnCache(String cacheRoot, boolean bCleanThumbnail, int hk_stale_age, int ageThreshhold, int base_ageThreshhold)
  {

    boolean isExecuteNow = "now".equalsIgnoreCase(frequency);

    if (!cacheRoot.isEmpty() && (isExecuteNow || isHKStale(cacheRoot, hk_stale_age) || isDiskFull(cacheRoot)))
    {
      LOG.log(Level.INFO, "Start HK on " + cacheRoot);
      // Step1. Clean LCFileThumbnails
      if (bCleanThumbnail)
      {
        processLCFilesThumbnails(cacheRoot);
      }
      // Step2. Create the lock file and prepare map, and clean preview folder
      if (!preProcessCache(cacheRoot))
      {
        return;
      }
      // Step3. Clean cache while it exceeds cachesizethreshold.
      processCache(cacheRoot, ageThreshhold);
      // Step4. If on acnode HK was called from WAS console,or it exceeds cachesizethreshold on non-acNode, execute the further clean
      if (isExecuteNow || isDiskFull(cacheRoot))// Call HK by WAS console on ACViewer node
      {
        // Target is to low the disk usage under cacheSizeThreshold*HOUSEKEEPING_TARGET_CLEAN_THRESHOLD
        // step value for each loop
        int step_age = base_ageThreshhold > 0 ? base_ageThreshhold : 1;
        while (isDiskFull(cacheRoot, HOUSEKEEPING_TARGET_CLEAN_THRESHOLD))
        {
          if (ageThreshhold <= base_ageThreshhold)
            break; // nothing to do
          ageThreshhold = (ageThreshhold - step_age) < base_ageThreshhold ? base_ageThreshhold : ageThreshhold - step_age;
          processCache(cacheRoot, ageThreshhold);
          try
          {
            Thread.sleep(3 * 1000); // 10s as interval
          }
          catch (Exception e)
          {
          }
        }
      }
      // Step5. Remove the lock file and MM.
      postProcessCache(cacheRoot);
      LOG.log(Level.INFO, "Finish HK on " + cacheRoot);
    }
  }

  public void processLCFilesThumbnails(String cacheRoot)
  {
    LOG.entering(HouseKeepingBean.class.getName(), "processThumbnails");
    File cacheHome = new File(cacheRoot, "preview");
    if (!cacheHome.exists())
    {
      return;
    }

    File houseKeepingLock = new File(cacheHome, HOUSEKEEPING_FILENAME);
    if (houseKeepingLock.exists())
    {
      boolean isFailover = new Date().getTime() - houseKeepingLock.lastModified() > HOUSEKEEPING_FAILOVER_INTERVAL;
      if (isFailover)
      {
        houseKeepingLock.delete();
        LOG.log(
            Level.WARNING,
            new StringBuffer(getWarningPrefix()).append(
                "Thumbnails HouseKeeping failover occurred, and the time is passed 4 hours, will run housekeeping now.").toString());
      }
      else
      {
        LOG.log(Level.FINE, "Thumbnails HouseKeeping is running on another node, this time will be ignored.");
        LOG.exiting(HouseKeepingBean.class.getName(), "processCache");
        return;
      }
    }
    try
    {
      if (!houseKeepingLock.createNewFile())
      {
        LOG.log(Level.FINE, "Create Thumbnails HouseKeeping file failed because HouseKeeping is already running in another node.");
        LOG.exiting(HouseKeepingBean.class.getName(), "processCache");
        return;
      }
    }
    catch (IOException e)
    {
      LOG.log(
          Level.WARNING,
          new StringBuffer(getWarningPrefix()).append(
              "Thumbnails HouseKeeping status file cannot be created, HouseKeeping will be ignored this time.").toString());
      LOG.exiting(HouseKeepingBean.class.getName(), "processCache");
      return;
    }

    int removeCounter = 0;
    int validCounter = 0;
    File[] primaryHashHomes = cacheHome.listFiles();
    if (primaryHashHomes == null) // To improve the robustness of the code
    {
      LOG.log(Level.SEVERE, "Can not list the first hash folders on NFS server!");
      return;
    }
    for (File primaryHashHome : primaryHashHomes)
    {
      int primaryHash = HashRule.validateHash(primaryHashHome.getName());
      if (primaryHash >= 0 && primaryHash <= JobUtil.PRIMARY_MAX_SLOT && primaryHashHome.isDirectory())
      {
        File[] secondaryHashHomes = primaryHashHome.listFiles();
        if (secondaryHashHomes != null) // To improve the robustness of the code
        {
          for (File secondaryHashHome : secondaryHashHomes)
          {
            int secondaryHash = HashRule.validateHash(secondaryHashHome.getName());
            if (secondaryHash >= 0 && secondaryHash <= JobUtil.SECONDARY_MAX_SLOT && secondaryHashHome.isDirectory())
            {
              File[] docCacheHomes = secondaryHashHome.listFiles();
              if (docCacheHomes != null) // To improve the robustness of the code, docCacheHomes may be null
              {
                for (File docCacheHome : docCacheHomes)
                {
                  File[] lastModifiedHomes = docCacheHome.listFiles();
                  if (lastModifiedHomes != null) // To improve the robustness of the code, lastModifiedHomes may be null
                  {
                    validCounter += lastModifiedHomes.length;
                    if (lastModifiedHomes.length > 1)
                    {
                      File latestFile = lastModifiedHomes[0];
                      Calendar latest = Calendar.getInstance();
                      latest.setTimeInMillis(Long.parseLong(lastModifiedHomes[0].getName()));
                      for (int i = 1; i < lastModifiedHomes.length; i++)
                      {
                        File outdatedCache;
                        Calendar temp = Calendar.getInstance();
                        temp.setTimeInMillis(Long.parseLong(lastModifiedHomes[i].getName()));
                        if (temp.before(latest))
                        {
                          outdatedCache = lastModifiedHomes[i];
                        }
                        else
                        {
                          outdatedCache = latestFile;
                          latest = temp;
                          latestFile = lastModifiedHomes[i];
                        }
                        try
                        {
                          FileUtil.removeDirectory(outdatedCache);
                          removeCounter++;
                          LOG.log(Level.FINE, "Thumbnails in " + outdatedCache.getPath() + " was cleaned by house keeping routine.");
                        }
                        catch (Exception e)
                        {
                          LOG.log(Level.WARNING, "Cache in " + outdatedCache.getPath() + " was not cleaned by house keeping routine.");
                        }
                      }
                    }
                    if (docCacheHome.list().length == 0)
                    {
                      docCacheHome.delete();
                    }
                  }
                }
              }
              if (secondaryHashHome.list().length == 0)
              {
                secondaryHashHome.delete();
              }
            }
          }
        }
        if (primaryHashHome.list().length == 0)
        {
          primaryHashHome.delete();
        }
      }
    }

    houseKeepingLock.delete();
    LOG.log(Level.INFO, new StringBuffer(getInfoPrefix()).append("Cleaning the old cache of \"thumbnails\" is finished.  Total removed ")
        .append(removeCounter).append(" caches. Current remain ").append(validCounter - removeCounter).append(" caches.").toString());
    LOG.exiting(HouseKeepingBean.class.getName(), "processThumbnails");
  }

  private boolean preProcessCache(String cacheRoot)
  {
    LOG.entering(HouseKeepingBean.class.getName(), "prepareProcessCache");
    File houseKeepingLock = new File(new File(cacheRoot), HOUSEKEEPING_FILENAME);
    if (houseKeepingLock.exists())
    {
      boolean isFailover = new Date().getTime() - houseKeepingLock.lastModified() > HOUSEKEEPING_FAILOVER_INTERVAL;
      if (isFailover)
      {
        houseKeepingLock.delete();
        LOG.log(
            Level.WARNING,
            new StringBuffer(getWarningPrefix()).append(
                "HouseKeeping failover occurred, and the time is passed 4 hours, will run housekeeping now.").toString());
      }
      else
      {
        LOG.log(Level.FINE, "HouseKeeping is running on another node, this time will be ignored.");
        LOG.exiting(HouseKeepingBean.class.getName(), "processCache");
        return false;
      }
    }
    try
    {
      if (!houseKeepingLock.createNewFile())
      {
        LOG.log(Level.FINE, "Create HouseKeeping file failed because HouseKeeping is already running in another node.");
        LOG.exiting(HouseKeepingBean.class.getName(), "processCache");
        return false;
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING,
          new StringBuffer(getWarningPrefix())
              .append("HouseKeeping status file cannot be created, HouseKeeping will be ignored this time.").toString());
      LOG.exiting(HouseKeepingBean.class.getName(), "processCache");
      return false;
    }

    cacheBuildTimeMap = new HashMap<String, Calendar>();
    cachePathMap = new HashMap<String, String>();

    initMimeType();
    File cacheHome = new File(cacheRoot);
    File[] orgHome = cacheHome.listFiles();
    if (orgHome == null) // To improve the robustness of the code
    {
      LOG.log(Level.SEVERE, "No organizations available!");
      return false;
    }

    for (int i = 0; i < orgHome.length; i++)
    {
      previousCopyCount = 0;
      validCacheCount = 0;
      successUploadCount = 0;
      failedUploadCount = 0;

      File orgCacheHome = orgHome[i];

      if (!orgCacheHome.isDirectory())
      {
        continue;
      }

      String dir = orgCacheHome.getName();
      if (RepositoryServiceUtil.isFilesThumbnailsTempDirectory(dir)) // cache under {$shared_root}/preview/
      {
        cleanPreviewFolder(orgCacheHome);
      }
      else if (!RepositoryServiceUtil.isCCMThumbnailsDirectory(dir))
      {
        /**
         * clean third party repo cache
         */
        String repoType = RepositoryServiceUtil.getRepoTypeFromId(dir);
        if (RepositoryServiceUtil.EXTERNAL_REST_REPO_TYPE.equals(repoType))
        {
          File[] orgCacheHomeArray = orgCacheHome.listFiles();
          if (orgCacheHomeArray != null) // To improve the robustness of the code
          {
            for (File orgCacheHomeFile : orgCacheHomeArray)
            {
              if (!orgCacheHomeFile.isDirectory())
              {
                continue;
              }
              cleanCacheFolders(orgCacheHomeFile);
            }
          }
        }
        else
        {
          cleanCacheFolders(orgCacheHome);
        }
      }
    }
    LOG.exiting(HouseKeepingBean.class.getName(), "prepareProcessCache");
    return true;
  }

  public void processCache(String cacheRoot, int ageThreshold)
  {
    LOG.entering(HouseKeepingBean.class.getName(), "processCache");
    File cacheHome = new File(cacheRoot);
    {
      long removeCounter = 0, counter = 0;
      long cleanStart = System.currentTimeMillis();
      Set<String> caches = cacheBuildTimeMap.keySet();
      Iterator<String> keys = caches.iterator();
      boolean ecmEnabled = ViewerConfig.getInstance().getHouseKeepingEnableECM();
      if (ecmEnabled && ecmAdapter == null)
      {
        RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
            .getService(RepositoryServiceUtil.ECM_FILES_REPO_ID);
        ecmAdapter = (ECMRepository) service.getRepository(RepositoryServiceUtil.ECM_FILES_REPO_ID);
      }
      while (keys.hasNext())
      {
        String cacheId = keys.next();
        boolean isDeleted = false;
        File cacheInstHome = new File(cachePathMap.get(cacheId));
        if (ecmEnabled && RepositoryServiceUtil.isCCMRepoDoc(cacheId))
        {
          if (processCCMCacheInstance(cacheId, cacheInstHome))
          {
            isDeleted = true;
          }
        }
        else if (processCacheInstance(cacheInstHome, Calendar.DATE, ageThreshold))
        {
          isDeleted = true;
        }

        if (isDeleted)
        {
          cachePathMap.remove(cacheId);
          keys.remove();
          removeCounter++;
          removeCacheInstanceParentDirectory(cacheInstHome);
          if ((removeCounter + 1) % UPDATE_LOCK_FILE_THRESHOLD == 0)
          {
            updateLockFile(cacheRoot);
          }
        }
        counter++;
        if (0 == counter % HK_FILES_INTERVAL)
        {
          try
          {
            Thread.sleep(SLEEP_INTERVAL);
          }
          catch (Exception e)
          {
            LOG.warning("HK is interrupted.");
          }
        }
      }
      long cleanEnd = System.currentTimeMillis();

      String status;
      if (cacheSizeThreshold.intValue() == 0)
      {
        Float usageRatio = 1.0f - ((float) cacheHome.getUsableSpace()) / cacheHome.getTotalSpace();
        status = "Current usage is " + usageRatio.toString();
      }
      else
      {
        long usedSpace = cacheHome.getTotalSpace() - cacheHome.getUsableSpace();
        status = "Current used bytes is " + usedSpace;
      }

      LOG.log(Level.INFO,
          new StringBuffer(getInfoPrefix()).append("Further cleaning is finished. ").append(removeCounter).append(" caches are removed. ")
              .append(cleanEnd - cleanStart).append("ms is spent on deleting the cache. ").append(status).toString());
    }

    LOG.exiting(HouseKeepingBean.class.getName(), "processCache");
  }

  private void postProcessCache(String cacheRoot)
  {
    LOG.entering(HouseKeepingBean.class.getName(), "postProcessCache");
    File houseKeepingLock = new File(new File(cacheRoot), HOUSEKEEPING_FILENAME);
    markHKTime(cacheRoot.toString());
    houseKeepingLock.delete();
    cacheBuildTimeMap = new HashMap<String, Calendar>();
    cachePathMap = new HashMap<String, String>();
    LOG.exiting(HouseKeepingBean.class.getName(), "postProcessCache");
  }

  private boolean processCCMCacheInstance(String cacheId, File cacheInstanceHome)
  {
    if (ecmAdapter == null)
    {
      throw new IllegalStateException("Cannot get the ECM Repository. Please verify the viewer config is correct.");
    }

    if (cacheInstanceHome.exists())
    {
      try
      {
        ecmAdapter.getDocumentBySONATA(cacheId);
      }
      catch (RepositoryAccessException e)
      {
        if (e.getStatusCode() == RepositoryAccessException.EC_REPO_NOTFOUNDDOC)
        {
          File secondHash = cacheInstanceHome.getParentFile();
          File primaryHash = secondHash.getParentFile();
          File preview = new File(new File(new File(new File(new File(sharedRoot), ICacheDescriptor.CACHE_DIR_CCMPREVIEW),
              primaryHash.getName()), secondHash.getName()), cacheId);
          FileUtil.removeDirectory(cacheInstanceHome);
          if (preview.exists())
          {
            FileUtil.removeDirectory(preview);
          }
          LOG.log(Level.FINE, "ECM cache in " + cacheInstanceHome.getPath() + " was cleaned by house keeping routine.");
          return true;
        }
        else
        {
          LOG.log(Level.WARNING, "Failed to get document from ecm repository. DocUri: " + cacheId + " StatusCode: " + e.getStatusCode());
        }
      }
    }
    return false;
  }

  private void cleanCacheFolders(File orgCacheHome)
  {
    long counter = 0;
    File[] primaryCacheHome = orgCacheHome.listFiles();
    if (primaryCacheHome == null) // To improve the robustness of the code
    {
      return;
    }
    for (int m = 0; m < primaryCacheHome.length; m++)
    {
      int primaryHash = HashRule.validateHash(primaryCacheHome[m].getName());
      if (primaryHash >= 0 && primaryHash <= JobUtil.PRIMARY_MAX_SLOT && primaryCacheHome[m].isDirectory())
      {
        File[] secondaryCacheHome = primaryCacheHome[m].listFiles();
        if (secondaryCacheHome != null) // To improve the robustness of the code
        {
          for (int n = 0; n < secondaryCacheHome.length; n++)
          {
            int secondaryHash = HashRule.validateHash(secondaryCacheHome[n].getName());
            if (secondaryHash >= 0 && secondaryHash <= JobUtil.SECONDARY_MAX_SLOT && secondaryCacheHome[n].isDirectory())
            {
              File[] docCacheHome = secondaryCacheHome[n].listFiles();
              // Fixed docCacheHome null issue, which will cause the stop of the housekeeping work
              if (docCacheHome != null && docCacheHome.length > 0)
              {
                validCacheCount += docCacheHome.length;
                for (int j = 0; j < docCacheHome.length; j++)
                {
                  checkMailAttachements(docCacheHome[j]);
                  checkUploadResults(docCacheHome[j]);
                  // here just clean older version if new version exists, it doesn't care if out dated
                  processOlderVersionInstance(docCacheHome[j]);
                  // remained.add(docCacheHome[j]);
                }
              }
              if (secondaryCacheHome[n].list().length == 0)
              {
                secondaryCacheHome[n].delete();
              }
            }
            counter++;
            if (0 == counter % HK_FILES_INTERVAL)
            {
              try
              {
                Thread.sleep(SLEEP_INTERVAL);
              }
              catch (Exception e)
              {
                LOG.warning("HK is interrupted.");
              }
            }
          }
        }
        if (primaryCacheHome[m].list().length == 0)
        {
          primaryCacheHome[m].delete();
        }
      }
    }
    StringBuffer msg = new StringBuffer(getInfoPrefix()).append("Cleaning the old cache of \"").append(orgCacheHome.getName())
        .append("\" is finished.  Total cache is ").append(validCacheCount).append(", removed ").append(previousCopyCount)
        .append(" caches.\n\t").append(successUploadCount).append(" uploaded successfully\n\t").append(failedUploadCount)
        .append(" uploaded with error.");

    if (validCacheCount > 0)
    {
      Iterator<Entry<String, Integer>> iter = mimeCounterMap.entrySet().iterator();
      while (iter.hasNext())
      {
        Entry<String, Integer> entry = iter.next();
        String mime = entry.getKey();
        Integer count = entry.getValue();
        msg.append("\n\t").append(count).append(" ").append(mime);
      }
    }
    LOG.log(Level.INFO, msg.toString());

  }

  private void checkMailAttachements(File cacheInstanceHome)
  {
    if (!cacheInstanceHome.exists() || !cacheInstanceHome.isDirectory())
    {
      return;
    }
    try
    {
      cacheInstanceHome.listFiles();
      File meta = new File(cacheInstanceHome, CacheStorageManager.CACHE_META_FILE_LABEL);
      if (meta.exists())
      {
        JSONObject o = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(meta)));
        String mime = String.valueOf(o.get("MIME"));
        if (mimeCounterMap.containsKey(mime))
        {
          Integer count = mimeCounterMap.get(mime);
          mimeCounterMap.put(mime, ++count);
        }
      }
    }
    catch (FileNotFoundException e)
    {
      LOG.warning("Failed to analyze mimetype of mail attachments. " + e.getLocalizedMessage());
    }
    catch (IOException e)
    {
      LOG.warning("Failed to analyze mimetype of mail attachments. " + e.getLocalizedMessage());
    }

    File attachment = new File(cacheInstanceHome, CacheStorageManager.ACL_META_FILE_LABEL);
    if (attachment.exists())
    {
      if (processCacheInstance(cacheInstanceHome, Calendar.DATE, mailAttachmentThreshold))
      {
        previousCopyCount++;
      }
    }

  }

  private void cleanPreviewFolder(File orgCacheHome)
  {
    int tempCacheCount = 0;
    int oldTempCacheCount = 0;
    File[] primaryHashHomes = orgCacheHome.listFiles();
    if (primaryHashHomes == null) // To improve the robustness of the code
    {
      return;
    }
    for (File primaryHashHome : primaryHashHomes)
    {
      int primaryHash = HashRule.validateHash(primaryHashHome.getName());
      if (primaryHash >= 0 && primaryHash <= JobUtil.PRIMARY_MAX_SLOT && primaryHashHome.isDirectory())
      {
        File[] secondaryHashHomes = primaryHashHome.listFiles();
        if (secondaryHashHomes != null) // To improve the robustness of the code
        {
          for (File secondaryHashHome : secondaryHashHomes)
          {
            int secondaryHash = HashRule.validateHash(secondaryHashHome.getName());
            if (secondaryHash >= 0 && secondaryHash <= JobUtil.SECONDARY_MAX_SLOT && secondaryHashHome.isDirectory())
            {
              File[] docCacheHomes = secondaryHashHome.listFiles();
              if (docCacheHomes != null) // To improve the robustness of the code
              {
                for (File docCacheHome : docCacheHomes)
                {
                  File[] lastModifiedHomes = docCacheHome.listFiles();

                  if (lastModifiedHomes != null) // To improve the robustness of the code
                  {
                    tempCacheCount += lastModifiedHomes.length;
                    for (File lastModifiedHome : lastModifiedHomes)
                    {
                      if (processCacheInstance(lastModifiedHome, Calendar.MINUTE, thumbnailSrvAgeThreshold))
                      {
                        oldTempCacheCount++;
                      }
                    }
                  }
                  if (docCacheHome.list().length == 0)
                  {
                    docCacheHome.delete();
                  }
                }
              }

              if (secondaryHashHome.list().length == 0)
              {
                secondaryHashHome.delete();
              }
            }
          }
        }
        if (primaryHashHome.list().length == 0)
        {
          primaryHashHome.delete();
        }
      }
    }
    LOG.log(
        Level.INFO,
        new StringBuffer(getInfoPrefix()).append("Cleaning the old cache of \"").append(orgCacheHome.getName())
            .append("\" is finished.  Total cache is ").append(oldTempCacheCount).append(". Removed ").append(tempCacheCount)
            .append(" caches.").toString());

  }

  private void checkUploadResults(File cacheInstanceHome)
  {
    boolean foundResult = false;
    if (!cacheInstanceHome.exists() || !cacheInstanceHome.isDirectory())
    {
      return;
    }
    String docId = cacheInstanceHome.getName();
    File[] docCacheHome = cacheInstanceHome.listFiles();
    if (docCacheHome == null)// To improve the robustness of the code
    {
      return;
    }
    try
    {
      for (File docCache : docCacheHome)
      {
        if (docCache.isDirectory() && docCache.getName().equals(docId))
        {
          File[] subCacheHome = docCache.listFiles();
          if (subCacheHome != null) // To improve the robustness of the code
          {
            for (File subCache : subCacheHome)
            {
              if (subCache.isDirectory() && subCache.getName().equals(PICTURES))
              {
                File result = new File(subCache, RESULTS);
                if (result.exists())
                {
                  foundResult = true;
                  JSONObject o = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(result)));
                  Boolean isSuccess = Boolean.valueOf(String.valueOf(o.get(ISSUCCESS)));
                  if (isSuccess)
                  {
                    this.successUploadCount++;
                  }
                  else
                  {
                    this.failedUploadCount++;
                  }
                }
              }
            }
          }
          if (!foundResult)
          {
            File result = new File(docCache, RESULTS);
            if (result.exists())
            {
              foundResult = true;
              JSONObject o = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(result)));
              Boolean isSuccess = Boolean.valueOf(String.valueOf(o.get("isSuccess")));
              if (isSuccess)
              {
                this.successUploadCount++;
              }
              else
              {
                this.failedUploadCount++;
              }
            }
          }
        }
      }
      if (!foundResult)
      {
        File meta = new File(cacheInstanceHome, META);
        if (meta.exists())
        {
          JSONObject o = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(meta)));
          String mime = String.valueOf(o.get("MIME"));
          if (mimeCounterMap.containsKey(mime))
          {
            Integer count = mimeCounterMap.get(mime);
            mimeCounterMap.put(mime, ++count);
          }
        }
      }
    }
    catch (FileNotFoundException e)
    {
      LOG.warning("Failed to analyze upload results. " + e.getLocalizedMessage());
    }
    catch (IOException e)
    {
      LOG.warning("Failed to analyze upload results. " + e.getLocalizedMessage());
    }
  }

  /**
   * Description clean the cache if it is beyond threshold.
   * 
   * @param cacheInstanceHome
   *          the cache need to cleaned.
   * @param field
   *          the field of Calendar, e.g DATE, HOUR or SECOND
   * @param cacheAgeThreshold
   *          the cache threshold
   * @return
   */
  private boolean processCacheInstance(File cacheInstanceHome, int field, int cacheAgeThreshold)
  {
    if (cacheInstanceHome.exists())
    {
      return clean(cacheInstanceHome, getCacheBuildTime(cacheInstanceHome), field, cacheAgeThreshold);
    }
    else
    {
      return true;
    }
  }

  /**
   * Description: clean the cache if it's not the latest version.
   * 
   * @param cacheInstanceHome
   *          the cache need to cleaned.
   * @return
   */
  private boolean processOlderVersionInstance(File cacheInstanceHome)
  {
    if (!cacheInstanceHome.exists() || !cacheInstanceHome.isDirectory())
    {
      return true;
    }

    Boolean CleanResult = false;

    Calendar lastVisit = getCacheBuildTime(cacheInstanceHome);

    if (cacheBuildTimeMap.containsKey(cacheInstanceHome.getName()))
    {
      if (lastVisit.compareTo(cacheBuildTimeMap.get(cacheInstanceHome.getName())) < 0)
      {
        FileUtil.removeDirectory(cacheInstanceHome); // not clean parent directories here
        LOG.fine(new StringBuffer(getInfoPrefix()).append(cacheInstanceHome).append(" cleaned.").toString());
      }
      else
      {
        File flagCacheInstanceHome = new File(cachePathMap.get(cacheInstanceHome.getName()));
        cacheBuildTimeMap.put(cacheInstanceHome.getName(), lastVisit);
        cachePathMap.put(cacheInstanceHome.getName(), cacheInstanceHome.getAbsolutePath());

        removeCacheInstance(flagCacheInstanceHome);
        LOG.fine(new StringBuffer(getInfoPrefix()).append(cacheInstanceHome).append(" cleaned.").toString());
      }
      previousCopyCount++;
    }
    else
    {
      cacheBuildTimeMap.put(cacheInstanceHome.getName(), lastVisit);
      cachePathMap.put(cacheInstanceHome.getName(), cacheInstanceHome.getAbsolutePath());
    }

    return CleanResult;
  }

  private void removeCacheInstance(File cacheInstanceHome)
  {
    FileUtil.removeDirectory(cacheInstanceHome);
    removeCacheInstanceParentDirectory(cacheInstanceHome);
  }

  private void removeCacheInstanceParentDirectory(File cacheInstanceHome)
  {
    File secondary = cacheInstanceHome.getParentFile();
    String[] secondary_lst = secondary.list();
    if (secondary_lst != null && secondary_lst.length == 0)
    {
      secondary.delete();
      File primary = secondary.getParentFile();
      String[] primary_lst = primary.list();
      if (primary_lst != null && primary_lst.length == 0)
        primary.delete();
    }
  }

  /**
   * Description clean the cache if it's last access threshold is beyond threshold.
   * 
   * @param cacheInstanceHome
   *          the cache need to cleaned.
   * @param lastAccess
   *          the calendar of the cache's last access.
   * @param cacheAgeThreshold
   *          the cache threshold.
   * @return
   */
  private boolean clean(File cacheInstanceHome, Calendar lastAccess, int field, int cacheAgeThreshold)
  {
    Calendar _nXBefore = AtomDate.valueOf(Calendar.getInstance()).getCalendar();
    _nXBefore.add(field, -cacheAgeThreshold);

    boolean cleanResult = false;
    if (lastAccess.compareTo(_nXBefore) < 0)// need to clean
    {
      try
      {
        FileUtil.removeDirectory(cacheInstanceHome);
        LOG.log(Level.FINE, "Cache in " + cacheInstanceHome.getPath() + " was cleaned by house keeping routine.");
        cleanResult = true;
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Cache in " + cacheInstanceHome.getPath() + " was not cleaned by house keeping routine.");
      }
    }

    return cleanResult;
  }

  private boolean validateFrequency(String frequency)
  {
    return ("now".equalsIgnoreCase(frequency)) || ("hourly".equalsIgnoreCase(frequency))
        || (("daily".equalsIgnoreCase(frequency)) || ("weekly".equalsIgnoreCase(frequency)) || ("monthly".equalsIgnoreCase(frequency)));
  }

  public void removeFolder(File f)
  {
    for (int i = 0; i < DIRECTORYLAYER; i++)
    {
      if (f.exists() && f.list().length == 0)
        f.delete();

      f = f.getParentFile();
    }
  }

  private Calendar getCacheBuildTime(File cacheInstanceHome)
  {
    File[] subCacheInstanceHome = cacheInstanceHome.listFiles(new FilenameFilter()
    {
      public boolean accept(File dir, String name)
      {
        return !(name.equalsIgnoreCase("media") || name.equalsIgnoreCase("temp"));
      }
    });

    if (subCacheInstanceHome != null)
    {
      for (int i = 0; i < subCacheInstanceHome.length; i++)
      {
        if (subCacheInstanceHome[i].isDirectory())
        {
          File[] lastVisitRecordFile = subCacheInstanceHome[i].listFiles(new FilenameFilter()
          {
            public boolean accept(File dir, String name)
            {
              String REG_EXP = "\\d+" + Job.CACHE_AGE_BIT + dir.getName();
              Pattern pattern = Pattern.compile(REG_EXP);
              Matcher matcher = pattern.matcher(name);
              return matcher.matches();
            }
          });

          if (lastVisitRecordFile != null && lastVisitRecordFile.length == 1)
          {
            String lastVisitInMiliSecond = lastVisitRecordFile[0].getName().substring(0,
                lastVisitRecordFile[0].getName().lastIndexOf(Job.CACHE_AGE_BIT));
            return AtomDate.valueOf(Long.parseLong(lastVisitInMiliSecond)).getCalendar();
          }
        }
      }
    }

    // Get age file failed, we return Epoch, January 1, 1970 00:00:00.000 GMT (Gregorian). It's an very old age, and must be cleaned.
    Calendar ret = Calendar.getInstance();
    ret.setTimeInMillis(0);

    StringBuffer sbf = new StringBuffer(getInfoPrefix());
    sbf.append("Fail to get cache age file in ");
    sbf.append(cacheInstanceHome.getPath());
    sbf.append(", returning  Epoch, January 1, 1970 00:00:00.000 GMT, ");
    sbf.append(ret.getTime());
    LOG.log(Level.FINE, sbf.toString());

    return ret;
  }

  private String getInfoPrefix()
  {
    return ServiceCode.HOUSEKEEPING_INFO + ": ";
  }

  private String getWarningPrefix()
  {
    return ServiceCode.HOUSEKEEPING_WARNING + ": ";
  }

  public void initMimeType()
  {
    if (mimeCounterMap == null)
    {
      mimeCounterMap = new HashMap<String, Integer>();
    }
    mimeCounterMap.put(DocumentTypeUtils.DOC_MIMETYPE, Integer.valueOf(0));
    mimeCounterMap.put(DocumentTypeUtils.DOCX_MIMETYPE, Integer.valueOf(0));
    mimeCounterMap.put(DocumentTypeUtils.ODP_MIMETYPE, Integer.valueOf(0));
    mimeCounterMap.put(DocumentTypeUtils.ODS_MIMETYPE, Integer.valueOf(0));
    mimeCounterMap.put(DocumentTypeUtils.ODT_MIMETYPE, Integer.valueOf(0));
    mimeCounterMap.put(DocumentTypeUtils.PDF_MIMETYPE, Integer.valueOf(0));
    mimeCounterMap.put(DocumentTypeUtils.PPT_MIMETYPE, Integer.valueOf(0));
    mimeCounterMap.put(DocumentTypeUtils.PPTX_MIMETYPE, Integer.valueOf(0));
    mimeCounterMap.put(DocumentTypeUtils.XLSX_MIMETYPE, Integer.valueOf(0));
    mimeCounterMap.put(DocumentTypeUtils.XLS_MIMETYPE, Integer.valueOf(0));

  }
}