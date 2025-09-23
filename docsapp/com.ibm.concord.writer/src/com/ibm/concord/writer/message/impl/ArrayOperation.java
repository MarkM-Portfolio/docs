/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.writer.message.impl;
import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ArrayOperation extends Operation {
  private String keyId = null; // The key id
  private String path = null; // The target path
  private JSONObject newContent = null; // New content
  
  public ArrayOperation(JSONObject jsonUpdate) {
	    this.read(jsonUpdate);
  }
	  
  private void insertArray(JSONObject model) {
	if(path == null || path.isEmpty()) 
		model.put(this.keyId, this.newContent);
	else {
		JSONArray obj = (JSONArray) model.get(path);
		if(obj==null) {
			JSONArray comments = new JSONArray();
			model.put(path, comments);
			obj = (JSONArray) model.get(path);
		}
		obj.add(this.newContent);
	}
  }

  private void deleteArray(JSONObject model) {
	if(path == null || path.isEmpty()) 
	  model.remove(this.keyId);
	else {
	  JSONArray objArray = (JSONArray) model.get(path);
	  for(int i=0;i<objArray.size();i++) {
		JSONObject obj = (JSONObject) objArray.get(i);
		String id = (String) obj.get("id");
		if(id.equals(keyId)) {
			objArray.remove(obj);
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

	    if (INSERT_ARRAY.equalsIgnoreCase(this.type))
	    {
	      insertArray(model);
	    }
	    else if (DELETE_ARRAY.equalsIgnoreCase(this.type))
	    {
	      deleteArray(model);
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
