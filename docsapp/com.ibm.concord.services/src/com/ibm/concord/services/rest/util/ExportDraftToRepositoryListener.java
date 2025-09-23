package com.ibm.concord.services.rest.util;

/**
 * This is a listener that used to export repository files to PDF in backends, and each publish service done successfully.
 */
import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.document.services.DocumentPageSettingsUtil;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobContext;
import com.ibm.concord.job.JobListener;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ConvertRepositoryMediaContext;
import com.ibm.concord.job.context.ExportDraftToRepositoryContext;
import com.ibm.concord.job.object.ConvertRepositoryMediaJob;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.journal.JournalComponentImpl;
import com.ibm.concord.platform.journal.JournalHelper;
import com.ibm.concord.platform.journal.JournalMsgBuilder;
import com.ibm.concord.platform.util.Constant;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.docs.common.util.FormatUtil;
//import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONObject;

public class ExportDraftToRepositoryListener implements JobListener
{
  private static final Logger LOG = Logger.getLogger(ExportDraftToRepositoryListener.class.getName());
  // doc:   asFormat=pdf&header=true&footer=true&top=2000&bottom=2000&left=2000&right=2000&height=27940&width=21590&HH=500&FH=500&UseTaggedPDF=true
  // sheet: asFormat=pdf&page=true&header=true&footer=true&gridline=false&top=2000&bottom=2000&left=2000&right=2000&height=27940&width=21590&UseTaggedPDF=true
  // sheet: asFormat=pdf&page=true&header=true&footer=true&gridline=false&top=2000&bottom=2000&left=2000&right=2000&height=27940&width=21590&UseTaggedPDF=true
  // pres:  asFormat=pdf&top=2000&bottom=2000&left=2000&right=2000&height=21590&width=27940&UseTaggedPDF=true
  
  public ExportDraftToRepositoryListener()
  {
  }

  public void aboutToSchedule(JobContext jobContext)
  {
  }

  public boolean shouldSchedule(JobContext jobContext)
  {
    return true;
  }

  public void scheduled(JobContext jobContext)
  {
  }

  public void joined(JobContext jobContext, boolean locally)
  {
  }

