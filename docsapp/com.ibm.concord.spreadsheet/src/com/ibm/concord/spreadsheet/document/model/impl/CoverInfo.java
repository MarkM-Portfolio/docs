package com.ibm.concord.spreadsheet.document.model.impl;

import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.commons.lang.builder.ToStringStyle;

public class CoverInfo extends BasicModel
{
  private int colspan;
  
  private int rowspan;

  private Row parent;

  public CoverInfo(Row parent, int id, int colSpan, int rowSpan)
  {
    this.id = id;
    this.colspan = colSpan;
    this.rowspan = rowSpan;
    this.parent = parent;
  }

  public int getColSpan()
  {
    return this.colspan;
  }
  
  public void setColSpan(int colspan)
  {
    this.colspan = colspan;
  }
  
  public int getRowSpan()
  {
    return this.rowspan;
  }
  
  public void setRowSpan(int rowspan)
  {
    this.rowspan = rowspan;
  }
  
  public int getIndex()
  {
    return this.getIDManager().getColIndexById(this.parent.getParent().getId(), this.id);
  }

  public int getRowIndex()
  {
    return this.parent.getIndex();
  }
  
  public int getRepeatedNum()
  {
    return this.colspan - 1;
  }

  public void setRepeatedNum(int num)
  {
    this.colspan = num + 1;
  }

  public int getRowRepeatedNum()
  {
    return this.rowspan - 1;
  }
  
  public Object getParent()
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

  @Override
  public boolean isMergable(BasicModel model)
  {
    return false;
  }
  
  public String toString()
  {
    return new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE).append("col", getIndex()).append("row", getRowIndex()).append("colspan", colspan).toString();
  }

  @Override
  public void remove()
  {
    parent = null;
  }
}
