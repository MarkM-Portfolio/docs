/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.rest.handlers.job;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.cache.spi.impl.SnapshotDescriptor;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.context.QuerySnapshotStatusContext;
import com.ibm.concord.viewer.job.exception.JobExecutionException;
import com.ibm.concord.viewer.job.object.QuerySnapshotStatusJob;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.DocumentEntryHelper;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.services.rest.GetHandler;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class HtmlJobHandler implements GetHandler
{
  private static final Logger LOGGER = Logger.getLogger(HtmlJobHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String docUri = pathMatcher.group(2);
    String jobId = pathMatcher.group(3);
    String modified = request.getParameter("version");
    IDocumentEntry docEntry = RepositoryServiceUtil.getEntry(user, repoId, docUri, modified, true);

    // XXX need to add modified information

    ICacheDescriptor cache = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry,
        request.getHeader("User-Agent"));
    String workingDirPath = JobUtil.getDefaultWorkingDir(cache, jobId);
    File workingDir = new File(workingDirPath);

    StringBuffer msg = new StringBuffer();

    if (workingDir.exists())
    {
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");

      if (Job.isFinished(workingDir, jobId))
      {
        JobExecutionException e = Job.getError(workingDir);
        if (e == null)
        {
          if (Job.getResultFile(workingDir).exists())
          {
            JSONObject json = new JSONObject();
            json.put("id", jobId);
            json.put("status", "complete");
            // JSONObject docEntryInJSON = null;
            if (Job.getResultFile(workingDir).getName().equals(Job.RESULT + Job.NONE_RESULT_SUFFIX))
            {
              /* File resultFile = */Job.getResultFile(workingDir);
              // docEntryInJSON = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(resultFile)));
              // json.put("data", docEntryInJSON);
              LOGGER.log(Level.INFO, "Client done for document:" + docUri);
            }
            if (cache.getViewContext() == ViewContext.VIEW_HTML_SS)
            {
              String sid = ((SnapshotDescriptor) cache).getSidFromDraftCache(true);
              json.put("sid", sid);
              if (sid == null || 0 == sid.length())
              {
                LOGGER.log(Level.WARNING, "An empty sid is returned to client.");
              }
            }
            json.serialize(response.getWriter(), true);
          }
          else
          {
            JSONObject json = new JSONObject();
            json.put("id", jobId);
            json.put("status", "error");
            json.put("error_code", "JOB FAKE FINISHED");
            json.put("error_msg", "FAKE FINISHED JOB DETECTED.");
            json.serialize(response.getWriter(), true);

            LOGGER.log(Level.WARNING, "FAKE FINISHED JOB DETECTED: " + jobId);
          }
        }
        else
        {
          JSONObject json = new JSONObject();
          json.put("id", jobId);
          json.put("status", "error");
          json.put("error_code", e.getErrorStatus());
          json.put("error_msg", e.getErrorMsg());
          JSONObject data = e.getData();
          if (e.getErrorStatus() == 1201)
          {
            String docprop_name = null;
            if (DocumentTypeUtils.isSpreadSheet(docEntry.getMimeType()))
            {
              docprop_name = "sheet";
            }
            else if (DocumentTypeUtils.isPres(docEntry.getMimeType()))
            {
              docprop_name = "pres";
            }
            else if (DocumentTypeUtils.isText(docEntry.getMimeType()))
            {
              docprop_name = "text";
            }
            else if (DocumentTypeUtils.isPDF(docEntry.getMimeType()))
            {
              docprop_name = "pdf";
            }
            if (docprop_name != null)
            {
              // read sheet-limits, text-limts, pres-limits
              JSONObject limits = (JSONObject) ViewerConfig.getInstance().getSubConfig("HtmlViewerConfig").get(docprop_name + "-limits");
              if (limits != null)
              {
                JSONObject sheet = new JSONObject();
                sheet.put(docprop_name, limits);
                if (data == null)
                  data = new JSONObject();
                data.put("limits", sheet);
              }
            }
          }
          if (data != null)
          {
            data.put("jobId", jobId);
            json.put("data", data);

            String responseID = (String) data.get(HttpSettingsUtil.RESPONSE_ID);
            LOGGER.info(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                "Error response id from conversion %s .", responseID)).toString());
          }
          json.serialize(response.getWriter(), true);
        }
      }
      else
      {
        JSONObject json = new JSONObject();
        json.put("id", jobId);
        json.put("status", "pending");

        // Job is not finished and it is also not running, then the node maybe is crashed
        if (Job.isKilled(workingDir, jobId))
        {
          ImportDraftFromRepositoryContext idc = null;
          String tempDir = null;
          if (cache.getViewContext() == ViewContext.VIEW_HTML_SS)
          {
            idc = new QuerySnapshotStatusContext();
            ((QuerySnapshotStatusContext) idc).snapshotDescriptor = (SnapshotDescriptor) cache;
            tempDir = workingDirPath;
          }
          else
          {
            idc = new ImportDraftFromRepositoryContext();
            tempDir = cache.getInternalURI();
          }

          idc.setWorkingDir(workingDir);
          idc.mediaURI = docEntry.getDocUri();
          idc.modified = docEntry.getModified().getTimeInMillis();
          idc.sourceMime = docEntry.getMimeType();
          IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
              "com.ibm.concord.viewer.document.services").getService(IDocumentServiceProvider.class);
          idc.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
          idc.requester = user;
          idc.docEntry = DocumentEntryHelper.getDocumentEntry(docEntry, modified);// docEntry;
          idc.draftDescriptor = cache;
          idc.isHTML = true;

          boolean isStorageFull = false;

          try
          {
            JSONObject fakeJson = new JSONObject();
            fakeJson.put("FakeKey", "FakeValue");
            String fakePath = tempDir/* cache.getInternalURI() */+ File.separator + System.currentTimeMillis();
            ViewerUtil.writeJSON(fakePath, fakeJson);
            FileUtil.deleteFile(fakePath);
          }
          catch (Exception e)
          {
            isStorageFull = true;
          }

          if (isStorageFull)
          {
            msg = new StringBuffer();
            msg.append("Client fails.");
            msg.append(ServiceCode.S_SEVERE_STORAGE_FULL);
            msg.append(" " + cache.getInternalURI());

            json.put("status", "error");
            json.put("error_code", CacheStorageAccessException.EC_CACHESTORAGE_ACCESS_ERROR);
            json.put("error_msg", "Storage server is unavailable.");
            json.serialize(response.getWriter(), true);

            LOGGER.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_STORAGE_FULL, msg.toString()));

            LOGGER.exiting(JobHandler.class.getName(), "doGet", "Storage Full");
            return;
          }
          if (idc.getJobId().equals(jobId))
          {
            if (cache.getViewContext() == ViewContext.VIEW_HTML_SS)
            {
              QuerySnapshotStatusJob job = new QuerySnapshotStatusJob((QuerySnapshotStatusContext) idc);
              job.schedule();
            }
            else
            {
              ResumeHtmlConversionJob job = new ResumeHtmlConversionJob(idc);
              job.resumeWork();
            }
          }
          else
          {
            json.put("status", "error");
            json.put("error_code", ServiceCode.ERROR_INVALID_JOBID);
            json.put("error_msg", "Invalid job id.");

            msg = new StringBuffer();
            msg.append(ServiceCode.S_ERROR_INVALID_JOBID);
            msg.append(" " + jobId);
            LOGGER.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_INVALID_JOBID, msg.toString()));
          }
        }

        json.serialize(response.getWriter(), true);
      }
    }
    else
    {
      LOGGER.log(Level.WARNING, "Did not find the work path {0}.", workingDirPath);
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
    }
  }
}
