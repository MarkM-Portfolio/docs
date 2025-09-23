/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job.object;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.channels.OverlappingFileLockException;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.config.AutoPublishConfig;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.context.ConvertDuringUploadContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.LimitsUtil;
import com.ibm.concord.spi.beans.ImportDocumentContext;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.framework.IComponent;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.Work;
import com.ibm.websphere.asynchbeans.WorkException;

/**
 * The job class for converting document during uploading.
 * 
 */
public class ConvertDuringUploadJob implements Work
{
  private static final Logger LOGGER = Logger.getLogger(ConvertDuringUploadJob.class.getName());

  private ConvertDuringUploadContext context;

  private FileChannel lockFileChannel;

  private FileOutputStream lockFileOS;

  private FileLock lock;

  /**
   * 
   * @param context
   */
  public ConvertDuringUploadJob(ConvertDuringUploadContext context)
  {
    if (context.mediaURI == null)
    {
      throw new NullPointerException();
    }

    this.context = context;
  }

  /**
   * 
   * @return
   * @throws JobExecutionException
   */
  public Object exec() throws JobExecutionException
  {
    LOGGER.entering(ConvertDuringUploadJob.class.getName(), "exec");

    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
        .getService(IDocumentServiceProvider.class);
    IDocumentService docService = serviceProvider.getDocumentService(context.docEntry.getMimeType());
    IComponent component = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
    IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) component.getService(IDocHistoryDAO.class);
    DocHistoryBean docHistoryBean = docHisotryDAO.get(context.docEntry.getRepository(), context.mediaURI);
    long modified = context.docEntry.getModified().getTimeInMillis();
    // Ensure the limits check based on the corrected MIME type.
    {
      boolean everAccess = docHistoryBean != null && docHistoryBean.getLastModified() == modified;
      if (!everAccess && LimitsUtil.exceedLimits(context.docEntry.getMediaSize(), (JSONObject) docService.getConfig().get("limits")))
      {
        // File size exceed the size limitation.
        LOGGER.log(Level.WARNING, "The document " + context.docEntry.getDocUri() + " is too large.");
        return "FAILURE";
      }
    }

    // set document history
    String orgId = ConcordUtil.retrieveFileOwnerOrgId(context.docEntry, context.requester);
    if (docHistoryBean == null)
    {
      if (context.docEntry.getDocUri().equalsIgnoreCase(context.docEntry.getVersionSeriesUri()))
      {
        // don't record in database if upload convert in version series uri folder
        LOGGER.log(Level.INFO,
            "Uploaded and converting a document in the version series uri folder: " + context.docEntry.getVersionSeriesUri());
      }
      else
      {
        docHistoryBean = new DocHistoryBean(context.docEntry.getRepository(), context.mediaURI);
        // not really access by user in Docs, so set last modified as -1 to avoid limits check doesn't work.
        docHistoryBean.setLastModified(DocHistoryBean.UPLOAD_DOCUMENT_WITHOUT_EDIT_STATUS);
        // handle org transfer case.
        docHistoryBean.setOrgId(orgId);
        docHistoryBean.setDocId(context.docEntry.getDocId());
        docHistoryBean.setVersionSeriesId(context.docEntry.getVersionSeriesId());
        docHistoryBean.setLibraryId(context.docEntry.getLibraryId());
        docHistoryBean.setCommunityId(context.docEntry.getCommunityId());
        docHistoryBean.setAutoPublish(AutoPublishConfig.getAutoPublish());
        docHistoryBean.setUploadCreated(Calendar.getInstance().getTime());
        docHistoryBean.setStatus(IDocHistoryDAO.INITIAL_STATUS);
        docHisotryDAO.add(docHistoryBean);
      }
    }
    else
    {
      if (docHistoryBean.getLastModified() > 0)
      {
        docHistoryBean.setLastModified(modified);
      }
      // handle org transfer case.
      docHistoryBean.setOrgId(orgId);
      docHistoryBean.setUploadCreated(Calendar.getInstance().getTime());
      docHistoryBean.setStatus(IDocHistoryDAO.INITIAL_STATUS);
      docHisotryDAO.update4Upload(docHistoryBean);
    }

