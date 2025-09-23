/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.journal;


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
public class JournalMsgBuilder
{
  //Required parameters
  private final JournalHelper.Component component;

  private final JournalHelper.Actor actor;

  private final JournalHelper.Action action;

  private final JournalHelper.Outcome outcome;

  // Optional parameters - initialized to default values
  private JournalHelper.Entity object;

  private JournalHelper.Entity target;

  private String reason;

  private String extra;

  public JournalMsgBuilder(JournalHelper.Component component, JournalHelper.Actor actor, JournalHelper.Action action,
      JournalHelper.Outcome outcome)
  {
    this(component, actor, action, null, null, outcome, null);
  }

  public JournalMsgBuilder(JournalHelper.Component component, JournalHelper.Actor actor, JournalHelper.Action action,
      JournalHelper.Entity object, JournalHelper.Outcome outcome)
  {
    this(component, actor, action, object, null, outcome, null);
  }

  public JournalMsgBuilder(JournalHelper.Component component, JournalHelper.Actor actor, JournalHelper.Action action,
      JournalHelper.Entity object, JournalHelper.Entity target, JournalHelper.Outcome outcome)
  {
    this(component, actor, action, object, target, outcome, null);
  }

  public JournalMsgBuilder(JournalHelper.Component component, JournalHelper.Actor actor, JournalHelper.Action action,
      JournalHelper.Entity object, JournalHelper.Entity target, JournalHelper.Outcome outcome, String extra)
  {
    this(component, actor, action, object, target, outcome, null, null);
  }

  public JournalMsgBuilder(JournalHelper.Component component, JournalHelper.Actor actor, JournalHelper.Action action,
      JournalHelper.Entity object, JournalHelper.Entity target, JournalHelper.Outcome outcome, String extra, String reason)
  {
    this.component = component;
    this.actor = actor;
    this.action = action;
    this.object = object;
    this.target = target;
    this.outcome = outcome;
    this.extra = extra;
    this.reason = reason;
  }

  public JournalMsgBuilder object(JournalHelper.Entity obj)
  {
    object = obj;
    return this;
  }

  public JournalMsgBuilder target(JournalHelper.Entity tgt)
  {
    target = tgt;
    return this;
  }

  public JournalMsgBuilder reason(String rsn)
  {
    reason = rsn;
    return this;
  }

  public JournalMsgBuilder extra(String etr)
  {
    extra = etr;
    return this;
  }

  public Object[] build()
  {
    return new Object[] { this.component, this.actor, this.action, this.object, this.target, this.outcome, this.extra, this.reason };
  }
}
