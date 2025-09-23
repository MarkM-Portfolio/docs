/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.services.rest.handlers.atsvr;

import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ASNotificationContext;
import com.ibm.concord.job.object.ASNotificationJob;
import com.ibm.concord.platform.mention.MentionMonitor;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.util.TaskHandlerHelper;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.notification.IEmailNoticeEntry;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentMentionHandler implements PostHandler
{
  private static final Logger LOG = Logger.getLogger(DocumentMentionHandler.class.getName());

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");

    String docRepo = pathMatcher.group(1);
    String docUri = pathMatcher.group(2);

    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, docRepo, docUri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while executing @mentions action.", docUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + docUri + " in executing @mentions action.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e2)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + docUri + " in executing @mentions action.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    // 'Edit' right validation
    boolean canAccess = TaskHandlerHelper.hasEditAccessRight(docEntry);
    if (!canAccess)
    {
      LOG.log(Level.WARNING, "Did not have edit permission on document {0} while executing @mentions action.", docUri);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    try
    {
      JSONObject jsonBody = JSONObject.parse(request.getReader());
      JSONArray idArray = (JSONArray) jsonBody.get("userIds");
      ArrayList<String> idList = new ArrayList<String>();
      Iterator it = idArray.iterator();
      while (it.hasNext())
      {
        JSONObject idObj = (JSONObject) it.next();
        idList.add((String) idObj.get("id"));
      }
      String commentId = (String) jsonBody.get("commentId");
      String link = (String) jsonBody.get("link");
      String content = (String) jsonBody.get("content");

      ArrayList<IEmailNoticeEntry> entryList = MentionMonitor.getMentionNotifyEntries(user, idList, docEntry, link, content);
      this.notifyActStream(entryList, user, commentId, docEntry);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception happens while creating mention notification for document: " + docUri, e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
  }

  private void notifyActStream(ArrayList<IEmailNoticeEntry> entryList, UserBean user, String commentId, IDocumentEntry docEntry)
  {
    ASNotificationContext context = new ASNotificationContext();
    context.setCaller(user);
    context.setCommentId(commentId);
    context.setDocEntry(docEntry);
    context.setActivityEntries(entryList);
    context.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), context.getJobId())));
    ASNotificationJob job = new ASNotificationJob(context);
    job.schedule();
  }
}
