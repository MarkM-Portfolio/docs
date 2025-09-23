package com.ibm.concord.spreadsheet.document.model;

import java.util.ArrayList;
import java.util.List;

public abstract class Broadcaster
{
  private List<IListener> list;
  
  public Broadcaster()
  {
    list = new ArrayList<IListener>();
  }
  
  public void broadcast(NotifyEvent e)
  {
    int size = list.size();
    for(int i = 0; i < size; i++)
    {
    	IListener l = list.get(i);
      l.notify(this, e);
    }
  }
  
  public void addListener(IListener listener)
  {
    if(listener != null)
      list.add(listener);
  }
  
  // if there is any listener 
  public boolean hasListener()
  {
    return !(list.size() == 0);
  }
  
  //if listener is in the list, if yes, return the index
  //otherwise return -1;
  public int hasListener(IListener listener)
  {
    if(listener == null)
      return -1;
    int size = list.size();
    for( int i = 0; i < size; i++)
    {
      if(listener == list.get(i))
      {
        return i;
      }
    }
    return -1;
  }
  
  public void removeListener(IListener listener)
  {
    int index = hasListener(listener);
    if(index > -1)
    {
      list.remove(index);
    }
  }
  
  public void removeAllListener()
  {
    list.clear();
  }
  
  public List<IListener> getAllListeners()
  {
    return list;
  }
}
