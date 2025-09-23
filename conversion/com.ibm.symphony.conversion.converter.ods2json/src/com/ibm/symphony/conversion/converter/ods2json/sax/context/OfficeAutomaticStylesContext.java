/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.context;


import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.w3c.dom.Element;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.style.FormatStyleHelper;
import com.ibm.symphony.conversion.converter.ods2json.sax.style.TableCellStyleHelper;
import com.ibm.symphony.conversion.converter.ods2json.sax.style.TableColumnStyleHelper;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class OfficeAutomaticStylesContext extends GeneralContext
{
  private static final String CLAZZ = OfficeAutomaticStylesContext.class.getName();
  private static final Logger LOG = Logger.getLogger(CLAZZ);
  Element mElement;
  public OfficeAutomaticStylesContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes)
  {
    return new GeneralDOMContext(mImport, uri, localName, qName, mTarget);
  }
  
  public void startElement(AttributesImpl attributes){
    if (!ConversionUtil.hasValue(mUri) || !ConversionUtil.hasValue(mQName))
      mElement = mImport.getDocument().createElement(mLocalName);
    else
      mElement = mImport.getDocument().createElementNS(mUri, mQName);
    mImport.setCurrentNode(mElement);
  }
  
  public void endElement(){
    //mElement now is the dom tree which contains all the styles
    OdfOfficeAutomaticStyles styles = (OdfOfficeAutomaticStyles)mImport.getCurrentNode();
    mContext.put("autostyles", styles);
    mImport.setCurrentNode(null);
    //only convert style for json model
    ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
    if(document != null){
      new FormatStyleHelper().convert(styles, mContext);
      new TableCellStyleHelper().convert(styles, mContext);
      new TableColumnStyleHelper().convert(styles,mContext);
    }
  }
}
