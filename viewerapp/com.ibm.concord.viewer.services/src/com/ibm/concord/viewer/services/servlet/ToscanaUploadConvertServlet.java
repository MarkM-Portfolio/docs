/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.viewer.services.servlet;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.object.ImportDraftFromRepositoryJob;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.services.rest.handlers.job.PostThumbnailJob;
import com.ibm.concord.viewer.services.rest.thumbnails.ThumbnailService;
import com.ibm.concord.viewer.services.rest.thumbnails.ThumbnailService4Doc;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.job.IConversionJob.JOB_PRIORITY_TYPE;
import com.ibm.docs.common.util.URLConfig;

/**
 * handle uploadconvert/toscana/<file ID>
 *
 */
public class ToscanaUploadConvertServlet extends HttpServlet
{
  private static final long serialVersionUID = -5355449445131324296L;

  private Logger LOG = Logger.getLogger(ToscanaUploadConvertServlet.class.getName());
  
  private static final Pattern pathPattern = Pattern.compile("/([^/]+)/([^/]+)");

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  {
    Matcher matcher = pathPattern.matcher(req.getPathInfo());
    Matcher result = matcher.matches() ? matcher : null;
    if (result == null)
    {
      LOG.log(Level.WARNING, "Failed to parse toscana upload convert request. {0}", req.getRequestURI());
      resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    
    String repoId = result.group(1);
    String uri = result.group(2);

    if (repoId == null || repoId.length() <= 0 || uri == null || uri.length() <= 0)
    {
      resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    
    UserBean user = (UserBean) req.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    IDocumentEntry docEntry = null;

    try
    {
      docEntry = RepositoryServiceUtil.getEntry(user, repoId, uri, "", true);           
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in toscana upload converson process.", e);
      resp.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);
      return;
    }
    
    BlockingQueue<String> queue = new LinkedBlockingQueue<String>();
    
    ThumbnailService thums = new ThumbnailService4Doc(user, docEntry);
    
    thums.jobMsgQ = queue;
    
    thums.jobPriority=JOB_PRIORITY_TYPE.HIGH;

    if (!thums.isThumbnailsExisted())
    {
      thums.exec();
    }
    else
    {
      ImportDraftFromRepositoryContext jContextPostThumbnail = new ImportDraftFromRepositoryContext();
      jContextPostThumbnail.modified = docEntry.getModified().getTimeInMillis();
      jContextPostThumbnail.mediaURI = docEntry.getDocUri();
      jContextPostThumbnail.draftDescriptor = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry);      
      jContextPostThumbnail.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(jContextPostThumbnail.draftDescriptor, jContextPostThumbnail.getJobId())));
      
      PostThumbnailJob postThumbnailJob = new PostThumbnailJob(jContextPostThumbnail);
      URLConfig config = URLConfig.toInstance();
      postThumbnailJob.config = config;
      postThumbnailJob.schedule();
    }    
    ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
    
    jContext.draftDescriptor = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry);
    
    String importJobIDStr = null ;
    String importJobModifiedStr = null ;
    if(!jContext.draftDescriptor.isValid())
    {
      IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
          DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);
      jContext.mediaURI = docEntry.getDocUri();
      jContext.sourceMime = docEntry.getMimeType();
      jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
      jContext.modified = docEntry.getModified().getTimeInMillis();
      jContext.forceSave = false;
      jContext.requester = user;
      jContext.docEntry = docEntry;    
      jContext.isHTML = true;
      jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(jContext.draftDescriptor, jContext.getJobId())));
  
      ImportDraftFromRepositoryJob uploadConvertJob = new ImportDraftFromRepositoryJob(jContext, false);
      
      uploadConvertJob.jobMsgQ = queue;
      uploadConvertJob.isMsgSource = false;
      
      URLConfig config = URLConfig.toInstance();
      
      uploadConvertJob.config = config;
      uploadConvertJob.setJobPriority(JOB_PRIORITY_TYPE.LOW);
      uploadConvertJob.schedule();
      
      importJobIDStr = jContext.getJobId();
      importJobModifiedStr = String.valueOf(jContext.modified);
    }
    if (importJobIDStr != null && !"".equals(importJobIDStr))
    {
      resp.addHeader("importJobID", importJobIDStr);
      resp.addHeader("importJobModifiedStr", importJobModifiedStr);
    }

    resp.setStatus(HttpServletResponse.SC_OK);
  }

}
