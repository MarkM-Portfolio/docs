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

public class InActiveState extends DraftState
{
  public static final InActiveState STATE = new InActiveState();

  private InActiveState()
  {
    ;
  }

  public void toActive(DraftDescriptor draftDescriptor) throws DraftDataAccessException
  {
    LOGGER.entering(InActiveState.class.getName(), "toActive", draftDescriptor);

    int curState = StatefulDraftUtil.getDraftState(draftDescriptor).getStateId();
    if (DraftState.INACTIVE_STATE == curState)
    {
      LOGGER.log(Level.FINE, "Draft State: InActive");
      Integer prvState = DRAFTS_STATE.put(draftDescriptor.getDocId(), DraftState.ACTIVE_STATE);
      LOGGER.log(Level.FINE, "Draft State Changed: {0} -> {1}", new Object[] { prvState, DraftState.ACTIVE_STATE });

      removeFromInActiveList(draftDescriptor);
    }
    else
    {
      if (DraftState.NONE_STATE == curState)
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: InActive");
        LOGGER.log(Level.WARNING, "Actual Draft State: None");
        throw new IllegalDraftStateException(draftDescriptor);
      }
      else if (DraftState.ACTIVE_STATE == curState)
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: InActive");
        LOGGER.log(Level.WARNING, "Actual Draft State: Active");
        throw new IllegalDraftStateException(draftDescriptor);
      }
      else
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: InActive");
        LOGGER.log(Level.WARNING, "Actual Draft State: Unknown");
        throw new IllegalDraftStateException(draftDescriptor);
      }
    }

    LOGGER.exiting(InActiveState.class.getName(), "toActive");
  }

  public void toInActive(DraftDescriptor draftDescriptor) throws DraftDataAccessException
  {
    LOGGER.entering(InActiveState.class.getName(), "toInActive", draftDescriptor);

    int curState = StatefulDraftUtil.getDraftState(draftDescriptor).getStateId();
    if (DraftState.INACTIVE_STATE == curState)
    {
      LOGGER.log(Level.FINE, "Draft State: InActive (State Change Skipped)");
    }
    else
    {
      if (DraftState.NONE_STATE == curState)
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: InActive");
        LOGGER.log(Level.WARNING, "Actual Draft State: None");
        throw new IllegalDraftStateException(draftDescriptor);
      }
      else if (DraftState.ACTIVE_STATE == curState)
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: InActive");
        LOGGER.log(Level.WARNING, "Actual Draft State: Active");
        throw new IllegalDraftStateException(draftDescriptor);
      }
      else
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: InActive");
        LOGGER.log(Level.WARNING, "Actual Draft State: Unknown");
        throw new IllegalDraftStateException(draftDescriptor);
      }
    }

    LOGGER.exiting(InActiveState.class.getName(), "toInActive");
  }

  public void toNone(DraftDescriptor draftDescriptor) throws DraftDataAccessException
  {
    LOGGER.entering(InActiveState.class.getName(), "toNone", draftDescriptor);

    int curState = StatefulDraftUtil.getDraftState(draftDescriptor).getStateId();
    if (DraftState.INACTIVE_STATE == curState)
    {
      LOGGER.log(Level.FINE, "Draft State: InActive");
      Integer prvState = DRAFTS_STATE.put(draftDescriptor.getDocId(), DraftState.NONE_STATE);
      LOGGER.log(Level.FINE, "Draft State Changed: {0} -> {1}", new Object[] { prvState, DraftState.NONE_STATE });

      removeFromInActiveList(draftDescriptor);
    }
    else
    {
      if (DraftState.NONE_STATE == curState)
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: InActive");
        LOGGER.log(Level.WARNING, "Actual Draft State: None");
        throw new IllegalDraftStateException(draftDescriptor);
      }
      else if (DraftState.ACTIVE_STATE == curState)
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: InActive");
        LOGGER.log(Level.WARNING, "Actual Draft State: Active");
        throw new IllegalDraftStateException(draftDescriptor);
      }
      else
      {
        LOGGER.log(Level.WARNING, "Expected Draft State: InActive");
        LOGGER.log(Level.WARNING, "Actual Draft State: Unknown");
        throw new IllegalDraftStateException(draftDescriptor);
      }
    }

    LOGGER.exiting(InActiveState.class.getName(), "toNone");
  }

  public int getStateId()
  {
    return INACTIVE_STATE;
  }
}
