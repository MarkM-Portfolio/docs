/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.platform.mention;

import java.util.ArrayList;

import com.ibm.concord.platform.notification.ActivityEntry;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.notification.IEmailNoticeEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class MentionMonitor
{
  /*
   * Example of POST made to <activityStreamCtxRoot>/@me/@all/@all { "generator": {"id":"An External Application1"}, "actor": {"id":"@me"},
   * "title":"${mention.you}", "to":
   * [{"objectType":"person","id":"urn:lsid:lconn.ibm.com:profiles.person:510b99c0-0101-102e-893f-f78755f7e0ed"}], "object":
   * {"summary":"hey @{{urn:lsid:lconn.ibm.com:profiles.person:510b99c0-0101-102e-893f-f78755f7e0ed|@Amy Jones102}}","id":"c"},
   * "verb":"mention" }
   */
  public static ArrayList<IEmailNoticeEntry> getMentionNotifyEntries(UserBean caller, ArrayList<String> idList, IDocumentEntry docEntry,
      String link, String content)
  {
    ArrayList<IEmailNoticeEntry> entryList = new ArrayList<IEmailNoticeEntry>();

    ActivityEntry entry = new ActivityEntry();
    entry.setActor(caller.getId());
    entry.setTitle(ActivityEntry.MENTION_TARGET);
    entry.setPersonUrl(caller.getId());
    entry.setTarget(createTarget(docEntry, link));
    entry.setMailTo(idList);
    if (content != null && !"".equals(content))
    {
      entry.setContent(content);
    }
    entry.setObject(createObject(docEntry, content, link));
    entry.setVerb(ActivityEntry.MENTION);

    entryList.add(entry);
    return entryList;
  }

  /*
   * target: { url: "http://docs03.cn.ibm.com/docs/app/doc/lcfiles/2f9363a6-4612-4ac5-ac3a-3d94d6f39db2/edit/content", id:
   * "2f9363a6-4612-4ac5-ac3a-3d94d6f39db2", displayName: "document's title", objectType: "file" }
   * 
   * @return target JSONObject
   */
  private static JSONObject createTarget(IDocumentEntry docEntry, String link)
  {
    if (link == null)
      link = URLConfig.getContextPath() + "/app/doc/" + docEntry.getRepository() + "/" + docEntry.getDocUri() + "/edit/content";
    JSONObject actor = new JSONObject();
    actor.put(ActivityEntry.URL, link);
    actor.put(ActivityEntry.ID, docEntry.getDocUri());
    actor.put(ActivityEntry.DISPLAY_NAME, docEntry.getTitle());
    actor.put(ActivityEntry.OBJECT_TYPE, ActivityEntry.OBJECT_TYPE_FILE);
    return actor;
  }

  private static JSONObject createObject(IDocumentEntry docEntry, String content, String link)
  {
    JSONObject obj = new JSONObject();
    if (content != null && !"".equals(content))
      obj.put(ActivityEntry.SUMMARY, content);
    if (link == null)
      link = URLConfig.getContextPath() + "/app/doc/" + docEntry.getRepository() + "/" + docEntry.getDocUri() + "/edit/content";
    obj.put(ActivityEntry.URL, link);
    obj.put(ActivityEntry.ID, docEntry.getDocUri());
    obj.put(ActivityEntry.DISPLAY_NAME, docEntry.getTitle());
    obj.put(ActivityEntry.OBJECT_TYPE, ActivityEntry.TYPE_NOTE);
    return obj;
  }
}
