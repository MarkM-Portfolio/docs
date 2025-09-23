package com.ibm.concord.document.services.autopublish;

import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.websphere.asynchbeans.Work;

public class AutoPublishWork implements Work {

  private IDocumentEntry docEntry;

  private UserBean user;

  DraftDescriptor draftDescriptor;

  public AutoPublishWork(IDocumentEntry docEntry, UserBean user, DraftDescriptor dd)
  {
    this.docEntry = docEntry;
    this.user = user;
    this.draftDescriptor = dd;
  }

  public void run()
  {
    AutoPublishAction action = new AutoPublishAction(docEntry, user, draftDescriptor);
    action.action();    
  }

  @Override
  public void release()
  {
    // TODO Auto-generated method stub    
  }

}
