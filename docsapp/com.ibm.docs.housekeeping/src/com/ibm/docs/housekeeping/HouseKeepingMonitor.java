/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping;

import java.io.File;
import java.io.FileFilter;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.job.Job;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.draft.DraftComponent;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.housekeeping.bean.Frequency;
import com.ibm.docs.housekeeping.migration.Migration;
import com.ibm.docs.housekeeping.service.HouseKeepingServiceImpl;
import com.ibm.docs.housekeeping.util.HouseKeepingUtil;

public class HouseKeepingMonitor
{
  private static final Logger LOG = Logger.getLogger(HouseKeepingMonitor.class.getName());

  private static HouseKeepingMonitor hkBean = new HouseKeepingMonitor();

  private final static Long MILLISECOND_TO_HOUR = (long) (60 * 60 * 1000);

  private static final int timeInterval = 60000; // 1 minute

  private static final int maxTryiedNumber = 480; // totally, 8 hours

  private static final int halfHKThreshold = 360; // 6 hours

  private static final int maxRemainderTriedNumber = 240; // 4 hours to handle tasks in thread queue

  private static HouseKeepingTimerListener hkTimerListener;

  private boolean isMAEnabled = false;

  private boolean running = false;

  private long beforeHK = 0L;

  private HouseKeepingMonitor()
  {
    // Singleton
  }

  public static HouseKeepingMonitor getInstance()
  {
    return hkBean;
  }

  /**
   * To schedule housekeeping task to timer manager
   */
  public void initListeners(boolean isMAEnabled)
  {
    LOG.log(Level.FINE, "HouseKeeping start initialization");
    this.isMAEnabled = isMAEnabled;
    Frequency frequency = HouseKeepingUtil.getFrequency();
    int interval = 7 * 24;// default weekly

    boolean isOnSunday = false; // mark whether immediate execution
    switch (frequency)
      {
        case now :
          break;
        case hourly :
          interval = 1;
          break;
        case daily :
          interval = 24;
          break;
        case weekly :
          isOnSunday = true;
          interval = 7 * 24;
          break;
        case monthly :
          isOnSunday = true;
          interval = 7 * 24 * 30;
          break;
      }

    if (hkTimerListener == null)
    {
      hkTimerListener = new HouseKeepingTimerListener();
    }

    Platform.getHouseKeepingTimerManager().schedule(hkTimerListener, getFirstScheduledDate(isOnSunday), interval * MILLISECOND_TO_HOUR);
    LOG.log(Level.FINE, "HouseKeeping initialization end.");
  }

  private Date getFirstScheduledDate(boolean isOnSunday)
  {
    List<String> theList = HouseKeepingUtil.getScheduledAtOnce();
    boolean isTargetedEnv = theList.contains(HouseKeepingPolicy.getDataCenter().toLowerCase());
    if (isTargetedEnv)
    {
      return getOneMinuteLater();
    }
    return isOnSunday ? getSchedularStartDate(0) : getOneMinuteLater();
  }

  private Date getOneMinuteLater()
  {
    Calendar calendar = Calendar.getInstance();
    calendar.setTime(new Date());
    calendar.add(Calendar.MINUTE, 1);
    return calendar.getTime();
  }

  /**
   * 
   * @param weekIndex
   *          current week (0), next week (1), two weeks later(2)
   * @return
   */
  private Date getSchedularStartDate(int weekIndex)
  {
    int fixedHour = 13; // Start house keeping at 1pm~2pm on Sunday GMT
    // A3 > Sunday morning 8pm or so
    // G3 > Sunday afternoon 2pm or so
    // S3 > Sunday night 9pm or so
    Calendar calendar = Calendar.getInstance();
    calendar.setTime(new Date());
    int week = calendar.get(Calendar.DAY_OF_WEEK) - 1;
    // If today is Sunday and before 5pm, schedule to run housekeeping
    if (week == 0)
    {
      int hour = calendar.get(Calendar.HOUR_OF_DAY);
      if (hour < fixedHour)
      {
        calendar.add(Calendar.HOUR, (fixedHour - hour));
        return calendar.getTime();
      }
    }
    // To schedule in the evening on Sunday
    calendar = Calendar.getInstance();
    calendar.setFirstDayOfWeek(Calendar.MONDAY);
    int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
    if (1 == dayOfWeek)
    {
      calendar.add(Calendar.DAY_OF_MONTH, -1);
    }
    int day = calendar.get(Calendar.DAY_OF_WEEK);
    calendar.add(Calendar.DATE, 7 * weekIndex); // current week;
    calendar.add(Calendar.DATE, calendar.getFirstDayOfWeek() - day);
    calendar.add(Calendar.DATE, 6); // add six days
    int hours = calendar.get(Calendar.HOUR_OF_DAY);
    calendar.add(Calendar.HOUR, (fixedHour - hours));
    return calendar.getTime();
  }

