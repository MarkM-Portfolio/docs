/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.revsvr;

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.GenerateRevisionDraftContext;
import com.ibm.concord.job.context.RestoreRevisionContext;
import com.ibm.concord.job.object.GenerateRevisionDraftJob;
import com.ibm.concord.job.object.RestoreRevisionJob;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.revision.exception.RevisionDataException;
import com.ibm.concord.revision.exception.RevisionStorageException;
import com.ibm.concord.revision.service.RevisionService;
import com.ibm.concord.revision.util.RevisionUtil;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public class DocumentRevisionContentHandler implements GetHandler, PostHandler
{
  public static final Logger LOGGER = Logger.getLogger(DocumentRevisionHandler.class.getName());
  public static final String REVISION_CONTENT = "content";
  public static final String REVISION_RESTORE = "restore";
  public static final String REVISION_DELETE = "delete";
  
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    String revNo = pathMatcher.group(3);
    String method = pathMatcher.group(4);
    
    if(!REVISION_CONTENT.equalsIgnoreCase(method))
    {
      LOGGER.log(Level.WARNING, "Bad url: ", request.getRequestURL());
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    LOGGER.entering(DocumentRevisionContentHandler.class.getSimpleName(), "doGet", new Object[]{repoId, uri, revNo});

    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }
    
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOGGER.log(Level.WARNING, "Could not find the entry of document {0} while getting content.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in getting revision content.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch(Exception e2)
    {
      LOGGER.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in getting revision content.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    
    String docType = DocumentServiceUtil.getDocumentType(docEntry);
    IDocumentService docSrv = DocumentServiceUtil.getDocumentServiceByType(docType);     
    
    int[] revisionNo = RevisionUtil.getRevisionNo(revNo);
    JSONObject state = new JSONObject();
    try
    {
      DraftDescriptor dd = RevisionUtil.getDraftForRevision(user, docEntry, revisionNo[0], revisionNo[1]);
      if (dd!=null)
      {
        RevisionService.getInstance().updateRevisionDataAccessed(user, docEntry, revisionNo[0], revisionNo[1]);
        JSONObject criteria = new JSONObject();
        JSONObject contentCriteria = getCriteria(request);
        criteria.put(MessageConstants.CONTENT_STATE_KEY, contentCriteria);
  
        state = docSrv.getCurrentState(dd, null, criteria);
        response.setStatus(HttpServletResponse.SC_OK);
        JSONObject json = new JSONObject();
        json.put("state", state);    
        json.put("bean", DocumentEntryHelper.toJSON(docEntry));
        json.serialize(response.getWriter(), true);
        LOGGER.exiting(DocumentRevisionContentHandler.class.getSimpleName(), "doGet", new Object[]{repoId, uri, revNo, "OK"});
      }
      else
      {
        // generate the draft
        GenerateRevisionDraftContext context = new GenerateRevisionDraftContext();
        context.docEntry = docEntry;
        context.caller = user;
        context.majorNo = revisionNo[0];
        context.minorNo = revisionNo[1];
        context.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), context.getJobId())));
        GenerateRevisionDraftJob job = new GenerateRevisionDraftJob(context);
        URLConfig config = URLConfig.toInstance();
        job.config = config;
        String jobId = job.schedule();
          
        JSONObject json = new JSONObject();
        json.put("jobId", jobId);
        json.put("status", "pending");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        json.serialize(response.getWriter(), true);
        response.setStatus(HttpServletResponse.SC_OK);
        LOGGER.exiting(DocumentRevisionContentHandler.class.getSimpleName(), "doGet", new Object[]{repoId, uri, revNo, "id=" + jobId});
      }
    }
    catch (RevisionStorageException e)
    {
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_code", e.getErrorCode());
      json.put("error_msg", e.getMessage());
      json.serialize(response.getWriter(), true);
      response.setStatus(HttpServletResponse.SC_OK);
      LOGGER.exiting(DocumentRevisionContentHandler.class.getSimpleName(), "doGet", new Object[]{repoId, uri, revNo, "error=" + e.getErrorCode()});
    }
    catch (RevisionDataException e)
    {
      if (e.getErrorCode() == RevisionDataException.ERROR_REVISION_NOT_FOUND)
      {
        LOGGER.log(Level.WARNING, "Could not find the version {0} of document {1} while getting content.", new Object[]{revNo, uri});
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
      else
      {
        JSONObject json = new JSONObject();
        json.put("status", "error");
        json.put("error_code", e.getErrorCode());
        json.put("error_msg", e.getMessage());
        json.serialize(response.getWriter(), true);
        response.setStatus(HttpServletResponse.SC_OK);
        LOGGER.exiting(DocumentRevisionContentHandler.class.getSimpleName(), "doGet", new Object[]{repoId, uri, revNo, "error=" + e.getErrorCode()});
      }
    }
    catch (Exception e)
    {
      LOGGER.log(Level.SEVERE, "Exception happens while getting the revision content of document " + uri + "." + revNo, e);
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }
  }
  
  
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    String revNo = pathMatcher.group(3);   
    String method = pathMatcher.group(4);
    
    LOGGER.entering(DocumentRevisionContentHandler.class.getSimpleName(), "doPost", new Object[]{repoId, uri, revNo});

    if(!REVISION_RESTORE.equalsIgnoreCase(method) && !REVISION_DELETE.equalsIgnoreCase(method))
    {
      LOGGER.log(Level.WARNING, "Bad url: ", request.getRequestURL());
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    
    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }
    
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOGGER.log(Level.WARNING, "Could not find the entry of document {0} while restore revision.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Access exception happens while restore revision of document " + uri, e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch(Exception e2)
    {
      LOGGER.log(Level.SEVERE, "Exception happens while restore revision of document " + uri, e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }    
    
    if(method !=null ) {
      int[] revisionNo = RevisionUtil.getRevisionNo(revNo);    
      int major = revisionNo[0];
      int minor = revisionNo[1];
      
      if(method.equalsIgnoreCase(REVISION_RESTORE)) {
        LOGGER.log(Level.FINER, "Restoring revision {0}.{1} for document {2}@{3}", new Object[] {major, minor, uri, repoId});
        this.restoreRevision(request, response, user, docEntry, major, minor);
      }
      else if(method.equalsIgnoreCase(REVISION_DELETE)) {
        LOGGER.log(Level.FINER, "Deleting revision {0}.{1} for document {2}@{3}", new Object[] {major, minor, uri, repoId});
        this.deleteRevision(request, response, user, docEntry, major, minor);
      }
    } 
    else {
      LOGGER.log(Level.INFO, "No method is defined in post request: {0}", new Object[] {uri});
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;      
    }
  }
  
  
  private JSONObject getCriteria(HttpServletRequest request)
  {
    JSONObject criteria = null;
    try
    {
      String criteriaStr = request.getParameter("criteria");
      if (criteriaStr != null)
      {
        criteria = JSONObject.parse(criteriaStr);
      }
    }
    catch (Exception e)
    {
      LOGGER.log(Level.WARNING, "Can not parse the parameter 'criteria' in the request to a json object", e);
    }
    return criteria;
  }
  
  private void restoreRevision(HttpServletRequest request, HttpServletResponse response, UserBean user, IDocumentEntry docEntry, int major, int minor) throws IOException
  {    
    String repoId = docEntry.getRepository();
    String uri = docEntry.getDocUri();
    
    try{
      RestoreRevisionContext context = new RestoreRevisionContext();
      context.docEntry = docEntry;
      context.caller = user;
      context.majorNo = major;
      context.minorNo = minor;      
      String jobid = context.getJobId();
      context.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), context.getJobId())));
      
      JSONObject json = new JSONObject();
      RestoreRevisionJob job = new RestoreRevisionJob(context);
      URLConfig config = URLConfig.toInstance();
      boolean newjob = false;
      
      if(Job.isRunning(context.getWorkingDir(), jobid))
      {// on going job
        LOGGER.log(Level.FINER, "Previous job to restore the revision content {0}.{1} of document {2} is running", new Object[] {major, minor, uri});
      }
      else
      {// new job
        if( FileUtil.exists(context.getWorkingDir()) )
        {// clear finished job                
          synchronized(context.getWorkingDir())
          {// clear previous finished job
            FileUtil.cleanDirectory(context.getWorkingDir());
            FileUtil.nfs_delete(context.getWorkingDir(), FileUtil.NFS_RETRY_SECONDS);                   
          } 
        }      
        LOGGER.log(Level.FINER, "Renew job to restore the revision content {0}.{1} of document {2}", new Object[] {major, minor, uri});
        job.schedule();
        newjob = true;
      }
      json.put("newjob", newjob);
      json.put("status", "pending");
      json.put("jobId", jobid);     
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      response.setStatus(HttpServletResponse.SC_OK);               
      
      LOGGER.exiting(DocumentRevisionContentHandler.class.getSimpleName(), "restoreRevision", new Object[]{repoId, uri, major, minor, "id=" + jobid});
    }
    catch(Exception e)
    {
      LOGGER.log(Level.WARNING, "Exception happens while restore the revision content {0}.{1} of document {2}", new Object[] {major, minor, uri});
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);      
    }   
  }

  private boolean deleteRevision(HttpServletRequest request, HttpServletResponse response, UserBean user, IDocumentEntry docEntry, int major, int minor)
  {
    // TODO
    return true;
  }
}
