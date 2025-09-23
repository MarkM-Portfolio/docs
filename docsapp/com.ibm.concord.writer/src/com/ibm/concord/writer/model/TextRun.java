package com.ibm.concord.writer.model;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class TextRun extends Run
{

  TextRun(JSONObject jsonobj)
  {
    super(jsonobj);
    this.modelType = TEXT;
  }

  private boolean compareEmpty(JSONArray src, JSONArray dest)
  {
    if( (src == null || src.isEmpty()) && (dest == null || dest.isEmpty()))
      return true;

    return false;
  }
  
  private boolean compareEmpty(JSONObject src, JSONObject dest)
  {
    if( (src == null || src.isEmpty()) && (dest == null || dest.isEmpty()))
      return true;

    return false;
  }
  
  boolean isSameComments(JSONArray comments) {
	  if(this.getComments()==null && comments==null)
		  return true;
	  if(this.getComments()==null || comments==null)
		  return false;
	  int c_size = this.getComments().size();
	  int c_other_size = comments.size();
	  if((c_size==c_other_size)&&(c_size==0))
		  return true;
	  return MessageUtil.isSameObject(comments, this.getComments());
  }
  boolean isSameObject(ModelObject obj)
  {
    if (obj instanceof Run)
    {
      Run other = (Run) obj;
      JSONObject style = this.getStyle();
      JSONObject br = this.getBreak();
      String runType = this.getType();
      String author = this.getAuthor();
      String oAuthor = other.getAuthor();
      boolean bSameAuthor = false;
      if(author == oAuthor && author == null){
    	  bSameAuthor = true;  
      }else if(author != null){
    	  bSameAuthor = author.equalsIgnoreCase(oAuthor);
      }   	  
      
      JSONArray changes = this.getChanges();
      
      return runType.equalsIgnoreCase(other.getType())
          && bSameAuthor 
          && (isSameChanges(changes, other.getChanges()) || this.compareEmpty(changes, other.getChanges()))
          && (MessageUtil.isSameObject(style, other.getStyle()) || this.compareEmpty(style, other.getStyle()))
          && (MessageUtil.isSameObject(br, other.getBreak()) || this.compareEmpty(br, other.getBreak()))
          && this.isSameComments(other.getComments());
    }
    else
      return false;
  }
  
  boolean isSameChangeObj(Object obj1, Object obj2)
  {
	  if (obj1 == null && obj2 != null)
		  return false;
	  if (obj2 == null && obj1 != null)
		  return false;
	  return obj1 == obj2 || obj1.equals(obj2);
  }
  
  boolean isSameChanges(JSONArray chs1, JSONArray chs2)
  {
	  if (chs1 == null && chs2 == null)
		  return true;
	  if (chs1 == null && chs2 != null)
		  return false;
	  if (chs2 == null && chs1 != null)
		  return false;
	  
	  if (chs1.size() != chs2.size())
		  return false;
	  
	  for (int i = 0; i < chs1.size(); i++)
	  {
		  Object obj1 = chs1.get(i);
		  Object obj2 = chs2.get(i);
		  
		  if (obj1 == null && obj2 != null)
			  return false;
		  if (obj2 == null && obj1 != null)
			  return false;
		  
		  JSONObject json1 = (JSONObject) obj1;
		  JSONObject json2 = (JSONObject) obj2;
		  
		  if (!(isSameChangeObj(json1.get("t"), json2.get("t")) && isSameChangeObj(json1.get("u"), json2.get("u")) && isSameChangeObj(json1.get("d"), json2.get("d"))))
			  return false;
	  }
	  
	  return true;
  }

  @Override
  boolean merge(Run run, int index)
  {
    if (!(this.isSepObj() || run.isSepObj()) && this.isSameObject(run))
    {
      this.setLength(this.getLength() + run.getLength());
      return true;
    }
    else
      return false;
  }

  @Override
  public Run split(int index, HintList parent)
  {
    if (index <= this.getStart())
      return this;
    TextRun newRun = clone();
    newRun.setStart(index);
    newRun.setLength(getEnd() - index);
    setLength(index - getStart());
    if (parent != null)
      parent.addRun(parent.indexOf(this) + 1, newRun, false);
    return newRun;
  }
  
  @Override
  public  boolean addComment(String cid, int index, int length, HintList parent) {
	//process the new line case
	if(index==0&&length==0) {
		addComment(cid);
		return true;
	}
	if (index >= getEnd() || (index + length) <= getStart())
		return false;
	else {
		Run right = split(index, parent);
	    if (length < right.getLength())
	      right.split(index + length, parent);
	    right.addComment(cid);
	    return true;
	}	  
  }
  
  @Override
  public boolean setStyle(int index, int length, JSONObject styles, HintList parent)
  {
    if (length <= 0 || index >= getEnd() || (index + length) <= getStart())
      return false;
    else
    {
      Run right = split(index, parent);
      if ((length + index) < (right.getLength() + right.getStart()))
        right.split(index + length, parent);
      right.setStyle(styles);
      return true;
    }
  }
  
  public JSONObject getStyle(JSONObject style)
  {
    return (JSONObject) jsonobj.get("style");
  }

   public TextRun clone()
  {
    JSONObject json = (JSONObject) MessageUtil.deepCopy(jsonobj);
    return new TextRun(json);
  }
}
