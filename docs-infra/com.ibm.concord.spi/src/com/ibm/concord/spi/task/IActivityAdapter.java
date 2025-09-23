/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.task;

import java.util.Date;
import java.util.List;

import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.TaskAction;
import com.ibm.concord.spi.beans.TaskBean;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public interface IActivityAdapter
{
  public static final String SERVER_KEY = "server_url";

  public void init(JSONObject config);
  
  public String addActivity(UserBean caller, String label, String content, String tag, Date dueDate) throws AccessException;
    
  public TaskBean addTodo(UserBean caller, TaskBean taskBean, IDocumentEntry docEntry) throws AccessException;
  
  public boolean addPerson(UserBean caller, String activityId, String name, String email) throws AccessException;
  
  public boolean addMember(UserBean caller, String activityId, String name, String id, String type) throws AccessException;
  
  public boolean deleteTodo(UserBean caller, String activityId, String todoId, IDocumentEntry docEntry) throws AccessException;
  
  public List<TaskBean> getTasks(UserBean caller, String activityId, String docId, boolean bSevere) throws AccessException;

  public List<TaskAction> getActions(UserBean caller, String activityId, String todoId);
  
  public TaskBean getTask(UserBean caller, String activityId, String todoId) throws AccessException;
  
  public TaskBean updateTask(UserBean caller, TaskBean task, IDocumentEntry docEntry) throws AccessException;
  
  public void addActionHistory(UserBean caller, TaskAction action, String activityId) throws AccessException ;
  
  public JSONArray getAllActivities(UserBean caller) throws AccessException;

  public String getActivityTitle(UserBean caller, String activityId) throws AccessException;
  
  public List<String> deleteTasks(UserBean caller, String activityId, String docId, String state, IDocumentEntry docEntry) throws AccessException;
  
  public boolean isActivityExist(String activityId) throws AccessException;
  
  public String getPersonRole(String activityId, String userId) throws AccessException;

}
