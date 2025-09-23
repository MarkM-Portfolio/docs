package com.ibm.concord.spreadsheet.document.model.impl.io.handlers;

import java.util.List;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.model.impl.Column;
import com.ibm.concord.spreadsheet.document.model.impl.Visibility;
import com.ibm.concord.spreadsheet.document.model.style.StyleManager;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;

/**
 * For meta.js, <em>"columns": { "(sheetId)": { "(columnId)": { ...</em>
 */
public class MetaColumnHandler extends AbstractFieldHandler<Column>
{
  private Column column;

  private List<StyleObject> styleList;

  private StyleManager styleManager;

  public void setContext(Column o)
  {
    column = o;
  }

  public void setStyleList(List<StyleObject> l)
  {
    styleList = l;
  }

  public void setStyleManager(StyleManager styleManager)
  {
    this.styleManager = styleManager;
  }

  @Override
  public void onValue(String field, String value)
  {
    if (ConversionConstant.VISIBILITY.equals(field))
    {
      column.setVisibility(Visibility.toVisibility(value));
    }
    else if (ConversionConstant.STYLEID.equals(field))
    {
      if (ConversionConstant.DEFAULT_CELL_STYLE.equals(value))
      {
        column.setStyle(styleManager.getDefaultCellStyle());
      }
      else if (ConversionConstant.DEFAULT_CELL_STYLE_NAME.equals(value))
      {
        column.setStyle(styleManager.getDefaultStyle());
      }
      else
      {
        int styleId = ModelHelper.stripIdType(value);
        StyleObject so = ModelHelper.safeGetList(styleList, styleId);
        if (so == null)
        {
          so = new StyleObject();
          ModelHelper.putToList(styleList, styleId, so);
        }
        column.setStyle(so);
      }
    }
  }

  @Override
  public void onValue(String field, int value)
  {
    if (ConversionConstant.REPEATEDNUM.equals(field))
    {
      column.setRepeatedNum(value);
    }
    else if (ConversionConstant.WIDTH.equals(field))
    {
      column.setWidth(value);
    }
  }
}
