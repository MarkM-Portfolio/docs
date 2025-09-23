/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html.upgrade;

import java.util.HashMap;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.IConvertorFactory;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class HtmlUpgradeConvertorFactory implements IConvertorFactory
{

  private static HtmlUpgradeConvertorFactory instance = new HtmlUpgradeConvertorFactory();

  private static final IConvertor GENERAL_CONVERTOR = new SkipElementConvertor();

  private static Map<String, IConvertor> convertorMap = new HashMap<String, IConvertor>();
  static
  {
    convertorMap.put("CONVERT_CHILD", new SkipElementConvertor());

    convertorMap.put(ODFConstants.DRAW_FRAME, new DrawFrameUpgradeConvertor());
    convertorMap.put(ODFConstants.DRAW_G, new DrawGUpgradeConvertor());

    IConvertor shapeConvertor = new ShapeUpgradeConvertor();
    convertorMap.put(ODFConstants.DRAW_LINE, shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_CONNECTOR, shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_CUSTOMSHAPE, shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_ELLIPSE, shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_MEASURE, shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_RECT, shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_PATH, shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_POLYGON, shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_POLYLINE, shapeConvertor);
    convertorMap.put(ODFConstants.DRAW_REGULAR_POLYGON, shapeConvertor);
    convertorMap.put(ODFConstants.DR3D_SCENE, shapeConvertor);
  }

  public static IConvertorFactory getInstance()
  {
    return instance;
  }

  public IConvertor getConvertor(Object input)
  {
    IConvertor convertor = null;

    if (input instanceof OdfElement)
    {
      OdfElement element = (OdfElement) input;
      convertor = convertorMap.get(element.getNodeName());
    }
    else
    {
      convertor = convertorMap.get(input);
    }
    if (convertor == null)
      convertor = GENERAL_CONVERTOR;

    return convertor;
  }
}
