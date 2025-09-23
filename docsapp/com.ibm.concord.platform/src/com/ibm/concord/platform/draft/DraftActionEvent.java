package com.ibm.concord.platform.draft;

import com.ibm.concord.spi.beans.DraftDescriptor;

public class DraftActionEvent
{
  private DraftDescriptor dd;
  private DraftAction action;
  private Object data;
  
  public DraftActionEvent(DraftDescriptor dd, DraftAction action, Object data)
  {
    this.dd = dd;
    this.action = action;
    this.data = data;
  }
  
  public DraftDescriptor getDraftDescriptor()
  {
    return dd;
  }

  public DraftAction getAction()
  {
    return action;
  }

  public Object getData()
  {
    return data;
  }


}
