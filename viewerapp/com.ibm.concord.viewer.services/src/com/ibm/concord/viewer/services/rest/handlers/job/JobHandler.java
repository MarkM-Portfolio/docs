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
import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.exception.JobExecutionException;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.repository.DocumentEntryHelper;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.ConcurrentFileUtil;
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
import com.ibm.json.java.JSONObject;

public class JobHandler implements GetHandler
{
  private static final Logger LOGGER = Logger.getLogger(JobHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    LOGGER.entering(JobHandler.class.getName(), "doGet");

    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String docUri = pathMatcher.group(2);
    String modified = pathMatcher.group(3);
    String jobId = pathMatcher.group(4);

    IDocumentEntry docEntry = RepositoryServiceUtil.getEntry(user, repoId, docUri, modified, true);
    
    if (jobId != null && !jobId.equals("null")) {
	    // Add view document log here
	    StringBuffer msg = new StringBuffer();
	    try
	    {
	      ICacheDescriptor cache = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry,
	          request.getHeader("User-Agent"), request.getParameter("mode"));
	      String workingDirPath = JobUtil.getDefaultWorkingDir(cache, jobId);
	      ThumbnailDescriptor thumbSrvCache = new ThumbnailDescriptor(docEntry);
	      File workingDir = new File(workingDirPath);
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
	              File renditionMeta = new File(cache.getInternalURI(), "images.json");
	              boolean exists = renditionMeta.exists();
	              if (exists)
	              {
	                JSONObject data = ConcurrentFileUtil.safeReadJsonFromFile(renditionMeta);
	                json.put("data", data);
	                json.serialize(response.getWriter(), true);
	                LOGGER.log(Level.INFO, "Client done for document:" + docUri);
	              }
	              else
	              {
	                json.put("status", "pending");
	                json.put("error_code", "2001");
	                json.put("error_msg", "CAN'T FIND CONSOLIDATED CONVERSION RESULT");
	                json.serialize(response.getWriter(), true);
	                LOGGER.log(Level.WARNING, "images.json can't be found");
	              }
	            }
	            else
	            {
	              JSONObject json = new JSONObject();
	              json.put("id", jobId);
	              json.put("status", "error");
	              json.put("error_code", "JOB FAKE FINISHED");
	              json.put("error_msg", "FAKE FINISHED JOB DETECTED.");
	              json.serialize(response.getWriter(), true);
	              LOGGER.log(Level.WARNING, "Client fails for document:" + docUri + " Reason: FAKE FINISHED JOB DETECTED. JobId:" + jobId);
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
	            if (data != null)
	            {
	              data.put("jobId", jobId);
	              json.put("data", data);
	            }
	            json.serialize(response.getWriter(), true);
	            LOGGER.log(Level.WARNING, "Client fails for document:" + docUri + " Reason: Code - " + e.getErrorStatus());
	          }
	        }
	        else
	        {
	          JSONObject json = new JSONObject();
	          json.put("id", jobId);
	          json.put("status", "pending");
	
	          JSONObject data = new JSONObject();
	          // Job is not finished and it is also not running, then the node maybe is crashed
	          if (Job.isKilled(workingDir, jobId))
	          {
	            ImportDraftFromRepositoryContext idc = new ImportDraftFromRepositoryContext();
	            idc.setWorkingDir(workingDir);
	            idc.mediaURI = docEntry.getDocUri();
	            // idc.modified = docEntry.getModified().getTimeInMillis();
	            idc.modified = Long.valueOf(modified); // we can not use the docEntry modified time, and it has to be the modified time passed
	                                                   // over by client, and it used to be the version
	            idc.sourceMime = docEntry.getMimeType();
	            IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
	                "com.ibm.concord.viewer.document.services").getService(IDocumentServiceProvider.class);
	            idc.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
	            idc.requester = user;
	            idc.docEntry = DocumentEntryHelper.getDocumentEntry(docEntry, modified);// docEntry;
	            idc.draftDescriptor = cache;
	            idc.thumbnailDesc = thumbSrvCache;
	
	            boolean isStorageFull = false;
	
	            try
	            {
	              /**
	               * Try to create a fake file, if this file can be create successfully, then we still have space left and this is considered as
	               * one viewer node is crashed and enter FailOver logic. If the fake file cannot be created successfully, then this is
	               * considered as NFS cache directory is full, and write error JSON to client.
	               */
	              JSONObject fakeJson = new JSONObject();
	              fakeJson.put("FakeKey", "FakeValue");
	              String fakePath = cache.getInternalURI() + File.separator + System.currentTimeMillis();
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
	              ResumeConversionJob job = new ResumeConversionJob(idc);
	              job.resumeWork();
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
	          File thumbnails = new File(cache.getThumbnailURI(), "thumbnails.meta");
	          if (thumbnails.exists())
	          {
	            JSONObject tJson = ConcurrentFileUtil.readMetaFromFile(thumbnails);
	            if (tJson != null)
	            {
	              data.put("thumbnails", tJson);
	            }
	          }
	
	          File fullImages = new File(cache.getFullImageURI(), "pictures.meta");
	          if (fullImages.exists())
	          {
	            JSONObject fJson = ConcurrentFileUtil.readMetaFromFile(fullImages);
	            if (fJson != null)
	            {
	              data.put("fullImages", fJson);
	            }
	          }
	          json.put("data", data);
	
	          json.serialize(response.getWriter(), true);
	        }
	      }
	      else
	      {
	        LOGGER.log(Level.WARNING, "Client fails for document:" + docUri + " Reason: Working directory is not found. JobId:" + jobId);
	        response.sendError(HttpServletResponse.SC_NOT_FOUND);
	      }
	    }
	    catch (Exception e)
	    {
	      LOGGER.log(Level.WARNING, "Client fails for document:" + docUri + " Reason: JobHandler - Unknown Exception occurred. JobId:" + jobId
	          + " - " + e.getMessage());
	      JSONObject json = new JSONObject();
	      json.put("id", jobId);
	      json.put("status", "error");
	      json.put("error_code", ConversionException.EC_CONV_SERVICE_UNAVAILABLE);
	      json.put("error_msg", "Unknown Error occured");
	      try
	      {
	        json.serialize(response.getWriter(), true);
	      }
	      catch (Exception e1)
	      {
	        LOGGER.log(Level.SEVERE, "Exception after JobHandler - Unknown Exception occurred - " + e1.getMessage());
	      }
	    }
    } else {
    	StringBuffer msg = new StringBuffer();
        msg.append(ServiceCode.S_ERROR_INVALID_JOBID);
        msg.append(" " + jobId);
        LOGGER.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_INVALID_JOBID, msg.toString()));
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
    }

    LOGGER.exiting(JobHandler.class.getName(), "doGet");
  }
}
