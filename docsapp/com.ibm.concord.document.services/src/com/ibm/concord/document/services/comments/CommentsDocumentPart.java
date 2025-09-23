/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.services.comments;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.document.services.IDocumentPart;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.draft.section.DraftSection;
import com.ibm.concord.draft.section.SectionDescriptor;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONArtifact;
import com.ibm.json.java.JSONObject;

public class CommentsDocumentPart implements IDocumentPart
{
  private static final Logger LOG = Logger.getLogger(CommentsDocumentPart.class.getName());

  private static final String COMMENTS_ID = "id";

  private static final String COMMENTS_ITEMS = "items";

  private static final String ORPHAN = "isOrphan";

  public static final String COMMENT_MSG_DATA = "data";

  private final String TYPE = "comments";

  private final static String COMMENTS_MSG_FILE = "comments.json";

  private final String ACT_ACTION = "action";

  private final String ACT_ADD = "add";

  private final String ACT_DELETE = "delete";

  private final String ACT_APPEND = "append";

  private final String ACT_UPDATE = "update";

  private final String ID = "id";

  private final String INDEX = "index";

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.document.services.IDocumentPart#applyMessage(com.ibm.concord.spi.beans.DraftDescriptor,
   * com.ibm.json.java.JSONArray)
   */
  public void applyMessage(DraftDescriptor draftDesc, JSONArray msgList) throws Exception
  {
    JSONArray commentsList = (JSONArray) getCurrentState(draftDesc, msgList, null);
    write(draftDesc, commentsList);
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.document.services.IDocumentPart#belongsTo(com.ibm.json.java.JSONObject)
   */
  public boolean belongsTo(JSONObject msgData)
  {
    boolean isFiltered = false;
    Object objType = (msgData != null) ? msgData.get(MessageConstants.MESSAGE_TYPE_KEY) : null;
    String strType = (objType != null) ? objType.toString() : null;
    if ((strType != null) && strType.equalsIgnoreCase(TYPE))
    {
      isFiltered = true;
    }
    return isFiltered;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.document.services.IDocumentPart#getCurrentState(com.ibm.concord.spi.beans.DraftDescriptor,
   * com.ibm.json.java.JSONArray, com.ibm.json.java.JSONObject)
   */
  public JSONArtifact getCurrentState(DraftDescriptor draftDesc, JSONArray msgList, JSONObject criteria)
  {
    JSONArray commentsList = read(draftDesc);

    if (msgList == null || msgList.size() == 0)
    {
      return commentsList;
    }

    for (int i = 0; i < msgList.size(); i++)
    {
      JSONObject msgData = (JSONObject) msgList.get(i);
      String action = msgData.get(ACT_ACTION).toString();
      if (action.equalsIgnoreCase(ACT_ADD))
      {
        add(msgData, commentsList);
      }
      else if (action.equalsIgnoreCase(ACT_APPEND))
      {
        appendItem(msgData.get(ID).toString(), msgData, commentsList);
      }
      else if (action.equalsIgnoreCase(ACT_UPDATE))
      {
        updateItem(msgData.get(ID).toString(), msgData.get(INDEX).toString(), msgData, commentsList);
      }
      else if (action.equalsIgnoreCase(ACT_DELETE))
      {
        remove(msgData.get(ID).toString(), commentsList);
      }
    }

    return commentsList;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.document.services.IDocumentPart#getId()
   */
  public String getId()
  {
    return TYPE;
  }

  private static void add(JSONObject msgData, JSONArray commentsList)
  {
    JSONObject item = getItem(msgData);
    String commentsId = msgData.get(COMMENTS_ID).toString();
    JSONObject comments = find(commentsList, commentsId);
    if (comments == null)
    {
      comments = new JSONObject();
      comments.put(COMMENTS_ID, commentsId);

      JSONArray items = new JSONArray();
      items.add(item);

      comments.put(COMMENTS_ITEMS, items);
      commentsList.add(comments);
    }
  }

  private static void appendItem(String commentsId, JSONObject msgData, JSONArray commentsList)
  {
    JSONObject item = getItem(msgData);
    JSONObject comments = find(commentsList, commentsId);

    if (comments != null)
    {
      JSONArray items = (JSONArray) comments.get(COMMENTS_ITEMS);
      items.add(item);
    }
  }

  private static void updateItem(String commentsId, String commentIndex, JSONObject msgData, JSONArray commentsList)
  {
    JSONObject item = getItem(msgData);
    JSONObject comments = find(commentsList, commentsId);

    if (comments != null)
    {
      JSONArray items = (JSONArray) comments.get(COMMENTS_ITEMS);
      int index = Integer.parseInt(commentIndex);
      items.add(index, item);
      items.remove(index + 1);
    }
  }

  private static void remove(String commentsId, JSONArray commentsList)
  {
    JSONObject comments = find(commentsList, commentsId);
    if (comments != null)
    {
      commentsList.remove(comments);
    }
  }

  private static JSONObject getItem(JSONObject msgData)
  {
    JSONObject item = null;
    String itemStr = msgData.get(COMMENT_MSG_DATA).toString();

    try
    {
      item = JSONObject.parse(itemStr);
    }
    catch (Exception e)
    {
    }
    return item;
  }

  private static JSONObject find(JSONArray commentsList, String commentsId)
  {
    for (int i = 0; i < commentsList.size(); i++)
    {
      JSONObject comments = (JSONObject) commentsList.get(i);
      if (commentsId.equals(comments.get(COMMENTS_ID)))
      {
        return comments;
      }
    }
    return null;
  }

  private static JSONArray read(DraftDescriptor draftDesc)
  {
    JSONArray commentsList = new JSONArray();
    try
    {
      SectionDescriptor sd = getCommentsSectionDescriptor(draftDesc);
      DraftStorageManager manager = DraftStorageManager.getDraftStorageManager(false);
      commentsList = manager.getSectionAsJSONArray(sd);
    }
    catch (ConcordException e)
    {
      LOG.log(Level.WARNING, "Cannot read comments.json from: " + draftDesc.getURI(), e);
    }

    return commentsList;
  }

  /**
   * Mark comments as orphaned for new uploaded version
   * 
   * @param draftDesc
   * @return
   */
  public static JSONArray markCommentsOrphaned(JSONArray commentsList)
  {
    for (int i = 0; i < commentsList.size(); i++)
    {
      JSONObject comments = (JSONObject) commentsList.get(i);
      if (comments != null)
      {
        JSONArray items = (JSONArray) comments.get(COMMENTS_ITEMS);
        if (items != null && items.get(0) instanceof JSONObject)
        {
          JSONObject data = (JSONObject) items.get(0);
          if (data != null)
          {
            data.put(ORPHAN, Boolean.valueOf(true));
          }
        }
      }
    }
    return commentsList;
  }

  /**
   * Writes the comments list to draft file.
   * 
   * @param draftDesc
   * @param commentsList
   * @throws ConcordException
   */
  public static void write(DraftDescriptor draftDesc, JSONArray commentsList) throws ConcordException
  {
    try
    {
      SectionDescriptor sd = getCommentsSectionDescriptor(draftDesc);
      DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager(false);
      dsm.storeSectionAsJSONArray(sd, commentsList);
      if (LOG.isLoggable(Level.FINEST))
      {
        LOG.log(Level.FINEST, "Write the comments to {0}.", (draftDesc.getInTransacting() ? sd.getSectionTransUri() : sd.toString()));
      }
    }
    catch (ConcordException e)
    {
      LOG.log(Level.WARNING, "Exception happens while writing comments to "
          + (draftDesc.getInTransacting() ? draftDesc.getTransURI() : draftDesc.getURI()), e);
      throw e;
    }
  }

  private static SectionDescriptor getCommentsSectionDescriptor(DraftDescriptor draftDescriptor) throws DraftDataAccessException,
      DraftStorageAccessException
  {
    DraftSection ds = DraftSection.getReservedSection(COMMENTS_MSG_FILE);
    return DraftStorageManager.getDraftStorageManager(false).getSectionDescriptor(draftDescriptor, ds);
  }
}
