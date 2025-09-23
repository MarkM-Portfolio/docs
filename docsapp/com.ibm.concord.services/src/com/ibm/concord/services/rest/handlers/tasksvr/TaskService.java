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

import java.io.File;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentURLBuilder;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ASNotificationContext;
import com.ibm.concord.job.object.ASNotificationJob;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocActivityBean;
import com.ibm.concord.platform.bean.DocReferenceBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocActivityDAO;
import com.ibm.concord.platform.dao.IDocReferenceDAO;
import com.ibm.concord.platform.task.TaskComponentImpl;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.services.rest.util.TaskLockSection;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.ACE;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.TaskAction;
import com.ibm.concord.spi.beans.TaskBean;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.exception.ActivityAccessException;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.notification.IEmailNoticeEntry;
import com.ibm.concord.spi.task.IActivityAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONObject;

public class TaskService
{
  private static final Logger LOG = Logger.getLogger(TaskService.class.getName());

  public TaskService()
  {
  }

  public JSONObject createOrLinkActivity(UserBean caller, IDocumentEntry docEntry, String linkedActivityId, String newActName)
      throws AccessException
  {
    String repository = docEntry.getRepository();
    String uri = docEntry.getDocUri();
    String activityId = null;
    String activityName = null;
    if (linkedActivityId != null)
    {
      activityName = getActivityTitle(caller, linkedActivityId);
      if (activityName != null)
      {
        activityId = linkedActivityId;
        addActLink(caller, repository, uri, activityId);
      }
    }

    if ((activityId == null) || (activityName == null))// create an activity
    {
      if (newActName == null)
        activityName = docEntry.getTitle();
      else
        activityName = newActName;

      activityId = getActivityAdapter().addActivity(caller, activityName, activityName, "", null);

      if (activityId != null)
        addActLink(caller, repository, uri, activityId);
    }

    if ((activityId == null) || (activityName == null))
      return null;
    JSONObject result = new JSONObject();
    result.put("activityId", activityId);
    result.put("activityName", activityName);

    this.publishActLinkMsg(repository, uri, activityId, activityName);

    return result;
  }

  /*
   * Remove Journal for TaskAssignment of Docs private void addTaskJournal(UserBean caller, JournalHelper.Component comp,
   * JournalHelper.Action action, JournalHelper.Outcome outcome){ IJournalAdapter journalAdapter = (IJournalAdapter) Platform.getComponent(
   * JournalComponentImpl.COMPONENT_ID).getService(IJournalAdapter.class); JournalHelper.Actor a = new
   * JournalHelper.Actor(caller.getEmail(), caller.getId(), caller.getCustomerId()); //JournalHelper.Entity e = new
   * JournalHelper.Entity("type", "nane", "id", "custeoIsd"); journalAdapter.publish(new JournalMsgBuilder(comp, a, action,
   * JournalHelper.Outcome.SUCCESS).build()); }
   */

  public String getPersonRole(String activityId, String userId) throws AccessException
  {
    return getActivityAdapter().getPersonRole(activityId, userId);
  }

  private boolean needTryAgain(String activityId, UserBean user)
  {
    try
    {
      String role = getPersonRole(activityId, user.getId());
      if ((role == null) || (!role.equalsIgnoreCase("owner")))
      {
        addMember(user, activityId, user.getId(), null);
        return true;
      }
      else
        // already be owner
        return false;

    }
    catch (AccessException e)
    { // Maybe activity is invalid
      return false;
    }
  }

  public DocReferenceBean getParentReference(UserBean caller, IDocumentEntry docEntry)
  {
    IDocReferenceDAO docRefDAO = getDocReferenceDAO();
    List<DocReferenceBean> parents = docRefDAO.getByChild(docEntry.getRepository(), docEntry.getDocUri());

    if ((parents == null) || (parents.size() == 0))
      return null;

    return parents.get(0);

  }

  public String getChildReferenceByParent(UserBean caller, IDocumentEntry docEntry, String taskid)
  {
    IDocReferenceDAO docRefDAO = getDocReferenceDAO();
    List<DocReferenceBean> children = docRefDAO.getByParent(docEntry.getRepository(), docEntry.getDocUri());

    for (DocReferenceBean drBean : children)
    {
      if (taskid.equals(drBean.getTaskid()))
      {
        if (drBean.getCanceltime() == null && drBean.getSubmittime() == null)
        {
          StringBuffer fragBuffer = new StringBuffer();
          fragBuffer.append(drBean.getChildRepository());
          fragBuffer.append("/");
          fragBuffer.append(drBean.getChildUri());
          return fragBuffer.toString();
        }
      }
    }
    return null;
  }

