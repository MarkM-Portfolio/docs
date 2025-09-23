/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.shape2image;

import java.io.File;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.batik.dom.svg.SVGDOMImplementation;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.dom.attribute.draw.DrawMarkerEndWidthAttribute;
import org.odftoolkit.odfdom.dom.attribute.draw.DrawMarkerStartWidthAttribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgDAttribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgViewBoxAttribute;
import org.odftoolkit.odfdom.dom.element.draw.DrawFillImageElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawGradientElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawMarkerElement;
import org.odftoolkit.odfdom.dom.element.style.StyleGraphicPropertiesElement;
import org.odftoolkit.odfdom.dom.element.style.StyleStyleElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class GraphicPropertiesParser
{
  private static final String CLASS = GraphicPropertiesParser.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static final double SHAPE_PROPORTION = 10.0;

  private static final ODFSVGMap SVG_ODP_MAP = ODFSVGMap.getInstance();

  // ===============================================================================================
  // Instance Variables
  // ===============================================================================================
  private Map<String, String> ivStyleMap = null;

  @SuppressWarnings("unused")
  private OdfDocument ivOdfDoc;

  private ConversionContext ivContext;

  private SVGDocumentWrapper ivWrapper;

  private Element ivSvgRoot;

  private String ivType;

  private boolean ivODPRules = false;

  private double ivMaxMarkerWidthRatio = 1.0;

  private MarkerTransform ivEndMarkerTransform = null;

  private MarkerTransform ivStartMarkerTransform = null;

  private double ivHeightAdjustment = 0.0;

  private double ivWidthAdjustment = 0.0;

  private double ivHeightAdjustmentCM = 0.0;

  private double ivWidthAdjustmentCM = 0.0;

  private boolean ivHasViewBox = false;

  private double ivShapeRotationAngle = 0.0; // Shape rotation in Radians

  // ===============================================================================================
  // Constants
  // ===============================================================================================

  private final static String SOLID = "solid";

  private final static String GRADIENT = "gradient";

  private final static String BITMAP = "bitmap";

  private final static String IMAGE = "image";

  private final static String PATTERN = "pattern";

  private final static String PATTERN_CONTENT_UNITS = "patternContentUnits";

  private final static String USER_SPACE_ON_USE = "userSpaceOnUse";

  private final static String LINEARGRADIENT = "linearGradient";

  private final static String RADIALGRADIENT = "radialGradient";

  private final static String STOP = "stop";

  private final static String STOP_COLOR = "stop-color";

  private final static String OFFSET = "offset";

  private final static String NO_BORDER = "0%";

  private final static String FULL = "100%";

  private final static String PERCENT_SIGN = "%";

  private final static String LINEAR = "linear";

  private final static String AXIAL = "axial";

  private final static String RADIAL = "radial";

  private final static String ELLIPSOID = "ellipsoid";

  private final static String SQUARE = "square";

  private final static String RECTANGULAR = "rectangular";

  private final static String CUSTOM_SHAPE = "custom-shape";

  private final static String DRAW_G = "g";

  private final static String LINE = "line";

  private final static String CONNECTOR = "connector";

  private final static String MEASURE = "measure";

  private final static String PATH = "path";

  private final static String POLYGON = "polygon";

  private final static String REGULAR_POLYGON = "regular-polygon";

  private final static String RECT = "rect";

  private final static String ELLIPSE = "ellipse";

  private final static String CIRCLE = "circle";

  private final static String POLYLINE = "polyline";

  private final static String SPACE = " ";

  private final static String ZERO_CM = "0cm";

  private final static String ZERO_IN = "0in";

  private final static double ROUNDING_FACTOR = 1000.0;

  private final static String DEFAULT_DASHARRAY = "10";

  private final static String DEFAULT_DASHOFFSET = "5";

  private final static String BLACK = "#000000";

  private final static String MINIMAL_WIDTH = "0.018cm";

  private final static double MINIMAL_WIDTH_VALUE = 0.018;

  private final static String URL_PREFIX = "url(#";

  private final static String svgNS = SVGDOMImplementation.SVG_NAMESPACE_URI;

  private final static Pattern threeLegPattern = Pattern
      .compile("^[m]\\s+\\-?\\d+\\s+\\-?\\d+\\s+[vh]\\s+\\-?\\d+\\s+[vh]\\s+\\-?\\d+\\s+[vh]\\s+\\-?\\d+");

  private final static Pattern twoLegPattern = Pattern.compile("^[m]\\s+\\-?\\d+\\s+\\-?\\d+\\s+[vh]\\s+\\-?\\d+\\s+[vh]\\s+\\-?\\d+");

  // Default Initial Capacity for the Already Processed HashMap
  private static final int ALREADY_PROCESSED_MAP_CAPACITY = (int) (11 * 1.33) + 1;

  // These style attributes are processed specially and do not need to be processed when performing general attribute processing
  static Set<String> cvAlreadyProcessed = new HashSet<String>(ALREADY_PROCESSED_MAP_CAPACITY);
  static
  {
    cvAlreadyProcessed.add(ODFConstants.ODF_ATTR_DRAW_FILL);
    cvAlreadyProcessed.add(ODFConstants.ODF_ATTR_DRAW_FILL_COLOR);
    cvAlreadyProcessed.add(ODFConstants.ODF_ATTR_DRAW_FILL_IMAGE_NAME);
    cvAlreadyProcessed.add(ODFConstants.ODF_ATTR_DRAW_FILL_GRADIENT_NAME);
    cvAlreadyProcessed.add(ODFConstants.ODF_ATTR_DRAW_STROKE);
    cvAlreadyProcessed.add(ODFConstants.ODF_ATTR_SVG_STROKE_WIDTH);
    cvAlreadyProcessed.add(ODFConstants.ODF_ATTR_SVG_STROKE_COLOR);
    cvAlreadyProcessed.add(ODFConstants.ODF_ATTR_DRAWMARKEREND);
    cvAlreadyProcessed.add(ODFConstants.ODF_ATTR_DRAWMARKERENDWIDTH);
    cvAlreadyProcessed.add(ODFConstants.ODF_ATTR_DRAWMARKERSTART);
    cvAlreadyProcessed.add(ODFConstants.ODF_ATTR_DRAWMARKERSTARTWIDTH);
  }

  // Map of Shape type to SVG Shape Type
  static Map<String, String> cvSvgTypeMap = new HashMap<String, String>();
  static
  {
    cvSvgTypeMap.put(CUSTOM_SHAPE, DRAW_G);
    cvSvgTypeMap.put(CONNECTOR, PATH);
    cvSvgTypeMap.put(LINE, LINE);
    cvSvgTypeMap.put(MEASURE, LINE);
    cvSvgTypeMap.put(PATH, PATH);
    cvSvgTypeMap.put(REGULAR_POLYGON, POLYGON);
    cvSvgTypeMap.put(POLYGON, POLYGON);
    cvSvgTypeMap.put(POLYLINE, POLYLINE);
    cvSvgTypeMap.put(CIRCLE, CIRCLE);
    cvSvgTypeMap.put(ELLIPSE, ELLIPSE);
    cvSvgTypeMap.put(RECT, RECT);
  }

  /**
   * GraphicsProperties Parser constructor
   * 
   * @param context
   *          Conversion context
   * @return void
   */
  public GraphicPropertiesParser(ConversionContext context)
  {
    this.ivOdfDoc = (OdfDocument) context.getSource();
    this.ivContext = context;
  }

  /**
   * Gets the Shift Adjustment in centimeters made to the Height of the Shape
   * 
   * @return double Amount of adjustment to the height
   */
  public double getHeightAdjustmentCM()
  {
    return this.ivHeightAdjustmentCM;
  }

  /**
   * Gets the Shift Adjustment in centimeters made to the Width of the Shape
   * 
   * @return double Amount of adjustment to the width
   */
  public double getWidthAdjustmentCM()
  {
    return this.ivWidthAdjustmentCM;
  }

  /**
   * Sets the SVG Document for the parse
   * 
   * @param wrapper
   *          SVGDocumentWrapper
   * @return void
   */
  public void setSVGDocument(SVGDocumentWrapper wrapper)
  {
    this.ivWrapper = wrapper;
    this.ivSvgRoot = ivWrapper.getDocument().getDocumentElement();
  }

  public final void useODPRules(boolean useODPRules)
  {
    this.ivODPRules = useODPRules;
  }

  public final boolean isUsingODPRules()
  {
    return this.ivODPRules;
  }

  public final void setShapeRotationAngle(double angleInRadians)
  {
    this.ivShapeRotationAngle = angleInRadians;
  }

  public final double getShapeRotationAngleInDegrees()
  {
    return Math.round(Math.toDegrees(this.ivShapeRotationAngle) * 1000) / 1000.0;
  }

  /**
   * Parses the graphics style and its parents, updating the appropriate information in the SVG Document
   * 
   * @param style
   *          Graphics property to parse
   * @return void
   */
  public void parse(Node style)
  {
    // Initialize parsing state
    this.ivType = ivWrapper.getType();
    HashMap<String, String> newStyleMap = new HashMap<String, String>();

    // Process the attributes for style and it's parents
    Node styleToProcess = style;
    while (styleToProcess != null)
    {
      if (style instanceof StyleStyleElement)
      {
        StyleStyleElement styleNode = (StyleStyleElement) styleToProcess;

        // Process this node's properties, placing them in the style map ONLY if they are not already there
        NodeList styleProperties = styleNode.getChildNodes();
        for (int i = 0; i < styleProperties.getLength(); i++)
        {
          Node child = styleProperties.item(i);
          if (child instanceof StyleGraphicPropertiesElement)
          {
            NamedNodeMap attributes = child.getAttributes();
            for (int j = 0; j < attributes.getLength(); j++)
            {
              Node attribute = attributes.item(j);
              String attributeName = attribute.getNodeName();
              if (!newStyleMap.containsKey(attributeName))
              {
                newStyleMap.put(attributeName, attribute.getNodeValue());
              }
            }
            break;
          }
        }

        // Navigate to the parent style
        String parentStylename = styleNode.getStyleParentStyleNameAttribute();
        if (parentStylename != null)
        {
          List<Node> styleList = ODPConvertStyleMappingUtil.getStyleNameInStyleNodesByKey(ivContext, parentStylename);
          if (styleList != null)
          {
            styleToProcess = styleList.get(0);
          }
          else
          {
            styleToProcess = null;
          }
        }
        else
        {
          styleToProcess = null;
        }
      }
      else
      {
        styleToProcess = null;
      }
    }

    // If graphics styles were found, parse the styles
    if (newStyleMap.size() > 0)
    {
      this.ivStyleMap = newStyleMap;
      Element target = getTargetElementByType(ivType);
      parseDrawFill(target);
      parseDrawStroke(target);
      parseStyleAttributes();
    }
  }

  /**
   * Parses the the marker and general graphic style attributes
   * 
   * @return void
   */
  private void parseStyleAttributes()
  {

    Element target = getArrowObjectElement();

    Element currElem = null;
    if (target != null && isWithArrows(ivType))
    {
      parseGeneralStyleAttributes(target, ivHasViewBox);
      currElem = target;
    }
    else
    {
      parseGeneralStyleAttributes(ivSvgRoot, ivHasViewBox);
      currElem = ivSvgRoot;
    }

    // Check to see if we have a draw stroke, if it is none, we don't need to process markers
    String drawStroke = ivStyleMap.get(ODFConstants.ODF_ATTR_DRAW_STROKE);
    if ((drawStroke != null) && (!drawStroke.equals(ODFConstants.HTML_VALUE_NONE)))
    {
      // Calculate the Stroke Width (in numeric form)
      double dStrokeWidth = MINIMAL_WIDTH_VALUE;
      String strokeWidth = ivStyleMap.get(ODFConstants.ODF_ATTR_SVG_STROKE_WIDTH);
      if (strokeWidth != null)
      {
        Measure measure = Measure.parseNumber(strokeWidth);
        dStrokeWidth = measure.getNumber();
        if (dStrokeWidth == 0.0)
          dStrokeWidth = MINIMAL_WIDTH_VALUE;
        // Adjust the view box according to the stroke width
        boolean hasViewBox = currElem.hasAttribute(ODFConstants.SVG_ATTR_VIEWBOX);
        if (hasViewBox)
        {
          adjustViewBoxForStrokeWidth(currElem, strokeWidth);
        }
      }

      String strokeColor = ivStyleMap.get(ODFConstants.SVG_ATTR_STROKE_COLOR);
      String fillColor = ivStyleMap.get(ODFConstants.ODF_ATTR_SVG_STROKE_COLOR);
      if (fillColor != null)
      {
        strokeColor = fillColor;
        ivStyleMap.put(ODFConstants.SVG_ATTR_STROKE_COLOR, strokeColor);
      }

      String markerName = ivStyleMap.get(ODFConstants.ODF_ATTR_DRAWMARKEREND);
      if (markerName != null && target != null)
      {
        if (markerName.length() > 0)
        {
          Element marker = ivWrapper.getDocument().createElementNS(svgNS, ODFConstants.SVG_ELEMENT_MARKER);
          ivEndMarkerTransform = createMarkerElement(markerName, MarkerTransform.END, marker,
              ivStyleMap.get(ODFConstants.ODF_ATTR_DRAWMARKERENDWIDTH), dStrokeWidth);
          target.setAttributeNS(null, ODFConstants.SVG_ATTR_MARKEREND, URL_PREFIX + ivEndMarkerTransform.getType() + ")");
        }
      }

      markerName = ivStyleMap.get(ODFConstants.ODF_ATTR_DRAWMARKERSTART);
      if (markerName != null && target != null)
      {
        if (markerName.length() > 0)
        {
          Element marker = ivWrapper.getDocument().createElementNS(svgNS, ODFConstants.SVG_ELEMENT_MARKER);
          ivStartMarkerTransform = createMarkerElement(markerName, MarkerTransform.START, marker,
              ivStyleMap.get(ODFConstants.ODF_ATTR_DRAWMARKERSTARTWIDTH), dStrokeWidth);
          target.setAttributeNS(null, ODFConstants.SVG_ATTR_MARKERSTART, URL_PREFIX + ivStartMarkerTransform.getType() + ")");
        }
      }

      reviseAttributesForMarkers();
    }
  }

  /**
   * adjust the ViewBox so that the strokeWidth does not get chopped/split. Need to adjust both x1,y1 and x2,y2
   * 
   * @param currElem
   *          - SVG element containing ViewBox to be adjusted
   * @param strokeWidth
   *          - width of stroke
   */
  private void adjustViewBoxForStrokeWidth(Element currElem, String strokeWidth)
  {

    // Adjust the view box using both height and width. Previously, only the width
    // was used for adjustment purposes
    String sWidth = ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_WIDTH);
    String sHeight = ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_HEIGHT);
    if (null == sWidth || sWidth.length() < 1 || null == sHeight || sWidth.length() < 1)
      return;
    double dWidth = Double.parseDouble(ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
    double dHeight = Double.parseDouble(ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));

    Measure mStrokeWidth = Measure.parseNumber(strokeWidth);
    double dStrokeWidth = convertCMToPixel(mStrokeWidth);
    double dWidthPer = dStrokeWidth / dWidth;
    double dHeightPer = dStrokeWidth / dHeight;

    String viewBox = currElem.getAttribute(ODFConstants.SVG_ATTR_VIEWBOX);
    String[] view = viewBox.split(SPACE);
    double x1 = Double.valueOf(view[0]);
    double y1 = Double.valueOf(view[1]);
    double x2 = Double.valueOf(view[2]);
    double y2 = Double.valueOf(view[3]);
    double widthAdjustFactor = (x2 - x1) * dWidthPer;

    double heightAdjustFactor = (y2 - y1) * dHeightPer;
    x1 = x1 - (widthAdjustFactor / 2);
    y1 = y1 - (heightAdjustFactor / 2);
    x2 = x2 + widthAdjustFactor;
    y2 = y2 + heightAdjustFactor;
    viewBox = String.valueOf(Math.ceil(x1)) + ODFConstants.SYMBOL_WHITESPACE;
    viewBox += String.valueOf(Math.ceil(y1)) + ODFConstants.SYMBOL_WHITESPACE;
    viewBox += String.valueOf(Math.ceil(x2)) + ODFConstants.SYMBOL_WHITESPACE;
    viewBox += String.valueOf(Math.ceil(y2));
    currElem.setAttributeNS(null, ODFConstants.SVG_ATTR_VIEWBOX, viewBox);
  }

  /**
   * Converts the Marker Width String to a double
   * 
   * @param markerWidth
   *          Marker width string
   * @return double - Value of the Marker width string (or 0 if the string is null)
   */
  private double convertMarkerWidthToDouble(String markerWidth)
  {
    double dMarkerWidth = 0.0;
    if (markerWidth != null)
    {
      dMarkerWidth = Measure.extractNumber(markerWidth);
    }
    return dMarkerWidth;
  }

  /**
   * Parses the remaining graphic properties
   * 
   * @param target
   *          SVG target element
   * @param hasViewBox
   *          Flag indicating whether there is a viewbox
   * @return void
   */
  private void parseGeneralStyleAttributes(Element target, boolean hasViewBox)
  {
    String viewBox = DrawingUtil.DEFAULT_VIEWBOX;
    if (target.hasAttribute(ODFConstants.SVG_ATTR_VIEWBOX))
      viewBox = target.getAttribute(ODFConstants.SVG_ATTR_VIEWBOX);
    String[] view = viewBox.split(SPACE);

    double base_Width = Double.parseDouble(view[2]);
    double base_Height = Double.parseDouble(view[3]);
    double base = Math.min(base_Width, base_Height);

    Set<String> keys = ivStyleMap.keySet();
    Iterator<String> iterator = keys.iterator();
    while (iterator.hasNext())
    {
      String attrName = iterator.next();
      if (cvAlreadyProcessed.contains(attrName))
      {
        continue;
      }

      String svgAttrName = SVG_ODP_MAP.find(attrName);
      if (svgAttrName != null)
      {
        String attrValue = ivStyleMap.get(attrName);
        if(attrValue != null)
        {
        	if (attrName.equals(ODFConstants.ODF_ATTR_DRAW_OPACITY))
            {
              double value = Double.parseDouble(attrValue.substring(0, attrValue.indexOf('%'))) / 100;
              attrValue = String.valueOf(value);
            }
            else
            {
              Measure avMeasure = Measure.parseNumber(attrValue);
              if (avMeasure != null && (avMeasure.isCMMeasure() || avMeasure.isINMeasure()))
              {
                if (hasViewBox)
                {
                  if (isLineOrConnector(ivType))
                    attrValue = String.valueOf(convertCMToSVGValue(avMeasure));
                  else
                    attrValue = String.valueOf(convertCMToPixel(avMeasure) * 100 * base / 21600);
                }
                else
                  attrValue = String.valueOf(convertCMToPixel(avMeasure));
              } else {
                log.warning("avMeasure is null while GraphicPropertiesParser parseGeneralStyleAttributes:"+ attrValue);
              }
            }
            target.setAttributeNS(null, svgAttrName, attrValue);
        }
      }
    }
  }

  /**
   * Creates the Linear Gradient SVG Element
   * 
   * @param element
   *          DrawGradient Element
   * @return Element Newly created Linear Gradient SVG Element
   */
  private Element createLinearDef(DrawGradientElement element)
  {
    String border = element.getDrawBorderAttribute();
    Element linearGradient = ivWrapper.getDocument().createElementNS(svgNS, LINEARGRADIENT);
    linearGradient.setAttribute(ODFConstants.SVG_MARKER_ID, element.getDrawNameAttribute());

    String startColor = element.getDrawStartColorAttribute();
    String endColor = element.getDrawEndColorAttribute();

    // If there is a border, then we need a adjust the begin and end gradient stops (half the border goes on either side
    int beginPercentage = 0;
    int endPercentage = 100;
    if (border!=null && !border.equals(NO_BORDER))
    {
      int borderPercentage = Integer.parseInt(border.substring(0, border.length() - 1));
      beginPercentage += borderPercentage / 2;
      endPercentage -= borderPercentage / 2;
    }

    // Convert begin and end gradient stops to Strings
    String beginStop = Integer.toString(beginPercentage) + PERCENT_SIGN;
    String endStop = Integer.toString(endPercentage) + PERCENT_SIGN;

    // Handle the Axial Stops
    if (element.getDrawStyleAttribute().equals(AXIAL))
    {
      int middlePercentage = (beginPercentage + endPercentage) / 2;
      String middleStop = Integer.toString(middlePercentage) + PERCENT_SIGN;

      // Handle the First Stop with the End Color
      Element axialStop = ivWrapper.getDocument().createElementNS(svgNS, STOP);
      axialStop.setAttributeNS(null, OFFSET, beginStop);
      linearGradient.appendChild(axialStop);
      axialStop.setAttributeNS(null, STOP_COLOR, endColor);

      // Handle the Second Stop with the Start Color
      Element startColorStop = ivWrapper.getDocument().createElementNS(svgNS, STOP);
      startColorStop.setAttributeNS(null, OFFSET, middleStop);
      linearGradient.appendChild(startColorStop);
      startColorStop.setAttributeNS(null, STOP_COLOR, startColor);
    }
    // Handle the Linear Stops
    else
    {
      // Handle the First Stop with the Start Color
      Element startColorStop = ivWrapper.getDocument().createElementNS(svgNS, STOP);
      startColorStop.setAttributeNS(null, OFFSET, beginStop);
      linearGradient.appendChild(startColorStop);
      startColorStop.setAttributeNS(null, STOP_COLOR, startColor);
    }

    // Handle the Last Stop with the End Color
    Element endColorStop = ivWrapper.getDocument().createElementNS(svgNS, STOP);
    endColorStop.setAttributeNS(null, OFFSET, endStop);
    linearGradient.appendChild(endColorStop);
    endColorStop.setAttributeNS(null, STOP_COLOR, endColor);

    // Determine the vertical/horizontal gradient start/end values
    double x1 = 0;
    double y1 = 0;
    double x2 = 0;
    double y2 = 0;

    // Adjust the vertical and horizontal start/stop values based on the angle - default direction is bottom to top
    // PPT and ODP orient the angles differently, so we need to adjust the number to get the right angle
    // So... The converted angle is the degree where the FIRST color starts in the gradient
    // The skew is needed to adjust to values so that we don't get gradients that are too dominated
    // by one color or the other.
    double angle = Double.parseDouble(element.getDrawAngleAttribute());
    angle = (360 - (angle / 10)) % 360;
    double skew = Math.PI / 180;

    // If the Shape is rotated, we need to adjust the gradient angle based on the shape rotation
    if (ivShapeRotationAngle != 0)
    {
      double shapeAngle = getShapeRotationAngleInDegrees();
      angle = (angle + shapeAngle) % 360;
      if (angle < 0)
      {
        angle = 360 + angle;
      }
    }

    // Handle the easy and most common values first. In each of these cases,
    // only one value is 1 (the rest are already are initialized to 0).
    if (angle == 0)
    {
      y2 = 1;
    }
    else if (angle == 90)
    {
      x1 = 1;
    }
    else if (angle == 180)
    {
      y1 = 1;
    }
    else if (angle == 270)
    {
      x2 = 1;
    }
    // The rest of the values involve trigonometry. This is handled on a quadrant by quadrant
    // basis. Each quadrant is 0 < angle < 90. Each x/y value is 0 <= value <= 1. When the quadrant
    // is in negative territory (i.e. below the x-axis or left of the y-axis), the values are
    // adjusted by adding 1 to both of the values for the negative x or y. This adjusts the values
    // so that the direction of the gradient is correct.
    else if (angle > 0 && angle < 90)
    {
      x1 = Math.sin(angle * skew);
      y1 = 0;
      x2 = 0;
      y2 = Math.cos(angle * skew);
    }
    else if (angle > 90 && angle < 180)
    {
      x1 = Math.cos((angle - 90) * skew);
      y1 = 1;
      x2 = 0;
      y2 = 1 - Math.sin((angle - 90) * skew);
    }
    else if (angle > 180 && angle < 270)
    {
      x1 = 1 - Math.sin((angle - 180) * skew);
      y1 = 1;
      x2 = 1;
      y2 = 1 - Math.cos((angle - 180) * skew);
    }
    else
    {
      x1 = 1 - Math.cos((angle - 270) * skew);
      y1 = 0;
      x2 = 1;
      y2 = Math.sin((angle - 270) * skew);
    }

    linearGradient.setAttributeNS(null, "x1", String.valueOf(x1));
    linearGradient.setAttributeNS(null, "y1", String.valueOf(y1));
    linearGradient.setAttributeNS(null, "x2", String.valueOf(x2));
    linearGradient.setAttributeNS(null, "y2", String.valueOf(y2));
    return linearGradient;
  }

  /**
   * Creates the Radial Gradient SVG Element
   * 
   * @param element
   *          DrawGradient Element
   * @return Element Newly created Radial Gradient SVG Element
   */
  private Element createRadialDef(DrawGradientElement element)
  {
    String border = element.getDrawBorderAttribute();
    Element radialGradient = ivWrapper.getDocument().createElementNS(svgNS, RADIALGRADIENT);
    radialGradient.setAttribute(ODFConstants.SVG_MARKER_ID, element.getDrawNameAttribute());

    String startValue = element.getDrawStartColorAttribute();
    String endValue = element.getDrawEndColorAttribute();

    // Handle the End Color Gradient Stop
    Element end = ivWrapper.getDocument().createElementNS(svgNS, STOP);
    radialGradient.appendChild(end);
    end.setAttributeNS(null, STOP_COLOR, endValue);
    end.setAttributeNS(null, OFFSET, border);

    // Handle the Start Color Gradient Stop
    Element start = ivWrapper.getDocument().createElementNS(svgNS, STOP);
    start.setAttributeNS(null, OFFSET, FULL);
    radialGradient.appendChild(start);
    start.setAttributeNS(null, STOP_COLOR, startValue);
    radialGradient.setAttributeNS(svgNS, "r", FULL);
    return radialGradient;
  }

  /**
   * Creates the Marker SVG Element
   * 
   * @param drawMarkerName
   *          DrawMarker name
   * @param orient
   *          Orientation (START vs END)
   * @param marker
   *          DrawMarker Element
   * @param markerWidth
   *          DrawMarker Width
   * @param dStrokeWidth
   *          DrawStroke Width
   * @return MarkerTransform Newly created Marker Transform
   */
  private MarkerTransform createMarkerElement(String drawMarkerName, String orient, Element marker, String markerWidth, double dStrokeWidth)
  {
    // Compute the Marker Width to Stroke Width Ratio
    double dMarkerWidth = convertMarkerWidthToDouble(markerWidth);
    double markerToStrokeWidthRatio = dMarkerWidth / dStrokeWidth;

    MarkerTransform markerTransform = new MarkerTransform(drawMarkerName, markerToStrokeWidthRatio, orient);

    Element defs = createDefsElement();
    defs.appendChild(marker);

    marker.setAttributeNS(null, ODFConstants.SVG_ATTR_FILL, ivStyleMap.get(ODFConstants.SVG_ATTR_STROKE_COLOR));
    marker.setAttributeNS(null, ODFConstants.SVG_MARKER_ID, markerTransform.getType());
    marker.setAttributeNS(null, ODFConstants.SVG_ATTR_ORIENT, ODFConstants.SVG_ATTR_ORIENT_AUTO);

    List<Node> gradDef = ODPConvertStyleMappingUtil.getDrawNameNodesByKey(ivContext, markerTransform.getStyleName());
    if (null == gradDef)
      gradDef = ODPConvertStyleMappingUtil.getDrawNameNodesByKey(ivContext, drawMarkerName);
    for (int j = 0; gradDef != null && j < gradDef.size(); j++)
    {
      Node element = gradDef.get(j);
      if (element instanceof DrawMarkerElement)
      {
        DrawMarkerElement drawMaker = (DrawMarkerElement) element;
        parseMarkerAttributes(markerTransform, drawMaker, marker);
        break;
      }
    }

    // Until we support full marker support, we will use a 1:1 ratio for all but arrows (3:2)
    double dMarkerWidthRatio = markerTransform.getMarkerWidthRatio();
    double dMarkerHeightRatio = markerTransform.getMarkerHeightRatio();

    ivMaxMarkerWidthRatio = Math.max(dMarkerWidthRatio, ivMaxMarkerWidthRatio);

    marker.setAttributeNS(null, ODFConstants.SVG_ATTR_MARKERWIDTH, String.valueOf(dMarkerWidthRatio));
    marker.setAttributeNS(null, ODFConstants.SVG_ATTR_MARKERHEIGHT, String.valueOf(dMarkerHeightRatio));
    marker.setAttributeNS(null, ODFConstants.SVG_ATTR_PRESERVE_ASPECT_RATIO, ODFConstants.HTML_VALUE_NONE);

    Element root = ivWrapper.getDocument().getDocumentElement();
    if (root.hasAttribute(ODFConstants.SVG_ATTR_VIEWBOX))
    {
      String oldViewBox = root.getAttribute(ODFConstants.SVG_ATTR_VIEWBOX);
      String viewBox[] = oldViewBox.split(SPACE);
      StringBuilder newViewBox = new StringBuilder(32);
      // Need to account for the marker width within the view box
      // Previously was hardcoded -200, -100, 400, 200
      double x1 = Double.parseDouble(viewBox[0]);
      double y1 = Double.parseDouble(viewBox[1]);
      double x2 = Double.parseDouble(viewBox[2]);
      double y2 = Double.parseDouble(viewBox[3]);
      // if the viewbox is small, use a ratio, however if the
      // viewbox is larger use the original values.
      if (x2 - x1 < 2000 || y2 - y1 < 2000)
      {
        newViewBox.append(x1 - 4.5 * dMarkerWidthRatio).append(' ');
        newViewBox.append(y1 - 3 * dMarkerHeightRatio).append(' ');
        newViewBox.append(x2 + 9 * dMarkerWidthRatio).append(' ');
        newViewBox.append(y2 + 6 * dMarkerHeightRatio);
      }
      else
      {
        newViewBox.append(Double.parseDouble(viewBox[0]) - 200).append(' ');
        newViewBox.append(Double.parseDouble(viewBox[1]) - 100).append(' ');
        newViewBox.append(Double.parseDouble(viewBox[2]) + 400).append(' ');
        newViewBox.append(Double.parseDouble(viewBox[3]) + 200);
      }
      root.setAttributeNS(null, ODFConstants.SVG_ATTR_VIEWBOX, newViewBox.toString());
    }

    return markerTransform;
  }

  /**
   * Parses the marker attributes
   * 
   * @param transform
   *          Marker transform
   * @param node
   *          Draw marker
   * @param target
   *          SVG target element
   * @return Element Target element
   */
  private Element parseMarkerAttributes(MarkerTransform transform, Node node, Element target)
  {
    NamedNodeMap attrMap = node.getAttributes();
    for (int i = 0; i < attrMap.getLength(); i++)
    {
      Node attrNode = attrMap.item(i);
      String attrName = attrNode.getNodeName();
      if (SVG_ODP_MAP.containsKey(attrName))
      {
        if (attrNode instanceof SvgDAttribute)
        {
          Element path = ivWrapper.getDocument().createElement(PATH);
          path.setAttributeNS(null, SVG_ODP_MAP.find(attrName), transform.path());
          target.appendChild(path);
        }
        else if (attrNode instanceof SvgViewBoxAttribute)
        {
          target.setAttributeNS(null, SVG_ODP_MAP.find(attrName), transform.viewBox());
        }
        else if (attrNode instanceof DrawMarkerStartWidthAttribute || attrNode instanceof DrawMarkerEndWidthAttribute)
        {
          continue;
        }
        else
          target.setAttributeNS(null, SVG_ODP_MAP.find(attrName), attrNode.getNodeValue());
      }
    }
    target.setAttributeNS(null, ODFConstants.SVG_MARKER_REFX, String.valueOf(transform.refX()));
    target.setAttributeNS(null, ODFConstants.SVG_MARKER_REFY, String.valueOf(transform.refY()));
    return target;
  }

  private void reviseAttributesForMarkers()
  {
    if (ivType.equals(LINE) || ivType.equals(MEASURE))
    {
      Element line = (Element) ivWrapper.getDocument().getElementsByTagName(LINE).item(0);
      double x1 = Double.parseDouble(line.getAttribute(ODFConstants.SVG_ATTR_X1));
      double y1 = Double.parseDouble(line.getAttribute(ODFConstants.SVG_ATTR_Y1));
      double x2 = Double.parseDouble(line.getAttribute(ODFConstants.SVG_ATTR_X2));
      double y2 = Double.parseDouble(line.getAttribute(ODFConstants.SVG_ATTR_Y2));
      double svgStrokeWidth = Double.parseDouble(line.getAttribute(ODFConstants.SVG_ATTR_STROKE_WIDTH));
      double lineHeight = Math.abs(y2 - y1);
      double lineWidth = Math.abs(x2 - x1);
      double angleInRadians = Math.atan((lineHeight) / (lineWidth));

      double cosAngle = Math.round(Math.abs(Math.cos(angleInRadians)) * ROUNDING_FACTOR) / ROUNDING_FACTOR;
      double sinAngle = Math.round(Math.abs(Math.sin(angleInRadians)) * ROUNDING_FACTOR) / ROUNDING_FACTOR;

      double maxMarkerWidth = ivMaxMarkerWidthRatio * svgStrokeWidth;
      ivHeightAdjustment = cosAngle * maxMarkerWidth / 2;
      ivWidthAdjustment = sinAngle * maxMarkerWidth / 2;

      double strokeWidthCM = Measure.extractNumber(ivStyleMap.get(ODFConstants.ODF_ATTR_SVG_STROKE_WIDTH));

      ivHeightAdjustmentCM = cosAngle * ivMaxMarkerWidthRatio * strokeWidthCM / 2.0;
      ivWidthAdjustmentCM = sinAngle * ivMaxMarkerWidthRatio * strokeWidthCM / 2.0;

      // Need to shorten the line to compensate for the markers - Note that the lines can be drawn top to bottom or bottom to top, etc.
      double xStartMarkerAdjustment = 0;
      double xEndMarkerAdjustment = 0;

      double yStartMarkerAdjustment = 0;
      double yEndMarkerAdjustment = 0;
      double xOrientation = 1;
      double yOrientation = 1;
      if (x2 < x1)
        xOrientation = -1;
      if (y2 < y1)
      {
        yOrientation = -1;
      }
      if (ivEndMarkerTransform != null)
      {
        double endMarkerHeight = ivEndMarkerTransform.getMarkerHeightRatio() * svgStrokeWidth;
        xEndMarkerAdjustment = cosAngle * endMarkerHeight * xOrientation;
        yEndMarkerAdjustment = sinAngle * endMarkerHeight * yOrientation;
      }
      if (ivStartMarkerTransform != null)
      {
        double startMarkerHeight = ivStartMarkerTransform.getMarkerHeightRatio() * svgStrokeWidth;
        xStartMarkerAdjustment = cosAngle * startMarkerHeight * xOrientation;
        yStartMarkerAdjustment = sinAngle * startMarkerHeight * yOrientation;
      }

      line.setAttributeNS(null, ODFConstants.SVG_ATTR_X1, String.valueOf(x1 + ivWidthAdjustment + xStartMarkerAdjustment));
      line.setAttributeNS(null, ODFConstants.SVG_ATTR_Y1, String.valueOf(y1 + ivHeightAdjustment + yStartMarkerAdjustment));
      line.setAttributeNS(null, ODFConstants.SVG_ATTR_X2, String.valueOf(x2 + ivWidthAdjustment - xEndMarkerAdjustment));
      line.setAttributeNS(null, ODFConstants.SVG_ATTR_Y2, String.valueOf(y2 + ivHeightAdjustment - yEndMarkerAdjustment));

      reviseWHWithMarker();
    }
    else if (ivType.equals(ODFConstants.SVG_CONNECTOR))
    {
      Element path = (Element) ivWrapper.getDocument().getElementsByTagName(PATH).item(0);
      if (path == null)
        return;

      if (!path.hasAttribute(ODFConstants.SVG_ATTR_D))
        return;

      String d = getPath(path);

      // Verify the path is a connector made up of vertical and horizontal lines... we do not have as much trouble with rotated
      // connectors because or the angle in relation to the viewbox
      Matcher m3 = threeLegPattern.matcher(d);
      Matcher m2 = twoLegPattern.matcher(d);
      boolean connector3leg = m3.matches(); // 3 legged connector
      boolean connector2leg = false;
      if (!connector3leg)
        connector2leg = m2.matches(); // 2 direction connector

      // If its a 2 directional or 3 directional marker
      if (connector3leg || connector2leg)
      {
        double svgStrokeWidth = Double.parseDouble(path.getAttribute(ODFConstants.SVG_ATTR_STROKE_WIDTH));

        if (ivStartMarkerTransform == null && ivEndMarkerTransform == null)
        {
          if (connector3leg)
            modifyMidPath(path, getPath(path), svgStrokeWidth);
          return; // connector has no markers
        }

        // Need to shorten the connector to compensate for the markers -
        // Note that the lines can be drawn top to bottom or bottom to top 
        // as well as left to right and right to left.
        if (ivEndMarkerTransform != null)
        {
          double endMarkerHeight = ivEndMarkerTransform.getMarkerHeightRatio() * svgStrokeWidth;
          modifyEndPath(path, getPath(path), endMarkerHeight);
        }
        // TODO: Start marker transforms need to be handled, however they work differently than end markers.
        // if you shorten the start length, it does not move the marker into the viewbox, but moves the second
        // leg start location closer. If you modify the viewbox, it changes proportionality and causes other
        // issues.
        // if (ivStartMarkerTransform != null)
        // {
        // double startMarkerHeight = ivStartMarkerTransform.getMarkerHeightRatio() * svgStrokeWidth;
        // modifyStartPath(path, getPath(path), startMarkerHeight, getViewbox(path));
        // }
      }
    }
  }

  /**
   * This is used for markerless 3 directional connections... the third leg falls out of the viewbox We shorten the second leg by the
   * strokewidth to contain this.
   * 
   * @param path
   *          - path to be adusted
   * @param d
   *          - actual path layout
   * @param strokeWidth
   */
  private void modifyMidPath(Element path, String d, double strokeWidth)
  {
    String pathArray[] = d.split("\\s+"); // Split on one or more whitespace
    double midConnectorLength = Double.valueOf(pathArray[6]);
    if (midConnectorLength >= 0)
      midConnectorLength -= strokeWidth / 2;
    else
      midConnectorLength += strokeWidth / 2;

    // Set the d attribute in the path element
    pathArray[6] = String.valueOf(MeasurementUtil.formatDecimal(midConnectorLength, 3));
    StringBuilder newD = new StringBuilder(d.length() + 8);
    for (int j = 0; j < pathArray.length; j++)
      newD.append(pathArray[j] + ODFConstants.SYMBOL_WHITESPACE);
    path.setAttribute(ODFConstants.SVG_ATTR_D, newD.toString().trim());
  }

  /**
   * 
   * @param path
   *          SVG element containing the path
   * @return a string representation of the path, m 0 0 v 25 h 100 v 50
   */
  private String getPath(Element path)
  {
    String d = path.getAttribute(ODFConstants.SVG_ATTR_D);
    d = d.replace(ODFConstants.SVG_ATTR_M, ODFConstants.SYMBOL_WHITESPACE + ODFConstants.SVG_ATTR_M + ODFConstants.SYMBOL_WHITESPACE);
    d = d.replace(ODFConstants.SVG_ATTR_V, ODFConstants.SYMBOL_WHITESPACE + ODFConstants.SVG_ATTR_V + ODFConstants.SYMBOL_WHITESPACE);
    d = d.replace(ODFConstants.SVG_ATTR_H, ODFConstants.SYMBOL_WHITESPACE + ODFConstants.SVG_ATTR_H + ODFConstants.SYMBOL_WHITESPACE);
    return d.trim();
  }

  /**
   * modifies the path and view box for a "end marker"
   * 
   * @param path
   *          - path SVG element
   * @param d
   *          - path specified as a string
   * @param endMarkerHeight
   *          - end marker height
   * @param viewbox
   *          - viewbox that needs to be modified (set in the paths parent element
   */
  private void modifyEndPath(Element path, String d, double endMarkerHeight)
  {
    String pathArray[] = d.split("\\s+"); // Split on one or more whitespace
    double lastLength = Double.valueOf(pathArray[pathArray.length - 1]);
    double newLastLength;

    // Modify the lastLength to allow for marker
    if (lastLength > 0)
      newLastLength = lastLength - endMarkerHeight;
    else
      newLastLength = lastLength + endMarkerHeight;
    pathArray[pathArray.length - 1] = String.valueOf(MeasurementUtil.formatDecimal(newLastLength, 3));

    // Find the direction of the last arrow
    if (pathArray[pathArray.length - 2].equals("v"))
    { // vertical
      double horizontalLength = Double.valueOf(pathArray[pathArray.length - 3]);
      if (horizontalLength >= 0)
      {
        horizontalLength -= .5 * endMarkerHeight;
      }
      else
      {
        horizontalLength += .5 * endMarkerHeight;
      }
      pathArray[pathArray.length - 3] = String.valueOf(MeasurementUtil.formatDecimal(horizontalLength, 3));
    }
    else
    // horizontal
    {
      double verticalLength = Double.valueOf(pathArray[pathArray.length - 3]);
      if (verticalLength >= 0)
      {
        verticalLength -= .5 * endMarkerHeight;
      }
      else
      {
        verticalLength += .5 * endMarkerHeight;
      }
      pathArray[pathArray.length - 3] = String.valueOf(MeasurementUtil.formatDecimal(verticalLength, 3));
    }
    // Set the d attribute in the path element
    StringBuilder newD = new StringBuilder(d.length() + 8);
    for (int j = 0; j < pathArray.length; j++)
      newD.append(pathArray[j] + ODFConstants.SYMBOL_WHITESPACE);
    path.setAttribute(ODFConstants.SVG_ATTR_D, newD.toString().trim());
  }

  private void reviseWHWithMarker()
  {
    // Add some padding so we don't truncate the lines due to rounding
    double heightAdjustment = ivHeightAdjustment * 2;
    double widthAdjustment = ivWidthAdjustment * 2;

    Element root = ivWrapper.getDocument().getDocumentElement();
    double width = Double.parseDouble(root.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
    double height = Double.parseDouble(root.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
    root.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(width + widthAdjustment));
    root.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(height + heightAdjustment));
  }

  private Element getArrowObjectElement()
  {
    Document doc = ivWrapper.getDocument();
    if (ivType.equals(LINE) || ivType.equals(MEASURE))
      return (Element) doc.getElementsByTagName(LINE).item(0);
    Node node = doc.getElementsByTagName(PATH).item(0);
    if (node != null)
      return (Element) node;
    return null;
  }

  /**
   * Creates the Defs SVG Element
   * 
   * @return Element Newly created Defs SVG Element
   */
  private Element createDefsElement()
  {
    Document doc = ivWrapper.getDocument();
    Node node = doc.getElementsByTagName(ODFConstants.SVG_ELEMENT_DEFS).item(0);
    if (node != null)
      return (Element) node;
    Element defs = ivWrapper.getDocument().createElementNS(svgNS, ODFConstants.SVG_ELEMENT_DEFS);
    ivWrapper.getDocument().getDocumentElement().appendChild(defs);
    return defs;
  }

  /**
   * Parses and handles the DrawFill attributes
   * 
   * @param target
   *          Target SVG element
   * @return void
   */
  private void parseDrawFill(Element target)
  {
    String drawFillValue = ivStyleMap.get(ODFConstants.ODF_ATTR_DRAW_FILL);

    // If the Shape is not fillable, ignore the Fill Color
    if (!isFillable(ivType))
    {
      target.setAttributeNS(null, ODFConstants.SVG_ATTR_FILL, ODFConstants.HTML_VALUE_NONE);
      log.fine("Shape of " + ivType + "is not fillable, so the Fill Color will be ignored");
      return;
    }

    // Ensure draw:fill is set - ODT documents seem to not set draw:fill even though a color is set. ODP documents can also have this
    // problem when the shape is in the master.
    if (drawFillValue == null)
    {
      String drawFillColor = ivStyleMap.get(ODFConstants.ODF_ATTR_DRAW_FILL_COLOR);
      if (drawFillColor != null)
      {
        drawFillValue = SOLID;
      }
      else
      {
        drawFillValue = ODFConstants.HTML_VALUE_NONE;
      }
      ivStyleMap.put(ODFConstants.ODF_ATTR_DRAW_FILL, drawFillValue);
    }

    // Handle the Draw Fill attributes
    if (drawFillValue.equals(ODFConstants.HTML_VALUE_NONE))
    {
      target.setAttributeNS(null, ODFConstants.SVG_ATTR_FILL, ODFConstants.HTML_VALUE_NONE);
    }
    else if (drawFillValue.equals(SOLID))
    {
      target.setAttributeNS(null, ODFConstants.SVG_ATTR_FILL, ivStyleMap.get(ODFConstants.ODF_ATTR_DRAW_FILL_COLOR));
    }
    else if (drawFillValue.equals(BITMAP))
    {
      parseBitmapFill(ivSvgRoot); // Bitmap attributes are added to the root element
    }
    else if (drawFillValue.equals(GRADIENT))
    {
      parseGradientFill(ivSvgRoot); // Gradient attributes are added to the root element
    }
  }

  /**
   * Parses and handles the BitmapFill DrawFill attributes
   * 
   * @param target
   *          Target SVG element
   * @return SVGDocumentWrapper
   */
  private SVGDocumentWrapper parseBitmapFill(Element target)
  {
    String imageNameId = ivStyleMap.get(ODFConstants.ODF_ATTR_DRAW_FILL_IMAGE_NAME);

    List<Node> bitmapDef = ODPConvertStyleMappingUtil.getDrawNameNodesByKey(ivContext, imageNameId);
    for (int j = 0; bitmapDef != null && j < bitmapDef.size(); j++)
    {
      Node bitmapStyle = bitmapDef.get(j);
      if (bitmapStyle instanceof DrawFillImageElement)
      {
        DrawFillImageElement element = (DrawFillImageElement) bitmapStyle;

        // Get/Create the Defs Element
        Element defs = createDefsElement();

        // Create the Pattern Element
        Element pattern = ivWrapper.getDocument().createElementNS(svgNS, PATTERN);
        pattern.setAttribute(ODFConstants.SVG_ATTR_PRESERVE_ASPECT_RATIO, ODFConstants.HTML_VALUE_NONE);
        pattern.setAttribute(ODFConstants.SVG_MARKER_ID, imageNameId);
        pattern.setAttribute(PATTERN_CONTENT_UNITS, USER_SPACE_ON_USE);
        pattern.setAttribute(ODFConstants.SVG_ATTR_WIDTH, FULL);
        pattern.setAttribute(ODFConstants.SVG_ATTR_HEIGHT, FULL);

        // Create the Image Element
        String targetRoot = (String) ivContext.get(ODFConstants.CONTEXT_TARGET_BASE);
        String imageURL = ODFConstants.FILE_URL_PREFIX + File.separator + targetRoot + File.separator + element.getXlinkHrefAttribute();
        ODFDrawingParser.registerImage(ivContext, imageURL); // Register Bitmap Fill Image URL

        Element image = ivWrapper.getDocument().createElementNS(svgNS, IMAGE);
        image.setAttribute(ODFConstants.SVG_ATTR_PRESERVE_ASPECT_RATIO, ODFConstants.HTML_VALUE_NONE);
        image.setAttribute(ODFConstants.ODF_ATTR_XLINK_HREF, imageURL);
        image.setAttribute(ODFConstants.SVG_ATTR_WIDTH, FULL);
        image.setAttribute(ODFConstants.SVG_ATTR_HEIGHT, FULL);

        // Add the Defs and Fill reference to the SVG Document
        pattern.appendChild(image);
        defs.appendChild(pattern);

        String drawName = URL_PREFIX + imageNameId + ")";
        target.setAttributeNS(svgNS, ODFConstants.SVG_ATTR_FILL, drawName);
      }
    }

    return ivWrapper;
  }

  /**
   * Parses and handles the GradientFill DrawFill attributes
   * 
   * @param target
   *          Target SVG element
   * @return void
   */
  private void parseGradientFill(Element target)
  {
    String gradientName = ivStyleMap.get(ODFConstants.ODF_ATTR_DRAW_FILL_GRADIENT_NAME);
    List<Node> gradDef = ODPConvertStyleMappingUtil.getDrawNameNodesByKey(ivContext, gradientName);
    for (int j = 0; gradDef != null && j < gradDef.size(); j++)
    {
      Node gradStyle = gradDef.get(j);
      if (gradStyle instanceof DrawGradientElement)
      {
        DrawGradientElement element = (DrawGradientElement) gradStyle;
        String drawStyle = element.getDrawStyleAttribute();
        String drawName = URL_PREFIX + element.getDrawNameAttribute() + ")";

        Element defs = createDefsElement();
        Element gradient = null;
        if (isLinearMode(drawStyle))
        {
          gradient = createLinearDef(element);
        }
        else if (isRadialMode(drawStyle))
        {
          gradient = createRadialDef(element);
        }
        defs.appendChild(gradient);
        parseGradientStyleAttributes(element, gradient);
        target.setAttributeNS(svgNS, ODFConstants.SVG_ATTR_FILL, drawName);
      }
    }
  }

  /**
   * Parses the Gradient style attributes
   * 
   * @param gradientStyle
   *          Gradient style
   * @param target
   *          Target SVG element
   * @return void
   */
  private void parseGradientStyleAttributes(Node gradientStyle, Element target)
  {
    NamedNodeMap attrs = gradientStyle.getAttributes();
    for (int i = 0; i < attrs.getLength(); i++)
    {
      Node attr = attrs.item(i);
      String attrName = attr.getNodeName();

      String svgAttrName = SVG_ODP_MAP.find(attrName);
      if (svgAttrName != null)
      {
        String attrValue = ivStyleMap.get(attrName);

        if (attrName.equals(ODFConstants.ODF_ATTR_DRAW_OPACITY))
        {
          double value = Double.parseDouble(attrValue.substring(0, attrValue.indexOf('%'))) / 100;
          attrValue = String.valueOf(value);
        }
        else
        {
          if (attrValue != null)
          {
            Measure avMeasure = Measure.parseNumber(attrValue);
            if ((avMeasure.isCMMeasure()) || (avMeasure.isINMeasure()))
            {
              attrValue = String.valueOf(convertCMToPixel(avMeasure)); // This method handles both
            }
          }
        }

        target.setAttributeNS(null, svgAttrName, attrValue);
      }
    }
  }

  /**
   * Parses and handles the DrawStroke attributes
   * 
   * @param target
   *          Target SVG element
   * @return void
   */
  private void parseDrawStroke(Element target)
  {
    // Compute the base for the Shape based on the Viewbox
    double base = 1.0;
    boolean hasViewBox = ivSvgRoot.hasAttribute(ODFConstants.SVG_ATTR_VIEWBOX);

    // if (hasViewBox)
    // {
    // String viewBox = ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_VIEWBOX);
    // String[] view = viewBox.split(SPACE);
    // double base_Width = Double.parseDouble(view[2]) - Double.parseDouble(view[0]);
    // double base_Height = Double.parseDouble(view[3]) - Double.parseDouble(view[1]);
    //
    // base = Math.max(base_Width, base_Height);
    // if (base > 21600.0)
    // base = 28000.0;
    // }

    // double dStrokeWidth = 0.0;
    String drawStroke = ivStyleMap.get(ODFConstants.ODF_ATTR_DRAW_STROKE);
    String drawStrokeColor = ivStyleMap.get(ODFConstants.ODF_ATTR_SVG_STROKE_COLOR);

    // Ensure draw:stroke and draw:stroke-color are set - ODT documents don't set the draw:stroke unless it is dashed
    if (!isUsingODPRules())
    {
      if (drawStroke == null)
      {
        drawStroke = SOLID;
        ivStyleMap.put(ODFConstants.ODF_ATTR_DRAW_STROKE, drawStroke);
        ivStyleMap.put(ODFConstants.SVG_ATTR_STROKE, drawStroke);
      }

      if (drawStrokeColor == null)
      {
        drawStrokeColor = BLACK;
        ivStyleMap.put(ODFConstants.ODF_ATTR_SVG_STROKE_COLOR, drawStrokeColor);
      }

      String drawStrokeWidth = ivStyleMap.get(ODFConstants.ODF_ATTR_SVG_STROKE_WIDTH);
      if (drawStrokeWidth == null)
      {
        drawStrokeWidth = MINIMAL_WIDTH;
        ivStyleMap.put(ODFConstants.ODF_ATTR_SVG_STROKE_WIDTH, drawStrokeWidth);
      }
    }
    else
    {
      if (drawStroke == null)
      {
        drawStroke = ODFConstants.HTML_VALUE_NONE;
        ivStyleMap.put(ODFConstants.SVG_ATTR_STROKE, drawStroke);
      }

      if (drawStrokeColor == null)
      {
        drawStrokeColor = BLACK;
        ivStyleMap.put(ODFConstants.ODF_ATTR_SVG_STROKE_COLOR, drawStrokeColor);
      }

      String drawStrokeWidth = ivStyleMap.get(ODFConstants.ODF_ATTR_SVG_STROKE_WIDTH);
      if (drawStrokeWidth == null)
      {
        drawStrokeWidth = MINIMAL_WIDTH;
        ivStyleMap.put(ODFConstants.ODF_ATTR_SVG_STROKE_WIDTH, drawStrokeWidth);
      }
    }

    // Handle the Draw Stroke attributes
    if (drawStroke.equals(ODFConstants.HTML_VALUE_NONE))
    {
      target.setAttributeNS(null, ODFConstants.SVG_ATTR_STROKE, ODFConstants.HTML_VALUE_NONE);
      return; // No more draw:stroke work to complete
    }
    else
    {
      target.setAttributeNS(null, ODFConstants.SVG_ATTR_STROKE, drawStrokeColor);

      String attrValue = ivStyleMap.get(ODFConstants.ODF_ATTR_SVG_STROKE_WIDTH);
      if (hasViewBox)
      {
        if (isLineOrConnector(ivType))
          attrValue = String.valueOf(convertCMToSVGValue(attrValue));
        else
        {
          String viewBox = ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_VIEWBOX);
          String[] view = viewBox.split(SPACE);
          double base_Width = Double.parseDouble(view[2]) - Double.parseDouble(view[0]);
          double base_Height = Double.parseDouble(view[3]) - Double.parseDouble(view[1]);

          // A bit of a hack follows. Our draw:stroke does not compute correctly when the viewbox
          // proportion is way different than the actual width in height. Like in the case of a
          // draw:type="can", our viewport was nearly symmetrical 147 height vs 121 width, however
          // our view box is (0 0 88 21600). If this is the case, (else leg) we remove the percentage
          // from the draw:stroke.
          if (isProportional(base_Width, base_Height))
          {
            double dWidth = Double.parseDouble(ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_WIDTH));

            String sPageWidth = (String) ivContext.get(ODFConstants.CONTEXT_PAGE_WIDTH);
            double dPageWidth = convertCMToPixel(Measure.parseNumber(sPageWidth));

            double value = convertCMToPixel(Measure.parseNumber(attrValue));
            double dAttrValue;
            // The logic below is we divide the stroke-width by the page width to get a stroke-width percent based on page.
            // However, the stroke-width we need is a percentage of the view-box (not the page). So we multiply by the ratio
            // of page width vs object width.
            // NOTE: We always used widths to caluclate draw-stroke in the scenario below.
            dAttrValue = value * 100.0 / dPageWidth;
            dAttrValue = dAttrValue * (dPageWidth / dWidth);
            attrValue = MeasurementUtil.formatDecimal(dAttrValue) + ODFConstants.SYMBOL_PERCENT;
          }
          else
          {
            double dWidth = Double.parseDouble(ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
            double dHeight = Double.parseDouble(ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));

            double value = convertCMToPixel(Measure.parseNumber(attrValue));
            if (dWidth < dHeight)
              attrValue = String.valueOf(value * 100.0 / dWidth);
            else
              attrValue = String.valueOf(value * 100.0 / dHeight);
          }
        }
      }
      else
      {
        if (((Element) target.getParentNode()).hasAttribute(ODFConstants.CONVERTED_POLY_LINE))
        {
          double dWidth = Double.parseDouble(ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
          double dHeight = Double.parseDouble(ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
          if (dWidth < dHeight)
            attrValue = MeasurementUtil.convertCMToPercentage(ODFConstants.SVG_ATTR_WIDTH, convertCMToPixel(Measure.parseNumber(attrValue))
                * ODFConstants.CM_TO_INCH_CONV / 96, ivContext);
          else
            attrValue = MeasurementUtil.convertCMToPercentage(ODFConstants.SVG_ATTR_HEIGHT,
                convertCMToPixel(Measure.parseNumber(attrValue)) * ODFConstants.CM_TO_INCH_CONV / 96, ivContext);
        }
        else
          attrValue = String.valueOf(convertCMToPixel(Measure.parseNumber(attrValue)));
      }

      target.setAttributeNS(null, ODFConstants.SVG_ATTR_STROKE_WIDTH, attrValue);

      if (drawStroke.equals(ODFConstants.ODF_ATTR_VALUE_DASH))
      {
        // We aren't going to support all dashed styles, so use a default
        target.setAttributeNS(null, ODFConstants.SVG_ATTR_STROKE_DASHARRAY, DEFAULT_DASHARRAY);
        target.setAttributeNS(null, ODFConstants.SVG_ATTR_STROKE_DASHOFFSET, DEFAULT_DASHOFFSET);
      }

      String strokeWidth = ivStyleMap.get(ODFConstants.ODF_ATTR_SVG_STROKE_WIDTH);
      if (strokeWidth != null)
      {
        // dStrokeWidth = this.computeSvgStrokeWidth(strokeWidth, target, base, hasViewBox);
        this.computeSvgStrokeWidth(strokeWidth, target, base, hasViewBox); // Don't think this is doing anything
      }
    }

    // // Reset Attributes
    // resetAttributes(dStrokeWidth);
    // if (ivSvgRoot.hasAttribute(ODFConstants.SVG_ATTR_WIDTH) && ivSvgRoot.hasAttribute(ODFConstants.SVG_ATTR_HEIGHT))
    // {
    // double dWidth = Double.parseDouble(ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
    // double dHeight = Double.parseDouble(ivSvgRoot.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
    // double aBase = Math.max(dWidth, dHeight);
    // if (hasViewBox)
    // {
    // if (isLineOrConnector(ivType))
    // {
    // ivSvgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf((dStrokeWidth * 100 / base) * aBase + dWidth));
    // ivSvgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf((dStrokeWidth * 100 / base) * aBase + dHeight));
    // }
    // else
    // {
    // ivSvgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(Math.ceil(dStrokeWidth * base / (21600) + dWidth)));
    // ivSvgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(Math.ceil(dStrokeWidth * base / (21600) + dHeight)));
    // }
    // }
    // else
    // {
    // if (isLineOrConnector(ivType))
    // {
    // // Calculate Minimum Height/Width of frame based on Draw Stroke Width relative to Page Size
    // double minWidth = MeasurementUtil.convertCMToPercentageNumber(WIDTH, dStrokeWidth, ivContext);
    // double minHeight = MeasurementUtil.convertCMToPercentageNumber(HEIGHT, dStrokeWidth, ivContext);
    //
    // if (minWidth > dWidth)
    // {
    // ivContext.put(ODFConstants.CONTEXT_MIN_SHAPE_DIV_WIDTH, String.valueOf(Math.ceil(minWidth + dWidth)));
    // }
    // if (minHeight > dHeight)
    // {
    // ivContext.put(ODFConstants.CONTEXT_MIN_SHAPE_DIV_HEIGHT, String.valueOf(Math.ceil(minHeight + dHeight)));
    // }
    // ivSvgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(Math.ceil(minWidth + dWidth)));
    // ivSvgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(Math.ceil(minHeight + dHeight)));
    // }
    // else
    // {
    // ivSvgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(Math.ceil(dStrokeWidth + dWidth)));
    // ivSvgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(Math.ceil(dStrokeWidth + dHeight)));
    // }
    // }
    // }
  }

  /**
   * 
   * @param width
   *          - width of view box
   * @param height
   *          - height of view box
   * @return true if the heigh vs width ration is within the setting of SHAPE_PROPORTION
   */
  private boolean isProportional(double width, double height)
  {
    return (((Math.abs(width / height) > (1 / SHAPE_PROPORTION)) && (Math.abs(width / height) < SHAPE_PROPORTION)));
  }

  /**
   * Computes the SVG Stroke Width
   * 
   * @param strokeWidth
   *          Initial stroke width
   * @param SVG
   *          target
   * @param base
   *          Base object size
   * @param hasViewBox
   *          Flag indicating whether there is a viewbox or not
   * @return double New stroke width
   */
  private double computeSvgStrokeWidth(String strokeWidth, Element target, double base, boolean hasViewBox)
  {
    double dStrokeWidth;
    if (strokeWidth.equals(ZERO_CM) || strokeWidth.equals(ZERO_IN))
    {
      dStrokeWidth = 1;
      if (hasViewBox)
      {
        target.setAttributeNS(null, ODFConstants.SVG_ATTR_STROKE_WIDTH, String.valueOf(base / 216));
      }
      else
      {
        target.setAttributeNS(null, ODFConstants.SVG_ATTR_STROKE_WIDTH, String.valueOf(dStrokeWidth));
      }
    }
    else
    {
      if (isLineOrConnector(ivType))
        dStrokeWidth = convertCMToSVGValue(strokeWidth) / 100;
      else
      {
        dStrokeWidth = convertCMToPixel(Measure.parseNumber(strokeWidth));
      }
    }
    return dStrokeWidth;
  }

  // private void resetAttributes(double dStrokeWidth)
  // {
  // Element svgRoot = ivWrapper.getDocument().getDocumentElement();
  // if (svgRoot.hasAttribute(ODFConstants.SVG_ATTR_VIEWBOX))
  // {
  // reviseViewBox(svgRoot, dStrokeWidth);
  // if (!svgRoot.hasAttribute(ODFConstants.SVG_ATTR_WIDTH) || !svgRoot.hasAttribute(ODFConstants.SVG_ATTR_HEIGHT))
  // {
  // resetWHAttributes(svgRoot, ivType);
  // }
  // }
  // else
  // {
  // if (ivType.equals(ELLIPSE))
  // {
  // resetEllipseAttributes(svgRoot, dStrokeWidth);
  // }
  // else if (ivType.equals(RECT))
  // {
  // resetRectAttributes(svgRoot, dStrokeWidth);
  // }
  // else if (ivType.equals(CIRCLE))
  // {
  // resetCircleAttributes(svgRoot, dStrokeWidth);
  // }
  // }
  // }
  //
  // private void resetEllipseAttributes(Element svgRoot, double dStrokeWidth)
  // {
  // NodeList ellipseList = svgRoot.getElementsByTagName(ELLIPSE);
  // if (ellipseList != null)
  // {
  // for (int i = 0; i < ellipseList.getLength(); i++)
  // {
  // Node ellispe = ellipseList.item(i);
  // if (ellispe instanceof Element)
  // {
  // Element e = (Element) ellispe;
  // double cx = Double.parseDouble(e.getAttribute(ODFConstants.SVG_ELLIPSE_ATTR_CX));
  // e.setAttributeNS(null, ODFConstants.SVG_ELLIPSE_ATTR_CX, String.valueOf(cx + dStrokeWidth / 2));
  // double cy = Double.parseDouble(e.getAttribute(ODFConstants.SVG_ELLIPSE_ATTR_CY));
  // e.setAttributeNS(null, ODFConstants.SVG_ELLIPSE_ATTR_CY, String.valueOf(cy + dStrokeWidth / 2));
  // double width = Double.parseDouble(e.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
  // svgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(width));
  // double height = Double.parseDouble(e.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
  // svgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(height));
  // }
  //
  // }
  // }
  // }
  //
  // private void resetCircleAttributes(Element svgRoot, double dStrokeWidth)
  // {
  // NodeList circleList = svgRoot.getElementsByTagName(CIRCLE);
  // if (circleList != null)
  // {
  // for (int i = 0; i < circleList.getLength(); i++)
  // {
  // Node circle = circleList.item(i);
  // if (circle instanceof Element)
  // {
  // Element e = (Element) circle;
  //
  // // Circles don't use X and Y, so remove them
  // e.removeAttributeNS(null, ODFConstants.SVG_CIRCLE_ATTR_X);
  // e.removeAttributeNS(null, ODFConstants.SVG_CIRCLE_ATTR_Y);
  //
  // // Adjust the Height and Width
  // double width = Double.parseDouble(e.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
  // svgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(width));
  // double height = Double.parseDouble(e.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
  // svgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(height));
  //
  // // Set the CX, CY, and R at half that of the height/width
  // String radius = String.valueOf(width / 2);
  // e.setAttributeNS(null, ODFConstants.SVG_ELLIPSE_ATTR_CX, radius);
  // e.setAttributeNS(null, ODFConstants.SVG_ELLIPSE_ATTR_CY, radius);
  // e.setAttributeNS(null, ODFConstants.SVG_CIRCLE_ATTR_R, radius);
  // }
  //
  // }
  // }
  // }

  // private void resetWHAttributes(Element svgRoot, String label)
  // {
  // NodeList polylineList = svgRoot.getElementsByTagName(label);
  // if (polylineList != null)
  // {
  // for (int i = 0; i < polylineList.getLength(); i++)
  // {
  // Node polyline = polylineList.item(i);
  // if (polyline instanceof Element)
  // {
  // Element e = (Element) polyline;
  // double width = Double.parseDouble(e.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
  // svgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(width));
  // double height = Double.parseDouble(e.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
  // svgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(height));
  // }
  //
  // }
  // }
  // }
  //
  // private void resetRectAttributes(Element svgRoot, double dStrokeWidth)
  // {
  // NodeList rectList = svgRoot.getElementsByTagName(RECT);
  // if (rectList != null)
  // {
  // for (int i = 0; i < rectList.getLength(); i++)
  // {
  // Node rect = rectList.item(i);
  // if (rect instanceof Element)
  // {
  // Element e = (Element) rect;
  // String xAttr = e.getAttribute("x");
  // double x = 0.0;
  // if (xAttr != null && !xAttr.equals(""))
  // x = Double.parseDouble(xAttr);
  // e.setAttributeNS(null, "x", String.valueOf(x + dStrokeWidth / 2));
  // String yAttr = e.getAttribute("y");
  // double y = 0.0;
  // if (yAttr != null && !yAttr.equals(""))
  // y = Double.parseDouble(yAttr);
  // e.setAttributeNS(null, "y", String.valueOf(y + dStrokeWidth / 2));
  // double width = Double.parseDouble(e.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
  // svgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(width));
  // double height = Double.parseDouble(e.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
  // svgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(height));
  // }
  //
  // }
  // }
  // }
  //
  // private void reviseViewBox(Element element, double dStrokeWidth)
  // {
  // // revise the viewBox according to the stroke width
  //
  // String viewBox = element.getAttribute(ODFConstants.SVG_ATTR_VIEWBOX);
  // String[] parameters = viewBox.split(SPACE);
  // StringBuilder newViewBox = new StringBuilder(32);
  //
  // double viewBox_width = Double.parseDouble(parameters[2]);
  // double viewBox_height = Double.parseDouble(parameters[3]);
  // double base_View = Math.min(viewBox_width, viewBox_height);
  // double viewBox_left = Double.parseDouble(parameters[0]);
  // double viewBox_top = Double.parseDouble(parameters[1]);
  // if (isLineOrConnector(ivType))
  // {
  // viewBox_left -= dStrokeWidth * 100 / 2;
  // viewBox_top -= dStrokeWidth * 100 / 2;
  // viewBox_width += Math.ceil(dStrokeWidth * 100);
  // viewBox_height += Math.ceil(dStrokeWidth * 100);
  // }
  // else
  // {
  // double wStroke = (dStrokeWidth / 2) * 100 * base_View / 21600;
  // viewBox_left = Math.floor(viewBox_left - wStroke);
  // viewBox_top = Math.floor(viewBox_top - wStroke);
  // viewBox_width = viewBox_width + 2 * Math.ceil(wStroke);
  // viewBox_height = viewBox_height + 2 * Math.ceil(wStroke);
  //
  // }
  // element.setAttributeNS(
  // null,
  // ODFConstants.SVG_ATTR_VIEWBOX,
  // newViewBox.append(viewBox_left).append(SPACE).append(viewBox_top).append(SPACE).append(viewBox_width).append(SPACE)
  // .append(viewBox_height).toString());
  // }

  /**
   * Determines if style is Linear
   * <p>
   * 
   * @param drawStyle
   *          Draw style
   * @return boolean true if the style is Linear
   */
  private boolean isLinearMode(String drawStyle)
  {
    return drawStyle.equals(LINEAR) || drawStyle.equals(AXIAL);
  }

  /**
   * Determines if style is Radial
   * <p>
   * 
   * @param drawStyle
   *          Draw style
   * @return boolean true if the style is Radial
   */
  private boolean isRadialMode(String drawStyle)
  {
    return drawStyle.equals(RADIAL) || drawStyle.equals(ELLIPSOID) || drawStyle.equals(SQUARE) || drawStyle.equals(RECTANGULAR);
  }

  /**
   * Determines if Shape is a Line type
   * <p>
   * 
   * @param type
   *          Shape type
   * @return boolean true if the Shape is a Line type
   */
  private boolean isLineOrConnector(String type)
  {
    return type.equals(LINE) || type.equals(CONNECTOR) || type.equals(POLYLINE) || type.equals(POLYGON) || type.equals(MEASURE)
        || type.equals(PATH);
  }

  /**
   * Determines if Shape type is fillable
   * <p>
   * 
   * @param type
   *          Shape type
   * @return boolean true if the Shape is fillable
   */
  private boolean isFillable(String type)
  {
    // Polygons are Line type Shapes that are by definition Fillable
    if (type.equals(POLYGON))
    {
      return true;
    }
    // Path Line type Shapes are Fillable if the Path is marked closed
    if (isLineOrConnector(type) && !ivWrapper.isClosed())
    {
      return false;
    }
    // Any other Shapes are assumed to be fillable
    return true;
  }

  /**
   * Determines if Shape type can have Arrows
   * <p>
   * 
   * @param type
   *          Shape type
   * @return boolean true if the Shape can have Arrows
   */
  private boolean isWithArrows(String type)
  {
    return type.equals(LINE) || type.equals(CONNECTOR) || type.equals(MEASURE);
  }

  /**
   * Returns the target Shape Element
   * <p>
   * 
   * @param type
   *          Shape type
   * @return Element Shape element (or Root if not found)
   */
  private Element getTargetElementByType(String type)
  {
    String expectedSvgType = cvSvgTypeMap.get(type);
    if (expectedSvgType == null)
    {
      return ivSvgRoot;
    }

    NodeList nodeList = ivSvgRoot.getChildNodes();
    if (nodeList != null)
    {
      for (int i = 0; i < nodeList.getLength(); i++)
      {
        Node node = nodeList.item(i);
        String nodeName = node.getNodeName();
        if ((nodeName.equals(expectedSvgType)) && (node instanceof Element))
        {
          return (Element) node;
        }
      }
    }
    //log.info("Expected SVG Type not found for " + type + " - reverting to SVG document root");
    return ivSvgRoot;
  }

  private double convertCMToSVGValue(String value)
  {
    Measure measure = Measure.parseNumber(value);
    double dValue = measure.getNumber();
    if (measure.isCMMeasure())
    {
      double pixel = dValue * 1000;
      return pixel;
    }
    if (measure.isINMeasure())
    {
      double pixel = dValue * Measure.IN_CM_CONVERSION * 1000;
      return pixel;
    }
    return 0.0;
  }

  private double convertCMToSVGValue(Measure measure)
  {
    double dValue = measure.getNumber();
    if (measure.isCMMeasure())
    {
      double pixel = dValue * 1000;
      return pixel;
    }
    if (measure.isINMeasure())
    {
      double pixel = dValue * Measure.IN_CM_CONVERSION * 1000;
      return pixel;
    }
    return 0.0;
  }

  private double convertCMToPixel(Measure measure)
  {
    boolean converted = measure.convertCMToPixel();
    if (converted)
    {
      return measure.getNumber();
    }
    else
      return 0.0;
  }
}
