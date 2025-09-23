/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.shape;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.draw.OdfDrawCustomShape;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.draw.DrawStrokeDashElement;
import org.odftoolkit.odfdom.dom.element.style.StyleGraphicPropertiesElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Attr;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odp.style.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odp.style.GeneralCSSStyleConvertor;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;

/*
 * This convertor is a utility to process IBM Docs Editor converted shapes from SVG format to
 * ODF format.  Currently, the IBM Docs editor supports:
 *
 *      A small gallery of shapes:
 *           - Rectangle
 *           - Ellipse
 *           - Isosceles Triangle
 *           - Diamond
 *           - Hexagon
 *           - Rounded Rectangle
 *           - 5-pointed Star
 *           - Rectangular Callout
 *      The characteristics of these shapes are defined in SvgShapeTemplate.json
 *
 *      A limited set of properties
 *           - Dimensions (X/Y)
 *           - Position (Height/Width)
 *           - Fill Color (None or Solid Color
 *           - Border Type (None, Solid, or Dashed)
 *           - Border Color (None or Color
 *           - Border Width (Thin, Medium, Thick)
 *      Some of these definitions are controlled by definitions in SvgStyleTemplate.json
 *
 * To invoke the Svg to Shape conversion:
 *      Context Inputs:
 *           - Must contain "target" -> an OdfFileDom for the Content DOM
 *           - Must contain "styles_dom" -> an OdfFileDom for the Styles DOM
 *           - Must contain "styles-hashmap" -> a HashMap of Styles keyed by StyleHashKey (Need to check if we can work around this requirement)
 *           - Must contain "style-elements" -> a HashMap of Styles (OdfElement) keyed by Style Name (String)
 *
 *      Usage:
 *           OdfElement dcsElement = null;
 *           String drawType = SvgShapeConvertor.getDrawType(htmlNode);
 *
 *           // Decide whether to create or update an odfElement
 *           HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
 *           if (indexTable.isHtmlNodeIndexed(htmlElement)) {
 *              // Update the IBM Docs SVG Shape
 *              dcsElement = indexTable.getFirstOdfNode(htmlElement);
 *              SvgShapeConvertor.updateShapeFromSvg(context, htmlElement, dcsElement, drawType);
 *
 *              << Caller inserts the ODF Element into the DOM as necessary >>
 *           } else {
 *              // Convert the IBM Docs SVG Shape to an new ODF Shape
 *              dcsElement = SvgShapeConvertor.createShapeFromSvg(context, htmlElement, odfParent, drawType);
 *
 *              << Caller inserts the ODF Element into the DOM as necessary >>
 *           }
 *
 *           // Currently the SvgShapeConvertor does not handle Inline Styles on the draw:frame.
 *           // Once the code to do this can be made standalone, the remaining steps will no longer be needed.
 *           << Caller parses the HTML Inline Styles, setting height/width/x/y/etc. >>
 *           convertor.makeStyleAdjustments(context, dcsElement);
 *
 *      Outputs:
 *           Returns an OdfDrawCustomShapeElement (created or updated)
 *
 */
public class SvgShapeConvertor
{
  private static final String CLASS = SvgShapeConvertor.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  private static final String CONVERTOR = "SvgShapeConvertor";

  private static final Random r = new Random();

  private static final String DEFAULT_BORDER_WIDTH = ".018cm";

  // JSON Configuration --------------------------------------------------------------

  private static final String STYLE_ADJUSTMENTS = "style-adjustments";

  private static final String CHILDREN = "children";

  private static final String BORDER_WIDTH = "border-width";

  private static final String BORDER_DASHED_STYLE = "border-dashed-style";

  private static final String MAP_SVG_SHAPE = "SvgShapeTemplates.json";

  private static JSONObject SVG_SHAPE_MAP_TEMPLATES = null;

  private static final String MAP_SVG_STYLE = "SvgStyleTemplates.json";

