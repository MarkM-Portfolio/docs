/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping.strategy;

import java.io.File;
import java.io.FilenameFilter;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.job.Job;
import com.ibm.concord.platform.Platform;
import com.ibm.docs.common.io.FileUtil;

public class CacheStrategy extends AbstractStrategy
{
  private static final Logger LOG = Logger.getLogger(CacheStrategy.class.getName());

  private long cleanedCache = 0L;

  static
  {
    criticalAgeThreshold = 3;

    if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.CACHE_AGE_THRESHOLD_PER_ORG_KEY) == null)
    {
      age_threshold = 14;
      LOG.log(Level.INFO,
          "\"age_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was not found, \"14\" days as default.");
    }
    else
    {
      try
      {
        age_threshold = Integer.parseInt((String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.CACHE_AGE_THRESHOLD_PER_ORG_KEY));

        if (age_threshold < 0)
        {
          age_threshold = 14;
          LOG.log(Level.INFO,
              "\"age_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was illegal, \"14\" days as default.");
        }
        else
        {
          LOG.log(Level.INFO, "\"age_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" found: " + age_threshold);

          if (age_threshold < 2 || age_threshold > 21)
          {
            LOG.log(Level.WARNING,
                "\"age_threshold_of_rendition_cache_per_org\" settings is recommended to be any number between [3, 120].");
          }
        }
      }
      catch (Exception e)
      {
        age_threshold = 14;
        LOG.log(Level.INFO,
            "\"age_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was illegal, \"14\" days as default.");
      }
    }

    if (Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY).get(ConfigConstants.CACHE_SIZE_THRESHOLD_PER_ORG_KEY) == null)
    {
      size_threshold = 128f;
      LOG.log(Level.INFO,
          "\"size_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was not found, \"128\" GBs as default.");
    }
    else
    {
      try
      {
        size_threshold = Float.parseFloat((String) Platform.getConcordConfig().getSubConfig(ConfigConstants.HOUSE_KEEPING_KEY)
            .get(ConfigConstants.CACHE_SIZE_THRESHOLD_PER_ORG_KEY));

        if (size_threshold.compareTo(new Float(0.1)) >= 0 && size_threshold.compareTo(new Float(0.9)) <= 0)
        {
          LOG.log(Level.INFO, "\"size_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" found (RATIO): "
              + size_threshold);
        }
        else if (size_threshold.compareTo(new Float(16)) < 0)
        {
          size_threshold = 128f;
          LOG.log(Level.INFO,
              "\"size_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was illegal, \"128\" GBs as default.");
        }
        else
        {
          LOG.log(Level.INFO, "\"size_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" found: " + size_threshold);

          if (size_threshold.compareTo(new Float(64)) < 0)
          {
            LOG.log(Level.WARNING,
                "\"size_threshold_of_rendition_cache_per_org\" settings is recommended to be any number between [64, ~].");
          }
        }
      }
      catch (Exception e)
      {
        size_threshold = 128f;
        LOG.log(Level.INFO,
            "\"size_threshold_of_rendition_cache_per_org\" settings for \"House_Keeping\" was illegal, \"128\" GBs as default.");
      }
    }
  }

  public long getCleanedCache()
  {
    return cleanedCache;
  }

  public void cleanInstance(File cacheInstanceHome)
  {
    LOG.entering(CacheStrategy.class.getName(), "processCacheInstance", new Object[] { cacheInstanceHome.getPath(), getAgeThreshold() });
    try
    {
      File[] lastVisitRecordFile = cacheInstanceHome.listFiles(new FilenameFilter()
      {
        public boolean accept(File dir, String name)
        {
          String REG_EXP = "\\d+" + Job.CACHE_AGE_BIT + dir.getName();
          Pattern pattern = Pattern.compile(REG_EXP);
          Matcher matcher = pattern.matcher(name);
          return matcher.matches();
        }
      });

      if (lastVisitRecordFile == null)
      {
        LOG.log(Level.WARNING, "Failed to perform house keeping for " + cacheInstanceHome.getPath() + " due to listFiles failed.");
        LOG.exiting(CacheStrategy.class.getName(), "processCacheInstance", false);
      }

      if (lastVisitRecordFile.length == 1)
      {
        String lastVisitInMiliSecond = lastVisitRecordFile[0].getName().substring(0,
            lastVisitRecordFile[0].getName().lastIndexOf(Job.CACHE_AGE_BIT));
        Calendar lastVisit = AtomDate.valueOf(Long.parseLong(lastVisitInMiliSecond)).getCalendar();
        boolean result = clean(cacheInstanceHome, lastVisit);
        LOG.exiting(CacheStrategy.class.getName(), "processCacheInstance", result);
      }
      else if (lastVisitRecordFile.length == 0)
      {
        if (validateCache(cacheInstanceHome))
        {
          Calendar lastModified = AtomDate.valueOf(cacheInstanceHome.lastModified()).getCalendar();
          boolean result = clean(cacheInstanceHome, lastModified);
          LOG.exiting(CacheStrategy.class.getName(), "processCacheInstance", result);
        }
        else
        {
          LOG.log(Level.WARNING, "Failed to perform house keeping for " + cacheInstanceHome.getPath()
              + " due to suspicious invalid rendition cache data detected.");

          LOG.exiting(CacheStrategy.class.getName(), "processCacheInstance", false);
        }
      }
      else
      {
        Calendar lastModified = AtomDate.valueOf(cacheInstanceHome.lastModified()).getCalendar();
        boolean result = clean(cacheInstanceHome, lastModified);
        LOG.exiting(CacheStrategy.class.getName(), "processCacheInstance", result);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Excepiton happened during Cleaning job caches", e);
    }
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

  private boolean validateCache(File cacheInstanceHome)
  {
    return new File(cacheInstanceHome, cacheInstanceHome.getName()).exists()
        && (Job.getResultFile(cacheInstanceHome).exists() || Job.getError(cacheInstanceHome) != null);
  }

  private boolean useMinute()
  {
    return (!useNewAgeThreshold && age_threshold == 0);
  }

}
