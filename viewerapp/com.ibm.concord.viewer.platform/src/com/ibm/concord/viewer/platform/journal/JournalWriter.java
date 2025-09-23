/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.journal;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.journal.JournalComponentImpl;
import com.ibm.concord.viewer.platform.journal.JournalEntry;
import com.ibm.concord.viewer.platform.journal.JournalHelper;
import com.ibm.concord.viewer.platform.journal.JournalHelper.Outcome;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.journal.IJournalAdapter;

public class JournalWriter 
{
	public static void setJournal(long time, UserBean user, IDocumentEntry docEntry, Outcome outcome)
	{
		IJournalAdapter journalAdapter = (IJournalAdapter) Platform.getComponent(JournalComponentImpl.COMPONENT_ID).getService(
    			IJournalAdapter.class);
    	JournalHelper.Actor actor = new JournalHelper.Actor(user.getEmail(), user.getId(), user.getCustomerId());
    	JournalHelper.Entity entity = new JournalHelper.Entity(docEntry.getMimeType(), docEntry.getTitle(), docEntry.getDocId(), user.getCustomerId());
    	JournalEntry je = new JournalEntry.Builder(time, JournalHelper.Component.VIEWER, actor,
        							JournalHelper.Action.VIEW, outcome).object(entity).build();
    	journalAdapter.publish(je.getJournalMsg());
	}
}
