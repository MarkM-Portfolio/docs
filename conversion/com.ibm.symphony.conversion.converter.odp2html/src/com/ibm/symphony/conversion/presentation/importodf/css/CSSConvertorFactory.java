/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.css;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.IConvertorFactory;

public class CSSConvertorFactory implements IConvertorFactory
{
  private static final String CLASS = CSSConvertorFactory.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static CSSConvertorFactory instance = new CSSConvertorFactory();

  private static IConvertor GENERAL_CSS_CONVERTOR = new ODFStyleElementConvertor();

  // Default Initial Capacity for the Convertor HashMap
  private static final int CONVERTOR_MAP_CAPACITY = (int) (10 * 1.33) + 1;

  private static Map<String, IConvertor> convertorMap;
  static
  {
    convertorMap = new HashMap<String, IConvertor>(CONVERTOR_MAP_CAPACITY);

    // Add Convertors here - If adding, please update the initial capacity
    convertorMap.put(ODPConvertConstants.ODF_STYLE_DOCUMENT, new GeneralCSSConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_MASTER, new GeneralCSSConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_COMMON, new CommonStyleContainerConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_AUTO, new AutoMaticStyleContainerConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_TEXTLIST_BULLET_STYLE, new TextListLevelStyleConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_TEXTLIST_IMAGE_STYLE, new TextListLevelStyleConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_TEXTLIST_NUMBER_STYLE, new TextListLevelStyleConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_PARAGRAPH_PROPERTIES, new ParagraphPropertiesConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_TEXT_LIST, new TextListStyleConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_TABLE_TEMPLATE, new TableTemplateConvertor());
  }

  public static IConvertorFactory getInstance()
  {
    return instance;
  }

  public IConvertor getConvertor(Object input)
  {
    Node element = (Node) input;
    if (element == null)
    {
      return null;
    }
    String nodeName = element.getNodeName();
    IConvertor convertor = convertorMap.get(nodeName);
    if (convertor == null)
    {
      convertor = GENERAL_CSS_CONVERTOR;
      if (ODPConvertConstants.DEBUG)
      {
        log.info("No specific convertor defined for " + nodeName + ", defaulting to " + GENERAL_CSS_CONVERTOR.getClass().getName());
      }
    }
    return convertor;
  }
}
