/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.job;

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

import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.exception.JobExecutionException;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.platform.util.WASConfigHelper;
import com.ibm.concord.viewer.services.fileUtil.NativeFileLocker;
import com.ibm.concord.viewer.spi.job.IConversionJob;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.Work;
import com.ibm.websphere.asynchbeans.WorkException;

public abstract class Job implements Work, IConversionJob
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

  public static final String TIMESTAMP_FILE = "timestamp";

  // '#' is not a legal character in URI, so it will cause Symphony conversion issue.
  // Replace '#' with '~'
  public static final char SEPARATOR = '~';

  public static final String CACHE_AGE_BIT = ".age.";

//  public static final String JOB_HOME;

  public static final String FULLIMAGE = "pictures";

  public static final String STATE = "status.json";

  // FIXME: copy cookies between threads, because they are thread local
  // should be deprecated when new S2S arrived
  public URLConfig config;

  private static final Logger LOGGER = Logger.getLogger(Job.class.getName());

  private Vector<JobListener> jobListeners = new Vector<JobListener>();

  public volatile String currentType = Constant.STATUS_VIEW;

  private static Boolean isNativeLock = null;

//  static
//  {
//    JOB_HOME = findJobHome();
//  }

  protected File errorFile;

  protected Object result;

  // for windows
  private FileChannel lockFileChannel = null;

  private FileOutputStream lockFileOS = null;

  public FileLock lock = null;

  // for linux
  private String lockFileName = null;

  public int hd = -1;

  private ImportDraftFromRepositoryContext jobContext;

  public abstract void cleanFailure();

  private boolean isView = true;

  private volatile boolean completed = false;

  private volatile boolean shouldCancel = false;
  
  private long wkThreadStartTime = System.currentTimeMillis();
  
  public JOB_PRIORITY_TYPE jobPriority = JOB_PRIORITY_TYPE.NORMAL;
  
  protected String password;
  
  public void setPassword(String password) {
    this.password = password;
  }
  
  public String getPassword() {
    return this.password;    
  }

  public void setIsView(boolean isView)
  {
    this.isView = isView;
  }

  public boolean getIsView()
  {
    return this.isView;
  }

  public Job(ImportDraftFromRepositoryContext jobContext)
  {
    this(jobContext, false);
  }

  public Job(ImportDraftFromRepositoryContext jobContext, boolean isUpload)
  {
    if (isNativeLock == null) {
      isNativeLock = new Boolean(Platform.useNativeLock());
    }

    if (jobContext != null)
    {
      this.jobContext = jobContext;
      errorFile = new File(jobContext.getWorkingDir(), ERROR_RESULT);
      if (!isUpload)
      {
        aquireLocker();
      }
    }
  }

  public JobContext getJobContext()
  {
    return jobContext;
  }

  public final void scheduleUpload()
  {
    try
    {
      Platform.getUploadWorkManager().startWork(this);
    }
    catch (WorkException e)
    {
      LOGGER.log(Level.SEVERE, "Failed to start upload work for Document Id:" + getDocumentId() + " JobId:" + jobContext.getJobId(), e);
    }
  }

  public final String schedule()
  {
    NativeFileLocker locker = null;
    try
    {
      boolean locked = false;
      if (!isNativeLock)
      {
        lock = lockFileChannel.tryLock();
        locked = (lock != null);
      }
      else
      {
        locker = new NativeFileLocker();
        int lr = locker.lock(lockFileName);
        locked = (lr != -1 && lr != -2);
        hd = locked ? lr : -1;
      }
      if (locked)
      {
        LOGGER.log(Level.FINE, jobContext.getJobId() + " started.");
        LOGGER.log(Level.FINEST, "Trying to startWork for Document Id:{0} JobId:{1} ",
            new String[] { getDocumentId(), jobContext.getJobId() });
        if(!Constant.STATUS_PASSWORD_PROMPT.equalsIgnoreCase(this.getCurrentType()) ){
          cleanFailure();
        }        

        if (getCurrentType().equals(Constant.STATUS_VIEW) && hasUploadConversion())
        {
          setCurrentType(Constant.STATUS_MANAGE);
        }
        Platform.getWorkManager().startWork(this);
        for (int i = 0; i < jobListeners.size(); i++)
        {
          jobListeners.get(i).scheduled();
        }
      }
      else
      {
        LOGGER.log(Level.INFO, jobContext.getJobId() + " joined for Document Id:{0} JobId:{1}",
            new String[] { getDocumentId(), jobContext.getJobId() });
        if (!isNativeLock)
          release(jobContext.getJobId(), lock, lockFileChannel, lockFileOS, "[scheduling job]");
      }
      return jobContext.getJobId();
    }
    catch (WorkException e)
    {
      LOGGER.log(Level.SEVERE, "Failed to start work for Document Id:" + getDocumentId() + " JobId:" + jobContext.getJobId(), e);
      JobExecutionException jee = new JobExecutionException(ConversionException.EC_CONV_UNEXPECIFIED_ERROR, e);
      putError(jee);
      if (!isNativeLock)
        release(jobContext.getJobId(), lock, lockFileChannel, lockFileOS, "[scheduling job]");
      else
        LOGGER.log(Level.INFO, "[scheduling job failed] unlocke file return " + locker.unlock(hd));
      throw new IllegalStateException("Failed to start work", e);
    }
    catch (OverlappingFileLockException e)
    {
      LOGGER.log(Level.INFO,
          "Joined with OverlappingFileLockException for Document Id:" + getDocumentId() + " JobId:" + jobContext.getJobId());
      if (!isNativeLock)
        release(jobContext.getJobId(), lock, lockFileChannel, lockFileOS, "[scheduling job]");
      else
        LOGGER.log(Level.INFO, "[scheduling job failed] unlocke file return " + locker.unlock(hd));
      return jobContext.getJobId();
    }
    catch (IOException e)// only for trylock()
    {
      LOGGER.log(Level.SEVERE, "Lock file error. The scheduled job was cancelled abnormally for Document Id:" + getDocumentId() + " JobId:"
          + jobContext.getJobId(), e);
      JobExecutionException jee = new JobExecutionException(ConversionException.EC_CONV_UNEXPECIFIED_ERROR, e);
      putError(jee);
      release(jobContext.getJobId(), lock, lockFileChannel, lockFileOS, "[scheduling job]");
      throw new IllegalStateException("Lock file error. The scheduled job was cancelled abnormally.", e);
    }
  }

  public final void run()
  {
    LOGGER.log(Level.FINE, "Start to run conversion for Document Id:" + getDocumentId() + " JobId:" + jobContext.getJobId());
    long start = System.currentTimeMillis();
    this.wkThreadStartTime = start;
    /*
     * Copy cookies from WAS thread into Concord Job thread.
     */
    if (config != null)
    {
      URLConfig.fromInstance(config);
    }

    try
    {
      if (!getCurrentType().equals(Constant.STATUS_UPLOAD))
      {
        if (errorFile.exists())
        {
          errorFile.delete();
        }
        putResult(result = exec());
        LOGGER.log(Level.FINE, "putResult Successfully for Document Id:" + getDocumentId() + " JobId:" + jobContext.getJobId());

        try
        {
          hitCache(jobContext.getWorkingDir(), jobContext.getJobId());
        }
        catch (IOException e)
        {
          LOGGER.log(Level.WARNING, "Create Cache Age Bit File Failed.", e);
          throw new JobExecutionException(-1, e);
        }
      }
      else
      {
        exec();
        try
        {
          hitCache(jobContext.getWorkingDir(), jobContext.getJobId());
        }
        catch (IOException e)
        {
          LOGGER.log(Level.WARNING, "Create Cache Age Bit File Failed for upload conversion.", e);
        }
      }
      for (int i = 0; i < jobListeners.size(); i++)
      {
        jobListeners.get(i).done(true);
      }
    }
    catch (JobExecutionException e)
    {
      if (!getCurrentType().equals(Constant.STATUS_UPLOAD)/* &&!getCurrentType().equals("MANAGE") */)
      {
        JSONObject data = e.getData();
        String problemID = getProblemID();
        LOGGER.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            " problem_id %s , JobExecutionException %s .", problemID, e)).toString());
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
        LOGGER.log(Level.FINE, "putError Successfully for Document Id:" + getDocumentId() + " JobId:" + jobContext.getJobId());
      }
      for (int i = 0; i < jobListeners.size(); i++)
      {
        jobListeners.get(i).done(false);
      }
    }
    catch (Exception e)
    {
      LOGGER.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(" Exception ", e)).toString());
      putError(e);
    }
    finally
    {
      if (!isNativeLock)
        releaseLocker();
      else
      {
        if (hd > 0)
        {
          NativeFileLocker locker = new NativeFileLocker();
          int ret = locker.unlock(hd);
          LOGGER.log(Level.FINEST, "Conversion finished,Unlock File " + hd + " . And resut is " + ret);
        }
      }

      /*
       * Clear cookies from Concord Job thread, since thread in pool will be reused.
       */
      URLConfig.remove();
    }
    completed = true;
  }

  public void release()
  {
	    long timeCost = System.currentTimeMillis() - this.wkThreadStartTime;
	    final String jobId = jobContext.getJobId();
	    LOG.log(Level.INFO, "Was Release Work : " + jobId + " after " + timeCost + "ms");
	    long timeout = WASConfigHelper.getViewerWorkManagerTimeout();
	    if(timeout>1000 && timeCost < (timeout - 1000))
	    {
	      LOG.log(Level.INFO, "Work actually is NOT time out : " + jobId + " and less than " + timeout + "ms");
	      Timer timer = new Timer();  
	      timer.schedule(new TimerTask() {  
	          public void run() {  
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

    if (this.getCurrentType().equals(Constant.STATUS_UPLOAD))
      return;
    
    if (!isFinished(jobContext.getWorkingDir(), jobContext.getJobId()))
    {
      shouldCancel = true;
      for (int i = 0; i < 1000; i++)
      {
        try
        {
          Thread.sleep(10);
        }
        catch (InterruptedException e)
        {

        }
        if (completed)
          break;
      }
      if (!completed)
      {
        LOGGER.log(Level.INFO, "10 seconds after ViewerWorkmanager is timeout, the conversion task is still not cancelled for document:"
            + this.getDocumentId());
      }
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

  public void putError(Throwable e)
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

  protected final void aquireLocker()
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
        if (!isNativeLock)
        {
          lockFileOS = new FileOutputStream(lockFile);
          lockFileChannel = lockFileOS.getChannel();
        }
        else
        {
          lockFileName = lockFile.getAbsolutePath();
          LOGGER.log(Level.FINE, "Lock File name: " + lockFileName);
        }

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

  public final void releaseLocker()
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

    LOGGER.log(Level.FINEST, jobContext.getJobId() + " finished.");
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
    workingDir.listFiles();
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
      JSONObject data = (JSONObject) error.get(JobExecutionException.DATA);
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
    workingDir.listFiles();
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

  public static final boolean isKilled(File workingDir, String jobId)
  {
    boolean lockable = Job.isLockable(workingDir, jobId);
    boolean resultNotExisted = !Job.getResultFile(workingDir).exists();
    boolean errorNotExisted = Job.getError(workingDir) == null;
    if (lockable && resultNotExisted && errorNotExisted)
    {
      LOG.log(Level.FINEST, "JOBID:" + jobId + " WorkDir:" + workingDir.getPath() + " Lockable:" + lockable + "ResultFile:"
          + !resultNotExisted + " ErrorFile:" + !errorNotExisted);
    }
    return lockable && resultNotExisted && errorNotExisted;
  }

  public static final void hitCache(File workingDir, String jobId) throws IOException
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
    long result = System.currentTimeMillis();
    if (lastVisitRecordFile == null || lastVisitRecordFile.length == 0)
    {
      new File(workingDir, result + CACHE_AGE_BIT + jobId).createNewFile();
    }
    else if (lastVisitRecordFile.length == 1)
    {
      String newName = result + lastVisitRecordFile[0].getName().substring(lastVisitRecordFile[0].getName().lastIndexOf(CACHE_AGE_BIT));
      if (!lastVisitRecordFile[0].renameTo(new File(lastVisitRecordFile[0].getParentFile(), newName)))
      {
        LOG.log(Level.WARNING, "Failed to update cache last visit timestamp.", workingDir.getPath());
      }
    }
    else
    {
      for(File f:lastVisitRecordFile)
      {
        f.delete();
      }
      new File(workingDir, result + CACHE_AGE_BIT + jobId).createNewFile();
    }
  }

  public static final boolean isLockable(File workingDir, String jobId)
  {
    boolean lockable = false;
    if (isNativeLock == null) {
      isNativeLock = new Boolean(Platform.useNativeLock());
    }
    if (!isNativeLock)
    {
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
          LOGGER.log(Level.FINEST, jobId + " is executing.");
          lockable = false;
        }
      }
      catch (OverlappingFileLockException e)
      {
        LOGGER.log(Level.FINEST, jobId + " is executing with OverlappingFileLockException.");
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
    else
    {
      File lockFile = new File(workingDir, jobId);
      NativeFileLocker locker = new NativeFileLocker();
      String path = lockFile.getAbsolutePath();
      int ret = locker.lock(path);
      if (ret != -1 && ret != -2)
      {
        lockable = true;
        locker.unlock(ret);
      }
      LOGGER.log(Level.FINEST, "Job lockfile " + path + " is lockable: " + lockable);
      return lockable;
    }

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

//  private static String findJobHome()
//  {
//    String jobHome = ViewerConfig.getInstance().getSharedDataRoot();
//    LOG.log(Level.INFO, "job home is " + jobHome);
//    return jobHome;
//  }

  public String getJobId()
  {
    return jobContext.getJobId();
  }

  public boolean shouldCancel()
  {
    return shouldCancel;
  }

  public String getCurrentType()
  {
    return this.currentType;
  }

  public void setCurrentType(String currentType)
  {
    this.currentType = currentType;
  }

  /**
   * @return the jobPriority
   */
  public JOB_PRIORITY_TYPE getJobPriority()
  {
    return jobPriority;
  }

  /**
   * @param jobPriority the jobPriority to set
   */
  public void setJobPriority(JOB_PRIORITY_TYPE jobPriority)
  {
    this.jobPriority = jobPriority;
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
