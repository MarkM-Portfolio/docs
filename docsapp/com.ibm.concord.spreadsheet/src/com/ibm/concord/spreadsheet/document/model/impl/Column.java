package com.ibm.concord.spreadsheet.document.model.impl;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.commons.lang.builder.ToStringStyle;

import com.ibm.concord.spreadsheet.document.model.style.StyleManager;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.Position;

public class Column extends BasicModel
{
  private static final Logger LOG = Logger.getLogger(Column.class.getName());
  
  static Method getCoverInfoIndexMethod;
  static Method repeatCoverInfoMethod;
  
  private int width;

  private StyleObject style;

  private int repeatedNum;

  private Visibility visibility;

  private Sheet parent;
  
  private List<CoverInfo> coverList;

  static {
    try{
      getCoverInfoIndexMethod = CoverInfo.class.getDeclaredMethod("getRowIndex", null);
    } catch(NoSuchMethodException sme)
    {
      LOG.log(Level.WARNING, " no getRowIndex method in CoverInfo class");
    }
    
    try{
      repeatCoverInfoMethod = CoverInfo.class.getDeclaredMethod("getRowRepeatedNum", null);
    } catch(NoSuchMethodException sme)
    {
      LOG.log(Level.WARNING, " no getRowSpan method in CoverInfo class");
    }
  }
  
  public Column(Sheet parent, int id)
  {
    this.parent = parent;
    this.id = id;
    this.width = -1;
    this.style = null;
    this.visibility = null;
    this.repeatedNum = 0;
    this.coverList = new ArrayList<CoverInfo>();
  }

  public Column(int index, Column col)
  {
    if (null == col)
      return;
    this.parent = col.getParent();
    this.id = this.getIDManager().getColIdByIndex(this.parent.getId(), index, true);
    this.width = col.getWidth();
    this.visibility = col.getVisibility();
    this.repeatedNum = col.getRepeatedNum();
    this.coverList = new ArrayList<CoverInfo>();
    this.coverList.addAll(col.getCoverList());
    this.setStyle(col.getStyle());
  }

  public int getIndex()
  {
    return this.getIDManager().getColIndexById(this.parent.getId(), this.id);
  }

  public void copy(BasicModel model)
  {
    if (null == model)
      return;
    Column col = (Column) model;
    this.width = col.getWidth();
    this.visibility = col.getVisibility();
    this.repeatedNum = col.getRepeatedNum();
    this.setStyle(col.getStyle());
  }


  public int getWidth()
  {
    return this.width;
  }

  public void setWidth(int w)
  {
    this.width = w;
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

  public StyleObject getStyle()
  {
    return this.style;
  }

  public StyleManager getStyleManager()
  {
    return this.parent.getParent().getStyleManager();
  }
  
  public void setStyle(StyleObject style)
  {
    StyleManager styleManager = this.getStyleManager();
    if(null != this.style)
      styleManager.changeRefCount(this.style, -(this.repeatedNum+1));
    this.style = style;
    if(null != this.style)
      styleManager.changeRefCount(this.style, this.repeatedNum+1);
  }

  public Visibility getVisibility()
  {
    return visibility;
  }

  public void setVisibility(Visibility visibility)
  {
    this.visibility = visibility;
  }


  public boolean isContainStyle()
  {
    if(this.width != -1 || (null != this.style && 
        !this.style.equals(this.getStyleManager().getDefaultCellStyle())))
      return true;
    return false;
  }
  
  public boolean isVisible()
  {
    if(null == this.visibility || Visibility.VISIBLE == this.visibility)
      return true;
    return false;
  }
  public IDManager getIDManager()
  {
    return parent.getIDManager();
  }

  public Sheet getParent()
  {
    return this.parent;
  }
  
  public int insertCoverInfo(CoverInfo ci)
  {
    Position pos = ModelHelper.insert(this.coverList, ci, getCoverInfoIndexMethod, repeatCoverInfoMethod);
    return pos.index;
  }

  public CoverInfo getCoverInfo(int index)
  {
    Position pos = ModelHelper.search(this.coverList, index, getCoverInfoIndexMethod, repeatCoverInfoMethod);
    if(pos.isFind)
      return this.coverList.get(pos.index);
    return null;
  }

  public List<CoverInfo> getCoverList()
  {
    return this.coverList;
  }
  
  @Override
  public boolean isMergable(BasicModel model)
  {
    int curSIndex = this.getIndex();
    int curEIndex = curSIndex + this.repeatedNum;
    
    int nSIndex = model.getIndex();
    int nEIndex = nSIndex + model.getRepeatedNum();
    
    if(curEIndex + 1 == nSIndex || nEIndex + 1 == curSIndex)
    {
      Column col = (Column) model;
      if(this.width != col.getWidth() 
          || this.visibility != col.getVisibility() 
          || this.style != col.getStyle())
        return false;
      return true;
    }  
    return false;
  }
  
  public String toString()
  {
    return new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE).append("index", getIndex()).append("repeat", getRepeatedNum()).toString();
  }

  @Override
  public void remove()
  {
    setStyle(null);
    parent = null;
  }
}
