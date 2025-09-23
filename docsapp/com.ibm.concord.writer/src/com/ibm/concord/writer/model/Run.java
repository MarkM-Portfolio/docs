package com.ibm.concord.writer.model;

import com.ibm.concord.writer.message.Operation;
import com.ibm.docs.common.security.ACFUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Run extends ModelObject {
	public static String BOOKMARK = "run.bookMark";
	public static String TEXT = "run.text";
	public static String TAB = "tab";
	public static String BR = "br";
	
	Run(JSONObject jsonobj) {
		super(jsonobj);
	}
	
	@Override
	public boolean checkTrackChange(long time)
	{
	    Object chsObj = this.jsonobj.get("ch");
	    if (chsObj == null || chsObj instanceof String)
	      return false;
	    JSONArray chs = (JSONArray)chsObj;
		boolean deleted = isTrackDeleted(chs, time, true);
		if (chs == null || chs.isEmpty())
		  this.jsonobj.remove("ch");
		return deleted;
	}
	
	boolean isBookMark(){
		return this.modelType.equals(BOOKMARK);
	}
	
	boolean isTab()
	{
		return jsonobj.containsKey(TAB);
	}

    boolean isBr()
    {
        return jsonobj.containsKey(BR);
    }

    boolean isSepObj()
    {
        return this.isTab() || this.isBr();
    }

	@Override
	public void setAttributes(JSONObject atts) {
		if (atts.containsKey("ch"))
		{
			Object c = atts.get("ch");
			if (c == null || (c instanceof String))
				jsonobj.remove("ch");
			else
				jsonobj.put("ch", c);
		}
		if (atts.containsKey("rPrCh"))
		{
			Object c = atts.get("rPrCh");
			if (c == null || (c instanceof String))
				jsonobj.remove("rPrCh");
			else
				jsonobj.put("rPrCh", c);
		}
		if( this.isBookMark() ){
			Object name = atts.get("name");
			if( name != null && !ACFUtil.suspiciousHtml(name.toString()))
				jsonobj.put("name", name );
		}
		
	} 
	
	boolean setAttributes(int index, int length, JSONObject styles, HintList hintList) {
	    if (length <= 0 || index >= getEnd() || (index + length) <= getStart())
	        return false;
	      else
	      {
	        Run right = split(index, hintList);
	        if (right != null)
	        {
	        	if ((length + index) < (right.getLength() + right.getStart()))
	        		right.split(index + length, hintList);
	        	right.setAttributes(styles);
	        }
	        else
	        	this.setAttributes(styles);
	        return true;
	      }
	}

	String getType() {
		return (String) jsonobj.get("rt");
	}
	
	public JSONObject getBreak()
	{
	  return (JSONObject) jsonobj.get("br");
	}

	int getStart() {
		Object s = jsonobj.get("s");
		if (s != null)
			return Integer.parseInt(s.toString());
		return -1;
	}
	
	public JSONArray getComments()
	{
		return (JSONArray) jsonobj.get("cl");
	}
	
	JSONArray getFormats()
	{
		return (JSONArray) jsonobj.get(Operation.FORMAT);
	}

	int getLength() {
		Object l = jsonobj.get("l");
		if (l == null) { // TODO: implement in bookmark and field
			int len = 0;
			JSONArray atts = (JSONArray) jsonobj.get(Operation.FORMAT);
			if (atts != null) {
				for (int j = 0; j < atts.size(); j++) {
					Object lenO = ((JSONObject) atts.get(j)).get("l");
					if (lenO == null)
						continue;
					len += Integer.parseInt(lenO.toString());
				}
			}
			return len;
		} else {
			return Integer.parseInt(l.toString());
		}
	}
	
	int getEnd(){
		return this.getStart()+ this.getLength();
	}

	void setStart(int start) {
		jsonobj.put("s", String.valueOf(start));
	}

	void setLength(int len) {
		jsonobj.put("l", String.valueOf(len));
	}

	
	boolean merge(Run run, int index ) {
		// TODO:
		return false;
	}

	public Run byIndex(int index) {
		if( this.getStart()<= index && index < this.getEnd() )
			return this;
		else
			return null;
	}

	public void remove(int index, int length) {
		int start = getStart();
	    int l = getLength();
	    if (index < start)
	    {
	      length -= (start - index);
	      start = index;
	    }

	    if (index + length > start + l)
	      length = start + l - index;
	    if (start != getStart())
	      setStart(start);

	    setLength(l - length);
	}

	public  boolean addComment(String cid, int index, int length, HintList hintList) {
		// TODO Auto-generated method stub
		return false;
	}
	/**
	 * @param index
	 * @param length
	 * @param styles
	 * @param hintList
	 * @return
	 * if create new run then return true;
	 * else return false;
	 */
	public  boolean setStyle(int index, int length, JSONObject styles, HintList hintList) {
		// TODO Auto-generated method stub
		return false;
	}

	public Run split(int index, HintList parent) {
		// TODO Auto-generated method stub
		return null;
	}

	public void removeStyle() {
		// TODO Auto-generated method stub
		
	}

	public Run byId(String oid) {
		// TODO Auto-generated method stub
		return null;
	}
	
	public String getId(){
		Object id = jsonobj.get("id");
		if( id != null )
			return id.toString();
		else
			return "";
	}
}
