/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.util;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;

import com.ibm.json.java.JSONObject;

/**
 * @author wangxum@cn.ibm.com
 * 
 */
public abstract class Operation
{

  protected String type;

  protected String target;
  
  protected boolean isAppend=false;
  
  public final static String TYPE = "t";

  public final static String TARGET = "tid";
  
  public final static String REFID = "rid"; // delete task

  // operation types
  public final static String DELETE_TEXT = "dt";

  public final static String INSERT_TEXT = "it";

  public final static String DELETE_ELEMENT = "de";

  public final static String INSERT_ELEMENT = "ie";
  
  public final static String SET_INLINE_STYLE = "sst";
  
  public final static String UPDATE_LIST_VALUE = "ulv";
  
  public final static String CHANGE_LIST_TYPE = "clt";

  public final static String REMOVE_INLINE_STYLE = "rst";
  
  public final static String SET_BLOCK_STYLE = "sbt";

  public final static String REMOVE_BLOCK_STYLE = "rbt";

  public final static String UPDATE_FRAGMENT = "uft";
  
  public final static String SPLIT_NODE = "splitNode";

  public final static String SET_ATTR = "setAtt";
  
  public final static String INSERT_TASK = "itsk";
  
  public final static String DELETE_TASK = "dtsk";
  
  public final static String UPDATE_TASK = "utsk";
  
  public static final String RESET_CONTENT_ACTION = "rcnt";
  
  public final static String INDEX = "idx";

  public final static String LENGTH = "len";

  public final static String IS_BLOCK = "isb";

  public final static String CONTENTS = "cnt";

  public final static String CONTENT = "s";
  
  public final static String BLOCK_ID = "bid";

  public final static String ELEMENT_LIST = "elist";
  
  /* Presentation specific properties */
  public final static String PRES_IS_CSS_LIST_BEFORE = "p_iclb";
  
  public final static String PRES_OBJ = "p_obj";
  
  public final static String PRES_IS_NODE_A_SLIDE = "p_isnas";
  
  public final static String PRES_IS_NODE_A_SLIDE_WRAPPER = "p_isnasw";
  
  public final static String PRES_IS_NODE_A_DRAW_FRAME = "p_isnad";
  
  public final static String PRES_IS_NODE_A_TASK = "p_isnat";
  
  public final static String PRES_NODE_ID = "p_nid";
  
  public final static String PARENT_ID = "parentId";
  
  public final static String PRES_SLIDE_ID = "p_sid";
  
  public final static String PRES_ORIG_SLIDE_COUNT = "p_osc";
  
  public final static String PRES_CONTENT_BOX_ID = "p_cid";
  
  public final static String PRES_TEXT_TYPING = "p_tt";

  public final static String ISAPPEND="isAppend";

  public static final String INSERT_STYLE_ELEMENT = "ise";

  public static final String DELETE_STYLE_ELEMENT = "dse";

  public boolean isAppend(){
	  return this.isAppend;
  }
  public void setAppend(boolean value){
	  this.isAppend=value;
  }
  public String getType()
  {
    return this.type;
  }

  public void setType(String type)
  {
    this.type = type;
  }

  public String getTarget()
  {
    return this.target;
  }

  public void setTarget(String target)
  {
    this.target = target;
  }
  
  protected Document getApplyDom()
  {
	  return null;
  }
  
  public Document apply(Document dom, Tidy tidy) throws Exception
  {
	  this.apply(tidy, dom);
	  
	  if(this.getApplyDom() != null)
		  dom = this.getApplyDom();
	  
	  return dom;
  }
  protected void readAppend(JSONObject update){
	 
	  if( update.get(ISAPPEND)!=null){
		  setAppend((Boolean)update.get(ISAPPEND));
	  }else{
		  setAppend(false);
	  }
	  
  }
  protected void writeAppend(JSONObject update){
	  update.put(ISAPPEND, isAppend());
  }
  
  abstract protected void apply(Tidy tidy, Document dom) throws Exception;

  abstract public boolean read(JSONObject update);
  
  abstract public JSONObject write();//for transform
}
