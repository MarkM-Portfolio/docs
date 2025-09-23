/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation;

import java.awt.Dimension;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.metadata.IIOMetadata;
import javax.imageio.stream.FileImageInputStream;
import javax.imageio.stream.ImageInputStream;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Attr;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;

public class ODPClipConvertUtil
{

  private static final String CLASS = ODPClipConvertUtil.class.getName();

  private static final int PIXELS_PER_INCH_THRESHHOLD = 500;

  private static final String PALETE_ELEMENT = "PLTE";

  @SuppressWarnings("unused")
  private static final Logger log = Logger.getLogger(CLASS);

  /**
   * isImageClipped checks to see if there is a draw:style-name attribute. If not, returns false. Otherwise will call getClipSettings to see
   * if the clip attribute is specified.
   */
  @SuppressWarnings("restriction")
  public static boolean isImageClipped(ConversionContext context, OdfElement drawFrame)
  {
    // Extract the graphic style from the drawFrame
    String styleName = drawFrame.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
    if (styleName.length() == 0)
      return false; // No graphics style
    return getClipSettings(context, styleName);
  }

  /**
   * getClipInfo gets the "bread crumbs" from the drawFrame element
   */
  public static HashMap<String, String> getClipInfo(Element drawFrameHtml)
  {
    String clipInfo = drawFrameHtml.getAttribute(ODPConvertConstants.CLIP_INFO_ATTRIBUTE);
    String[] ciAttrs = clipInfo.split(ODPConvertConstants.SYMBOL_SEMICOLON);
    HashMap<String, String> clipInfoMap = new HashMap<String, String>();
    for (int i = 0; i < ciAttrs.length; i++)
    {
      String[] attr = ciAttrs[i].split(ODPConvertConstants.SYMBOL_COLON);
      clipInfoMap.put(attr[0], attr[1]);
    }
    return clipInfoMap;
  }

  /**
   * getClipSettings returns true it the element is clipped. If the element is clipped, call putClipValues in context.
   */
  @SuppressWarnings("restriction")
  private static boolean getClipSettings(ConversionContext context, String styleName)
  {
    boolean inStyleProcessing = false;
    Object tmp = context.get(ODPConvertConstants.CONTEXT_IN_STYLE);
    if (tmp != null)
    {
      inStyleProcessing = (Boolean) tmp;
    }
    List<Node> styleL = null;
    if (inStyleProcessing)
    {
      styleL = ODPConvertStyleMappingUtil.getStyleNameInStyleNodesByKey(context, styleName);
    }
    else
    {
      styleL = ODPConvertStyleMappingUtil.getStyleNameInContentNodesByKey(context, styleName);
    }
    if (null != styleL)
    {
      OdfElement style = (OdfElement) styleL.get(0);
      NodeList graphicProperties = style.getElementsByTagName(ODPConvertConstants.ODF_STYLE_GRAPHIC_PROP);
      for (int i = 0; i < graphicProperties.getLength(); i++)
      {
        Node grPropNode = graphicProperties.item(i);
        if (grPropNode instanceof OdfElement)
        {
          OdfElement grPropElement = (OdfElement) grPropNode;
          Attr attr = grPropElement.getAttributeNode(ODPConvertConstants.ODF_ATTR_FO_CLIP);
          if (null == attr)
            continue;
          return putClipValuesInContext(context, attr.getValue());
        }
      }
    }
    return false;
  }

  /**
   * putClipValuesInContext puts the clip values into the style. Will always return true... except if the clip values is (0,0,0,0)
   * 
   * @param context
   * @param clipValues
   * @return
   */
  private static boolean putClipValuesInContext(ConversionContext context, String clipValues)
  {
    // rect(0cm, 1.6cm, 0cm, 1.6cm)
    String tempStr = clipValues.substring("rect(".length()); // remove "rect("
    tempStr = tempStr.substring(0, tempStr.length() - 1); // remove the trailing ")"
    // Appears ODP 1.1 used spaces instead of comma as a delimeter
    String[] clipVals;
    if (tempStr.contains(","))
      clipVals = tempStr.split(",");
    else
      clipVals = tempStr.split(ODPConvertConstants.SYMBOL_WHITESPACE);
    String sTop = clipVals[0].trim();
    String sRight = clipVals[1].trim();
    String sBottom = clipVals[2].trim();
    String sLeft = clipVals[3].trim();
    // Check to see if the image was clipped, ie clip attribute might be rect(0cm, 0cm, 0cm, 0cm)
    double dTop = UnitUtil.extractNumber(sTop);
    double dRight = UnitUtil.extractNumber(sRight);
    double dBottom = UnitUtil.extractNumber(sBottom);
    double dLeft = UnitUtil.extractNumber(sLeft);

    // If we have nothing to clip, return
    if (Double.compare(dTop + dRight + dBottom + dLeft, 0.0) <= 0.0)
      return false;
    context.put(ODPConvertConstants.CLIP_TOP, sTop);
    context.put(ODPConvertConstants.CLIP_RIGHT, sRight);
    context.put(ODPConvertConstants.CLIP_BOTTOM, sBottom);
    context.put(ODPConvertConstants.CLIP_LEFT, sLeft);
    return true;
  }

