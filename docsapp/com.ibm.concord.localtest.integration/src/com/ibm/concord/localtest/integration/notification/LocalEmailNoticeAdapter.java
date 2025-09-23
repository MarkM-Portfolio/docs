/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.localtest.integration.notification;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.notification.IEmailNoticeAdapter;
import com.ibm.concord.spi.notification.IEmailNoticeEntry;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class LocalEmailNoticeAdapter implements IEmailNoticeAdapter
{
  private static final Logger LOG = Logger.getLogger(LocalEmailNoticeAdapter.class.getName());

  private static final String GENERATOR = "generator";

  private static final String ALL = "/@all";

  private String ACTIVITY_STREAM_URL;

  private JSONObject genObj;

  protected String eNoticeId;

  protected URL serverUrl;

  protected URL restfulUrl;

  protected String userAgent;

  public void init(JSONObject config)
  {
    if (config.get("server_url") == null)
    {
      throw new IllegalStateException("<server_url> setting is missing from [Lotus Connection Files] repository adapter config.");
    }
    if (config.get("restful_url") == null)
    {
      throw new IllegalStateException("<restful_url> setting is missing from [Lotus Connection Files] repository adapter config.");
    }
    genObj = (JSONObject) config.get(GENERATOR);
    if (genObj == null)
    {
      throw new IllegalStateException("<generator> setting is missing from [Lotus Connection Files] repository adapter config.");
    }
    if (genObj.get("id") == null)
    {
      throw new IllegalStateException("<generator.id> setting is missing from [Lotus Connection Files] repository adapter config.");
    }

    eNoticeId = (String) config.get("id");

    try
    {
      serverUrl = new URL((String) config.get("server_url"));
      userAgent = ConcordUtil.getUserAgent("ActivityStream");
      String server = (String) config.get("server_url");
      String restful_url = (String) config.get("restful_url");
      new URL(serverUrl, restful_url);

      ACTIVITY_STREAM_URL = server + restful_url;
    }
    catch (MalformedURLException e)
    {
      throw new IllegalStateException("Illegal URL string when perform initialization of class "
          + LocalEmailNoticeAdapter.class.getSimpleName(), e);
    }

  }

  private JSONObject getPostParams(JSONObject entry)
  {
    entry.put(GENERATOR, genObj);
    return entry;
  }

  public boolean entriesNotified(UserBean user, ArrayList<IEmailNoticeEntry> entryList) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("entryNotified entering");
    }
    for (IEmailNoticeEntry entry : entryList)
    {
      String personUrl = entry.getPersonUrl();
      if (personUrl == null)
        continue;

      JSONObject postParams = this.getPostParams(entry.getEntry());
      try
      {
        StringBuffer bf = new StringBuffer(ACTIVITY_STREAM_URL);
        bf.append(personUrl);
        bf.append(ALL);
        if (isMentionEntry(postParams))
        {
          bf.append(ALL);
        }
        // TODO POST
      }
      catch (Exception e)
      {
        throw new AccessException("Unable to send email notification: " + entry.toString());
      }
    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("entryNotified exiting");
    }
    return true;
  }

  private boolean isMentionEntry(JSONObject entry)
  {
    String theVerb = (String) entry.get("verb");
    return ("mention".equals(theVerb)) ? true : false;
  }

}
