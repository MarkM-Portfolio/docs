package com.ibm.concord.spreadsheet.document.model.impl;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.json.java.JSONObject;
import com.ibm.json.java.JSONArray;

public class Comments {
	  private String Id;

	  JSONArray items;
	  
	  public Comments(String idStr, JSONArray itemsJson)
	  {
		  Id = idStr;
		  items = itemsJson;
	  }
	  
	  public Comments(JSONObject content)
	  {
		  Id = (String)content.get(ConversionConstant.COMMENTSID);
		  items = (JSONArray)content.get(ConversionConstant.ITEMS);
	  }
	  
	  public JSONObject toJson()
	  {
		  JSONObject content = new JSONObject();
		  content.put(ConversionConstant.COMMENTSID, Id);
		  content.put(ConversionConstant.ITEMS, items);
		  return content;
	  }	
	 
	  public String getId()
	  {
		  return Id;
	  }
	  
	  public void append(JSONObject item)
	  {
		  items.add(item);
	  }
	  
	  public void undoAppend(JSONObject itemJson)
	  {		 
		  for(int i= 0; i < items.size(); i++)
		  {
			  JSONObject item = (JSONObject) items.get(i);
			  if(item.equals(itemJson))
			  {
				items.remove(i);
				break;
			  }			  
		  }
	  }
	  
	  public void update(int index, JSONObject item)
	  {
		  items.set(index, item);
	  }
}