  private static JSONObject SVG_STYLE_MAP_TEMPLATES = null;
  static
  {
    InputStream input = null;
    try
    {
      input = SvgShapeConvertor.class.getResourceAsStream(MAP_SVG_SHAPE);
      SVG_SHAPE_MAP_TEMPLATES = JSONObject.parse(input);
      input.close();

      input = SvgShapeConvertor.class.getResourceAsStream(MAP_SVG_STYLE);
      SVG_STYLE_MAP_TEMPLATES = JSONObject.parse(input);
      input.close();
    }
    catch (FileNotFoundException fnfException)
    {
      LOG.logp(Level.SEVERE, CLASS, "Unexpected exception in static initializer", fnfException.getLocalizedMessage(), fnfException);
    }
    catch (IOException ioException)
    {
      LOG.logp(Level.SEVERE, CLASS, "Unexpected exception in static initializer", ioException.getLocalizedMessage(), ioException);
    }
  }

  /*
   * Handles the exporting of Shapes that are defined in SVG format
   *
   * @param context Conversion context
   *
   * @param htmlNode HTML Node that is currently being processed
   *
   * @param odfParent ODF Node that is the parent of the node to be processed
   *
   * @param drawType Draw Type
   *
   * @return OdfElement New draw:custom-shape ODF Element
   */
  @SuppressWarnings({ "restriction" })
  public static OdfElement createShapeFromSvg(ConversionContext context, Element htmlElement, OdfElement odfParent, String drawType)
  {
    String attributeName = null;
    OdfAttribute attribute = null;
    String odfNodeName = null;
    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);

    // Create the draw:custom-shape
    odfNodeName = ODPConvertConstants.ODF_ELEMENT_DRAWCUSTOMSHAPE;
    OdfElement dcsElement = contentDom.createElementNS(getNamespaceUri(odfNodeName), odfNodeName);

    // Set Attributes on the Custom Shape
    attributeName = ODPConvertConstants.ODF_ATTR_DRAW_LAYER;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(ODPConvertConstants.HTML_VALUE_LAYOUT);
    dcsElement.setAttributeNodeNS(attribute);

    // Process the Shape properties
    processShapeProperties(context, contentDom, htmlElement, dcsElement, null);

    // Create the draw:enhanced-geometry
    odfNodeName = ODPConvertConstants.ODF_ELEMENT_DRAWENHANCEDGEOMETRY;
    OdfElement degElement = contentDom.createElementNS(getNamespaceUri(odfNodeName), odfNodeName);
    dcsElement.appendChild(degElement);

    // Add the draw:enhanced-geometry attributes based on Draw Type
    attributeName = ODPConvertConstants.ODF_ATTR_DRAW_TYPE;
    attribute = contentDom.createAttributeNS(attributeName, attributeName);
    attribute.setValue(drawType);
    degElement.setAttributeNodeNS(attribute);

    JSONObject template = getShapeMappingTemplate(drawType);
    if (template != null)
    {
      addAttributeByTemplate(contentDom, degElement, template, ODPConvertConstants.ODF_SVG_ATTR_SVGVIEWBOX);
      addAttributeByTemplate(contentDom, degElement, template, ODPConvertConstants.ODF_ATTR_DRAWENHANCEDPATH);
      addAttributeByTemplate(contentDom, degElement, template, ODPConvertConstants.ODF_ATTR_DRAWTEXTAREAS);
      addAttributeByTemplate(contentDom, degElement, template, ODPConvertConstants.ODF_ATTR_DRAWGLUEPOINTS);
      addAttributeByTemplate(contentDom, degElement, template, ODPConvertConstants.ODF_ATTR_DRAWMODIFIERS);
      addAttributeByTemplate(contentDom, degElement, template, ODPConvertConstants.ODF_ATTR_DRAWPATHSTRETCHPOINTX);
      addAttributeByTemplate(contentDom, degElement, template, ODPConvertConstants.ODF_ATTR_DRAWPATHSTRETCHPOINTY);
      addChildrenByTemplate(contentDom, degElement, template);

      // Update the Context with Style Adjustment information
      updateContextWithStyleAdjustments(context, drawType);
    }
    else
    {
      if (!isImportedShape(htmlElement))
      {
        LOG.warning("Unknown SVG shape draw type: " + drawType);
      }
    }

    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    indexTable.addEntryByHtmlNode(htmlElement, dcsElement);