  /*
   * listenedJobContext: ExportDraftToRepositoryContext listenerJobContext ConvertRepositoryMediaContext ->PDF
   */
  public void done(JobContext jContext, boolean success)
  {
    ExportDraftToRepositoryContext listenedContext = (ExportDraftToRepositoryContext) jContext;

    UserBean caller = listenedContext.getRequester(); 
    IJournalAdapter journalAdapter = (IJournalAdapter) Platform.getComponent(
        JournalComponentImpl.COMPONENT_ID).getService(IJournalAdapter.class);

    if (success)
    {
      IDocumentEntry newPublishedDocEntry = (IDocumentEntry) jContext.getResult();
      String repoId = newPublishedDocEntry.getRepository();
      JournalHelper.Actor actor = new JournalHelper.Actor(caller.getEmail(), caller.getId(), caller.getCustomerId());
      JournalHelper.Entity jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, newPublishedDocEntry.getTitleWithExtension(), newPublishedDocEntry.getDocId(), caller.getCustomerId());
      //First journal the successful Publish action of (ExportDraftToRepository)
      journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_REPOSITORY, actor, JournalHelper.Action.PUBLISH, jnl_obj, JournalHelper.Outcome.SUCCESS).build());
      if(repoId != null && RepositoryServiceUtil.supportCheckin(repoId))
      {
        LOG.log(Level.INFO, "Will not generate PDF for publishing draft for: " + repoId);
        return;
      }      
      if(listenedContext.needBackendPDF)
      {
        ConvertRepositoryMediaContext pdfConvertContext = new ConvertRepositoryMediaContext();

        pdfConvertContext.mediaURI = newPublishedDocEntry.getDocUri();
        pdfConvertContext.targetMime = Platform.getMimeType(".pdf");
        pdfConvertContext.targetExtension = "pdf";
        pdfConvertContext.sourceMime = newPublishedDocEntry.getMimeType();
        if(FormatUtil.DOC_MIMETYPE.equals(pdfConvertContext.sourceMime))
        {
          pdfConvertContext.sourceMime = FormatUtil.DOCX_MIMETYPE;
          newPublishedDocEntry.setMimeType(FormatUtil.DOCX_MIMETYPE);
        }
        // LOG.log(Level.INFO, "newPublishedDocEntry.mimeType:" + pdfConvertContext.sourceMime);
        pdfConvertContext.modified = newPublishedDocEntry.getModified().getTimeInMillis();
        Map<String, Object> options = new HashMap<String, Object>();

        // IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform
        // .getComponent("com.ibm.concord.document.services").getService(IDocumentServiceProvider.class);
        // String docType = serviceProvider.getDocumentType(newPublishedDocEntry.getMimeType());
        
        try {
        	Map<String, Object> tempOptions = new HashMap<String, Object>();
        	tempOptions.put("asFormat", "pdf");
			JSONObject json = DocumentPageSettingsUtil.getPageSettingsAsJson(caller, newPublishedDocEntry);
			options = DocumentPageSettingsUtil.mergeJsonToOptions(json, tempOptions);
		} catch (DraftDataAccessException e) {
			options.put("asFormat", "pdf");
		} catch (DraftStorageAccessException e) {
			options.put("asFormat", "pdf");
		}
        /*
         * options.put("UseTaggedPDF", "true"); options.put("top", "2000"); options.put("bottom", "2000"); options.put("left", "2000");
         * options.put("right", "2000"); if(docType.equalsIgnoreCase("text")){ options.put("height", "27940"); options.put("width",
         * "21590"); options.put("header", "true"); options.put("footer", "true"); options.put("HH", "500"); options.put("FH", "500");
         * 
         * }else if(docType.equalsIgnoreCase("sheet")){ options.put("height", "27940"); //spreadsheet the height and width is reversed per
         * landscape or portrait options.put("width", "21590"); options.put("header", "true"); options.put("footer", "true");
         * options.put("page", "true"); options.put("gridline", "false");
         * 
         * }else if(docType.equalsIgnoreCase("pres")){ options.put("height", "21590"); options.put("width", "27940"); //options.put("rn",
         * "5107"); // not required when in IC File spage }
         */
        pdfConvertContext.options = options;

        pdfConvertContext.requester = listenedContext.getRequester();
        pdfConvertContext.docEntry = newPublishedDocEntry;

        File workingDir = new File(JobUtil.getDefaultWorkingDir(pdfConvertContext.requester.getCustomerId(),
            pdfConvertContext.docEntry.getDocUri(), pdfConvertContext.getJobId()));
        pdfConvertContext.setWorkingDir(workingDir);

        if (!Job.isFinishedSuccess(workingDir, pdfConvertContext.getJobId()))
        {
          {
            URLConfig config = URLConfig.toInstance();

            Job convertRepoMediaJob = new ConvertRepositoryMediaJob(pdfConvertContext);
            convertRepoMediaJob.config = config;
            // String jobId = convertRepoMediaJob.schedule();
            convertRepoMediaJob.schedule();
            LOG.log(Level.INFO, "Backend PDF export scheduled for draft publish");
          }
        }
      }
    }
    else{
      // it means the Publish action(ExportDraftToRepository) fails, so journal a failure action
      JournalHelper.Actor actor = new JournalHelper.Actor(caller.getEmail(), caller.getId(), caller.getCustomerId());
      JournalHelper.Entity jnl_obj = null;
      if(listenedContext.docEntry != null)
        jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, listenedContext.docEntry.getTitle(), listenedContext.docEntry.getDocId(), caller.getCustomerId());
      else
        jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, "", "", caller.getCustomerId());
      //First journal the failed Publish action of (ExportDraftToRepository)
      journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_REPOSITORY, actor, JournalHelper.Action.PUBLISH, jnl_obj, JournalHelper.Outcome.FAILURE).build());
    }
  }

}
