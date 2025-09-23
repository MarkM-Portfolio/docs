/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.lc3.notification;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.lc3.util.HttpClientInvoker;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.notification.IEmailNoticeAdapter;
import com.ibm.concord.spi.notification.IEmailNoticeEntry;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class ConnsEmailNoticeAdapter implements IEmailNoticeAdapter
{
  private static final Logger LOG = Logger.getLogger(ConnsEmailNoticeAdapter.class.getName());

  private static final String GENERATOR = "generator";

  private static final String ALL = "/@all";

  private String ACTIVITY_STREAM_URL;

  private JSONObject genObj;

  protected String eNoticeId;

  protected URL serverUrl;

  protected URL restfulUrl;

  protected String userAgent;

  private HttpClientInvoker httpCInvoker;

  /*
   * For third party POST events, IBM Connections limits the input sizes of certain fields to the following: Note: In some cases If the size
   * limits are exceeded then a HTTP 400 Bad request response is returned. In other cases, the input is truncated to the size of the limit
   * minus the following string "..." that is appended to the field.
   * 
   * The total size of the ActivityEntry to be posted should not exceed 1048576 bytes.
   * 
   * The ID associated with an ActivityObject which is the object of an ActivityEntry is limited to 36 bytes (To be updated to 256 bytes,
   * see Defect 77625).
   * 
   * The ID associated with the ActivityEntry Generator is limited to 36 bytes.
   * 
   * The ID associated with the IBM Connections extension Rollupid is limited to 256 bytes.
   * 
   * Other items that are mapped to columns in the IBM Connections database are truncated to fit in those columns. For example, the Content
   * property of an ActivityEntry is limited to 4000 bytes.
   */
  public ConnsEmailNoticeAdapter()
  {

  }

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
      LOG.warning("Illegal URL string when perform initialization of class " + e);
      throw new IllegalStateException("Illegal URL string when perform initialization of class "
          + ConnsEmailNoticeAdapter.class.getSimpleName(), e);
    }
    httpCInvoker = new HttpClientInvoker(config);
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
        httpCInvoker.sendPostMessage(user, bf.toString(), postParams, false);
      }
      catch (Exception e)
      {
        LOG.warning("Unable to send email notification: " + e);
        LOG.warning("The post data is: " + postParams);
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
