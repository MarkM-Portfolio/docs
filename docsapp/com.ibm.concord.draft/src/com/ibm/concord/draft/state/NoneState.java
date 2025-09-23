/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.draft.state;

import java.util.logging.Level;

import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.IllegalDraftStateException;
import com.ibm.concord.draft.internal.StatefulDraftUtil;
import com.ibm.concord.spi.beans.DraftDescriptor;

public class NoneState extends DraftState
{
  public static final NoneState STATE = new NoneState();

  private NoneState()
  {
    ;
  }

  public void toActive(DraftDescriptor draftDescriptor) throws DraftDataAccessException
  {
    LOGGER.entering(NoneState.class.getName(), "toActive", draftDescriptor);

    int curState = StatefulDraftUtil.getDraftState(draftDescriptor).getStateId();
    if (DraftState.NONE_STATE == curState)
    {
      LOGGER.log(Level.FINE, "Draft State: None");
      Integer prvState = DRAFTS_STATE.put(draftDescriptor.getDocId(), DraftState.ACTIVE_STATE);
      LOGGER.log(Level.FINE, "Draft State Changed: {0} -> {1}", new Object[] { prvState, DraftState.ACTIVE_STATE });
    }
    else
    {
      if (DraftState.INACTIVE_STATE == curState)
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: None");
        LOGGER.log(Level.WARNING, "Actual Draft State: InActive");
        throw new IllegalDraftStateException(draftDescriptor);
      }
      else if (DraftState.ACTIVE_STATE == curState)
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: None");
        LOGGER.log(Level.WARNING, "Actual Draft State: Active");
        throw new IllegalDraftStateException(draftDescriptor);
      }
      else
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: None");
        LOGGER.log(Level.WARNING, "Actual Draft State: Unknown");
        throw new IllegalDraftStateException(draftDescriptor);
      }
    }

    LOGGER.exiting(NoneState.class.getName(), "toActive");
  }

  public void toInActive(DraftDescriptor draftDescriptor)
  {
    LOGGER.log(Level.SEVERE, "Illegal Draft State Change Request. {0}", new Object[] { draftDescriptor  });
    throw new IllegalDraftStateException(draftDescriptor);
  }

  public void toNone(DraftDescriptor draftDescriptor) throws DraftDataAccessException
  {
    LOGGER.entering(NoneState.class.getName(), "toNone", draftDescriptor);

    int curState = StatefulDraftUtil.getDraftState(draftDescriptor).getStateId();
    if (DraftState.NONE_STATE == curState)
    {
      LOGGER.log(Level.FINE, "Draft State: None (State Change Skipped)");
    }
    else
    {
      if (DraftState.INACTIVE_STATE == curState)
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: None");
        LOGGER.log(Level.WARNING, "Actual Draft State: InActive");
        throw new IllegalDraftStateException(draftDescriptor);
      }
      else if (DraftState.ACTIVE_STATE == curState)
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: None");
        LOGGER.log(Level.WARNING, "Actual Draft State: Active");
        throw new IllegalDraftStateException(draftDescriptor);
      }
      else
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: None");
        LOGGER.log(Level.WARNING, "Actual Draft State: Unknown");
        throw new IllegalDraftStateException(draftDescriptor);
      }
    }

    LOGGER.exiting(NoneState.class.getName(), "toNone");
  }

  public int getStateId()
  {
    return NONE_STATE;
  }
}
