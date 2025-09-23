/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.style;

//import java.util.Map;
import java.util.logging.Level;

//import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
//import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class GraphicStyleConvertor extends GeneralCSSStyleConvertor
{
  private static final String CLASS = GraphicStyleConvertor.class.getName();

//  private static final Logger log = Logger.getLogger(CLASS);
  
  /**
   * Return the ODFStyleFamily for this convert.  
   * @return OdfStyleFamily of type Graphic
   */
  @Override
  protected OdfStyleFamily getStyleFamily()
  {
    return OdfStyleFamily.Graphic;
  }
  
  @SuppressWarnings("restriction")
  protected void updateStyle(ConversionContext context, String styleName, OdfStyle newStyle, OdfStyle oldStyle, OdfStylableElement stylable, OdfOfficeAutomaticStyles autoStyles)
  {
    try 
    {
      if (newStyle != null && oldStyle != null)
      {
        if (oldStyle.equals(newStyle))
        {
          stylable.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME),
              ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME, styleName);
          return;
        }
      }
      if (newStyle != null)
      {
        OdfStyle existingStyle = getExistingStyle(context, newStyle);
        if (existingStyle != null)
        {
          stylable.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME),
              ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME, existingStyle.getStyleNameAttribute());
          return;
        }
      }
      if (newStyle.hasChildNodes())
      {
        autoStyles.appendChild(newStyle);
        stylable.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME),
            ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME, newStyle.getStyleNameAttribute());        
        addNewStyleToHashMaps(context, newStyle);
      }
      else 
      {
        // setDefaultStyle(stylable); // use parents style
      }      
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".updateStyle");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);
    }
  }
  
}