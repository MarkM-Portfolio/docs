/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.xmlimport;

import org.w3c.dom.Node;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.FontFaceContext;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.GeneralContext;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.NamedExpressionsContext;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.OfficeAutomaticStylesContext;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.TableDataRangesContext;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.TableContentValidationsContext;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.TableTableContext;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.TableCalculationSettingsContext;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class SpreadsheetXMLImport extends XMLImport
{

  public SpreadsheetXMLImport(Node rootNode)
  {
    super(rootNode);
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException{
    super.startElement(uri, localName, qName, attributes);
  }
  public GeneralContext createContext(String uri, String localName, String qName, Object target)
  {
    GeneralContext context = null;
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case DOCUMENT_CONTENT:
      case DOCUMENT_STYLES:
        context = new XMLDocContext(this, uri, localName, qName, target);
        break;
      default:
        context = new GeneralContext(this, uri, localName, qName, target);
    }
    return context;
  }

}

class XMLDocContext extends GeneralContext{

  public XMLDocContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
    // TODO Auto-generated constructor stub
  }
  
  public void startElement(AttributesImpl attributes)
  {
    super.startElement(attributes);
    ConversionContext ccontext = getImporter().getConversionContext();
    if(getAttrValue("xmlns:msoxl") != null)
    {
      ccontext.put("MSFormula", true);
    }else
    {
      ccontext.put("MSFormula", false);
    }
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    GeneralContext context = null;
    XMLImport importer = getImporter();
    Object target = getTarget();
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case FONT_DECLS:
        context = new XMLFontStylesContext(importer, uri, localName, qName, target);
        break;
      case AUTOMATIC_STYLES:
        context = new OfficeAutomaticStylesContext(importer, uri, localName, qName, target);
        break;
      case OFFICE_BODY:
        context = new XMLBodyContext(importer, uri, localName, qName, target);
        break;
      default:
        context =  new GeneralContext(importer, uri, localName, qName, target);
    }
    return context;
  }
  
}
class XMLFontStylesContext extends GeneralContext{

  public XMLFontStylesContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    return new FontFaceContext(getImporter(), uri, localName, qName, getTarget());
  }
  
}
class XMLBodyContext extends GeneralContext{

  public XMLBodyContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    GeneralContext context = null;
    XMLImport importer = getImporter();
    Object target = getTarget();
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case SPREADSHEET:
        context = new XMLSpreadsheetContext(importer, uri, localName, qName, target);
        break;
      default:
        context =  new GeneralContext(importer, uri, localName, qName, target);
    }
    return context;
  }
}
class XMLSpreadsheetContext extends GeneralContext{

  public XMLSpreadsheetContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    GeneralContext context = null;
    XMLImport importer = getImporter();
    Object target = getTarget();
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case TABLE_TABLE:
        context = new TableTableContext(importer, uri, localName, qName, target);
        break;
      case TABLE_NAMED_EXPRESSIONS:
        context = new NamedExpressionsContext(importer, uri, localName, qName, target);
        break;
      case TABLE_TABLE_DATABASE_RANGES:
          context = new TableDataRangesContext(importer, uri, localName, qName, target);
          break;
      case TABLE_CONTENT_VALIDATIONS:
    	  context = new TableContentValidationsContext(importer, uri, localName, qName, target);
    	  break;
      case TABLE_CALCULATION_SETTINGS:
    	  context = new TableCalculationSettingsContext(importer, uri, localName, qName, target);
    	  break;
      default:
        context =  new GeneralContext(importer, uri, localName, qName, target);
    }
    return context;
  }
}