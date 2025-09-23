/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job;

import java.io.BufferedOutputStream;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.channels.OverlappingFileLockException;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.platform.Platform;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.Work;
import com.ibm.websphere.asynchbeans.WorkException;
import com.ibm.websphere.asynchbeans.WorkManager;

public abstract class Job implements Runnable, Work
{
  private static final Logger LOG = Logger.getLogger(Job.class.getName());

  public static final String WAS_THREAD_POOL = "was_thread_pool";
  public static final String CONCORD_JOB_POOL = "concord_job_pool";

  public static final String RESULT = "result.";
  public static final String ERROR_RESULT = "error.json";
  public static final String ENTRY_RESULT_SUFFIX = "entry";
  public static final String MEDIA_RESULT_SUFFIX = "media";
  public static final String ZIP_RESULT_SUFFIX = "zip";
  public static final String NONE_RESULT_SUFFIX = "none";

  // '#' is not a legal character in URI, so it will cause Symphony conversion issue. 
  // Replace '#' with '~'
  public static final char SEPARATOR = '~';

  public static final String CACHE_AGE_BIT = ".age.";

  public static final String JOB_HOME;

  // FIXME: copy cookies between threads, because they are thread local
  // should be deprecated when new S2S arrived
  public URLConfig config;
  
  private long wkThreadStartTime;

  private static final Logger LOGGER = Logger.getLogger(Job.class.getName());

  protected Vector<JobListener> jobListeners = new Vector<JobListener>();

  static
  {
    if (Boolean.TRUE.toString().equals(System.getProperty(WAS_THREAD_POOL)))
    {
      /*
       * Do not remove below statements, since they are preserved for switching to WAS managed thread pool.
       */
//      ThreadPoolMgr tpMgr = (ThreadPoolMgr)WsServiceRegistry.getService(this, ThreadPoolMgr.class);
//      ThreadPool jobThreadPool = tpMgr.getThreadPool("Concord_Job_Pool");

      JOB_HOME = findJobHome();
    }
    else
    {
      JOB_HOME = findJobHome();
    }
  }

  protected File errorFile;

  protected Object result;

  private FileChannel lockFileChannel;
  private FileOutputStream lockFileOS;
  private FileLock lock;
  protected WorkManager workManager;

  protected JobContext jobContext;

  public Job(JobContext jobContext)
  {
    this.jobContext = jobContext;

    errorFile = new File(jobContext.getWorkingDir(), ERROR_RESULT);

    aquireLocker();
  }

