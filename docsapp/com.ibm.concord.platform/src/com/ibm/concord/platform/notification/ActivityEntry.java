/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.platform.notification;

import java.util.Date;
import java.util.Iterator;
import java.util.List;

import com.ibm.concord.spi.notification.IEmailNoticeEntry;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ActivityEntry implements IEmailNoticeEntry
{
  private static final String ACTOR = "actor";

  private static final String OBJECT = "object";

  private static final String CONTENT = "content";

  private static final String UPDATED = "updated";

  private static final String VERB = "verb";

  private static final String POST = "post";

  private static final String TITLE = "title";

  private static final String MAIL_TO = "to";

  private static final String TO_ID_PREFIX = "urn:lsid:lconn.ibm.com:profiles.person:";

  public static final String MENTION = "mention";

  public static final String TARGET = "target";

  public static final String SUMMARY = "summary";
  
  public static final String TYPE_NOTE= "note";

  public static final String ID = "id";

  public static final String DISPLAY_NAME = "displayName";

  public static final String OBJECT_TYPE = "objectType";

  public static final String OBJECT_TYPE_FILE = "file";

  public static final String OBJECT_TYPE_EVENT = "event";

  public static final String OBJECT_TYPE_PERSON = "person";

  public static final String URL = "url";

  public static final String ENDTIME = "endTime";

  public static final String STARTTIME = "startTime";

  public static final String AUTHOR = "author";

  public static final String ASSIGN = "${create.target}";

  public static final String REVIEW_IN_TARGET = "${review.in.target}";

  public static final String REVIEW_TO_TARGET = "${review.to.target}";

  public static final String APPROVE_TARGET = "${approve.target}";

  public static final String REJECT_TARGET = "${reject.target}";

  public static final String COMPLETE_TARGET = "${complete.target}";

  public static final String UPDATE_TARGET = "${update.target}";

  public static final String DELETE_TARGET = "${delete.target}";

  public static final String REVIEW_CANCEL_TARGET = "${review.cancel.target}";

  public static final String MENTION_TARGET = "${mention.you}";

  // Following is the detailed title template
  /*
   * add={Actor} added {Object}. add.target={Actor} added {Object} to {Target}. create={Actor} created {Object}. create.target={Actor}
   * created {Object} in {Target}. post={Actor} posted {Object}. post.target={Actor} posted {Object} to {Target}. comment={Actor} created a
   * comment. comment.target={Actor} commented on {Target}. like={Actor} liked {Object}. like.target={Actor} liked {Object} in {Target}.
   * update={Actor} updated {Object}. update.target={Actor} updated {Object} in {Target}. share={Actor} shared {Object}.
   * share.target={Actor} shared {Object} with {Target}. share.in.target={Actor} shared {Object} in {Target}. follow={Actor} is now
   * following {Object}. stopFollowing={Actor} has stopped following {Object}. tag={Actor} tagged {Object} with {Target}. tag.target={Actor}
   * tagged {Object} with {Target}. join={Actor} is now a member of {Object}. join.target={Actor} is now a member of {Object} in {Target}.
   * invite={Actor} invited {Object}. invite.target={Actor} invited {Object} to {Target}. access={Actor} accessed {Object}.
   * access.target={Actor} accessed {Object} in {Target}. assign={Actor} assigned {Object} to {Target}. accept={Actor} accepted {Object}.
   * reject={Actor} rejected {Object}. upload={Actor} uploaded {Object}. upload.target={Actor} uploaded {Object} to {Target}.
   * publish={Actor} published {Object}. publish.target={Actor} published {Object} to {Target}. lock.target={Actor} locked {Object} in
   * {Target}. unlock.target={Actor} unlocked {Object} in {Target}. review.in.target={Actor} submitted {Object} in {Target} for review.
   * review.to.target={Actor} submitted {Object} to {Target} for review. approve={Actor} approved {Object}. approve.target={Actor} approved
   * {Object} in {Target}. review.cancel={Actor} cancelled the review request of {Object}. review.cancel.target={Actor} cancelled the review
   * request of {Object} in {Target}. reject.target={Actor} rejected {Object} in {Target}. review.withdraw={Actor} withdrew the review of
   * {Object}. review.withdraw.target={Actor} withdrew the review of {Object} in {Target}. complete={Actor} completed {Object}.
   * complete.target={Actor} completed {Object} in {Target}. stop={Actor} stopped {Object}. stop.target={Actor} stopped {Object} in
   * {Target}. delete={Actor} deleted {Object}. delete.target={Actor} deleted {Object} in {Target}. start={Actor} started {Object}.
   * start.target={Actor} started {Object} in {Target}.
   */
  private JSONObject entry;

  private String personUrl;

  public ActivityEntry()
  {
    entry = new JSONObject();
    this.setVerb(POST);
  }

  public JSONObject getEntry()
  {
    return entry;
  }

  public String getPersonUrl()
  {
    return personUrl;
  }

  public void setVerb(String verb)
  {
    if (verb == null)
      entry.put(VERB, POST);
    else
      entry.put(VERB, verb);
  }

  public void setActor(String actor)
  {
    JSONObject act = new JSONObject();
    if (actor != null)
    {
      act.put(OBJECT_TYPE, OBJECT_TYPE_PERSON);
      act.put(ID, TO_ID_PREFIX + actor);
      entry.put(ACTOR, act);
    }
  }

  public void setObject(JSONObject object)
  {
    entry.put(OBJECT, object);
  }

  public void setTarget(JSONObject target)
  {
    entry.put(TARGET, target);
  }

  public void setContent(String content)
  {
    entry.put(CONTENT, content);
  }

  public void setUpdated()
  {
    entry.put(UPDATED, (new Date()).toGMTString());
  }

  public void setTitle(String title)
  {
    entry.put(TITLE, title);
  }

  /*
   * "to":[{"objectType":"person","id":"urn:lsid:lconn.ibm.com:profiles.person:1a9c9cc0-7547-102f-9f50-f6be80987c6a"},{"objectType":"person",
   * "id":"urn:lsid:lconn.ibm.com:profiles.person:89d445c0-709c-102f-9f46-f6be80987c6a"}],
   */
  public void setMailTo(List<String> mailto)
  {
    Iterator<String> itMail = mailto.iterator();
    JSONArray array = new JSONArray();
    JSONObject obj = null;
    while (itMail.hasNext())
    {
      String id = itMail.next();
      obj = new JSONObject();
      obj.put(OBJECT_TYPE, OBJECT_TYPE_PERSON);
      obj.put(ID, TO_ID_PREFIX + id);
      array.add(obj);
    }
    entry.put(MAIL_TO, array);
  }

  public void setMailTo(String mailto)
  {
    JSONArray array = new JSONArray();
    JSONObject obj = new JSONObject();
    obj.put(OBJECT_TYPE, OBJECT_TYPE_PERSON);
    obj.put(ID, TO_ID_PREFIX + mailto);
    array.add(obj);
    entry.put(MAIL_TO, array);
  }

  public void setPersonUrl(String person)
  {
    personUrl = TO_ID_PREFIX + person;
  }
}
