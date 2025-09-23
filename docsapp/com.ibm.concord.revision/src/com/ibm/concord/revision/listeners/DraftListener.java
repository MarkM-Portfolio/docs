/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.revision.listeners;

import java.util.logging.Logger;

import com.ibm.concord.platform.draft.DraftAction;
import com.ibm.concord.platform.draft.DraftActionEvent;
import com.ibm.concord.platform.listener.IDraftListener;
import com.ibm.concord.platform.revision.IRevisionService;
import com.ibm.json.java.JSONArray;

public class DraftListener implements IDraftListener
{
  private DraftAction action;
  private String revisionKey;
  private JSONArray delta;
  private IRevisionService service;
  
  private static final Logger LOGGER = Logger.getLogger(DraftListener.class.getName());
  
  public DraftListener(IRevisionService service, DraftAction action, String revisionKey, JSONArray deltaToApply)
  {
    this.action = action;
    this.revisionKey = revisionKey;
    this.delta = deltaToApply;
  }
  
  @Override
  public void actionDone(DraftActionEvent event)
  {
    LOGGER.info("actionDone: action " + action + ", document " + revisionKey);
    
  }

}
