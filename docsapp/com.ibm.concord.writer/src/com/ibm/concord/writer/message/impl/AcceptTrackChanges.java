package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.TrackChangeCleaner;
import com.ibm.concord.writer.message.Operation;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class AcceptTrackChanges extends Operation
{

  public AcceptTrackChanges(JSONObject json)
  {
    this.read(json);
  }

  @Override
  protected void apply(JSONObject model) throws Exception
  {
    System.out.println("Start to clean changes.");
    JSONArray body = (JSONArray) model.get("body");
    TrackChangeCleaner.clean(body, 0);
    if (body.isEmpty())
    {
      body.add(ModelObject.createEmptyParagraph());
    }
    model.put("body", body);
  }

  @Override
  public boolean read(JSONObject update)
  {
    return true;
  }

  @Override
  public JSONObject write()
  {
    // TODO Auto-generated method stub
    return null;
  }

  public interface SelfCheckAble
  {
    public void checkSelf();
  }
}