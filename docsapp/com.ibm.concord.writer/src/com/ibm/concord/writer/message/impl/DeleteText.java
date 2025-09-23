package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.concord.writer.model.Paragraph;
import com.ibm.json.java.JSONObject;

public class DeleteText extends Operation
{
  private int index;

  private int length;
  
  private String oid;

  public DeleteText(JSONObject jsonUpdate)
  {
    this.read(jsonUpdate);
  }
  
  public DeleteText()
  {
    
  }

  protected void apply(JSONObject model) throws Exception
  {
    JSONObject target = MessageUtil.getById(model, getTarget());
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
	if( length != 0 )
		para.deleteText( index, length );
	else{
		
		para.deleteById( oid );
	}
		
	/*
    // Delete Text
    String content = (String) target.get(CONTENT);
    if (content == null)
      content = "";
    content = content.substring(0, index) + content.substring(index + length);
    target.put(CONTENT, content);

    // Update Attributes
    JSONArray attributes = (JSONArray) target.get(FORMAT);
    if (attributes == null)
      attributes = new JSONArray();

    int deleteLen = length;
    for (int i = attributes.size() - 1; deleteLen > 0 && i >= 0; i--)
    {
      JSONObject attribute = (JSONObject) attributes.get(i);
      Object s = attribute.get("s");
      Object l = attribute.get("l");
      if (s == null || l == null)
        continue;
      int start = Integer.parseInt(s.toString());
      int len = Integer.parseInt(l.toString());

      if (start <= index)
      {
        if (start + len <= index)
          break;
        else if (start == index && deleteLen >= len)
          attributes.remove(i);
        else
          attribute.put("l", len - deleteLen);

        break;
      }
      else
      {
        if (index + deleteLen <= start)
          attribute.put("s", start - length);
        else
        {
          attribute.put("s", index);
          int delta = index + deleteLen - start;
          if (len == delta)
            attributes.remove(i);
          else
            attribute.put("l", len - delta);
          
          deleteLen -= delta;
        }
      }
    }

    // TODO Merge Attributes
    target.put(FORMAT, attributes);*/
  }

  public boolean read(JSONObject update)
  {
    try
    {
      setType(update.get(TYPE).toString());
      setTarget(update.get(TARGET).toString());
      setIndex(Integer.parseInt(update.get(INDEX).toString()));
      setLength(Integer.parseInt(update.get(LENGTH).toString()));
      Object objId = update.get(OBJID);
      if( objId != null )
    	  oid = objId.toString();
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

}
