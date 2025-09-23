package com.ibm.concord.viewer.services.servlet;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.cache.spi.impl.SnapshotDescriptor;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.context.QuerySnapshotStatusContext;
import com.ibm.concord.viewer.job.object.QuerySnapshotStatusJob;
import com.ibm.concord.viewer.platform.conversionResult.ConversionConstants;
import com.ibm.concord.viewer.platform.util.SnapshotSrvClient;
import com.ibm.concord.viewer.spi.action.IViewAction;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.SnapshotException;

class SnapshotViewAction extends HtmlViewAction
{
  private static final Logger logger = Logger.getLogger(SnapshotViewAction.class.getName());

  private static final String CLASS_NAME = SnapshotViewAction.class.getName();

  private static final int EC_DOCS_UNEXPECTED_CODE = 1700;

  private static final int ACCESS_RETRY_COUNT = 25;

  private static final long SLEEP_INTERVAL = 200;

  public SnapshotViewAction(UserBean user, IDocumentEntry entry, String contentPath, String docVersion, HashMap<String, Boolean> parameters)
  {
    super(user, entry, contentPath, docVersion, parameters);
    pathPrefix = "";
    // fileOwnerOrgId = ViewerUtil.getFileOwnerOrgId(entry, user);
  }

  @Override
  protected boolean allowViewEditorDraft()
  {
    return false;
  }

  protected boolean requireConvert() throws CacheStorageAccessException, CacheDataAccessException, SnapshotException, Exception
  {
    logger.entering(CLASS_NAME, "requireConvert");

    int code = -1;
    try
    {
      code = SnapshotSrvClient.getInstance().getSnapshot(user, docEntry.getRepository(), docEntry.getDocUri());
    }
    catch (Exception e)
    {
      throw e;
    }

    if (code != HttpServletResponse.SC_OK && code != HttpServletResponse.SC_CREATED/* || true */)
    {
      if (code == ConversionConstants.SNAPSHOT_DRAFTDATA_ACCESS_ERROR || code == ConversionConstants.SNAPSHOT_DRAFTSTORAGE_ACCESS_ERROR)
      {
        StringBuffer sbf = new StringBuffer("Docs server returns error code, ").append(code).append(". Doc id is ")
            .append(docEntry.getDocUri());
        logger.log(Level.WARNING, sbf.toString());
        throw new SnapshotException(code);
      }
      else
      {
        StringBuffer sbf = new StringBuffer("Docs server returns unexpected code, ").append(code).append(". Doc id is ")
            .append(docEntry.getDocUri());
        logger.log(Level.WARNING, sbf.toString());

        throw new SnapshotException(EC_DOCS_UNEXPECTED_CODE);
      }
    }
    boolean r = cacheDesc.isValid();

    logger.exiting(CLASS_NAME, "requireConvert", !r);
    return !r;
  }

  protected void initCacheDescriptor()
  {
    cacheDesc = new SnapshotDescriptor(user, docEntry);
  }

  protected void setViewContext()
  {
    this.viewCxt = ViewContext.VIEW_HTML_SS;
  }

  @Override
  public void serveAttachment(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    logger.entering(CLASS_NAME, "serveAttachment");

    if (!cacheDesc.accessible())
    {
      int count = 0;
      logger.info("Start to wait for reading access to snapshot.  Doc id: " + docEntry.getDocUri());
      while (!cacheDesc.accessible() && count++ < ACCESS_RETRY_COUNT)
      {
        try
        {
          Thread.sleep(SLEEP_INTERVAL);
        }
        catch (InterruptedException e)
        {
          logger.warning("Thread interrupted.  Doc id: " + docEntry.getDocUri());
        }
      }
      if (count >= ACCESS_RETRY_COUNT)
      {
        logger.info("Waiting finished. Snapshot still can't be accessed.  Doc id: " + docEntry.getDocUri());
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);

        logger.exiting(CLASS_NAME, "serveAttachment");
        return;
      }
      else
      {
        logger.info("Waiting finished. Snapshot now is accessible.  Doc id: " + docEntry.getDocUri());
      }
    }
    String clientId = request.getParameter("sid");
    String serverId = ((SnapshotDescriptor) cacheDesc).getSidFromDraftCache(true);
    if (clientId == null || serverId == null || !serverId.equals(clientId))
    {
      logger.log(Level.WARNING, "Inconsistent snapshot id detected, clientid=" + clientId + ", serverId=" + serverId + ". Doc id: "
          + docEntry.getDocUri());
      response.setStatus(507); // customized HTTP code

      logger.exiting(CLASS_NAME, "serveAttachment", "Response 507");
      return;
    }

    super.serveAttachment(request, response);
  }

  @Override
  protected void initConversionHelper()
  {
    this.conHelper = new IConversionHelper()
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
        Job job = new QuerySnapshotStatusJob((QuerySnapshotStatusContext) jContext);
        logger.log(
            Level.INFO,
            new StringBuffer("Need to start a query job. Doc id is ").append(docEntry.getDocUri()).append(". Mime type is ")
                .append(docEntry.getMimeType()).toString());
        return job.schedule();
      }

      public ImportDraftFromRepositoryContext prepare(IViewAction vwAct) throws IllegalArgumentException
      {
        QuerySnapshotStatusContext jContext = new QuerySnapshotStatusContext();
        jContext.mediaURI = docEntry.getDocUri();
        jContext.snapshotDescriptor = (SnapshotDescriptor) cacheDesc;
        jContext.docEntry = docEntry;

        try
        {
          jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(jContext.snapshotDescriptor, jContext.getJobId())));
        }
        catch (IllegalArgumentException e)
        {
          throw e;
        }

        return jContext;
      }

    };
  }

  @Override
  public void serveViewerPage(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    if (convertIgnored)
    {
      request.setAttribute("snapshotId", ((SnapshotDescriptor) cacheDesc).getSidFromDraftCache(true));
    }

    super.serveViewerPage(request, response);
  }
}
