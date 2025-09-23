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
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.draw.OdfDrawPath;
import org.odftoolkit.odfdom.doc.draw.OdfDrawPolygon;
import org.odftoolkit.odfdom.doc.draw.OdfDrawPolyline;
import org.odftoolkit.odfdom.doc.draw.OdfDrawRegularPolygon;
import org.odftoolkit.odfdom.dom.element.draw.DrawEnhancedGeometryElement;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.PerformanceAnalysis;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.presentation.exceptions.LimitExceededException;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.shape2image.ODFConversionPostProcessingData;
import com.ibm.symphony.conversion.service.common.shape2image.ODFDrawingParser;
import com.ibm.symphony.conversion.service.common.shape2image.ODFDrawingParserResults;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class ShapeElementConvertor extends GeneralContentHtmlConvertor
{
  private static final String CLASS = ShapeElementConvertor.class.getName();

  private static String CONVERTOR = "Presentation shape conversion";

  private static final Logger log = Logger.getLogger(CLASS);

  private static final String LEFT_DELTA = ODFDrawingParser.LEFT_DELTA;

  private static final String LEFT_OFFSET = ODFDrawingParser.LEFT_OFFSET;

  private static final String TOP_DELTA = ODFDrawingParser.TOP_DELTA;

  private static final String TOP_OFFSET = ODFDrawingParser.TOP_OFFSET;

  private static final String MSO_TEXTBOX = "mso-spt202";

  // private static final String RECTANGLE = "rectangle";

  @Override
  protected void doConvertHtml(ConversionContext context, Node element, Element htmlParent)
  {
  	OdfElement temp = (OdfElement) element;
  	String pre_class = temp.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS);
  	//reset list counter for each custom-shape
    TextListChildElementConvertor.initCounter();
    if(pre_class != null && pre_class.length() > 0){
    	context.put(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS, pre_class);
    }
    else
    	context.put(ODPConvertConstants.CONTEXT_PARENT_PRESENTATION_CLASS, "");
    if (viewboxIsInvisible(element))
      return;
    if (PresentationConfig.isAsyncGraphics())
      doConvertHtmlAsync(context, element, htmlParent);
    else
      doConvertHtmlSync(context, element, htmlParent);
  }

  /**
   * 
   * @param node
   *          shape element to be checked to see if it exists
   * @return true if viewbox = "0 0 0 0", false otherwise
   */
  private boolean viewboxIsInvisible(Node node)
  {
    if (node instanceof Element)
    {
      Element e = (Element) node;
      String viewbox = e.getAttribute(ODPConvertConstants.ODF_SVG_ATTR_SVGVIEWBOX);
      // check if size of viewbox is "0 0 0 0"
      if (viewbox.trim().equals("0 0 0 0"))
        return true;
    }
    return false;
  }

  /**
   * Convert the shape to an image synchronously
   * 
   * @param context
   *          - the current conversion context
   * @param element
   *          - the odf shape element
   * @param htmlParent
   *          - the html element to append the shape group to
   */
  protected void doConvertHtmlSync(ConversionContext context, Node element, Element htmlParent)
  {
    long start = System.currentTimeMillis();
    log.fine(CONVERTOR + " starts");

    // Pull key information from the Context
    Document doc = (Document) context.getTarget();
    double oldParentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
    context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, true);

    // Determine if we are inside Style processing
    boolean inStyleProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_IN_STYLE);

    // Determine if this is a Textbox converted to a Shape
    if (isConvertableToTextbox(context, element))
    {
      context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, false);
      convertMSOShapeToTextbox(context, element, htmlParent, doc, inStyleProcessing);
      context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
      return;
    }

    // Determine if we are inside Style processing
    String drawFrameClass = ODPConvertConstants.HTML_VALUE_G_DRAW_FRAME;
    if (inStyleProcessing)
    {
      drawFrameClass = ODPConvertConstants.HTML_VALUE_G_DRAW_FRAME + " " + ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE;
    }

    // Create the HTML Divs
    Element targetNode = null;

    // need add a new div to group text and SVG image together.
    Element htmlElement = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CONTEXTBOXTYPE, ODPConvertConstants.HTML_VALUE_DRAWING);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_GROUP);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_UNGROUPABLE, ODPConvertConstants.HTML_VALUE_YES);

    Element htmlElement2 = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement2.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_CONTENT_BOX_DATA_NODE);
    if (inStyleProcessing)
      htmlElement2.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV2_BG_STYLE);
    else
      htmlElement2.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV2_STYLE);

    Element htmlElement3 = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, drawFrameClass);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE, ODPConvertConstants.HTML_VALUE_PARAGRAPH);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_GRAPHIC);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV3_STYLE);

    htmlElement2.appendChild(htmlElement3);
    htmlElement.appendChild(htmlElement2);
    htmlParent.appendChild(htmlElement);

    ODFDrawingParserResults drawingParserResults = null;
    ODFDrawingParser drawingParser = null;
    JSONObject sizeMap = null;
    try
    {
      drawingParserResults = generateImage(context, element, htmlElement3, inStyleProcessing, false);
      drawingParser = drawingParserResults.getDrawingParser();
      sizeMap = drawingParser.getSizeMap();
    }
    catch (LimitExceededException lee)
    {
      throw lee;
    }
    catch (Exception e)
    {
      ConvertUtil.createPlaceHolder(context, htmlElement3, true);
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".doConvertHtmlSync");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);
      context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, false);
      context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
      return;
    }

    Element shapeGroupNode = htmlElement;

    // set width/height from this element in the context so when processing attributes we use
    // the correct width/height to calculate the percentages based on the containing object size
    Object oldParentWidth = context.get(ODPConvertConstants.CONTEXT_PARENT_WIDTH);

    Node parentWidthNode = element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_WIDTH);
    if (parentWidthNode != null)
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, parentWidthNode.getNodeValue());

    // need to flag this element as an element for which the inline style information must not
    // be set - since the style information does not apply to the draw-frame within a shape.
    Boolean oldv = (Boolean) context.get(ODPConvertConstants.CONTEXT_DISABLE_INLINE_STYLE_PROCESS);
    context.put(ODPConvertConstants.CONTEXT_DISABLE_INLINE_STYLE_PROCESS, new Boolean(true));
    htmlElement = parseAttributes2(element, htmlElement, context);
    context.put(ODPConvertConstants.CONTEXT_DISABLE_INLINE_STYLE_PROCESS, oldv);

    // Save the draw frame classes in case we need to copy them to a text box
    StringBuilder frameClassList = new StringBuilder(128).append(ODPConvertConstants.SYMBOL_WHITESPACE);
    String classAttr = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    String writingMode = null;
    if (classAttr != null)
    {
      writingMode = CSSConvertUtil.getGroupedInlineStyle(context, "vertical-writing", classAttr, true);
      String[] values = classAttr.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      // Skip the draw_custom-shape string
      for (int i = 1; i < values.length; i++)
      {
        frameClassList.append(values[i]);
        frameClassList.append(ODPConvertConstants.SYMBOL_WHITESPACE);
      }
    }

    String style = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    String[] styles = style.split(ODPConvertConstants.SYMBOL_SEMICOLON);
    StringBuilder styleValue = new StringBuilder(128);
    if (sizeMap.containsKey(ODPConvertConstants.ALIGNMENT_LEFT))
    {
      String left = (String) sizeMap.get(ODPConvertConstants.ALIGNMENT_LEFT);
      styleValue.append(ODPConvertConstants.ALIGNMENT_LEFT).append(ODPConvertConstants.SYMBOL_COLON)
          .append(MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_WIDTH, Double.parseDouble(left), context))
          .append(ODPConvertConstants.SYMBOL_SEMICOLON);
    }
    if (sizeMap.containsKey(ODPConvertConstants.CSS_ATTR_TOP))
    {
      String top = (String) sizeMap.get(ODPConvertConstants.CSS_ATTR_TOP);
      styleValue.append(ODPConvertConstants.CSS_ATTR_TOP).append(ODPConvertConstants.SYMBOL_COLON)
          .append(MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_HEIGHT, Double.parseDouble(top), context))
          .append(ODPConvertConstants.SYMBOL_SEMICOLON);
    }
    // Set a attribute in the html so we can process accordingly on export, which basically
    // means resetting the width or the height.
    if (sizeMap.containsKey(ODPConvertConstants.DRAW_CUSTOM_SHAPE_ELEMENT_HORIZONTAL))
    {
      shapeGroupNode.setAttribute(ODPConvertConstants.DRAW_CUSTOM_SHAPE_ELEMENT_LINE, ODPConvertConstants.ODF_ATTR_HORIZONTAL);
    }
    if (sizeMap.containsKey(ODPConvertConstants.DRAW_CUSTOM_SHAPE_ELEMENT_VERTICAL))
    {
      shapeGroupNode.setAttribute(ODPConvertConstants.DRAW_CUSTOM_SHAPE_ELEMENT_LINE, ODPConvertConstants.ODF_ATTR_VERTICAL);
    }

    for (int i = 0; i < styles.length && style.contains(ODPConvertConstants.SYMBOL_COLON); i++)
    {
      String key = styles[i].split(ODPConvertConstants.SYMBOL_COLON)[0];
      String value = styles[i].split(ODPConvertConstants.SYMBOL_COLON)[1];
      if ((key.equals(ODPConvertConstants.SVG_ATTR_WIDTH)) || (key.equals(ODPConvertConstants.SVG_ATTR_HEIGHT)))
      {
        String pValue = MeasurementUtil.convertCMToPercentage(key, Double.parseDouble((String) sizeMap.get(key))
            * ODPConvertConstants.CM_TO_INCH_CONV / 96, context);
        styleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(pValue).append(ODPConvertConstants.SYMBOL_SEMICOLON);
      }
      else if (key.equals(ODPConvertConstants.ALIGNMENT_LEFT))
      {
        Node width = element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_WIDTH);
        String pWidth = "";
        if (width == null)
        {
          String x1Value = MeasurementUtil.convertCMToPercentage(element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_X1),
              context);
          String x2Value = MeasurementUtil.convertCMToPercentage(element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_X2),
              context);
          pWidth = String.valueOf(MeasurementUtil.formatDecimal(Math.abs(Float.parseFloat(x2Value.substring(0, x2Value.length() - 1))
              - Float.parseFloat(x1Value.substring(0, x1Value.length() - 1)))))
              + "%";
        }
        else
        {
          pWidth = MeasurementUtil.convertCMToPercentage(width, context);
        }
        if (sizeMap.containsKey(LEFT_DELTA))
        {
          double delta = Double.parseDouble((String) sizeMap.get(LEFT_DELTA));

          String newLeft = String.valueOf(Double.parseDouble(value.substring(0, value.indexOf('%'))) - delta
              * Double.parseDouble(pWidth.substring(0, pWidth.indexOf('%')))) + '%';
          styleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(newLeft).append(ODPConvertConstants.SYMBOL_SEMICOLON);
        }
        else if (sizeMap.containsKey(LEFT_OFFSET))
        {
          double offset = Double.parseDouble((String) sizeMap.get(LEFT_OFFSET));
          String pOffset = MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_WIDTH, offset, context);
          String newLeft = String.valueOf(Double.parseDouble(value.substring(0, value.indexOf('%')))
              - Double.parseDouble(pOffset.substring(0, pOffset.indexOf('%')))) + '%';
          styleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(newLeft).append(ODPConvertConstants.SYMBOL_SEMICOLON);
        }
        else
          styleValue.append(styles[i]).append(ODPConvertConstants.SYMBOL_SEMICOLON);
      }
      else if (key.equals(ODPConvertConstants.CSS_ATTR_TOP))
      {

        Node height = element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_HEIGHT);
        String pHeight = "";
        if (height == null)
        {
          String y1Value = MeasurementUtil.convertCMToPercentage(element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_Y1),
              context);
          String y2Value = MeasurementUtil.convertCMToPercentage(element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_Y2),
              context);
          pHeight = String.valueOf(MeasurementUtil.formatDecimal(Math.abs(Float.parseFloat(y2Value.substring(0, y2Value.length() - 1))
              - Float.parseFloat(y1Value.substring(0, y1Value.length() - 1)))))
              + ODPConvertConstants.SYMBOL_PERCENT;
        }
        else
        {
          pHeight = MeasurementUtil.convertCMToPercentage(height, context);
        }
        if (sizeMap.containsKey(TOP_DELTA))
        {
          double delta = Double.parseDouble((String) sizeMap.get(TOP_DELTA));

          String newTop = String.valueOf(Double.parseDouble(value.substring(0, value.indexOf('%'))) - delta
              * Double.parseDouble(pHeight.substring(0, pHeight.indexOf('%')))) + '%';
          styleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(newTop).append(ODPConvertConstants.SYMBOL_SEMICOLON);
        }
        else if (sizeMap.containsKey(TOP_OFFSET))
        {
          double offset = Double.parseDouble((String) sizeMap.get(TOP_OFFSET));
          String pOffset = MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_HEIGHT, offset, context);
          String newTop = String.valueOf(Double.parseDouble(value.substring(0, value.indexOf('%')))
              - Double.parseDouble(pOffset.substring(0, pOffset.indexOf('%')))) + '%';
          styleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(newTop).append(ODPConvertConstants.SYMBOL_SEMICOLON);
        }
        else
          styleValue.append(styles[i]).append(ODPConvertConstants.SYMBOL_SEMICOLON);

      }
      else
        styleValue.append(styles[i]).append(ODPConvertConstants.SYMBOL_SEMICOLON);
    }

    // Adjust the x (left), y (top) coordinates if necessary
    styles = styleValue.toString().split(ODPConvertConstants.SYMBOL_SEMICOLON);
    StringBuilder adjustedStyleValue = new StringBuilder(128);
    for (int i = 0; i < styles.length && styleValue.toString().contains(ODPConvertConstants.SYMBOL_COLON); i++)
    {
      String key = styles[i].split(ODPConvertConstants.SYMBOL_COLON)[0];
      String value = styles[i].split(ODPConvertConstants.SYMBOL_COLON)[1];
      if (key.equals(ODPConvertConstants.CSS_ATTR_LEFT))
      {
        double xAdjustmentCM = drawingParser.getShapeWidthAdjustmentCM();
        double xAdjustmentPercentage = convertCMToPercentageNumber("width", xAdjustmentCM, context);
        double adjustedLeft = Measure.extractNumber(value) - xAdjustmentPercentage;
        adjustedStyleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(Double.toString(adjustedLeft) + "%")
            .append(ODPConvertConstants.SYMBOL_SEMICOLON);
      }
      else if (key.equals(ODPConvertConstants.CSS_ATTR_TOP))
      {
        double yAdjustmentCM = drawingParser.getShapeHeightAdjustmentCM();
        double yAdjustmentPercentage = convertCMToPercentageNumber("height", yAdjustmentCM, context);
        double adjustedTop = Measure.extractNumber(value) - yAdjustmentPercentage;
        adjustedStyleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(Double.toString(adjustedTop) + "%")
            .append(ODPConvertConstants.SYMBOL_SEMICOLON);
      }
      else
      {
        adjustedStyleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(value).append(ODPConvertConstants.SYMBOL_SEMICOLON);
      }
    }

    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, adjustedStyleValue.toString());

    String classAttribute = ODPConvertConstants.HTML_VALUE_DRAW_FRAME + ODPConvertConstants.SYMBOL_WHITESPACE
        + element.getNodeName().replace(ODPConvertConstants.SYMBOL_COLON, ODPConvertConstants.SYMBOL_UNDERBAR);

    // Shape -> Svg Support
    if (PresentationConfig.isSvgShapeFormat())
    {
      classAttribute = classAttribute + ODPConvertConstants.SYMBOL_WHITESPACE + ODPConvertConstants.HTML_VALUE_SVG_SHAPE
          + ODPConvertConstants.SYMBOL_WHITESPACE + ODPConvertConstants.HTML_VALUE_IMPORTED_SHAPE + ODPConvertConstants.SYMBOL_WHITESPACE;
      String drawType = getDrawType(context, element);
      htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_TYPE, drawType);
    }

    if (inStyleProcessing)
    {
      classAttribute = classAttribute + ODPConvertConstants.SYMBOL_WHITESPACE + ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE;
    }
    if(writingMode != null && writingMode.contains("tb-rl")) {
    	classAttribute = classAttribute + ODPConvertConstants.SYMBOL_WHITESPACE + "verticalWriting";
    }
    shapeGroupNode.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classAttribute);

    addCopyForPreserveAttribute(element, shapeGroupNode, sizeMap);

    // We always want to generate a textbox, even if there is currently no text. This will allow the user to add text if they desire.
    String div4Style = null;

    // Determine if the text area needs to be adjusted based on the Shape's draw:text-areas
    String textAreaContext = (String) getFromContextForAsyncProcessing(context, drawingParser, ODPConvertConstants.CONTEXT_SHAPE_TEXT_AREAS);
    if (textAreaContext != null)
    {
      div4Style = ODPConvertConstants.HTML_STYLE_ABS_POSITION;
      String[] textAreas = textAreaContext.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      div4Style = div4Style + ODPConvertConstants.CSS_ATTR_LEFT + ODPConvertConstants.SYMBOL_COLON + textAreas[0]
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON;
      div4Style = div4Style + ODPConvertConstants.CSS_ATTR_TOP + ODPConvertConstants.SYMBOL_COLON + textAreas[1]
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON;
      div4Style = div4Style + ODPConvertConstants.SVG_ATTR_WIDTH + ODPConvertConstants.SYMBOL_COLON + textAreas[2]
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON;
      div4Style = div4Style + ODPConvertConstants.SVG_ATTR_HEIGHT + ODPConvertConstants.SYMBOL_COLON + textAreas[3]
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON;

      context.remove(ODPConvertConstants.CONTEXT_SHAPE_TEXT_AREAS);
    }
    else
    {
      div4Style = ODPConvertConstants.HTML_VALUE_DIV4_STYLE;
    }

    // Get the Shape's class list and remove the "_graphic_text-properties" from any class to ensure we get the GRAPHIC set of properties
    String shapeClassList = frameClassList.toString();
    shapeClassList = shapeClassList.replace(ODPConvertConstants.CSS_GRAPHIC_TEXT_PROPERTIES_CLASS_SUFFIX, "");

    // Add any margins and padding for the shape to the frame
    // String marginAdjustment = CSSConvertUtil.getGroupedInlineStyle(context, ODPConvertConstants.HTML_ATTR_MARGIN, shapeClassList, false);
    String paddingAdjustment = "";
    if (!HtmlConvertUtil.isLineOrConnector(element)) // Padding does not apply to Lines/Connectors
    {
      paddingAdjustment = CSSConvertUtil.getGroupedInlineStyle(context, ODPConvertConstants.HTML_ATTR_PADDING, shapeClassList, true);
    }
    // div4Style = div4Style + marginAdjustment;

    String transformAngle = (String) context.get(ODPConvertConstants.CONTEXT_SHAPE_TRANSFORM_ANGLE);
    if (transformAngle != null)
    {
      div4Style += DrawTransformParser.generateTransform(transformAngle);
      context.remove(ODPConvertConstants.CONTEXT_SHAPE_TRANSFORM_ANGLE);
    }

    Element htmlElement4 = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, drawFrameClass);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE, ODPConvertConstants.HTML_VALUE_PARAGRAPH);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_OUTLINE);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, div4Style);

    // Create the HTML Divs
    targetNode = convertTextBoxInShape(element, htmlElement4, htmlElement, context, frameClassList.toString(), paddingAdjustment,
        inStyleProcessing);

    htmlElement2.appendChild(htmlElement4);

    // targetParentsize = concordElement.getParentFontSize();

    if (targetNode != null)
      convertChildren(context, element, targetNode);
    else
      checkForPreserveOnly(context, element, htmlElement);

    context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, false);
    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);

    if (oldParentWidth == null)
      context.remove(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
    else
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, oldParentWidth);

    context.remove(ODPConvertConstants.CONTEXT_OUTLINE_FONTSIZE_MAP);
    context.remove(ODPConvertConstants.CONTEXT_LIST_OUTLINE_STYLE_NAME);
    context.remove(ODPConvertConstants.CONTEXT_TEXTLIST_START_VALUE);

    long end = System.currentTimeMillis();
    if (drawingParser.isRecordTime())
    {
      PerformanceAnalysis.recordShapeConversionTime(context, (end - start));
    }
  }

  private void addCopyForPreserveAttribute(Node element, Element shapeGroupNode, JSONObject sizeMap)
  {
    StringBuilder preserveForCopyAttr = new StringBuilder(128).append(ODPConvertConstants.SYMBOL_WHITESPACE);
    String layer = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_DRAW_LAYER);
    if (layer != null)
      preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_DRAW_LAYER + ODPConvertConstants.SYMBOL_COLON + layer
          + ODPConvertConstants.SYMBOL_SEMICOLON);

    String styleName = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
    if (styleName != null)
      preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_DRAW_STYLE_NAME + ODPConvertConstants.SYMBOL_COLON + styleName
          + ODPConvertConstants.SYMBOL_SEMICOLON);

    String textStyleName = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME);
    if (textStyleName != null)
      preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_TEXT_STYLE_NAME + ODPConvertConstants.SYMBOL_COLON + textStyleName
          + ODPConvertConstants.SYMBOL_SEMICOLON);

    String drawTextStyleName = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_DRAW_TEXT_STYLE_NAME);
    if (drawTextStyleName != null)
      preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_DRAW_TEXT_STYLE_NAME + ODPConvertConstants.SYMBOL_COLON + drawTextStyleName
          + ODPConvertConstants.SYMBOL_SEMICOLON);

    String x1 = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_SVG_X1);
    if (x1 != null)
      preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_SVG_X1 + ODPConvertConstants.SYMBOL_COLON + x1
          + ODPConvertConstants.SYMBOL_SEMICOLON);

    String x2 = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_SVG_X2);
    if (x2 != null)
      preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_SVG_X2 + ODPConvertConstants.SYMBOL_COLON + x2
          + ODPConvertConstants.SYMBOL_SEMICOLON);

    String y1 = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_SVG_Y1);
    if (y1 != null)
      preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_SVG_Y1 + ODPConvertConstants.SYMBOL_COLON + y1
          + ODPConvertConstants.SYMBOL_SEMICOLON);

    String y2 = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_SVG_Y2);
    if (y2 != null)
      preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_SVG_Y2 + ODPConvertConstants.SYMBOL_COLON + y2
          + ODPConvertConstants.SYMBOL_SEMICOLON);

    String d = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_SVG_D);
    if (d != null)
      preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_SVG_D + ODPConvertConstants.SYMBOL_COLON + d
          + ODPConvertConstants.SYMBOL_SEMICOLON);

    String transform = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_DRAW_TRANSFORM);
    boolean addHeightWidth = false;
    if (transform != null)
    {
      addHeightWidth = true;
      preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_DRAW_TRANSFORM + ODPConvertConstants.SYMBOL_COLON + transform
          + ODPConvertConstants.SYMBOL_SEMICOLON);
    }

    String viewBox = (String) sizeMap.get(ODPConvertConstants.ODF_SVG_ATTR_SVGVIEWBOX);
    if (viewBox != null)
      preserveForCopyAttr.append(ODPConvertConstants.HTML_SVG_ATTR_SVGVIEWBOX + ODPConvertConstants.SYMBOL_COLON + viewBox
          + ODPConvertConstants.SYMBOL_SEMICOLON);

    String points = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_DRAW_POINTS);
    if (points != null)
      preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_DRAW_POINTS + ODPConvertConstants.SYMBOL_COLON + points
          + ODPConvertConstants.SYMBOL_SEMICOLON);

    // Only add height and width on special shapes... to reduce some of the html content bloat
    if (addHeightWidth || element instanceof OdfDrawPath || element instanceof OdfDrawPolygon || element instanceof OdfDrawRegularPolygon
        || element instanceof OdfDrawPolyline)
    {
      String height = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_SVG_HEIGHT);
      if (height != null)
        preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_SVG_HEIGHT + ODPConvertConstants.SYMBOL_COLON + height
            + ODPConvertConstants.SYMBOL_SEMICOLON);

      String width = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_SVG_WIDTH);
      if (height != null)
        preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_SVG_WIDTH + ODPConvertConstants.SYMBOL_COLON + width
            + ODPConvertConstants.SYMBOL_SEMICOLON);

      String x = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_SVG_X);
      if (x != null)
        preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_SVG_X + ODPConvertConstants.SYMBOL_COLON + x
            + ODPConvertConstants.SYMBOL_SEMICOLON);

      String y = (String) sizeMap.get(ODPConvertConstants.ODF_ATTR_SVG_Y);
      if (y != null)
        preserveForCopyAttr.append(ODPConvertConstants.HTML_ATTR_SVG_Y + ODPConvertConstants.SYMBOL_COLON + y
            + ODPConvertConstants.SYMBOL_SEMICOLON);
    }

    shapeGroupNode.setAttribute(ODPConvertConstants.HTML_ATTR_PRESERVE_FOR_COPY, preserveForCopyAttr.toString());
  }

  /**
   * Convert the shape to an image asynchronously
   * 
   * @param context
   *          - the current conversion context
   * @param element
   *          - the odf shape element
   * @param htmlParent
   *          - the html element to append the shape group to
   */
  protected void doConvertHtmlAsync(ConversionContext context, Node element, Element htmlParent)
  {
    long start = System.currentTimeMillis();
    log.fine(CONVERTOR + " starts pre-conversion");

    // Pull key information from the Context
    Document doc = (Document) context.getTarget();
    double oldParentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
    context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, true);

    // Determine if we are inside Style processing
    boolean inStyleProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_IN_STYLE);

    // Determine if this is a Textbox converted to a Shape
    if (isConvertableToTextbox(context, element))
    {
      context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, false);
      convertMSOShapeToTextbox(context, element, htmlParent, doc, inStyleProcessing);
      context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
      return;
    }

    // Determine if we are inside Style processing
    String drawFrameClass = ODPConvertConstants.HTML_VALUE_G_DRAW_FRAME;
    if (inStyleProcessing)
    {
      drawFrameClass = ODPConvertConstants.HTML_VALUE_G_DRAW_FRAME + " " + ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE;
    }

    // need add a new div to group text and SVG image together.
    Element htmlElement = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CONTEXTBOXTYPE, ODPConvertConstants.HTML_VALUE_DRAWING);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_GROUP);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_UNGROUPABLE, ODPConvertConstants.HTML_VALUE_YES);

    Element htmlElement2 = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement2.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_CONTENT_BOX_DATA_NODE);
    if (inStyleProcessing)
      htmlElement2.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV2_BG_STYLE);
    else
      htmlElement2.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV2_STYLE);

    Element htmlElement3 = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, drawFrameClass);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE, ODPConvertConstants.HTML_VALUE_PARAGRAPH);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_GRAPHIC);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV3_STYLE);

    htmlElement2.appendChild(htmlElement3);
    htmlElement.appendChild(htmlElement2);
    htmlParent.appendChild(htmlElement);

    // Set width/height from this element in the context so when processing attributes we use
    // the correct width/height to calculate the percentages based on the containing object size
    Object oldParentWidth = context.get(ODPConvertConstants.CONTEXT_PARENT_WIDTH);

    Node parentWidthNode = element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_WIDTH);
    if (parentWidthNode != null)
    {
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, parentWidthNode.getNodeValue());
    }
    else
    {
      // This should only happen for lines/connectors - Make sure we default this value
      String pageSize = (String) context.get(ODPConvertConstants.CONTEXT_PAGE_WIDTH) + "cm";
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, pageSize);
    }

    // need to flag this element as an element for which the inline style information must not
    // be set - since the style information does not apply to the draw-frame within a shape.
    Boolean oldv = (Boolean) context.get(ODPConvertConstants.CONTEXT_DISABLE_INLINE_STYLE_PROCESS);
    context.put(ODPConvertConstants.CONTEXT_DISABLE_INLINE_STYLE_PROCESS, new Boolean(true));
    htmlElement = parseAttributes2(element, htmlElement, context);
    context.put(ODPConvertConstants.CONTEXT_DISABLE_INLINE_STYLE_PROCESS, oldv);

    // Save the draw frame classes to copy them to a text box
    StringBuilder frameClassList = new StringBuilder(128).append(ODPConvertConstants.SYMBOL_WHITESPACE);
    String classAttr = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    String writingMode = null;
    if (classAttr != null)
    {
      writingMode = CSSConvertUtil.getGroupedInlineStyle(context, "vertical-writing", classAttr, true);
      String[] values = classAttr.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      // Skip the draw_custom-shape string
      for (int i = 1; i < values.length; i++)
      {
        frameClassList.append(values[i]);
        frameClassList.append(ODPConvertConstants.SYMBOL_WHITESPACE);
      }
    }

    ODFDrawingParserResults drawingParserResults = null;
    ODFDrawingParser drawingParser = null;
    try
    {
      drawingParserResults = generateImage(context, element, htmlElement3, inStyleProcessing, true);
      drawingParser = drawingParserResults.getDrawingParser();
    }
    catch (LimitExceededException lee)
    {
      throw lee;
    }
    catch (Exception e)
    {
      ConvertUtil.createPlaceHolder(context, htmlElement3, true);
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".doConvertHtmlAsync");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);
      context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, false);
      context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
      return;
    }

    // Set the initial CLASS values
    Element shapeGroupNode = htmlElement;

    String classAttribute = ODPConvertConstants.HTML_VALUE_DRAW_FRAME + ODPConvertConstants.SYMBOL_WHITESPACE
        + element.getNodeName().replace(ODPConvertConstants.SYMBOL_COLON, ODPConvertConstants.SYMBOL_UNDERBAR);

    if (PresentationConfig.isSvgShapeFormat() && (drawingParserResults.generateShapeAsSvg()))
    {
      classAttribute = classAttribute + ODPConvertConstants.SYMBOL_WHITESPACE + ODPConvertConstants.HTML_VALUE_SVG_SHAPE
          + ODPConvertConstants.SYMBOL_WHITESPACE + ODPConvertConstants.HTML_VALUE_IMPORTED_SHAPE + ODPConvertConstants.SYMBOL_WHITESPACE;
      String drawType = getDrawType(context, element);
      htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_TYPE, drawType);
    }

    if (inStyleProcessing)
    {
      classAttribute = classAttribute + ODPConvertConstants.SYMBOL_WHITESPACE + ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE;
    }
    if(writingMode != null && writingMode.contains("tb-rl")) {
    	classAttribute = classAttribute + ODPConvertConstants.SYMBOL_WHITESPACE + "verticalWriting";
    }
    shapeGroupNode.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classAttribute);

    // We always want to generate a textbox, even if there is currently no text. This will allow the user to add text if they desire.
    String div4Style = null;

    // Determine if the text area needs to be adjusted based on the Shape's draw:text-areas
    String textAreaContext = (String) getFromContextForAsyncProcessing(context, drawingParser, ODPConvertConstants.CONTEXT_SHAPE_TEXT_AREAS);
    if (textAreaContext != null)
    {
      div4Style = ODPConvertConstants.HTML_STYLE_ABS_POSITION;
      String[] textAreas = textAreaContext.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      div4Style = div4Style + ODPConvertConstants.CSS_ATTR_LEFT + ODPConvertConstants.SYMBOL_COLON + textAreas[0]
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON;
      div4Style = div4Style + ODPConvertConstants.CSS_ATTR_TOP + ODPConvertConstants.SYMBOL_COLON + textAreas[1]
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON;
      div4Style = div4Style + ODPConvertConstants.SVG_ATTR_WIDTH + ODPConvertConstants.SYMBOL_COLON + textAreas[2]
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON;
      div4Style = div4Style + ODPConvertConstants.SVG_ATTR_HEIGHT + ODPConvertConstants.SYMBOL_COLON + textAreas[3]
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON;

      context.remove(ODPConvertConstants.CONTEXT_SHAPE_TEXT_AREAS);
    }
    else
    {
      div4Style = ODPConvertConstants.HTML_VALUE_DIV4_STYLE;
    }

    // Get the Shape's class list and remove the "_graphic_text-properties" from any class to ensure we get the GRAPHIC set of properties
    String shapeClassList = frameClassList.toString();
    shapeClassList = shapeClassList.replace(ODPConvertConstants.CSS_GRAPHIC_TEXT_PROPERTIES_CLASS_SUFFIX, "");

    // Add any margins and padding for the shape to the frame
    // String marginAdjustment = CSSConvertUtil.getGroupedInlineStyle(context, ODPConvertConstants.HTML_ATTR_MARGIN, shapeClassList, false);
    String paddingAdjustment = "";
    if (!HtmlConvertUtil.isLineOrConnector(element)) // Padding does not apply to Lines/Connectors
    {
      paddingAdjustment = CSSConvertUtil.getGroupedInlineStyle(context, ODPConvertConstants.HTML_ATTR_PADDING, shapeClassList, true);
    }
    // div4Style = div4Style + marginAdjustment;

    String transformAngle = (String) context.get(ODPConvertConstants.CONTEXT_SHAPE_TRANSFORM_ANGLE);
    if (transformAngle != null)
    {
      String textRotationAngle = (String) context.get(ODPConvertConstants.CONTEXT_TEXT_ROTATION_ANGLE);
      if (textRotationAngle != null)
      {
        long nTextRotationAngle = Long.parseLong(textRotationAngle);
        long nTransformAngle = Long.parseLong(transformAngle);
        transformAngle = Long.toString(nTransformAngle + nTextRotationAngle);
      }
      div4Style += DrawTransformParser.generateTransform(transformAngle);
      context.remove(ODPConvertConstants.CONTEXT_SHAPE_TRANSFORM_ANGLE);
    }

    Element htmlElement4 = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, drawFrameClass);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE, ODPConvertConstants.HTML_VALUE_PARAGRAPH);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_OUTLINE);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, div4Style);

    htmlElement2.appendChild(htmlElement4);

    // If a drawingParser was returned from generateImage, then a cached drawingParser was found and we
    // can perform post processing now.
    if (drawingParser != null)
    {
      // Perform the post image conversion processing to update the appropriate elements
      doPostConvertHtml(context, htmlElement, htmlElement4, drawingParser.getSizeMap(), element);
    }

    // Create the HTML Divs
    Element targetNode = convertTextBoxInShape(element, htmlElement4, htmlElement, context, frameClassList.toString(), paddingAdjustment,
        inStyleProcessing);

    if (targetNode != null)
      convertChildren(context, element, targetNode);
    else
      checkForPreserveOnly(context, element, htmlElement);

    // Restore our context
    context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, false);
    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);

    if (oldParentWidth == null)
      context.remove(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
    else
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, oldParentWidth);

    context.remove(ODPConvertConstants.CONTEXT_OUTLINE_FONTSIZE_MAP);
    context.remove(ODPConvertConstants.CONTEXT_LIST_OUTLINE_STYLE_NAME);
    context.remove(ODPConvertConstants.CONTEXT_TEXTLIST_START_VALUE);

    long end = System.currentTimeMillis();
    if (PresentationConfig.isDebugGraphics())
    {
      log.info("Shape Pre-Async Conversion Time: " + (end - start));
    }
  }

  /**
   * Perform post shape conversion processing. This version of the method should be used from the main thread after the asynchronous
   * conversion of the shape to image has completed.
   * 
   * @param context
   *          - the current conversion context
   * @param conversionResult
   *          - the results returned from the asynchronous shape conversion.
   */
  public void doPostConvertHtml(ConversionContext context, ODFConversionPostProcessingData conversionResult)
  {
    long start = System.currentTimeMillis();
    log.fine(CONVERTOR + " starts post-conversion");

    // Extract the results and update the appropriate elements

    // Add the image result to the appropriate parent
    Element htmlElement3 = conversionResult.getParent();

    Element image = conversionResult.getHtmlElement(); // Image div
    if (image != null)
    {
      htmlElement3.appendChild(image);
    }
    else
    {
      // Append a placeholder
      ConvertUtil.createPlaceHolder(context, htmlElement3, true);
      return;
    }

    // Add the aria label for the description (if there is one):
    // Note: It isn't allowed as a child of the image so we will add it as a sibling
    Element ariaLabel = conversionResult.getAriaElement();
    if (ariaLabel != null)
      htmlElement3.appendChild(ariaLabel);

    // Get the parent/sibling nodes needed for post processing updates
    Element htmlElement2 = (Element) htmlElement3.getParentNode(); // Content box data node div
    if (htmlElement2 == null)
    {
      // Append a placeholder
      ConvertUtil.createPlaceHolder(context, htmlElement3, true);
      return;
    }
    Element htmlElement = (Element) htmlElement2.getParentNode(); // Shape group div
    if (htmlElement == null)
    {
      // Append a placeholder
      ConvertUtil.createPlaceHolder(context, htmlElement3, true);
      return;
    }
    Element htmlElement4 = (Element) htmlElement2.getLastChild(); // Text Box div

    // Get the sizeMap needed for post processing updates
    JSONObject sizeMap = conversionResult.getSizeMap();

    // Get the root element used to generate the image from
    Node element = conversionResult.getRoot();

    // Set width/height from this element in the context so when processing attributes we use
    // the correct width/height to calculate the percentages based on the containing object size
    Object oldParentWidth = context.get(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
    double oldParentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);

    Node parentWidthNode = element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_WIDTH);
    if (parentWidthNode != null)
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, parentWidthNode.getNodeValue());

    // Perform the post image conversion processing to update the appropriate elements
    doPostConvertHtml(context, htmlElement, htmlElement4, sizeMap, element);

    // Restore our context
    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);

    if (oldParentWidth == null)
      context.remove(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
    else
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, oldParentWidth);

    long end = System.currentTimeMillis();
    if (PresentationConfig.isDebugGraphics())
    {
      log.info("Shape Async Conversion Time: " + ((end - start) + conversionResult.getConversionTime()) + "ms");
    }
    PerformanceAnalysis.recordShapeConversionTime(context, (end - start) + conversionResult.getConversionTime());
  }

  /**
   * Perform post shape conversion processing. This version of the method should be used from the main thread after the asynchronous
   * conversion of the shape to image has completed.
   * 
   * @param context
   *          - the current conversion context
   * @param htmlElement
   *          - the html shape group div
   * @param htmlElement4
   *          - the html text box div
   * @param sizeMap
   *          - contains the modifiers to the html determined during conversion of the shape to an image
   * @param element
   *          - the odf shape element
   */
  public void doPostConvertHtml(ConversionContext context, Element htmlElement, Element htmlElement4, JSONObject sizeMap, Node element)
  {
    try
    {
      Element shapeGroupNode = htmlElement; // Shape group div

      // Update the style based on the returned sizeMap
      String style = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
      String[] styles = style.split(ODPConvertConstants.SYMBOL_SEMICOLON);
      StringBuilder styleValue = new StringBuilder(128);
      if (sizeMap.containsKey(ODPConvertConstants.ALIGNMENT_LEFT))
      {
        String left = (String) sizeMap.get(ODPConvertConstants.ALIGNMENT_LEFT);
        styleValue.append(ODPConvertConstants.ALIGNMENT_LEFT).append(ODPConvertConstants.SYMBOL_COLON)
            .append(MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_WIDTH, Double.parseDouble(left), context))
            .append(ODPConvertConstants.SYMBOL_SEMICOLON);
      }
      if (sizeMap.containsKey(ODPConvertConstants.CSS_ATTR_TOP))
      {
        String top = (String) sizeMap.get(ODPConvertConstants.CSS_ATTR_TOP);
        styleValue.append(ODPConvertConstants.CSS_ATTR_TOP).append(ODPConvertConstants.SYMBOL_COLON)
            .append(MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_HEIGHT, Double.parseDouble(top), context))
            .append(ODPConvertConstants.SYMBOL_SEMICOLON);
      }
      // Set a attribute in the html so we can process accordingly on export, which basically
      // means resetting the width or the height.
      if (sizeMap.containsKey(ODPConvertConstants.DRAW_CUSTOM_SHAPE_ELEMENT_HORIZONTAL))
      {
        shapeGroupNode.setAttribute(ODPConvertConstants.DRAW_CUSTOM_SHAPE_ELEMENT_LINE, ODPConvertConstants.ODF_ATTR_HORIZONTAL);
      }
      if (sizeMap.containsKey(ODPConvertConstants.DRAW_CUSTOM_SHAPE_ELEMENT_VERTICAL))
      {
        shapeGroupNode.setAttribute(ODPConvertConstants.DRAW_CUSTOM_SHAPE_ELEMENT_LINE, ODPConvertConstants.ODF_ATTR_VERTICAL);
      }

      addCopyForPreserveAttribute(element, shapeGroupNode, sizeMap);

      for (int i = 0; i < styles.length && style.contains(ODPConvertConstants.SYMBOL_COLON); i++)
      {
        String key = styles[i].split(ODPConvertConstants.SYMBOL_COLON)[0];
        String value = styles[i].split(ODPConvertConstants.SYMBOL_COLON)[1];
        if ((key.equals(ODPConvertConstants.SVG_ATTR_WIDTH)) || (key.equals(ODPConvertConstants.SVG_ATTR_HEIGHT)))
        {
          String sizeMapValue = (String) sizeMap.get(key);
          if (sizeMapValue != null)
          {
            String pValue = MeasurementUtil.convertCMToPercentage(key, Double.parseDouble(sizeMapValue)
                * ODPConvertConstants.CM_TO_INCH_CONV / 96, context);
            styleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(pValue).append(ODPConvertConstants.SYMBOL_SEMICOLON);
          }
          else
          {
            String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_NO_SHAPE_VALUE_FOUND, key);
            ODPCommonUtil.logContext(context);
            ODPCommonUtil.logMessage(Level.WARNING, message);
          }
        }
        else if (key.equals(ODPConvertConstants.ALIGNMENT_LEFT))
        {
          Node width = element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_WIDTH);
          String pWidth = "";
          if (width == null)
          {
            String x1Value = MeasurementUtil.convertCMToPercentage(element.getAttributes()
                .getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_X1), context);
            String x2Value = MeasurementUtil.convertCMToPercentage(element.getAttributes()
                .getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_X2), context);
            pWidth = String.valueOf(MeasurementUtil.formatDecimal(Math.abs(Float.parseFloat(x2Value.substring(0, x2Value.length() - 1))
                - Float.parseFloat(x1Value.substring(0, x1Value.length() - 1)))))
                + "%";
          }
          else
          {
            pWidth = MeasurementUtil.convertCMToPercentage(width, context);
          }
          if (sizeMap.containsKey(LEFT_DELTA))
          {
            double delta = Double.parseDouble((String) sizeMap.get(LEFT_DELTA));

            String newLeft = String.valueOf(Double.parseDouble(value.substring(0, value.indexOf('%'))) - delta
                * Double.parseDouble(pWidth.substring(0, pWidth.indexOf('%')))) + '%';
            styleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(newLeft).append(ODPConvertConstants.SYMBOL_SEMICOLON);
          }
          else if (sizeMap.containsKey(LEFT_OFFSET))
          {
            double offset = Double.parseDouble((String) sizeMap.get(LEFT_OFFSET));
            String pOffset = MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_WIDTH, offset, context);
            String newLeft = String.valueOf(Double.parseDouble(value.substring(0, value.indexOf('%')))
                - Double.parseDouble(pOffset.substring(0, pOffset.indexOf('%')))) + '%';
            styleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(newLeft).append(ODPConvertConstants.SYMBOL_SEMICOLON);
          }
          else
            styleValue.append(styles[i]).append(ODPConvertConstants.SYMBOL_SEMICOLON);
        }
        else if (key.equals(ODPConvertConstants.CSS_ATTR_TOP))
        {

          Node height = element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_HEIGHT);
          String pHeight = "";
          if (height == null)
          {
            String y1Value = MeasurementUtil.convertCMToPercentage(element.getAttributes()
                .getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_Y1), context);
            String y2Value = MeasurementUtil.convertCMToPercentage(element.getAttributes()
                .getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_Y2), context);
            pHeight = String.valueOf(MeasurementUtil.formatDecimal(Math.abs(Float.parseFloat(y2Value.substring(0, y2Value.length() - 1))
                - Float.parseFloat(y1Value.substring(0, y1Value.length() - 1)))))
                + ODPConvertConstants.SYMBOL_PERCENT;
          }
          else
          {
            pHeight = MeasurementUtil.convertCMToPercentage(height, context);
          }
          if (sizeMap.containsKey(TOP_DELTA))
          {
            double delta = Double.parseDouble((String) sizeMap.get(TOP_DELTA));

            String newTop = String.valueOf(Double.parseDouble(value.substring(0, value.indexOf('%'))) - delta
                * Double.parseDouble(pHeight.substring(0, pHeight.indexOf('%')))) + '%';
            styleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(newTop).append(ODPConvertConstants.SYMBOL_SEMICOLON);
          }
          else if (sizeMap.containsKey(TOP_OFFSET))
          {
            double offset = Double.parseDouble((String) sizeMap.get(TOP_OFFSET));
            String pOffset = MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_HEIGHT, offset, context);
            String newTop = String.valueOf(Double.parseDouble(value.substring(0, value.indexOf('%')))
                - Double.parseDouble(pOffset.substring(0, pOffset.indexOf('%')))) + '%';
            styleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(newTop).append(ODPConvertConstants.SYMBOL_SEMICOLON);
          }
          else
            styleValue.append(styles[i]).append(ODPConvertConstants.SYMBOL_SEMICOLON);

        }
        else
          styleValue.append(styles[i]).append(ODPConvertConstants.SYMBOL_SEMICOLON);
      }

      try{
        // Adjust the x (left), y (top) coordinates if necessary
        styles = styleValue.toString().split(ODPConvertConstants.SYMBOL_SEMICOLON);
        StringBuilder adjustedStyleValue = new StringBuilder(128);
        for (int i = 0; i < styles.length && styleValue.toString().contains(ODPConvertConstants.SYMBOL_COLON); i++)
        {
          String key = styles[i].split(ODPConvertConstants.SYMBOL_COLON)[0];
          String value = styles[i].split(ODPConvertConstants.SYMBOL_COLON)[1];
          if (key.equals(ODPConvertConstants.CSS_ATTR_LEFT))
          {
            double xAdjustmentCM = (Double) sizeMap.get(ODFConstants.SVG_WIDTH_ADJUSTMENT);
            double xAdjustmentPercentage = convertCMToPercentageNumber("width", xAdjustmentCM, context);
            double adjustedLeft = Measure.extractNumber(value) - xAdjustmentPercentage;
            adjustedStyleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(Double.toString(adjustedLeft) + "%")
            .append(ODPConvertConstants.SYMBOL_SEMICOLON);
          }
          else if (key.equals(ODPConvertConstants.CSS_ATTR_TOP))
          {
            double yAdjustmentCM = (Double) sizeMap.get(ODFConstants.SVG_HEIGHT_ADJUSTMENT);
            double yAdjustmentPercentage = convertCMToPercentageNumber("height", yAdjustmentCM, context);
            double adjustedTop = Measure.extractNumber(value) - yAdjustmentPercentage;
            adjustedStyleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(Double.toString(adjustedTop) + "%")
            .append(ODPConvertConstants.SYMBOL_SEMICOLON);
          }
          else
          {
            adjustedStyleValue.append(key).append(ODPConvertConstants.SYMBOL_COLON).append(value)
            .append(ODPConvertConstants.SYMBOL_SEMICOLON);
          }
        }
        
        htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, adjustedStyleValue.toString());
        //Adjust rectangle text box position and width/height here for defect 25297.
        if(isClosedRectangle(element))
        {
          adjustRectangleTextBox(context, htmlElement4, adjustedStyleValue.toString());
        }
      }catch (Exception e){
        log.warning("ShapeElementConvertor doPostConvertHtml error while adjust SVG L/T");
      }
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".doPostConvertHtml");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);
    }
  }

  /**
   * Generate the image from the shape.
   * 
   * @param context
   *          - the current conversion context.
   * @param element
   *          - the ODF shape element
   * @param htmlElement3
   *          - the html element to which the image should be appended
   * @param inStyleProcessing
   *          - true if processing a shape in the master styles
   * @param async
   *          - true if the shape conversion should be done asynchronously
   * @return ODFDrawingParserResults - (1) getODFDrawingParser will be null if image generation was submitted asynchronously and non-null if
   *         a cached image was found or if asynchronous processing was not requested (2) getGenerateShapeAsImage will be true if an image
   *         was generated (3) getGenerateShapeAsSvg will be true if SVG was generated
   */
  @SuppressWarnings("unchecked")
  private ODFDrawingParserResults generateImage(ConversionContext context, Node element, Node htmlElement3, boolean inStyleProcessing,
      boolean async)
  {
    ODFDrawingParser drawingParser = null;

    // Check DrawingParser cache first before creating a new one and avoid reparsing if it is cached
    if (inStyleProcessing)
    {
      Map<String, ODFDrawingParser> cachedShapeMap = (Map<String, ODFDrawingParser>) context
          .get(ODPConvertConstants.CONTEXT_CACHED_SHAPE_MAP);
      if (cachedShapeMap == null)
      {
        cachedShapeMap = new HashMap<String, ODFDrawingParser>();
        context.put(ODPConvertConstants.CONTEXT_CACHED_SHAPE_MAP, cachedShapeMap);
      }

      String key = element.toString();
      key = removeAttributeFromString(key, ODPConvertConstants.ODF_ATTR_SVG_X);
      key = removeAttributeFromString(key, ODPConvertConstants.ODF_ATTR_SVG_Y);
      key = removeAllAttributeFromString(key, " id=");

      drawingParser = cachedShapeMap.get(key);
      if (drawingParser != null)
      {
        drawingParser.recordTime(false);
        drawingParser.recreateImageElement(htmlElement3, async); // Need to create a new HTML node for this instance
        return (ODFDrawingParserResults.createODFDrawingParserResults(drawingParser));
      }
      drawingParser = new ODFDrawingParser(context);
      cachedShapeMap.put(key, drawingParser);
    }
    else
    {
      drawingParser = new ODFDrawingParser(context);
    }

    // Check Graphic Limit - This will throw a LimitExceededException if the limit is exceeded. The ODP2HTMLConvertor will handle it.
    PresentationConfig.incrementGraphicCount(context);

    // Initialize the Drawing Parser
    drawingParser.setBaseURI((String) context.get(ODPConvertConstants.CONTEXT_TARGET_BASE));
    drawingParser.useODPRules(true);

    // Shape -> Svg Support - No SVG for now unless it is content
    if (!inStyleProcessing)
    {
      drawingParser.setGenerateShapeAsSvg(PresentationConfig.isSvgShapeFormat());
      drawingParser.setGenerateShapeAsImage(PresentationConfig.isImageShapeFormat());
    }

    if (PresentationConfig.isEncodeGraphics())
    {
      drawingParser.setB64EncodingThreshold(PresentationConfig.getGraphicEncodeThreshold());
    }

    ODPConvertConstants.DOCUMENT_TYPE documentType = (ODPConvertConstants.DOCUMENT_TYPE) context
        .get(ODPConvertConstants.CONTEXT_DOCUMENT_TYPE);
    if (documentType != null)
    {
      drawingParser.setContextDocumentType(documentType.toString());
    }
    drawingParser.setDebugMode(PresentationConfig.isDebugGraphics());

    // Cached DrawingParser was not found (or not a caching scenario), so we need to initialize the new one and generate the image
    if (async)
    {
      boolean asyncNotNeeded = drawingParser.submitParse(element, htmlElement3, true);
      if (asyncNotNeeded)
      {
        return (ODFDrawingParserResults.createODFDrawingParserResults(drawingParser));
      }
      // return null for the drawingParser to indicate to the caller that conversion was submitted asynchronously
      // and that the results cannot be processed currently.
      return (ODFDrawingParserResults.createODFDrawingParserResults(null, drawingParser.generateShapeAsImage(),
          drawingParser.generateShapeAsSvg()));
    }
    else
    {
      drawingParser.parse(element, htmlElement3);
      return (ODFDrawingParserResults.createODFDrawingParserResults(drawingParser));
    }
  }

  private String removeAttributeFromString(String key, String attribute)
  {
    int position = key.indexOf(attribute);
    if (position >= 0)
    {
      String part1 = key.substring(0, position);
      String part2 = key.substring(position + attribute.length() + 2);
      int positionEnd = part2.indexOf(ODPConvertConstants.SYMBOL_QUOTE);
      String part3 = part2.substring(positionEnd + 1);
      key = part1 + part3;
    }
    return key;
  }

  private String removeAllAttributeFromString(String key, String attribute)
  {
    int position = key.indexOf(attribute);
    while (position >= 0)
    {
      String part1 = key.substring(0, position);
      String part2 = key.substring(position + attribute.length() + 2);
      int positionEnd = part2.indexOf(ODPConvertConstants.SYMBOL_QUOTE);
      String part3 = part2.substring(positionEnd + 1);
      key = part1 + part3;
      // Check to see if there is another instance of the attribute in the key (and remove it)
      position = key.indexOf(attribute);
    }
    return key;
  }

  private void checkForPreserveOnly(ConversionContext context, Node element, Element htmlElement)
  {
    NodeList childrenNodes = element.getChildNodes();
    for (int i = 0; i < childrenNodes.getLength(); i++)
    {
      Node childElement = childrenNodes.item(i);
      // need convert children.
      IConvertor convertor = HtmlContentConvertorFactory.getInstance().getConvertor(childElement);
      if (convertor instanceof PreserveOnlyConvertor)
      {
        convertor.convert(context, childElement, htmlElement);
      }
    }
  }

  protected Element convertTextBoxInShape(Node element, Element shapeGroupNode, Element htmlParent, ConversionContext context,
      String frameClassList, String paddingAdjustment, boolean inStyleProcessing)
  {
    Document doc = (Document) context.getTarget();

    StringBuilder txtNodeStyle = new StringBuilder(128);

    boolean lineOrConnector = false;
    // handle for connectors
    if (HtmlConvertUtil.isLineOrConnector(element))
    {
      lineOrConnector = true;
      String posInfo = shapeGroupNode.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
      Attr attr = doc.createAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      String value = ODPConvertConstants.HTML_CLASS_DRAW_SHAPE_CLASSES;
      ODPCommonUtil.setAttributeNode(shapeGroupNode, attr, value);
      // remove the temporary posInfo.
      txtNodeStyle.append(posInfo);
    }
    else
    {
      // No longer calculate position, allow position to be relative to the container
      if (inStyleProcessing)
        txtNodeStyle.append(ODPConvertConstants.HTML_VALUE_DIV5_BG_STYLE);
      else
        txtNodeStyle.append(ODPConvertConstants.HTML_VALUE_DIV5_STYLE);
    }

    // Handle wrap-option:nowrap (impacts non-line Shapes and Images only)
    String wrapOption = CSSConvertUtil.getAttributeValue(context, HtmlCSSConstants.WORD_WRAP, frameClassList);
    if (((wrapOption != null) && (wrapOption.equals(ODPConvertConstants.CSS_VALUE_NORMAL))) || (HtmlConvertUtil.isLineOrConnector(element)))
    {
      txtNodeStyle.append(HtmlCSSConstants.WHITE_SPACE + ODPConvertConstants.SYMBOL_COLON + ODPConvertConstants.CSS_VALUE_NOWRAP
          + ODPConvertConstants.SYMBOL_SEMICOLON);
    }

    // need to parse the current Node again to extract texts into a separate div.
    // we still need add a text-box div element for the texts of shape.
    // create a sub div for the node.
    Element txtBoxNode = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV, ODPConvertConstants.TEXTBOX_PREFIX);

    // currently the txtBoxNode haven't associated with shape.

    // need a new layer between shapeGroupNode and textBox Node.
    // create a new div. The structure is:
    // <div(shapeGroup)><div(textGroup, for position
    // info)><div(textBox)></div></div><div(image)></div></div>
    txtBoxNode.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_DRAW_TEXT_BOX);
    txtBoxNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, txtNodeStyle.toString());
    txtBoxNode.setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_TEXTBOX);
    txtBoxNode.setAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL, ODFConstants.ARIA_ROLE_TEXTBOX);
    Element targetNode = (Element) shapeGroupNode.appendChild(txtBoxNode);

    // create two div for vertical-align
    Element tableDiv = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);

    tableDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_TABLE_DIV_STYLE);
    targetNode = (Element) targetNode.appendChild(tableDiv);
    Element cellDiv = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);

    Attr attr = doc.createAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    String value = ODPConvertConstants.HTML_CLASS_DRAW_SHAPE_CLASSES + frameClassList;

    // parseClassAttribute(htmlParent, frameClassList, null, context));
    // add the special settings for IE: margin-top:0;
    // margin-bottom:0.

    // Build the table cell div
    StringBuilder cellDivNodeStyle = new StringBuilder(128);
    if (paddingAdjustment.length() == 0)
    {
      String cellDivStyle = ODPConvertConstants.HTML_VALUE_CELL_DIV_STYLE;
      // If a line or connector, we don't want any padding. Add inline padding:0 to override any other classes
      if (lineOrConnector)
        cellDivStyle += "padding:0%;";
      cellDivNodeStyle.append(cellDivStyle);
    }
    else
    {
      // Need to subtract the padding off of the width/height
      double[] values = new double[CSSConvertUtil.ALL_DIMENSIONS];
      String[] padStyles = paddingAdjustment.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      for (int i = 0; i < CSSConvertUtil.ALL_DIMENSIONS; i++)
      {
        String padStyleWithoutPercent = padStyles[i].substring(0, padStyles[i].length() - 1);
        values[i] = Double.parseDouble(padStyleWithoutPercent);
      }

      double horizontalPadding = values[1] + values[3];
      double verticalPadding = values[0] + values[2];

      // Make sure the padding percentage does not exceed the shape
      if ((horizontalPadding >= 100) || (verticalPadding >= 100))
      {
        cellDivNodeStyle.append(ODPConvertConstants.HTML_VALUE_CELL_DIV_STYLE);
        if (log.isLoggable(Level.FINE))
        {
          log.fine("Padding (" + paddingAdjustment + ") exceeds the shape's dimensions.  Ignoring the padding.");
        }
      }
      else
      {
        cellDivNodeStyle.append(ODPConvertConstants.HTML_VALUE_CELL_DIV_STYLE_BASE);
        cellDivNodeStyle.append(ODPConvertConstants.HTML_ATTR_PADDING + ODPConvertConstants.SYMBOL_COLON + paddingAdjustment
            + ODPConvertConstants.SYMBOL_SEMICOLON);

        double width = 100 - horizontalPadding;
        double height = 100 - verticalPadding;
        cellDivNodeStyle.append(ODPConvertConstants.SVG_ATTR_WIDTH + ODPConvertConstants.SYMBOL_COLON + Double.toString(width)
            + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON);
        cellDivNodeStyle.append(ODPConvertConstants.SVG_ATTR_HEIGHT + ODPConvertConstants.SYMBOL_COLON + Double.toString(height)
            + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON);
      }

    }

    // Add border and background color overrides for Shapes in the master style
    if (inStyleProcessing)
    {
      // Override borders and fill that may exist in the css
      cellDivNodeStyle.append(ODPConvertConstants.HTML_VALUE_CELL_DIV_STYLE_OVERRIDES);
    }

    cellDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, cellDivNodeStyle.toString());
    ODPCommonUtil.setAttributeNode(cellDiv, attr, value);

    targetNode = (Element) targetNode.appendChild(cellDiv);

    return targetNode;
  }

  @SuppressWarnings("restriction")
  protected final String getDrawType(ConversionContext context, Node element)
  {
    NodeList list = element.getChildNodes();
    int listLength = list.getLength();
    for (int i = 0; i < listLength; i++)
    {
      Node child = list.item(i);
      // Check for draw:enhanced-geometry for the draw:type
      if (child instanceof DrawEnhancedGeometryElement)
      {
        DrawEnhancedGeometryElement deg = (DrawEnhancedGeometryElement) child;
        return deg.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_TYPE);
      }
    }
    return "";
  }

  @SuppressWarnings("restriction")
  protected final boolean isConvertableToTextbox(ConversionContext context, Node element)
  {
    // Exclude Rotated Shapes from being converted back to a Textbox
    String transform = ((OdfElement) element).getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_TRANSFORM);
    if ((transform != null) && (transform.length() > 0))
    {
      return false;
    }

    String drawType = getDrawType(context, element);
    if (drawType.equals(MSO_TEXTBOX))
    {
      return true;
    }
    return false;
  }

  protected final void convertMSOShapeToTextbox(ConversionContext context, Node element, Element htmlParent, Document doc,
      boolean inStyleProcessing)
  {
    // set width/height from this element in the context so when processing attributes we use
    // the correct width/height to calculate the percentages based on the containing object size
    Object oldParentWidth = context.get(ODPConvertConstants.CONTEXT_PARENT_WIDTH);

    Node parentWidthNode = element.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_SVG_WIDTH);
    if (parentWidthNode != null)
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, parentWidthNode.getNodeValue());

    Element htmlElement4 = createHtmlElementWithoutIndexing(context, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE, ODPConvertConstants.HTML_VALUE_PARAGRAPH);

    Boolean oldv = (Boolean) context.get(ODPConvertConstants.CONTEXT_DISABLE_INLINE_STYLE_PROCESS);
    context.put(ODPConvertConstants.CONTEXT_DISABLE_INLINE_STYLE_PROCESS, new Boolean(true));
    htmlElement4 = parseAttributes2(element, htmlElement4, context);
    context.put(ODPConvertConstants.CONTEXT_DISABLE_INLINE_STYLE_PROCESS, oldv);

    // Save the draw frame classes in case we need to copy them to a text box.
    // Get the Shape's class list and remove the "*_graphic_text-properties" to ensure we get the GRAPHIC set of properties.
    StringBuilder frameClassListBuffer = new StringBuilder(128).append(ODPConvertConstants.SYMBOL_WHITESPACE);
    StringBuilder shapeClassListBuffer = new StringBuilder(128).append(ODPConvertConstants.SYMBOL_WHITESPACE);
    
    String classAttr = htmlElement4.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (classAttr != null)
    {
      String[] values = classAttr.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      // Skip the draw_custom-shape string
      for (int v = 1; v < values.length; v++)
      {
        frameClassListBuffer.append(values[v]);
        frameClassListBuffer.append(ODPConvertConstants.SYMBOL_WHITESPACE);
        if (!values[v].contains(ODPConvertConstants.CSS_GRAPHIC_TEXT_PROPERTIES_CLASS_SUFFIX))
        {
          shapeClassListBuffer.append(values[v]);
          shapeClassListBuffer.append(ODPConvertConstants.SYMBOL_WHITESPACE);
        }
      }
    }
    String frameClassList = frameClassListBuffer.toString();
    String shapeClassList = shapeClassListBuffer.toString();

    // Add any margins and padding for the shape to the frame
    String div4Style = htmlElement4.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);

    // String marginAdjustment = CSSConvertUtil.getGroupedInlineStyle(context, ODPConvertConstants.HTML_ATTR_MARGIN, shapeClassList, false);
    String paddingAdjustment = CSSConvertUtil.getGroupedInlineStyle(context, ODPConvertConstants.HTML_ATTR_PADDING, shapeClassList, true);
    // div4Style = div4Style + marginAdjustment;
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, div4Style);

    String drawFrameClass = ODPConvertConstants.HTML_VALUE_DRAW_FRAME;

    if (inStyleProcessing)
    {
      drawFrameClass = drawFrameClass + " " + ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE;
    }
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, drawFrameClass);

    // No longer calculate position, allow position to be relative to the container
    StringBuilder txtNodeStyle = new StringBuilder(128);
    txtNodeStyle.append(ODPConvertConstants.HTML_VALUE_FULL_SIZE);

    // Handle wrap-option:nowrap (impacts Shapes and Images only)
    String wrapOption = CSSConvertUtil.getAttributeValue(context, HtmlCSSConstants.WORD_WRAP, frameClassList.toString());
    if ((wrapOption != null) && (wrapOption.equals(ODPConvertConstants.CSS_VALUE_NORMAL)))
    {
      txtNodeStyle.append(HtmlCSSConstants.WHITE_SPACE + ODPConvertConstants.SYMBOL_COLON + ODPConvertConstants.CSS_VALUE_NOWRAP
          + ODPConvertConstants.SYMBOL_SEMICOLON);
    }

    // need to parse the current Node again to extract text into a separate div.
    // we still need add a text-box div element for the text
    // create a sub div for the node.
    Element txtBoxNode = createHtmlElementWithoutIndexing(context, doc, ODPConvertConstants.HTML_ELEMENT_DIV,
        ODPConvertConstants.TEXTBOX_PREFIX);

    txtBoxNode.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_DRAW_TEXT_BOX);
    txtBoxNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, txtNodeStyle.toString());
    txtBoxNode.setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_TEXTBOX);
    txtBoxNode.setAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL, ODFConstants.ARIA_ROLE_TEXTBOX);
    Element targetNode = (Element) htmlElement4.appendChild(txtBoxNode);

    // create two div for vertical-align
    Element tableDiv = createHtmlElementWithoutIndexing(context, doc, ODPConvertConstants.HTML_ELEMENT_DIV);

    tableDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_TABLE_DIV_STYLE);
    targetNode = (Element) targetNode.appendChild(tableDiv);
    Element cellDiv = createHtmlElementWithoutIndexing(context, doc, ODPConvertConstants.HTML_ELEMENT_DIV);

    Attr attr = doc.createAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    String value = ODPConvertConstants.HTML_VALUE_DRAW_FRAME_CLASSES + frameClassList;

    // Build the table cell div
    StringBuilder cellDivNodeStyle = new StringBuilder(128);
    if (paddingAdjustment.length() == 0)
    {
      cellDivNodeStyle.append(ODPConvertConstants.HTML_VALUE_CELL_DIV_STYLE);
    }
    else
    {
      cellDivNodeStyle.append(ODPConvertConstants.HTML_VALUE_CELL_DIV_STYLE_BASE);
      cellDivNodeStyle.append(ODPConvertConstants.HTML_ATTR_PADDING + ODPConvertConstants.SYMBOL_COLON + paddingAdjustment
          + ODPConvertConstants.SYMBOL_SEMICOLON);

      // Need to subtract the padding off of the width/height
      double[] values = new double[CSSConvertUtil.ALL_DIMENSIONS];
      String[] padStyles = paddingAdjustment.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      for (int j = 0; j < CSSConvertUtil.ALL_DIMENSIONS; j++)
      {
        String padStyleWithoutPercent = padStyles[j].substring(0, padStyles[j].length() - 1);
        values[j] = Double.parseDouble(padStyleWithoutPercent);
      }

      double width = 100 - values[1] - values[3];
      double height = 100 - values[0] - values[2];
      cellDivNodeStyle.append(ODPConvertConstants.SVG_ATTR_WIDTH + ODPConvertConstants.SYMBOL_COLON + Double.toString(width)
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON);
      cellDivNodeStyle.append(ODPConvertConstants.SVG_ATTR_HEIGHT + ODPConvertConstants.SYMBOL_COLON + Double.toString(height)
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON);

    }

    // Make this call to make sure in-line styles are set and auto colors are processed.
    processClassProperties(context, frameClassList.toString(), cellDiv, cellDivNodeStyle);

    String styleStr = cellDivNodeStyle.toString();
    String writingMode = CSSConvertUtil.getGroupedInlineStyle(context, "vertical-writing", shapeClassList, true);
    if(writingMode != null && writingMode.contains("tb-rl")) {
      if (htmlElement4 != null){
        String clsStr = htmlElement4.getAttribute("class").trim();
        clsStr += " verticalWriting";
        htmlElement4.setAttribute("class", clsStr);
      }
      styleStr = styleStr.replaceAll("vertical-writing:tb-rl;", "");
    }
    cellDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, styleStr);
    ODPCommonUtil.setAttributeNode(cellDiv, attr, value);

    targetNode = (Element) targetNode.appendChild(cellDiv);

    htmlParent.appendChild(htmlElement4);

    if (targetNode != null)
    {
      NodeList childrenNodes = element.getChildNodes();
      for (int i = 0; i < childrenNodes.getLength(); i++)
      {
        Node childElement = childrenNodes.item(i);
        IConvertor convertor = HtmlContentConvertorFactory.getInstance().getConvertor(childElement);
        if (!(convertor instanceof PreserveOnlyConvertor))
        {
          convertor.convert(context, childElement, targetNode);
        }
      }
    }

    // Mark the Shape ODF Element for deletion on export
    markElementForDeletion(context, element);

    if (oldParentWidth == null)
      context.remove(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
    else
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, oldParentWidth);
  }

  private static double convertCMToPercentageNumber(String indexFlag, double cmValue, ConversionContext context)
  {
    double resultValue = 0;
    double index = 28; // Default Page Width ??
    if (indexFlag.equals(ODFConstants.SVG_ATTR_WIDTH))
    {
      Measure pageWidth = MeasurementUtil.getWidth(context, indexFlag);
      index = pageWidth.getNumber(); // page-width
    }
    else if (indexFlag.equals(ODFConstants.SVG_ATTR_HEIGHT))
    {
      Measure pageHeight = MeasurementUtil.getHeight(context, indexFlag);
      index = pageHeight.getNumber(); // page-height
    }
    try
    {
      resultValue = (cmValue * 100) / index;
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".convertCMToPercentageNumber");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);
    }
    return resultValue;
  }

  /*
   * Retrieves the object from the context or the sizemap to allow it to be accessed at any stage of Shape asynchronous/synchronous
   * processing. If the parser is null, the value is in the context. If the parser is not null, it is in the parser's sizemap.
   * 
   * @param key Key
   * 
   * @return Object Value
   */
  private final Object getFromContextForAsyncProcessing(ConversionContext context, ODFDrawingParser parser, String key)
  {
    if (parser == null)
    {
      return context.get(key);
    }
    else
    {
      return parser.getSizeMap().get(key);
    }
  }
  
  /**
   * Determines if Shape is a Closed Shape Rectangle type
   * <p>
   * 
   * @param type
   *          Shape type
   * @return boolean true if the Shape is a Closed Shape type
   * 
   */
  private boolean isClosedRectangle(Node root)
  {
      Node drawEnhancedGeometryNode = getDrawEnhancedGeometryNode(root);
      if (drawEnhancedGeometryNode != null)
      {
        Element e = (Element) drawEnhancedGeometryNode;
        String type = e.getAttribute(ODFConstants.DRAW_TYPE);
        if (type != null && type.length() > 0)
          if (type.equals("rectangle") || type.equals("round-rectangle"))
            return true;
      }
    return false;
  }

  private Node getDrawEnhancedGeometryNode(Node root)
  {
    NodeList children = root.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if ((child instanceof Element) && child.getNodeName().equalsIgnoreCase(ODFConstants.DRAW_ENHANCED_GEOMETRY))
        return child;
    }
    return null;
  }
  
  private void adjustRectangleTextBox(ConversionContext context, Element htmlElement4, String style)
  {
    Map<String,String> styleMap = ConvertUtil.buildCSSMap(style);
    String txtBoxStyle = htmlElement4.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    if(txtBoxStyle!= null && txtBoxStyle.toLowerCase().contains(ODPConvertConstants.SVG_ATTR_TRANSFORM + ": " + ODPConvertConstants.CSS_ATTR_ROTATE))
    {
      Map<String,String> txtBoxStyleMap = ConvertUtil.buildCSSMap(txtBoxStyle);

      String transform = txtBoxStyleMap.get(ODPConvertConstants.SVG_ATTR_TRANSFORM);
      if(transform != null && transform.startsWith(ODPConvertConstants.CSS_ATTR_ROTATE + "(") && transform.indexOf("deg")>0) 
      {
        double rotateAngle = Math.abs(Double.parseDouble(transform.substring(7,transform.indexOf("deg"))));
        if((rotateAngle > 70 && rotateAngle<110)||(rotateAngle > 250 && rotateAngle<290))
        {
          double width = Measure.extractNumber(styleMap.get(ODPConvertConstants.SVG_ATTR_WIDTH));
          double height = Measure.extractNumber(styleMap.get(ODPConvertConstants.SVG_ATTR_HEIGHT));

          double pageWidth = MeasurementUtil.getWidth(context, ODFConstants.SVG_ATTR_WIDTH).getNumber();
          double pageHeight = MeasurementUtil.getHeight(context, ODFConstants.SVG_ATTR_HEIGHT).getNumber();

          double newSvgWidth = height / 100 * pageHeight;
          double newSvgHeight = width / 100 * pageWidth;

          double boxWidth = newSvgWidth/newSvgHeight;
          double boxHeight = newSvgHeight/newSvgWidth;
          double boxTop = 0.50 - (boxHeight/2);
          double boxLeft = 0.50 - (boxWidth/2);

          txtBoxStyleMap.put(ODPConvertConstants.CSS_ATTR_TOP,(boxTop * 100) + "%");
          txtBoxStyleMap.put(ODPConvertConstants.CSS_ATTR_LEFT,(boxLeft * 100) + "%");
          txtBoxStyleMap.put(ODPConvertConstants.SVG_ATTR_WIDTH,(boxWidth * 100) + "%");
          txtBoxStyleMap.put(ODPConvertConstants.SVG_ATTR_HEIGHT,(boxHeight * 100) + "%");

          txtBoxStyle = ConvertUtil.convertMapToStyle(txtBoxStyleMap);
          htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, txtBoxStyle);          
        }
      }
    }
  }
}
