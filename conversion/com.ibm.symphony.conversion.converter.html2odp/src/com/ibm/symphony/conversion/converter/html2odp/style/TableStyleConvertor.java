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

import java.util.Map;

import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;

import com.ibm.symphony.conversion.converter.html2odp.styleattr.GeneralPropertyConvertor;

public class TableStyleConvertor extends GeneralCSSStyleConvertor
{
  /**
   * Return the ODFStyleFamily for this convert.  
   * @return OdfStyleFamily of type Table
   */
  @Override
  protected OdfStyleFamily getStyleFamily()
  {
    return OdfStyleFamily.Table;
  }
  
  protected String getStyleName(OdfStylableElement stylable,String styleName)
  {
    return  stylable.getStyleName();
  }

  protected String newStyleName(OdfStylableElement stylable, String styleName)
  {
    String newName = stylable.getStyleName(); 
    newName = CSSUtil.getStyleName(getStyleFamily(), newName);
    
    if(newName.length() == 0)
      newName = CSSUtil.getStyleName(getStyleFamily(), "TA");
    
    return newName;
  }
  
  protected void setDefaultStyle(OdfStylableElement stylable)
  {
    return;
  }
 
//  protected Map<String,String> getCSSMap(ConversionContext context, OdfDocument odfDoc,Element htmlElement, OdfStyleFamily odfStyleFamily,String htmlStyle)
//  {
//    Map<String,String> cssMap = HtmlTemplateCSSParser.getTableMergedStyle(context, htmlElement);
//    
//    Object[] keySet = cssMap.keySet().toArray();
//    for(Object key: keySet)
//    {    
//      if(!isSupportedProperty((String)key))
//      {
//        cssMap.remove(key);
//      }            
//    }    
//    return cssMap;
//  }

  protected boolean isSupportedProperty(String htmlCSSProperty)
  {
    Map<String, OdfStyleProperty> familyPropertyMap = GeneralPropertyConvertor.TABLE_STYLE_NAME_PROR_MAP;
        
    String odfName =(String) CSSUtil.getODFName(getStyleFamily(), htmlCSSProperty);
    
    if(familyPropertyMap != null && familyPropertyMap.containsKey(odfName))
      return true;
    
    return false;
  }  

}
