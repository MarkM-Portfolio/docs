package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.concord.writer.model.Paragraph;
import com.ibm.json.java.JSONObject;

public class ApplyStyle extends Operation 
{
	public ApplyStyle(JSONObject jsonUpdate){
		this.read(jsonUpdate);
	}
	
	public ApplyStyle()
	{
	  
	}
	@Override
	protected void apply(JSONObject model) throws Exception {
		
		JSONObject target = MessageUtil.getById(model, this.target);
		if (target==null) {
          logNoTarget(getTarget(), "paragraph");
          return;
        }
		
		ModelObject modelObj = ModelObject.createModelObject(target);
		if (modelObj == null || !( modelObj instanceof Paragraph )) {
			//not support yet
			throwUnSupported(model, modelObj);
		}
		
		Paragraph para = (Paragraph) modelObj;
		
		if (forAttr)
		{
			para.setAttribute(index, length, attrs);
		}
		else
		{
			if( this.styles == null || this.styles.size() == 0)
			{
				para.removeStyle();
			}
			else if(this.length > 0)
			{
				para.setStyle( index, length, styles );
			}
		}
	}
		
	@Override
	public boolean read(JSONObject update) {
		if(update.get(LENGTH) != null && !update.get(LENGTH).toString().equals(""))
			this.length = Integer.parseInt(update.get(LENGTH).toString());
		if(update.get(INDEX) != null && !update.get(INDEX).toString().equals(""))
			this.index = Integer.parseInt(update.get(INDEX).toString());
		setTarget(update.get(TARGET).toString());
		setType(update.get(TYPE).toString());
		if (update.containsKey(STYLE))
		{
			if(update.get(STYLE) instanceof String)
				this.styles = null;
			else
				this.styles = (JSONObject) update.get(STYLE);
		}
		if (update.containsKey(ATTR))
		{
			this.forAttr = true;
			this.attrs = (JSONObject) update.get(ATTR);
		}
		readOp(update);
		return true;
	}

	@Override
	public JSONObject write() {
      try{
        JSONObject update = new JSONObject();
        update.put(TYPE, getType());
        update.put(TARGET, getTarget());
        
        update.put(LENGTH, getLength());
        update.put(INDEX, getIndex());
        if(this.styles != null)
          update.put(STYLE, this.styles);
        if(this.attrs != null)
          update.put(ATTR, this.attrs);
        writeOp(update);
        return update;
      }catch(Exception e)
      {
        e.printStackTrace();
        return null;
      }
	}
	
	public int getIndex()
	{
	  return this.index;
	}
	
	public void setIndex(int idx)
	{
	  this.index = idx;
	}
	
	public int getLength()
	{
	  return this.length;
	}
	
	public void setLength(int len)
	{
	  this.length = len;
	}
	
	public JSONObject getStyles()
	{
	  return this.styles;
	}
	
	public void setStyles(JSONObject st)
	{
	  this.styles = st;
	}
	
	
	public boolean isForAttr()
  {
    return forAttr;
  }

  public void setForAttr(boolean forAttr)
  {
    this.forAttr = forAttr;
  }

  public JSONObject getAttrs()
  {
    return attrs;
  }

  public void setAttrs(JSONObject attrs)
  {
    this.attrs = attrs;
  }

  private boolean forAttr;
  private int length;
  private int index;
  private JSONObject styles;
  private JSONObject attrs;
  private final static String STYLE="st";
  private final static String ATTR="at";
}
