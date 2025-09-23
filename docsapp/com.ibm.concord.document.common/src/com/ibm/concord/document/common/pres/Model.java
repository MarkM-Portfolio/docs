package com.ibm.concord.document.common.pres;

import java.util.Iterator;
import java.util.Map;

import com.ibm.json.java.JSONObject;

public abstract class Model
{

  protected String id;

  protected JSONObject attrs;

  public String getId()
  {
    return id;
  }

  public void setId(String id)
  {
    this.id = id;
  }

  public JSONObject getAttrs()
  {
    return attrs;
  }

  public void setAttrs(JSONObject attrs)
  {
    this.attrs = attrs;
  }

  public abstract String getHTML();

  protected String gartherAttrs(String tagName)
  {
    String str = "";
    if(tagName != null && tagName.length() > 0)
    	str = "<" + tagName;
    else
    	str = "<div";
    str += " id=\"" + this.id + "\"";
    Map mp = this.attrs;
    if(mp != null)
    {
    	Iterator it = mp.entrySet().iterator();
    	while (it.hasNext())
    	{
    		Map.Entry pairs = (Map.Entry) it.next();
    		String key = pairs.getKey().toString();
    		String value = pairs.getValue().toString();
    		String span = " " + key + "=\"" + value + "\"";
    		str += span;
    	}
    }
    
    str += ">";
    return str;
  }
}