  public boolean updateParentReference(UserBean call, DocReferenceBean reference)
  {
    if (reference != null)
    {
      IDocReferenceDAO docRefDAO = getDocReferenceDAO();
      return docRefDAO.update(reference);
    }

    return false;
  }

  public void submitParentReferenceByChild(UserBean call, String childDoc)
  {
    IDocReferenceDAO docRefDAO = getDocReferenceDAO();
    String[] str = childDoc.split("/");
    if (str.length == 2)
    {
      List<DocReferenceBean> parents = docRefDAO.getByChild(str[0], str[1]);

      for (DocReferenceBean reference : parents)
      {
        reference.setSubmittime(new Timestamp(System.currentTimeMillis()));
        docRefDAO.update(reference);
      }
    }

  }

  public void cancelParentReferenceByChild(UserBean call, String childDoc)
  {
    IDocReferenceDAO docRefDAO = getDocReferenceDAO();
    String[] str = childDoc.split("/");
    if (str.length == 2)
    {
      List<DocReferenceBean> parents = docRefDAO.getByChild(str[0], str[1]);

      for (DocReferenceBean reference : parents)
      {
        reference.setCanceltime(new Timestamp(System.currentTimeMillis()));
        docRefDAO.update(reference);
      }
    }
  }

  public TaskBean createTask(UserBean caller, IDocumentEntry docEntry, TaskAction createAction, String activityId) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("createTask entering: docid " + docEntry.getRepository() + "/" + docEntry.getDocUri() + ", action: "
          + createAction.toString());
    }
    TaskBean taskBean = null;
    String fileName = docEntry.getTitle();
    String assignee = null;
    String todoLabel = null;
    String reviewer = null;
    String todoContent = "";
    Date duedate = null;

    if (createAction.getProp() != null)
    {
      assignee = (String) createAction.getProp().get(TaskAction.KEY_ASSIGNEE);
      reviewer = (String) createAction.getProp().get(TaskAction.KEY_REVIEWER);
      todoLabel = (String) createAction.getProp().get(TaskAction.KEY_TASKTITLE);
      todoContent = (String) createAction.getProp().get(TaskAction.KEY_TASKDESC);
      if (todoContent == null)
        todoContent = "";
      if (todoLabel == null)
        todoLabel = "";

      String strDuedate = (String) createAction.getProp().get(TaskAction.KEY_DUEDATE);
      if (strDuedate != null)
      {
        try
        {
          duedate = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss ZZZ", Locale.ENGLISH).parse(strDuedate);
        }
        catch (ParseException e)
        {
          LOG.warning("createTask failed to parse duedate " + strDuedate);
        }
      }
    }

    if (activityId != null)
    { // activity create successfully
      addMembers(caller, docEntry, activityId, assignee, reviewer);

      //todoContent = todoContent + getReferenceLink(caller, docEntry);
      String state = (assignee != null) ? TaskBean.NEW : TaskBean.WAITINGREVIEW;
      String owner = (assignee != null) ? assignee : reviewer;
      taskBean = new TaskBean(null, todoLabel, todoContent, null, assignee, reviewer, owner, caller.getId(), duedate, null, state,
          docEntry.getRepository() + "/" + docEntry.getDocUri(), activityId, null);
      taskBean = doAction(caller, docEntry, taskBean, createAction);
    }

    // addTaskJournal(caller, JournalHelper.Component.DOCS_TASK, JournalHelper.Action.CREATE, JournalHelper.Outcome.SUCCESS, docEntry);
    LOG.info(new ActionLogEntry(caller, Action.ASSIGNTASK, docEntry.getDocUri(), "assignee: " + assignee + ", reviewer: " + reviewer)
        .toString());

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("createTask existing");
    }

    return taskBean;
  }

  public TaskBean doAction(UserBean caller, IDocumentEntry docEntry, final String activityId, final String taskId, TaskAction action)
      throws AccessException
  {
    return new TaskLockSection()
    {
      public TaskBean perform(UserBean caller, IDocumentEntry docEntry, TaskAction action) throws AccessException
      {
        TaskBean taskBean = null;
        if (LOG.isLoggable(Level.FINER))
        {
          LOG.finer("doAction existing");
        }

        boolean tryAgain = false;

        do
        {
          if (tryAgain)
          {
            if (LOG.isLoggable(Level.FINER))
            {
              LOG.finer("doAction try again");
            }
          }

          try
          {
            if (taskId != null)
            {
              taskBean = getTask(caller, activityId, taskId, !tryAgain);
            }
            taskBean = doAction(caller, docEntry, taskBean, action);
            tryAgain = false;
          }
          catch (AccessException e)
          {
            if (e.getCode() == ActivityAccessException.EC_ACTIVITY_DOACTIONFAIL)
              throw e;

            if (!tryAgain)
              tryAgain = needTryAgain(activityId, caller);
            else
              tryAgain = false;
            if (!tryAgain)
              throw e;
          }

        }
        while (tryAgain);

        // addTaskJournal(caller, JournalHelper.Component.DOCS_TASK, JournalHelper.Action.UPDATE, JournalHelper.Outcome.SUCCESS, docEntry);

        return taskBean;
      }
    }.execute(caller, docEntry, taskId, action);

  }

  private String getReferenceLink(UserBean caller, String repo, String uri)
  {
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(caller, repo, uri, true);
      return getReferenceLink(caller, docEntry);
    }
    catch (ConcordException e)
    {
      LOG.log(Level.SEVERE, "getReferenceLink: failed to get document entry for " + repo + "/" + uri, e);
    }
    return "";
  }

  private String getReferenceLink(UserBean caller, IDocumentEntry docEntry)
  {
    String link = "";
    if (docEntry != null)
    {
      String docUrl = DocumentURLBuilder.getEditDocumentURI(docEntry);
      String fileName = docEntry.getTitle();
      link = "<br/><a target='_blank' href='" + docUrl + "'>" + fileName + "</a>";
    }
    return link;
  }

  private boolean isPermitedAction(UserBean user, TaskBean task, String actionType)
  {
    if (TaskAction.ACTION_RESTORE.equals(actionType))
    {
      return true;
    }

    boolean bAssignee = user.getId().equals(task.getAssignee());
    boolean bReviewer = user.getId().equals(task.getReviewer());
    boolean bOwner = user.getId().equals(task.getOwner());
    boolean bAssigner = user.getId().equals(task.getAuthor());

    if (TaskBean.NEW.equalsIgnoreCase(task.getState()) || TaskBean.REJECTED.equalsIgnoreCase(task.getState()))
    {
      if (bAssignee)
      {
        if (TaskAction.ACTION_WORKDONE.equalsIgnoreCase(actionType) || TaskAction.ACTION_WORKING.equalsIgnoreCase(actionType))
        {
          return true;
        }
      }
      if (bReviewer && bOwner && !bAssignee)
      { // this is a review section
        if (TaskAction.ACTION_APPROVE.equalsIgnoreCase(actionType) || TaskAction.ACTION_REJECT.equalsIgnoreCase(actionType)
            || TaskAction.ACTION_REVIEWDONE.equalsIgnoreCase(actionType))
        {
          return true;
        }
      }
      if (TaskAction.ACTION_EDIT.equalsIgnoreCase(actionType) || TaskAction.ACTION_REASSIGN.equalsIgnoreCase(actionType))
      {
        return true;
      }
      if (TaskAction.ACTION_AUTOREVIEWDONE.equalsIgnoreCase(actionType) && task.getReviewer() != null && task.getAssignee() == null)
      { // review section, regardless the user, permit the reviewdone action
        return true;
      }
      if (TaskAction.ACTION_AUTOWORKDONE.equalsIgnoreCase(actionType) && task.getReviewer() == null && task.getAssignee() != null)
      { // delegation section, regardless the user, permit the workddone action
        return true;
      }

    }
    else if (TaskBean.WORKING.equalsIgnoreCase(task.getState()))
    {
      if (bAssignee)
      {
        if (TaskAction.ACTION_WORKDONE.equalsIgnoreCase(actionType) || TaskAction.ACTION_CANCEL_PRIVATE.equalsIgnoreCase(actionType)
            || TaskAction.ACTION_WORKING.equalsIgnoreCase(actionType))
          return true;
      }
      if (bAssigner)
      {
        if (TaskAction.ACTION_REASSIGN.equalsIgnoreCase(actionType))
          return true;
      }

    }
    else if (TaskBean.WAITINGREVIEW.equalsIgnoreCase(task.getState()))
    {
      if (bReviewer)
      {
        if (TaskAction.ACTION_APPROVE.equalsIgnoreCase(actionType) || TaskAction.ACTION_REJECT.equalsIgnoreCase(actionType)
            || TaskAction.ACTION_REVIEWDONE.equalsIgnoreCase(actionType))
        {
          return true;
        }
      }
      if (TaskAction.ACTION_EDIT.equalsIgnoreCase(actionType) || TaskAction.ACTION_REASSIGN.equalsIgnoreCase(actionType))
      {
        return true;
      }
      if (task.getReviewer() != null && task.getAssignee() == null && TaskAction.ACTION_AUTOREVIEWDONE.equalsIgnoreCase(actionType))
      { // review section, regardless the user, permit the reviewdone action
        return true;
      }

    }
    else if (TaskBean.COMPLETE.equalsIgnoreCase(task.getState()))
    {
      if (TaskAction.ACTION_REOPEN.equalsIgnoreCase(actionType))
      {
        return true;
      }
    }
    // submit private case is a bit special
    if (TaskAction.ACTION_SUBMIT_PRIVATE.equalsIgnoreCase(actionType))
    {
      if (!TaskBean.WORKING.equals(task.getState()))
      {// not working status, return false
        return false;
      }
      if (!bAssignee)
      {
        return false;
      }
      return true;
    }
    return false;
  }

  private TaskBean doAction(UserBean caller, IDocumentEntry docEntry, TaskBean task, TaskAction action) throws AccessException
  {
    boolean bNewTask = TaskAction.ACTION_CREATE.equals(action.getType());
    boolean bRestoreTask = TaskAction.ACTION_RESTORE.equals(action.getType());
    if (bNewTask)
    {
      try
      {
        if (task.getState() == null)
          task.setState(TaskBean.NEW);
        task = getActivityAdapter().addTodo(caller, task, docEntry);
        action.setTaskid(task.getId());
        action.setCreateDate(task.getCreateDate());
      }
      catch (AccessException e)
      {
        task = null;
        throw e;
      }
    }
    else
    {
      // Access right to do this action
      boolean _isPermitedAction = this.isPermitedAction(caller, task, action.getType());
      if (!_isPermitedAction)
      {
        throw new ActivityAccessException("Unable to do action Todo" + action.toString() + ", previous state is " + task.getState(),
            ActivityAccessException.EC_ACTIVITY_DOACTIONFAIL);
      }
      // update task
      String nextState = null;
      Map<String, Object> prop = action.getProp();
      String reviewer = null;
      String assignee = null;
      String todoContent = null;
      String todoTitle = null;
      String fragid = null;
      // String owner = task.getOwner();
      Date duedate = null;
      Date createDate = null;
      boolean bReviewerUpdated = false;
      boolean bAssigneeUpdated = false;
      boolean bTodoContentUpdated = false;
      boolean bTodoTitleUpdated = false;
      boolean bDuedateUpdated = false;
      boolean bCreateDateUpdated = false;
      boolean bFragidUpdated = false;
      // boolean bLastModifyUpdated = false;
      if (prop != null)
      {
        if (bReviewerUpdated = prop.containsKey(TaskAction.KEY_REVIEWER))
        {
          reviewer = (String) prop.get(TaskAction.KEY_REVIEWER);
          prop.put(TaskAction.KEY_OLDREVIEWER, task.getReviewer());
          // bLastModifyUpdated = true;
        }
        if (bAssigneeUpdated = prop.containsKey(TaskAction.KEY_ASSIGNEE))
        {
          assignee = (String) prop.get(TaskAction.KEY_ASSIGNEE);
          prop.put(TaskAction.KEY_OLDASSIGNEE, task.getAssignee());
          // bLastModifyUpdated = true;
        }
        if (bTodoContentUpdated = prop.containsKey(TaskAction.KEY_TASKDESC))
        {
          todoContent = (String) prop.get(TaskAction.KEY_TASKDESC);
          prop.put(TaskAction.KEY_OLDTASKDESC, task.getContent());
        }
        if (bTodoTitleUpdated = prop.containsKey(TaskAction.KEY_TASKTITLE))
        {
          todoTitle = (String) prop.get(TaskAction.KEY_TASKTITLE);
          prop.put(TaskAction.KEY_OLDTASKTITLE, task.getTitle());
        }
        if (bFragidUpdated = prop.containsKey(TaskAction.KEY_FRAGID))
        {
          fragid = (String) prop.get(TaskAction.KEY_FRAGID);
          prop.put(TaskAction.KEY_OLDFRAGID, task.getFragid());
        }

        if (bDuedateUpdated = prop.containsKey(TaskAction.KEY_DUEDATE))
        {
          String strDuedate = (String) prop.get(TaskAction.KEY_DUEDATE);
          if (strDuedate != null)
          {
            try
            {
              duedate = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss ZZZ", Locale.ENGLISH).parse(strDuedate);
            }
            catch (ParseException e)
            {
              LOG.warning("createTask failed to parse duedate " + strDuedate);
            }
            prop.put(TaskAction.KEY_OLDDUEDATE, task.getDuedate().toGMTString());
            // bLastModifyUpdated = true;
          }
        }
        if (bCreateDateUpdated = prop.containsKey(TaskAction.KEY_TASKCREATEDATE))
        {
          String strCreateDate = (String) prop.get(TaskAction.KEY_TASKCREATEDATE);
          if (strCreateDate != null)
          {
            try
            {
              createDate = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss ZZZ", Locale.ENGLISH).parse(strCreateDate);
            }
            catch (ParseException e)
            {
              LOG.warning("Failed to parse createDate " + strCreateDate);
            }
          }
        }
      }
      if (TaskAction.ACTION_EDIT.equalsIgnoreCase(action.getType()) || TaskAction.ACTION_REJECT.equalsIgnoreCase(action.getType())
          || TaskAction.ACTION_REASSIGN.equalsIgnoreCase(action.getType()) || TaskAction.ACTION_REOPEN.equalsIgnoreCase(action.getType()))
      {
        String orgAssignee = task.getAssignee();
        String orgReviewer = task.getReviewer();
        if (bReviewerUpdated)
          task.setReviewer(reviewer);
        if (bAssigneeUpdated)
          task.setAssignee(assignee);
        if (bTodoTitleUpdated)
          task.setTitle(todoTitle);
        if (bDuedateUpdated)
          task.setDuedate(duedate);
        if (bCreateDateUpdated)
          task.setCreateDate(createDate);
        if (bTodoContentUpdated)
        {
//          String docId = task.getDocid();
//          String elements[] = docId.split("/");
//          String repo = elements[0];
//          String uri = elements[1];
//          task.setContent(todoContent + getReferenceLink(caller, repo, uri));
          task.setContent(todoContent);         
        }
        if (TaskBean.COMPLETE.equalsIgnoreCase(task.getState()))
        { // for completed task, only reopen is allowed
          if (TaskAction.ACTION_REOPEN.equalsIgnoreCase(action.getType()))
          {
            if (task.getAssignee() != null)// assignee is specified
              nextState = TaskBean.REJECTED;
            else
              // assignee is not specified
              nextState = TaskBean.WAITINGREVIEW;
          }
          else
            nextState = null;
        }
        else if (TaskAction.ACTION_EDIT.equalsIgnoreCase(action.getType()) || TaskAction.ACTION_REASSIGN.equalsIgnoreCase(action.getType()))
        {
          if (TaskBean.WAITINGREVIEW.equalsIgnoreCase(task.getState()))
          {
            if (((task.getAssignee() != null) && (orgAssignee == null)) // assign an assignee
                || (task.getReviewer() == null)) // reviewer is removed
            {
              nextState = TaskBean.NEW;
            }
            else
              nextState = task.getState();
          }
          else if (TaskBean.WORKING.equalsIgnoreCase(task.getState()))
          {
            if (bAssigneeUpdated)
            {
              if (task.getFragid() != null)
                this.cancelParentReferenceByChild(caller, task.getFragid());
              task.setFragid(null);
              if (task.getAssignee() != null)
                nextState = TaskBean.NEW;
              else
                nextState = TaskBean.WAITINGREVIEW;
            }
            else
              nextState = task.getState();
          }
          else
          // new/rejected
          {
            if ((task.getAssignee() != null))
              nextState = task.getState();
            else
              nextState = TaskBean.WAITINGREVIEW;
          }

        }
        else if (TaskAction.ACTION_REJECT.equalsIgnoreCase(action.getType()))// rejected
        {
          if (task.getAssignee() != null)// if assignee is specified, ask assignee to rework it
            nextState = TaskBean.REJECTED;
          else if ((task.getReviewer() != orgReviewer) || (bAssigneeUpdated)) // if reviewer or assignee is changed
            nextState = TaskBean.WAITINGREVIEW;
          else
            // if assignee is not specified, the task is just for review. So this task is complete
            nextState = TaskBean.COMPLETE;
        }

        if ((task.getAssignee() != null) && !TaskBean.WAITINGREVIEW.equalsIgnoreCase(nextState))
          task.setOwner(task.getAssignee());
        else if (task.getReviewer() != null)
          task.setOwner(task.getReviewer());

        if (TaskBean.WORKING.equalsIgnoreCase(task.getState()))
        {
          if (bAssigneeUpdated)
            task.setFragid(null);
        }

        task.setState(nextState);
      }// edit, reject, reopen, reassign, restore
      else if (TaskAction.ACTION_WORKING.equalsIgnoreCase(action.getType()))
      {
        if (fragid != null)
        {
          task.setFragid(fragid);
          nextState = TaskBean.WORKING;
          task.setState(nextState);
        }
      }
      else if (TaskAction.ACTION_RESTORE.equals(action.getType()))
      {
        // if it's restore type, nextState must not be null in order to execute the restore operation
        nextState = task.getState();
        if (task.getDocid() == null)
          task.setDocid(docEntry.getRepository() + "/" + docEntry.getDocUri());
        if (task.getFragid() == null)
        {
          task.setFragid(this.getChildReferenceByParent(caller, docEntry, task.getId()));
        }
      }
      else if (TaskAction.ACTION_CANCEL_PRIVATE.equalsIgnoreCase(action.getType()))
      {
        if (TaskBean.WORKING.equalsIgnoreCase(task.getState()))
        {
          if (task.getFragid() != null)
            this.cancelParentReferenceByChild(caller, task.getFragid());
          task.setFragid(null);
          nextState = TaskBean.NEW;
          task.setOwner(task.getAssignee());
          task.setState(nextState);
          // TODO update document reference table
        }
      }
      else if (TaskAction.ACTION_WORKDONE.equalsIgnoreCase(action.getType())
          || TaskAction.ACTION_AUTOWORKDONE.equalsIgnoreCase(action.getType())
          || (TaskAction.ACTION_SUBMIT_PRIVATE.equalsIgnoreCase(action.getType()) && TaskBean.WORKING.equalsIgnoreCase(task.getState())))
      {
        if (task.getReviewer() != null)
        {
          nextState = TaskBean.WAITINGREVIEW;
          task.setOwner(task.getReviewer());
          // task.setTitle("You are assigned to review the section");
        }
        else
        {
          nextState = TaskBean.COMPLETE;
        }

        if (TaskAction.ACTION_SUBMIT_PRIVATE.equalsIgnoreCase(action.getType()))
        {
          if (task.getFragid() != null)
            this.submitParentReferenceByChild(caller, task.getFragid());
        }

        task.setFragid(null);
        task.setState(nextState);
      }
      else if (TaskAction.ACTION_APPROVE.equalsIgnoreCase(action.getType())
          || TaskAction.ACTION_REVIEWDONE.equalsIgnoreCase(action.getType())
          || TaskAction.ACTION_AUTOREVIEWDONE.equalsIgnoreCase(action.getType())) // added reviewDone and autoreviewDone task to set next
                                                                                  // state to complete to support presentation
      {
        nextState = TaskBean.COMPLETE;
        task.setState(nextState);
      }

      if (nextState != null)
      {
        try
        {
          // make sure the reviewer and assignee have access to activity
          // don't use new assignee/reviewer to check because someone can remove the assignee or reviewer from Activities
          if (task.getAssignee() != null)
            getActivityAdapter().addPerson(caller, task.getActivity(), null, task.getAssignee());
          if (task.getReviewer() != null)
            getActivityAdapter().addPerson(caller, task.getActivity(), null, task.getReviewer());
        }
        catch (AccessException e)
        {
          LOG.log(Level.WARNING, "doAction: failed to add person ", e);
          throw e;
        }

        // if(!nextState.equals(task.getState())) bLastModifyUpdated = true;
        // //Modification of assignee,reviewer, duedate or state causes the update of lastModify
        // if(bLastModifyUpdated ){
        // task.setMsgNotify(true);
        // task.setLastModify(new Date());
        // if(owner != null && !task.getOwner().equals(owner)){
        // //Owner has been changed
        // task.setMsgOwner(owner);
        // }
        // }

        try
        {
          task = getActivityAdapter().updateTask(caller, task, docEntry);
        }
        catch (AccessException e)
        {
          LOG.log(Level.WARNING, "doAction: failed to do action " + action.toString(), e);
          task = null;
          throw e;
        }        
      }
      else
      { // status is not consistent
        LOG.log(Level.WARNING, "doAction: failed to do action " + action.toString() + ", previous state is " + task.getState());
        throw new ActivityAccessException("Unable to do action Todo" + action.toString() + ", previous state is " + task.getState(),
            ActivityAccessException.EC_ACTIVITY_DOACTIONFAIL);
      }
    }

    if (task != null && !bRestoreTask)
    {
      action.setTaskid(task.getId());
      try
      {
        getActivityAdapter().addActionHistory(caller, action, task.getActivity());
      }
      catch (AccessException e)
      {
        LOG.log(Level.WARNING, "doAction: failed to add action history " + action.toString(), e);
      }

    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("doAction existing " + task);
    }

    return task;
  }

  public TaskBean getTask(UserBean caller, String activityId, String todoId) throws AccessException
  {
    return getTask(caller, activityId, todoId, true);
  }

  private TaskBean getTask(UserBean caller, String activityId, String todoId, boolean needTryAgain) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getTask entering " + todoId);
    }

    TaskBean task = null;
    boolean tryAgain = false;
    do
    {
      if (tryAgain)
      {
        needTryAgain = false;
        if (LOG.isLoggable(Level.FINER))
        {
          LOG.finer("getTask try again " + todoId);
        }
      }

      try
      {
        task = getActivityAdapter().getTask(caller, activityId, todoId);
        tryAgain = false;
      }
      catch (AccessException e)
      {
        if (needTryAgain)
        {
          tryAgain = needTryAgain(activityId, caller);
        }
        else
        {
          tryAgain = false;
        }

        if (!tryAgain)
        {
          LOG.log(Level.WARNING, "getTask: failed to getTask " + todoId, e);
          throw e;
        }
      }
    }
    while (tryAgain);

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getTask exiting " + task);
    }

    return task;
  }

  public List<TaskBean> getTasks(UserBean caller, String docRepo, String docUri, boolean bStrict) throws AccessException
  {
    String activityId = getActivityId(caller, docRepo, docUri);
    if (activityId == null)
      return null;
    else
    {
      boolean tryAgain = false;
      List<TaskBean> tasks = null;
      do
      {
        try
        {
          tasks = getActivityAdapter().getTasks(caller, activityId, docRepo + "/" + docUri, bStrict);
          tryAgain = false;
        }
        catch (AccessException e)
        {
          if (!tryAgain)
          {
            tryAgain = needTryAgain(activityId, caller);
          }
          else
          { // if it has been the second try, no need to try again
            tryAgain = false;
          }

          if (!tryAgain)
          {
            throw e;
          }
        }
      }
      while (tryAgain);

      return tasks;
    }
  }

  public List<TaskAction> getActions(UserBean caller, String activityId, String todoId)
  {
    return getActivityAdapter().getActions(caller, activityId, todoId);
  }

  public void deleteTask(UserBean caller, String activityId, String todoId, IDocumentEntry docEntry) throws AccessException
  {
    deleteTask(caller, activityId, todoId, true, docEntry);
    // addTaskJournal(caller, JournalHelper.Component.DOCS_TASK, JournalHelper.Action.DELETE, JournalHelper.Outcome.SUCCESS, docEntry);
  }

  private void deleteTask(UserBean caller, String activityId, String todoId, boolean needTryAgain, IDocumentEntry docEntry) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTask entering " + todoId);
    }

    TaskBean task = null;
    boolean tryAgain = false;
    do
    {
      if (tryAgain)
      {
        needTryAgain = false;
        if (LOG.isLoggable(Level.FINER))
        {
          LOG.finer("deleteTask try again " + todoId);
        }
      }

      try
      {
        getActivityAdapter().deleteTodo(caller, activityId, todoId, docEntry);
        tryAgain = false;
      }
      catch (AccessException e)
      {
        if (needTryAgain)
        {
          tryAgain = needTryAgain(activityId, caller);
        }
        else
        {
          tryAgain = false;
        }

        if (!tryAgain)
        {
          LOG.log(Level.WARNING, "deleteTask: failed to deleteTask " + todoId, e);
          throw e;
        }
      }
    }
    while (tryAgain);

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTask exiting " + task);
    }

  }

  public List<String> deleteTasks(UserBean caller, String docRepo, String docUri, String state, IDocumentEntry docEntry) throws AccessException
  {
    String activityId = getActivityId(caller, docRepo, docUri);
    if (activityId == null)
      return null;
    else
    {
      return deleteTasks(caller, activityId, docRepo + "/" + docUri, state, true, docEntry);
    }
  }

  private List<String> deleteTasks(UserBean caller, String activityId, String docId, String state, boolean needTryAgain, IDocumentEntry docEntry)
      throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTasks entering " + docId + " with state " + state);
    }

    List<String> tasks = null;
    boolean tryAgain = false;
    do
    {
      if (tryAgain)
      {
        needTryAgain = false;
        if (LOG.isLoggable(Level.FINER))
        {
          LOG.finer("deleteTasks try again " + docId + " with state " + state);
        }
      }

      try
      {
        tasks = getActivityAdapter().deleteTasks(caller, activityId, docId, state, docEntry);
        tryAgain = false;
      }
      catch (AccessException e)
      {
        if (needTryAgain)
        {
          tryAgain = needTryAgain(activityId, caller);
        }
        else
        {
          tryAgain = false;
        }

        if (!tryAgain)
        {
          LOG.log(Level.WARNING, "deleteTasks: failed to deleteTasks " + docId + " with state " + state, e);
          throw e;
        }
      }
    }
    while (tryAgain);

    // addTaskJournal(caller, JournalHelper.Component.DOCS_TASK, JournalHelper.Action.DELETE, JournalHelper.Outcome.SUCCESS);

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTasks exiting " + docId + " with state " + state);
    }
    return tasks;
  }

  public String getActivityTitle(UserBean caller, String activityId) throws AccessException
  {
    if (activityId == null)
      return null;
    else
    {
      try
      {
        String title = getActivityAdapter().getActivityTitle(caller, activityId);
        return title;
      }
      catch (AccessException e)
      {
        LOG.log(Level.WARNING, "getActivityTitle: failed to get activity tile" + activityId, e);
        throw e;
      }

    }
  }

  private IDocActivityDAO getDocActivityDAO()
  {
    IComponent component = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
    return ((IDocActivityDAO) component.getService(IDocActivityDAO.class));
  }

  private IActivityAdapter getActivityAdapter()
  {
    IComponent component = Platform.getComponent(TaskComponentImpl.COMPONENT_ID);
    return ((IActivityAdapter) component.getService(IActivityAdapter.class));
  }

  private IRepositoryAdapter getRepositoryAdapter(String repository)
  {
    IComponent repoComp = Platform.getComponent(RepositoryComponent.COMPONENT_ID);
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) repoComp.getService(RepositoryProviderRegistry.class);
    if (service != null)
      return service.getRepository(repository);
    else
      return null;
  }

  private IDocReferenceDAO getDocReferenceDAO()
  {
    return (IDocReferenceDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IDocReferenceDAO.class);
  }

  public String getActivityId(UserBean caller, String docRepo, String docUri)
  {
    DocActivityBean actlinkBean = getDocActivityDAO().getByRepoAndUri(docRepo, docUri);
    if (actlinkBean == null)
      return null;
    else
      return actlinkBean.getActivity_id();
  }

  public void addActLink(UserBean caller, String repoId, String uri, String activityId)
  {
    DocActivityBean alinkbean = new DocActivityBean();
    alinkbean.setRepo_id(repoId);
    alinkbean.setUri(uri);
    alinkbean.setOrgid(caller.getOrgId());
    alinkbean.setActivity_id(activityId);
    alinkbean.setCreatedby(caller.getId());
    alinkbean.setCreationdate(new Timestamp(System.currentTimeMillis()));
    getDocActivityDAO().add(alinkbean);
  }

  public void publishActLinkMsg(String repoId, String uri, String activityId, String activityName)
  {
    SessionManager mgr = SessionManager.getInstance();
    DocumentSession docSess = mgr.getSession(repoId, uri);
    if (docSess != null)
    {
      JSONObject activity = new JSONObject();

      activity.put("activityName", activityName);
      activity.put("activityId", activityId);

      docSess.publishActivityMessage(activity);
    }
  }

  public void removeActLink(UserBean caller, String repoId, String uri)
  {
    getDocActivityDAO().deleteByRepoAndUri(repoId, uri);
  }

  public void addMember(UserBean caller, String activityId, String member, String type) throws AccessException
  {
    getActivityAdapter().addMember(caller, activityId, null, member, type);
  }

  public void addMembers(UserBean caller, IDocumentEntry docEntry, String activityId, String assignee, String reviewer)
      throws AccessException
  {
    String repository = docEntry.getRepository();
    try
    {
      // add all the users in the file share to this activity
      List<ACE> sharedUsers = getRepositoryAdapter(repository).getAllACE(caller, docEntry);
      Iterator<ACE> it = sharedUsers.iterator();
      while (it.hasNext())
      {
        ACE share = it.next();
        addMember(caller, activityId, share.getPrincipal(), share.getType());
      }
      if (assignee != null)
        addMember(caller, activityId, assignee, null);
      if (reviewer != null)
        addMember(caller, activityId, reviewer, null);
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "addMembers: error to retrieve ACE from Files", e);
      e.printStackTrace();
    }
    catch (AccessException e)
    {
      LOG.warning("addMemebers: error to add person in activity");
      throw e;
    }
  }

  public void notifyActStream(ArrayList<IEmailNoticeEntry> entryList, UserBean user, TaskBean taskNotified, IDocumentEntry docEntry)
  {
    ASNotificationContext context = new ASNotificationContext();
    context.setCaller(user);
    context.setTask(taskNotified);
    context.setDocEntry(docEntry);
    context.setActivityEntries(entryList);
    context.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), context.getJobId())));
    ASNotificationJob job = new ASNotificationJob(context);
    job.schedule();
  }
}
