package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

public class DrawAContext extends GeneralContext
{
  private String herf;

  public DrawAContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
  }
  
  public String getHerf() {
      return herf;
  }
  
  public void startElement(AttributesImpl attributes) {
    super.startElement(attributes);     
    herf = this.getAttrValue(ConversionConstant.ODF_ATTR_XLINK_HREF);       
  }
  
}
