package com.ibm.concord.writer.message.impl;

import java.util.logging.Logger;

import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class KeyOperation extends Operation
{
  private static final Logger LOG = Logger.getLogger(KeyOperation.class.getName());

  private String keyId = null; // The key id

  private String path = null; // The target path

  private JSONObject newContent = null; // New content

  public KeyOperation(JSONObject jsonUpdate)
  {
    this.read(jsonUpdate);
  }

  private void insertKey(JSONObject model)
  {
	if(path == null || path.isEmpty()) 
	    model.put(this.keyId, this.newContent);
	else {
		JSONObject obj = (JSONObject) model.get(path);
		if(obj==null) {
			JSONObject comments = new JSONObject();
			model.put(path, comments);
			obj = (JSONObject) model.get(path);
		}
		obj.put(this.keyId, this.newContent);
	}
  }

  private void deleteKey(JSONObject model)
  {
	if(path == null || path.isEmpty()) 
		model.remove(this.keyId);
	else {
		JSONObject obj = (JSONObject) model.get(path);
		obj.remove(this.keyId);
	}
		
  }

  private void replaceKey(JSONObject model)
  {
    if (model == null || path == null)
    {
      LOG.warning("BAD argument since no model or no path");
    }

    Object obj = ((JSONObject) model).get(path);
    if (obj != null && obj instanceof JSONArray)
    {
      JSONArray target = (JSONArray) obj;
      JSONObject jsonObject = null;
      for (int i = 0; i < target.size(); i++)
      {
        jsonObject = (JSONObject) target.get(i);
        obj = jsonObject.get("id");
        if (obj != null && this.keyId.endsWith((String) obj))
        {
          target.remove(jsonObject);
          target.add(i, newContent);
          break;
        }
      }
    }
  }

  @Override
  protected void apply(JSONObject model) throws Exception
  {
    if (this.keyId == null || this.keyId.equals(""))
      return;

    if (INSERT_KEY.equalsIgnoreCase(this.type))
    {
      insertKey(model);
    }
    else if (DELETE_KEY.equalsIgnoreCase(this.type))
    {
      deleteKey(model);
    }
    else if (REPLACE_KEY.equalsIgnoreCase(this.type))
    {
      replaceKey(model);
    }
  }

  @Override
  public boolean read(JSONObject update)
  {
    this.newContent = (JSONObject) update.get(CONTENT);
    Object obj = update.get(PATH);
    if (obj != null)
      this.path = (String) obj;

    obj = update.get(KEY_ID);
    if (obj != null)
      this.keyId = (String) obj;
    else
      this.keyId = "";
    readOp(update);
    return true;
  }

  @Override
  public JSONObject write()
  {
    try
    {
      JSONObject update = new JSONObject();
      if(this.path != null)
        update.put(PATH, this.path);
      if(this.newContent != null)
        update.put(CONTENT, this.newContent);
      if(this.keyId != null)
        update.put(KEY_ID, this.keyId);
      writeOp(update);
      return update;
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return null;
    }
  }

  public String getKeyId()
  {
    return this.keyId;
  }
}
