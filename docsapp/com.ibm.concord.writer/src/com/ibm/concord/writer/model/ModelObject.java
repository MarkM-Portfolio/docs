package com.ibm.concord.writer.model;

import java.util.Iterator;
import java.util.Random;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public abstract class ModelObject {
	private static final String TYPE_TOC = "sdt";
	public static final String RUN_TEXTBOX = "txbx";
	public static final String RUN_IMG = "img";
	public static final String TYPE_CANVAS = "wpc";
	public static final String TYPE_GROUP = "wgp";
	public static final String TYPE_SMARTART = "smartart";
	public static final String TYPE = "t";
	public static final String TYPE_PARAGRAPH = "p";
	public static final String RUNTYPE = "rt";
	public static final String STYLE = "style";
	public static final String CHANGES = "ch";
	public static final String RPR_CHANGES = "rPrCh";
	public static final String AUTHOR = "e_a";
	public static final String RUN_FIELD = "fld";
	public static final String RUN_SIMPLEFIELD = "fldSimple";
	public static final String RUN_HYPERLINK = "hyperlink";
	public static final String RUN_BMK = "bmk";
	public static final String RUN_COMMENT = "cmt";
	public static final String RUN_FOOTNOTE = "fn";
	public static final String RUN_ENDNOTE = "en";
	public static final String RUN_TRACKDELETEDOBJS = "tcDelObjs";
	public static final String RUN_TRACKOVERREF = "trackOverRef";
	public static final String TYPE_TABLE="tbl";
	public static final String TYPE_ROW = "tr";
	public static final String Type_CELL ="tc";
	
	public boolean checkTrackChange(long timeAgo)
	{
		// check paragraph, table, toc, field
		return false;
	}
	
	public static String getJSONValue(JSONObject obj, String key,
			String defaultValue) {
		String value = defaultValue;
		if (obj.containsKey(key)) {
			value = obj.get(key).toString();
			if (value == null || value.equals("null"))
				value = defaultValue;
		}
		return value;
	}

	public static boolean isTrackDeleted(JSONArray chs, long timeAgo,
			boolean toRemove) {
		if (chs == null)
			return false;
		Iterator<JSONObject> iterator = chs.iterator();
		boolean isTrackDeletedBeforeTime = false;
		while (iterator.hasNext()) {
			JSONObject obj = iterator.next();
			String type = getJSONValue(obj, "t", "");
			long date = Long.parseLong(getJSONValue(obj, "d", "0"));
			if (timeAgo == 0 || date <= timeAgo) {
				if (toRemove)
					iterator.remove();
				if (type.equals("del"))
					isTrackDeletedBeforeTime = true;
			}
		}
		return isTrackDeletedBeforeTime;
	}

	ModelObject(JSONObject jsonobj) {
		this.jsonobj = jsonobj;
	}

	public JSONObject getJson() {
		return this.jsonobj;
	}

	public String getModelType() {
		return modelType;
	}

	public void setModelType(String modelType) {
		this.modelType = modelType;
	}

	public static ModelObject createModelObject(JSONObject json) {
		if (json == null)
			return null;
		Object t = json.get(TYPE);
		if (t != null) {
			String type = t.toString();
			if (type.equals(TYPE_PARAGRAPH))
				return new Paragraph(json);
			else if(type.equals(TYPE_TABLE)){
				return new Table(json);
			}else if(type.equals(TYPE_ROW)){
				return new TableRow(json);
			}else if(type.equals(Type_CELL)){
				TableCell cell = new TableCell(json);
				return cell;
			}
			else if (type.equals(TYPE_TOC))
				return new Toc(json);
			else if( type.equals(RUN_SIMPLEFIELD) )
				return new Field(json);
			
		}
		Object rt = json.get(RUNTYPE);
		if (rt != null) {
			return createRunObject(rt.toString(), json);
		}
		return null;
	}
	
	public static ModelObject createModelObject(JSONObject json,JSONObject table){
		if(json == null)
			return null;
		if(table == null || table.get(TYPE) == null || !TYPE_TABLE.equals(table.get(TYPE).toString()))
			return createModelObject(json);
		Object t = json.get(TYPE);
		Table tableObj = new Table(table);
		if (t != null) {
			String type = t.toString();
			if(type.equals(TYPE_ROW)){
				return new TableRow(json,tableObj);
			}else if(type.equals(Type_CELL)){
				JSONArray trs = (JSONArray)table.get("trs");
				for(Object tr : trs){
					JSONObject trJson = (JSONObject)tr;
					JSONArray tcs = (JSONArray)trJson.get("tcs");
					for(Object tc : tcs){
						if(tc == json){
							TableRow row = new TableRow(trJson,tableObj);
							return new TableCell(json,row);
						}
					}
				}
			}
		}

		return createModelObject(json);
	}
	
	/**
	 * create run object by json.
	 * @param rt
	 * @param json
	 * @return
	 */
	public static Run createRunObject(String rt, JSONObject json) {
		Run run = null;
		if (rt.equals(RUN_HYPERLINK))
			run =  new HyperLink(json);
		else if (rt.equals(RUN_IMG))
			run =  new Image(json);
		else if (rt.equals(RUN_TEXTBOX))
			run =  new TextBox(json);
		else if (rt.equals(RUN_FIELD))
			run = new Field(json);
		else if (rt.equals(Operation.TEXTPROPERTY))
			run =  new TextRun(json);
		else if (rt.equals(RUN_BMK))
			run =  new BookMark(json);
		else if( rt.equals(RUN_FOOTNOTE))
			run =  new FootNote(json);
		else if(rt.equals(RUN_ENDNOTE))
			run = new EndNote(json);
		else if (rt.equals(TYPE_CANVAS) || rt.equals(TYPE_GROUP) || rt.equals(TYPE_SMARTART))
			return new Canvas(json);
		else if (rt.equals(RUN_TRACKDELETEDOBJS))
			run = new TrackDeletedObjs(json);
		else if (rt.equals(RUN_TRACKOVERREF))
		  run = new TrackOverRef(json);
		return run;
	}

	public static ModelObject getById(JSONObject model, String targetId) {
		JSONObject target = MessageUtil.getById(model, targetId);
		if (target != null)
			return createModelObject(target);
		return null;
	}

	protected String modelType ="";
	protected JSONObject jsonobj;

	public abstract void setAttributes(JSONObject atts);
	
	public JSONArray getChanges() {
		Object ob = jsonobj.get(CHANGES);
		if (ob != null && ob instanceof JSONArray)
			return (JSONArray) ob;
		else
			return new JSONArray();
	}

	public JSONObject getStyle() {
		Object ob = jsonobj.get(STYLE);
		if (ob != null && ob instanceof JSONObject)
			return (JSONObject) ob;
		else
			return new JSONObject();
	}
	
	public String getAuthor() {
		return (String)jsonobj.get(AUTHOR);
		
	}
	
	public void setAuthor(String author) {		
		jsonobj.put(AUTHOR, author);
	}

	public void setStyle(JSONObject styles) {
		JSONObject myStyle = getStyle();
		@SuppressWarnings("unchecked")
		Iterator<String> iter = styles.keySet().iterator();
		while (iter.hasNext()) {
			String key = iter.next();
			String s = styles.get(key).toString();
			if( s == null || s.equals(""))//remove style
				myStyle.remove(key);
			else
				myStyle.put(key, styles.get(key));
		}
		jsonobj.put(STYLE, myStyle);
	}
	public void addComment(String cid) {
		JSONArray cl = (JSONArray) jsonobj.get("cl");
		if(cl==null) {
			JSONArray comment_l = new JSONArray();
			jsonobj.put("cl", comment_l);
			cl = (JSONArray) jsonobj.get("cl");
		}
		boolean bexist = false;
		for(int j=cl.size()-1;j>=0;j--){
			String cl_id = (String) cl.get(j);
			if(cl_id.equals(cid)){
				bexist = true;
				break;
			} 		
		}
		if(!bexist) {
			cl.add(cid);
		}
	}
	
	public void removeStyle() {
		jsonobj.remove(STYLE);
	}

	public void deleteElement(int index) {

	}

	public void insertElement(int index, JSONObject element) {
	}
	
	public static String getUUID() {
	  String s = "";
	  for(int i = 0; i <= 12; i++)
	  {
	    Random rand = new Random();
	    int x = rand.nextInt(10);
	    s += x;
	  }
      return "id_" + s;
    }
	
	public static JSONObject createEmptyParagraph()
	{
	  JSONObject obj = new JSONObject();
	  obj.put("fmt", new JSONArray());
	  obj.put("t", "p");
	  obj.put("c", "");
	  obj.put("id", getUUID());
	  return obj;
	}

}
