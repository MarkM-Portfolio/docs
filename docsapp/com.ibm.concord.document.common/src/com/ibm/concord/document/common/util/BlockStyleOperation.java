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

public class BlockStyleOperation extends Operation
{
  public final static String DATATYPE = "dtt";
  
  private Data data;// 1-2 delta in list.
  
  private boolean isBlock = true;  
  
  private String blockId;
  
  private String presSlideId;
  
  private String presContentBoxId;
  
  private int index;
  
  private int length;
  
  private Data createData()
  {
    return new BlockStyleData();
  }
  
  public Data getData()
  {
    return this.data;
  }

  public void setData(Data data)
  {
    this.data = data;
  } 
  
  public boolean isBlock()
  {
    return this.isBlock;
  }
  
  public int getLength()
  {
    return this.length;
  }
  
  public String getBlockId()
  {
    return this.blockId;
  }
  
  public String getPresSlideId()
  {
    return this.presSlideId;
  }
  
  public String getPresContentBoxId()
  {
    return this.presContentBoxId;
  }
  
  public int getIndex()
  {
    return this.index;
  }
  public void setIndex( int idx)
  {
    this.index = idx;
  }
  @Override
  public void apply(Tidy tidy, Document dom) throws Exception
  {
    ((BlockStyleData) this.getData()).apply(this, dom);
  }

  boolean isRemove()
  {
    return getType().equals(Operation.REMOVE_BLOCK_STYLE);
  }

  @Override
  public boolean read(JSONObject update)
  {
    try
    {
      this.type = (String) update.get(TYPE);
      this.target = (String) update.get(TARGET);
      this.blockId = (String)update.get(BLOCK_ID);
      if (update.containsKey(PRES_CONTENT_BOX_ID))
        this.presContentBoxId = update.get(PRES_CONTENT_BOX_ID).toString();
      if (update.containsKey(PRES_SLIDE_ID))
        this.presSlideId = update.get(PRES_SLIDE_ID).toString();
      Object tmp =  update.get(IS_BLOCK);
      if( tmp != null )
        this.isBlock = (Boolean) update.get(IS_BLOCK);
      if (!isBlock)
      {
        this.index = Integer.parseInt(update.get(INDEX).toString());
        this.length = Integer.parseInt(update.get(LENGTH).toString());
      }
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
      ob.put(IS_BLOCK, isBlock);
      ob.put(BLOCK_ID,blockId);
      if (presContentBoxId != null)
        ob.put(PRES_CONTENT_BOX_ID, presContentBoxId);
      if (presSlideId != null)
        ob.put(PRES_SLIDE_ID, presSlideId);
      if (!isBlock)
      {
        ob.put(INDEX, index);
        ob.put(LENGTH, length);
      }
      data.write(ob);
      return ob;
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return null;
    }
  }
}
