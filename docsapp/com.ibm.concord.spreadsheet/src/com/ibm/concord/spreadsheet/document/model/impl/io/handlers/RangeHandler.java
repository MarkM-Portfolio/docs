package com.ibm.concord.spreadsheet.document.model.impl.io.handlers;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.impl.IDManager;
import com.ibm.concord.spreadsheet.document.model.impl.Range;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONObject;

/**
 * For un-named range(unnames), named range(names),  and preserve range(pnames in preserve.js)
 */
public class RangeHandler extends AbstractFieldHandler<Range>
{
  private static final Logger LOG = Logger.getLogger(RangeHandler.class.getName());

  protected Range range;

  private String rangeAddress;
  
  public void setContext(Range o)
  {
    range = o;
    rangeAddress = null;
  }

  @Override
  public void onValue(String field, String value)
  {
    int id;

    if (ConversionConstant.RANGE_USAGE.equals(field))
    {
      range.setUsage(RangeUsage.enumValueOf(value));
    }
    else if (ConversionConstant.SHEETID.equals(field))
    {
      id = ModelHelper.toNumberId(value);
      range.setSheetId(id);
    }
    else if (ConversionConstant.ENDSHEETID.equals(field))
    {
      id = ModelHelper.toNumberId(value);
      range.setEndSheetId(id);
    }
    else if (ConversionConstant.RANGE_STARTROWID.equals(field))
    {
      id = ModelHelper.toNumberId(value);
      range.setStartRowId(id);
    }
    else if (ConversionConstant.RANGE_ENDROWID.equals(field))
    {
      id = ModelHelper.toNumberId(value);
      range.setEndRowId(id);
    }
    else if (ConversionConstant.RANGE_STARTCOLID.equals(field))
    {
      id = ModelHelper.toNumberId(value);
      range.setStartColId(id);
    }
    else if (ConversionConstant.RANGE_ENDCOLID.equals(field))
    {
      id = ModelHelper.toNumberId(value);
      range.setEndColId(id);
    }
    else if (ConversionConstant.RANGE_ADDRESS.equals(field))
    {
      rangeAddress = value;
    }
    else if (ConversionConstant.ATTR.equals(field) || ConversionConstant.CHART_SERIES.equals(field))
    {
      range.getData().put(field, value);
    }
    else
    {
      LOG.log(Level.WARNING, "Unknown range attribute {0}: {1}, in range with id {2}.", new Object[] { field, value, range.getId() });
    }
  }

  @Override
  public void onValue(String field, JSONObject value)
  {
    if (ConversionConstant.RANGE_OPTIONAL_DATA.equals(field))
    {
      range.getData().put(field, value);
    }
    else
    {
      LOG.log(Level.WARNING, "Unknown range JSON attribute {0}: {1}, in range with id {2}.", new Object[] { field, value, range.getId() });
    }
  }
  @Override
  public void onEnd()
  {
    // the rangeAddress might not contain sheet name, but when rangeAddress has been given, the sheetId might not be set yet
    // so should setAddress at the end
    if (rangeAddress != null)
    {
      boolean needAnalyzeAddress = true;
      // MUST not analyze address when address contains #REF!
      // if the sheet id which referred by this range is the sheet in recover manager
      // the sheet id must be kept, rather than set to null
      if (rangeAddress.indexOf(ConversionConstant.INVALID_REF) > -1)
        needAnalyzeAddress = false;
      /*if (range.getUsage() == RangeUsage.FILTER)
      {
        ParsedRef ref = ReferenceParser.parse(rangeAddress);
        if (ref.type != ParsedRefType.COLUMN)
        {
          // normalize range to column range
          // start row id being first row id
          IDManager idMan = range.getParent().getIDManager();
          range.setStartRowId(idMan.getRowIdByIndex(range.getSheetId(), 1, true));
          range.setEndRowId(IDManager.MAXID);
          int mask = ref.patternMask;
          // set START_ROW and END_ROW bit to 0
          mask &= ~ReferenceParser.START_ROW;
          mask &= ~ReferenceParser.END_ROW;
          mask &= ~ReferenceParser.END_SHEET;
          rangeAddress = ref.getAddressByMask(mask, false);
        }
        // else, range is already normalized
      }*/
      // else, no need to normalize
      
      // if the address is larger than MAX_REF(5000), should set startRowIndex and rowDelta
      range.setAddress(rangeAddress, needAnalyzeAddress);
    }
  }
}
