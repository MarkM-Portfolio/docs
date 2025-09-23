package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONObject;

public class AddStyle extends Operation
{
private String styleId;
private JSONObject styleContent = null;


  public AddStyle(JSONObject jsonUpdate)
  {
    this.read(jsonUpdate);
  }

  protected void apply(JSONObject model) throws Exception
  {
    if(styleContent != null)
      model.put(styleId, styleContent);
  }

  public boolean read(JSONObject update)
  {
    this.styleId = (String)update.get("styleId");
    Object cnt = update.get(CONTENT);
    if(!"".equals(cnt))
      this.styleContent = (JSONObject) cnt;
    return true;
  }

  public JSONObject write()
  {
    return null;
  }

}
