package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.concord.writer.model.Paragraph;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class InsertText extends Operation
{
  private int index;

  private int length;

  private String text;

  private JSONArray format;

  private final static String MSG_CONTENT = "cnt";
  
  public InsertText(JSONObject jsonUpdate)
  {
    this.read(jsonUpdate);
  }

  protected void apply(JSONObject model) throws Exception
  {
    JSONObject target = MessageUtil.getById(model, getTarget());
    if (target==null) {
      logNoTarget(getTarget(), "paragraph");
      return;
    }
    if (length == 0 && !text.isEmpty())
      return;
    
	ModelObject modelObj = ModelObject.createModelObject(target);
	if (modelObj == null || !( modelObj instanceof Paragraph )) {
		//not support yet
		throwUnSupported(model, modelObj);
	}
	
	Paragraph para = (Paragraph) modelObj;
	
	para.insertText( text, index, format );

  }

  public boolean read(JSONObject update)
  {
    try
    {
      setType((String) update.get(TYPE));
      setTarget((String) update.get(TARGET));
      setIndex(Integer.parseInt(update.get(INDEX).toString()));
      setLength(Integer.parseInt(update.get(LENGTH).toString()));

      JSONObject cnt = (JSONObject) update.get(MSG_CONTENT);
      setText((String) cnt.get(CONTENT));
      format = (JSONArray) cnt.get(FORMAT);
      readOp(update);
      return true;
    }
    catch (Exception e)
    {
      return false;
    }
  }

  public JSONObject write()
  {
    try
    {
      JSONObject update = new JSONObject();
      update.put(TYPE, getType());
      update.put(TARGET, getTarget());
      update.put(LENGTH, getLength());
      update.put(INDEX, getIndex());
      JSONObject cnt = new JSONObject();
      cnt.put(CONTENT, this.text);
      cnt.put(FORMAT, format);

      update.put(MSG_CONTENT, cnt);
      writeOp(update);
      return update;
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
  }

  public int getIndex()
  {
    return index;
  }

  public void setIndex(int index)
  {
    this.index = index;
  }

  public int getLength()
  {
    return length;
  }

  public void setLength(int length)
  {
    this.length = length;
  }

  public void setText(String content)
  {
    this.text = content;
  }

  public String getText()
  {
    return this.text;
  }

}
