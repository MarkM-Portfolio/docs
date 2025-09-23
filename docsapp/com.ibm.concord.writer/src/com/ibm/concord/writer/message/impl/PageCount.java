package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONObject;

public class PageCount extends Operation
{
  int pageCount;
  
  public PageCount(JSONObject jsonUpdate)
  {
    this.read(jsonUpdate);
  }

  protected void apply(JSONObject model) throws Exception
  {
    if(model != null && pageCount > 0)
    {
      String key = "Properties";
      JSONObject properties = (JSONObject) model.get(key);
      if(properties == null)
        properties = new JSONObject();
      properties.put("t", "Properties");
      properties.put("Pages", Integer.toString(pageCount));
      model.put(key, properties);
    }
  }

  @Override
  public boolean read(JSONObject update)
  {
    try
    {
      this.pageCount = Integer.parseInt( update.get("pc").toString() );
      
      return true;
    }
    catch (Exception e)
    {
      return false;
    }
  }

  @Override
  public JSONObject write()
  {
    // TODO Auto-generated method stub
    return null;
  }

}
