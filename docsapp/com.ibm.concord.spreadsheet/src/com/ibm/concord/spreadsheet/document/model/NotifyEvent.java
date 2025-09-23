package com.ibm.concord.spreadsheet.document.model;

import com.ibm.json.java.JSONObject;

/**
 * NotifyEvent is used to notify listener to take action according to the event content
 * 
 * @author weihuaw
 * 
 */
public class NotifyEvent
{
  public enum CATEGORY {
    DATACHANGE, NONE
  }

  public enum ACTION {
    SET, INSERT, DELETE, PREMOVE, CLEAR, PREDELETE, PREINSERT, SORT,
    SHOW, HIDE, FILTER
  }

  public enum TYPE {
    /*REF VALUE TYPE is RangeInfo*/
    CELL, RANGE, ROW, COLUMN, SHEET, 
    /*REF VALUE TYPE is Range Object*/
    RANGEADDRESS,
    /*REF VALUE TYPE is NameAreaRefValue Object*/
    /*for private use*/AREA
  }

  private CATEGORY category;

  private EventSource source;

  public NotifyEvent(CATEGORY ca, EventSource ss)
  {
    category = ca;
    source = ss;
  }
  
  public NotifyEvent(NotifyEvent e)
  {
    category = e.category;
    source = new EventSource(e.source);
  }

  public CATEGORY getCategory()
  {
    return category;
  }

  public EventSource getSource()
  {
    return source;
  }

  public static class EventSource
  {

    private ACTION action;

    private TYPE refType;

    private Object refValue;
    
    private JSONObject data;

    public EventSource(ACTION ac, TYPE type, Object i)
    {
      action = ac;
      refType = type;
      refValue = i;
    }
    
    public EventSource(EventSource s)
    {
      action = s.action;
      refType = s.refType;
      refValue = s.refValue;
    }

    public ACTION getAction()
    {
      return action;
    }

    public TYPE getRefType()
    {
      return refType;
    }
    
    public Object getRefValue()
    {
      return refValue;
    }
    
    public void setAction(ACTION a)
    {
      action = a;
    }
    
    public void setRefValue(Object i)
    {
      refValue = i;
    }
    
    public JSONObject getData()
    {
      return data;
    }
    
    public void setData(JSONObject d)
    {
      data = d;
    }
  }
  
  
}
