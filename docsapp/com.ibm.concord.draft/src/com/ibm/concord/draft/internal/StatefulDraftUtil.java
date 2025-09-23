/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.draft.internal;

import java.io.File;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.IllegalDraftStateException;
import com.ibm.concord.draft.state.ActiveState;
import com.ibm.concord.draft.state.DraftState;
import com.ibm.concord.draft.state.InActiveState;
import com.ibm.concord.draft.state.NoneState;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.draft.DraftComponent;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.docs.common.io.FileUtil;

public class StatefulDraftUtil
{
  private static final Logger LOGGER = Logger.getLogger(StatefulDraftUtil.class.getName());

  public final static String INACTIVE_DRAFT_LIST_HOME;

  static
  {
    /*
     * NFS_HOME:                    /nfs_storage/
     * INACTIVE_DRAFT_LIST_HOME:    /nfs_storage/stateful_draft_list/InActive
     */
    DraftComponent draftComp = (DraftComponent)Platform.getComponent(DraftComponent.COMPONENT_ID);
    String NFS_HOME = draftComp.getDraftHome();
    INACTIVE_DRAFT_LIST_HOME = NFS_HOME + File.separator + "stateful_draft_list" + File.separator + "InActive";
  }

  public static boolean inInActiveList(DraftDescriptor draftDescriptor)
  {
    LOGGER.entering(StatefulDraftUtil.class.getName(), "inInActiveList", draftDescriptor);

    String filePath = draftDescriptor.getInternalURI().replaceFirst(":", "&");
    filePath = filePath.replace(File.separatorChar, '^');

    File inactiveList = new File(new File(INACTIVE_DRAFT_LIST_HOME, draftDescriptor.getPrimaryHash()), draftDescriptor.getSecondaryHash());

    boolean result = FileUtil.nfs_assertExistsFile(new File(inactiveList, filePath), -1);

    LOGGER.exiting(StatefulDraftUtil.class.getName(), "inInActiveList", result);

    return result;
  }

  public static DraftDescriptor[] getInActiveList()
  {
    LOGGER.entering(StatefulDraftUtil.class.getName(), "getInActiveList");

    Vector<DraftDescriptor> drafts = new Vector<DraftDescriptor>();
    File inactiveList = new File(INACTIVE_DRAFT_LIST_HOME);
    File[] primaryHashs = inactiveList.listFiles();
    for (int i = 0; i < primaryHashs.length; i++)
    {
      int primaryHash = validateHash(primaryHashs[i].getName());
      if (primaryHash >= 0 && primaryHash <= DraftStorageManager.PRIMARY_MAX_SLOT && primaryHashs[i].isDirectory())
      {
        File[] secondaryHashs = primaryHashs[i].listFiles();
        for (int j = 0; j < secondaryHashs.length; j++)
        {
          int secondaryHash = validateHash(secondaryHashs[j].getName());
          if (secondaryHash >= 0 && secondaryHash <= DraftStorageManager.SECONDARY_MAX_SLOT && secondaryHashs[j].isDirectory())
          {
            File[] inactiveDrafts = secondaryHashs[j].listFiles();
            for (int k = 0; k < inactiveDrafts.length; k++)
            {
              String draftUri = inactiveDrafts[k].getName();
              draftUri = draftUri.replace('^', File.separatorChar);
              draftUri = draftUri.replaceFirst("&", ":");
              DraftDescriptor draft = new DraftDescriptor(draftUri, new String[] { String.valueOf(primaryHash),
                  String.valueOf(secondaryHash) });
              drafts.add(draft);
            }
          }
        }
      }
    }

    DraftDescriptor[] result = (DraftDescriptor[]) drafts.toArray(new DraftDescriptor[drafts.size()]);

    LOGGER.exiting(StatefulDraftUtil.class.getName(), "getInActiveList", result);

    return result;
  }

  public static DraftState getDraftState(DraftDescriptor draftDescriptor, boolean isFinal)
  {
    LOGGER.entering(StatefulDraftUtil.class.getName(), "getDraftState", draftDescriptor);

    DraftState result = null;

    Integer state = DraftState.DRAFTS_STATE.get(draftDescriptor.getDocId());
    String[] data = new File(draftDescriptor.getURI()).list();
    int empty = data == null ? -1 : data.length;
    if (state == null)
    {
      LOGGER.info("draft state of " + draftDescriptor.getDocId() + " is " + state + ", the media folder contains " + empty + " files, isFinal is " + isFinal);
      if (empty == 0)
      {
        result = NoneState.STATE;
        if (!isFinal)
        {
          Integer iState = DraftState.DRAFTS_STATE.put(draftDescriptor.getDocId(), DraftState.NONE_STATE);
          LOGGER.log(Level.FINE, "Draft State Inited: {0} -> {1}", new Object[] { iState, DraftState.NONE_STATE });
        }
      }
      else if (empty == -1)
      {
        throw new IllegalDraftStateException(draftDescriptor, new IllegalStateException("Check Disk Draft State Failed."));
      }
      else
      {
        result = InActiveState.STATE;
        if (!isFinal)
        {
          Integer iState = DraftState.DRAFTS_STATE.put(draftDescriptor.getDocId(), DraftState.INACTIVE_STATE);
          LOGGER.log(Level.FINE, "Draft State Inited: {0} -> {1}", new Object[] { iState, DraftState.INACTIVE_STATE });
        }
      }
    }
    else
    {
      if (state.intValue() == DraftState.NONE_STATE)
      {
        result = NoneState.STATE;
      }
      else if (state.intValue() == DraftState.INACTIVE_STATE)
      {
        result = InActiveState.STATE;
      }
      else if (state.intValue() == DraftState.ACTIVE_STATE)
      {
        result = ActiveState.STATE;
      }
      else
      {
        throw new IllegalDraftStateException(draftDescriptor, new IllegalStateException("In-Memory DraftState Un-Expected."));
      }
    }
    
    LOGGER.exiting(StatefulDraftUtil.class.getName(), "getDraftState", result.getStateId());

    return result;
  }

  public static DraftState getDraftState(DraftDescriptor draftDescriptor)
  {
    return getDraftState(draftDescriptor, false);
  }

  private static int validateHash(String hash)
  {
    try
    {
      return Integer.valueOf(hash).intValue();
    }
    catch (NumberFormatException e)
    {
      return -1;
    }
  }
}
