/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.master;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.html.content.DrawGConvertor;
import com.ibm.symphony.conversion.presentation.importodf.html.content.DrawImageElementConvertor;
import com.ibm.symphony.conversion.presentation.importodf.html.content.SVGTitleDescConvertor;
import com.ibm.symphony.conversion.presentation.importodf.html.content.ShapeElementConvertor;
import com.ibm.symphony.conversion.presentation.importodf.html.content.TextListChildElementConvertor;
import com.ibm.symphony.conversion.presentation.importodf.html.content.TextListElementConvertor;
import com.ibm.symphony.conversion.presentation.importodf.html.content.TextParagraphElementConvertor;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.IConvertorFactory;

public class HtmlMasterConvertorFactory implements IConvertorFactory
{
  private static final String CLASS = HtmlMasterConvertorFactory.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static HtmlMasterConvertorFactory instance = new HtmlMasterConvertorFactory();

  private static final IConvertor GENERAL_MASTER_CONVERTOR = new GeneralMasterHtmlConvertor();

  // Default Initial Capacity for the Convertor HashMap
  private static final int CONVERTOR_MAP_CAPACITY = (int) (26 * 1.33) + 1;

  private static Map<String, IConvertor> convertorMap = new HashMap<String, IConvertor>(CONVERTOR_MAP_CAPACITY);
  static
  {
    // Add Convertors here - If adding, please update the initial capacity
    convertorMap.put(ODPConvertConstants.ODF_STYLE_MASTER, new ODFMasterStylesElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_MASTER_PAGE, new MasterPageElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLETABLE, new MasterTableElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_CELL, new MasterTableCellElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_ROW, new MasterTableRowOrColumnElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_COLUMN, new MasterTableRowOrColumnElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWFRAME, new MasterDrawFrameElementConvertor());

    // NOTE: The following are from com.ibm.symphony.conversion.presentation.importodf.html.content.
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_SVGTITLE, new SVGTitleDescConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_SVGDESC, new SVGTitleDescConvertor());

    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWG, new DrawGConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWIMAGE, new DrawImageElementConvertor());

    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWLINE, new ShapeElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWRECT, new ShapeElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWCIRCLE, new ShapeElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWELLIPSE, new ShapeElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWCUSTOMSHAPE, new ShapeElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWCONNECTOR, new ShapeElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWPATH, new ShapeElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWPOLYLINE, new ShapeElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWPOLYGON, new ShapeElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWMEASURE, new ShapeElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWREGULARPOLYGON, new ShapeElementConvertor());

    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXTLIST, new TextListElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXTLIST_HEADER, new TextListChildElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXTLIST_ITEM, new TextListChildElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXT_PARAGRAPH, new TextParagraphElementConvertor());
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
      convertor = GENERAL_MASTER_CONVERTOR;
      if (log.isLoggable(Level.FINE))
      {
        log.fine("No specific convertor defined for " + nodeName + ", defaulting to " + GENERAL_MASTER_CONVERTOR.getClass().getName());
      }
    }
    return convertor;
  }
}
