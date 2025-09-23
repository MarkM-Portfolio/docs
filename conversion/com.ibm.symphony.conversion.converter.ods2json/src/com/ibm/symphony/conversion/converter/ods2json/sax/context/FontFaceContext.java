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

import java.util.Map;

import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class FontFaceContext extends GeneralContext
{

  public FontFaceContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
//    ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
//    if(document == null)
//      mbInvalid = true;
//    else
//      mbInvalid = false;
  }

  public void startElement(AttributesImpl attributes)
  {
//    if(mbInvalid)
//      return;
    super.startElement(attributes);
    ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
    if(document == null)
      return;
    Map<String, String> fontMap = document.fontMap;

    String fontFamily = this.getAttrValue("svg:font-family");
    if (fontFamily.matches("^'.*'$"))
      fontFamily = fontFamily.substring(1, fontFamily.length() - 1);

    String fontName = this.getAttrValue("style:name");
    fontMap.put(fontName, fontFamily);
  }
}
