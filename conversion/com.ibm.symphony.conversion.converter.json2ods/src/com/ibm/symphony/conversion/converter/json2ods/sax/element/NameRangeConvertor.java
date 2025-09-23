/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.table.TableNamedRangeElement;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;

public class NameRangeConvertor extends GeneralConvertor
{
  private static final Logger LOG = Logger.getLogger(NameRangeConvertor.class.getName());

  protected OdfElement createNewElement(ConversionContext context, Object input, OdfElement parent)
  {
    OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
    try
    {
      TableNamedRangeElement tableElement = new TableNamedRangeElement(contentDocument);
      return tableElement;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "can not create a named range", e);
    }
    return null;
  }

  protected void setAttributes(ConversionContext context, Object input, OdfElement element)
  {
    TableNamedRangeElement rangeElement = (TableNamedRangeElement) target;
    Range nameRange = (Range) input;
    rangeElement.setTableNameAttribute(nameRange.rangeId);
      
      //Docs support Sheet1.$A:$B or Sheet1.$1:$2, but ods does not support such address style, so should change it to range
      ParsedRef ref = ReferenceParser.parse(nameRange.address);
      String startCellAddress = ODSConvertUtil.START_CELL_ADDRESS; 
      if(ref != null)
      {
        // 48681. for "Sheet1.A1", need change to "$Sheet1.A1". Or when export to .xls file, it will be treat as #REF!
        ref.patternMask |= ReferenceParser.ABSOLUTE_SHEET;
        ref.patternMask |= ReferenceParser.ABSOLUTE_END_SHEET;
        rangeElement.setTableCellRangeAddressAttribute(ref.transformRowColToRangeAddress());
        startCellAddress = ref.getStartCellAddress();
        if (startCellAddress.contains(ConversionConstant.INVALID_REF))
          startCellAddress = ODSConvertUtil.START_CELL_ADDRESS;
      }
      else
      {
        rangeElement.setTableCellRangeAddressAttribute(nameRange.address);
      }
      // TODO: what is base cell address, use sample file 20100719-wrv2_reviewformulier.ods
      rangeElement.setTableBaseCellAddressAttribute(startCellAddress);
  }
}
