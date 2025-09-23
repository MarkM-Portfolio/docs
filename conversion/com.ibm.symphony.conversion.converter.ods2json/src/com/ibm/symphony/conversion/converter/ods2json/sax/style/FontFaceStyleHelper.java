/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.style;

import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.office.OfficeFontFaceDeclsElement;
import org.odftoolkit.odfdom.dom.element.style.StyleFontFaceElement;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class FontFaceStyleHelper
{
  private static final String CLAZZ = FontFaceStyleHelper.class.getName();
  private static final Logger LOG = Logger.getLogger(FontFaceStyleHelper.class.getName());
  
  public void convert(OdfFileDom styleDom, ConversionContext context)
  {
    LOG.entering(CLAZZ, "convert");
    try{
      if(styleDom == null)
        return;
      ConversionUtil.Document document = (ConversionUtil.Document) context.get("Target");
      if(document == null)
        return;
      Map<String, String> fontMap = document.fontMap;
      OfficeFontFaceDeclsElement decls = (OfficeFontFaceDeclsElement)styleDom.getElementsByTagName("office:font-face-decls").item(0);
      NodeList childs = decls.getChildNodes();
      int length = childs.getLength();
      for(int i=0; i<length; i++){
        Node decl = childs.item(i);
        if(decl instanceof StyleFontFaceElement){
          StyleFontFaceElement sffe = (StyleFontFaceElement) decl; 
          String fontFamily = sffe.getSvgFontFamilyAttribute();
          if (fontFamily.matches("^'.*'$"))
            fontFamily = fontFamily.substring(1, fontFamily.length() - 1);
          String fontName = sffe.getStyleNameAttribute();
          fontMap.put(fontName, fontFamily);
        }
      }
    }catch (Exception e) {
      LOG.log(Level.WARNING,"Convert font style failed", e);
    }
    LOG.exiting(CLAZZ, "convert");
  }
}
