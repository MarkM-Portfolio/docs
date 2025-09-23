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

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.batik.dom.svg.SVGDOMImplementation;
import org.apache.batik.ext.awt.image.spi.ImageTagRegistry;
import org.apache.batik.util.ParsedURL;
import org.apache.commons.lang.StringUtils;
import org.odftoolkit.odfdom.doc.office.OdfOfficeEventListeners;
import org.odftoolkit.odfdom.dom.attribute.draw.DrawPointsAttribute;
import org.odftoolkit.odfdom.dom.attribute.draw.DrawTransformAttribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgDAttribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgHeightAttribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgViewBoxAttribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgWidthAttribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgX1Attribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgX2Attribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgXAttribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgY1Attribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgY2Attribute;
import org.odftoolkit.odfdom.dom.attribute.svg.SvgYAttribute;
import org.odftoolkit.odfdom.dom.element.draw.DrawCircleElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawConnectorElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawCustomShapeElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawEllipseElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawEnhancedGeometryElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawLineElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawMeasureElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawPathElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawPolygonElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawPolylineElement;
import org.odftoolkit.odfdom.dom.element.svg.SvgDescElement;
import org.odftoolkit.odfdom.dom.element.svg.SvgTitleElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Encoder;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class ODFDrawingParser
{
  private static final String CLASS = ODFDrawingParser.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  public static final boolean DEBUG = false; // NOTE: This should be set to false in the final build.

  // Default Initial Capacity for the Non Straight Path Commands HashSet
  private static final int NON_STRAIGHT_PATH_SET_CAPACITY = (int) (12 * 1.33) + 1;

  // Z|z - closed
  // C|c - curve
  // S|s - smooth curve
  // Q|q - quadratic bezier curve
  // T|t - Shorthand smoth quadratic bezier curve
  // A|a - elliptical arc
  private static final HashSet<String> cvNonStraightPathCommands = new HashSet<String>(NON_STRAIGHT_PATH_SET_CAPACITY);
  static
  {
    cvNonStraightPathCommands.add("Z");
    cvNonStraightPathCommands.add("z");
    cvNonStraightPathCommands.add("C");
    cvNonStraightPathCommands.add("c");
    cvNonStraightPathCommands.add("S");
    cvNonStraightPathCommands.add("s");
    cvNonStraightPathCommands.add("Q");
    cvNonStraightPathCommands.add("q");
    cvNonStraightPathCommands.add("T");
    cvNonStraightPathCommands.add("t");
    cvNonStraightPathCommands.add("A");
    cvNonStraightPathCommands.add("a");
  }

  // =======================================================================
  // Instance Variables
  // =======================================================================
  private Document htmlDocument;

  private String base;

  private ConversionContext context;

  // private OdfDocument ivOdfDoc;

  private GraphicPropertiesParser ivParser;

  private String ivDestinationDir = ODFConstants.FILE_PICTURE_PREFIX;

  private boolean ivSuccessful = false;

  private boolean ivODPRules = false;

  private boolean ivDebugMode = true;

  private boolean ivRecordTime = true;

  private boolean ivDCSEHorizontalOrVertical = false;

  private JSONObject ivSizeMap = null;

  private long ivEncodingThreshold = 0;

  private boolean ivGenerateShapeAsSvg = false;

  private boolean ivGenerateShapeAsImage = true;

  private ODFConstants.DOCUMENT_TYPE ivDocumentType = ODFConstants.DOCUMENT_TYPE.UNKNOWN;

  private String ivImgSrc = null;

  private String ivName = null;

  private String ivAltTag = "";

  private String ivDescTag = null;

  // =======================================================================
  // Constants
  // =======================================================================

  private static final long MAX_SUBTASK_TIMEOUT = 10000; // 10 seconds per subtask

  private static final long MAX_IMAGE_SIZE = 5000; // Maximum dimensions of Image in SVG Units

  private static final String SVG_NS = SVGDOMImplementation.SVG_NAMESPACE_URI;

  private static final String POLYGON = "polygon";

  private static final String RECT = "rect";

  private static final String RECTANGLE = "rectangle";

  private static final String ELLIPSE = "ellipse";

  private static final String MSO_ELLIPSE = "mso_sptEllipse";

  private static final String CIRCLE = "circle";

  // private static final String CIRCULAR_ARROW = "circular-arrow";
  //
  // private static final String CALLOUT = "callout";
  //
  // private static final String CL_RECTANGLE = "cl-rectangle";
  //
  // private static final String MICROSOFT_OBJECT = "mso";

  private static final String NON_PRIMITIVE = "non-primitive";

  private static final String RING = "ring";

  private static final String FRAME = "frame";

  private static final String SMILEY = "smiley";

  private static final String FORBIDDEN = "forbidden";

  private static final String FILL_RULE = "fill-rule";

  private static final String EVENODD = "evenodd";

  private static final String ZERO_CM = "0cm";

  private static final String ZERO_PERCENT = "0%";

  private static final String HUNDRED_PERCENT = "100%";

  private static final String HAS_TEXT = "hasText";

  private static final String BLACK = "black";

  private static final String FLIP_H = " flipH";

  private static final String FLIP_V = " flipV";

  private static final String FLIP_VH = " flipVH";

  private static final String ROTATE = "rotate";

  private static final String SKEW_X = "skewX";

  private static final String TRANSLATE = "translate";

  private static final double ONEMILLION = 1000000;

  private static final double ONEHUNDREDTHOUSAND = 100000;

  public static final String LEFT_DELTA = "left_delta";

  public static final String TOP_DELTA = "top_delta";

  public static final String LEFT_OFFSET = "left_Offset";

  public static final String TOP_OFFSET = "top_Offset";

  public static final String CONTEXT_IMAGE_URL_REGISTRY = "ImageURLRegistry";

  public static final String ATTRIBUTE_ELEMENT = "AttrElement";

  public static final int SVG = 0;

  public static final int IMAGE = 1;

  private static final String SHAPE_ID_PREFIX = "SHAPE_";

  /**
   * Clears the Batik ImageTagRegistry Cache
   * 
   * @param context
   *          Conversion context
   * @return void
   */
  @SuppressWarnings("unchecked")
  public static final void flushCache(ConversionContext context)
  {
    HashSet<String> imageURLs = (HashSet<String>) context.get(CONTEXT_IMAGE_URL_REGISTRY);
    if (imageURLs != null)
    {
      ImageTagRegistry registry = ImageTagRegistry.getRegistry();
      Iterator<String> iterator = imageURLs.iterator();
      while (iterator.hasNext())
      {
        String url = iterator.next();
        try
        {
          registry.flushImage(new ParsedURL(url));
        }
        catch (Exception e)
        {
          log.logp(Level.WARNING, CLASS, "Failure occurred while attempting to clear a URL from the Batik cache: " + url,
              e.getLocalizedMessage(), e);
        }
      }

      // Iterator<ImageReader> iter = ImageIO.getImageReadersByFormatName("jpeg");
      // while (iter.hasNext())
      // {
      // ImageReader reader = iter.next();
      // System.out.println("Disposing of an JPEG ImageReader");
      // reader.dispose();
      // }
      //
      // iter = ImageIO.getImageReadersByFormatName("png");
      // while (iter.hasNext())
      // {
      // ImageReader reader = iter.next();
      // System.out.println("Disposing of an PNG ImageReader");
      // reader.dispose();
      // }
    }
  }

  /**
   * Tracks URLs for Images used for Bitmap Fill (used for later cleanup in flushCache())
   * 
   * @param context
   *          Conversion context
   * @param url
   *          Image URL to register
   * @return void
   */
  @SuppressWarnings("unchecked")
  public static final void registerImage(ConversionContext context, String url)
  {
    HashSet<String> imageURLs = (HashSet<String>) context.get(CONTEXT_IMAGE_URL_REGISTRY);
    if (imageURLs == null)
    {
      imageURLs = new HashSet<String>();
      context.put(CONTEXT_IMAGE_URL_REGISTRY, imageURLs);
    }
    imageURLs.add(url);
  }

  public ODFDrawingParser(ConversionContext context)
  {
    htmlDocument = (Document) context.getTarget();
    this.context = context;
    // this.ivOdfDoc = (OdfDocument) context.getSource();
    ivParser = new GraphicPropertiesParser(context);
  }

  public ODFDrawingParser(ConversionContext context, String baseUri)
  {
    this(context);
    this.base = baseUri;
  }

  public final void setB64EncodingThreshold(long limit)
  {
    this.ivEncodingThreshold = limit;
  }

  public final long getB64EncodingThreshold()
  {
    return this.ivEncodingThreshold;
  }

  public final void setContextDocumentType(String type)
  {
    try
    {
      this.ivDocumentType = ODFConstants.DOCUMENT_TYPE.valueOf(type);
    }
    catch (Exception e)
    {
      this.ivDocumentType = ODFConstants.DOCUMENT_TYPE.UNKNOWN;
    }
  }

  public final String getContextDocumentType()
  {
    return this.ivDocumentType.toString();
  }

  public final void setBaseURI(String basePath)
  {
    base = basePath;
  }

  public final JSONObject getSizeMap()
  {
    return this.ivSizeMap;
  }

  public final void setGenerateShapeAsSvg(boolean generateAsSvg)
  {
    this.ivGenerateShapeAsSvg = generateAsSvg;
  }

  public final boolean generateShapeAsSvg()
  {
    return this.ivGenerateShapeAsSvg;
  }

  public final void setGenerateShapeAsImage(boolean generateAsImage)
  {
    this.ivGenerateShapeAsImage = generateAsImage;
  }

  public final boolean generateShapeAsImage()
  {
    return this.ivGenerateShapeAsImage;
  }

  public final void useODPRules(boolean useODPRules)
  {
    this.ivODPRules = useODPRules;
  }

  public final boolean isUsingODPRules()
  {
    return this.ivODPRules;
  }

  public final void setDebugMode(boolean debugMode)
  {
    this.ivDebugMode = debugMode;
  }

  public final boolean isDebugMode()
  {
    return this.ivDebugMode;
  }

  public final void recordTime(boolean recordTime)
  {
    this.ivRecordTime = recordTime;
  }

  public final boolean isRecordTime()
  {
    return this.ivRecordTime;
  }

  /**
   * Sets the destination directory for the new image
   * 
   * @param newvalue
   *          New destination directory name
   * @return void
   */
  public final void setDestinationDirectory(String newvalue)
  {
    this.ivDestinationDir = newvalue;
  }

  public final boolean successful()
  {
    return this.ivSuccessful;
  }

  public JSONObject parse(Node root, Node parent)
  {
    return parse(root, parent, true);
  }

  /**
   * Submit the parse and conversion of the shape to an element asynchronously.
   * 
   * @param root
   *          - the ODF shape element to convert
   * @param parent
   *          - the parent html node to which the generated html image is to be appended
   * @param stripText
   *          - True if the text within the shape should NOT be included in the generated image. False if it should be included.
   * @return boolean - True if the shape was previously converted (an error situation), false if it was successfully submitted. If
   *         successfully submitted, post processing will be required after the thread completes to append the image to the document and do
   *         any final modifications to the html structure.
   */
  public boolean submitParse(Node root, Node parent, boolean stripText)
  {
    Document doc = SVGDocumentFactory.createSVGDocument();
    SVGDocumentWrapper svgDoc = new SVGDocumentWrapper(doc);
    ivParser.setSVGDocument(svgDoc);
    ivParser.useODPRules(ivODPRules);

    ivSizeMap = svgDoc.getPosAttributeMap();

    // Save the document type in the sizeMap for post processing
    ivSizeMap.put(ODFConstants.CONTEXT_DOCUMENT_TYPE, getContextDocumentType());

    // Save off the svg:title and svg:desc (if found) for use in the img element
    setAccessibilityTags(root);

    // Get the root element (the 'svg' element).
    Element svgRoot = doc.getDocumentElement();
    svgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_PRESERVE_ASPECT_RATIO, ODFConstants.HTML_VALUE_NONE);

    // Shape -> SVG Support
    setAutomaticHtmlConcordId(svgRoot, SHAPE_ID_PREFIX);
    svgRoot.setAttributeNS(null, ODFConstants.HTML_ATTR_ALT, ivAltTag);
    svgRoot.setAttributeNS(null, ODFConstants.HTML_ATTR_STYLE, "width: 100%; height: 100%; position:relative;");

    // Set the width and height attributes on the root 'svg' element.
    Node width = root.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_SVG_WIDTH);
    Node height = root.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_SVG_HEIGHT);

    String type = root.getLocalName();
    svgDoc.setType(type);
    if ((root instanceof DrawCustomShapeElement) || (isClosedShape(type)))
    {
      ivDCSEHorizontalOrVertical = false;
      if (!isDCSEVerticalOrHorizontalLine(root))
      {
        svgRoot = parseAttributes(svgDoc, root, svgRoot);
        svgDoc = parse(svgDoc, root, svgRoot, stripText);
      }
      else
      {
        ivDCSEHorizontalOrVertical = true;
        svgRoot = parseAttributes(svgDoc, root, svgRoot);
        svgDoc = parseDCSEStraightLine(svgDoc, root, svgRoot);
      }
    }
    else
    {
      svgDoc = parse(svgDoc, root, svgRoot, stripText);
    }

    JSONObject transformMap = null;
    Node transformAttr = root.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_DRAWTRANSFORM);
    if (transformAttr != null && !isUsingODPRules())
    {
      String transform = transformAttr.getNodeValue();
      FuncParser parser = new FuncParser();
      transformMap = parser.parse(transform);
      double angle = Double.parseDouble((String) transformMap.get(ROTATE));
      ivParser.setShapeRotationAngle(angle);

      // Shape -> SVG - Rotation not supported yet
      setGenerateShapeAsImage(true);
      setGenerateShapeAsSvg(false);
    } else {
    	// ODP shape -> Image. rotation will handle in AbstractContentHtmlConvertor.java 
    	// DrawTransformParser.handleTransform.  same as textbox, rotation will add to first div. 
        setGenerateShapeAsImage(true);
        setGenerateShapeAsSvg(false);
        transformAttr = null;
    }

    List<String> classElements = getClassElements(root);
    parseStyle(classElements, svgDoc);

    // Save any adjustments to the height or width based on markers
    ivSizeMap.put(ODFConstants.SVG_HEIGHT_ADJUSTMENT, ivParser.getHeightAdjustmentCM());
    ivSizeMap.put(ODFConstants.SVG_WIDTH_ADJUSTMENT, ivParser.getWidthAdjustmentCM());

    // If this is a draw custom shape element vertical and horizontal line, we
    // need to massage the SVG to draw the line and connectors
    if (ivDCSEHorizontalOrVertical)
    {
      handleDCSELine(svgDoc);
    }
    ivSizeMap.put(ODFConstants.SVG_ATTR_VIEWBOX, svgRoot.getAttribute(ODFConstants.SVG_ATTR_VIEWBOX));

    if (transformAttr != null)
    {
    	//[OCS138209]  New:  Failed to edit this ODP file due to "java.lang.NullPointerException". [o]
    	String widthv = "2cm";
        if(width == null){
        	Node x1 = root.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_SVG_X1);
        	Node x2 = root.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_SVG_X2);
        	if(x1!=null && x2!=null){
        		String x2v = x2.getNodeValue();
        		String x1v = x1.getNodeValue();
        		double s=Math.abs(UnitUtil.extractNumber(x2v) - UnitUtil.extractNumber(x1v));
        		widthv = s+UnitUtil.getUnit(x2v);
        	}
        		
        } else {
        	widthv = width.getNodeValue();
        }
        String heightv = "2cm";
        if(height == null){
        	Node y1 = root.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_SVG_Y1);
        	Node y2 = root.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_SVG_Y2);
        	if(y1!=null && y2!=null){
        		String y2v = y2.getNodeValue();
        		String y1v = y1.getNodeValue();
        		double s = Math.abs(UnitUtil.extractNumber(y2v) - UnitUtil.extractNumber(y1v));
        		heightv = s+UnitUtil.getUnit(y2v);
        	}
        } else {
        	heightv = height.getNodeValue();
        }
      doc = normalizeTranform(svgDoc, transformMap, heightv, widthv);
      svgRoot = doc.getDocumentElement();
    }
    
    String id = ((Element)parent).getAttribute("id");
    String name = UUID.randomUUID().toString();
    if(id != null && !id.isEmpty()){
    	name = "svg" + id;
    }
    ivName = name;

    StringBuilder buf = new StringBuilder(128);
    buf.append(ODFConstants.HTML_STYLE_REL_POSITION);

    double image_width = 0;
    double image_height = 0;
    if (isLineOrConnector(root))
    {
      if (svgRoot.hasAttribute(ODFConstants.SVG_ATTR_WIDTH))
      {
        image_width = Double.parseDouble(svgRoot.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
        if (root instanceof DrawConnectorElement)
          // If the image width is less than 3 pixels, we process it as vertical
          // We don't change the orientation, just open up the view box to allow for marker placement
          if (image_width < 3.0)
          {
            Element path = getPathNode(svgRoot);
            if (path != null) // Probably again a poor PPTX conversion
              image_width = convertPathToLine(svgDoc, svgRoot, false);
          }
      }
      else
      {
        NamedNodeMap attributes = root.getAttributes();
        image_width = getCoordinateSizeInPixels(attributes.getNamedItem(ODFConstants.ODF_ATTR_SVG_X1),
            attributes.getNamedItem(ODFConstants.ODF_ATTR_SVG_X2));
      }
      if (svgRoot.hasAttribute(ODFConstants.SVG_ATTR_HEIGHT))
      {
        image_height = Double.parseDouble(svgRoot.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
        if (root instanceof DrawConnectorElement)
          // if the height is lest than 3 pixels, we are going to handle as horizontal
          if (image_height < 3.0)
          { // if the image height is less than 3 pixels, we process it as a horizontal element
            // We don't change the orientation, just open up the view box to allow for marker placement
            Element path = getPathNode(svgRoot);
            if (path != null) // Probably again a poor PPTX conversion
              image_height = convertPathToLine(svgDoc, svgRoot, true);
          }
      }
      else
      {
        NamedNodeMap attributes = root.getAttributes();
        image_height = getCoordinateSizeInPixels(attributes.getNamedItem(ODFConstants.ODF_ATTR_SVG_Y1),
            attributes.getNamedItem(ODFConstants.ODF_ATTR_SVG_Y2));
      }
    }
    else
    {
      String viewBox = (String) ivSizeMap.get(ODFConstants.SVG_ATTR_VIEWBOX);
      String width_Value = width.getNodeValue();
      image_width = Math.ceil(Math.abs(convertCMToPixel(width_Value)));
      if (svgRoot.hasAttribute(ODFConstants.SVG_ATTR_WIDTH) && !svgRoot.hasAttribute(ODFConstants.CONVERTED_POLY_LINE))
      {
        image_width = Double.parseDouble(svgRoot.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
        if (viewBox == null || viewBox.length() == 0)
          image_width = adjustDimensionForDrawStroke(svgRoot, image_width);

      }
      String height_value = height.getNodeValue();
      image_height = Math.abs(convertCMToPixel(height_value));
      if (svgRoot.hasAttribute(ODFConstants.SVG_ATTR_HEIGHT) && !svgRoot.hasAttribute(ODFConstants.CONVERTED_POLY_LINE))
      {
        image_height = Double.parseDouble(svgRoot.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
        if (viewBox == null || viewBox.length() == 0)
          image_height = adjustDimensionForDrawStroke(svgRoot, image_height);
      }
    }
    // If this object is copied in the editor, we need to add an attribute that contains
    // information needed by the copied too object.
    preserveAttributesForCopy((Element) root);

    ivSizeMap.put(ODFConstants.SVG_ATTR_WIDTH, String.valueOf(image_width));
    ivSizeMap.put(ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(image_height));

    // Make sure the SVG Height/Width are at least 1, otherwise SVG doesn't like it (and rounded to a whole number)
    Element element = doc.getDocumentElement();
    if (image_width < 1)
    {
      if (DEBUG)
      {
        log.info("Image width is " + image_width);
      }
      image_width = 1;
    }
    if (!svgRoot.hasAttribute(ODFConstants.CONVERTED_POLY_LINE))
      element.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, Double.toString(Math.round(image_width)));

    if (image_height < 1)
    {
      if (DEBUG)
      {
        log.info("Image height is " + image_height);
      }
      image_height = 1;
    }

    // Limit the image size to prevent excessively large images - Perhaps change this to throw an exception in the future
    if (image_height > MAX_IMAGE_SIZE || image_width > MAX_IMAGE_SIZE)
    {
      log.warning("Shape exceeds the maximum image dimension limit");
      createPlaceholderImageElement(parent);
      return true;
    }

    if (!svgRoot.hasAttribute(ODFConstants.CONVERTED_POLY_LINE))
      element.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, Double.toString(Math.round(image_height)));

    updateSVGFillToNone(svgDoc, element);

    // Convert text within shape to SVG
    if (doc.getDocumentElement().hasAttribute(HAS_TEXT))
    {
      String x, y, fontsize;
      double base_Width, base_Height;
      if (element.hasAttribute(ODFConstants.SVG_ATTR_VIEWBOX))
      {
        String viewBox = element.getAttribute(ODFConstants.SVG_ATTR_VIEWBOX);
        String[] view = viewBox.split(" ");
        base_Width = Double.parseDouble(view[2]);
        base_Height = Double.parseDouble(view[3]);
        x = String.valueOf(base_Width / 4);
        y = String.valueOf(base_Height / 2);
        fontsize = String.valueOf(base_Width / 6);
      }
      else
      {
        base_Width = Double.parseDouble(element.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
        base_Height = Double.parseDouble(element.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
        x = String.valueOf(base_Width / 4);
        y = String.valueOf(base_Height / 2);
        double fs = base_Width / 6;
        if (base_Width >= base_Height)
          fs = base_Height / 6;
        fontsize = String.valueOf(fs);
      }
      // element.setAttribute("fill", "none");

      Element txtElement = (Element) element.removeChild(element.getFirstChild());
      ;
      if (txtElement.getNodeName().toLowerCase().equals(ODFConstants.TEXT))
      {
        txtElement.setAttribute(ODFConstants.SVG_CIRCLE_ATTR_X, x);
        txtElement.setAttribute(ODFConstants.SVG_CIRCLE_ATTR_Y, y);
        txtElement.setAttribute(ODFConstants.CSS_FONT_SIZE, fontsize);
      }
      element.appendChild(txtElement);
    }

    // Get the svg width and height values which will be used to flip the image if necessary
    double widthValue;
    if (null == width)
      widthValue = 0.0;
    else
      widthValue = Measure.extractNumber(width.getNodeValue());

    double heightValue;
    if (null == height)
      heightValue = 0.0;
    else
      heightValue = Measure.extractNumber(height.getNodeValue());

    // If the shape is a custom-shape and a rectangle, adjust the svg to eliminate the stretching affect
    if (type.equals(ODFConstants.ODF_ATTR_CUSTOM_SHAPE) && isClosedRectangle(root, svgRoot))
      adjustSvgForRectangle(svgRoot, image_width, image_height);
    else
    {
      // Adjust viewbox and path if made up of extremely large values (> 100000)
      adjustXtraLargeViewboxAndPath(doc, svgRoot);
      // Check to see if this is a adjustable shape, ie viewbox is not proportional with the viewport
      adjustViewboxViewportRatio(svgRoot, image_width, image_height);
    }

    return submitCreateImageElement(context, root, doc, parent, name, ODFConstants.FILE_PNG, image_width, image_height, widthValue,
        heightValue);
  }

  public JSONObject parse(Node root, Node parent, boolean stripText)
  {
    Document doc = SVGDocumentFactory.createSVGDocument();
    SVGDocumentWrapper svgDoc = new SVGDocumentWrapper(doc);
    ivParser.setSVGDocument(svgDoc);
    ivParser.useODPRules(ivODPRules);

    ivSizeMap = svgDoc.getPosAttributeMap();

    // Save off the svg:title and svg:desc (if found) for use in the img element
    setAccessibilityTags(root);

    // Get the root element (the 'svg' element).
    Element svgRoot = doc.getDocumentElement();
    svgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_PRESERVE_ASPECT_RATIO, ODFConstants.HTML_VALUE_NONE);

    // Shape -> SVG Support
    setAutomaticHtmlConcordId(svgRoot, SHAPE_ID_PREFIX);
    svgRoot.setAttributeNS(null, ODFConstants.HTML_ATTR_ALT, ivAltTag);
    svgRoot.setAttributeNS(null, ODFConstants.HTML_ATTR_STYLE, "width: 100%; height: 100%; position:relative;");

    // Set the width and height attributes on the root 'svg' element.
    Node width = root.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_SVG_WIDTH);
    Node height = root.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_SVG_HEIGHT);

    String type = root.getLocalName();
    svgDoc.setType(type);
    if ((root instanceof DrawCustomShapeElement) || (isClosedShape(type)))
    {
      ivDCSEHorizontalOrVertical = false;
      if (!isDCSEVerticalOrHorizontalLine(root))
      {
        svgRoot = parseAttributes(svgDoc, root, svgRoot);
        svgDoc = parse(svgDoc, root, svgRoot, stripText);
      }
      else
      {
        ivDCSEHorizontalOrVertical = true;
        svgRoot = parseAttributes(svgDoc, root, svgRoot);
        svgDoc = parseDCSEStraightLine(svgDoc, root, svgRoot);
      }
    }
    else
    {
      svgDoc = parse(svgDoc, root, svgRoot, stripText);
    }

    JSONObject transformMap = null;
    Node transformAttr = root.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_DRAWTRANSFORM);
    if (transformAttr != null)
    {
      String transform = transformAttr.getNodeValue();
      FuncParser parser = new FuncParser();
      transformMap = parser.parse(transform);
      double angle = Double.parseDouble((String) transformMap.get(ROTATE));
      ivParser.setShapeRotationAngle(angle);

      // Shape -> SVG - Rotation not supported yet
      setGenerateShapeAsImage(true);
      setGenerateShapeAsSvg(false);
    }

    List<String> classElements = getClassElements(root);
    parseStyle(classElements, svgDoc);
    // If this is a draw custom shape element vertical and horizontal line, we
    // need to massage the SVG to draw the line and connectors
    if (ivDCSEHorizontalOrVertical)
    {
      handleDCSELine(svgDoc);
    }
    ivSizeMap.put(ODFConstants.SVG_ATTR_VIEWBOX, svgRoot.getAttribute(ODFConstants.SVG_ATTR_VIEWBOX));

    if (transformAttr != null)
    {
      doc = normalizeTranform(svgDoc, transformMap, height.getNodeValue(), width.getNodeValue());
      svgRoot = doc.getDocumentElement();
    }

    String name = UUID.randomUUID().toString();

    StringBuilder buf = new StringBuilder(128);
    buf.append(ODFConstants.HTML_STYLE_REL_POSITION);

    double image_width = 0;
    double image_height = 0;
    if (isLineOrConnector(root))
    {
      if (svgRoot.hasAttribute(ODFConstants.SVG_ATTR_WIDTH))
      {
        image_width = Double.parseDouble(svgRoot.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
        if (root instanceof DrawConnectorElement)
          // If the image width is less than 3 pixels, we process it as vertical
          // We don't change the orientation, just open up the view box to allow for marker placement
          if (image_width < 3.0)
          {
            Element path = getPathNode(svgRoot);
            if (path != null) // Probably again a poor PPTX conversion
              image_width = convertPathToLine(svgDoc, svgRoot, false);
          }
      }
      else
      {
        NamedNodeMap attributes = root.getAttributes();
        image_width = getCoordinateSizeInPixels(attributes.getNamedItem(ODFConstants.ODF_ATTR_SVG_X1),
            attributes.getNamedItem(ODFConstants.ODF_ATTR_SVG_X2));
      }
      if (svgRoot.hasAttribute(ODFConstants.SVG_ATTR_HEIGHT))
      {
        image_height = Double.parseDouble(svgRoot.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
        if (root instanceof DrawConnectorElement)
          // if the height is lest than 3 pixels, we are going to handle as horizontal
          if (image_height < 3.0)
          { // if the image height is less than 3 pixels, we process it as a horizontal element
            // We don't change the orientation, just open up the view box to allow for marker placement
            Element path = getPathNode(svgRoot);
            if (path != null) // Probably again a poor PPTX conversion
              image_height = convertPathToLine(svgDoc, svgRoot, true);
          }
      }
      else
      {
        NamedNodeMap attributes = root.getAttributes();
        image_height = getCoordinateSizeInPixels(attributes.getNamedItem(ODFConstants.ODF_ATTR_SVG_Y1),
            attributes.getNamedItem(ODFConstants.ODF_ATTR_SVG_Y2));
      }
    }
    else
    {
      String viewBox = (String) ivSizeMap.get(ODFConstants.SVG_ATTR_VIEWBOX);
      String width_Value = width.getNodeValue();
      image_width = Math.ceil(Math.abs(convertCMToPixel(width_Value)));
      if (svgRoot.hasAttribute(ODFConstants.SVG_ATTR_WIDTH) && !svgRoot.hasAttribute(ODFConstants.CONVERTED_POLY_LINE))
      {
        image_width = Double.parseDouble(svgRoot.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
        if (viewBox == null || viewBox.length() == 0)
          image_width = adjustDimensionForDrawStroke(svgRoot, image_width);

      }
      String height_value = height.getNodeValue();
      image_height = Math.abs(convertCMToPixel(height_value));
      if (svgRoot.hasAttribute(ODFConstants.SVG_ATTR_HEIGHT) && !svgRoot.hasAttribute(ODFConstants.CONVERTED_POLY_LINE))
      {
        image_height = Double.parseDouble(svgRoot.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
        if (viewBox == null || viewBox.length() == 0)
          image_height = adjustDimensionForDrawStroke(svgRoot, image_height);
      }
    }

    // If this object is copied in the editor, we need to add an attribute that contains
    // information needed by the copied too object.
    preserveAttributesForCopy((Element) root);

    ivSizeMap.put(ODFConstants.SVG_ATTR_WIDTH, String.valueOf(image_width));
    ivSizeMap.put(ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(image_height));

    // Make sure the SVG Height/Width are at least 1, otherwise SVG doesn't like it (and rounded to a whole number)
    Element element = doc.getDocumentElement();
    if (image_width < 1)
    {
      if (DEBUG)
      {
        log.info("Image width is " + image_width);
      }
      image_width = 1;
    }
    // If NOT a converted poly line, reset width
    if (!element.hasAttribute(ODFConstants.CONVERTED_POLY_LINE))
      element.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, Double.toString(Math.round(image_width)));

    if (image_height < 1)
    {
      if (DEBUG)
      {
        log.info("Image height is " + image_height);
      }
      image_height = 1;
    }

    // Limit the image size to prevent excessively large images
    if (image_height > MAX_IMAGE_SIZE || image_width > MAX_IMAGE_SIZE)
    {
      log.warning("Shape exceeds the maximum image dimension limit");
      createPlaceholderImageElement(parent);
      return ivSizeMap;
    }

    // If NOT a converted poly line, reset height
    if (!element.hasAttribute(ODFConstants.CONVERTED_POLY_LINE))
      element.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, Double.toString(Math.round(image_height)));

    updateSVGFillToNone(svgDoc, element);

    // Convert text within shape to SVG
    if (doc.getDocumentElement().hasAttribute(HAS_TEXT))
    {
      String x, y, fontsize;
      double base_Width, base_Height;
      if (element.hasAttribute(ODFConstants.SVG_ATTR_VIEWBOX))
      {
        String viewBox = element.getAttribute(ODFConstants.SVG_ATTR_VIEWBOX);
        String[] view = viewBox.split(" ");
        base_Width = Double.parseDouble(view[2]);
        base_Height = Double.parseDouble(view[3]);
        x = String.valueOf(base_Width / 4);
        y = String.valueOf(base_Height / 2);
        fontsize = String.valueOf(base_Width / 6);
      }
      else
      {
        base_Width = Double.parseDouble(element.getAttribute(ODFConstants.SVG_ATTR_WIDTH));
        base_Height = Double.parseDouble(element.getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
        x = String.valueOf(base_Width / 4);
        y = String.valueOf(base_Height / 2);
        double fs = base_Width / 6;
        if (base_Width >= base_Height)
          fs = base_Height / 6;
        fontsize = String.valueOf(fs);
      }
      // element.setAttribute("fill", "none");

      Element txtElement = (Element) element.removeChild(element.getFirstChild());
      ;
      if (txtElement.getNodeName().toLowerCase().equals(ODFConstants.TEXT))
      {
        txtElement.setAttribute(ODFConstants.SVG_CIRCLE_ATTR_X, x);
        txtElement.setAttribute(ODFConstants.SVG_CIRCLE_ATTR_Y, y);
        txtElement.setAttribute(ODFConstants.CSS_FONT_SIZE, fontsize);
      }
      element.appendChild(txtElement);
    }

    // If the shape is a custom-shape and a rectangle, adjust the svg to eliminate the stretching affect
    if (type.equals(ODFConstants.ODF_ATTR_CUSTOM_SHAPE) && isClosedRectangle(root, svgRoot))
      adjustSvgForRectangle(svgRoot, image_width, image_height);
    else
    {
      // Adjust viewbox and path if made up of extremely large values (> 100000)
      adjustXtraLargeViewboxAndPath(doc, svgRoot);
      // Check to see if this is a adjustable shape, ie viewbox is not proportional with the viewport
      adjustViewboxViewportRatio(svgRoot, image_width, image_height);
    }

    Element[] elements = createImageElement(doc, name, ODFConstants.FILE_PNG, image_width, image_height);

    // The image will use outer div as boundary.

    buf.append(formatAttribute(ODFConstants.ALIGNMENT_LEFT, ZERO_PERCENT));
    buf.append(formatAttribute(ODFConstants.ALIGNMENT_TOP, ZERO_PERCENT));
    buf.append(formatAttribute(ODFConstants.SVG_ATTR_WIDTH, HUNDRED_PERCENT));
    buf.append(formatAttribute(ODFConstants.SVG_ATTR_HEIGHT, HUNDRED_PERCENT));

    if ((elements[SVG] == null) && (elements[IMAGE] == null))
    {
      createPlaceholderImageElement(parent);
      return ivSizeMap;
    }

    if (elements[SVG] != null)
    {
      Element svg = elements[SVG];
      parent.appendChild(svg);
    }
    if (elements[IMAGE] != null)
    {
      Element image = elements[IMAGE];

      parent.appendChild(image);

      // add z-index info.
      image.setAttribute(ODFConstants.HTML_ATTR_STYLE, buf.toString());

      adjustForMirroring(image, height, width);

      // Add the alt tag to the image
      image.setAttribute(ODFConstants.HTML_ATTR_ALT, ivAltTag);
      // Add the aria-describeby (if we have a description) as a sibling to the image
      // Note: img elements aren't allowed to have children
      Element ariaLabel = addAriaDescribeBy(image);
      if (ariaLabel != null)
        parent.appendChild(ariaLabel);
    }

    return ivSizeMap;
  }

  /**
   * preserveAttributes in size map
   */
  private void preserveAttributesForCopy(Element odfElement)
  {
    NamedNodeMap attrs = odfElement.getAttributes();
    for (int i = 0; i < attrs.getLength(); i++)
    {
      Node attr = attrs.item(i);
      ivSizeMap.put(attr.getNodeName(), attr.getNodeValue());
    }
    // Don't need the id, so remove it if it exists
    ivSizeMap.remove("id");
  }

  /**
   * adjusts the SVG for a rectangle to eliminate stretching affect. Note: Rotated rectangles will still show the stretching affect
   * 
   * @param svg
   *          - svg element to be modified
   * @param width
   *          - width of rectangle
   * @param height
   *          - height of rectangle
   */
  private void adjustSvgForRectangle(Element svg, double width, double height)
  {
    boolean adjustY = true; // Assume we are adjusting the y coordinates
    double heightVsWidthRatio = height / width;
    if (height > width)
    {
      // height is greater than width, so adjust the X coordinates
      adjustY = false;
      heightVsWidthRatio = width / height;
    }
    // Adjust the viewbox , stroke-width and path elements
    double dViewBox[] = getViewBoxArray(svg);
    if (dViewBox == null)
      return; // This could happen when viewbox is rotated
    adjustViewBox(svg, dViewBox, heightVsWidthRatio, adjustY);
    adjustStrokeWidth(svg, heightVsWidthRatio);
    adjustRectanglePath(svg, heightVsWidthRatio, adjustY);
  }

  /**
   * We have seen symphony generate extremely large values for viewbox and path This causes extremely long conversion times. If we find
   * these large values, (greater than 100,000 we adjust both the view box and the path.
   * 
   */
  private void adjustXtraLargeViewboxAndPath(Document doc, Element svg)
  {
    // Adjust the viewbox and path elements
    // Get the element containing the path
    // We are very picky on what we are adjusting... it has to fit the pattern of
    // svg--->g-->svg-->g-->path (a single path) or svg-->g-->path (again a single path)
    Element pathElement = getPathElement(svg);
    if (pathElement == null)
      return; // No path element
    Element strokeWidthElement = getStrokeWidthElement(pathElement);
    if (strokeWidthElement == null)
      return; // no stroke-width defined
    Element viewBoxElement = getViewBoxElement(strokeWidthElement);
    if (viewBoxElement == null)
      return; // no viewbox
    // Get the viewbox in to a double array for processing
    double[] dViewBox = getViewBoxArray(viewBoxElement);
    // Check the size of the viewbox and if large get the divisor.
    double divisor = getViewBoxDivisor(dViewBox);
    // if divisor equals 1, then no reason to adjust
    if (divisor == 1.0)
      return;
    adjustXtraLargeViewBox(viewBoxElement, divisor, dViewBox);
    // adjustStrokeWidth(strokeWidthElement, viewPortRatio);
    adjustXtraLargePath(pathElement, divisor);
  }

  /**
   * return 100 if viewbox size is greater than a million, 10 if greater than 100,000 or 1 otherwise.
   */
  private double getViewBoxDivisor(double[] viewBoxArray)
  {
    double x1 = viewBoxArray[0];
    double y1 = viewBoxArray[1];
    double x2 = viewBoxArray[2];
    double y2 = viewBoxArray[3];

    double diffX = x2 - x1;
    double diffY = y2 - y1;
    if (diffX > ONEMILLION || diffY > ONEMILLION)
      return 100.0;
    if (diffX > ONEHUNDREDTHOUSAND || diffY > ONEHUNDREDTHOUSAND)
      return 10.0;
    return 1.0;
  }

  /**
   * return an double array of the viewbox contents
   */
  private double[] getViewBoxArray(Element viewBox)
  {
    String viewBoxAttr = viewBox.getAttribute(ODFConstants.ODF_ATTR_SVG_VIEWBOX);
    if (viewBoxAttr == null || viewBoxAttr.length() == 0)
      return null;
    String[] viewBoxVals = viewBoxAttr.split(ODFConstants.SYMBOL_WHITESPACE);
    double[] vb = new double[4];

    vb[0] = Double.parseDouble(viewBoxVals[0]);
    vb[1] = Double.parseDouble(viewBoxVals[1]);
    vb[2] = Double.parseDouble(viewBoxVals[2]);
    vb[3] = Double.parseDouble(viewBoxVals[3]);
    return vb;
  }

  /**
   * adjust the viewbox to correspond to the viewport when they are out of proportion to each other
   * 
   * @param svg
   *          - svg to adjust
   * @param width
   *          - of viewport
   * @param height
   *          - of viewport
   */
  private void adjustViewboxViewportRatio(Element svg, double width, double height)
  {
    boolean adjustY;
    double viewPortRatio;
    if (height > width)
    {
      // height is greater than width, so adjust the X coordinates
      adjustY = false;
      viewPortRatio = width / height;
    }
    else
    {
      adjustY = true;
      viewPortRatio = height / width;
    }
    // Adjust the viewbox , stroke-width and path elements
    // Get the element containing the path
    // We are very picky on what we are adjusting... it has to fit the pattern of
    // svg--->g-->svg-->g-->path (a single path) or svg-->g-->path (again a single path)
    Element pathElement = getPathElement(svg);
    if (pathElement == null)
      return; // No path element
    Element strokeWidthElement = getStrokeWidthElement(pathElement);
    if (strokeWidthElement == null)
      return; // no stroke-width defined
    Element viewBoxElement = getViewBoxElement(strokeWidthElement);
    if (viewBoxElement == null)
      return; // no viewbox
    // Get the viewbox in to a double array for processing
    double[] dViewBox = getViewBoxArray(viewBoxElement);
    // Get the ratio from the viewbox and compare it with the viewport
    double viewBoxRatio = getViewBoxRatio(dViewBox, adjustY);
    // if viewboxRatio is twice the viewport (heighVsWidthRatio) than adjust
    if (viewBoxRatio < (2 * viewPortRatio))
      return;
    int rotateVal = getRotation(viewBoxElement);
    if (rotateVal == -1) // A rotation we don't currently support
      return;
    if (rotateVal == 1) // If the shape is rotated, in this case 90 or 270, we need to adjust the appropriate elements
      adjustY = !adjustY;
    adjustViewBox(viewBoxElement, dViewBox, viewPortRatio, adjustY);
    adjustStrokeWidth(strokeWidthElement, viewPortRatio);
    adjustPath(pathElement, viewPortRatio, adjustY);
  }

  /**
   * 
   * @param viewBox
   *          - viewbox to get measurements from
   * @param adjustY
   *          - true if width is greater than height
   * @return the viewbox ratio
   */
  private double getViewBoxRatio(double[] viewBox, boolean adjustY)
  {
    double x1 = viewBox[0];
    double y1 = viewBox[1];
    double x2 = viewBox[2];
    double y2 = viewBox[3];
    if (adjustY) // height is less than width
      return (y2 - y1) / (x2 - x1);
    else
      return (x2 - x1) / (y2 - y1);
  }

  /**
   * 
   * @param path
   *          - path element
   * @return = return the parent of the path... if the parent does not have a stroke-width, return null
   */
  private Element getStrokeWidthElement(Element path)
  {
    Element parent = (Element) path.getParentNode();
    if (parent.getNodeName().equals(ODFConstants.SVG_ATTR_GROUP) && parent.hasAttribute(ODFConstants.SVG_ATTR_STROKE_WIDTH))
      return parent;
    return null;
  }

  /**
   * 
   * @param strokeWidth
   *          element to return parent of
   * @return return the parent of the stroke-width element. If the parent does not contain a viewbox return null
   */
  private Element getViewBoxElement(Element strokeWidth)
  {
    Element parent = (Element) strokeWidth.getParentNode();
    if (parent == null)
      return null;
    if (parent.getNodeName().equals(ODFConstants.SVG_ATTR_SVG) && parent.hasAttribute(ODFConstants.ODF_ATTR_SVG_VIEWBOX))
      return parent;
    return null;
  }

  /**
   * 
   * @param svg
   *          - of shape to be examined for a path
   * @return element containing a single path. If there are multiple paths or path is closed, return null
   */
  private Element getPathElement(Element svg)
  {
    Element pathElement = getAttributeElement(svg, ODFConstants.SVG_ATTR_D);
    if (pathElement == null)
      return null;
    Element pathParent = (Element) pathElement.getParentNode();
    if (pathParent.getChildNodes().getLength() > 1)
      return null;
    String path = pathElement.getAttribute(ODFConstants.SVG_ATTR_D);
    // Check to see if path is closed, return null.
    path = path.toLowerCase();
    if (path.contains("q") || path.contains("t"))
      return null;
    return pathElement;
  }

  /**
   * 
   * @param viewBox
   *          - to get rotation of
   * @return 0 = no rotation, 1 rotated 90 or 270 degrees, -1 unsupported rotation
   */
  private int getRotation(Element viewBox)
  {
    try
    {
      Element parent = null;
      try
      {
        // SVG element may not have a parent... in this case there is no rotation
        parent = (Element) viewBox.getParentNode();
      }
      catch (Exception e)
      {
        return 0; // no parent = no rotation
      }
      if (parent == null)
        return 0; // no rotation
      if (parent.getNodeName().equals(ODFConstants.SVG_ATTR_GROUP) && parent.hasAttribute(ODFConstants.ODF_ATTR_SVG_TRANSFORM))
      {
        String transformAttr = parent.getAttribute(ODFConstants.ODF_ATTR_SVG_TRANSFORM);
        if (transformAttr.contains(ROTATE))
        {
          String rotateStr = transformAttr.substring(transformAttr.indexOf(ROTATE + "("));
          rotateStr = rotateStr.replace(ROTATE + "(", "");
          rotateStr = rotateStr.replace(")", "");
          double rotateVal = Math.abs(Double.valueOf(rotateStr));
          if ((rotateVal > 89 && rotateVal < 91) || (rotateVal > 269 && rotateVal < 271))
            return 1; // Adjust the Y values
          if ((rotateVal < 1) || (rotateVal > 179 && rotateVal < 181))
            return 0; // Adjust the X values
          return -1; // We are not going to adjust something yet that is not on one of the axis (0,90,180,270)
        }
        return 0; // no rotation
      }
      return -1;
    }
    catch (Exception e)
    {
      return -1;
    }
  }

  private void adjustXtraLargeViewBox(Element svg, double divisor, double[] dViewBox)
  {
    Element viewBoxElement = getAttributeElement(svg, ODFConstants.ODF_ATTR_SVG_VIEWBOX);
    if (viewBoxElement == null)
      return;

    double x1 = dViewBox[0];
    double y1 = dViewBox[1];
    double x2 = dViewBox[2];
    double y2 = dViewBox[3];

    x1 /= divisor;
    x2 /= divisor;
    y1 /= divisor;
    y2 /= divisor;

    StringBuilder newViewBox = new StringBuilder(32);
    newViewBox.append(MeasurementUtil.formatDecimal(x1, 0) + ODFConstants.SYMBOL_WHITESPACE);
    newViewBox.append(MeasurementUtil.formatDecimal(y1, 0) + ODFConstants.SYMBOL_WHITESPACE);
    newViewBox.append(MeasurementUtil.formatDecimal(x2, 0) + ODFConstants.SYMBOL_WHITESPACE);
    newViewBox.append(MeasurementUtil.formatDecimal(y2, 0) + ODFConstants.SYMBOL_WHITESPACE);

    viewBoxElement.setAttribute(ODFConstants.ODF_ATTR_SVG_VIEWBOX, newViewBox.toString());
  }

  /**
   * adjust the view box to be consistent with height and width ratio
   * 
   * @param svg
   *          - viewbox modified in SVG
   * @param ratio
   *          - ratio that elements need to be adjusted by
   * @param adjustY
   *          - if true, adjust Y elements otherwise do X
   */
  private void adjustViewBox(Element svg, double[] dViewBox, double ratio, boolean adjustY)
  {
    // Get the svg element containing the viewBox
    Element viewBoxElement = getAttributeElement(svg, ODFConstants.ODF_ATTR_SVG_VIEWBOX);
    if (viewBoxElement == null)
      return;
    String viewBox = viewBoxElement.getAttribute(ODFConstants.ODF_ATTR_SVG_VIEWBOX);
    String[] viewBoxArray = viewBox.split(ODFConstants.SYMBOL_WHITESPACE);
    StringBuilder newViewBox = new StringBuilder();

    if (adjustY)
    {
      double y1 = dViewBox[1];
      double y3 = dViewBox[3];
      y1 = y1 * ratio;
      y3 = y3 * ratio;
      newViewBox.append(viewBoxArray[0] + ODFConstants.SYMBOL_WHITESPACE);
      ;
      newViewBox.append(MeasurementUtil.formatDecimal(y1, 0) + ODFConstants.SYMBOL_WHITESPACE);
      newViewBox.append(viewBoxArray[2] + ODFConstants.SYMBOL_WHITESPACE);
      newViewBox.append(MeasurementUtil.formatDecimal(y3, 0));
    }
    else
    {
      double x0 = dViewBox[0];
      double x2 = dViewBox[2];
      x0 = x0 * ratio;
      x2 = x2 * ratio;
      newViewBox.append(MeasurementUtil.formatDecimal(x0, 0) + ODFConstants.SYMBOL_WHITESPACE);
      newViewBox.append(viewBoxArray[1] + ODFConstants.SYMBOL_WHITESPACE);
      newViewBox.append(MeasurementUtil.formatDecimal(x2, 0) + ODFConstants.SYMBOL_WHITESPACE);
      newViewBox.append(viewBoxArray[3]);
    }
    viewBoxElement.setAttribute(ODFConstants.ODF_ATTR_SVG_VIEWBOX, newViewBox.toString());
  }

  /**
   * adjust stroke-width in SVG based on ratio
   * 
   * @param svg
   *          - svg to be modified
   * @param ratio
   *          - ration to adjust stroke-width
   */
  private void adjustStrokeWidth(Element svg, double ratio)
  {
    // Get the element containing the stroke-width
    Element strokeWidthElement = getAttributeElement(svg, ODFConstants.SVG_ATTR_STROKE_WIDTH);
    if (strokeWidthElement == null)
      return;
    String strokeWidth = strokeWidthElement.getAttribute(ODFConstants.SVG_ATTR_STROKE_WIDTH);
    double dStrokeWidth = Measure.extractNumber(strokeWidth);
    dStrokeWidth = dStrokeWidth * ratio;
    strokeWidthElement.setAttribute(ODFConstants.SVG_ATTR_STROKE_WIDTH, MeasurementUtil.formatDecimal(dStrokeWidth)
        + ODFConstants.SYMBOL_PERCENT);
  }

  /**
   * adjust the path of the rectangle based on the height to width ratio
   * 
   * @param svg
   *          - svg containing path element to be modified
   * @param ratio
   *          - ratio to be adjusted
   * @param adjustY
   *          - true if adjusting Y values, false if adjust X
   */
  private void adjustRectanglePath(Element svg, double ratio, boolean adjustY)
  {
    // Get the element containing the path
    Element pathElement = getAttributeElement(svg, ODFConstants.SVG_ATTR_D);
    if (pathElement == null)
      return;
    // Allow for easier parsing by adding spaces around directives
    String path = pathElement.getAttribute(ODFConstants.SVG_ATTR_D);
    path = path.replace("M", " M ");
    path = path.replace("L", " L ");
    path = path.replace("Z", " Z");
    path = path.trim();
    String pathArray[] = path.split("\\s+"); // Split on one or more whitespace

    if (adjustY)
    {
      double y = Double.valueOf(pathArray[2]);
      y = y * ratio;
      pathArray[2] = MeasurementUtil.formatDecimal(y, 0);
      // Adjust the line end values
      y = Double.valueOf(pathArray[5]);
      y = y * ratio;
      pathArray[5] = MeasurementUtil.formatDecimal(y, 0);
      y = Double.valueOf(pathArray[7]);
      y = y * ratio;
      pathArray[7] = MeasurementUtil.formatDecimal(y, 0);
      y = Double.valueOf(pathArray[9]);
      y = y * ratio;
      pathArray[9] = MeasurementUtil.formatDecimal(y, 0);
      y = Double.valueOf(pathArray[11]);
      y = y * ratio;
      pathArray[11] = MeasurementUtil.formatDecimal(y, 0);
    }
    else
    {
      // Adjust the line start values
      double x = Double.valueOf(pathArray[1]);
      x = x * ratio;
      pathArray[1] = MeasurementUtil.formatDecimal(x, 0);

      x = Double.valueOf(pathArray[4]);
      x = x * ratio;
      pathArray[4] = MeasurementUtil.formatDecimal(x, 0);
      x = Double.valueOf(pathArray[6]);
      x = x * ratio;
      pathArray[6] = MeasurementUtil.formatDecimal(x, 0);
      x = Double.valueOf(pathArray[8]);
      x = x * ratio;
      pathArray[8] = MeasurementUtil.formatDecimal(x, 0);
      x = Double.valueOf(pathArray[10]);
      x = x * ratio;
      pathArray[10] = MeasurementUtil.formatDecimal(x, 0);
    }

    // Set the new path element into the svg
    StringBuilder newPath = new StringBuilder();
    for (int i = 0; i < pathArray.length; i++)
      newPath.append(pathArray[i] + ODFConstants.SYMBOL_WHITESPACE);
    pathElement.setAttribute(ODFConstants.SVG_ATTR_D, newPath.toString());
  }

  private void adjustPath(Element svg, double ratio, boolean adjustY)
  {
    // Get the element containing the path
    Element pathElement = getAttributeElement(svg, ODFConstants.SVG_ATTR_D);
    if (pathElement == null)
      return;
    // Allow for easier parsing by adding spaces around directives
    String path = pathElement.getAttribute(ODFConstants.SVG_ATTR_D);
    StringBuilder sb = new StringBuilder(path.length() * 2);
    int pathL = path.length();
    Character lastCh = null;
    for (int i = 0; i < pathL; i++)
    {
      Character ch = path.charAt(i);
      if (Character.isLetter(ch))
      {
        if(ch.equals('e') || ch.equals('E'))
          sb.append(ch);
        else
          sb.append(ODFConstants.SYMBOL_WHITESPACE + ch + ODFConstants.SYMBOL_WHITESPACE);      
      }
      else if (ch.equals(','))
        sb.append(ODFConstants.SYMBOL_WHITESPACE); // remove comma
      else if (ch.equals('-'))
      {
        if(lastCh != null && (lastCh.equals('e') || lastCh.equals('E')))
          sb.append(ch);
        else
          sb.append(ODFConstants.SYMBOL_WHITESPACE + '-'); // prepend dash (minus) with space
      }
      else
        sb.append(ch);
      lastCh = ch;
    }
    path = sb.toString().trim();
    String pathArray[] = path.split("\\s+"); // Split on one or more whitespace
    for (int i = 0; i < pathArray.length;)
    {
      if (StringUtils.isAlpha(pathArray[i]))
      {
        char svgCommand = pathArray[i].charAt(0);
        boolean setX = true;
        switch (svgCommand)
          {
            case 'M' : // These directives always come in (one or more) pairs, M = Move, L = Line, C = Curve, S = Simple curve
            case 'L' :
            case 'C' :
            case 'S' :
              int j = i + 1;
              // while j is less than path length and we don't hit an alpha char
              // setX toggles between the X and Y for setting the appropriate values
              for (; j < pathArray.length && !StringUtils.isAlpha(pathArray[j]); j++)
              {
                double value = Double.parseDouble(pathArray[j]);
                if (setX)
                {
                  setX = false;
                  if (adjustY)
                    continue;
                  else
                  {
                    value *= ratio;
                    pathArray[j] = MeasurementUtil.formatDecimal(value, 0);
                  }
                }
                else
                {
                  setX = true;
                  if (adjustY)
                  {
                    value *= ratio;
                    pathArray[j] = MeasurementUtil.formatDecimal(value, 0);
                  }
                  else
                    continue;
                }
              }
              i = j;
              break;
            case 'H' : // Horizontal move
              j = i + 1;
              for (; j < pathArray.length && !StringUtils.isAlpha(pathArray[j]); j++)
              {
                double value = Double.parseDouble(pathArray[i]);
                if (!adjustY) // adjust X only
                {
                  value *= ratio;
                  pathArray[i] = MeasurementUtil.formatDecimal(value, 0);
                }
              }
              i = j;
              break;
            case 'V' : // Vertical move
              j = i + 1;
              for (; j < pathArray.length && !StringUtils.isAlpha(pathArray[j]); j++)
              {
                double value = Double.parseDouble(pathArray[i]);
                if (adjustY) // adjust Y only
                {
                  value *= ratio;
                  pathArray[i] = MeasurementUtil.formatDecimal(value, 0);
                }
              }
              i = j;
              break;
            case 'A' : // arc are specified by the following A refX, refY, xaxis-rotation, large-arc_flag, sweep-flag, x, y
              j = i + 1;
              int k = 0;
              for (; (j + k) < pathArray.length && !StringUtils.isAlpha(pathArray[j + k]); k++)
              {
                int r = k % 7; // Mod for x we want to set element 0 and 5 for y we want to set 1 and 6
                double value = Double.parseDouble(pathArray[j + k]);
                if (adjustY)
                {
                  if (r == 1 || r == 6)
                  {
                    value *= ratio;
                    pathArray[j + k] = MeasurementUtil.formatDecimal(value, 0);
                  }
                }
                else
                {
                  if (r == 0 || r == 5)
                  {
                    value *= ratio;
                    pathArray[j + k] = MeasurementUtil.formatDecimal(value, 0);
                  }
                }
              }
              i = j + k;
              break;
            case 'Z' : // Close path... skip
              i++;
              break;
            default:
              log.warning("Unexpected(1) in shape2image conversion. Failure occurred when attempting to modify SVG for the following path: "
                  + path);
              i++;
          }
      }
      else
      {
        log.warning("Unexpected(2) in shape2image conversion. Failure occurred when attempting to modify SVG for the following path: "
            + path);
        i++;
      }
    }
    // Set the new path element into the svg
    StringBuilder newPath = new StringBuilder();
    for (int i = 0; i < pathArray.length; i++)
      newPath.append(pathArray[i] + ODFConstants.SYMBOL_WHITESPACE);
    pathElement.setAttribute(ODFConstants.SVG_ATTR_D, newPath.toString());
  }

  private void adjustXtraLargePath(Element svg, double divisor)
  {
    // Get the element containing the path
    Element pathElement = getAttributeElement(svg, ODFConstants.SVG_ATTR_D);
    if (pathElement == null)
      return; // Shouldn't happen because we already checked to verify the path exists
    // Allow for easier parsing by adding spaces around directives
    String path = pathElement.getAttribute(ODFConstants.SVG_ATTR_D);
    StringBuilder sb = new StringBuilder(path.length() * 2);
    int pathL = path.length();
    Character lastCh = null;
    for (int i = 0; i < pathL; i++)
    {
      Character ch = path.charAt(i);
      if (Character.isLetter(ch))
      {
        if(ch.equals('e') || ch.equals("E"))
          sb.append(ch);
        else
          sb.append(ODFConstants.SYMBOL_WHITESPACE + ch + ODFConstants.SYMBOL_WHITESPACE);      
      }
      else if (ch.equals(','))
        sb.append(ODFConstants.SYMBOL_WHITESPACE); // remove comma
      else if (ch.equals('-'))
      {
        if(lastCh != null && (lastCh.equals('e') || lastCh.equals('E')))
          sb.append(ch);
        else
          sb.append(ODFConstants.SYMBOL_WHITESPACE + '-'); // prepend dash (minus) with space
      }
      else
        sb.append(ch);
      lastCh = ch;
    }
    path = sb.toString().trim();
    String pathArray[] = path.split("\\s+"); // Split on one or more whitespace
    for (int i = 0; i < pathArray.length;)
    {
      if (StringUtils.isAlpha(pathArray[i]))
      {
        char svgCommand = pathArray[i].charAt(0);
        switch (svgCommand)
          {
            case 'M' : // These directives always come in (one or more) pairs, M = Move, L = Line, C = Curve, S = Simple curve
            case 'L' :
            case 'C' :
            case 'S' :
              int j = i + 1;
              // while j is less than path length and we don't hit an alpha char
              // setX toggles between the X and Y for setting the appropriate values
              for (; j < pathArray.length && !StringUtils.isAlpha(pathArray[j]); j++)
              {
                double value = Double.parseDouble(pathArray[j]);
                value /= divisor;
                pathArray[j] = MeasurementUtil.formatDecimal(value, 0);
              }
              i = j;
              break;
            case 'H' : // Horizontal move
              j = i + 1;
              for (; j < pathArray.length && !StringUtils.isAlpha(pathArray[j]); j++)
              {
                double value = Double.parseDouble(pathArray[i]);
                value /= divisor;
                pathArray[i] = MeasurementUtil.formatDecimal(value, 0);
              }
              i = j;
              break;
            case 'V' : // Vertical move
              j = i + 1;
              for (; j < pathArray.length && !StringUtils.isAlpha(pathArray[j]); j++)
              {
                double value = Double.parseDouble(pathArray[i]);
                value /= divisor;
                pathArray[i] = MeasurementUtil.formatDecimal(value, 0);
              }
              i = j;
              break;
            case 'A' : // arc are specified by the following A refX, refY, xaxis-rotation, large-arc_flag, sweep-flag, x, y
              j = i + 1;
              int k = 0;
              for (; (j + k) < pathArray.length && !StringUtils.isAlpha(pathArray[j + k]); k++)
              {
                int r = k % 7; // Mod for x we want to set element 0 and 5 for y we want to set 1 and 6
                double value = Double.parseDouble(pathArray[j + k]);
                if (r == 0 || r == 1 || r == 5 || r == 6)
                {
                  value /= divisor;
                  pathArray[j + k] = MeasurementUtil.formatDecimal(value, 0);
                }
              }
              i = j + k;
              break;
            case 'Z' : // Close path... skip
              i++;
              break;
            default:
              log.warning("Unexpected(3) in shape2image conversion. Failure occurred when attempting to modify SVG for the following path: "
                  + path);
              i++;
          }
      }
      else
      {
        log.warning("Unexpected(4) in shape2image conversion. Failure occurred when attempting to modify SVG for the following path: "
            + path);
        i++;
      }
    }
    // Set the new path element into the svg
    StringBuilder newPath = new StringBuilder(sb.length());
    for (int i = 0; i < pathArray.length; i++)
      newPath.append(pathArray[i] + ODFConstants.SYMBOL_WHITESPACE);
    pathElement.setAttribute(ODFConstants.SVG_ATTR_D, newPath.toString());
  }

  /**
   * get the attribute containing the needed attribute
   * 
   * @param svg
   *          - svg to be searched for attribute
   * @param attribute
   *          - name of attribute
   * @return element containing attribute or null if not found
   */
  private Element getAttributeElement(Element svg, String attribute)
  {
    if (svg.hasAttribute(attribute))
      return svg;
    // Attribute not root svg element, check its children
    HashMap<String, Element> attrElemMap = new HashMap<String, Element>();
    attrElemMap.put(ATTRIBUTE_ELEMENT, null);
    return getAttributeElementInChild(svg, attribute, attrElemMap);
  }

  /**
   * scan children for requested attribute
   * 
   * @param svg
   *          - to be searched
   * @param attribute
   *          - name of attribute
   * @return element containing attribute or null if not found
   */
  private Element getAttributeElementInChild(Element svg, String attribute, HashMap<String, Element> attrElemMap)
  {
    NodeList children = svg.getChildNodes();
    for (int i = 0; i < children.getLength() && attrElemMap.get(ATTRIBUTE_ELEMENT) == null; i++)
    {
      if (children.item(i) instanceof Element)
      {
        Element elem = (Element) children.item(i);
        if (elem.hasAttribute(attribute))
        {
          attrElemMap.put(ATTRIBUTE_ELEMENT, elem);
          return elem;
        }
        else
          getAttributeElementInChild(elem, attribute, attrElemMap);
      }
    }
    Element e = attrElemMap.get(ATTRIBUTE_ELEMENT);
    return e;
  }

  private double adjustDimensionForDrawStroke(Element svg, double dimValue)
  {
    // Image does not have a view box, so we must adjust the actual image_height to account for draw stroke
    double returnVal = dimValue;
    double dStrokeWidth = getStrokeWidth(svg);

    if (dStrokeWidth != 0.0)
    {
      double dimPer = dStrokeWidth / dimValue;
      return Math.ceil(dimValue * dimPer + dimValue);
    }

    return returnVal;
  }

  private double getStrokeWidth(Element svg)
  {
    String strokeWidth = svg.getAttribute(ODFConstants.SVG_ATTR_STROKE_WIDTH);
    if (strokeWidth != null && strokeWidth.length() > 0)
      if (strokeWidth.endsWith(ODFConstants.SYMBOL_PERCENT))
      {
        String width = svg.getAttribute(ODFConstants.SVG_ATTR_WIDTH);
        if (width != null && width.length() > 0)
        {
          double dStrokeWidth = Measure.extractNumber(strokeWidth);
          double dWidth = Double.valueOf(width);
          return dWidth * (dStrokeWidth / 100);
        }
        else
          return 0.0;
      }
      else
        return Double.parseDouble(strokeWidth);
    NodeList children = svg.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      double dStrokeWidth = getStrokeWidth((Element) children.item(i));
      if (dStrokeWidth != 0.0)
        return dStrokeWidth;
    }
    return 0.0;
  }

  /**
   * returns true if the DrawCustomShapeElement is a horizontal or vertical line It checks both the path to see if contains only a line
   * attributes and that the height or width is less than .001cm
   */
  private boolean isDCSEVerticalOrHorizontalLine(Node root)
  {
    NodeList children = root.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      String nodeName = child.getNodeName();
      if (nodeName.equalsIgnoreCase(ODFConstants.DRAW_ENHANCED_GEOMETRY))
      {
        Element e = (Element) child;
        String path = e.getAttribute(ODFConstants.DRAW_ENHANCED_PATH);
        if (null == path || path.length() == 0)
          return false;
        return isPathAVerticalOrHorizontalLine(root, path);
      }
    }
    return false;
  }

  /**
   * returns true it the DrawCustomShapeElement is veritcal or horizontal
   */
  private boolean isPathAVerticalOrHorizontalLine(Node root, String str)
  {
    final double MAX_LINE_DELTA = 0.002;
    if (str == null || str.length() == 0)
    {
      return false;
    }
    // Check to make sure the path is not:
    // Z|z - closed
    // C|c - curve
    // S|s - smooth curve
    // Q|q - quadratic bezier curve
    // T|t - Shorthand smoth quadratic bezier curve
    // A|a - elliptical arc
    if (cvNonStraightPathCommands.contains(str))
    {
      return false;
    }

    // Check the height and width
    Element e = (Element) root;
    String width = e.getAttribute(ODFConstants.SVG_WIDTH);
    String height = e.getAttribute(ODFConstants.SVG_HEIGHT);
    if (width == null || width.length() == 0 || height == null || height.length() == 0)
      return false;
    double dWidth = Measure.extractNumber(width);
    double dHeight = Measure.extractNumber(height);
    // If the height or width is less that .002 (cm), then we no we have a vertical or horizontal line
    if (dWidth >= MAX_LINE_DELTA && dHeight >= MAX_LINE_DELTA)
      return false;
    return true;
  }

  /**
   * updates the svg doc from drawing a custom shape to drawing a line
   */
  private void handleDCSELine(SVGDocumentWrapper svgDoc)
  {
    final int DEFAULT_DIMENSION = 12; // this is how much we enlarged the viewbox
    // Get the information from the svgDoc
    Document doc = svgDoc.getDocument();
    Element svg = getSvgNode(doc);
    Element line = getLineNode(svg);
    Element path = getPathNode(line);
    double dStrokeWidth = getStrokeWidth(svg);
    // Divide the stroke width by 12 because that is what we enlarged the
    // width or height by... to accommodate the arrows
    dStrokeWidth = dStrokeWidth / DEFAULT_DIMENSION;
    String stroke = svg.getAttribute(ODFConstants.SVG_ATTR_STROKE);

    // Remove the viewbox, stroke_width and path from main SVG element
    svg.removeAttribute(ODFConstants.SVG_ATTR_STROKE_WIDTH);
    svg.removeAttribute(ODFConstants.SVG_ATTR_VIEWBOX);
    path.removeAttribute(ODFConstants.SVG_ATTR_D);

    String markerStart = path.getAttribute(ODFConstants.SVG_ATTR_MARKERSTART);
    String markerEnd = path.getAttribute(ODFConstants.SVG_ATTR_MARKEREND);

    line.setAttribute(ODFConstants.SVG_ATTR_STROKE_WIDTH, MeasurementUtil.formatDecimal(dStrokeWidth, 5));
    line.setAttribute(ODFConstants.SVG_ATTR_STROKE, stroke);
    if (markerStart != null && markerStart.length() != 0)
      line.setAttribute(ODFConstants.SVG_ATTR_MARKERSTART, markerStart);
    if (markerEnd != null && markerEnd.length() != 0)
      line.setAttribute(ODFConstants.SVG_ATTR_MARKEREND, markerEnd);
    // Remove the path from the line
    line.removeChild(path);
  }

  private double convertPathToLine(SVGDocumentWrapper doc, Element svg, boolean horizontal)
  {
    // Get the information from the svgDoc
    double dx1, dx2, dy1, dy2;
    String x1, y1, x2, y2;

    Element path = getPathNode(svg);
    double dStrokeWidth = getStrokeWidth(svg);
    long image_width = deriveImageWidth(dStrokeWidth, horizontal);

    long line_adjustment = image_width / 12;
    Element line = null;
    line = doc.getDocument().createElementNS(SVG_NS, ODFConstants.SVG_ATTR_LINE);
    setAutomaticHtmlConcordId(line, SHAPE_ID_PREFIX);
    line.setAttribute(ODFConstants.SVG_ATTR_FILL, ODFConstants.HTML_VALUE_NONE);
    if (horizontal)
    {
      dy1 = dy2 = image_width / 2;

      x1 = path.getAttribute(ODFConstants.SVG_ATTR_X1);
      Measure x1Measure = Measure.parseNumber(x1);
      if (x1Measure.isCMMeasure())
      {
        x1Measure.convertCMToPixel();
        dx1 = x1Measure.getNumber();
      }
      else
        dx1 = x1Measure.getNumber();

      x2 = path.getAttribute(ODFConstants.SVG_ATTR_X2);
      Measure x2Measure = Measure.parseNumber(x2);
      if (x2Measure.isCMMeasure())
      {
        x2Measure.convertCMToPixel();
        dx2 = x2Measure.getNumber();
      }
      else
        dx2 = x2Measure.getNumber();

      // Because we now have a height, we have to move the top up 1/2 the image width
      ivSizeMap.put(TOP_OFFSET, MeasurementUtil.formatDecimal(convertPixelToCM(image_width / 2)));
    }
    else
    // Vertical
    {
      dx1 = dx2 = image_width / 2;

      y1 = path.getAttribute(ODFConstants.SVG_ATTR_Y1);
      Measure y1Measure = Measure.parseNumber(y1);
      if (y1Measure.isCMMeasure())
      {
        y1Measure.convertCMToPixel();
        dy1 = y1Measure.getNumber();
      }
      else
        dy1 = y1Measure.getNumber() + 10;

      y2 = path.getAttribute(ODFConstants.SVG_ATTR_Y2);
      Measure y2Measure = Measure.parseNumber(y2);
      if (y2Measure.isCMMeasure())
      {
        y2Measure.convertCMToPixel();
        dy2 = y2Measure.getNumber();
      }
      else
        dy2 = y2Measure.getNumber() - (10 * line_adjustment);

      // Because we now have a width, we have to move the top up 1/2 the image width
      ivSizeMap.put(LEFT_OFFSET, MeasurementUtil.formatDecimal(convertPixelToCM(image_width / 2)));
    }
    boolean left = false;
    boolean up = false;
    if (dx2 < dx1) // We need to swap to get arrows going correct direction
    {
      left = true;
      double temp = dx1;
      dx1 = Math.abs(dx2);
      dx2 = temp;
    }
    if (dy2 < dy1) // We need to swap to get arrows going correct direction
    {
      up = true;
      double temp = dy1;
      ;
      dy1 = Math.abs(dy2);
      dy2 = temp;
    }

    // Divide the stroke width by a value to get the appropriate width
    // These values were derived by testing a number of documents.
    // The reason the horizontal is divided by a larger number, is
    // because the page is wider that it is high.
    if (horizontal)
      dStrokeWidth = dStrokeWidth / 30;
    else
      dStrokeWidth = dStrokeWidth / 24;
    String stroke = path.getAttribute(ODFConstants.SVG_ATTR_STROKE);

    line.setAttribute(ODFConstants.SVG_ATTR_STROKE_WIDTH, MeasurementUtil.formatDecimal(dStrokeWidth, 5));
    line.setAttribute(ODFConstants.SVG_ATTR_STROKE, stroke);
    String markerStart = path.getAttribute(ODFConstants.SVG_ATTR_MARKERSTART);
    String markerEnd = path.getAttribute(ODFConstants.SVG_ATTR_MARKEREND);
    if (markerStart != null && markerStart.length() > 0 && markerEnd != null && markerEnd.length() > 0)
    { // We have a line with connectors on both ends
      adjustArrowMarkerSettings(svg, dStrokeWidth);
      line.setAttribute(ODFConstants.SVG_ATTR_MARKERSTART, markerStart);
      line.setAttribute(ODFConstants.SVG_ATTR_MARKEREND, markerEnd);
      if (horizontal)
      {
        dx1 = dx1 + 10 * line_adjustment;
        dx2 = dx2 - 10 * line_adjustment;
      }
      else
      // vertical
      {
        dy1 = dy1 + 10 * line_adjustment;
        dy2 = dy2 - 10 * line_adjustment;

      }
    }
    else
    { // we don't have connectors on both ends
      if (markerStart != null && markerStart.length() != 0)
      {
        adjustArrowMarkerSettings(svg, dStrokeWidth);
        line.setAttribute(ODFConstants.SVG_ATTR_MARKERSTART, markerStart);
        if (markerStart.toLowerCase().contains("arrow"))
        {
          if (horizontal)
          {
            if (left)
              dx2 = dx2 + 10 * line_adjustment;
            else
              dx2 = dx2 - 10 * line_adjustment;
          }
          else
          {
            if (!horizontal) // vertical
            {
              if (up)
                dy2 = dy2 + 10 * line_adjustment;
              else
                dy2 = dy2 - 10 * line_adjustment;
            }
          }
        }
      }
      else if (markerEnd != null && markerEnd.length() != 0)
      {
        adjustArrowMarkerSettings(svg, dStrokeWidth);
        line.setAttribute(ODFConstants.SVG_ATTR_MARKEREND, markerEnd);
        if (markerEnd.toLowerCase().contains("arrow"))
        {
          if (horizontal)
          {
            if (left)
              dx2 = dx2 + 10 * line_adjustment;
            else
              dx2 = dx2 - 10 * line_adjustment;
          }
          else
          {
            if (up)
              dy2 = dy2 + 10 * line_adjustment;
            else
              dy2 = dy2 - 10 * line_adjustment;
          }
        }
      }
    }
    line.setAttribute(ODFConstants.SVG_ATTR_X1, MeasurementUtil.formatDecimal(dx1));
    line.setAttribute(ODFConstants.SVG_ATTR_X2, MeasurementUtil.formatDecimal(dx2));
    line.setAttribute(ODFConstants.SVG_ATTR_Y1, MeasurementUtil.formatDecimal(dy1));
    line.setAttribute(ODFConstants.SVG_ATTR_Y2, MeasurementUtil.formatDecimal(dy2));

    svg.appendChild(line);

    // Remove the viewbox, stroke_width and path from main SVG element
    svg.removeAttribute(ODFConstants.SVG_ATTR_VIEWBOX);
    svg.removeAttribute(ODFConstants.SVG_ATTR_STROKE_WIDTH);
    svg.removeChild(path);
    return image_width;
  }

  /**
   * returns the value of the width of the object. If the stroke is larger, the width of the SVG has to be enlarged.
   */
  private long deriveImageWidth(double strokeWidth, boolean horizontal)
  {
    int MINIMUM_SVG_WIDTH = 12;
    int PIXEL_DELIMETER = 80;
    // Minimum SVG width will be 12, every PIXEL_DELIMETER pixels we will bump the with by MINIMUM_SVG_WIDTH
    long step = Math.round((strokeWidth / PIXEL_DELIMETER) + 0.5);
    return step * MINIMUM_SVG_WIDTH;
  }

  /**
   * Because we have modified the strokeWidth, we are going to default the markers. If the stroke width is "really thin" we will double the
   * markers to make them visible
   */
  private void adjustArrowMarkerSettings(Element svg, double stroke_width)
  {
    long marker_width = 2;
    long marker_height = 3;
    if (stroke_width < 2.0) // Thin lines, can't see markers, let's double it
    {
      marker_width = 4;
      marker_height = 6;
    }

    Element defs = getDefsNode(svg);
    NodeList children = defs.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Element child = (Element) children.item(i);
      if (child.getNodeName().equals(ODFConstants.SVG_ELEMENT_MARKER))
      {
        String markerId = child.getAttribute(ODFConstants.SVG_MARKER_ID);
        if (markerId != null && markerId.length() > 0)
          if (markerId.equalsIgnoreCase("arrowStart") || markerId.equalsIgnoreCase("arrowEnd"))
          {
            child.setAttribute(ODFConstants.SVG_ATTR_MARKERHEIGHT, String.valueOf(marker_height));
            child.setAttribute(ODFConstants.SVG_ATTR_MARKERWIDTH, String.valueOf(marker_width));
          }
      }
    }
  }

  /**
   * return the top-level SVG node
   */
  private Element getSvgNode(Document doc)
  {
    NodeList children = doc.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child.getNodeName().equals(ODFConstants.SVG_ATTR_SVG))
        return (Element) child;
    }
    return null;
  }

  /**
   * return the top-level SVG node
   */
  private Element getDefsNode(Element svg)
  {
    NodeList children = svg.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child.getNodeName().equals(ODFConstants.SVG_ELEMENT_DEFS))
        return (Element) child;
    }
    return null;
  }

  /**
   * return the line node from the SVG tree
   */
  private Element getLineNode(Node svg)
  {
    NodeList children = svg.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child.getNodeName().equals(ODFConstants.SVG_ATTR_LINE))
        return (Element) child;
    }
    return null;
  }

  /**
   * return path element from line
   * 
   * @param SVG
   *          line element
   */
  private Element getPathNode(Element line)
  {
    NodeList children = line.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child.getNodeName().equals(ODFConstants.SVG_ELEMENT_PATH))
        return (Element) child;
    }
    return null;
  }

  public void createPlaceholderImageElement(Node parent)
  {
    Element image = htmlDocument.createElement(ODFConstants.HTML_ELEMENT_IMG);
    image.setAttribute(ODFConstants.HTML_ATTR_ALT, ivAltTag);
    parent.appendChild(image);
    ConvertUtil.createPlaceHolder(context, image, true);
  }

  public Element[] createImageElement(Document doc, String name, String type, double width, double height)
  {
    Element[] elements = new Element[2];

    if (type.equals(ODFConstants.FILE_PNG))
    {
      TranscoderService transcoder = new TranscoderService();

      String targetSVGName = base + File.separator + ivDestinationDir + File.separator + name + ODFConstants.FILE_SUFFIX_SVG;

      if (isDebugMode())
      {
        transcoder.print(doc, targetSVGName);
      }

      if (width == 0.0 || height == 0.0)
        return null;

      boolean inContent = (this.ivDocumentType == ODFConstants.DOCUMENT_TYPE.CONTENT);

      // Shape -> Svg Support
      if (generateShapeAsSvg())
      {
        elements[SVG] = createSvgNode(doc.getDocumentElement());
      }

      if (generateShapeAsImage())
      {
        // ensure the buffer size is big enough to try and minimize resizing the byte array
        ByteArrayOutputStream os = new ByteArrayOutputStream(5120);

        this.ivSuccessful = transcoder.convertSVGDOM2PNG(doc, os, (float) width, (float) height);
        if (this.ivSuccessful)
        {
          String srcValue = null;

          // only in-line the image if the size is within the threshold limit and if we're sure we have a
          // valid ODP image from content, not the master page layout
          if ((os.size() < this.ivEncodingThreshold) && inContent)
          {
            // create the base64 encoded image.
            String[] encoded = new String[1];
            this.ivSuccessful = createb64String(os.toByteArray(), encoded);

            if (!this.ivSuccessful)
            {
              if (isDebugMode())
              {
                log.warning("Unexpected in shape2image conversion. Failing Shape is located here: " + targetSVGName);
              }
              return elements;
            }

            srcValue = ODFConstants.HTML_B64_SRC_PREFIX + encoded[0];
          }
          else
          {
            String targetPNGName = base + File.separator + ivDestinationDir + File.separator + name + "." + type;
            if (log.isLoggable(Level.FINE))
            {
              log.fine("SVG File Name = " + name);
            }

            this.ivSuccessful = writePNGFile(targetPNGName, os);
            if (!this.ivSuccessful)
            {
              return elements;
            }

            srcValue = ivDestinationDir + ODFConstants.FILE_RESOURCE_SEPARATOR + name + ODFConstants.SYMBOL_DOT + type;
          }

          ivImgSrc = srcValue;
          Element element = htmlDocument.createElement(ODFConstants.HTML_ELEMENT_IMG);
          element.setAttribute(ODFConstants.HTML_ATTR_SRC, srcValue);
          setAutomaticHtmlConcordId(element, SHAPE_ID_PREFIX);
          elements[IMAGE] = element;
        }
        else if (isDebugMode())
        {
          log.warning("Unexpected error in shape2image conversion. Failing Shape is located here: " + targetSVGName);
        }
      }
    }
    return elements;
  }

  /**
   * Submit the conversion of a shape to an image using the transcoder to an asynchronous thread
   * 
   * @param context
   *          - the current conversion context
   * @param root
   *          - the root node for the ODF document
   * @param doc
   *          - the document containing the SVG
   * @param parent
   *          - the parent node to which the image is to be appended
   * @param name
   *          - the svg name
   * @param type
   *          - the destination type
   * @param width
   *          - the width to use when generating the image
   * @param height
   *          - the height to use when generating the image
   * @param widthValue
   *          - the width value from the html elements for the frame
   * @param heightValue
   *          - the height value from the html elements from the frame
   * @return boolean - true if the shape was previously converted (an error scenario), otherwise false
   */
  private boolean submitCreateImageElement(final ConversionContext context, final Node root, final Document doc, final Node parent,
      final String name, final String type, final double width, final double height, final double widthValue, final double heightValue)
  {
    boolean alreadyConverted = false;

    final String targetSVGName = base + File.separator + ivDestinationDir + File.separator + name + ODFConstants.FILE_SUFFIX_SVG;

    // Shape -> Svg Support
    if (generateShapeAsSvg())
    {
      Element svg = createSvgNode(doc.getDocumentElement());
      parent.appendChild(svg);
      alreadyConverted = true;
    }

    if (generateShapeAsImage())
    {
      final Future<?> future = context.getTask(targetSVGName);

      if (future == null) // Shape not previously converted
      {
        final boolean inContent = (this.ivDocumentType == ODFConstants.DOCUMENT_TYPE.CONTENT);
        final long encodingThreshold = this.ivEncodingThreshold;
        final boolean debugMode = isDebugMode();
        final JSONObject sizeMap = getSizeMap();
        final ODFDrawingParser drawingParser = this;
        final Element image = htmlDocument.createElement(ODFConstants.HTML_ELEMENT_IMG);
        setAutomaticHtmlConcordId(image, SHAPE_ID_PREFIX);

        // Add the alt tag
        image.setAttribute(ODFConstants.HTML_ATTR_ALT, this.ivAltTag);

        // Add the aria-describeby (if we have a description)
        final Element ariaLabel = addAriaDescribeBy(image);
        final String targetPNGName = base + File.separator + ivDestinationDir + File.separator + name + "." + type;
        final String destinationDir = ivDestinationDir;

        log.fine("Shape to convert - setup callable");
        Callable<ODFConversionPostProcessingData> task = new Callable<ODFConversionPostProcessingData>()
        {
          public ODFConversionPostProcessingData call()
          {

            long start = System.currentTimeMillis();
            log.fine("Shape conversion thread starts for svg: " + targetSVGName);

            ODFConversionPostProcessingData conversionResult = new ODFConversionPostProcessingData();

            // Set the parent and root elements to which the results should be applied during post processing
            conversionResult.setParent((Element) parent);
            conversionResult.setRoot(root);

            // Create the transcoder to invoke for the actual shape to image conversion
            TranscoderService transcoder = new TranscoderService();

            if (debugMode)
            {
              transcoder.print(doc, targetSVGName);
            }

            // Ensure the buffer size is big enough to try and minimize resizing the byte array
            // NOTE: This size was set based on a sampling of almost 1200 files 93% will fit in this buffer
            ByteArrayOutputStream os = new ByteArrayOutputStream(2048);

            // Convert the shape to an image
            long tcStart = System.currentTimeMillis();

            boolean successful = transcoder.convertSVGDOM2PNG(doc, os, (float) width, (float) height);

            if (debugMode)
            {
              long tcEnd = System.currentTimeMillis();
              if ((tcEnd - tcStart) >= 5000)
              {
                log.warning("WARNING: Transcoder took " + (tcEnd - tcStart) + " ms to complete the Image generation.");
                log.warning(TranscoderService.printToString(doc));
              }
            }

            if (successful)
            {
              String srcValue = null;

              // Only in-line the image if the size is within the threshold limit and if we're sure we have a
              // valid ODP image from content, not the master page layout
              if ((os.size() < encodingThreshold) && inContent)
              {
                // create the base64 encoded image.
                String[] encoded = new String[1];
                successful = createb64String(os.toByteArray(), encoded);

                if (!successful)
                {
                  if (debugMode)
                  {
                    log.warning("Unexpected failure in shape2image conversion. Failing Shape is located here: " + targetSVGName);
                  }
                  conversionResult.setSuccessful(false);
                  conversionResult.setErrorDescription("Error creating b64string while converting shape");
                }
                else
                {
                  srcValue = ODFConstants.HTML_B64_SRC_PREFIX + encoded[0];
                }
              }
              else
              {
                if (debugMode)
                {
                  log.info("SVG File Name = " + name);
                }

                successful = writePNGFile(targetPNGName, os);
                if (!successful)
                {
                  conversionResult.setSuccessful(false);
                  conversionResult.setErrorDescription("Error writing image while converting shape");
                }
                else
                {
                  srcValue = destinationDir + ODFConstants.FILE_RESOURCE_SEPARATOR + name + ODFConstants.SYMBOL_DOT + type;
                }
              }
              os = null; // Free the ByteArray

              // Set the additional results if successful
              if (srcValue != null)
              {
                // add the src info.
                image.setAttribute(ODFConstants.HTML_ATTR_SRC, srcValue);
                // also add it to the cached parser for subsequent uses
                drawingParser.ivImgSrc = srcValue;

                // add z-index info.
                StringBuilder buf = new StringBuilder(128);
                buf.append(ODFConstants.HTML_STYLE_REL_POSITION);
                buf.append(formatAttribute(ODFConstants.ALIGNMENT_LEFT, ZERO_PERCENT));
                buf.append(formatAttribute(ODFConstants.ALIGNMENT_TOP, ZERO_PERCENT));
                buf.append(formatAttribute(ODFConstants.SVG_ATTR_WIDTH, HUNDRED_PERCENT));
                buf.append(formatAttribute(ODFConstants.SVG_ATTR_HEIGHT, HUNDRED_PERCENT));
                image.setAttribute(ODFConstants.HTML_ATTR_STYLE, buf.toString());

                // if the image is not a line or connector, insert "draw_image" tag
                // for front-end contentBox parsing.

                adjustForMirroring(image, heightValue, widthValue);

                // add the image element for post processing
                conversionResult.setHtmlElement(image);

                // add the aria label (if any) for post processing
                if (ariaLabel != null)
                  conversionResult.setAriaElement(ariaLabel);

                // add the sizeMap for post processing
                conversionResult.setSizeMap(sizeMap);

                // set the final result in the cached parser
                drawingParser.ivSuccessful = successful;
              }
            }
            else
            {
              conversionResult.setSuccessful(false);
              conversionResult.setErrorDescription("Error from transcoder converting shape");
            }

            long end = System.currentTimeMillis();
            conversionResult.setConversionTime(end - start);
            if (debugMode)
            {
              log.info("Aynchronous shape conversion time = " + (end - start) + "ms");
            }

            return conversionResult;
          }
        };

        context.addTask(targetSVGName, task); // Start the thread
      }
      else
      // Shape was previously converted or previous conversion is still running.
      {
        alreadyConverted = true;
        // This would be an error scenario. Log it and continue.
        log.warning("Duplicate SVG found: " + targetSVGName);
      }
    }
    return alreadyConverted;
  }

  /**
   * Recreate the image element using a previously converted version of the shape
   * 
   * @param parent
   *          - the html element to which the image should be appended. If an error occurs, a placeholder image will be inserted instead.
   * @param async
   *          - true if the conversion of the shape image was performed asynchronously. In this case, we may need to block until the
   *          conversion completes.
   */
  public void recreateImageElement(Node parent, boolean async)
  {
    Element image = null;
    Element aria = null;

    // Recreate based on whether asynchronous or synchronous conversion is being done
    if (async)
    {
      String targetSVGName = base + File.separator + ivDestinationDir + File.separator + this.ivName + ODFConstants.FILE_SUFFIX_SVG;
      Future<?> future = context.getTask(targetSVGName);
      if (future != null) // Shape previously converted or in the process of being converted
      {
        log.fine("Image generation done? " + future.isDone());
        try
        {
          ODFConversionPostProcessingData conversionResult = (ODFConversionPostProcessingData) future.get(MAX_SUBTASK_TIMEOUT,
              TimeUnit.MILLISECONDS);
          if (conversionResult.isSuccessful())
          {
            Element imageElement = conversionResult.getHtmlElement();
            if (imageElement != null)
            {
              // Clone the response since the original shape conversion will need to use the
              // one in the conversion results.
              image = (Element) imageElement.cloneNode(true);
              setAutomaticHtmlConcordId(image, SHAPE_ID_PREFIX);
            }
            // Clone the aria label for the description (if there is one):
            // Note: It isn't allowed as a child of the image so we will add it as a sibling
            Element ariaLabel = conversionResult.getAriaElement();
            if (ariaLabel != null)
            {
              aria = (Element) ariaLabel.cloneNode(true);
            }
          }
        }
        catch (InterruptedException e)
        {
          log.severe("InterruptedException occurred while waiting for subtask to complete in ODFDrawingParser.recreateImageElement");
        }
        catch (ExecutionException e)
        {
          log.severe("ExecutionException occurred while waiting for subtask to complete in ODFDrawingParser.recreateImageElement");
        }
        catch (TimeoutException e)
        {
          log.severe("TimeoutException occurred while waiting for subtask to complete in ODFDrawingParser.recreateImageElement");
        }

        if (image != null)
        {
          parent.appendChild(image);
        }
        else
        {
          createPlaceholderImageElement(parent);
        }

        if (aria != null)
        {
          parent.appendChild(aria);
        }
      }
      else
      {
        // Some error must have occurred. Log it and create a placeholder.
        log.warning("Cached conversion results not found for: " + targetSVGName);
        createPlaceholderImageElement(parent);
      }
    }
    else
    // Synchronous
    {
      if (this.ivSuccessful)
      {
        image = htmlDocument.createElement(ODFConstants.HTML_ELEMENT_IMG);
        setAutomaticHtmlConcordId(image, SHAPE_ID_PREFIX);
        image.setAttribute(ODFConstants.HTML_ATTR_SRC, ivImgSrc);
      }

      // The image will use outer div as boundary.
      StringBuilder buf = new StringBuilder(128);
      buf.append(ODFConstants.HTML_STYLE_REL_POSITION);
      buf.append(formatAttribute(ODFConstants.ALIGNMENT_LEFT, ZERO_PERCENT));
      buf.append(formatAttribute(ODFConstants.ALIGNMENT_TOP, ZERO_PERCENT));
      buf.append(formatAttribute(ODFConstants.SVG_ATTR_WIDTH, HUNDRED_PERCENT));
      buf.append(formatAttribute(ODFConstants.SVG_ATTR_HEIGHT, HUNDRED_PERCENT));
      if (image == null)
      {
        createPlaceholderImageElement(parent);
        return;
      }

      // add z-index info.
      image.setAttribute(ODFConstants.HTML_ATTR_STYLE, buf.toString());

      // if the image is not a line or connector, insert "draw_image" tag
      // for front-end contentBox parsing.
      adjustForMirroring(image);

      parent.appendChild(image);

      // Add the aria label (if any)
      aria = addAriaDescribeBy(image);
      if (aria != null)
        parent.appendChild(aria);
    }
  }

  /**
   * Base64 encode the data and place into encoded string.
   * 
   * @param data
   * @param encoded
   * @return true if success.
   */
  private static boolean createb64String(byte[] data, String[] encoded)
  {
    if (data == null || encoded == null || encoded.length == 0)
      return false;

    // want to make sure we try to get a big enough buffer size to
    // avoid resizing the array. But not too big so we don't incur
    // penalties for allocating large chunks of memory.

    int bufflen = data.length * 2;
    ByteArrayOutputStream out = new ByteArrayOutputStream(bufflen);

    try
    {
      new BASE64Encoder().encode(data, out);
    }
    catch (Exception e)
    {
      log.log(Level.WARNING, e.getMessage(), e);
      return false;
    }

    // make sure to strip out newline and CR chars
    String b64val = out.toString().replace("\r", "");
    b64val = b64val.replace("\n", "");
    encoded[0] = b64val;

    return true;
  }

  /**
   * Write the data to the given filepath.
   * 
   * @param filepath
   * @param data
   * @return true if success.
   */
  private static boolean writePNGFile(String filepath, ByteArrayOutputStream data)
  {
    BufferedOutputStream bout = null;
    boolean success = false;

    if (data == null)
      return success;

    try
    {
      bout = new BufferedOutputStream(new FileOutputStream(filepath));
      data.writeTo(bout);
      success = true;
    }
    catch (Exception e)
    {
      log.warning("Unexpected in shape2image conversion. Failing Shape is located here: " + filepath);
      log.log(Level.WARNING, e.getMessage(), e);
    }
    finally
    {
      try
      {
        if (bout != null)
        {
          bout.close();
        }
      }
      catch (IOException e)
      {
        log.log(Level.WARNING, "IO error", e);
        success = false;
      }
    }

    return success;
  }

  private SVGDocumentWrapper parse(SVGDocumentWrapper doc, Node node, Node parent, boolean stripText)
  {
    Node target = null;
    if (node instanceof DrawCustomShapeElement)
      target = parent;
    else
      target = append(doc, node, parent, null);

    if (target == null)
      return doc;
    NodeList children = node.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      String prefix = child.getPrefix();
      // Skip text and office event listeners elements
      if ((prefix != null) && (prefix.equals(ODFConstants.TEXT)) || (child instanceof OdfOfficeEventListeners))
      {
        if (!stripText)
          target = append(doc, node, parent, child);
        continue;
      }
      doc = parse(doc, child, target, stripText);
    }
    return doc;
  }

  private SVGDocumentWrapper parseDCSEStraightLine(SVGDocumentWrapper doc, Node node, Node parent)
  {
    int MARKER_CONSTANT = 6; // Allow space for draw custom shape markers
    Element eNode = (Element) node;

    Element svgNode = (Element) parent;
    String svgHeight = svgNode.getAttribute(ODFConstants.SVG_ATTR_HEIGHT);
    double d_svgHeight = Double.parseDouble(svgHeight);
    String svgWidth = svgNode.getAttribute(ODFConstants.SVG_ATTR_WIDTH);
    double d_svgWidth = Double.parseDouble(svgWidth);

    String height = eNode.getAttribute(ODFConstants.SVG_HEIGHT);
    double d_height = Measure.extractNumber(height);
    boolean bHorizontal = (d_height < 0.002) ? true : false;
    double dX1 = 0.0;
    double dY1 = 0.0;

    // double dX2 = dX1 + dWidth;
    // double dY2 = dY1 + dHeight;
    double dX2 = d_svgWidth;
    double dY2 = d_svgHeight;

    // Add room for the markers
    if (bHorizontal)
    {
      d_svgHeight += MARKER_CONSTANT;
      dY1 = MARKER_CONSTANT / 2;
      dY2 = MARKER_CONSTANT / 2;
      dX1 = dX1 + MARKER_CONSTANT;
      dX2 = dX2 - MARKER_CONSTANT;
      // Add elements to size map to assist with place and export
      this.ivSizeMap.put(ODFConstants.DRAW_CUSTOM_SHAPE_ELEMENT_HORIZONTAL, true);
      this.ivSizeMap.put(TOP_OFFSET, String.valueOf(convertPixelToCM(MARKER_CONSTANT / 2)));
    }
    else
    {
      d_svgWidth += MARKER_CONSTANT;
      dX1 = MARKER_CONSTANT / 2;
      dX2 = MARKER_CONSTANT / 2;
      dY1 = dY1 + MARKER_CONSTANT;
      dY2 = dY2 - MARKER_CONSTANT;
      // Add elements to size map to assist with place and export
      this.ivSizeMap.put(ODFConstants.DRAW_CUSTOM_SHAPE_ELEMENT_VERTICAL, true);
      this.ivSizeMap.put(LEFT_OFFSET, String.valueOf(convertPixelToCM(MARKER_CONSTANT / 2)));
    }
    // Reset the Height and Width
    ((Element) parent).setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(d_svgWidth));
    ((Element) parent).setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(d_svgHeight));

    NodeList children = node.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      String nodeName = child.getNodeName();
      if (nodeName.equalsIgnoreCase(ODFConstants.DRAW_ENHANCED_GEOMETRY))
      {
        Element line = null;
        line = doc.getDocument().createElementNS(SVG_NS, ODFConstants.SVG_ATTR_LINE);
        setAutomaticHtmlConcordId(line, SHAPE_ID_PREFIX);
        line = handleGeometryElement(doc, child, line);
        line.setAttributeNS(null, ODFConstants.SVG_ATTR_X1, String.valueOf(Math.abs(dX1)));
        line.setAttributeNS(null, ODFConstants.SVG_ATTR_X2, String.valueOf(Math.abs(dX2)));
        line.setAttributeNS(null, ODFConstants.SVG_ATTR_Y1, String.valueOf(Math.abs(dY1)));
        line.setAttributeNS(null, ODFConstants.SVG_ATTR_Y2, String.valueOf(Math.abs(dY2)));

        parent.appendChild(line);
        break;
      }
    }
    return doc;
  }

  /**
   * append the svg element to the parent
   * 
   * @param node
   *          is the current ODF element
   * @param parent
   *          is the svg parent node
   * @return
   */
  @SuppressWarnings("unchecked")
  public Node append(SVGDocumentWrapper doc, Node node, Node parent, Node child)
  {
    String target = ODFSVGMap.getInstance().find(node.getNodeName());

    // Common Processing
    Element element = null;
    if (target != null)
    {
      element = doc.getDocument().createElementNS(SVG_NS, target);
      setAutomaticHtmlConcordId(element, SHAPE_ID_PREFIX);
      if (parent instanceof Element)
      {
        element = parseAttributes(doc, node, element);
      }
      if (node instanceof DrawEnhancedGeometryElement)
      {
        element = handleGeometryElement(doc, node, element);
      }
      parent.appendChild(element);
    }

    // ODP Processing (if the InplaceStyle context value is NOT set)
    if (isUsingODPRules())
    {
      return element;
    }
    // ODT Processing (if the InplaceStyle context value is set to a value)
    else
    {
      Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get(ODFConstants.CONTEXT_IMPLACE_STYLE);

      Node origChild = child;
      Element textParent = null;
      if (target == null || child == null)
      {
        if (child == null)
        {
          child = node.getFirstChild();
        }
        if (target == null && (null == child || (null != child.getPrefix() && !child.getPrefix().equals(ODFConstants.TEXT))))
          return null;
        else if (child != null && child.getPrefix() != null && child.getPrefix().equals(ODFConstants.TEXT))
        {
          String content = "";
          if (child.getNodeName().toLowerCase().equals(ODFConstants.ODF_ELEMENT_TEXT_PARAGRAPH))
          {
            if (null == child.getFirstChild())
              return parent;
            if (child.getFirstChild().getNodeName().toLowerCase().equals(ODFConstants.TEXT_SPAN))
            {
              if (child.getFirstChild().hasChildNodes())
                content = child.getFirstChild().getFirstChild().getNodeValue();
              else
                content = child.getFirstChild().getNodeValue();
              textParent = (Element) child.getFirstChild();
            }
            else
            {
              content = child.getFirstChild().getNodeValue();
              textParent = (Element) child;
            }
          }
          else
            content = child.getNodeValue();

          if (null != content && content.length() > 0)
          {
            Text txtChild = doc.getDocument().createTextNode(content);
            Element txtElement = doc.getDocument().createElement(ODFConstants.TEXT);
            txtElement.appendChild(txtChild);
            // txtElement.setAttribute("x", width);
            // txtElement.setAttribute("y", height);
            txtElement.setAttribute(ODFConstants.SVG_ATTR_STROKE_WIDTH, "1");
            String styleName = textParent.getAttribute(ODFConstants.TEXT_STYLE_NAME);
            Map<String, String> styleMap = map.get(styleName);
            String fontColor = BLACK;
            if (styleMap != null && styleMap.get(ODFConstants.CSS_FONT_COLOR) != null)
              fontColor = styleMap.get(ODFConstants.CSS_FONT_COLOR);
            txtElement.setAttribute(ODFConstants.SVG_ATTR_FILL, fontColor);
            ((Element) parent).setAttribute(HAS_TEXT, "0");

            parent.appendChild(txtElement);
          }
        }
        if (origChild != null)
          return parent;
      }
      return null;
    }
  }

  private Element handleGeometryElement(SVGDocumentWrapper doc, Node node, Element element)
  {
    JSONObject pos = doc.getPosAttributeMap();
    DrawEnhancedGeometryElement geoElement = (DrawEnhancedGeometryElement) node;
    String paths = geoElement.getDrawEnhancedPathAttribute();
    FormulaParser formulaParser = new FormulaParser(node);
    PathAnalyzer parser = new PathAnalyzer(formulaParser);
    String oldViewBox = geoElement.getSvgViewBoxAttribute();
    if (oldViewBox == null)
      oldViewBox = DrawingUtil.DEFAULT_VIEWBOX;
    parser.setOriginalViewBox(oldViewBox);
    doc.setOriginalViewBox(oldViewBox);
    Map<String, String> pathNodeList = parser.parse(paths);
    String drawType = geoElement.getDrawTypeAttribute();
    Boolean mirrorH = geoElement.getDrawMirrorHorizontalAttribute();
    Boolean mirrorV = geoElement.getDrawMirrorVerticalAttribute();
    pos.put(ODFConstants.ODF_ATTR_MIRROR_H, mirrorH);
    pos.put(ODFConstants.ODF_ATTR_MIRROR_V, mirrorV);
    // if (drawType.equals(CIRCULAR_ARROW) || drawType.contains(CALLOUT) || drawType.contains(CL_RECTANGLE) || drawType.contains(ELLIPSE)
    // || drawType.startsWith(MICROSOFT_OBJECT))
    // {
    // String modifiers = geoElement.getDrawModifiersAttribute(); // Commented as part of 8551 fix (see below)
    String viewBox = geoElement.getSvgViewBoxAttribute();

    // If there is no Viewbox defined for this element, we should not adjust the Height/Width
    if (viewBox != null)
    {
      String[] viewBoxes = viewBox.split(" ");
      double start_x = Double.parseDouble(viewBoxes[0]);
      double start_y = Double.parseDouble(viewBoxes[1]);
      double end_x = Double.parseDouble(viewBoxes[2]);
      double end_y = Double.parseDouble(viewBoxes[3]);
      double base_w = end_x - start_x;
      double base_h = end_y - start_y;

      double minX = parser.getMinXCoordinate();
      double minY = parser.getMinYCoordinate();
      double maxX = parser.getMaxXCoordinate();
      double maxY = parser.getMaxYCoordinate();

      // Krings: 8551 According the ODF spec modifiers should not have an impact on the view box.
      // if (modifiers != null)
      // {
      // String[] modifier = modifiers.split(" ");
      // for (int i = 0; i < modifier.length / 2; i++)
      // {
      // double x = Double.parseDouble(modifier[2 * i]);
      // double y = Double.parseDouble(modifier[2 * i + 1]);
      // if (x < minX)
      // minX = x;
      // if (x > maxX)
      // maxX = x;
      // if (y < minY)
      // minY = y;
      // if (y > maxY)
      // maxY = y;
      // }
      // }

      double viewBox_width = maxX - minX;
      double viewBox_height = maxY - minY;
      double width = 0.0;
      try
      {
        width = Double.parseDouble(doc.getDocument().getDocumentElement().getAttribute(ODFConstants.SVG_ATTR_WIDTH));
      }
      catch (Exception e)
      {
        log.info("Width did not exist, using defaults");
        width = 1.0;
        base_w = 1.0;
      }
      double height = 0.0;
      try
      {
        height = Double.parseDouble(doc.getDocument().getDocumentElement().getAttribute(ODFConstants.SVG_ATTR_HEIGHT));
      }
      catch (Exception e)
      {
        log.info("Height did not exist, using defaults");
        height = 1.0;
        base_h = 1.0;
      }
      Element root = doc.getDocument().getDocumentElement();
      // Added MSO_ELLIPSE in this check. I am not sure why an ellipse is excluded
      // here, but the MSO_ELLIPSE was doubling in size
      if (!drawType.equals(ELLIPSE) && !drawType.equals(MSO_ELLIPSE) && !drawType.equals(NON_PRIMITIVE))
      {
        if (minX < start_x)
        {
          double left_delta = (start_x - minX) / base_w;
          pos.put(LEFT_DELTA, String.valueOf(roundToNearestThousandth(left_delta)));
        }
        if (minY < start_y)
        {
          double top_delta = (start_y - minY) / base_h;
          pos.put(TOP_DELTA, String.valueOf(roundToNearestThousandth(top_delta)));
        }
        root.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf((int) (width * (viewBox_width) / base_w)));
        root.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf((int) (height * (viewBox_height) / base_h)));
      }
      String newViewBox = String.valueOf(minX) + ' ' + String.valueOf(minY) + ' ' + String.valueOf(viewBox_width) + ' '
          + String.valueOf(viewBox_height);
      root.setAttributeNS(null, ODFConstants.SVG_ATTR_VIEWBOX, newViewBox);
      doc.setRevisedViewBox(newViewBox);

      // Handle the draw:text-rotate-angle (store the result so that it can be used when generating the text structure)
      String textRotationAngle = geoElement.getDrawTextRotateAngleAttribute();
      if ((textRotationAngle != null) && (textRotationAngle.length() > 0))
      {
        this.context.put(ODFConstants.CONTEXT_TEXT_ROTATION_ANGLE, textRotationAngle);
      }

      // =============================================================================================
      // Handle the Text Areas - The text area is influenced by 3 factors:
      // (1) svg:viewbox
      // (2) draw:text-areas
      // (3) draw:handle (for the sake of computing the text area, handles are not considered)
      // =============================================================================================
      double[] textAreaValues = null;
      String textAreasValue = geoElement.getDrawTextAreasAttribute();
      if (textAreasValue != null)
      {
        String[] textAreas = textAreasValue.split(" ");
        textAreaValues = new double[textAreas.length];
        for (int i = 0; i < textAreas.length; i++)
        {
          textAreaValues[i] = formulaParser.getRealValue(textAreas[i]);
        }
      }
      // If there is no draw:text-areas defined, the textarea is the same as the viewbox
      else
      {
        textAreaValues = new double[viewBoxes.length];
        textAreaValues[0] = start_x;
        textAreaValues[1] = start_y;
        textAreaValues[2] = end_x;
        textAreaValues[3] = end_y;
      }

      // If the Minimum X or Y is less than the viewbox (because of the draw:handles) left or top, we need to slide the text area
      if (minX < start_x)
      {
        double adjustment = (start_x - minX);
        textAreaValues[0] += adjustment;
        textAreaValues[2] += adjustment;
      }
      if (minY < start_y)
      {
        double adjustment = (start_y - minY);
        textAreaValues[1] += adjustment;
        textAreaValues[3] += adjustment;
      }

      // Calculate the resulting text area left, top, width, and height and store the information in the context
      double leftValue = (textAreaValues[0] - start_x) * 100 / viewBox_width;
      double topValue = (textAreaValues[1] - start_y) * 100 / viewBox_height;
      double widthValue = (textAreaValues[2] - textAreaValues[0]) * 100 / viewBox_width;
      double heightValue = (textAreaValues[3] - textAreaValues[1]) * 100 / viewBox_height;

      String textAreaContextValue = Double.toString(leftValue) + ODFConstants.SYMBOL_WHITESPACE + Double.toString(topValue)
          + ODFConstants.SYMBOL_WHITESPACE + Double.toString(widthValue) + ODFConstants.SYMBOL_WHITESPACE + Double.toString(heightValue);

      addToContextForAsyncProcessing(ODFConstants.CONTEXT_SHAPE_TEXT_AREAS, textAreaContextValue);
    }
    // }
    if (pathNodeList != null)
    {
      for (Map.Entry<String, String> path : pathNodeList.entrySet())
      {
        Element pathElement = doc.getDocument().createElementNS(null, ODFConstants.SVG_ELEMENT_PATH);
        setAutomaticHtmlConcordId(pathElement, SHAPE_ID_PREFIX);
        pathElement.setAttributeNS(null, ODFConstants.SVG_ATTR_D, path.getKey());
        if (ODFConstants.HTML_VALUE_NONE.equals(path.getValue()))
          pathElement.setAttributeNS(null, ODFConstants.SVG_ATTR_FILL, ODFConstants.HTML_VALUE_NONE);
        element.appendChild(pathElement);
      }
    }
    return element;
  }

  private void parseStyle(List<String> attr, SVGDocumentWrapper svgDoc)
  {

    for (String value : attr)
    {

      List<Node> l = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(context, value);
      if (l != null)
      {
        Node style = l.get(0);
        ivParser.parse(style);
      }
    }

    // Once we are done parsing the Style and if the shape is closed, make sure the SVG settings indicate a closed shape
    // Prior calls to parseAttributes and the GraphicsPropertiesParser handle lines and connectors
    if (isClosedShape(svgDoc.getType()))
    {
      svgDoc.setClosed(true);
    }
  }

  public List<String> getClassElements(Node element)
  {

    NamedNodeMap attrs = element.getAttributes();
    int size = attrs.getLength();
    int capacity = (size == 0) ? 1 : size;
    List<String> styleRef = new ArrayList<String>(capacity);
    for (int i = 0; i < size; i++)
    {
      Node attr = attrs.item(i);
      if (attr.getLocalName().endsWith("style-name"))
      {
        styleRef.add(attr.getNodeValue());
      }
    }
    return styleRef;
  }

  // changed the parameter's name to make it more understandable. by pzzhang.
  private Element parseAttributes(SVGDocumentWrapper svgDoc, Node odfNode, Element svgElement)
  {
    NamedNodeMap attrs = odfNode.getAttributes();

    Element root = svgDoc.getDocument().getDocumentElement();
    for (int i = 0; i < attrs.getLength(); i++)
    {
      Node attrItem = attrs.item(i);
      String attrName = attrItem.getNodeName();

      // If there is a draw:enhanced-path, then the shape is not closed unless there is a Z in the Path
      if (attrName.equals(ODFConstants.ODF_ELEMENT_DRAWENHANCEDPATH))
      {
        String attrValue = attrItem.getNodeValue();
        if (attrValue.contains(ODFConstants.CLOSED_DRAW_ENHANCED_PATH))
        {
          svgDoc.setClosed(true);
        }
      }

      String targetAttr = ODFSVGMap.getInstance().find(attrName);
      if (targetAttr == null)
        continue;
      String attrValue = attrItem.getNodeValue();

      // modified by pzzhang. reconstructed.
      if (isPositionStartAttr(attrItem))
      {
        // set (0,0) to the shape's start position
        attrValue = "0";
      }
      else if (isPositionEndAttr(attrItem))
      {

        // set the (width, height) to the shape's end position.
        if (attrItem instanceof SvgX2Attribute)
        {
          String x1 = ZERO_CM;
          Node x1Node = odfNode.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_SVG_X1);
          if (x1Node != null) // Per SVG document, if the value is missing it is assumed to be 0
          {
            x1 = x1Node.getNodeValue();
          }

          attrValue = getCoordinateSizeValue(x1, attrValue);
          if (odfNode instanceof DrawLineElement || odfNode instanceof DrawMeasureElement)
          {
            svgElement.setAttributeNS(null, ODFConstants.SVG_ATTR_X1,
                String.valueOf(convertCMToPixel(Math.abs(Measure.min(ZERO_CM, attrValue)) + "cm")));
            svgElement.setAttributeNS(null, ODFConstants.SVG_ATTR_X2,
                String.valueOf(convertCMToPixel(Math.abs(Measure.max(ZERO_CM, attrValue)) + "cm")));
            double width = Math.abs(convertCMToPixel(attrValue));
            if (width == 0)
              width = 1;
            root.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(width));
            continue;
          }

        }
        else if (attrItem instanceof SvgY2Attribute)
        {
          String y1 = ZERO_CM;
          Node y1Node = odfNode.getAttributes().getNamedItem(ODFConstants.ODF_ATTR_SVG_Y1);
          if (y1Node != null) // Per SVG document, if the value is missing it is assumed to be 0
          {
            y1 = y1Node.getNodeValue();
          }

          attrValue = getCoordinateSizeValue(y1, attrValue);
          if (odfNode instanceof DrawLineElement || odfNode instanceof DrawMeasureElement)
          {
            svgElement.setAttributeNS(null, ODFConstants.SVG_ATTR_Y1,
                String.valueOf(convertCMToPixel(Math.abs(Measure.min(ZERO_CM, attrValue)) + "cm")));
            svgElement.setAttributeNS(null, ODFConstants.SVG_ATTR_Y2,
                String.valueOf(convertCMToPixel(Math.abs(Measure.max(ZERO_CM, attrValue)) + "cm")));
            double height = Math.abs(convertCMToPixel(attrValue));
            if (height == 0)
              height = 1;
            root.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(height));
            continue;
          }

        }
      }
      else if (attrItem instanceof SvgDAttribute)
      {
        if (isLineOrConnector(odfNode))
        {
          PathCoordinationTransform transform = new PathCoordinationTransform();
          attrValue = transform.parse(attrValue);
          svgDoc.setClosed(transform.isClosed());
          StringBuilder viewBox = new StringBuilder(32);
          viewBox.append(transform.getMinXCoordinate()).append(' ').append(transform.getMinYCoordinate()).append(' ')
              .append(Math.abs(transform.getMaxXCoordinate() - transform.getMinXCoordinate())).append(' ')
              .append(Math.abs(transform.getMaxYCoordinate() - transform.getMinYCoordinate()));
          double dWidth = transform.width();
          double dHeight = transform.height();
          JSONObject pos = svgDoc.getPosAttributeMap();
          // If the path is not transformed (ie rotated, skewed, etc) we will subtract off the initial X,Y
          // In the transform.parse method above the initial starting point of the path is changed to 0,0
          // I am not sure why this was done, but if the item is not translated we need to remove the offset
          // of the original starting coordinates
          if (isTransformed((Element) odfNode) || (!(odfNode instanceof DrawPathElement)))
          {
            if (transform.getMinXCoordinate() < 0)
              pos.put(LEFT_OFFSET, String.valueOf(transform.leftOffset()));
            if (transform.getMinYCoordinate() < 0)
              pos.put(TOP_OFFSET, String.valueOf(transform.topOffset()));
          }
          else
          {
            if (transform.getMinXCoordinate() < 0)
              pos.put(LEFT_OFFSET, String.valueOf(transform.leftOffset() - transform.getInitialOffsetX()));
            if (transform.getMinYCoordinate() < 0)
              pos.put(TOP_OFFSET, String.valueOf(transform.topOffset() - transform.getInitialOffsetY()));

          }
          root.setAttributeNS(null, ODFConstants.SVG_ATTR_VIEWBOX, viewBox.toString());
          root.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(convertCMToPixel(String.valueOf(dWidth) + "cm")));
          root.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(convertCMToPixel(String.valueOf(dHeight) + "cm")));
        }

        svgElement.setAttributeNS(null, targetAttr, attrValue);
        continue;
      }
      else if (attrItem instanceof SvgViewBoxAttribute)
      {
        if (odfNode instanceof DrawPolylineElement || odfNode instanceof DrawPolygonElement || odfNode instanceof DrawPathElement)
          continue;
        root.setAttributeNS(null, targetAttr, attrValue);
      }
      else if (attrItem instanceof DrawPointsAttribute)
      {
        PointsTransform pt = new PointsTransform();
        attrValue = pt.parse(attrItem.getNodeValue());
        StringBuilder viewBox = new StringBuilder(32);
        viewBox.append(pt.getMinXCoordinate()).append(' ').append(pt.getMinYCoordinate()).append(' ')
            .append(Math.abs(pt.getMaxXCoordinate() - pt.getMinXCoordinate())).append(' ')
            .append(Math.abs(pt.getMaxYCoordinate() - pt.getMinYCoordinate()));
        root.setAttributeNS(null, ODFConstants.SVG_ATTR_VIEWBOX, viewBox.toString());
        double dWidth = pt.width();
        double dHeight = pt.height();
        root.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(convertCMToPixel(String.valueOf(dWidth) + "cm")));
        root.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(convertCMToPixel(String.valueOf(dHeight) + "cm")));
      }
      else if (attrItem instanceof SvgWidthAttribute)
      {
        double dWidth = Math.ceil(Math.abs(convertCMToPixel(attrValue)));
        JSONObject pos = svgDoc.getPosAttributeMap();
        pos.put("tempWidth", Measure.extractNumber(attrValue));
        svgElement.setAttributeNS(null, targetAttr, String.valueOf(dWidth));
        if (odfNode instanceof DrawEllipseElement)
        {
          svgElement.setAttributeNS(null, ODFConstants.SVG_ELLIPSE_ATTR_CX, String.valueOf(dWidth / 2));
          svgElement.setAttributeNS(null, ODFConstants.SVG_ELLIPSE_ATTR_RX, String.valueOf(dWidth / 2));
        }
        if (odfNode instanceof DrawCircleElement)
        {
          svgElement.setAttributeNS(null, ODFConstants.SVG_ELLIPSE_ATTR_CX, String.valueOf(dWidth / 2));
          svgElement.setAttributeNS(null, ODFConstants.SVG_CIRCLE_ATTR_R, String.valueOf(dWidth / 2));
        }
        continue;
      }
      else if (attrItem instanceof SvgHeightAttribute)
      {
        double dHeight = Math.ceil(Math.abs(convertCMToPixel(attrValue)));
        svgElement.setAttributeNS(null, targetAttr, String.valueOf(dHeight));
        JSONObject pos = svgDoc.getPosAttributeMap();
        pos.put("tempHeight", Measure.extractNumber(attrValue));
        if (odfNode instanceof DrawEllipseElement)
        {
          svgElement.setAttributeNS(null, ODFConstants.SVG_ELLIPSE_ATTR_CY, String.valueOf(dHeight / 2));
          svgElement.setAttributeNS(null, ODFConstants.SVG_ELLIPSE_ATTR_RY, String.valueOf(dHeight / 2));
        }
        if (odfNode instanceof DrawCircleElement)
        {
          svgElement.setAttributeNS(null, ODFConstants.SVG_ELLIPSE_ATTR_CY, String.valueOf(dHeight / 2));
          svgElement.setAttributeNS(null, ODFConstants.SVG_CIRCLE_ATTR_R, String.valueOf(dHeight / 2));
        }
        continue;
      }
      else if (attrItem instanceof DrawTransformAttribute)
        continue;
      if (!(odfNode instanceof DrawCustomShapeElement || odfNode instanceof DrawEnhancedGeometryElement))
        svgElement.setAttributeNS(null, targetAttr, attrValue);
      else
        root.setAttributeNS(null, targetAttr, attrValue);
    }
    addAttributes(odfNode, svgDoc, svgElement);
    return svgElement;
  }

  /**
   * 
   * @param odfNode
   *          node to check for transform
   * @return true if node contains a transform, false otherwise
   */
  private boolean isTransformed(Element odfNode)
  {
    String attr = odfNode.getAttribute(ODFConstants.ODF_ATTR_DRAWTRANSFORM);
    if (null == attr || attr.length() == 0)
      return false;
    return true;
  }

  private void addAttributes(Node odfNode, SVGDocumentWrapper wrapper, Element svgElement)
  {
    if (odfNode instanceof DrawEnhancedGeometryElement)
    {
      Element root = wrapper.getDocument().getDocumentElement();
      DrawEnhancedGeometryElement element = (DrawEnhancedGeometryElement) odfNode;
      if (!(root.hasAttribute(ODFConstants.SVG_ATTR_VIEWBOX)))
      {
        root.setAttributeNS(null, ODFConstants.SVG_ATTR_VIEWBOX, DrawingUtil.DEFAULT_VIEWBOX);
      }
      String drawType = element.getDrawTypeAttribute();
      if (drawType != null
          && (drawType.equals(RING) || drawType.equals(FRAME) || drawType.equals(SMILEY) || drawType.equals(FORBIDDEN) || drawType
              .equals(NON_PRIMITIVE)))
      {
        svgElement.setAttributeNS(null, FILL_RULE, EVENODD);
      }
    }
    else if (isLineOrConnector(odfNode) && !wrapper.isClosed())
    {
      svgElement.setAttributeNS(null, ODFConstants.SVG_ATTR_FILL, ODFConstants.HTML_VALUE_NONE);
    }
  }

  private Document normalizeTranform(SVGDocumentWrapper wrapper, JSONObject transformMap, String shapeHeight, String shapeWidth)
  {
    Document newDoc = SVGDocumentFactory.createSVGDocument();
    Element group = newDoc.createElement(ODFConstants.SVG_ATTR_GROUP);
    setAutomaticHtmlConcordId(group, SHAPE_ID_PREFIX);
    final Document oldDoc = wrapper.getDocument();
    Element oldRootElement = oldDoc.getDocumentElement();
    Node node = newDoc.importNode(oldRootElement, true);
    group.appendChild(node);

    double angle = Double.parseDouble((String) transformMap.get(ROTATE));
    boolean hasSkewX = transformMap.containsKey(SKEW_X);

    double sxAngle = 0.0;
    if (hasSkewX)
      sxAngle = Double.parseDouble((String) transformMap.get(SKEW_X));

    double width = 0;
    String widthValue = oldRootElement.getAttribute(ODFConstants.SVG_ATTR_WIDTH);
    if ((widthValue == null) || (widthValue.length() <= 0))
    {
      width = Measure.extractNumber(shapeWidth);
    }
    else
    {
      width = Double.parseDouble(widthValue);
    }

    double height = 0;
    String heightValue = oldRootElement.getAttribute(ODFConstants.SVG_ATTR_HEIGHT);
    if ((heightValue == null) || (heightValue.length() <= 0))
    {
      height = Measure.extractNumber(shapeHeight);
    }
    else
    {
      height = Double.parseDouble(heightValue);
    }

    double cosAngle = Math.cos(angle);
    double sinAngle = Math.sin(angle);
    double newWidth = Math.abs(width * cosAngle) + Math.abs(height * sinAngle);
    double newHeight = Math.abs(width * sinAngle) + Math.abs(height * cosAngle);
    String parameters = (String) transformMap.get(TRANSLATE);
    String[] parameter = parameters.split(",");
    String x = parameter[0];
    String y = parameter[1];
    double offset_x = 0.0;
    double offset_y = 0.0;
    double nx = Measure.extractNumber(x);
    double ny = Measure.extractNumber(y);

    JSONObject pos = wrapper.getPosAttributeMap();
    double dWidth = 0.0;
    double dHeight = 0.0;

    String originalViewBox = wrapper.getOriginalViewBox();
    String revisedViewBox = wrapper.getRevisedViewBox();
    double originalleft = 0, originalTop = 0, originalRight = 0, originalBottom = 0, originalWidth = 1, originalHeight = 1;
    double revisedleft = 0, revisedTop = 0, revisedRight = 0, revisedBottom = 0;
    if (originalViewBox != null)
    {
      String[] viewBoxes = originalViewBox.split(" ");
      originalleft = Double.parseDouble(viewBoxes[0]);
      originalTop = Double.parseDouble(viewBoxes[1]);
      originalWidth = Double.parseDouble(viewBoxes[2]);
      originalHeight = Double.parseDouble(viewBoxes[3]);
      originalRight = originalleft + originalWidth;
      originalBottom = originalleft + originalHeight;
    }
    if (revisedViewBox != null)
    {
      String[] viewBoxes = revisedViewBox.split(" ");
      revisedleft = Double.parseDouble(viewBoxes[0]);
      revisedTop = Double.parseDouble(viewBoxes[1]);
      revisedRight = revisedleft + Double.parseDouble(viewBoxes[2]);
      revisedBottom = revisedTop + Double.parseDouble(viewBoxes[3]);
    }
    if (pos.containsKey("tempWidth"))
    {
      dWidth = (Double) pos.get("tempWidth");
      pos.remove("tempWidth");
    }
    if (pos.containsKey("tempHeight"))
    {
      dHeight = (Double) pos.get("tempHeight");
      pos.remove("tempHeight");
    }
    double left_delta = 0.0, top_delta = 0.0;
    if (pos.containsKey(LEFT_DELTA))
    {
      left_delta = Double.parseDouble((String) pos.get(LEFT_DELTA));
      pos.remove(LEFT_DELTA);
    }
    else if (pos.containsKey(TOP_DELTA))
    {
      top_delta = Double.parseDouble((String) pos.get(TOP_DELTA));
      pos.remove(TOP_DELTA);
    }
    if (angle > 0 && angle <= Math.PI / 2)
    {
      offset_y = width * sinAngle;
      if (revisedleft < originalleft)
      {
        nx = nx - left_delta * dWidth * cosAngle;
      }
      if (revisedRight > originalRight)
      {
        left_delta = (revisedRight - originalRight) / originalWidth;
        ny = ny - left_delta * dWidth * sinAngle;
      }

      ny = ny - dWidth * sinAngle;
    }
    else if (angle > Math.PI / 2 && angle < Math.PI)
    {
      offset_x = -1 * width * cosAngle;
      offset_y = width * sinAngle + -1 * height * cosAngle;
      if (revisedTop < originalTop)
      {
        top_delta = (originalTop - revisedTop) / originalHeight;
        ny = ny - top_delta * dHeight * sinAngle;
      }

      if (revisedBottom > originalBottom)
      {
        top_delta = (revisedBottom - originalBottom) / originalHeight;
        ny = ny - top_delta * dHeight * sinAngle;
      }

      if (revisedRight > originalRight)
      {
        left_delta = (revisedRight - originalRight) / originalWidth;
        nx = nx - left_delta * dWidth;
      }
      nx = nx + dWidth * cosAngle;
      ny = ny - (dWidth * sinAngle - dHeight * cosAngle);
    }
    else if (angle >= -Math.PI / 2 && angle < 0)
    {
      offset_x = -1 * height * sinAngle;
      if (revisedTop < originalTop)
      {
        top_delta = (originalTop - revisedTop) / originalHeight;
        ny = ny + top_delta * dHeight * sinAngle;
      }
      if (revisedleft < originalleft)
        ny = ny + top_delta * dHeight * sinAngle;
      if (revisedBottom > originalBottom)
      {
        top_delta = (revisedBottom - originalBottom) / originalHeight;
        ny = ny + top_delta * dHeight * sinAngle;
      }
      nx = nx + dHeight * sinAngle;
    }
    else if (angle >= -Math.PI && angle < -Math.PI / 2)
    {
      offset_x = -1 * width * cosAngle - height * sinAngle;
      offset_y = -1 * height * cosAngle;

      if (revisedBottom > originalBottom)
      {
        top_delta = (revisedBottom - originalBottom) / originalHeight;
        ny = ny - top_delta * dHeight * sinAngle;
      }

      if (revisedRight > originalRight)
      {
        left_delta = (revisedRight - originalRight) / originalWidth;
        nx = nx - left_delta * dWidth * cosAngle;
      }
      nx = nx + (dWidth * cosAngle + dHeight * sinAngle);
      ny = ny + dHeight * cosAngle;
    }
    Element root = newDoc.getDocumentElement();
    root.setAttributeNS(null, ODFConstants.SVG_ATTR_PRESERVE_ASPECT_RATIO, ODFConstants.HTML_VALUE_NONE);
    root.setAttributeNS(null, ODFConstants.SVG_ATTR_WIDTH, String.valueOf(newWidth));
    root.setAttributeNS(null, ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(newHeight));

    if (hasSkewX)
      group.setAttributeNS(null, ODFConstants.SVG_ATTR_TRANSFORM, "translate(" + offset_x + " " + String.valueOf(offset_y) + ") skew("
          + String.valueOf(-1 * sxAngle * 180 / Math.PI) + ") rotate(" + String.valueOf(-1 * angle * 180 / Math.PI) + ")");
    else
      group.setAttributeNS(null, ODFConstants.SVG_ATTR_TRANSFORM, "translate(" + offset_x + " " + String.valueOf(offset_y) + ") rotate("
          + String.valueOf(-1 * angle * 180 / Math.PI) + ")");
    root.appendChild(group);

    pos.put(ODFConstants.ALIGNMENT_LEFT, String.valueOf(nx));
    pos.put(ODFConstants.ALIGNMENT_TOP, String.valueOf(ny));
    return newDoc;
  }

  /**
   * Rounds a double to the nearest thousandth
   * 
   * @return the rounded double
   */
  public double roundToNearestThousandth(double original)
  {
    return ((double) Math.round(original * THOUSANDTH)) / THOUSANDTH;
  }

  private static final int THOUSANDTH = 1000;

  /**
   * 
   * @return the height adjustment made by the ivParser, 0.0 if ivParser is null
   */
  public double getShapeHeightAdjustmentCM()
  {
    if (null == ivParser)
      return 0.0;
    return ivParser.getHeightAdjustmentCM();
  }

  /**
   * 
   * @return the width adjustment made by the ivParser, 0.0 if ivParser is null
   */
  public double getShapeWidthAdjustmentCM()
  {
    if (null == ivParser)
      return 0.0;
    return ivParser.getWidthAdjustmentCM();
  }

  // test whether current node is a line/connector related shape.
  private boolean isLineOrConnector(Node node)
  {
    return (node instanceof DrawLineElement) || (node instanceof DrawConnectorElement) || (node instanceof DrawMeasureElement)
        || (node instanceof DrawPathElement);
  }

  private boolean isPositionEndAttr(Node attrItem)
  {
    return (attrItem instanceof SvgX2Attribute || attrItem instanceof SvgY2Attribute);
  }

  private boolean isPositionStartAttr(Node attrItem)
  {
    return (attrItem instanceof SvgXAttribute || attrItem instanceof SvgYAttribute || attrItem instanceof SvgX1Attribute || attrItem instanceof SvgY1Attribute);
  }

  /**
   * Determines if Shape is a Closed Shape type
   * <p>
   * 
   * @param type
   *          Shape type
   * @return boolean true if the Shape is a Closed Shape type
   * 
   */
  private boolean isClosedShape(String type)
  {
    return type.equals(POLYGON) || type.equals(RECT) || type.equals(ELLIPSE) || type.equals(CIRCLE);
  }

  /**
   * Determines if Shape is a Closed Shape type
   * <p>
   * 
   * @param type
   *          Shape type
   * @return boolean true if the Shape is a Closed Shape type
   * 
   */
  private boolean isClosedRectangle(Node root, Element svg)
  {

    if (svg != null)
    {
      Node drawEnhancedGeometryNode = getDrawEnhancedGeometryNode(root);
      if (drawEnhancedGeometryNode != null)
      {
        Element e = (Element) drawEnhancedGeometryNode;
        String type = e.getAttribute(ODFConstants.DRAW_TYPE);
        if (type != null && type.length() > 0)
          if (type.equals(RECTANGLE))
            return true;
      }
    }
    return false;
  }

  private Node getDrawEnhancedGeometryNode(Node root)
  {
    NodeList children = root.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child.getNodeName().equalsIgnoreCase(ODFConstants.DRAW_ENHANCED_GEOMETRY))
        return child;
      getDrawEnhancedGeometryNode(child);
    }
    return null;
  }

  private String formatAttribute(String key, String value)
  {
    return MessageFormat.format("{0}:{1};", new Object[] { key, value });
  }

  private double convertPixelToCM(double value)
  {
    return value / 96 * Measure.IN_CM_CONVERSION;
  }

  private double getCoordinateSizeInPixels(Node startNode, Node endNode)
  {
    double startValue = 0;
    double endValue = 0;

    if (startNode != null)
    {
      startValue = convertCMToPixel(startNode.getNodeValue());
    }
    if (endNode != null)
    {
      endValue = convertCMToPixel(endNode.getNodeValue());
    }

    return Math.abs(endValue - startValue);
  }

  private String getCoordinateSizeValue(String start, String end)
  {
    String returnValue;

    Measure startMeasure = Measure.parseNumber(start);
    Measure endMeasure = Measure.parseNumber(end);

    startMeasure.convertINToCM();
    endMeasure.convertINToCM();

    if (startMeasure.isCMMeasure() && endMeasure.isCMMeasure())
    {
      returnValue = Double.toString(endMeasure.getNumber() - startMeasure.getNumber()) + Measure.CENTIMETER;
    }
    else
    {
      returnValue = end;
    }
    return returnValue;
  }

  private double convertCMToPixel(String value)
  {
    Measure measure = Measure.parseNumber(value);
    boolean converted = measure.convertCMToPixel();
    if (converted)
    {
      return measure.getNumber();
    }
    else
      return 0.0;
  }

  /*
   * Adjust the Image HTML Structure for Flipped/Mirrored Shapes. The following CSS classes created in CSSConvertUtil are used: <UL>
   * <LI>flipH - Only if draw:mirror-horizontal is defined <LI>flipV - Only if draw:mirror-vertical is defined <LI>flipVH - Only if both
   * draw:mirror-horizontal and draw:mirror-vertical are defined </UL>
   * 
   * @param image HTML structure to adjust
   */
  private void adjustForMirroring(Element image)
  {
    String classes = ODFConstants.HTML_CLASS_DRAW_IMAGE;

    boolean flipH = false;
    if (ivSizeMap.containsKey(ODFConstants.ODF_ATTR_MIRROR_H) && (Boolean) ivSizeMap.get(ODFConstants.ODF_ATTR_MIRROR_H))
      flipH = true;

    boolean flipV = false;
    if (ivSizeMap.containsKey(ODFConstants.ODF_ATTR_MIRROR_V) && (Boolean) ivSizeMap.get(ODFConstants.ODF_ATTR_MIRROR_V))
      flipV = true;

    if (flipV)
    {
      if (flipH)
        classes += FLIP_VH;
      else
        classes += FLIP_V;
    }
    else if (flipH)
    {
      classes += FLIP_H;
    }

    image.setAttribute(ODFConstants.HTML_ATTR_CLASS, classes);
  }

  /*
   * Adjust the Image HTML Structure for Flipped/Mirrored Shapes. The following CSS classes created in CSSConvertUtil are used: <UL>
   * <LI>flipH - Only if draw:mirror-horizontal is defined <LI>flipV - Only if draw:mirror-vertical is defined <LI>flipVH - Only if both
   * draw:mirror-horizontal and draw:mirror-vertical are defined </UL>
   * 
   * @param image HTML structure to adjust
   * 
   * @param heightValue Numeric value for the height
   * 
   * @param widthValue Numeric value for the width
   */
  private void adjustForMirroring(Element image, double heightValue, double widthValue)
  {
    String classes = ODFConstants.HTML_CLASS_DRAW_IMAGE;

    boolean flipH = false;
    if (ivSizeMap.containsKey(ODFConstants.ODF_ATTR_MIRROR_H) && (Boolean) ivSizeMap.get(ODFConstants.ODF_ATTR_MIRROR_H))
      flipH = true;

    boolean flipV = false;
    if (ivSizeMap.containsKey(ODFConstants.ODF_ATTR_MIRROR_V) && (Boolean) ivSizeMap.get(ODFConstants.ODF_ATTR_MIRROR_V))
      flipV = true;

    if (flipV)
    {
      if (flipH)
        classes += FLIP_VH;
      else
        classes += FLIP_V;
    }
    else if (flipH)
    {
      classes += FLIP_H;
    }

    // Check if the value has negative height and/or width. If so, the
    // image needs to be flipped accordingly as well as the location updated.

    if (widthValue < 0.0 && !flipH)
    {
      classes += FLIP_H;
      String lOffset = (String) ivSizeMap.get(LEFT_OFFSET);
      if (lOffset == null || lOffset.length() == 0)
        lOffset = String.valueOf(-widthValue);
      else
        lOffset = String.valueOf(Double.parseDouble(lOffset) + widthValue);
      ivSizeMap.put(LEFT_OFFSET, lOffset);
    }
    if (heightValue < 0.0 && !flipV)
    {
      classes += FLIP_V;
      String tOffset = (String) ivSizeMap.get(TOP_OFFSET);
      if (tOffset == null || tOffset.length() == 0)
        tOffset = String.valueOf(-heightValue);
      else
        tOffset = String.valueOf(Double.parseDouble(tOffset) + heightValue);
      ivSizeMap.put(TOP_OFFSET, tOffset);
    }
    image.setAttribute(ODFConstants.HTML_ATTR_CLASS, classes);

  }

  /*
   * Adjust the Image HTML Structure for Flipped/Mirrored Shapes. The following CSS classes created in CSSConvertUtil are used: <UL>
   * <LI>flipH - Only if draw:mirror-horizontal is defined <LI>flipV - Only if draw:mirror-vertical is defined <LI>flipVH - Only if both
   * draw:mirror-horizontal and draw:mirror-vertical are defined </UL>
   * 
   * @param image HTML structure to adjust
   * 
   * @param height ODF Node for the height
   * 
   * @param width ODF Node for the width
   */
  private void adjustForMirroring(Element image, Node height, Node width)
  {
    double widthValue;
    if (null == width)
      widthValue = 0.0;
    else
      widthValue = Measure.extractNumber(width.getNodeValue());

    double heightValue;
    if (null == height)
      heightValue = 0.0;
    else
      heightValue = Measure.extractNumber(height.getNodeValue());

    adjustForMirroring(image, heightValue, widthValue);
  }

  /*
   * Adds the object to the context and the sizemap to allow it to be accessed at any stage of Shape asynchronous/synchronous processing
   * 
   * @param key Key
   * 
   * @param value Value
   */
  protected final void addToContextForAsyncProcessing(String key, Object value)
  {
    ivSizeMap.put(key, value);
    context.put(key, value);
  }

  /**
   * Search the drawing elements children for an svg:title and svg:desc. If found, save them off for use on the alt tag and/or aria label of
   * the image element.
   * 
   * @param root
   *          - the drawing element
   */
  private void setAccessibilityTags(Node root)
  {
    NodeList childNodes = root.getChildNodes();
    int nbrNodes = childNodes.getLength();
    for (int i = 0; i < nbrNodes; ++i)
    {
      Node child = childNodes.item(i);
      if (child instanceof SvgTitleElement)
      {
        ivAltTag = ((Element) child).getTextContent();
      }
      else if (child instanceof SvgDescElement)
      {
        ivDescTag = ((Element) child).getTextContent();
      }
    }
  }

  /**
   * Build an aria label containing the descriptive text for the image generated for the shape
   * 
   * @param parent
   *          - the image element to update with the aria-describeby id.
   * @return Element - ariaLabel element created (to be appended by the caller to the desired parent. null will be returned if there is no
   *         description to add.
   */
  private Element addAriaDescribeBy(Element parent)
  {
    if (ivDescTag == null)
      return null; // Nothing to add
    // Obtain a new ID
    String id = DOMIdGenerator.generate();
    // Create the aria label
    Element ariaLabel = htmlDocument.createElement(ODFConstants.HTML_ELEMENT_LABEL);
    // Add the attributes
    ariaLabel.setAttribute(ODFConstants.HTML_ATTR_ID, id);
    ariaLabel.setAttribute(ODFConstants.HTML_ATTR_STYLE, ODFConstants.HTML_VALUE_DISPLAY_NONE);
    Text t = htmlDocument.createTextNode(ivDescTag);
    ariaLabel.appendChild(t);
    parent.setAttribute(ODFConstants.HTML_ATTR_ARIA_DESCRIBEDBY, id);
    return ariaLabel;
  }

  /**
   * Creates the SVG Node and attributes/children) and performs any necessary fixup
   * 
   * @param svgElement
   *          - the source SVG Element
   * @return Element Created SVG Node
   */
  private Element createSvgNode(Element svgElement)
  {
    String nodeName = svgElement.getNodeName();
    Element newElement = htmlDocument.createElement(nodeName);

    NamedNodeMap svgAttributes = svgElement.getAttributes();
    int numAttributes = svgAttributes.getLength();
    for (int a = 0; a < numAttributes; a++)
    {
      Node svgAttr = svgAttributes.item(a);
      String attrName = svgAttr.getNodeName();
      String attrValue = svgAttr.getNodeValue();

      // Need to fix up File References
      if (attrName.equals(ODFConstants.XLINK_HREF))
      {
        int index = attrValue.indexOf(ODFConstants.FILE_PICTURE_PREFIX);
        if (index > 0)
        {
          attrValue = attrValue.substring(index);
        }
      }
      newElement.setAttribute(attrName, attrValue);
    }

    NodeList svgChildren = svgElement.getChildNodes();
    int numChildren = svgChildren.getLength();
    for (int c = 0; c < numChildren; c++)
    {
      Element svgChild = (Element) svgChildren.item(c);
      appendSvg(newElement, svgChild);
    }

    // For Chrome, we need to make sure the height/width are at 100%
    if (nodeName.equals(ODFConstants.SVG_ATTR_SVG))
    {
      newElement.setAttribute(ODFConstants.SVG_ATTR_WIDTH, "100%");
      newElement.setAttribute(ODFConstants.SVG_ATTR_HEIGHT, "100%");
    }

    return newElement;
  }

  /**
   * Appends the SVG Node (and attributes/children) to the HTML Element
   * 
   * @param htmlElement
   *          - the Html Document
   * @param svgElement
   *          - the SVG Element to append
   */
  private void appendSvg(Element htmlElement, Element svgElement)
  {
    Element newElement = createSvgNode(svgElement);
    htmlElement.appendChild(newElement);
  }

  /**
   * Sets the Concord ID attribute on the HTML Node with a prefix prepended
   * <p>
   * This method sets the Concord ID on the HTML Node with a automatically generated with the provided prefix prepended onto the ID.
   * <p>
   * 
   * @param node
   *          HTML Node to set the Concord ID on
   * @param prefix
   *          String to prefix on the automatically generated Concord ID
   * @return void
   * 
   */
  private static void setAutomaticHtmlConcordId(Element node, String prefix)
  {
    String id = DOMIdGenerator.generate();
    id = prefix + id;
    node.setAttribute(ODFConstants.CONCORD_ODF_ATTR_ID, id);
  }

  private static void updateSVGFillToNone(SVGDocumentWrapper svgDoc, Element element)
  {
    String fill = null;
    if(element.hasAttributeNS(SVGDOMImplementation.SVG_NAMESPACE_URI, ODFConstants.SVG_ATTR_FILL))
      fill = element.getAttributeNS(SVGDOMImplementation.SVG_NAMESPACE_URI, ODFConstants.SVG_ATTR_FILL);
    if (!svgDoc.isClosed())
    {
      if(fill == null)
        element.setAttributeNS(null, ODFConstants.SVG_ATTR_FILL, ODFConstants.HTML_VALUE_NONE);
      else if(("".equals(fill)) || fill.startsWith("url("))
      {
        element.removeAttributeNS(SVGDOMImplementation.SVG_NAMESPACE_URI, ODFConstants.SVG_ATTR_FILL);
        element.setAttributeNS(null, ODFConstants.SVG_ATTR_FILL, ODFConstants.HTML_VALUE_NONE);
      }
    }
  }
}