  public static HashMap<String, String> getInLineStyleMap(Element drawFrameHtml)
  {
    HashMap<String, String> styleInfoMap = new HashMap<String, String>();
    String styleInfo = drawFrameHtml.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    if (styleInfo != null && styleInfo.length() > 0)
    {
      String[] styles = styleInfo.split(ODPConvertConstants.SYMBOL_SEMICOLON);
      for (int i = 0; i < styles.length; i++)
      {
        String[] attr = styles[i].split(ODPConvertConstants.SYMBOL_COLON);
        styleInfoMap.put(attr[0].trim(), attr[1].trim());
      }
    }
    return styleInfoMap;
  }

  public static String getStyleString(HashMap<String, String> styleInfoMap)
  {
    String newStyle = "";
    Iterator<Map.Entry<String, String>> entries = styleInfoMap.entrySet().iterator();
    while (entries.hasNext())
    {
      Map.Entry<String, String> entry = entries.next();
      newStyle += entry.getKey() + ODPConvertConstants.SYMBOL_COLON + entry.getValue() + ODPConvertConstants.SYMBOL_SEMICOLON;
    }
    return newStyle;
  }

  public static double roundIt1000th(double x)
  {
    return ((int) ((x * 1000) + 0.5)) / 1000;
  }

  @SuppressWarnings("restriction")
  public static final String convertWidthUnitsToPT(OdfElement drawFrame)
  {
    String width = drawFrame.getAttribute(ODFConstants.SVG_WIDTH);
    return convertUnitToPT(width);
  }

  @SuppressWarnings("restriction")
  public static final String convertHeightUnitsToPT(OdfElement drawFrame)
  {
    String height = drawFrame.getAttribute(ODFConstants.SVG_HEIGHT);
    return convertUnitToPT(height);
  }

  public static final String convertUnitToPT(String sWidth)
  {
    String value = ConvertUtil.convertUnitToPT(sWidth);
    value = value.substring(0, value.length() - 2);
    return value;
  }

