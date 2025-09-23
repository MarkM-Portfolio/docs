/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.content;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.IConvertorFactory;

public class HtmlContentConvertorFactory implements IConvertorFactory
{
  private static final String CLASS = HtmlContentConvertorFactory.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static HtmlContentConvertorFactory instance = new HtmlContentConvertorFactory();

  private static final IConvertor GENERAL_CONVERTOR = new GeneralContentHtmlConvertor();

  // Default Initial Capacity for the Convertor HashMap
  private static final int CONVERTOR_MAP_CAPACITY = (int) (40 * 1.33) + 1;

  private static Map<String, IConvertor> convertorMap = new HashMap<String, IConvertor>(CONVERTOR_MAP_CAPACITY);
  static
  {
    // Add Convertors here - If adding, please update the initial capacity
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_PRESENTATION, new PresentationElementConvertor());

    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWFRAME, new DrawFrameElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWPAGE, new DrawPageElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLETABLE, new TableTableElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLECONVEREDTABLE_CELL, new TableTableCellElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_CELL, new TableTableCellElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_ROW, new TableRowOrColumnElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_COLUMN, new TableColumnElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXTLIST, new TextListElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXTLIST_HEADER, new TextListChildElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXTLIST_ITEM, new TextListChildElementConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_TEXT_PARAGRAPH, new TextParagraphElementConvertor());

    convertorMap.put(ODPConvertConstants.ODF_STYLE_MASTER, new MasterStylesConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_MASTER_PAGE, new StyleMasterPageElementConvertor());

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

    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWG, new DrawGConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWIMAGE, new DrawImageElementConvertor());

    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_SVGTITLE, new SVGTitleDescConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_SVGDESC, new SVGTitleDescConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_PRESENTATIONNOTES, new PresentationNotesConvertor());

    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_OFFICEFORMS, new PreserveOnlyConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWCONTROL, new PreserveOnlyConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWCAPTION, new PreserveOnlyConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_ANIMPAR, new PreserveOnlyConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWOBJECT, new DrawObjectConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWOBJECTOLE, new PreserveOnlyConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DR3DSCENE, new PreserveOnlyConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWENHANCEDGEOMETRY, new PreserveOnlyConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_DRAWGLUEPOINT, new PreserveOnlyConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ELEMENT_OFFICEEVENTLISTENERS, new PreserveOnlyConvertor());
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
      convertor = GENERAL_CONVERTOR;
      if (ODPConvertConstants.DEBUG)
      {
        log.info("No specific convertor defined for " + nodeName + ", defaulting to " + GENERAL_CONVERTOR.getClass().getName());
      }
    }
    return convertor;
  }
}
