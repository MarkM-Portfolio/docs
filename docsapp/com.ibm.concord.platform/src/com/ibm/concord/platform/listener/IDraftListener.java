/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.listener;

import com.ibm.concord.platform.draft.DraftActionEvent;

public interface IDraftListener
{  
  public void actionDone(DraftActionEvent event);
}
