package com.ibm.concord.viewer.services.servlet;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.object.ImportDraftFromRepositoryJob;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.action.IViewAction;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.common.util.URLConfig;

public interface IConversionHelper
{
  public static final Logger logger = Logger.getLogger(IConversionHelper.class.getName());

  public ImportDraftFromRepositoryContext prepare(IViewAction vwAct) throws IllegalArgumentException;

  public String schedule(ImportDraftFromRepositoryContext jContext) throws IllegalStateException;

  public void setUserAgent(ImportDraftFromRepositoryContext jContext, String header);
  
  public void setCompactMode(ImportDraftFromRepositoryContext jContext, String mode);

  public static IConversionHelper DEFAULT_CONVERSION_HELPER = new IConversionHelper()
  {

    public void setUserAgent(ImportDraftFromRepositoryContext jContext, String userAgent)
    {
      jContext.userAgent = userAgent;
    }

    public void setCompactMode(ImportDraftFromRepositoryContext jContext, String mode)
    {
      jContext.mode = mode;
    }

    public String schedule(ImportDraftFromRepositoryContext jContext) throws IllegalStateException
    {
      StringBuffer msg = new StringBuffer();
      msg.append(ServiceCode.S_INFO_CONVERSION_NEEDED);
      msg.append(" This is for view service.");
      msg.append(" Doc id is ").append(jContext.docEntry.getDocUri());
      msg.append(" Mime type is ").append(jContext.docEntry.getMimeType());
      msg.append(" LastModified is ").append(jContext.docEntry.getModified().getTimeInMillis());
      logger.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_CONVERSION_NEEDED, msg.toString()));

      URLConfig config = URLConfig.toInstance();

      Job importMediaJob = new ImportDraftFromRepositoryJob(jContext);
      importMediaJob.config = config;

      return importMediaJob.schedule();
    }

    public ImportDraftFromRepositoryContext prepare(IViewAction vwAct) throws IllegalArgumentException
    {
      IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
          DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);
      IDocumentEntry docEntry = vwAct.getDocEntry();
      ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
      jContext.mediaURI = docEntry.getDocUri();
      jContext.sourceMime = docEntry.getMimeType();
      jContext.isHTML = vwAct.isHTMLView();

      jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
      jContext.modified = docEntry.getModified().getTimeInMillis();
      jContext.forceSave = false;

      jContext.requester = vwAct.getUser();
      jContext.docEntry = docEntry;
      jContext.draftDescriptor = vwAct.getCacheDescriptor();

      try
      {
        jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(jContext.draftDescriptor, jContext.getJobId())));
      }
      catch (IllegalArgumentException e)
      {
        throw e;
      }
      return jContext;
    }

  };

}
