/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.css;

import java.util.HashMap;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.IConvertorFactory;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class CSSConvertorFactory implements IConvertorFactory
{
  private static CSSConvertorFactory instance = new CSSConvertorFactory();

  private static IConvertor GERERAL_CSS_CONVERTOR = new GeneralCSSConvertor();

  private static Map<String, IConvertor> convertorMap;
  static
  {
    convertorMap = new HashMap<String, IConvertor>();
    convertorMap.put(ODFConstants.STYLE_TEXT_PROPERTIES, new TextPropertiesConvertor());
    convertorMap.put(ODFConstants.TEXT_LIST_LEVEL_STYLE_BULLET, new ListLevelStyleBulletConvertor());
    convertorMap.put(ODFConstants.TEXT_LIST_LEVEL_STYLE_IMAGE, new ListLevelStyleImageConvertor());
    convertorMap.put(ODFConstants.TEXT_LIST_LEVEL_STYLE_NUMBER, new ListLevelStyleNumberConvertor());
    convertorMap.put(ODFConstants.STYLE_LIST_LEVEL_LABEL_ALIGNMENT, new ListLevelLabelAlignmentConvertor());
    convertorMap.put(ODFConstants.STYLE_LIST_LEVEL_PROPERTIES, new ListLevelProperties());

    convertorMap.put(ODFConstants.TEXT_OUTLINE_LEVEL_STYLE, new TextOutlineLevelStyleConvertor());
    IConvertor listStyleConvertor = new TextListStyleConvertor();
    convertorMap.put(ODFConstants.TEXT_LIST_STYLE, listStyleConvertor);
    convertorMap.put(ODFConstants.TEXT_OUTLINE_STYLE, listStyleConvertor);
    convertorMap.put(ODFConstants.STYLE_PARAGRAPH_PROPERTIES, new ParagraphPropertiesConvertor());
    convertorMap.put(ODFConstants.STYLE_FONT_FACE, new FontFaceConvertor());
    convertorMap.put(ODFConstants.STYLE_TABLE_PROPERTIES, new TablePropertiesConvertor());
    convertorMap.put(ODFConstants.STYLE_TABLE_CELL_PROPERTIES, new TableCellPropertiesConvertor());    
    convertorMap.put(ODFConstants.STYLE_PAGE_LAYOUT_PROPERTIES, new PageLayoutPropertiesConvertor());
    convertorMap.put(ODFConstants.STYLE_GRAPHIC_PROPERTIES, new GraphicPropertiesConvertor());
    convertorMap.put(ODFConstants.STYLE_SECTION_PROPERTIES, new SectionPropertiesConvertor());
  }

  public static IConvertorFactory getInstance()
  {
    return instance;
  }

  public IConvertor getConvertor(Object input)
  {
    OdfElement element = (OdfElement) input;
    IConvertor convertor = convertorMap.get(element.getNodeName());
    if (convertor == null)
      convertor = GERERAL_CSS_CONVERTOR;
    return convertor;
  }
}
