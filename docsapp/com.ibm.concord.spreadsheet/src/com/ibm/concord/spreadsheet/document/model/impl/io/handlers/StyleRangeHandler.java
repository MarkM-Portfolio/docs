package com.ibm.concord.spreadsheet.document.model.impl.io.handlers;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.model.impl.IDManager;
import com.ibm.concord.spreadsheet.document.model.impl.Range;

/**
 * For preserve.js, <em>"style": { "(sheetId)": { "(rangeId)": ...</em>
 */
public class StyleRangeHandler extends AbstractFieldHandler<Range<Integer>>
{
  private static final Logger LOG = Logger.getLogger(StyleRangeHandler.class.getName());

  private Range<Integer> styleRange;

  private IDManager idManager;

  private int sheetId;

  public void setContext(Range<Integer> o)
  {
    styleRange = o;
  }

  public void setIdManager(IDManager idManager)
  {
    this.idManager = idManager;
  }

  public void setSheetId(int sid)
  {
    sheetId = sid;
  }

  @Override
  public void onValue(String field, int value)
  {
    int id;

    if (ConversionConstant.STARTROW.equals(field))
    {
      id = idManager.getRowIdByIndex(sheetId, value, true);
      styleRange.setStartRowId(id);
    }
    else if (ConversionConstant.ENDROW.equals(field))
    {
      id = idManager.getRowIdByIndex(sheetId, value, true);
      styleRange.setEndRowId(id);
    }
    else if (ConversionConstant.STARTCOL.equals(field))
    {
      id = idManager.getColIdByIndex(sheetId, value, true);
      styleRange.setStartColId(id);
    }
    else if (ConversionConstant.ENDCOL.equals(field))
    {
      id = idManager.getColIdByIndex(sheetId, value, true);
      styleRange.setEndColId(id);
    }
    else
    {
      LOG.log(Level.WARNING, "Unknown preserve style range attribute {0}: {1}, in style range with id {2}.", new Object[] { field, value,
          styleRange.getId() });
    }
  }
}
