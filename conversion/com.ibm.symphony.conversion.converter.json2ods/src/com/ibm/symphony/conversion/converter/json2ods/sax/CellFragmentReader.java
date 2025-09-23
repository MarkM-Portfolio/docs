/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

import com.ibm.symphony.conversion.converter.json2ods.sax.element.TableCellContext;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class CellFragmentReader extends XMLFragmenttReader
{
  private ConversionContext context;
  private Object input;
  private TableCellContext eContext;
  
  public CellFragmentReader(ConversionContext context,Object input)
  {
    this.context = context;
    this.input = input;
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    if(!qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL) && !qName.equals(ConversionConstant.ODF_ELEMENT_TABLECONVEREDTABLE_CELL))
      return;
    String id = attributes.getValue(ConversionConstant.ID_STRING);
    boolean isNew = true;
    if(ConversionUtil.hasValue(id))
      isNew = false;
    eContext = new TableCellContext(context,hdl,input);
    eContext.convert(context,input,isNew);
    eContext.startElement(uri, localName, qName, attributes);
    eContext.endElement(uri, localName, qName);
  }
  
  public void endElement(String uri, String localName, String qName) throws SAXException
  {
  }
  
}
