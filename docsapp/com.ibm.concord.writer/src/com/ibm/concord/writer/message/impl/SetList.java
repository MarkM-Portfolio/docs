package com.ibm.concord.writer.message.impl;

import java.util.Iterator;
import java.util.Set;

import com.ibm.concord.writer.message.Operation;
import com.ibm.docs.common.util.UnitUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class SetList extends Operation {
	private final static String PARAGRAPHPROPERTY="pPr";
	private Object nId,aId,lvl;
	private String numFmt, lvlText, picBulletId, lvlJc, startValue;
	private JSONObject content, list_rPR, imgs;
	 public SetList(JSONObject jsonUpdate)
	 {
	    this.read(jsonUpdate);
	 }
	  
	@Override
	protected void apply(JSONObject model) throws Exception {
		if(this.type.equals(ADD_LIST))
		{
		  if(this.content == null)
		  {
		    // Undo add list
		    model.remove("num"+this.nId.toString());
		    model.remove(ABSTRACTNUM+this.aId.toString());
		  }
		  else{
			JSONObject absJson = new JSONObject();
			absJson.put(ABSTRACTNUM+"Id",  this.aId.toString());
			absJson.put("t", "num");
			absJson.put("numId", this.nId.toString());
			model.put("num"+this.nId.toString(), absJson);
			if( this.imgs != null ){
				Set<?> keySet = (this.imgs).keySet();
		      Iterator<?> iterator = keySet.iterator();
		      String key;
		      while (iterator.hasNext())
		      {
		        key = (String) iterator.next();
		        model.put( NUMPICBULLET+key, this.imgs.get(key));
		      }
			}
			this.content.put("t", ABSTRACTNUM);
			this.content.put(ABSTRACTNUM + "Id", this.aId.toString());
			
			model.put(ABSTRACTNUM+this.aId.toString(), this.content);
		  }
		}
		else if(this.type.equals(CHANGE_TYPE))
		{
		  this.aId = (String)((JSONObject)model.get(NUM+this.nId.toString())).get(ABSTRACTNUMID);
          JSONArray lvlArray = (JSONArray)((JSONObject)model.get(ABSTRACTNUM+this.aId.toString())).get(LEVEL);
          JSONObject lvlObj = (JSONObject)lvlArray.get(Integer.parseInt(this.lvl.toString()));
          if(this.numFmt != null && this.numFmt.length() > 0)
          {
            JSONObject numFmtJson = new JSONObject();
            numFmtJson.put("val", this.numFmt);
            lvlObj.put(NUM_FMT, numFmtJson);
          }
          if(this.lvlText != null && this.lvlText.length() > 0)
          {
            JSONObject lvlTextJson = new JSONObject();
            lvlTextJson.put("val", this.lvlText);
            lvlObj.put(LVL_TEXT, lvlTextJson);
          }
          if(this.picBulletId != null && this.picBulletId.length() > 0)
          {
            JSONObject picBulletJson = new JSONObject();
            picBulletJson.put("val", this.picBulletId);
            lvlObj.put(PIC_BULLET_ID, picBulletJson);
          }
          else
            lvlObj.remove(PIC_BULLET_ID);
          
          if(this.lvlJc != null && this.lvlJc.length() > 0)
          {
            JSONObject lvlJcObj = new JSONObject();
            lvlJcObj.put("val", this.lvlJc);
            lvlObj.put(LVLJC, lvlJcObj);
          }
          else
            lvlObj.remove(LVLJC);
          
          if(this.list_rPR == null)
            lvlObj.remove(RPR);
          else
            lvlObj.put(RPR, this.list_rPR);
		}
		else if(this.type.equals(INDENT_LIST))
		{
			this.aId = (String)((JSONObject)model.get(NUM+this.nId.toString())).get(ABSTRACTNUMID);
			JSONObject pPr = new JSONObject();
			JSONArray lvlArray = (JSONArray)((JSONObject)model.get(ABSTRACTNUM+this.aId.toString())).get(LEVEL);
			JSONObject lvlObj;
			if(null == this.lvl)
			{
				for(int i = 0; i < lvlArray.size(); i++)
				{
					lvlObj = (JSONObject)lvlArray.get(i);
					pPr = (JSONObject)lvlObj.get(PARAGRAPHPROPERTY);
					update(lvlObj,pPr);
				}
			}
			else
			{
				lvlObj = (JSONObject)lvlArray.get(Integer.parseInt(this.lvl.toString()));
				pPr = (JSONObject)lvlObj.get(PARAGRAPHPROPERTY);
				update(lvlObj,pPr);
			}
			
		}
		else if(this.type.equals(CHANGE_START) && startValue != null){
		  this.aId = (String)((JSONObject)model.get(NUM+this.nId.toString())).get(ABSTRACTNUMID);
          JSONArray lvlArray = (JSONArray)((JSONObject)model.get(ABSTRACTNUM+this.aId.toString())).get(LEVEL);
          JSONObject lvlObj = (JSONObject)lvlArray.get(Integer.parseInt(this.lvl.toString()));
          if(startValue.equalsIgnoreCase("null"))
          {
            lvlObj.remove("start");
          }
          else
          {
            JSONObject startObj = new JSONObject();
            startObj.put("val", startValue);
            lvlObj.put("start", startObj);
          }
		}
	}
	private void update(JSONObject lvlObj,JSONObject pPr){
		if(null == pPr)
		{
			pPr =  new JSONObject();
			lvlObj.put(PARAGRAPHPROPERTY , pPr);
		}
		JSONObject content = normalizeContent(pPr);
		
		for( Object key : content.keySet()){
			pPr.remove(key);
			Object value = content.get(key);
			if (value!=null && !value.equals("")){
				pPr.put(key, content.get(key));
			}
		}
	}
	private JSONObject normalizeContent(JSONObject pPr)
	{
		JSONObject content = new JSONObject();
		if(this.type.equals(INDENT_LIST))
		{
			String leftChange = String.valueOf(this.content.get("leftChange"));
			String key = "left";
			JSONObject indentJson = (JSONObject)pPr.get(INDENT);
			indentJson = (JSONObject)indentJson.clone();
			String left = (String)indentJson.get("left");
			
			left = String.valueOf(UnitUtil.convertToPTValue(left) + UnitUtil.convertToPTValue(leftChange)) + "pt";
			indentJson.put(key, left);
			content.clear();
			content.put(INDENT, indentJson);
		}
		return content;
	}
	@Override
	public boolean read(JSONObject update) {
		this.nId = update.get(NUMBER_ID);
		this.aId = update.get(ABSTRACTNUM_ID);
		this.lvl = update.get(LEVEL);
		
		Object images = update.get(IMGS);
		if(!"".equals(images))
		  this.imgs = (JSONObject)images;
		
		Object cnt = update.get(CNT);
		if(!"".equals(cnt))
		{  
		  this.content = (JSONObject) cnt;
  		  this.numFmt = (String) this.content.get(NUM_FMT);
  		  this.lvlText = (String) this.content.get(LVL_TEXT);
  		  this.picBulletId = (String) this.content.get(PIC_BULLET_ID);
  		  this.list_rPR = (JSONObject) this.content.get(RPR);
  		  this.lvlJc = (String) this.content.get(LVLJC);
  		  
  		  Object valObj = this.content.get(VALUE);
  		  if(valObj != null)
  		    this.startValue = valObj.toString();
		}
		return true;
	}

	@Override
	public JSONObject write() {
		try
	    {
	      JSONObject update = new JSONObject();
	      return update;
	    }
	    catch (Exception e)
	    {
	      e.printStackTrace();
	      return null;
	    }
	}
	
	public String getNumId()
	{
	  return this.nId.toString();
	}

	private final static String INDENT = "indent";
	private final static String ABSTRACTNUM = "abstractNum";
	private final static String NUMPICBULLET= "numPicBullet";
	private final static String NUM = "num";
	private final static String ABSTRACTNUMID = "abstractNumId";
	private final static String RPR = "rPr";
	private final static String LVLJC = "lvlJc";
	private final static String IMGS = "imgs";
	private final static String VALUE = "val";
}
