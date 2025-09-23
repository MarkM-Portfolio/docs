/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2019. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.servlet;

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.spi.impl.HTMLCacheDescriptor;
import com.ibm.concord.viewer.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.object.ImportDraftFromRepositoryJob;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class DecryptAction
{
  private static final Logger LOG = Logger.getLogger(DecryptAction.class.getName());

  private static final String CLASS_NAME = DecryptAction.class.getName();

  private static final String STATUS = "status";

  private static final String STATUS_SUCCESS = "success";

  private static final String STATUS_CONVERTING = "converting";

  private static final String JOB_ID = "jobid";

  private String password;

  private UserBean user;

  private IDocumentEntry docEntry;

  private ICacheDescriptor cacheDesc;

  public DecryptAction(UserBean user, IDocumentEntry docEntry, String password)
  {
    this.docEntry = docEntry;
    this.user = user;
    this.cacheDesc = new HTMLCacheDescriptor(user, docEntry);
    this.password = password;
  }

  public void exec(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException, ConversionException
  {
    LOG.entering(CLASS_NAME, "exec " + docEntry.getDocId() + " " + docEntry.getMimeType());

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    JSONObject retJson = new JSONObject();

    if (cacheDesc.isValid() && cacheDesc.checkPasswordHash(password))
    {
      LOG.info("Password hash check passed, return draft directly.");
      // Having cache draft on storage
      retJson.put(STATUS, STATUS_SUCCESS);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      retJson.serialize(response.getWriter());
    }
    else
    {
      IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
          DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);

      ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
      jContext.mediaURI = docEntry.getDocUri();

      if (cacheDesc.isValid())
      {
        jContext.isPromptPassword = true;
        LOG.info("This is a prompt password job.");
      }

      jContext.sourceMime = docEntry.getMimeType();
      jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
      jContext.modified = docEntry.getModified().getTimeInMillis();
      jContext.forceSave = false;
      jContext.isHTML = true;

      jContext.requester = user;
      jContext.docEntry = docEntry;
      jContext.draftDescriptor = cacheDesc;
      jContext.password = password;

      jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(jContext.draftDescriptor, jContext.getJobId())));
      // If it is prompt password job, force to send a conversion request
      boolean forceConvert = jContext.isPromptPassword;
      if (Job.isFinishedSuccess(jContext.getWorkingDir(), jContext.getJobId()) && cacheDesc.exists() && !forceConvert)
      {
        LOG.info("Decryption work for Viewer is complete.");
        retJson.put(STATUS, STATUS_SUCCESS);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        retJson.serialize(response.getWriter());
      }
      else
      {
        StringBuffer msg = new StringBuffer();
        msg.append(ServiceCode.S_INFO_CONVERSION_NEEDED);
        msg.append(" This is for view service.");
        msg.append(" Doc id is ").append(jContext.docEntry.getDocUri());
        msg.append(" Mime type is ").append(jContext.docEntry.getMimeType());
        msg.append(" LastModified is ").append(jContext.docEntry.getModified().getTimeInMillis());
        LOG.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_CONVERSION_NEEDED, msg.toString()));

        URLConfig config = URLConfig.toInstance();

        Job importMediaJob = new ImportDraftFromRepositoryJob(jContext);
        importMediaJob.config = config;
        String jobId = importMediaJob.schedule();

        retJson.put(STATUS, STATUS_CONVERTING);
        retJson.put(JOB_ID, jobId);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        retJson.serialize(response.getWriter());
      }
    }

    LOG.exiting(CLASS_NAME, "exec " + docEntry.getDocId() + " " + docEntry.getMimeType());
  }
}
