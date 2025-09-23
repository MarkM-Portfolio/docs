package com.ibm.concord.job.listener;

import com.ibm.concord.job.JobContext;
import com.ibm.concord.job.JobListener;
import com.ibm.concord.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.journal.JournalComponentImpl;
import com.ibm.concord.platform.journal.JournalHelper;
import com.ibm.concord.platform.journal.JournalMsgBuilder;
import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.docs.directory.beans.UserBean;

public class ImportDraftFromRepositoryJobListener implements JobListener
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
    ImportDraftFromRepositoryContext listenedContext = (ImportDraftFromRepositoryContext) jobContext;

    UserBean caller = listenedContext.requester;
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

    journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_REPOSITORY, actor, JournalHelper.Action.IMPORT, jnl_obj,
        success ? JournalHelper.Outcome.SUCCESS : JournalHelper.Outcome.FAILURE).build());

  }

}