    return dcsElement;
  }

  /*
   * Handles the updating of Shapes that are defined in SVG format
   *
   * @param context Conversion context
   *
   * @param htmlNode HTML Node that is currently being processed
   *
   * @param dcsElement ODF Node that is to be updated
   *
   * @param drawType Draw Type
   *
   * @return OdfElement Updated draw:custom-shape ODF Element
   */
  public static OdfElement updateShapeFromSvg(ConversionContext context, Element htmlElement, OdfElement dcsElement, String drawType)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);

    // For now, we will just create a new style (assuming the properties changed) and let the normal export process which detects duplicate
    // styles handle if it didn't change
    OdfStyle oldStyle = getOldStyle(context, dcsElement);
    processShapeProperties(context, contentDom, htmlElement, dcsElement, oldStyle);

    // Update the Context with Style Adjustment information
    updateContextWithStyleAdjustments(context, drawType);

    return dcsElement;
  }

  /*
   * Performs any post-processing adjustments to the Shape based on the style and Shape Template
   *
   * @param context Conversion context
   *
   * @param odfElement ODF Node to add the attribute to
   *
   * @return void
   */
  @SuppressWarnings({ "unchecked", "restriction" })
  public static void makeStyleAdjustments(ConversionContext context, OdfElement odfElement)
  {
    JSONObject styleAdjustments = (JSONObject) context.get(ODPConvertConstants.CONTEXT_SVG_STYLE_ADJUSTMENTS);
    if (styleAdjustments != null)
    {
      try
      {
        Set<String> keyList = styleAdjustments.keySet();
        Iterator<String> iterator = keyList.iterator();
        while (iterator.hasNext())
        {
          String key = iterator.next();
          Double adjustment = (Double) styleAdjustments.get(key);
          Measure oldValue = Measure.parseNumber(odfElement.getAttribute(key));
          double dNewValue = adjustment * oldValue.getNumber();
          Measure newValue = new Measure(dNewValue, oldValue.getUnit());
          odfElement.setAttribute(key, newValue.toString());
        }
      }
      catch (Exception e)
      {
        LOG.warning("Unexpected failure attempting to adjust Shape: " + e);
      }
    }
  }

  /*
   * Determines the value of the draw type attribute. If the Shape is in image format, than this will return null.
   *
   * @param htmlNode HTML Node to extract the Draw Type from
   *
   * @return String Draw Type or null if it isn't set
   */
  public static String getDrawType(Element htmlNode)
  {
    String drawType = htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_DRAW_TYPE);
    if ((drawType == null) || (drawType.length() == 0))
      return null;
    return drawType;
  }

  /*
   * Processes the Shape Properties. This will create or update the style and update the ODF element to reference the style.
   *
   * <P> Draw Frame DIV -> DIV -> Presentation Class Graphic DIV (1st Child) -> SVG -> G (where style info is) -> PATH (ignore for now)
   *
   * @param context Conversion context
   *
   * @param contentDom Content DOM
   *
   * @param htmlElement Draw Frame HTML Element
   *
   * @param odfElement ODF Node to add the attribute to
   *
   * @param style Source style for the Shape properties (or null if a new one is to be created)
   *
   * @return void
   */
  @SuppressWarnings("restriction")
  private static void processShapeProperties(ConversionContext context, OdfFileDom contentDom, Element htmlElement, OdfElement odfElement,
      OdfStyle style)
  {
    try
    {
      OdfDrawCustomShape dcs = (OdfDrawCustomShape) odfElement;
      OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();

      Node svgElement = htmlElement.getFirstChild().getFirstChild().getFirstChild();
      Node gElement = svgElement.getFirstChild();
      while (gElement != null && !gElement.getNodeName().equalsIgnoreCase(ODPConvertConstants.SVG_ATTR_GROUP))
      {
        gElement = gElement.getNextSibling();
      }
      if (gElement == null)
      {
        ODPCommonUtil.logMessage(Level.WARNING,
            "An unexpected SVG structure was encountered.  Ignoring shape properties, since they haven't changed.");
        return;
      }
      NamedNodeMap attributes = gElement.getAttributes();

      // Check if the Shape was created or changed by the IBM Docs Editor (existance of the the docs_border_thickness attribute)
      String docsBorderThickness = getAttributeValue(attributes, ODPConvertConstants.SVG_ATTR_DOCS_BORDER_THICKNESS);
      if (docsBorderThickness == null)
      {
        // ODPCommonUtil.logMessage(Level.INFO, "Encountered Imported Shape which has not been modified");
        return; // Shape was not created or modified by the IBM Docs Editor, so no style processing is needed
      }

      // Create/Update the svg:title if necessary
      setAccessibilityInfo(context, svgElement, dcs);

      String styleName = null;
      StyleGraphicPropertiesElement properties = null;

      // If no style was provided, we need to create a new one
      if (style == null)
      {
        // Create the Graphics Style
        style = new OdfStyle(contentDom);
        OdfStyleFamily graphicStyleFamily = OdfStyleFamily.Graphic;
        style.setStyleFamilyAttribute(graphicStyleFamily.getName());
        style.setStyleParentStyleNameAttribute(ODPConvertConstants.STANDARD);
        styleName = getStyleName(context, graphicStyleFamily, ODPConvertConstants.HTML_ELEMENT_STYLE_GR);
        style.setStyleNameAttribute(styleName);

        // Set Basic Graphics Properties
        properties = style.newStyleGraphicPropertiesElement();
        properties.setDrawTextareaHorizontalAlignAttribute(ODPConvertConstants.HTML_ATTR_JUSTIFY);
        properties.setDrawTextareaVerticalAlignAttribute(ODPConvertConstants.CSS_ATTR_MIDDLE);
        properties.setDrawAutoGrowHeightAttribute(false);
        properties.setFoWrapOptionAttribute(ODPConvertConstants.CSS_VALUE_WRAP);
        properties.setDrawShadowAttribute(ODPConvertConstants.CSS_VALUE_HIDDEN);
        properties.setDrawStrokeLinejoinAttribute(ODPConvertConstants.CSS_VALUE_MITER);

        // TODO - Deal with Padding?
      }
      else
      {
        style = cloneStyle(context, style); // Clone the style in case it is used in other Shapes
        styleName = style.getStyleNameAttribute();
        properties = (StyleGraphicPropertiesElement) style.getPropertiesElement(OdfStylePropertiesSet.GraphicProperties);
      }

      // Fill Color
      String fillColor = getAttributeValue(attributes, ODPConvertConstants.SVG_ATTR_FILL);
      if ((fillColor != null) && !(fillColor.equalsIgnoreCase(ODPConvertConstants.HTML_VALUE_NONE)))
      {
        properties.setDrawFillAttribute(ODPConvertConstants.CSS_VALUE_SOLID);
        properties.setDrawFillColorAttribute(fillColor);
      }
      else
      {
        properties.setDrawFillAttribute(ODPConvertConstants.HTML_VALUE_NONE);
        properties.setDrawFillColorAttribute(ODPConvertConstants.HTML_VALUE_NONE);
      }

      // Borders
      String strokeColor = getAttributeValue(attributes, ODPConvertConstants.SVG_ATTR_STROKE);
      String strokeStyle = getAttributeValue(attributes, ODPConvertConstants.SVG_ATTR_STROKE_DASHARRAY);
      if ((strokeColor != null) && !(strokeColor.equalsIgnoreCase(ODPConvertConstants.HTML_VALUE_NONE)))
      {
        properties.setDrawStrokeAttribute(ODPConvertConstants.CSS_VALUE_SOLID);
        properties.setSvgStrokeColorAttribute(strokeColor);

        // If the Border Thickness is not defined, then this is an imported shape that has not been altered. Otherwise, we need to update
        // the stroke width in the style
        String borderWidthInCm = getBorderWidthFromTemplate(docsBorderThickness);
        if (borderWidthInCm != null)
        {
          properties.setSvgStrokeWidthAttribute(borderWidthInCm);
        }

        if ((strokeStyle != null) && (strokeStyle.length() > 0))
        {
          // Currently, only Dashed and Solid border styles are supported (or none). If the dash array AVG attribute is set, then this is a
          // dashed border.
          properties.setDrawStrokeAttribute(ODPConvertConstants.ODF_ATTR_VALUE_DASH);
          properties.setDrawStrokeDashAttribute(getStrokeDashStyleFromTemplate(docsBorderThickness));
          addDocsDashedStyle(context);
        }
      }
      else
      {
        properties.setDrawStrokeAttribute(ODPConvertConstants.HTML_VALUE_NONE);
      }

      // Add the Graphics or Presentation Style to the ODF
      if (style.getFamily() == OdfStyleFamily.Graphic)
      {
        dcs.setDrawStyleNameAttribute(styleName);
      }
      else
      {
        dcs.setPresentationStyleNameAttribute(styleName);
      }
      autoStyles.appendChild(style);
      GeneralCSSStyleConvertor.addNewStyleToHashMaps(context, style);
    }
    catch (Exception e)
    {
      ODPCommonUtil.handleException(e, context, CONVERTOR);
    }
  }

  /*
   * Creates and Adds the IBM Docs Dashed Line Style to the styles.xml Office Styles (if necessary)
   *
   * @param context Conversion context
   */
  @SuppressWarnings({ "restriction", "unchecked" })
  private static void addDocsDashedStyle(ConversionContext context)
  {
    OdfFileDom stylesDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_STYLES_DOM);
    OdfOfficeStyles officeStyles = stylesDom.getOfficeStyles();

    boolean createDashStyle = true;
    Object dashedStyleExists = context.get(ODPConvertConstants.CONTEXT_DASHED_STYLE_EXISTS);
    if (dashedStyleExists != null)
    {
      createDashStyle = false;
    }
    else
    {
      NodeList dashStyles = officeStyles.getChildNodes();

      int length = dashStyles.getLength();
      for (int i = 0; i < length; i++)
      {
        Node node = dashStyles.item(i);
        if (node.getNodeName().equals(ODPConvertConstants.ODF_ATTR_DRAW_STROKE_DASH))
        {
          NamedNodeMap attributes = node.getAttributes();
          if (attributes.getNamedItem(ODPConvertConstants.ODF_ATTR_DRAW_NAME).getNodeValue()
              .equals(ODPConvertConstants.IBM_DOCS_DASHED_STYLE_NAME))
          {
            createDashStyle = false;
            context.put(ODPConvertConstants.CONTEXT_DASHED_STYLE_EXISTS, ODPConvertConstants.IBM_DOCS_DASHED_STYLE_NAME);
            break;
          }
        }
      }
    }

    if (createDashStyle)
    {
      try
      {
        JSONObject dashStyleTemplates = getStyleMappingTemplate(BORDER_DASHED_STYLE);
        Set<String> keys = (Set<String>) dashStyleTemplates.keySet();
        Iterator<String> iterator = keys.iterator();

        while (iterator.hasNext())
        {
          JSONObject dashStyleTemplate = (JSONObject) dashStyleTemplates.get(iterator.next());
          String drawName = (String) dashStyleTemplate.get(ODPConvertConstants.ODF_ATTR_DRAW_NAME);
          DrawStrokeDashElement dashStyle = officeStyles.newDrawStrokeDashElement(drawName);
          dashStyle.setDrawNameAttribute(drawName);
          dashStyle.setDrawDisplayNameAttribute((String) dashStyleTemplate.get(ODPConvertConstants.ODF_ATTR_DRAWDISPLAYNAME));
          dashStyle.setDrawStyleAttribute((String) dashStyleTemplate.get(ODPConvertConstants.ODF_ATTR_DRAWSTYLE));
          Long drawDots = (Long) dashStyleTemplate.get(ODPConvertConstants.ODF_ATTR_DRAWDOTS1);
          dashStyle.setDrawDots1Attribute(drawDots.intValue());
          dashStyle.setDrawDots1LengthAttribute((String) dashStyleTemplate.get(ODPConvertConstants.ODF_ATTR_DRAWDOTS1LENGTH));
          dashStyle.setDrawDistanceAttribute((String) dashStyleTemplate.get(ODPConvertConstants.ODF_ATTR_DRAWDISTANCE));
          officeStyles.appendChild(dashStyle);
        }

        context.put(ODPConvertConstants.CONTEXT_DASHED_STYLE_EXISTS, ODPConvertConstants.IBM_DOCS_DASHED_STYLE_NAME);
      }
      catch (Exception e)
      {
        LOG.warning("HCL Docs Dashed Style Template is not found or is poorly configured: " + e.getLocalizedMessage());
      }
    }
  }

  /*
   * Retrieves the JSON Shape Template based on the draw:type
   *
   * @param drawType Draw Type
   *
   * @return JSONObject JSON Shape Template
   */
  private static JSONObject getShapeMappingTemplate(String drawType)
  {
    return (JSONObject) SVG_SHAPE_MAP_TEMPLATES.get(drawType);
  }

  /*
   * Retrieves the JSON Shape Style Template based on the Style Type
   *
   * @param styleType Style Type
   *
   * @return JSONObject JSON Shape Style Template
   */
  private static JSONObject getStyleMappingTemplate(String styleType)
  {
    return (JSONObject) SVG_STYLE_MAP_TEMPLATES.get(styleType);
  }

  /*
   * Retrieves the ODF Border Width based on the IBM Docs SVG Border Width
   *
   * @param docsBorderThickness IBM Docs SVG Border Width
   *
   * @return String - draw:stroke-width in CM
   */
  private static String getBorderWidthFromTemplate(String docsBorderThickness)
  {
    JSONObject borderWidthTemplate = getStyleMappingTemplate(BORDER_WIDTH);
    String width = (String) borderWidthTemplate.get(docsBorderThickness);
    if (width == null)
    {
      if (docsBorderThickness != null)
      {
        LOG.warning("Unknown Border Width in SVG: " + docsBorderThickness);
        width = DEFAULT_BORDER_WIDTH;
      }
    }
    return width;
  }

  /*
   * Retrieves the ODF Stroke Dash Style based on the IBM Docs SVG Border Width
   *
   * @param docsBorderThickness IBM Docs SVG Border Width
   *
   * @return String - draw:name
   */
  private static String getStrokeDashStyleFromTemplate(String docsBorderThickness)
  {
    JSONObject dashStyleTemplates = getStyleMappingTemplate(BORDER_DASHED_STYLE);
    JSONObject dashStyleTemplate = (JSONObject) dashStyleTemplates.get(docsBorderThickness);
    String drawName = (String) dashStyleTemplate.get(ODPConvertConstants.ODF_ATTR_DRAW_NAME);
    if (drawName == null)
    {
      if (docsBorderThickness != null)
      {
        LOG.warning("Unknown Border Width in SVG: " + docsBorderThickness);
        drawName = ODPConvertConstants.IBM_DOCS_DASHED_STYLE_NAME;
      }
    }
    return drawName;
  }

  /*
   * Adds an attribute to the ODF Element based on the Draw Type Template
   *
   * @param contentDom Content DOM
   *
   * @param odfElement ODF Node to add the attribute to
   *
   * @param template JSONObject containing the mapping instructions
   *
   * @param attributeName Attribute Name
   *
   * @return void
   */
  @SuppressWarnings({ "restriction" })
  private static void addAttributeByTemplate(OdfFileDom contentDom, OdfElement odfElement, JSONObject template, String attributeName)
  {
    OdfAttribute attribute = null;

    String value = (String) template.get(attributeName);
    if (value != null)
    {
      attribute = contentDom.createAttributeNS(attributeName, attributeName);
      attribute.setValue(value);
      odfElement.setAttributeNodeNS(attribute);
    }
  }

  /*
   * Adds children to the ODF Element based on the Draw Type Template
   *
   * @param contentDom Content DOM
   *
   * @param odfElement ODF Node to add the attribute to
   *
   * @param template JSONObject containing the mapping instructions
   *
   * @return void
   */
  @SuppressWarnings({ "restriction" })
  private static void addChildrenByTemplate(OdfFileDom contentDom, OdfElement odfElement, JSONObject template)
  {
    JSONObject children = (JSONObject) template.get(CHILDREN);
    if (children != null)
    {
      // Create the draw:equation(s)
      String equationNodeName = ODPConvertConstants.ODF_ELEMENT_DRAWEQUATION;
      JSONArray equations = (JSONArray) children.get(equationNodeName);
      if (equations != null)
      {
        for (int i = 0; i < equations.size(); i++)
        {
          OdfElement deElement = contentDom.createElementNS(getNamespaceUri(equationNodeName), equationNodeName);
          odfElement.appendChild(deElement);
          JSONObject equation = (JSONObject) equations.get(i);
          addAttributeByTemplate(contentDom, deElement, equation, ODPConvertConstants.ODF_ATTR_DRAW_NAME);
          addAttributeByTemplate(contentDom, deElement, equation, ODPConvertConstants.ODF_ATTR_DRAW_FORMULA);
        }
      }

      // Create the draw:handle(s)
      String handleNodeName = ODPConvertConstants.ODF_ELEMENT_DRAWHANDLE;
      JSONArray handles = (JSONArray) children.get(handleNodeName);
      if (handles != null)
      {
        for (int i = 0; i < handles.size(); i++)
        {
          OdfElement dhElement = contentDom.createElementNS(getNamespaceUri(handleNodeName), handleNodeName);
          odfElement.appendChild(dhElement);
          JSONObject handle = (JSONObject) handles.get(i);
          addAttributeByTemplate(contentDom, dhElement, handle, ODPConvertConstants.ODF_ATTR_DRAWHANDLEPOSITION);
          addAttributeByTemplate(contentDom, dhElement, handle, ODPConvertConstants.ODF_ATTR_DRAWHANDLERANGEXMINIMUM);
          addAttributeByTemplate(contentDom, dhElement, handle, ODPConvertConstants.ODF_ATTR_DRAWHANDLERANGEXMAXIMUM);
          addAttributeByTemplate(contentDom, dhElement, handle, ODPConvertConstants.ODF_ATTR_DRAWHANDLERANGEYMINIMUM);
          addAttributeByTemplate(contentDom, dhElement, handle, ODPConvertConstants.ODF_ATTR_DRAWHANDLERANGEYMAXIMUM);
          addAttributeByTemplate(contentDom, dhElement, handle, ODPConvertConstants.ODF_ATTR_DRAWHANDLESWITCHED);
        }
      }
    }
  }

  /*
   * Adds children to the ODF Element based on the Draw Type Template
   *
   * @param context Conversion context
   *
   * @param drawType Draw Type
   *
   * @return void
   */
  private static void updateContextWithStyleAdjustments(ConversionContext context, String drawType)
  {
    JSONObject template = getShapeMappingTemplate(drawType);
    if (template != null)
    {
      JSONObject styleAdjustments = (JSONObject) template.get(STYLE_ADJUSTMENTS);
      if (styleAdjustments != null)
      {
        context.put(ODPConvertConstants.CONTEXT_SVG_STYLE_ADJUSTMENTS, styleAdjustments);
      }
      else
      {
        context.remove(ODPConvertConstants.CONTEXT_SVG_STYLE_ADJUSTMENTS);
      }
    }
  }

  /**
   * Add or update accessibility information associated with this Shape
   *
   * @param context
   *          - the current conversion context
   * @param htmlNode
   *          - the svg element
   * @param odfParent
   *          - the parent to add/update the svg:title
   */
  @SuppressWarnings("restriction")
  private static void setAccessibilityInfo(ConversionContext context, Node svgElement, OdfElement odfParent)
  {
    try
    {
      NamedNodeMap svgAttributes = svgElement.getAttributes();

      // Create the svg:title if necessary
      String altText = getAttributeValue(svgAttributes, ODPConvertConstants.HTML_ATTR_ALT);
      if (altText != null && altText.length() > 0)
      {
        NodeList svgTitles = odfParent.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_SVGTITLE);

        if (svgTitles.getLength() == 0)
        {
          // Add a new svg:title
          OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
          OdfElement titleElement = contentDom.createElementNS(
              ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_SVGTITLE), ODPConvertConstants.ODF_ELEMENT_SVGTITLE);
          Text t = contentDom.createTextNode(altText);
          titleElement.appendChild(t);
          odfParent.appendChild(titleElement);
        }
        else
        {
          // Update the svg:title if it has been updated
          Node svgTitle = svgTitles.item(0);
          String currentTitle = svgTitle.getTextContent();
          if (currentTitle == null || !currentTitle.equals(altText))
          {
            svgTitle.setTextContent(altText);
          }
        }
      }
    }
    catch (Exception e)
    {
      ODPCommonUtil.logException(context, Level.SEVERE, ODPCommonUtil.LOG_FAILED_ARIA_EXPORT, e);
    }
  }

  /*
   * Retrieves the string value (or null) for the specified Property
   *
   * @param context Conversion context
   *
   * @param styleFamily ODF Style Family
   *
   * @param prefix Style name prefix
   *
   * @return String - New Style name
   */
  @SuppressWarnings("unchecked")
  private static String getStyleName(ConversionContext context, OdfStyleFamily styleFamily, String prefix)
  {
    String styleName = null;
    Map<String, OdfElement> styleMap = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP);
    while (styleName == null)
    {
      styleName = prefix + "_" + r.nextInt(Integer.MAX_VALUE);
      if (styleMap.containsKey(styleName))
      {
        styleName = null;
      }
    }
    return styleName;
  }

  /*
   * Retrieves the string value (or null) for the specified Property
   *
   * @param attributes Map of attributes/properties
   *
   * @param attributeName Name of HTML Attribute
   *
   * @return String - Attribute Value or null if it is not found
   */
  private static String getAttributeValue(NamedNodeMap attributes, String attributeName)
  {
    Node attribute = attributes.getNamedItem(attributeName);
    if (attribute != null)
    {
      return attribute.getNodeValue();
    }
    else
    {
      return null;
    }
  }

  /*
   * Retrieves the old style name of the Shape ODF Element
   *
   * @param context Conversion context
   *
   * @param shapeElement Shape element to retrieve the style name from
   *
   * @return OdfStyle - Style that is used by the Shape ODF Element
   */
  @SuppressWarnings("restriction")
  private static OdfStyle getOldStyle(ConversionContext context, OdfElement shapeElement)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);

    String styleName = null;
    Attr styleAttribute = shapeElement.getAttributeNode(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
    if (styleAttribute == null)
    {
      styleAttribute = shapeElement.getAttributeNode(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
      if (styleAttribute == null)
      {
        return null;
      }

      styleName = styleAttribute.getNodeValue();
      return CSSUtil.getOldStyle(contentDom.getOdfDocument(), styleName, OdfStyleFamily.Presentation);
    }
    styleName = styleAttribute.getNodeValue();
    return CSSUtil.getOldStyle(contentDom.getOdfDocument(), styleName, OdfStyleFamily.Graphic);
  }

  /*
   * Retrieves the old style name of the Shape ODF Element
   *
   * @param context Conversion context
   *
   * @param oldStyle Style to clone
   *
   * @return OdfStyle - Cloned style
   */
  @SuppressWarnings("restriction")
  private static OdfStyle cloneStyle(ConversionContext context, OdfStyle oldStyle)
  {
    String oldStyleName = oldStyle.getStyleNameAttribute();
    String newStyleName = getStyleName(context, oldStyle.getFamily(), oldStyleName);

    OdfStyle newStyle = (OdfStyle) oldStyle.cloneNode(true);
    newStyle.setAttribute(ODFConstants.STYLE_NAME, newStyleName);

    return newStyle;
  }

  /*
   * Checks if the HTML Element is from an Imported Shape
   *
   * @param htmlElement HTML Element
   *
   * @return boolean - true if the HTML element is for an imported shape
   */
  private static boolean isImportedShape(Element htmlElement)
  {
    return htmlElement.getAttribute(ODPConvertConstants.ODF_ATTR_CLASS).contains(ODPConvertConstants.HTML_VALUE_IMPORTED_SHAPE);
  }

  private static String getNamespaceUri(String qName)
  {
    String[] nodeNameSegments = qName.split(ODPConvertConstants.SYMBOL_COLON);
    String namespaceUri = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_NAMESPACE).get(nodeNameSegments[0]);
    return namespaceUri;
  }
}
