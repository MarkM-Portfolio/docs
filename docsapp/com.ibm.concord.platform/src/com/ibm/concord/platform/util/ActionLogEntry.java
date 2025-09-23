/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.util;

import com.ibm.docs.directory.beans.UserBean;

/**
 * User action log entry for user action analysis.
 * 
 */
public class ActionLogEntry
{
  private UserBean user;
  private Action action;
  private String docId;
  private String additional;
  
  /**
   * Constructs an ActionLogEntry to generate a log string for user action analysis.
   * 
   * @param user
   * @param action
   * @param docId
   * @param additional
   */
  public ActionLogEntry(UserBean user, Action action, String docId, String additional)
  {
    this.user = user;
    this.action = action;
    this.docId = docId;
    this.additional = additional;
  }
  
  public ActionLogEntry(UserBean user, Action action, String additional)
  {
    this(user, action, null, additional);
  }
  
  /*
   * (non-Javadoc)
   * @see java.lang.Object#toString()
   */
  public String toString()
  {
    StringBuilder sb = new StringBuilder();
    sb.append("Action on HCL Docs: ");
    
    if (this.user != null)
    {
      sb.append("The user ");
      sb.append(this.user.getId());
      sb.append(" belonging to organization ");
      sb.append(this.user.getOrgId());
    }
    sb.append(" executed ");
    sb.append(action);
    if(docId != null)
    {
      sb.append(" operation on document ");
      sb.append(docId);
    }
    
    if (additional != null && additional.length() > 0)
    {
      sb.append(" with additional information {");
      sb.append(additional);
      sb.append("}");
    }
    
    return sb.toString();
  }
  
  public static enum Action
  {
    CREATEDOC,
    EDITDOC,
    CONVERTDOC,
    SHAREDOC,
    SAVEDOC,
    SAVEASDOC,
    PUBLISHDOC,
    DOWNLOADAS,
    OPENSESSION,
    CLOSESESSION,
    JOINSESSION,
    LEAVESESSION,
    ASSIGNTASK,
    SEARCHPEOPLE,
    CHECKENTITLEMENT,
    DRAFTCONTENT,
    ASYNC_JOIN_SESSION,
    ASYNC_GET_PARTIAL,
    SNAPSHOT
  }
}
