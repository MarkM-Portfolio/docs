/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.journal;

import java.text.SimpleDateFormat;
import java.util.Calendar;

/**
 * 
 * @author chengqi
 * 
 *         Usage:
 * 
 *         Actor a = new Actor("a@b.com", "id89898923adfasdf", "subscriberId"); 
 *         Entity e = new Entity("type", "nane", "id", "custeoIsd");
 *         //this is the least parameter list 
 *         JournalEntry je = new Builder(Calendar.getInstance().getTimeInMillis(), "FakeBSS", a, "CREATE", "SUCCESS").build(); 
 *         
 *         // this is the most parameter list 
 *         JournalEntry je = new Builder(Calendar.getInstance().getTimeInMillis(), "FakeBSS", a, "CREATE", "SUCCESS").object(e).target(e).location("9.123.155.93").reason("no reasons").extra("extra msg").build();
 *         
 *         
 */
public class JournalEntry
{
  // required filds
  private final long time;

  private final JournalHelper.Component component;

  private final JournalHelper.Actor actor;

  private final JournalHelper.Action action;

//  private final JournalHelper.Outcome outcome;

  // optional fields
  private final JournalHelper.Entity object;

  private final JournalHelper.Entity target;

  private final String reason;

  private final String extra;

  private final String location;

  private JournalEntry(Builder builder)
  {
    this.time = builder.time;
    this.component = builder.component;
    this.actor = builder.actor;
    this.action = builder.action;
//    this.outcome = builder.outcome;
    this.object = builder.object;
    this.target = builder.target;
    this.reason = builder.reason;
    this.extra = builder.extra;
    this.location = builder.location;
  }


  public static class Builder
  {
    // Required parameters
    private final long time;

    private final JournalHelper.Component component;

    private final JournalHelper.Actor actor;

    private final JournalHelper.Action action;

//    private final JournalHelper.Outcome outcome;

    // Optional parameters - initialized to default values

    private JournalHelper.Entity object;

    private JournalHelper.Entity target;

    private String reason;

    private String extra;

    private String location;

    public Builder(long time, JournalHelper.Component component, JournalHelper.Actor actor, JournalHelper.Action action, JournalHelper.Outcome outcome)
    {
      this.time = time;
      this.component = component;
      this.actor = actor;
      this.action = action;
//      this.outcome = outcome;
    }

    public Builder object(JournalHelper.Entity obj)
    {
      object = obj;
      return this;
    }

    public Builder target(JournalHelper.Entity tgt)
    {
      target = tgt;
      return this;
    }

    public Builder reason(String rsn)
    {
      reason = rsn;
      return this;
    }

    public Builder extra(String etr)
    {
      extra = etr;
      return this;
    }

    public Builder location(String lct)
    {
      location = lct;
      return this;
    }

    public JournalEntry build()
    {
      return new JournalEntry(this);
    }
  }

  public String getJournalMsg()
  {
    StringBuilder sb = new StringBuilder();
    SimpleDateFormat sd = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.mmm ");
    sb.append(sd.format(this.time));
    sb.append(" on Viewer COMPONENT ");
    sb.append(this.component);
    sb.append(" USER ");
    sb.append(this.actor);
    sb.append(" performed ");
    sb.append(this.action);
    if (this.object != null)
    {
      sb.append(" on object ");
      sb.append(this.object);
    }
    if (this.target != null)
    {
      sb.append(" targeted at ");
      sb.append(this.target);
    }

//    sb.append(" with outcome ");
//    sb.append(this.outcome);

    if (this.reason != null)
    {
      sb.append(" for reason ");
      sb.append(this.reason);
    }
    if (this.location != null)
    {
      sb.append(" at location ");
      sb.append(this.location);
    }

    if (this.extra != null)
    {
      sb.append(" and for extra ");
      sb.append(this.extra);
    }
    return sb.toString();
  }

  public static void main(String[] args)
  {
    JournalHelper.Actor a = new JournalHelper.Actor("a@b.com", "id89898923adfasdf", "subscriberId");
    JournalHelper.Entity e = new JournalHelper.Entity("type", "nane", "id", "custeoIsd");
    System.out.println(a.toString());
    System.out.println(e.toString());
    JournalEntry je = new Builder(Calendar.getInstance().getTimeInMillis(), JournalHelper.Component.DATABASE, a, JournalHelper.Action.VIEW, JournalHelper.Outcome.ERROR).object(e).target(e)
        .location("9.123.155.93").reason("no reasons").extra("extra msg").build();
    System.out.println(je.getJournalMsg());
  }
}
