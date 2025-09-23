/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.style;

import java.util.Iterator;
import java.util.List;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeFontFaceDecls;
import org.odftoolkit.odfdom.dom.element.style.StyleFontFaceElement;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

public class FontfaceConvertor
{
  public void convertFontFaceDecls(ConversionContext context, List<String> fontNameList) throws Exception
  {
    OdfOfficeFontFaceDecls decl = createFontFaceDecls(context);
    for(Iterator<String> fontNameIte= fontNameList.iterator(); fontNameIte.hasNext();){
      String fontName = fontNameIte.next();
      FontFaceDecls sdecl = new FontFaceDecls();
      sdecl.styleName = fontName;
      sdecl.svgFontFamily = fontName;
      convertFontFace( sdecl, decl);
    }
  }

  
  class FontFaceDecls
  {
    String styleName = "";
    String svgFontFamily = "";
    String styleFontFamilyGeneric = "";
    String styleFontPitch = "";
  }
  
  private OdfOfficeFontFaceDecls createFontFaceDecls(ConversionContext context)
  {
    OdfSpreadsheetDocument odfDoc = (OdfSpreadsheetDocument) context.get("Document");
    OdfFileDom contentDom = null;
    OdfElement odfContent = null;
    OdfOfficeFontFaceDecls decl = null;
    try
    {
      contentDom = (OdfFileDom) context.get("Target");
      odfContent = contentDom.getRootElement();
      NodeList decls = odfContent.getElementsByTagNameNS((String) ConvertUtil.getNamespaceMap().get(ConversionConstant.OFFICE),
          ConversionConstant.FONT_FACE_DECLS);
      if (decls.getLength() == 0)
      {
        decl = new OdfOfficeFontFaceDecls(contentDom);
        odfContent.appendChild(decl);
      }
      else
      {
        decl = (OdfOfficeFontFaceDecls) decls.item(0);
      }      
    }
    catch (Exception e)
    {
    }
    return decl;
  }
  
  private void convertFontFace(FontFaceDecls sdecl,OdfOfficeFontFaceDecls decl)
      {
        StyleFontFaceElement sffe = null;
        boolean isExisted = false;
        NodeList children = decl.getChildNodes();
        for (int i = 0; i < children.getLength(); i++)
        {
          sffe = (StyleFontFaceElement) children.item(i);
          if (sdecl.styleName.equalsIgnoreCase(sffe.getStyleNameAttribute()) && sdecl.svgFontFamily.equalsIgnoreCase(sffe.getSvgFontFamilyAttribute())
              && sdecl.styleFontFamilyGeneric.equalsIgnoreCase(sffe.getStyleFontFamilyGenericAttribute())
              && sdecl.styleFontPitch.equalsIgnoreCase(sffe.getStyleFontPitchAttribute()))
          {
            isExisted = true;
            break;
          }
        }
        if (!isExisted)
        {
          sffe = decl.newStyleFontFaceElement(sdecl.styleName);
          sffe.setSvgFontFamilyAttribute(sdecl.svgFontFamily);
          //sffe.setStyleFontFamilyGenericAttribute(styleFontFamilyGeneric);
          //sffe.setStyleFontPitchAttribute(styleFontPitch);
        }
      }
}