  public static Dimension getImageDimension(String path)
  {
    Dimension result = null;
    String suffix = getFileSuffix(path);
    Iterator<ImageReader> iter = ImageIO.getImageReadersBySuffix(suffix);
    if (iter.hasNext())
    {
      ImageReader reader = iter.next();
      try
      {
        ImageInputStream stream = new FileImageInputStream(new File(path));
        reader.setInput(stream);
        int width = reader.getWidth(reader.getMinIndex());
        int height = reader.getHeight(reader.getMinIndex());
        result = new Dimension(width, height);
      }
      catch (IOException e)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".getImageDimension");
        ODPCommonUtil.logException(Level.WARNING, message, e);
      }
      finally
      {
        reader.dispose();
      }
    }
    else
    {
      ODPCommonUtil.logMessage(Level.WARNING, ODPCommonUtil.createMessage(ODPCommonUtil.LOG_NO_READER, suffix));
    }
    return result;
  }

  public static Dimension getDPI(String path, Dimension dim)
  {
    String suffix = getFileSuffix(path);
    // Gif images do not contain info to collect DPI information
    if (suffix.equalsIgnoreCase(ODPConvertConstants.FILE_GIF) || suffix.equalsIgnoreCase(ODPConvertConstants.FILE_BMP))
      return null;

    Iterator<ImageReader> iter = ImageIO.getImageReadersBySuffix(suffix);
    if (iter.hasNext())
    {
      ImageReader reader = iter.next();
      try
      {
        ImageInputStream stream = new FileImageInputStream(new File(path));
        reader.setInput(stream);
        IIOMetadata iio = reader.getImageMetadata(0);
        String[] names = iio.getMetadataFormatNames();
        HashMap<String, String> idMap = new HashMap<String, String>();
        int length = names.length;
        int xDPI, yDPI;
        for (int i = 0; i < length; i++)
        {
          inspectMetadata(iio.getAsTree(names[i]), idMap);
        }
        // if idMap == 3, we have xPixels, yPixels and the unit
        if (idMap.size() >= 2)
        {
          int xPixels = Integer.parseInt(idMap.get(ODPConvertConstants.CLIP_PIXELS_PER_UNIT_X_AXIS));
          int yPixels = Integer.parseInt(idMap.get(ODPConvertConstants.CLIP_PIXELS_PER_UNIT_Y_AXIS));
          suffix = suffix.toLowerCase();
          if (suffix.equals(ODPConvertConstants.FILE_JPG))
          {
            xDPI = yDPI = 96; // Default DPI 96 DPI
            String resUnits = (String) idMap.get(ODPConvertConstants.CLIP_UNIT_RESUNITS);
            if (resUnits == null || resUnits.length() == 0 || resUnits.equals("0"))
            {
              xDPI = yDPI = 96; // Use the default
            }
            else if (resUnits.equals("1")) // JPEG unit is dots per inch
            {
              xDPI = xPixels;
              yDPI = yPixels;
            }
            else if (resUnits.equals("2")) // JPEG unit is dots per centimeter
            {
              xDPI = (int) (.5 + xPixels / ODPConvertConstants.CM_TO_INCH_CONV);
              yDPI = (int) (.5 + yPixels / ODPConvertConstants.CM_TO_INCH_CONV);
            }
            Dimension d = new Dimension();
            d.width = xDPI;
            d.height = yDPI;
            return d;
          }
          else if (suffix.equals(ODPConvertConstants.FILE_PNG))
          {
            String unit = idMap.get(ODPConvertConstants.CLIP_UNIT_SPECIFIER);
            // Sometimes the unit is not specified in the PNG file, which in the past has meant meters.
            // However some PNG files have a really small "pixels per axis" values where defaulting to
            // meters just doesn't make sense. In this case, if the pixels are less than PIXELS_PER_INCH_THRESHHOLD,
            // we will assume inches.
            if (unit.equalsIgnoreCase(ODPConvertConstants.CLIP_UNIT_INCH)
                || (xPixels < PIXELS_PER_INCH_THRESHHOLD || yPixels < PIXELS_PER_INCH_THRESHHOLD))
            {
              xDPI = xPixels;
              yDPI = yPixels;
            }
            else
            // assume meter
            {
              xDPI = (int) (.5 + xPixels / 100 * ODPConvertConstants.CM_TO_INCH_CONV);
              yDPI = (int) (.5 + yPixels / 100 * ODPConvertConstants.CM_TO_INCH_CONV);
            }
            Dimension d = new Dimension();
            d.width = xDPI;
            d.height = yDPI;
            return d;
          }
        }
      }
      catch (IOException e)
      {
        // NOTE: There currently is a SUN JRE bug that causes some JPEG files to not load it's metadata successfully. Log a different
        // message in that case
        if (suffix.equals(ODPConvertConstants.FILE_JPG) || suffix.equals(ODPConvertConstants.FILE_JPEG))
        {
          String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_JPG_DPI, path);
          ODPCommonUtil.logMessage(Level.WARNING, message);
        }
        else
        {
          String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN,
              CLASS + ".getDPI: " + e.getLocalizedMessage());
          ODPCommonUtil.logException(Level.WARNING, message, e);
        }
      }
      finally
      {
        reader.dispose();
      }
    }
    else
    {
      ODPCommonUtil.logMessage(Level.WARNING, ODPCommonUtil.createMessage(ODPCommonUtil.LOG_NO_READER, suffix));
    }
    return null;
  }

  private static void inspectMetadata(Node node, HashMap<String, String> idMap)
  {
    if (!idMap.isEmpty())
      return;

    NamedNodeMap map = node.getAttributes();
    if (map != null)
    {
      // set attribute values
      int length = map.getLength();
      for (int i = 0; i < length; i++)
      {
        Node attr = map.item(i);
        if (attr.getNodeName().equalsIgnoreCase(ODPConvertConstants.CLIP_PIXELS_PER_UNIT_X_AXIS))
          idMap.put(attr.getNodeName(), attr.getNodeValue());
        if (attr.getNodeName().equalsIgnoreCase(ODPConvertConstants.CLIP_X_DENSITY))
        {
          idMap.put(ODPConvertConstants.CLIP_PIXELS_PER_UNIT_X_AXIS, attr.getNodeValue());
        }
        if (attr.getNodeName().equalsIgnoreCase(ODPConvertConstants.CLIP_PIXELS_PER_UNIT_Y_AXIS))
          idMap.put(attr.getNodeName(), attr.getNodeValue());
        if (attr.getNodeName().equalsIgnoreCase(ODPConvertConstants.CLIP_Y_DENSITY))
        {
          idMap.put(ODPConvertConstants.CLIP_PIXELS_PER_UNIT_Y_AXIS, attr.getNodeValue());
        }
        if (attr.getNodeName().equalsIgnoreCase(ODPConvertConstants.CLIP_UNIT_SPECIFIER))
          idMap.put(attr.getNodeName(), attr.getNodeValue());
        if (attr.getNodeName().equalsIgnoreCase(ODPConvertConstants.CLIP_UNIT_RESUNITS))
          idMap.put(attr.getNodeName(), attr.getNodeValue());
      }
    }

    Node child = node.getFirstChild();
    if (child == null)
    {
      return;
    }

    while (child != null && idMap.isEmpty())
    {
      String childNodeName = child.getNodeName();
      if ((!childNodeName.equals(PALETE_ELEMENT)) && (!childNodeName.equals("PALETE_ENTRY_ELEMENT")))
        inspectMetadata(child, idMap);
      child = child.getNextSibling();
    }
  }

  private static String getFileSuffix(String path)
  {
    String result = null;
    result = "";
    if (path.lastIndexOf('.') != -1)
      result = path.substring(path.lastIndexOf('.') + 1);
    return result;
  }
}
