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
import java.util.Calendar;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.common.io.FileUtil;

public abstract class AbstractStrategy
{
  private static final Logger LOG = Logger.getLogger(AbstractStrategy.class.getName());

  public static File shareRoot = new File(ConcordConfig.getInstance().getSharedDataRoot());

  private static float result = 1.0f;

  protected static final String RENAME_TAG = ".keep.";

  protected static int criticalAgeThreshold;

  protected boolean useNewAgeThreshold;

  protected static Float size_threshold;

  protected static int age_threshold;

  public static String getRenameTag()
  {
    return RENAME_TAG;
  }

  public Calendar getComparedCalendar()
  {
    Calendar _nDaysBefore = AtomDate.valueOf(Calendar.getInstance()).getCalendar();
    /*
     * if (getAgeThreshold() == 0) { _nDaysBefore.add(Calendar.DAY_OF_MONTH, -DRAFT_HK_DELAY_EXEC_TOLERANCE_IN_DAY); } else {
     * _nDaysBefore.add(Calendar.DAY_OF_MONTH, -getAgeThreshold()); }
     */
    _nDaysBefore.add(Calendar.DAY_OF_MONTH, -getAgeThreshold());
    return _nDaysBefore;
  }

  public boolean cleanSpecificDir(String dirPath)
  {
    File keptFile = new File(dirPath + RENAME_TAG + UUID.randomUUID().toString());
    if (new File(dirPath).renameTo(keptFile))
    {
      FileUtil.cleanDirectory(keptFile);
      if (keptFile.delete())
      {
        if (LOG.isLoggable(Level.INFO))
        {
          LOG.log(Level.INFO, "Draft was cleaned by house keeping routine. The path is " + dirPath);
        }
        return true;
      }
      else
      {
        LOG.log(Level.WARNING, "Failed to perform house keeping due to delete failed. The path is " + dirPath);
        return false;
      }
    }
    else
    {
      LOG.log(Level.WARNING, "Failed to perform house keeping due to rename failed. The path is " + dirPath);
      return false;
    }
  }

  public boolean cleanSpecificDir(DraftDescriptor draftDescriptor, Calendar lastAccess, String dirPath)
  {
    Calendar _nDaysBefore = getComparedCalendar();
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

  public boolean clean(DraftDescriptor draftDescriptor, Calendar lastAccess)
  {
    return cleanSpecificDir(draftDescriptor, lastAccess, draftDescriptor.getInternalURI());
  }

  public AbstractStrategy()
  {
    // Check whether to housekeeping more stuffs for saving much storage on NFS server
    if (getSharedDiskUsedRate(true) > getSizeThresholdRate())
    {
      useNewAgeThreshold = true;
    }
  }

  /**
   * 
   * @return the size threshold rate
   */
  protected float getSizeThresholdRate()
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

  protected float getSharedDiskUsedRate(boolean bForceRefresh)
  {
    if (bForceRefresh)
    {
      result = 1.0f - ((float) shareRoot.getUsableSpace()) / shareRoot.getTotalSpace();
    }
    return result;
  }

  protected Float getSizeThreshold()
  {
    return size_threshold;
  }

  /**
   * 
   * @return The date time to be considered to clean useless stuffs
   */
  public int getAgeThreshold()
  {
    return useNewAgeThreshold ? criticalAgeThreshold : (age_threshold != 0 ? age_threshold : criticalAgeThreshold);
  }

}
