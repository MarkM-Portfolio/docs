package com.ibm.concord.admin;

import java.io.File;
import java.io.FilenameFilter;
import java.util.Calendar;
import java.util.UUID;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.document.services.comments.CommentsDocumentPart;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.job.Job;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ConditionalCleaner
{
  private CleanerType myType;

  private static final int CACHE_HK_DELAY_EXEC_TOLERANCE_IN_MIN = 3;

  private static final int CACHE_HK_DELAY_LIMITATION_IN_DAY = 1;

  private static final int DRAFT_HK_DELAY_EXEC_TOLERANCE_IN_DAY = 3;

  private static final int UPLD_HK_DELAY_LIMITATION_IN_DAY = 3;

  private static final int UPLD_HK_DELAY_EXEC_TOLERANCE_IN_DAY = 3;

  private int NATIVE_TOLERANCE;

  private boolean USE_ALTERNATE_AGE_THRESHOLD;

  private static Long cleanedDraft = 0l;

  private static Long cleanedCache = 0l;

  private static final String RENAME_TAG = ".keep.";

  private static final Logger LOG = Logger.getLogger(ConditionalCleaner.class.getName());

  private static float result = 1.0f;

  // 7 days in ms, age threshold for upload conversion;
  private int AGE_THRESHOLD;

  private Float SIZE_THRESHOLD;

  private boolean FORCE_CLEAN;

  private boolean isExtend;

  private long startTime;

  private static File shareRoot = new File(ConcordConfig.getInstance().getSharedDataRoot());

  private CommentsDocumentPart commentPart;

  // 2 hours in ms for clean timeout
  private long CLEAN_TIMEOUT;

  // 4 hours in ms for extended clean timeout
  private long EXTEND_CLEAN_TIMEOUT;

  public static Long getcleanedDraft()
  {
    return cleanedDraft;
  }

  public static Long getcleanedCache()
  {
    return cleanedCache;
  }

  public static String getRenameTag()
  {
    return RENAME_TAG;
  }

  public void extend()
  {
    isExtend = true;
  }

  public boolean needGoFurther()
  {
    boolean shouldCleanFurther = false;
    if (getSharedDiskUsedRate(true) > getSizeThresholdRate())
    {
      shouldCleanFurther = true;
      USE_ALTERNATE_AGE_THRESHOLD = true;
    }
    else
      USE_ALTERNATE_AGE_THRESHOLD = false;
    return shouldCleanFurther;
  }

  private long getTimeout()
  {
    return isExtend ? EXTEND_CLEAN_TIMEOUT : CLEAN_TIMEOUT;
  }

  public boolean isTimeout()
  {
    return (System.currentTimeMillis() - startTime) > getTimeout();
  }

  private boolean useMinute()
  {

    return (myType == CleanerType.cacheType && !USE_ALTERNATE_AGE_THRESHOLD && AGE_THRESHOLD == 0);
  }

  public int getAgeThreshold()
  {
    int nResult = 0;
    switch (myType)
      {
        case cacheType :
          nResult = USE_ALTERNATE_AGE_THRESHOLD ? CACHE_HK_DELAY_LIMITATION_IN_DAY
              : (AGE_THRESHOLD != 0 ? AGE_THRESHOLD : NATIVE_TOLERANCE);
          break;
        case uploadType :
          nResult = USE_ALTERNATE_AGE_THRESHOLD ? UPLD_HK_DELAY_LIMITATION_IN_DAY : (AGE_THRESHOLD != 0 ? AGE_THRESHOLD : NATIVE_TOLERANCE);
          break;
        case draftType :
          nResult = AGE_THRESHOLD != 0 ? AGE_THRESHOLD : NATIVE_TOLERANCE;
          break;
      }
    return nResult;
  }

  public Float getSizeThreshold()
  {
    return SIZE_THRESHOLD;
  }

  public float getSizeThresholdRate()
  {
    if (getSizeThreshold().intValue() == 0)
    {
      return getSizeThreshold();
    }
    else
    {
      long value = getSizeThreshold().longValue() * 1024 * 1024 * 1024; // Change the unit from Byte into GB.
      return (float) value / shareRoot.getTotalSpace();
    }

  }

  public boolean getForceClean()
  {
    return FORCE_CLEAN;
  }

  private float getSharedDiskUsedRate(boolean bForceRefresh)
  {
    if (bForceRefresh)
    {
      result = 1.0f - ((float) shareRoot.getUsableSpace()) / shareRoot.getTotalSpace();
    }
    return result;
  }

  private void loadUPLDThresholds()
  {
    if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.UPLD_AGE_THRESHOLD_PER_ORG_KEY) == null)
    {
      AGE_THRESHOLD = 7;
      LOG.log(Level.INFO,
          "\"age_threshold_of_upld_conv_per_org\" settings for \"House_Keeping\" was not found, \"90\" days as default.");
    }
    else
    {
      try
      {
        AGE_THRESHOLD = Integer.parseInt((String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.UPLD_AGE_THRESHOLD_PER_ORG_KEY));

        if (AGE_THRESHOLD < 0)
        {
          AGE_THRESHOLD = 7;
          LOG.log(Level.INFO,
              "\"age_threshold_of_upld_conv_per_org\" settings for \"House_Keeping\" was illegal, \"90\" days as default.");
        }
        else
        {
          LOG.log(Level.INFO, "\"age_threshold_of_upld_conv_per_org\" settings for \"House_Keeping\" found: " + AGE_THRESHOLD);

          if (AGE_THRESHOLD < 2 || AGE_THRESHOLD > 10)
          {
            LOG.log(Level.WARNING,
                "\"age_threshold_of_upld_conv_per_org\" settings is recommended to be any number between [3, 120].");
          }
        }
      }
      catch (Exception e)
      {
        AGE_THRESHOLD = 7;
        LOG.log(Level.INFO,
            "\"age_threshold_of_upld_conv_per_org\" settings for \"House_Keeping\" was illegal, \"90\" days as default.");
      }
    }
    if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.DRAFT_SIZE_THRESHOLD_PER_ORG_KEY) == null)
    {
      SIZE_THRESHOLD = 128f;
      LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" was not found, \"128\" GBs as default.");
    }
    else
    {
      try
      {
        SIZE_THRESHOLD = Float.parseFloat((String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.DRAFT_SIZE_THRESHOLD_PER_ORG_KEY));

        if (SIZE_THRESHOLD.compareTo(new Float(0.1)) >= 0 && SIZE_THRESHOLD.compareTo(new Float(0.9)) <= 0)
        {
          LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" found (RATIO): " + SIZE_THRESHOLD);
        }
        else if (SIZE_THRESHOLD.compareTo(new Float(16)) < 0)
        {
          SIZE_THRESHOLD = 128f;
          LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" was illegal, \"128\" GBs as default.");
        }
        else
        {
          LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" found: " + SIZE_THRESHOLD);

          if (SIZE_THRESHOLD.compareTo(new Float(64)) < 0)
          {
            LOG.log(Level.WARNING, "\"size_threshold_of_draft_per_org\" settings is recommended to be any number between [64, ~].");
          }
        }
      }
      catch (Exception e)
      {
        SIZE_THRESHOLD = 128f;
        LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" was illegal, \"128\" GBs as default.");
      }
    }
  }

  private void loadDraftThresholds()
  {
    String cleanDraftStr = (String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
        .get(ConfigConstants.FORCE_CLEAN_DRAFT);
    if (cleanDraftStr != null)
    {
      FORCE_CLEAN = Boolean.parseBoolean(cleanDraftStr);
      LOG.log(Level.INFO, "\"force_clean_draft\" settings for \"House_Keeping\" found: " + FORCE_CLEAN);
    }

    if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.DRAFT_AGE_THRESHOLD_PER_ORG_KEY) == null)
    {
      AGE_THRESHOLD = 90;
      LOG.log(Level.INFO, "\"age_threshold_of_draft_per_org\" settings for \"House_Keeping\" was not found, \"90\" days as default.");
    }
    else
    {
      try
      {
        AGE_THRESHOLD = Integer.parseInt((String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.DRAFT_AGE_THRESHOLD_PER_ORG_KEY));

        if (AGE_THRESHOLD < 0)
        {
          AGE_THRESHOLD = 90;
          LOG.log(Level.INFO, "\"age_threshold_of_draft_per_org\" settings for \"House_Keeping\" was illegal, \"90\" days as default.");
        }
        else
        {
          LOG.log(Level.INFO, "\"age_threshold_of_draft_per_org\" settings for \"House_Keeping\" found: " + AGE_THRESHOLD);

          if (AGE_THRESHOLD < 30 || AGE_THRESHOLD > 120)
          {
            LOG.log(Level.WARNING, "\"age_threshold_of_draft_per_org\" settings is recommended to be any number between [30, 120].");
          }
        }
      }
      catch (Exception e)
      {
        AGE_THRESHOLD = 90;
        LOG.log(Level.INFO, "\"age_threshold_of_draft_per_org\" settings for \"House_Keeping\" was illegal, \"90\" days as default.");
      }
    }

    if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.DRAFT_SIZE_THRESHOLD_PER_ORG_KEY) == null)
    {
      SIZE_THRESHOLD = 128f;
      LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" was not found, \"128\" GBs as default.");
    }
    else
    {
      try
      {
        SIZE_THRESHOLD = Float.parseFloat((String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.DRAFT_SIZE_THRESHOLD_PER_ORG_KEY));

        if (SIZE_THRESHOLD.compareTo(new Float(0.1)) >= 0 && SIZE_THRESHOLD.compareTo(new Float(0.9)) <= 0)
        {
          LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" found (RATIO): " + SIZE_THRESHOLD);
        }
        else if (SIZE_THRESHOLD.compareTo(new Float(16)) < 0)
        {
          SIZE_THRESHOLD = 128f;
          LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" was illegal, \"128\" GBs as default.");
        }
        else
        {
          LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" found: " + SIZE_THRESHOLD);

          if (SIZE_THRESHOLD.compareTo(new Float(64)) < 0)
          {
            LOG.log(Level.WARNING, "\"size_threshold_of_draft_per_org\" settings is recommended to be any number between [64, ~].");
          }
        }
      }
      catch (Exception e)
      {
        SIZE_THRESHOLD = 128f;
        LOG.log(Level.INFO, "\"size_threshold_of_draft_per_org\" settings for \"House_Keeping\" was illegal, \"128\" GBs as default.");
      }
    }
  }

  private void loadCacheThresholds()
  {
    String cleanCacheStr = (String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
        .get(ConfigConstants.FORCE_CLEAN_CACHE);
    if (cleanCacheStr != null)
    {
      FORCE_CLEAN = Boolean.parseBoolean(cleanCacheStr);
      LOG.log(Level.INFO, "\"force_clean_rendition_cache\" settings for \"House_Keeping\" found: " + cleanCacheStr);
    }

    if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.CACHE_AGE_THRESHOLD_PER_ORG_KEY) == null)
    {
      AGE_THRESHOLD = 14;
      LOG.log(Level.INFO,
          "\"age_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was not found, \"90\" days as default.");
    }
    else
    {
      try
      {
        AGE_THRESHOLD = Integer.parseInt((String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.CACHE_AGE_THRESHOLD_PER_ORG_KEY));

        if (AGE_THRESHOLD < 0)
        {
          AGE_THRESHOLD = 14;
          LOG.log(Level.INFO,
              "\"age_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was illegal, \"90\" days as default.");
        }
        else
        {
          LOG.log(Level.INFO, "\"age_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" found: " + AGE_THRESHOLD);

          if (AGE_THRESHOLD < 2 || AGE_THRESHOLD > 21)
          {
            LOG.log(Level.WARNING,
                "\"age_threshold_of_rendition_cache_per_org\" settings is recommended to be any number between [3, 120].");
          }
        }
      }
      catch (Exception e)
      {
        AGE_THRESHOLD = 14;
        LOG.log(Level.INFO,
            "\"age_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was illegal, \"90\" days as default.");
      }
    }
    if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.CACHE_SIZE_THRESHOLD_PER_ORG_KEY) == null)
    {
      SIZE_THRESHOLD = 128f;
      LOG.log(Level.INFO,
          "\"size_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was not found, \"128\" GBs as default.");
    }
    else
    {
      try
      {
        SIZE_THRESHOLD = Float.parseFloat((String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.CACHE_SIZE_THRESHOLD_PER_ORG_KEY));

        if (SIZE_THRESHOLD.compareTo(new Float(0.1)) >= 0 && SIZE_THRESHOLD.compareTo(new Float(0.9)) <= 0)
        {
          LOG.log(Level.INFO, "\"size_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" found (RATIO): "
              + SIZE_THRESHOLD);
        }
        else if (SIZE_THRESHOLD.compareTo(new Float(16)) < 0)
        {
          SIZE_THRESHOLD = 128f;
          LOG.log(Level.INFO,
              "\"size_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was illegal, \"128\" GBs as default.");
        }
        else
        {
          LOG.log(Level.INFO, "\"size_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" found: " + SIZE_THRESHOLD);

          if (SIZE_THRESHOLD.compareTo(new Float(64)) < 0)
          {
            LOG.log(Level.WARNING,
                "\"size_threshold_of_rendition_cache_per_org\" settings is recommended to be any number between [64, ~].");
          }
        }
      }
      catch (Exception e)
      {
        SIZE_THRESHOLD = 128f;
        LOG.log(Level.INFO,
            "\"size_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was illegal, \"128\" GBs as default.");
      }
    }
  }

  public ConditionalCleaner(CleanerType type)
  {
    // currentRound = 0;
    USE_ALTERNATE_AGE_THRESHOLD = false;
    startTime = System.currentTimeMillis();
    getSharedDiskUsedRate(true);
    myType = type;
    switch (type)
      {
        case cacheType :
          NATIVE_TOLERANCE = CACHE_HK_DELAY_EXEC_TOLERANCE_IN_MIN;
          CLEAN_TIMEOUT = 2 * 3600 * 1000;
          FORCE_CLEAN = true;
          commentPart = null;
          loadCacheThresholds();
          break;
        case draftType :
          NATIVE_TOLERANCE = DRAFT_HK_DELAY_EXEC_TOLERANCE_IN_DAY;
          CLEAN_TIMEOUT = 2 * 3600 * 1000;
          FORCE_CLEAN = false;
          commentPart = new CommentsDocumentPart();
          loadDraftThresholds();
          break;
        default:
          NATIVE_TOLERANCE = UPLD_HK_DELAY_EXEC_TOLERANCE_IN_DAY;
          CLEAN_TIMEOUT = 2 * 3600 * 1000;
          FORCE_CLEAN = true;
          commentPart = new CommentsDocumentPart();
          loadUPLDThresholds();
          break;
      }
    EXTEND_CLEAN_TIMEOUT = CLEAN_TIMEOUT * 2;
    isExtend = false;

    if (getSharedDiskUsedRate(true) > getSizeThresholdRate())
    {
      USE_ALTERNATE_AGE_THRESHOLD = true;
    }
  }

  private boolean validateCache(File cacheInstanceHome)
  {
    return new File(cacheInstanceHome, cacheInstanceHome.getName()).exists()
        && (Job.getResultFile(cacheInstanceHome).exists() || Job.getError(cacheInstanceHome) != null);
  }

  public void cleanInstance(File cacheInstanceHome)
  {
    LOG.entering(HouseKeepingBean.class.getName(), "processCacheInstance", new Object[] { cacheInstanceHome.getPath(), getAgeThreshold(),
        getForceClean() });

    File[] lastVisitRecordFile = cacheInstanceHome.listFiles(new FilenameFilter()
    {
      public boolean accept(File dir, String name)
      {
        try
        {
          String REG_EXP = "\\d+" + Job.CACHE_AGE_BIT + dir.getName();
          Pattern pattern = Pattern.compile(REG_EXP);
          Matcher matcher = pattern.matcher(name);
          return matcher.matches();
        }
        catch (PatternSyntaxException e)
        {
          LOG.log(Level.WARNING, "Wrong reg_exp", e);
          return false;
        }
      }
    });

    if (lastVisitRecordFile == null)
    {
      LOG.log(Level.WARNING, "Failed to perform house keeping for " + cacheInstanceHome.getPath() + " due to listFiles failed.");

      LOG.exiting(HouseKeepingBean.class.getName(), "processCacheInstance", false);

      // return false;
    }

    if (lastVisitRecordFile.length == 1)
    {
      String lastVisitInMiliSecond = lastVisitRecordFile[0].getName().substring(0,
          lastVisitRecordFile[0].getName().lastIndexOf(Job.CACHE_AGE_BIT));
      Calendar lastVisit = AtomDate.valueOf(Long.parseLong(lastVisitInMiliSecond)).getCalendar();
      boolean result = clean(cacheInstanceHome, lastVisit);
      LOG.exiting(HouseKeepingBean.class.getName(), "processCacheInstance", result);
      // return result;
    }
    else if (lastVisitRecordFile.length == 0)
    {
      if (getForceClean() || validateCache(cacheInstanceHome))
      {
        Calendar lastModified = AtomDate.valueOf(cacheInstanceHome.lastModified()).getCalendar();
        boolean result = clean(cacheInstanceHome, lastModified);
        LOG.exiting(HouseKeepingBean.class.getName(), "processCacheInstance", result);
        // return result;
      }
      else
      {
        LOG.log(Level.WARNING, "Failed to perform house keeping for " + cacheInstanceHome.getPath()
            + " due to suspicious invalid rendition cache data detected.");

        LOG.exiting(HouseKeepingBean.class.getName(), "processCacheInstance", false);

        // return false;
      }
    }
    else
    {
      Calendar lastModified = AtomDate.valueOf(cacheInstanceHome.lastModified()).getCalendar();
      boolean result = clean(cacheInstanceHome, lastModified);
      LOG.exiting(HouseKeepingBean.class.getName(), "processCacheInstance", result);
      // return result;
    }
  }

  private boolean validateDraft(DraftDescriptor dd)
  {
    return new File(dd.getInternalURI(), "draft.lck").exists() && new File(dd.getInternalURI(), "msg.json").exists()
        && new File(dd.getInternalURI(), "meta.json").exists();
  }

  private boolean shouldCleanDraft(DraftDescriptor dd) throws DraftDataAccessException
  {
    boolean result = false;
    if (DraftStorageManager.getDraftStorageManager(false).isDraftExisted(dd))
    {
      JSONArray commentList = (JSONArray) commentPart.getCurrentState(dd, null, null);
      if (commentList.size() == 0)
      {
        result = true;
      }
      else
      {
        result = false;
        if (LOG.isLoggable(Level.FINE))
        {
          LOG.log(Level.FINE, "Don't perform house keeping for draft " + dd + " due to existing comments.");
        }
      }
      JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(dd);
      if (draftMeta.get(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey()) == null
          || !((Boolean) draftMeta.get(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey())).booleanValue())
      {
        LOG.log(Level.FINE, "Un-Published Draft Not Cleaned. {0}", new Object[] { dd });
        result = false;
      }
    }
    return result;
  }

  public boolean cleanInstances(Vector<DraftDescriptor> dds)
  {
    LOG.entering(ConditionalCleaner.class.getName(), "draft::cleanInstances", new Object[] { dds, getAgeThreshold(), getForceClean() });
    while (dds.size() > 0)
    {
      if (isTimeout())
      {
        LOG.log(Level.INFO,
            "Too many drafts to be processed in a single house keeping phase, the remaings will be continued in next round house keeping.");
        return false;// Not finished...
      }
      DraftDescriptor dd = dds.firstElement();
      LOG.entering(ConditionalCleaner.class.getName(), "draft::cleanInstances", new Object[] { dd, getAgeThreshold(), getForceClean() });
      try
      {
        if (getForceClean() || validateDraft(dd))
        {
          if (shouldCleanDraft(dd))
          {
            JSONObject draftMeta = DraftStorageManager.getDraftStorageManager(false).getDraftMeta(dd);

            Calendar lastVisit = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey())).getCalendar();
            boolean result = clean(dd, lastVisit);

            if (result)
            {
              File upgradeDir = new File(dd.getTempURI(null), "upgrade");
              String upgradeFiles[] = upgradeDir.list();
              if (upgradeFiles != null && upgradeFiles.length > 0)
              {
                result = result
                    && cleanSpecificDir(dd, AtomDate.valueOf(upgradeDir.lastModified()).getCalendar(), upgradeDir.getAbsolutePath());
              }

              // Check if there is any spreadsheet calculate result in draft folder or not, if exist, then should check the age of the
              // result,
              // otherwise clean it now.
              File calcDir = new File(dd.getTempURI(null), "calculate");
              String calcFiles[] = calcDir.list();
              if (calcFiles != null && calcFiles.length > 0)
              {
                result = result && cleanSpecificDir(dd, AtomDate.valueOf(calcDir.lastModified()).getCalendar(), calcDir.getAbsolutePath());
              }

              // Check if there is any snapshot result in draft folder or not, if exist, then should check the age of the result, otherwise
              // clean it now.
              File snapshotDir = new File(dd.getSnapshotMediaURI());
              String snapshotFiles[] = snapshotDir.list();
              if (snapshotFiles != null && snapshotFiles.length > 0)
              {
                result = result
                    && cleanSpecificDir(dd, AtomDate.valueOf(snapshotDir.lastModified()).getCalendar(), snapshotDir.getAbsolutePath());
              }

              /**
               * clean empty folder
               */
              File cacheInstanceHome = new File(dd.getInternalURI());
              File secondaryCacheHome = cacheInstanceHome.getParentFile();
              File primaryCacheHome = secondaryCacheHome.getParentFile();
              if (secondaryCacheHome.exists() && secondaryCacheHome.list().length == 0)
              {
                secondaryCacheHome.delete();
              }
              if (primaryCacheHome.exists() && primaryCacheHome.list().length == 0)
              {
                primaryCacheHome.delete();
              }
            }
          }
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Failed to perform house keeping for draft " + dd + " due to getDraftMeta failed.", e);
      }
      finally
      {
        dds.remove(0);
      }
    }
    LOG.exiting(HouseKeepingBean.class.getName(), "cleanInstances", result);
    return true;// Finished...
  }

  public boolean cleanInstance(DraftDescriptor dd)
  {
    LOG.entering(ConditionalCleaner.class.getName(), "upload::cleanInstance", new Object[] { dd, getAgeThreshold(), getForceClean() });

    try
    {
      File uploadConvertDir = new File(dd.getTempURI(null), "upload");
      String uploadConvertFiles[] = uploadConvertDir.list();
      if (uploadConvertFiles != null && uploadConvertFiles.length > 0)
      {
        cleanSpecificDir(dd, AtomDate.valueOf(uploadConvertDir.lastModified()).getCalendar(), uploadConvertDir.getAbsolutePath());
      }
      if (getForceClean() || validateDraft(dd))
      {
        {
          return false;

          // Check if there is any upload convert result in draft folder or not, if exist, then should check the age of the result,
          // otherwise clean it now.

          // Check if there is any upgrade convert result in draft folder or not, if exist, then should check the age of the result,
          // otherwise clean it now.

          // LOG.exiting(HouseKeepingBean.class.getName(), "processDraftInstance", result);

        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to perform house keeping for draft " + dd + " due to getDraftMeta failed.", e);
    }
    return true;
  }

  private boolean cleanSpecificDir(DraftDescriptor draftDescriptor, Calendar lastAccess, String dirPath)
  {
    Calendar _nDaysBefore = AtomDate.valueOf(Calendar.getInstance()).getCalendar();

    /*
     * if (getAgeThreshold() == 0) { _nDaysBefore.add(Calendar.DAY_OF_MONTH, -DRAFT_HK_DELAY_EXEC_TOLERANCE_IN_DAY); } else {
     * _nDaysBefore.add(Calendar.DAY_OF_MONTH, -getAgeThreshold()); }
     */
    _nDaysBefore.add(Calendar.DAY_OF_MONTH, -getAgeThreshold());

    if (lastAccess.compareTo(_nDaysBefore) < 0)
    {
      if (dirPath.equals(draftDescriptor.getInternalURI())) // clean the entire draft folder
      {
        try
        {
          DraftStorageManager.getDraftStorageManager(false).discardDraft(draftDescriptor);
        }
        catch (ConcordException e)
        {
          LOG.log(Level.WARNING, "Failed to perform house keeping for draft " + draftDescriptor + " due to discardDraft failed.", e);
          return false;
        }
      }

      File keptFile = new File(dirPath + RENAME_TAG + UUID.randomUUID().toString());
      if (new File(dirPath).renameTo(keptFile))
      {
        FileUtil.cleanDirectory(keptFile);
        if (keptFile.delete())
        {
          cleanedDraft++; // update cleaned draft count, so that we know how many drafts were cleaned by the end of house keeping.

          if (LOG.isLoggable(Level.INFO))
          {
            LOG.log(Level.INFO, "Draft " + draftDescriptor.getDocId() + " was cleaned by house keeping routine. The path is " + dirPath);
          }

          return true;
        }
        else
        {
          LOG.log(Level.WARNING, "Failed to perform house keeping for draft " + draftDescriptor + " due to delete failed. The path is "
              + dirPath);

          return false;
        }
      }
      else
      {
        LOG.log(Level.WARNING, "Failed to perform house keeping for " + draftDescriptor + " due to rename failed. The path is " + dirPath);

        return false;
      }
    }
    else
    {
      LOG.log(Level.FINE, "Draft Not Cleaned. {0} {1} {2} {3}", new Object[] { draftDescriptor, lastAccess, _nDaysBefore, dirPath });
      return false;
    }

  }

  private boolean clean(DraftDescriptor draftDescriptor, Calendar lastAccess)
  {
    return cleanSpecificDir(draftDescriptor, lastAccess, draftDescriptor.getInternalURI());
  }

  private boolean clean(File cacheInstanceHome, Calendar lastAccess)
  {
    Calendar _nXBefore = AtomDate.valueOf(Calendar.getInstance()).getCalendar();
    /*
     * if (getAgeThreshold() == 0) { _nXBefore.add(Calendar.MINUTE, -CACHE_HK_DELAY_EXEC_TOLERANCE_IN_MIN); } else {
     * _nXBefore.add(Calendar.DAY_OF_MONTH, -getAgeThreshold()); }
     */
    _nXBefore.add(useMinute() ? Calendar.MINUTE : Calendar.DAY_OF_MONTH, -getAgeThreshold());
    if (lastAccess.compareTo(_nXBefore) < 0)
    {
      File keptFile = new File(cacheInstanceHome.getPath() + ".keep");
      if (cacheInstanceHome.renameTo(keptFile))
      {
        FileUtil.cleanDirectory(keptFile);
        if (keptFile.delete())
        {
          cleanedCache++; // update cleaned cache count, so that we know how many caches were cleaned by the end of house keeping.

          if (LOG.isLoggable(Level.FINE))
          {
            LOG.log(Level.FINE, "Cache for " + keptFile.getName() + " was cleaned by house keeping routine.");
          }

          return true;
        }
        else
        {
          LOG.log(Level.WARNING, "Failed to perform house keeping for " + keptFile.getPath() + " due to delete failed.");

          return false;
        }
      }
      else
      {
        LOG.log(Level.WARNING, "Failed to perform house keeping for " + cacheInstanceHome.getPath() + " due to rename failed.");

        return false;
      }
    }
    else
    {
      LOG.log(Level.FINE, "Cache Not Cleaned. {0} {1} {2}", new Object[] { cacheInstanceHome, lastAccess, _nXBefore });
      return false;
    }
  }

};
