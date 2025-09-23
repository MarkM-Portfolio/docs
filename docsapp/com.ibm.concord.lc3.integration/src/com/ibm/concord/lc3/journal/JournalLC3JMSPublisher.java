/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.lc3.journal;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.text.SimpleDateFormat;

import com.ibm.concord.platform.JMSConnection;
import com.ibm.concord.platform.journal.JournalHelper;
import com.ibm.concord.platform.journal.JournalHelper.Actor;
import com.ibm.concord.platform.journal.JournalHelper.Entity;
import com.ibm.concord.platform.journal.JournalMsgBuilder;
import com.ibm.concord.spi.journal.IJournalAdapter;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.runtime.ServerName;

public class JournalLC3JMSPublisher implements IJournalAdapter
{
  private static String location;
  private boolean enabled = false;
  static
  {
    location = ServerName.getDisplayName() == null ? "UnknownServer" : ServerName.getDisplayName();
    try
    {
      location = location + "@" + InetAddress.getLocalHost().getHostAddress();
    }
    catch (UnknownHostException e)
    {
      location = location + "@UnknownAddress";
    }
  }

  public void init(JSONObject config)
  {
    if (config != null)
    {
      String sEnabled = (String) config.get("enabled");
      if (sEnabled != null)
      {
        enabled = Boolean.parseBoolean(sEnabled.toString());
      }
    }
  }

  public void publish(Object[] msgBody)
  {
    if (enabled)
    {
      JMSConnection.writeMessage(format(msgBody));
    }
  }

  public void uninit()
  {
  }

  private String format(Object[] msgBody)
  {
    StringBuilder sb = new StringBuilder();
    SimpleDateFormat sd = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.mmm ");
    sb.append(sd.format(System.currentTimeMillis()));
    sb.append("on HCL Docs COMPONENT ");
    sb.append(msgBody[0].toString());
    sb.append(" USER");
    sb.append((Actor) msgBody[1]);
    sb.append(" performed ");
    sb.append(msgBody[2].toString());
    if (msgBody[3] != null)
    {
      sb.append(" on object ");
      sb.append((Entity) msgBody[3]);
    }
    if (msgBody[4] != null)
    {
      sb.append(" targeted at ");
      sb.append((Entity) msgBody[4]);
    }

    sb.append(" with outcome ");
    sb.append(msgBody[5].toString());

    if (msgBody[7] != null)
    {
      sb.append(" for reason ");
      sb.append(msgBody[7].toString());
    }
    if (location != null)
    {
      sb.append(" at location ");
      sb.append(location);
    }

    if (msgBody[6] != null)
    {
      sb.append(" and for extra ");
      sb.append(msgBody[6].toString());
    }
    return sb.toString();
  }

  public static void main(String[] args)
  {
    JournalHelper.Actor a = new JournalHelper.Actor("a@b.com", "id89898923adfasdf", "subscriberId");
    JournalHelper.Entity e = new JournalHelper.Entity(JournalHelper.Objective.FILE, "nane", "id", "custeoIsd");
    System.out.println(a);
    System.out.println(e);
    System.out.println(new JournalLC3JMSPublisher().format(new JournalMsgBuilder(JournalHelper.Component.DOCS_REPOSITORY, a,
        JournalHelper.Action.EXPORT, JournalHelper.Outcome.FAILURE).object(e).target(e).reason("no reasons").extra("extra msg").build()));
  }
}
