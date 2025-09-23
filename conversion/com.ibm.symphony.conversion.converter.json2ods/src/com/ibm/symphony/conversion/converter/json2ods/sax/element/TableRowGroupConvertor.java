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

import java.util.List;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;

public class TableRowGroupConvertor extends GeneralConvertor
{
  
  protected void startElement(ConversionContext context,Object input)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    List<Row> rowList = (List<Row>)input;
    Row startRow = rowList.get(0);
    id = index.getGroupId(startRow.rowId);
  }
  
  protected String getNodeId(Object input)
  {
    return id;
  }
  
  public void convertChildren(ConversionContext context,TransformerHandler mXmlWriter,Object object,OdfElement element)
  {
    List<Row> rowList = (List<Row>)object;
    int length = rowList.size();
    for( int i = 0 ;i< length; i++ )
    {
      Row row = rowList.get(i);
      OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW).convert(context,mXmlWriter, row, element);
    }
  }
}
