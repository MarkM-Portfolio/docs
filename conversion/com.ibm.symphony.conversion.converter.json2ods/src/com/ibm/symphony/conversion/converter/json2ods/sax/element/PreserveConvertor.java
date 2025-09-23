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

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public class PreserveConvertor
{
  protected TransformerHandler hdl;
  protected PreserveNameIndex index;
  
  public PreserveConvertor(PreserveNameIndex index)
  {
    this.index = index;
  }
  
  public void setXMLWriter(TransformerHandler hdl)
  {
    this.hdl = hdl;
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    AttributesImpl attrs = new AttributesImpl(attributes);
    if(qName.equals("draw:custom-shape")
        ||qName.equals("draw:frame")
        ||qName.equals("draw:control")
        ||qName.equals("draw:ellipse")
        ||qName.equals("draw:measure")
        ||qName.equals("draw:polygon")
        ||qName.equals("draw:polyline")
        ||qName.equals("draw:rect")
        ||qName.equals("draw:circle")
        ||qName.equals("draw:line")
        ||qName.equals("draw:connector")
        ||qName.equals("draw:path")
        ||qName.equals("draw:g")
        ||qName.equals("draw:regular-polygon")
        ||qName.equals("draw:caption")
        )
    {
      String[] qNArray = {ConversionConstant.ODF_ATTRIBUTE_TABLE_END_CELL_ADDRESS,ConversionConstant.ODF_ATTRIBUTE_TABLE_END_X,ConversionConstant.ODF_ATTRIBUTE_TABLE_END_Y};
      ODSConvertUtil.removeAttribute(attrs, qNArray);
    }
    hdl.startElement(uri, localName, qName, attrs);
  }

  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    hdl.endElement(uri, localName, qName);
  }
}
