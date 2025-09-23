package com.ibm.concord.spreadsheet.document.model;

public interface IListener{
	public void notify(Broadcaster caster, NotifyEvent e);
	  
	public void startListening(Broadcaster caster);
	  
	public void endListening(Broadcaster caster);
}