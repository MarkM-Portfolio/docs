/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.content;

import java.util.HashMap;
import java.util.Map;

import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.IConvertorFactory;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;

public class ODPConvertFactory implements IConvertorFactory
{

  private static ODPConvertFactory instance = new ODPConvertFactory();

  private static IConvertor GENERAL_ODP_CONVERTOR = new GeneralODPConvertor();

  enum HTML_ELEMENT_BY_NAME {
    IMG, NOT_INCLUDED;

    public static HTML_ELEMENT_BY_NAME toEnum(String str)
    {
      try
      {
        return valueOf(str.toUpperCase());
      }
      catch (Exception ex)
      {
        return NOT_INCLUDED;
      }
    }
  };

  // Default Initial Capacity for the Convertor HashMap
  private static final int CONVERTOR_MAP_CAPACITY = (int) (25 * 1.33) + 1;

  private static Map<String, IConvertor> convertorMap;
  static
  {
    // Add Convertors here - If adding, please update the initial capacity
    convertorMap = new HashMap<String, IConvertor>(CONVERTOR_MAP_CAPACITY);

    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWPAGE, new DrawPageConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWFRAME, new DrawFrameConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_OFFICE_BODY, new OfficeBodyConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAW_IMG, new DrawImageConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLETABLE, new TableConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_ROW, new TableRowConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_CELL, new TableCellConvertor());

    // for shapes.
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWCIRCLE, new DrawEllipseFrameConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWCUSTOMSHAPE, new DrawShapeFrameConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWELLIPSE, new DrawEllipseFrameConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWRECT, new DrawRectFrameConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWPATH, new DrawPathFrameConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWPOLYLINE, new DrawPolyFrameConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWPOLYGON, new DrawPolyFrameConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWMEASURE, new DrawMeasureFrameConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWREGULARPOLYGON, new DrawPolyFrameConvertor());

    // for line and connectors.
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWLINE, new DrawLineFrameConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWCONNECTOR, new DrawConnectorFrameConvertor());

    // temporarily, the draw:text-box may just need general convertor.
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAW_TEXTBOX, new DrawTextBoxConvertor());

    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXT_PARAGRAPH, new TextParagraphConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXTSPAN, new TextSpanConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXT_LINE_BREAK, new TextLineBreakConvertor());

    // For lists.
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXTLIST, new ListConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXTLIST_ITEM, new ListItemConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXTLIST_HEADER, new ListItemConvertor());

    // for hyperlinks
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXT_A, new HyperlinkConvertor());
  }

  public static IConvertorFactory getInstance()
  {
    return instance;
  }

  public IConvertor getConvertor(Object input)
  {

    Element element = (Element) input;
    String nodeName = null;

    nodeName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_HTML).get(element.getNodeName());
    if (nodeName == null)
    {
      String elementClass = element.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      nodeName = ContentConvertUtil.getNodeNameByClass(elementClass);
    }
    else if (nodeName.equals(ODPConvertConstants.ODF_ELEMENT_TEXTSPAN))
    {
      // Special case logic needed for LIST<->SPAN
      String elementClass = element.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      if (elementClass != null && elementClass.contains(ODPConvertConstants.HTML_CLASS_TEXT_LIST))
      {
        nodeName = ContentConvertUtil.getNodeNameByClass(elementClass);
      }
    }

    IConvertor convertor = convertorMap.get(nodeName);

    if (convertor == null)
      convertor = GENERAL_ODP_CONVERTOR;

    return convertor;
  }

}
