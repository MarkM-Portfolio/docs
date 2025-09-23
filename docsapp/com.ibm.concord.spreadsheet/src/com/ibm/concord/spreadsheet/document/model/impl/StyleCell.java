package com.ibm.concord.spreadsheet.document.model.impl;

import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.commons.lang.builder.ToStringStyle;

import com.ibm.concord.spreadsheet.document.model.style.StyleManager;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;

public class StyleCell extends BasicModel
{
  private StyleObject style;
  private int repeatedNum;
  private Row parent;
  
  public StyleCell(Row parent,int id)
  {
    this.parent = parent;
    this.id = id;
    this.repeatedNum = 0;
    this.style = null;
  }
  
  /**
   * copy all the attributes in cell
   * @param index   : the index(1-based) of this stylecell model
   * @param cell    : 
   */
  public StyleCell(int index, StyleCell cell)
  {
    if(null == cell) return;
    this.parent = cell.getParent();
    this.id = this.getIDManager().getColIdByIndex(this.parent.getParent().getId(), index, true);
    this.repeatedNum = cell.getRepeatedNum();
    this.setStyle(cell.getStyle());
    
  }
  
  public boolean equals(StyleCell cell)
  {
    if(null == cell) return false;
    if(this.id == cell.getId() && this.repeatedNum == cell.getRepeatedNum()
        && this.style == cell.getStyle())
      return true;
    return false;
  }
  /**
   * copy all the attributes in cell
   * @param cell
   */
  public StyleCell(StyleCell cell)
  {
    if(null == cell) return;
    this.parent = cell.getParent();
    this.id = cell.getId();
//    this.idManager = cell.getIDManager();
    this.repeatedNum = cell.getRepeatedNum();
    this.setStyle(cell.getStyle());
  }
  
  public int getId()
  {
    return this.id;
  }
  
  /**
   * Change id of this styleCell. Useful for deserializing, but for other times, use it at risk.
   * @param id
   */
  public void setId(int id)
  {
    this.id = id;
  }
  

  public StyleObject getStyle()
  {
    return this.style;
  }
  

  public StyleManager getStyleManager()
  {
    return this.parent.getParent().getParent().getStyleManager();
  }
  /**
   * This method should be called after the repeatedNum been set and the style assignment should only used by this method
   * set the styleOjbect for the styleCell
   * @param style
   */
  public void setStyle(StyleObject style)
  {
    StyleManager styleManager = this.getStyleManager();
    if(null != this.style)
      styleManager.changeRefCount(this.style, -(this.repeatedNum+1));
    this.style = style;
    if(null != this.style)
      styleManager.changeRefCount(this.style, this.repeatedNum+1);
  }
  
  public int getRepeatedNum()
  {
    return this.repeatedNum;
  }
  public void setRepeatedNum(int num)
  {
    if(null != this.style)
    {
      StyleManager styleManager = this.getStyleManager();
      styleManager.changeRefCount(this.style, num-this.repeatedNum);
    }  
    this.repeatedNum = num;
  }
  
  public Row getParent()
  {
    return this.parent;
  }
  
  public void setParent(Row r)
  {
    this.parent = r;
  }
  
  public IDManager getIDManager()
  {
    return parent.getIDManager();
  }
  
  public int getIndex()
  {
    return this.getIDManager().getColIndexById(this.parent.getParent().getId(), this.id);
  }
  
  public void copy(BasicModel model)
  {
    if(null == model) return;
    this.setStyle(((StyleCell)model).getStyle());
  }
  

  public boolean isMergable(BasicModel model)
  {
    StyleCell nCell = (StyleCell)model;
    int curSIndex = this.getIndex();
    int curEIndex = curSIndex + this.getRepeatedNum();
    
    int nSIndex = nCell.getIndex();
    int nEIndex = nSIndex + nCell.getRepeatedNum();
    
    if(curEIndex + 1 == nSIndex || nEIndex + 1 == curSIndex)
    {
      return nCell.getStyle() == this.style;
    }  
    return false;
  }
  
  public String toString()
  {
    return new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE) //
        .append("index", getIndex()) //
        .append("repeat", getRepeatedNum()).toString();
  }

  @Override
  public void remove()
  {
    setStyle(null);
    parent = null;
  }
}
