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

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public class AnchorPreserveConvertor extends PreserveConvertor
{

  private boolean isNeedOutput = true;
  public AnchorPreserveConvertor(PreserveNameIndex index)
  {
    super(index);
  }

  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    AttributesImpl attrs = new AttributesImpl(attributes);
    String id = attrs.getValue(ConversionConstant.ID_STRING);
    if(ConversionConstant.ODF_ELEMENT_DRAW_FRAME.equals(qName) && ConversionUtil.hasValue(id) && id.startsWith(ConversionConstant.IMGID))
      isNeedOutput = false;
    if(!isNeedOutput)
      return;
    if(index.elementId.equals(id))
    {
      String[] qNArray = {ConversionConstant.ODF_ATTRIBUTE_TABLE_END_CELL_ADDRESS,ConversionConstant.ODF_ATTRIBUTE_TABLE_END_X,ConversionConstant.ODF_ATTRIBUTE_TABLE_END_Y};
      ODSConvertUtil.removeAttribute(attrs, qNArray);
    }
    super.startElement(uri, localName, qName, attrs);
  }
  
  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    boolean isNeedEnd = isNeedOutput;
    if(ConversionConstant.ODF_ELEMENT_DRAW_FRAME.equals(qName) && !isNeedOutput)
    {
      isNeedOutput = true;
    }
    if(!isNeedEnd)
    {
      return;
    }
    
    super.endElement(uri, localName, qName);
  }
}
