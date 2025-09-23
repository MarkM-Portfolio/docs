package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.concord.writer.model.Paragraph;
import com.ibm.json.java.JSONObject;

public class SetAttribute extends Operation {
	public SetAttribute(JSONObject jsonUpdate) {
		this.read(jsonUpdate);
	}

	@Override
	protected void apply(JSONObject model) throws Exception {
		if (null == this.target || this.target.equals("")) {
			if(this.styles != null)
				updateStylesFile(model);
			return;
		}
		JSONObject target = MessageUtil.getById(model, this.target);
		//ModelObject modelObj = ModelObject.getById(model, this.target );
		ModelObject modelObj = null;
		if(this.tableTarget!=null && !this.tableTarget.isEmpty()){
			JSONObject table = MessageUtil.getById(model, this.tableTarget);
			modelObj = ModelObject.createModelObject((JSONObject)target,table);
		}else {
			modelObj = ModelObject.createModelObject((JSONObject)target);
		}
		if( modelObj == null){
	        logNoTarget(getTarget(), "paragraphOrTable");
			return;
		}
		
		if(this.styles != null)
		  modelObj.setStyle( this.styles );
		if(this.atts != null)
		  modelObj.setAttributes(this.atts);
	}

	private void updateStylesFile(JSONObject styleJson) {
//	    Object sId = this.styles.get("styleId");
//	    if(sId != null && sId instanceof String)
	    {  
//	      String styleId = (String) sId;
	      Object subType = this.styles.get("subType");
	      if(subType != null && subType instanceof String)
	      {
	        if("para".equalsIgnoreCase((String) subType))
	        {
	          // TODO Need refactor, Copy from Paragraph.java
	          JSONObject styleObj = (JSONObject)styleJson.get(styleId);
	          JSONObject pPr = (JSONObject) styleObj.get(Paragraph.PARAGRAPHPROPERTY);
	          if (null == pPr) {
	              pPr = new JSONObject();
	              styleObj.put(Paragraph.PARAGRAPHPROPERTY, pPr);
	          }
	          
              Object numIdVal = this.styles.get(Paragraph.NUMID);
              Object iLvlVal = this.styles.get(Paragraph.ILVL);
              JSONObject numPr = (JSONObject) pPr.get(Paragraph.NUMPR);
              if (null == numPr)
              {
                numPr = new JSONObject();
                pPr.put(Paragraph.NUMPR, numPr);
              }
    
              JSONObject numId = (JSONObject) numPr.get(Paragraph.NUMID);
              JSONObject iLvl = (JSONObject) numPr.get(Paragraph.ILVL);
              if (null != numIdVal)
              {
                if (!numIdVal.toString().equals("none"))
                {
                  if (null == numId)
                  {
                    numId = new JSONObject();
                    numPr.put(Paragraph.NUMID, numId);
                  }
                  numId.put(Paragraph.VAL, numIdVal);
                }
                else
                  numPr.remove(Paragraph.NUMID);
              }
              if (null != iLvlVal)
              {
                if (!iLvlVal.toString().equals("none"))
                {
                  if (null == iLvl)
                  {
                    iLvl = new JSONObject();
                    numPr.put(Paragraph.ILVL, iLvl);
                  }
                  iLvl.put(Paragraph.VAL, iLvlVal);
                }
                else
                  numPr.remove(Paragraph.ILVL);
              }
	        }
	      }
//	      else if (null != styleId)
//	        styleJson.put(styleId, this.styles.get("json"));
	    }
	}

	@Override
	public boolean read(JSONObject update) {
		setTarget(update.get(TARGET).toString());
		setType(update.get(TYPE).toString());
		this.styles = (JSONObject) update.get(STYLE);
		this.atts = (JSONObject) update.get(ATTRIBUTE);
		this.styleId = (String)update.get("styleId");
		readOp(update);
		return true;
	}

	@Override
	public JSONObject write() {
      try{
        JSONObject update = new JSONObject();
        update.put(TYPE, getType());
        update.put(TARGET, getTarget());
        
        if(this.styles != null)
          update.put(STYLE, this.styles);
        if(this.atts != null)
          update.put(ATTRIBUTE, this.atts);
        if(this.styleId != null)
          update.put("styleId", this.styleId);
        writeOp(update);
        return update;
      }catch(Exception e)
      {
        e.printStackTrace();
        return null;
      }
	}
	
	public JSONObject getStyles()
	{
	  return this.styles;
	}
	
	public void setStyles(JSONObject newStyle)
	{
	  this.styles = newStyle;
	}

	public JSONObject getAttributes()
	{
	  return this.atts;
	}
	
	public void setAttributes(JSONObject newAtt)
	{
	  this.atts = newAtt;
	}
	
	private final static String STYLE = "st";
	private final static String ATTRIBUTE = "at";

	private JSONObject styles;
	private JSONObject atts;
	private String styleId;
}
