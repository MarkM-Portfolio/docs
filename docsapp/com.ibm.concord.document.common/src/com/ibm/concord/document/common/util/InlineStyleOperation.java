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
public class InlineStyleOperation extends Operation
{
  // sub type string values
  // for "SetStyle or RemoveStyle"
  public final static String STYLE_VALUES = "ss";

  public final static String STYLE_ELEMNET = "es";
  
  public final static String DATATYPE = "dtt";

  private Data data;// 1-2 delta in list.
  
  
  private Data createData()
  {
    return new StyleData();
  }

  @Override
  public void apply(Tidy tidy, Document dom) throws Exception
  {
    ((StyleData) this.getData()).apply(this, dom);
  }
  
  public boolean isRemove()
  {
    return getType().equals(Operation.REMOVE_INLINE_STYLE);
  }

  public Data getData()
  {
    return this.data;
  }

  public void setData(Data data)
  {
    this.data = data;
  }
  
  public boolean read(JSONObject update)
  {
    try
    {
      this.type = (String) update.get(TYPE);
      this.target = (String) update.get(TARGET);
      this.data = createData();
      this.data.read( update );
      return true;
    }
    catch (Exception e)
    {
      return false;
    }
  }

  @Override
  public JSONObject write()
  {
    try
    {
      JSONObject ob = new JSONObject();
      ob.put(TYPE, type);
      ob.put(TARGET, getTarget());
      data.write(ob);
      return ob;
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return null;
    }
  }
  
  public int getIndex()
  {
    return ((StyleData) this.data).getIndex();
  }

  public void setIndex(int index)
  {
    ((StyleData) this.data).setIndex(index);
  }

  public int getOffset()
  {
    return ((StyleData) this.data).getOffset();
  }

  public void setOffset(int offset)
  {
    ((StyleData) this.data).setOffset(offset);
  }
  
}
