package com.ibm.concord.spreadsheet.document.model.impl.io.handlers;

import java.util.List;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;

/**
 * For meta.js, <em>"sheets": { "(sheetId)": { ...</em>
 */
public class MetaSheetHandler extends AbstractFieldHandler<Sheet>
{
  private Sheet sheet;

  public void setContext(Sheet o)
  {
    sheet = o;
  }

  public void onValue(String field, String value)
  {
    if (ConversionConstant.SHEETNAME.equals(field))
    {
      sheet.setSheetName(value);
    }
    else if(ConversionConstant.ACTION_ID.equals(field))
    {
      sheet.setUUId(value);
    }
    else if (ConversionConstant.SHEETINDEX.equals(field))
    {
      // cases that sheetindex is string
      onValue(field, Integer.parseInt(value));
    }
    else if (ConversionConstant.TYPE.equals(field))
    {
      sheet.setType(value);
    }
    else if (ConversionConstant.VISIBILITY.equals(field))
    {
      sheet.setVisibility(value);
    }
    else if(ConversionConstant.TABCOLOR.equals(field))
    {
      sheet.setColor(value);
    }
    else if (ConversionConstant.DIRECTION.equals(field))
    {
      sheet.setDir(value);
    }
  }
  
  @Override
  public void onValue(String field, boolean value) {
    if (ConversionConstant.PROTECTION_PROTECTED.equals(field)){
      sheet.setSheetProtected(value);
    }
    else if(ConversionConstant.OFFGRIDLINES.equals(field))
    {
      sheet.setOffGridLines(value);
    }
  }

  public void onValue(String field, int value)
  {
    if (ConversionConstant.SHEETINDEX.equals(field))
    {
      Document doc = sheet.getParent();
      List<Sheet> l = doc.getSheets();
      ModelHelper.putToList(l, value - 1, sheet);
    }
    else if (ConversionConstant.FREEZEROW.equals(field))
    {
      sheet.setFreezeRowIndex(value);
    }
    else if (ConversionConstant.FREEZECOLUMN.equals(field))
    {
      sheet.setFreezeColIndex(value);
    }
    else if (ConversionConstant.SHEET_ROW_HEIGHT.equals(field))
    {
      sheet.setRowHeight(value);
    }
  }
}
