package com.ibm.concord.spreadsheet.document.model.impl.io.handlers;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.model.impl.Row;
import com.ibm.concord.spreadsheet.document.model.impl.Visibility;

/**
 * For meta.js, <em>"rows": { "(sheetId)": { "(rowId)": { ...</em>
 */
public class MetaRowHandler extends AbstractFieldHandler<Row>
{
  private Row row;

  public void setContext(Row o)
  {
    row = o;
  }

  @Override
  public void onValue(String field, String value)
  {
    if (ConversionConstant.VISIBILITY.equals(field))
    {
      row.setVisibility(Visibility.toVisibility(value));
    }
  }

  @Override
  public void onValue(String field, int value)
  {
    if (ConversionConstant.REPEATEDNUM.equals(field))
    {
      row.setRepeatedNum(value);
    }
    else if (ConversionConstant.HEIGHT.equals(field))
    {
      row.setHeight(value);
    }
  }
}
