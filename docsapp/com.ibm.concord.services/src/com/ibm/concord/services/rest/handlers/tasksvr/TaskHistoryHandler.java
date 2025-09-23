/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.tasksvr;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.TaskAction;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONArray;

public class TaskHistoryHandler implements GetHandler
{
  private static final Logger LOG = Logger.getLogger(TaskHistoryHandler.class.getName());
  
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String docRepo = pathMatcher.group(1);
    String docUri = pathMatcher.group(2);
    
    String taskId = pathMatcher.group(3);

    try
    {
      IDocumentEntry docEntry = DocumentEntryUtil.getEntry(user, docRepo, docUri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while getting task history.", docUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Repository access exception happens while getting the entry of document " + docUri
          + " in getting task history.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e2)
    {
      LOG.log(Level.SEVERE, "Unknow exception happens while getting the entry of document " + docUri + " in getting task history.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    
    TaskService service = new TaskService();

    String activityId = service.getActivityId(user, docRepo, docUri);
    if (activityId == null)
    {
      LOG.log(Level.WARNING, "Did not find any activity of document {0} while getting task history.", docUri);
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    List<TaskAction> actions = service.getActions(user, activityId, taskId);
    
    if ((actions != null) && (actions.size()>0))
    {
      JSONArray actionsJSON = new JSONArray();
      for (TaskAction action : actions)
      {
        actionsJSON.add(action.toJSON());
      }
  
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_OK);
  
      actionsJSON.serialize(response.getWriter(), true);
    }
    else
    {
      LOG.log(Level.WARNING, "Did not find any task action of activity {0} while getting task history.", activityId);
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
    }
  }

}