  public void process()
  {
    if (running)
    {
      return; // House keeping is still running...
    }
    synchronized (hkBean)
    {
      running = true;
    }

    if (isMAEnabled)
    {
      // Please create MA policy for housekeeping if MA is enabled in the future
      LOG.log(Level.INFO, "New House Keeping is not supported on SmartCloud environments with MA enabled.");
      return;
    }

    DraftComponent draftComp = (DraftComponent) Platform.getComponent(DraftComponent.COMPONENT_ID);
    File draftHome = new File(draftComp.getDraftHome());
    beforeHK = draftHome.getUsableSpace();
    LOG.log(Level.INFO, "House Keeping remains space {0} bytes(s) for draft. {1}", new Object[] { beforeHK, draftHome.getPath() });
    LOG.log(Level.INFO, "House Keeping Started.");
    File jobHome = new File(Job.JOB_HOME);
    HouseKeepingThreadManager manager = HouseKeepingThreadManager.getInstance();
    try
    {
      File[] orgHomes = draftHome.listFiles(new OrgHomeFilter());
      if (orgHomes != null && orgHomes.length != 0)
      {
        final long startTime = System.currentTimeMillis();
        Migration migration = new Migration();
        boolean isMigrationEnabled = migration.isMigrationEnabled();
        boolean isHousekeepingEnabled = !isMigrationEnabled;
        manager.submitTask(new HouseKeepingServiceImpl(orgHomes, migration, isMigrationEnabled));
        int triedNumber = 0;
        do
        {
          try
          {
            Thread.sleep(timeInterval);
          }
          catch (InterruptedException e)
          {
            LOG.log(Level.WARNING, "Thread is interrupted abnormaly.", e);
          }
          if (manager.isAllCompleted())
          {
            this.logResult(isMigrationEnabled, isHousekeepingEnabled, startTime, manager, draftHome, jobHome);
            // migration is done and 6 hours more may be used for housekeeping, start the housekeeping
            if (triedNumber < halfHKThreshold && !isHousekeepingEnabled)
            {
              LOG.log(Level.INFO, "Completed House Keeping migration task. With time allowance, start normal House Keeping task...");
              manager.submitTask(new HouseKeepingServiceImpl(orgHomes, migration, false));
              isHousekeepingEnabled = true;
              isMigrationEnabled = false;
              triedNumber++;
            }
            else
            {
              break;
            }
          }
          else
          {
            triedNumber++;
          }
        }
        while (triedNumber < maxTryiedNumber);
        if (triedNumber == maxTryiedNumber)
        {
          LOG.log(Level.WARNING,
              "Not Completed this time - {0} hours passed before the complete of House Keeping... Stop adding new threads in thread pool!",
              new Object[] { maxTryiedNumber * timeInterval / 3600 * 1000 });
          if (manager.getThreadPool() != null)
          {
            manager.cancelHouseKeepingMainTask(); // Cancel the main schedular task
            int waittingNumber = 0;
            do
            {
              try
              {
                Thread.sleep(timeInterval);
              }
              catch (InterruptedException e)
              {
                LOG.log(Level.WARNING, "Thread is interrupted abnormaly.", e);
              }
              if (manager.isAllCompleted())
              {
                this.logResult(isMigrationEnabled, isHousekeepingEnabled, startTime, manager, draftHome, jobHome);
                break;
              }
              waittingNumber++;
            }
            while (waittingNumber < maxRemainderTriedNumber); // 4 hours more to complete tasks in queue
            if (waittingNumber == maxRemainderTriedNumber && manager.getThreadPool() != null)
            {
              manager.cancelAllTasks();
              LOG.log(
                  Level.WARNING,
                  "Not Completed this time - {0} hours passed before the complete of House Keeping... Stop threads in thread pool completely!",
                  new Object[] { (maxRemainderTriedNumber + maxTryiedNumber) * timeInterval / 3600 * 1000 });
            }
          }
        }
      }
    }
    catch (ConcordException e)
    {
      LOG.log(Level.SEVERE, "Exception happened during House Keeping...", e);
    }
    finally
    {
      synchronized (hkBean)
      {
        running = false;
      }
    }
  }

  private void logResult(boolean isMigrationEnabled, boolean isHousekeepingEnabled, long startTime, HouseKeepingThreadManager manager,
      File draftHome, File jobHome)
  {
    long endTime = System.currentTimeMillis();
    if (isMigrationEnabled)
    {
      long[] cleanedMigrations = manager.getCleanedMigrations();
      LOG.log(Level.INFO, "House Keeping Migration Done. It takes about {0} s. (The time deviation is within 5 minutes)",
          new Object[] { (endTime - startTime) / 1000 });
      LOG.log(Level.INFO, "House Keeping cleaned {0} migration draft(s) successfully. failed migration count is {1}. ", new Object[] {
          cleanedMigrations[0], cleanedMigrations[1] });
    }
    if (isHousekeepingEnabled)
    {
      long cleanedCaches = manager.getCleanedCaches();
      long cleanedSnapshots = manager.getCleanedSnapshots();
      long cleanedUploads = manager.getCleanedUploadDrafts();
      LOG.log(Level.INFO, "House Keeping Done. It takes about {0} s. (The time deviation is within 5 minutes)",
          new Object[] { (endTime - startTime) / 1000 });
      LOG.log(Level.INFO, "House Keeping cleaned {0} cache(s).", new Object[] { cleanedCaches });
      LOG.log(Level.INFO, "House Keeping cleaned {0} snapshot draft(s).", new Object[] { cleanedSnapshots });
      LOG.log(Level.INFO, "House Keeping cleaned {0} upload draft(s).", new Object[] { cleanedUploads });
    }
    long afterHK = draftHome.getUsableSpace();
    LOG.log(Level.INFO, "House Keeping remains space {0} bytes(s) for draft. {1}", new Object[] { afterHK, draftHome.getPath() });
    LOG.log(Level.INFO, "House Keeping remains space {0} bytes(s) for cache. {1}",
        new Object[] { jobHome.getUsableSpace(), jobHome.getPath() });
    LOG.log(Level.INFO, "House Keeping cleans space nearly - {0} bytes(s)}", new Object[] { afterHK - beforeHK });
  }
}

class OrgHomeFilter implements FileFilter
{
  public boolean accept(File orgHome)
  {
    return orgHome.isDirectory() && !"stateful_draft_list".equalsIgnoreCase(orgHome.getName())
        && !"draft_temp".equalsIgnoreCase(orgHome.getName()) && !"global_cache".equalsIgnoreCase(orgHome.getName());
  }
}
