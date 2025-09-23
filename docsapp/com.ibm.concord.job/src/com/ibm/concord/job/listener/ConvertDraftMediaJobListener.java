package com.ibm.concord.job.listener;

/**
 * This class is mainly for Journal results for ConvertRepositoryMedia, aka EXPORT
 * 
 * */

import java.io.File;
import java.io.FileFilter;
import java.util.Calendar;
import java.util.UUID;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.job.JobContext;
import com.ibm.concord.job.JobListener;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ConvertDraftMediaContext;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.journal.JournalComponentImpl;
import com.ibm.concord.platform.journal.JournalHelper;
import com.ibm.concord.platform.journal.JournalMsgBuilder;
import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.directory.beans.UserBean;

public class ConvertDraftMediaJobListener implements JobListener
{

  public void aboutToSchedule(JobContext jobContext)
  {
    // TODO Auto-generated method stub

  }

  public boolean shouldSchedule(JobContext jobContext)
  {
    // TODO Auto-generated method stub
    return true;
  }

  public void scheduled(JobContext jobContext)
  {
    // TODO Auto-generated method stub

  }

  public void joined(JobContext jobContext, boolean locally)
  {
    // TODO Auto-generated method stub

  }

  public void done(JobContext jobContext, boolean success)
  {
       
    ConvertDraftMediaContext listenedContext = (ConvertDraftMediaContext) jobContext;
    UserBean caller = listenedContext.requester;    
    
    File workingDir = new File(JobUtil.getDefaultWorkingDir(caller.getCustomerId(), listenedContext.mediaURI, listenedContext.getJobId()));
    File scanDir = workingDir.getParentFile();
    
    if (scanDir != null && scanDir.exists() && scanDir.isDirectory())
    {
      File[] subDirs = scanDir.listFiles();
      FileFilter pdfFilter = new FileFilter(){
        public boolean accept(File file)
        {
          if (file.getName().endsWith(".pdf"))
          {
            return true;
          }
          return false;
        }    
      };
      
      FileFilter readFilter = new FileFilter(){
        public boolean accept(File file){
          if (file.getName().endsWith(".reading"))
          {
            return true;
          }
          return false;
        }
      };

      for (File subDir : subDirs)
      {
        File[] pdfFiles = subDir.listFiles(pdfFilter);
        File[] readFiles = subDir.listFiles(readFilter);
        Calendar lastModified = AtomDate.valueOf(subDir.lastModified()).getCalendar();
        Calendar cleanDate = Calendar.getInstance();
        cleanDate.add(Calendar.DAY_OF_MONTH, -1);
        if (pdfFiles.length > 0 && readFiles.length == 0 && lastModified.compareTo(cleanDate) < 0 )
        {          
          File tempFile = new File(subDir, UUID.randomUUID().toString());
          FileUtil.nfs_renameFile(subDir, tempFile, FileUtil.NFS_RETRY_SECONDS);
          if (tempFile.exists())
          {
            FileUtil.nfs_cleanDirectory(tempFile, FileUtil.NFS_RETRY_SECONDS);
            FileUtil.nfs_delete(tempFile, FileUtil.NFS_RETRY_SECONDS);
          }          
        }
      }
    }    
    
    IJournalAdapter journalAdapter = (IJournalAdapter) Platform.getComponent(JournalComponentImpl.COMPONENT_ID).getService(
        IJournalAdapter.class);

    JournalHelper.Actor actor = new JournalHelper.Actor(caller.getEmail(), caller.getId(), caller.getCustomerId());
    JournalHelper.Entity jnl_obj = null;
    if(listenedContext.docEntry != null)
      jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, listenedContext.docEntry.getTitleWithExtension(),
        listenedContext.docEntry.getDocId(), caller.getCustomerId());
    else
      jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, "", "", caller.getCustomerId());
      
    // First journal the successful Publish action of (ExportDraftToRepository)
    journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_REPOSITORY, actor, JournalHelper.Action.EXPORT, jnl_obj,
        success ? JournalHelper.Outcome.SUCCESS : JournalHelper.Outcome.FAILURE).build());

  }

}