  public JobContext getJobContext()
  {
    return jobContext;
  }
  
  
  public String schedule()
  {
    try
    {
      lock = lockFileChannel.tryLock();
      if (lock != null)
      {
        LOGGER.log(Level.FINE, jobContext.getJobId() + " started.");

        for (int i = 0; i < jobListeners.size(); i++)
        {
          jobListeners.get(i).aboutToSchedule(jobContext);
        }

        boolean shouldSchedule = true;
        for (int i = 0; i < jobListeners.size(); i++)
        {
          shouldSchedule = shouldSchedule && jobListeners.get(i).shouldSchedule(jobContext);
        }

        if (shouldSchedule)
        {
          if (workManager == null)
            workManager = Platform.getWorkManager();

          workManager.startWork(this);
        }
        else
        {
          return null;
        }

        for (int i = 0; i < jobListeners.size(); i++)
        {
          jobListeners.get(i).scheduled(jobContext);
        }
      }
      else
      {
        LOGGER.log(Level.INFO, jobContext.getJobId() + " joined from Remote Process.");
        release(jobContext.getJobId(), lock, lockFileChannel, lockFileOS, "[scheduling job]");

        for (int i = 0; i < jobListeners.size(); i++)
        {
          jobListeners.get(i).joined(jobContext, false);
        }
      }
      return jobContext.getJobId();
    }
    catch(WorkException e)
    {
      LOGGER.log(Level.SEVERE, jobContext.getJobId() + " Failed to start work", e);
      release(jobContext.getJobId(), lock, lockFileChannel, lockFileOS, "[scheduling job]");
      throw new IllegalStateException("Failed to start work", e);
    }
    catch (OverlappingFileLockException e)
    {
      LOGGER.log(Level.INFO, jobContext.getJobId() + " joined from Local Thread.");
      release(jobContext.getJobId(), lock, lockFileChannel, lockFileOS, "[scheduling job]");

      for (int i = 0; i < jobListeners.size(); i++)
      {
        jobListeners.get(i).joined(jobContext, true);
      }

      return jobContext.getJobId();
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, jobContext.getJobId() + " Lock file error. The scheduled job was cancelled abnormally.", e);
      throw new IllegalStateException("Lock file error. The scheduled job was cancelled abnormally.", e);
    }
  }

  public final void run()
  {
    this.wkThreadStartTime = System.currentTimeMillis();
    boolean bSucc = false;
    /*
     * Copy cookies from WAS thread into Concord Job thread.
     */
    if (config != null)
    {
      URLConfig.fromInstance(config);
      LOG.info(new LogEntry(URLConfig.getRequestID(), "Start new Job").toString());
    }

    try
    {
      if (errorFile.exists())
      {
        errorFile.delete();
      }

      LOG.log(Level.FINE, "Job Execution Started. {0}", jobContext.getWorkingDir());
      putResult(result = exec());
      LOG.log(Level.FINE, "Job Execution Completed. {0}", jobContext.getWorkingDir());

      try
      {
        new File(jobContext.getWorkingDir(), System.currentTimeMillis() + CACHE_AGE_BIT + jobContext.getJobId()).createNewFile();
      }
      catch (IOException e)
      {
        LOGGER.log(Level.WARNING, "Create Cache Age Bit File Failed.", e);
        throw new JobExecutionException(-1, e);
      }
      
      bSucc = true;
    }
    catch (JobExecutionException e)
    {
      JSONObject data = e.getData();
      String problemID = getProblemID();
      LOGGER.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID()," problem_id " + problemID + " JobExecutionException " + e.toString()).toString());
      if (data != null)
      {
        e.getData().put(HttpSettingsUtil.PROBLEM_ID, problemID);
      }
      else 
      {
        JSONObject dataJson = new JSONObject();
        dataJson.put(HttpSettingsUtil.PROBLEM_ID, problemID);
        e.setData(dataJson);
      }
      putError(e);
    }
    catch (Exception e)
    {
      LOGGER.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID()," Exception " + e.toString()).toString());
      putError(e);
    }
    finally
    {
      releaseLocker();

      for (int i = 0; i < jobListeners.size(); i++)
      {
        if (bSucc)
          jobContext.setResult(result);
        jobListeners.get(i).done(jobContext, bSucc);
      }
      
      /*
       * Clear cookies from Concord Job thread, since thread in pool will be reused.
       */
      URLConfig.remove();
    }
  }

