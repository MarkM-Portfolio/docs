package com.ibm.concord.spreadsheet.document.model;

public abstract class Listener implements IListener
{
//  public boolean needListen(NotifyEvent e)
//  {
//    return true;
//  }
  
  public abstract void notify(Broadcaster caster, NotifyEvent e);
  
  public void startListening(Broadcaster caster)
  {
    caster.addListener(this);
  }
  
  public void endListening(Broadcaster caster)
  {
    caster.removeListener(this);
  }
}
