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
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.ChartPlotAreaContext;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.GeneralContext;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.OfficeAutomaticStylesContext;

public class ChartXMLImport extends XMLImport
{

  public ChartXMLImport(Node rootNode)
  {
    super(rootNode);
  }
  
  public GeneralContext createContext(String uri, String localName, String qName, Object target)
  {
    GeneralContext context = null;
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case DOCUMENT_CONTENT:
      case DOCUMENT_STYLES:
        context = new XMLChartDocContext(this, uri, localName, qName, target);
        break;
      default:
        context = new GeneralContext(this, uri, localName, qName, target);
    }
    return context;
  }

}

class XMLChartDocContext extends GeneralContext{

  public XMLChartDocContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
    // TODO Auto-generated constructor stub
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    GeneralContext context = null;
    XMLImport importer = getImporter();
    Object target = getTarget();
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case AUTOMATIC_STYLES:
        context = new OfficeAutomaticStylesContext(importer, uri, localName, qName, target);
        break;
      case OFFICE_BODY:
        context = new XMLChartBodyContext(importer, uri, localName, qName, target);
        break;
      default:
        context =  new GeneralContext(importer, uri, localName, qName, target);
    }
    return context;
  }
  
}
class XMLChartBodyContext extends GeneralContext{

  public XMLChartBodyContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    GeneralContext context = null;
    XMLImport importer = getImporter();
    Object target = getTarget();
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case OFFICE_CHART:
        context = new XMLChartContext(importer, uri, localName, qName, target);
        break;
      default:
        context =  new GeneralContext(importer, uri, localName, qName, target);
    }
    return context;
  }
}
class XMLChartContext extends GeneralContext{

  public XMLChartContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    GeneralContext context = null;
    XMLImport importer = getImporter();
    Object target = getTarget();
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case CHART_CHART:
        context = new ChartChartContext(importer, uri, localName, qName, target);
        break;
      default:
        context =  new GeneralContext(importer, uri, localName, qName, target);
    }
    return context;
  }
}

class ChartChartContext extends GeneralContext{

  public ChartChartContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    GeneralContext context = null;
    XMLImport importer = getImporter();
    Object target = getTarget();
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case CHART_PLOT_AREA:
        context = new ChartPlotAreaContext(importer, uri, localName, qName, target);
        break;
      default:
        context =  new GeneralContext(importer, uri, localName, qName, target);
    }
    return context;
  }
}