    try
    {
      LOGGER.log(Level.INFO, "Start to do upload convert for document " + context.docEntry.getDocUri());
      /*
       * JSONObject parameters = new JSONObject(); parameters.put(Constant.KEY_UPLOAD_CONVERT, "true");
       * parameters.put(Constant.KEY_UPLOAD_CONVERT_ID, context.getJobId()); parameters.put(Constant.KEY_UPLOAD_CONVERT_IS_ADMIN,
       * Boolean.toString(context.isAdminUser));
       */
      ImportDocumentContext parameters = new ImportDocumentContext();
      parameters.uploadConvert = true;
      parameters.uploadConvertID = context.getJobId();
      parameters.isAdminUser = context.isAdminUser;
      docService.importDocument(context.requester, context.docEntry, parameters);
    }
    catch (Exception e)
    {
      LOGGER.log(Level.WARNING, "Exception happens while doing converting during upload", e);
      throw new JobExecutionException(-1, e);
    }

    LOGGER.exiting(ConvertDuringUploadJob.class.getName(), "exec", "SUCCESS");

    return "SUCCESS";
  }

  /**
   * 
   * @return
   */
  public String schedule()
  {
    try
    {
      acquireLocker();

      if (lock != null)
      {
        LOGGER.log(Level.FINEST, context.getJobId() + " started.");
        Platform.getConvertInUploadWorkManager().startWork(this);
      }
      else
      {
        LOGGER.log(Level.INFO, context.getJobId() + " joined from Remote Process.");
        releaseLocker();
      }
      return context.getJobId();
    }
    catch (WorkException e)
    {
      LOGGER.log(Level.SEVERE, "Failed to start work " + context.getJobId(), e);
      releaseLocker();
      throw new IllegalStateException("Failed to start work", e);
    }
    catch (OverlappingFileLockException e)
    {
      LOGGER.log(Level.INFO, context.getJobId() + " joined from Local Thread");
      releaseLocker();
      return context.getJobId();
    }
    catch (Throwable e)
    {
      LOGGER.log(Level.SEVERE, "Failed to schedule work " + context.getJobId(), e);
      throw new IllegalStateException("Failed to start work", e);
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see java.lang.Runnable#run()
   */
  public void run()
  {
    try
    {
      LOGGER.log(Level.FINEST, "Job Execution Started. {0}", context.getWorkingDir());

      exec();

      // Create a fake result file for house keeping.
      File noneResult = new File(context.getWorkingDir(), Job.RESULT + Job.NONE_RESULT_SUFFIX);
      noneResult.createNewFile();

      LOGGER.log(Level.FINEST, "Job Execution Completed. {0}", context.getWorkingDir());
    }
    catch (Throwable ex)
    {
      LOGGER.log(Level.WARNING, "Job Execution Failed. " + context.getWorkingDir(), ex);
    }
    finally
    {
      releaseLocker();
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.websphere.asynchbeans.Work#release()
   */
  public void release()
  {
    // Do nothing.
  }

  /**
   * Acquire the file locker of the job.
   * 
   */
  private void acquireLocker() throws Exception
  {
    File workingDir = context.getWorkingDir();
    if (!workingDir.exists())
    {
      workingDir.mkdirs();
    }

    if (workingDir.exists())
    {
      String jobId = context.getJobId();
      File lockFile = new File(workingDir, jobId);
      try
      {
        lockFile.createNewFile();
        lockFileOS = new FileOutputStream(lockFile);
        lockFileChannel = lockFileOS.getChannel();

        lock = lockFileChannel.tryLock();
      }
      catch (Exception e)
      {
        LOGGER.log(Level.SEVERE, "Creating lock file failed: " + lockFile.getPath(), e);
        throw e;
      }
    }
    else
    {
      LOGGER.log(Level.SEVERE, "Creating lock file folder failed: " + workingDir.getPath());
      throw new IllegalStateException("Working directory does not exist: " + workingDir.getPath());
    }
  }

  /**
   * Release the file locker of the job.
   * 
   */
  private void releaseLocker() throws IllegalStateException
  {
    IllegalStateException ise = null;
    try
    {
      if (lock != null)
      {
        lock.release();
      }
    }
    catch (Throwable e)
    {
      LOGGER.log(Level.SEVERE, "Releasing lock file failed for job " + context.getJobId(), e);
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
    catch (Throwable e)
    {
      LOGGER.log(Level.SEVERE, "Closing lock file channel failed for job " + context.getJobId(), e);
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
    catch (Throwable e)
    {
      LOGGER.log(Level.SEVERE, "Closing lock file failed for job " + context.getJobId(), e);
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

    if (LOGGER.isLoggable(Level.FINEST))
    {
      LOGGER.log(Level.FINEST, "Releasing locker finished for job " + context.getJobId());
    }
  }
}