// TODO: WAS has defects that invoke the release() too fast, need rollback the changes of Work Item 174419  
//  public void release()
//  {
//    if (!isFinished(jobContext.getWorkingDir(), jobContext.getJobId()))
//    {
//      LOGGER.log(Level.WARNING, "Job Execution Timeout: {0}", jobContext.getJobId());
//
//      putError(new JobExecutionException(100, new IllegalStateException("Job Execution Timeout Exception")));
//
//      releaseLocker();
//
//      /*
//       * Clear cookies from Concord Job thread, since thread in pool will be reused.
//       */
//      URLConfig.remove();
//
//      /*
//       * The result of calling interrupt() on a thread that is blocked in I/O is platform-dependent. On Unix operating systems such as
//       * Solaris and Linux, the interrupt() method causes the blocked I/O method to throw an InterruptedIOException. Unfortunately, Windows
//       * operating systems do not support interruptible I/O, so on those platforms a thread blocked on an I/O method remains blocked after
//       * it has been interrupted.
//       * 
//       * More specific to our usage over NFS, the result of interrupt depends on the NFS implementation as well as platform implementation.
//       */
//      Thread.currentThread().interrupt();
//    }
//  }
  
  public void release()
  {
    long timeCost = System.currentTimeMillis() - this.wkThreadStartTime;
    final String jobId = jobContext.getJobId();
    LOG.log(Level.INFO, "Was Release Work : " + jobId + " after " + timeCost + "ms");
    // the work manager default timeout.
    long timeout = 150000;
    if (timeout > 1000 && timeCost < (timeout - 1000))
    {
      LOG.log(Level.INFO, "Work actually is NOT time out : " + jobId + " and less than " + timeout + "ms");
      Timer timer = new Timer();
      timer.schedule(new TimerTask()
      {
        public void run()
        {
          LOG.log(Level.INFO, "Execute timer task in release: " + jobId);
          releaseTask();
        }
      }, (timeout - timeCost - 1000));
    }
    else
    {
      releaseTask();
    }
    LOG.log(Level.FINER, "End of release: " + jobId);
  }
  
  public void releaseTask()
  {
    if (!isFinished(jobContext.getWorkingDir(), jobContext.getJobId()))
    {
      LOGGER.log(Level.WARNING, "Job Execution Timeout: {0}", jobContext.getJobId());

      putError(new JobExecutionException(100, new IllegalStateException("Job Execution Timeout Exception")));

      releaseLocker();

      /*
       * Clear cookies from Concord Job thread, since thread in pool will be reused.
       */
      URLConfig.remove();
      
      /*
       * The result of calling interrupt() on a thread that is blocked in I/O is platform-dependent. On Unix operating systems such as
       * Solaris and Linux, the interrupt() method causes the blocked I/O method to throw an InterruptedIOException. Unfortunately, Windows
       * operating systems do not support interruptible I/O, so on those platforms a thread blocked on an I/O method remains blocked after
       * it has been interrupted.
       * 
       * More specific to our usage over NFS, the result of interrupt depends on the NFS implementation as well as platform implementation.
       */
      Thread.currentThread().interrupt();
    }
  }

  public void join() throws InterruptedException
  {
    while (!isFinished(getJobContext().getWorkingDir(), getJobContext().getJobId()))
    {
      Thread.sleep(1000);
    }
  }

  public void addListener(JobListener jobListener)
  {
    jobListeners.add(jobListener);
  }

  public void removeListener(JobListener jobListener)
  {
    jobListeners.remove(jobListener);
  }

  public JobExecutionException getError()
  {
    return getError(getJobContext().getWorkingDir());
  }

  protected void putError(Throwable e)
  {
    if (e instanceof JobExecutionException)
    {
      try
      {
        LOGGER.log(Level.SEVERE, errorFile.getPath(), e);
        writeJSONError2File(errorFile, (JobExecutionException) e);
      }
      catch (IOException ioe)
      {
        LOGGER.log(Level.WARNING, "Record JobExecutionException error to error.json failed.", ioe);
      }
    }
    else
    {
      LOGGER.log(Level.WARNING, "Job error not in JobExecutionException.", e);
    }
  }

  protected void writeMedia2File(File destFile, InputStream sourceStream) throws IOException
  {
    OutputStream os = null;
    try
    {
      os = new BufferedOutputStream(new FileOutputStream(destFile));
      byte[] bytes = new byte[4096];
      int readLendgh = 0;
      while ((readLendgh = sourceStream.read(bytes)) != -1)
      {
        os.write(bytes, 0, readLendgh);
      }
    }
    catch (FileNotFoundException e)
    {
      throw e;
    }
    catch (IOException e)
    {
      throw e;
    }
    finally
    {
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (IOException ioe)
        {
          LOGGER.log(Level.WARNING, "Write Media to File Failed.", ioe);
        }
      }
    }
  }

  protected void writeString2File(File destFile, String msg) throws IOException
  {
    BufferedWriter errorWriter = null;
    try
    {
      errorWriter = new BufferedWriter(new FileWriter(destFile));
      if (msg != null)
      {
        errorWriter.write(msg);
      }
      else
      {
        errorWriter.write("N/A");
      }
    }
    catch (IOException e)
    {
      throw e;
    }
    finally
    {
      if (errorWriter != null)
      {
        try
        {
          errorWriter.close();
        }
        catch (IOException ioe)
        {
          LOGGER.log(Level.WARNING, "Write String to File Failed.", ioe);
        }
      }
    }
  }

  protected void writeJSONError2File(File destFile, JobExecutionException je) throws IOException
  {
    OutputStream errorFileStream = null;
    try
    {
      errorFileStream = new FileOutputStream(destFile);
      je.toJSON().serialize(errorFileStream, true);
    }
    catch (FileNotFoundException e)
    {
      throw e;
    }
    catch (IOException e)
    {
      throw e;
    }
    finally
    {
      if (errorFileStream != null)
      {
        try
        {
          errorFileStream.close();
        }
        catch (IOException ioe)
        {
          LOGGER.log(Level.WARNING, "Write JSON Error to File Failed.", ioe);
        }
      }
    }
  }

  private final void aquireLocker()
  {
    File workingDir = jobContext.getWorkingDir();
    if (!workingDir.exists())
    {
      workingDir.mkdirs();
    }

    if (workingDir.exists())
    {
      String jobId = jobContext.getJobId();
      File lockFile = new File(workingDir, jobId);
      try
      {
        lockFile.createNewFile();
        lockFileOS = new FileOutputStream(lockFile);
        lockFileChannel = lockFileOS.getChannel();
      }
      catch (IOException e)
      {
        LOGGER.log(Level.SEVERE, lockFile.getPath() + " Create lock file failed.", e);
        throw new IllegalStateException(e);
      }
    }
    else
    {
      LOGGER.log(Level.SEVERE, workingDir.getPath() + " Create lock file folder failed.");
      throw new IllegalStateException();
    }
  }

  private final void releaseLocker()
  {
    IllegalStateException ise = null;
    try
    {
      if (lock != null)
      {
        lock.release();
      }
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, jobContext.getJobId() + " Release lock file failed.", e);
      ise = new IllegalStateException(e);
    }
    finally
    {
      lock = null;
    }

    try
    {
      if (lockFileChannel != null)
      {
        lockFileChannel.close();
      }
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, jobContext.getJobId() + " Close lock file channel failed.", e);
      ise = new IllegalStateException(e);
    }
    finally
    {
      lockFileChannel = null;
    }

    try
    {
      if (lockFileOS != null)
      {
        lockFileOS.close();
      }
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, jobContext.getJobId() + " Close lock file failed.", e);
      ise = new IllegalStateException(e);
    }
    finally
    {
      lockFileOS = null;
    }

    if (ise != null)
    {
      throw ise;
    }

    LOGGER.log(Level.FINE, jobContext.getJobId() + " finished.");
  }

  public Object getCachedResult()
  {
    return result;
  }

  public abstract Object exec() throws JobExecutionException;

  public abstract void putResult(Object result);

  public abstract File getResultFile();



  public static final JobExecutionException getError(File workingDir)
  {
    File errorResult = new File(workingDir, ERROR_RESULT);
    if (!errorResult.exists())
    {
      return null;
    }

    InputStream errorStream = null;
    try
    {
      errorStream = new FileInputStream(errorResult);
      JSONObject error = JSONObject.parse(errorStream);
      String errorCode = (String) error.get(JobExecutionException.ERROR_CODE);
      String errorMsg = (String) error.get(JobExecutionException.ERROR_MSG);
      String userAction = (String) error.get(JobExecutionException.USER_ACTION);
      int errorStatus = ((Long) error.get(JobExecutionException.STATUS_CODE)).intValue();
      JSONObject data = (JSONObject)error.get(JobExecutionException.DATA);
      JobExecutionException jee = new JobExecutionException(errorCode, errorMsg, userAction, errorStatus, null);
      jee.setData(data);
      return jee;
    }
    catch (IOException ioe)
    {
      LOGGER.log(Level.WARNING, ioe.getLocalizedMessage());
    }
    finally
    {
      if (errorStream != null)
      {
        try
        {
          errorStream.close();
        }
        catch (IOException ioe)
        {
          LOGGER.log(Level.WARNING, "Read Error from Error JSON Failed.", ioe);
        }
      }
    }

    return null;
  }

  public static final File getResultFile(File workingDir)
  {
    File entryResult = new File(workingDir, RESULT + ENTRY_RESULT_SUFFIX);
    if (entryResult.exists())
    {
      return entryResult;
    }

    File mediaResult = new File(workingDir, RESULT + MEDIA_RESULT_SUFFIX);
    if (mediaResult.exists())
    {
      return mediaResult;
    }

    File zipResult = new File(workingDir, RESULT + ZIP_RESULT_SUFFIX);
    if (zipResult.exists())
    {
      return zipResult;
    }

    File noneResult = new File(workingDir, RESULT + NONE_RESULT_SUFFIX);
    if (noneResult.exists())
    {
      return noneResult;
    }

    return new File("");
  }

  public static final boolean isFinished(File workingDir, String jobId)
  {
    return Job.isLockable(workingDir, jobId) && ((Job.getResultFile(workingDir).exists()) || (Job.getError(workingDir) != null));
  }

  public static final boolean isFinishedSuccess(File workingDir, String jobId)
  {
    return Job.isLockable(workingDir, jobId) && Job.getResultFile(workingDir).exists();
  }

  public static final boolean isRunning(File workingDir, String jobId)
  {
    return !Job.isLockable(workingDir, jobId) && ((!Job.getResultFile(workingDir).exists()) && (Job.getError(workingDir) == null));
  }
  
  public static final boolean isRunning2(File workingDir, String jobId)
  {
    return ((!Job.getResultFile(workingDir).exists()) && (Job.getError(workingDir) == null));
  }

  public static final boolean isScheduling(File workingDir, String jobId)
  {
    return Job.isLockable(workingDir, jobId) && ((!Job.getResultFile(workingDir).exists()) && (Job.getError(workingDir) == null));
  }

  public static final boolean isBroken(File workingDir, String jobId)
  {
    return Job.isLockable(workingDir, jobId) && ((!Job.getResultFile(workingDir).exists()) && (Job.getError(workingDir) == null));
  }

  public static final long hitCache(File workingDir, String jobId)
  {
    File[] lastVisitRecordFile = workingDir.listFiles(new FilenameFilter()
    {
      public boolean accept(File dir, String name)
      {
        String REG_EXP = "\\d+" + CACHE_AGE_BIT + dir.getName();
        Pattern pattern = Pattern.compile(REG_EXP);
        Matcher matcher = pattern.matcher(name);
        return matcher.matches();
      }
    });

    if (lastVisitRecordFile == null)
    {
      LOG.log(Level.WARNING, "Failed to update cache last visit timestamp.", workingDir.getPath());

      return -1;
    }

    if (lastVisitRecordFile.length == 1)
    {
      long result = System.currentTimeMillis();
      String newName = result + lastVisitRecordFile[0].getName().substring(lastVisitRecordFile[0].getName().lastIndexOf(CACHE_AGE_BIT));
      if (!lastVisitRecordFile[0].renameTo(new File(lastVisitRecordFile[0].getParentFile(), newName)))
      {
        LOG.log(Level.WARNING, "Failed to update cache last visit timestamp.", workingDir.getPath());
        result = -1;
      }

      return result;
    }
    else if (lastVisitRecordFile.length == 0)
    {
      long result = workingDir.lastModified();
      try
      {
        new File(workingDir, result + CACHE_AGE_BIT + jobId).createNewFile();
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "Failed to update cache last visit timestamp. " + workingDir.getPath(), e);
        result = -1;
      }

      return result;
    }
    else
    {
      LOG.log(Level.WARNING, "Failed to update cache last visit timestamp.", workingDir.getPath());

      return -1;
    }
  }

  private static final boolean isLockable(File workingDir, String jobId)
  {
    boolean lockable = false;
    FileOutputStream lockFileOS = null;
    FileChannel lockFileChannel = null;
    FileLock lock = null;

    try
    {
      File lockFile = new File(workingDir, jobId);
      lockFileOS = new FileOutputStream(lockFile);
      lockFileChannel = lockFileOS.getChannel();
      lock = lockFileChannel.tryLock();
      if (lock != null)
      {
        lockable = true;
      }
      else
      {
        LOGGER.log(Level.FINE, jobId + " is executing.");
        lockable = false;
      }
    }
    catch (OverlappingFileLockException e)
    {
      LOGGER.log(Level.FINE, jobId + " is executing with OverlappingFileLockException.");
      lockable = false;
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, jobId + " Lock file error when detecting job finished.", e);
      throw new IllegalStateException("Lock file error when detecting job finished.", e);
    }
    finally
    {
      release(jobId, lock, lockFileChannel, lockFileOS, "[querying job status]");
    }

    return lockable;
  }

  private static void release(String jobId, FileLock lock, FileChannel lockFileChannel, FileOutputStream lockFileOS, String when)
  {
    IllegalStateException ise = null;
    if (lock != null)
    {
      try
      {
        lock.release();
      }
      catch (IOException ioe)
      {
        LOGGER.log(Level.SEVERE, jobId + " Release lock file error.", ioe);
        ise = new IllegalStateException("Release lock file error. " + when, ioe);
      }
    }

    if (lockFileChannel != null)
    {
      try
      {
        lockFileChannel.close();
      }
      catch (IOException ioe)
      {
        LOGGER.log(Level.SEVERE, jobId + " Close lock file channel error.", ioe);
        ise = new IllegalStateException("Close lock file channel error. " + when, ioe);
      }
    }

    if (lockFileOS != null)
    {
      try
      {
        lockFileOS.close();
      }
      catch (IOException ioe)
      {
        LOGGER.log(Level.SEVERE, jobId + " Close lock file string error.", ioe);
        ise = new IllegalStateException("Close lock file string error. " + when, ioe);
      }
    }

    if (ise != null)
    {
      throw ise;
    }
  }

  private static String findJobHome()
  {
    String jobHome = ConcordConfig.getInstance().getSharedDataRoot() + File.separator + "job_cache";
    LOG.log(Level.INFO, "job home is " + jobHome);
    return jobHome;
  }
  
  /**
   * @return
   * @throws Exception 
   */
  private String getProblemID()
  {
    String requestID = HttpSettingsUtil.decrypt(URLConfig.getRequestID());
    String responseID = HttpSettingsUtil.decrypt(URLConfig.getResponseID());
    String problemID = HttpSettingsUtil.encrypt(requestID + "|" + responseID);
    return problemID;
  }
}
