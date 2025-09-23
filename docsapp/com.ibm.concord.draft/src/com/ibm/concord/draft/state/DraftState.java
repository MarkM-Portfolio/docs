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

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.internal.StatefulDraftUtil;
import com.ibm.concord.spi.beans.DraftDescriptor;

public abstract class DraftState
{
  protected static final Logger LOGGER = Logger.getLogger(DraftState.class.getName());

  public final static int NONE_STATE = 0;
  public final static int ACTIVE_STATE = 1;
  public final static int INACTIVE_STATE = 2;

  public final static Map<String, Integer> DRAFTS_STATE = new ConcurrentHashMap<String, Integer>();

  public abstract void toNone(DraftDescriptor draftDescriptor) throws DraftDataAccessException;
  public abstract void toActive(DraftDescriptor draftDescriptor) throws DraftDataAccessException;
  public abstract void toInActive(DraftDescriptor draftDescriptor) throws DraftDataAccessException;

  public abstract int getStateId();

  protected static void addToInActiveList(DraftDescriptor draftDescriptor) throws DraftDataAccessException
  {
    LOGGER.entering(DraftState.class.getName(), "addToInActiveList", draftDescriptor);

    File inactiveList = new File(new File(StatefulDraftUtil.INACTIVE_DRAFT_LIST_HOME, draftDescriptor.getPrimaryHash()), draftDescriptor
        .getSecondaryHash());
    if ((!inactiveList.exists() || !inactiveList.isDirectory()) && !inactiveList.mkdirs())
    {
      DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor);
      ddae.setDefaultErrDetail("Draft in-active list dir initialization failed");
      ddae.getData().put("inactiveListPath", inactiveList.getPath());
      throw ddae;
    }

    try
    {
      String filePath = draftDescriptor.getInternalURI().replaceFirst(":", "&");
      filePath = filePath.replace(File.separatorChar, '^');
      if (!new File(inactiveList, filePath).exists())
      {
        new File(inactiveList, filePath).createNewFile();
      }
    }
    catch (IOException e)
    {
      DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor, e);
      ddae.setDefaultErrDetail("Add draft to in-active list failed");
      throw ddae;
    }

    LOGGER.exiting(DraftState.class.getName(), "addToInActiveList");
  }

  protected static void removeFromInActiveList(DraftDescriptor draftDescriptor) throws DraftDataAccessException
  {
    LOGGER.entering(DraftState.class.getName(), "removeFromInActiveList", draftDescriptor);

    File inactiveList = new File(new File(StatefulDraftUtil.INACTIVE_DRAFT_LIST_HOME, draftDescriptor.getPrimaryHash()), draftDescriptor
        .getSecondaryHash());
    if ((!inactiveList.exists() || !inactiveList.isDirectory()) && !inactiveList.mkdirs())
    {
      DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor);
      ddae.setDefaultErrDetail("Draft in-active list dir initialization failed");
      ddae.getData().put("inactiveListPath", inactiveList.getPath());
      throw ddae;
    }

    String filePath = draftDescriptor.getInternalURI().replaceFirst(":", "&");
    filePath = filePath.replace(File.separatorChar, '^');
    if (new File(inactiveList, filePath).exists() && !new File(inactiveList, filePath).delete())
    {
      DraftDataAccessException ddae = new DraftDataAccessException(draftDescriptor);
      ddae.setDefaultErrDetail("Remove draft from in-active list failed");
      ddae.getData().put("inactiveListPath", new File(inactiveList, filePath).getPath());
      throw ddae;
    }

    LOGGER.exiting(DraftState.class.getName(), "removeFromInActiveList");
  }
}
