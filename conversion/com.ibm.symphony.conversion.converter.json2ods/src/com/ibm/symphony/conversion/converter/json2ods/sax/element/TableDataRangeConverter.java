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

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.dom.element.table.TableDatabaseRangeElement;
import org.odftoolkit.odfdom.dom.element.table.TableDatabaseRangesElement;
import org.odftoolkit.odfdom.dom.element.table.TableFilterElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedExpressionsElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedRangeElement;
import org.w3c.dom.Element;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;

public class TableDataRangeConverter extends GeneralConvertor
{
  protected void setAttributes(ConversionContext context,Object input,OdfElement element)
  {
    ConversionUtil.Range range = (ConversionUtil.Range) input;
    TableDatabaseRangeElement obj = (TableDatabaseRangeElement) target;
    if (range != null && range.usage == RangeType.FILTER)
    {
      String sheetId = range.sheetId;
      String tableName = ConversionConstant.UNNAME_RANGE + sheetId;
      obj.setTableNameAttribute(tableName);
      obj.setTableDisplayFilterButtonsAttribute(true);
      ParsedRef ref = ReferenceParser.parse(range.address);
      obj.setTableTargetRangeAddressAttribute(ref.transformRowColToRangeAddress());
    }
  }
  
  public void convertChildren(ConversionContext context, TransformerHandler mXmlWriter, Object input, OdfElement element)
  {
    ConversionUtil.Range range = (ConversionUtil.Range) input;

    if (range != null && range.usage == RangeType.FILTER)
    {
    // Currently, if the new filter is created by Docs, do not output filter condition for ods format.
//      JSONObject data = (JSONObject) range.rangeContentJSON.get("data");
//      if (data != null)
//      {
//        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_FILTER)
//            .convert(context, mXmlWriter, data, element);
//      }
    }
  }

  protected OdfElement createNewElement(ConversionContext context, Object input, OdfElement parent)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    OdfFileDom contentDom = (OdfFileDom)index.getDocuemnt();
    Element element = contentDom.createElementNS(ODSConvertUtil.getNameSpace(ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGE),ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGE);
    return (OdfElement)element;
  }
}
