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
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;

public class TableColumnGroupConvertor extends GeneralConvertor
{
  private static final Logger LOG = Logger.getLogger(TableColumnGroupConvertor.class.getName());
  
  private boolean bCollapse;
  protected void startElement(ConversionContext context,Object input)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    List<Column> colList = (List<Column>)input;
    Column startCol = colList.get(0);
    id = index.getGroupId(startCol.columnId);
    if ("hide".equalsIgnoreCase(startCol.visibility)){
    	bCollapse = true;
    } else 
    	bCollapse = false;
  }
  
  protected OdfElement convertElement(ConversionContext context,Object input,OdfElement parent){
	  OdfElement element = super.convertElement(context, input, parent);
	  if(element != null) {
		  String display = element.getAttribute(ConversionConstant.ODF_ATTRIBUTE_STYLE_TABLE_DISPLAY);
		  if(display != null && !bCollapse){
			  element.removeAttribute(ConversionConstant.ODF_ATTRIBUTE_STYLE_TABLE_DISPLAY);
		  }
	  }
	  return element;
  }

  protected String getNodeId(Object input)
  {
    return id;
  }
  
  public void convertChildren(ConversionContext context,TransformerHandler mXmlWriter,Object object,OdfElement element)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    List<Column> colList = (List<Column>)object;
    int length = colList.size();
    for( int i = 0 ;i< length; i++ )
    {
      Column column = colList.get(i);
      OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLETABLE_COLUMN).convert(context,mXmlWriter, column, element);
    }
  }
  
}
