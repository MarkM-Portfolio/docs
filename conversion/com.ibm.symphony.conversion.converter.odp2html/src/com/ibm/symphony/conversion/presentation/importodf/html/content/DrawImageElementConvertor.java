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

import java.awt.Dimension;
import java.io.File;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPClipConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPClipInfo;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;
import com.ibm.symphony.conversion.presentation.PerformanceAnalysis;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.IFormatConverter;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.shape2image.ODFImageCropper;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;
import com.ibm.symphony.conversion.service.impl.ConversionService;

@SuppressWarnings("restriction")
public class DrawImageElementConvertor extends GeneralContentHtmlConvertor
{
  private static final String CLASS = DrawImageElementConvertor.class.getName();

  private static String CONVERTOR = "Presentation image conversion";

  private static final Logger log = Logger.getLogger(CLASS);

  private final static String CREATE_PLACEHOLDER = "createPlaceholder";

  private final static String TABLE_PREVIEW = "TablePreview";

  private final static String OBJECT_REPLACEMENT = "object";

  private final static String PRESERVATION_SUFFIX = "-IBMDocs" + ODPConvertConstants.FILE_SUFFIX_PNG;

  private final static int MINIMUM_DOTS_PER_INCH = 72; // Default points per inch when we cannot derive it from image

  private final static double DOTS_PER_INCH = 96.0; // Default points per inch when we cannot derive it from image

  private final static double DOTS_PER_CM = DOTS_PER_INCH / ODPConvertConstants.CM_TO_INCH_CONV;

  // Default Initial Capacity for the Parameters HashMap which has 3 elements
  private static final int PARMS_MAP_CAPACITY = (int) (3 * 1.33) + 1;

  // Default Initial Capacity for the No CVT HashSet
  private static final int NO_CVT_SET_CAPACITY = (int) (5 * 1.33) + 1;

  public static Set<String> noCvtFormats = new HashSet<String>(NO_CVT_SET_CAPACITY);

  // Default Initial Capacity for the FormatMimeType HashSet
  private static final int FORMAT_MIME_TYPE_CAPACITY = (int) (3 * 1.33) + 1;

  public static Set<String> formatsCvt = new HashSet<String>(FORMAT_MIME_TYPE_CAPACITY);

  static Map<String, String> formatMimeTypeMap = new HashMap<String, String>(FORMAT_MIME_TYPE_CAPACITY);
  static
  {
    formatMimeTypeMap.put(ODPConvertConstants.FILE_EMF, ODPConvertConstants.MIME_TYPE_WMF);
    formatMimeTypeMap.put(ODPConvertConstants.FILE_WMF, ODPConvertConstants.MIME_TYPE_WMF);
    formatMimeTypeMap.put(ODPConvertConstants.FILE_SVM, ODPConvertConstants.MIME_TYPE_SVM);

    formatsCvt.addAll(formatMimeTypeMap.keySet());
    noCvtFormats.add(ODPConvertConstants.FILE_JPG);
    noCvtFormats.add(ODPConvertConstants.FILE_JPEG);
    noCvtFormats.add(ODPConvertConstants.FILE_BMP);
    noCvtFormats.add(ODPConvertConstants.FILE_PNG);
    noCvtFormats.add(ODPConvertConstants.FILE_GIF);
  }

  static final int NO_CONVERT = 0;

  static final int CONVERT = 1;

  static final int CONVERT_OBJECT = 2;

  static final int UNKNOWN = 3;

  // Image Cropper
  private static final ODFImageCropper cvImageCropper = new ODFImageCropper();
  static
  {
    cvImageCropper.setDebugMode(PresentationConfig.isDebugGraphics());
  }

  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    Boolean insideChartProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_INSIDE_CHART);

    // If this image is a replacement image for a Chart, do not convert it
    if ((insideChartProcessing == null) || (!insideChartProcessing))
    {
      long start = System.currentTimeMillis();
      log.fine(CONVERTOR + " starts");

      // If this is a table preview image, skip for now
      if (isTablePreviewImage(odfElement, htmlParent, context))
      {
        return;
      }

      double oldParentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);

      handleImageConvert(odfElement, htmlParent, context);

      context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);

      long end = System.currentTimeMillis();
      log.fine(CONVERTOR + " ends in " + (end - start) + " ms");
    }
  }

  protected void handleImageConvert(Node node, Node htmlParentNode, ConversionContext context)
  {
    OdfElement odfElement = (OdfElement) node;
    OdfElement drawFrame = getDrawFrame(odfElement);

    // NOTE: The drawframe is used below in the CONVERT section. If we don't have a drawFrame, the image
    // has already been converted. Most likely this is the case of a presentation that has been exported and is
    // being reimported, and the image is for a shape (in which case we do not need the image).
    if (drawFrame == null)
    {
      return;
    }

    Document doc = (Document) context.getTarget();
    String imageSrc = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_XLINK_HREF);

    String drawFrameClass = ODPConvertConstants.HTML_VALUE_G_DRAW_FRAME;
    boolean inStyleProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_IN_STYLE);
    if (inStyleProcessing)
    {
      drawFrameClass = ODPConvertConstants.HTML_VALUE_G_DRAW_FRAME + " " + ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE;
    }

    Element targetNode = null;

    if (imageSrc.length() == 0) // Empty HREF
    {
      log.fine("Image with an empty HREF was detected");

      if (ODPConvertUtil.containsTextBox(node))
      {
        Element objectGroup = (Element) htmlParentNode;
        Element htmlElement4 = createHtmlElement(context, node, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
        htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, drawFrameClass);
        htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
        htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE, ODPConvertConstants.HTML_VALUE_PARAGRAPH);
        htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_OUTLINE);
        htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV4_STYLE);

        targetNode = convertTextBoxInImage(node, htmlElement4, objectGroup, context, inStyleProcessing);

        objectGroup.appendChild(htmlElement4);
      }

      if (targetNode != null)
      {
        convertChildren(context, node, targetNode);
      }

      return;
    }

    // need add a new div to group text and SVG image together.
    Element objectGroup = (Element) htmlParentNode;
    objectGroup.setAttribute(ODPConvertConstants.HTML_ATTR_CONTEXTBOXTYPE, ODPConvertConstants.HTML_VALUE_DRAWING);
    objectGroup.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_GROUP);
    objectGroup.setAttribute(ODPConvertConstants.HTML_ATTR_UNGROUPABLE, ODPConvertConstants.HTML_VALUE_YES);

    Element drawImageAnchor = createHtmlElement(context, node, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    drawImageAnchor.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_CONTENT_BOX_DATA_NODE);
    if (inStyleProcessing)
      drawImageAnchor.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV2_BG_STYLE);
    else
      drawImageAnchor.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV2_STYLE);

    Element imgDivNode = createHtmlElement(context, node, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    imgDivNode.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, drawFrameClass);
    imgDivNode.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
    imgDivNode.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE, ODPConvertConstants.HTML_VALUE_PARAGRAPH);
    imgDivNode.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_GRAPHIC);
    imgDivNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV3_STYLE);

    Element imgNode = createHtmlElement(context, node, doc, ODPConvertConstants.HTML_ELEMENT_IMG);

    imgDivNode.appendChild(imgNode);
    drawImageAnchor.appendChild(imgDivNode);
    objectGroup.appendChild(drawImageAnchor);
    imgNode.setAttribute(ODPConvertConstants.HTML_ATTR_ALT, ODPConvertConstants.ODF_ATTR_IMAGE);
    imgNode = parseAttributes2(node, imgNode, context);
    parseBackgroundColor(context, drawFrame, imgNode);
    boolean validImageExists = convertImageToSupportedFormat(context, node, drawFrame, imgNode);

    String objGroupClasses = ODPConvertConstants.HTML_VALUE_DRAW_FRAME + ODPConvertConstants.SYMBOL_WHITESPACE
        + ODPConvertConstants.HTML_VALUE_IMPORTED_IMAGE + ODPConvertConstants.SYMBOL_WHITESPACE
        + node.getNodeName().replace(ODPConvertConstants.SYMBOL_COLON, ODPConvertConstants.SYMBOL_UNDERBAR);

    if (inStyleProcessing)
    {
      objGroupClasses = objGroupClasses + ODPConvertConstants.SYMBOL_WHITESPACE + ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE;
    }

    objectGroup.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, objGroupClasses);

    // See if the image is flipped and update the image HTML element
    String flip = getImageFlipInfo(context, drawFrame);
    String imgClasses = imgNode.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (flip.contains(ODPConvertConstants.ODF_ATTR_HORIZONTAL))
    {
      if (flip.contains(ODPConvertConstants.ODF_ATTR_VERTICAL))
        imgClasses = imgClasses + ODPConvertConstants.SYMBOL_WHITESPACE + ODPConvertConstants.CSS_STYLE_FLIPVH;
      else
        imgClasses = imgClasses + ODPConvertConstants.SYMBOL_WHITESPACE + ODPConvertConstants.CSS_STYLE_FLIPH;
    }
    else if (flip.contains(ODPConvertConstants.ODF_ATTR_VERTICAL))
    {
      imgClasses = imgClasses + ODPConvertConstants.SYMBOL_WHITESPACE + ODPConvertConstants.CSS_STYLE_FLIPV;
    }

    imgNode.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, imgClasses);

    boolean clippedAndContainsText = false;
    if (ODPConvertUtil.containsTextBox(node))
    {
      Element htmlElement4 = createHtmlElement(context, node, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
      htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, drawFrameClass);
      htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
      htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE, ODPConvertConstants.HTML_VALUE_PARAGRAPH);
      htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_OUTLINE);
      htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV4_STYLE);

      targetNode = convertTextBoxInImage(node, htmlElement4, objectGroup, context, inStyleProcessing);

      if (ODPClipConvertUtil.isImageClipped(context, drawFrame))
        clippedAndContainsText = true;

      drawImageAnchor.appendChild(htmlElement4);
    }

    if (targetNode != null)
    {
      convertChildren(context, node, targetNode);
    }
    if (validImageExists && clippedAndContainsText)
      handleClippedTextInImage((Element) imgNode, (Element) targetNode);
  }

  private void handleClippedTextInImage(Element element, Element targetNode)
  {
    // Get the g_draw_frame element
    Element gDrawFrame = getGDrawFrame(targetNode);
    Element drawFrame = getDrawFrame(element);

    HashMap<String, String> clipInfo = ODPClipConvertUtil.getClipInfo(drawFrame);

    HashMap<String, String> gDrawFrameStyle = ODPClipConvertUtil.getInLineStyleMap(gDrawFrame);

    // Save off the current style information into the clipInfoAttr on the dDrawFrame element;
    String originalStyleInfo = ODPClipConvertUtil.getStyleString(gDrawFrameStyle);
    gDrawFrame.setAttribute(ODPConvertConstants.CLIP_INFO_ATTRIBUTE, originalStyleInfo);

    // Calculate the new style information
    // Width
    double originalW = Measure.extractNumber(clipInfo.get(ODPConvertConstants.CLIP_ORIGINAL_DF_WIDTH_PERCENT));
    double calculatedW = Measure.extractNumber(clipInfo.get(ODPConvertConstants.CLIP_CALCULATED_DF_WIDTH_PERCENT));
    double gDrawFrameW = ODPClipConvertUtil.roundIt1000th(originalW / calculatedW * 100);
    gDrawFrameStyle.put(ODPConvertConstants.SVG_ATTR_WIDTH, Double.toString(gDrawFrameW) + ODPConvertConstants.SYMBOL_PERCENT);

    // Height
    double originalH = Measure.extractNumber(clipInfo.get(ODPConvertConstants.CLIP_ORIGINAL_DF_HEIGHT_PERCENT));
    double calculatedH = Measure.extractNumber(clipInfo.get(ODPConvertConstants.CLIP_CALCULATED_DF_HEIGHT_PERCENT));
    double gDrawFrameH = ODPClipConvertUtil.roundIt1000th(originalH / calculatedH * 100);
    gDrawFrameStyle.put(ODPConvertConstants.SVG_ATTR_HEIGHT, Double.toString(gDrawFrameH) + ODPConvertConstants.SYMBOL_PERCENT);

    // Left
    double gDrawFrameX = ODPClipConvertUtil.roundIt1000th((((calculatedW - originalW) / 2) / calculatedW) * 100);
    gDrawFrameStyle.put(ODPConvertConstants.ALIGNMENT_LEFT, Double.toString(gDrawFrameX) + ODPConvertConstants.SYMBOL_PERCENT);

    // Top
    double gDrawFrameY = ODPClipConvertUtil.roundIt1000th((((calculatedH - originalH) / 2) / calculatedH) * 100);
    gDrawFrameStyle.put(ODPConvertConstants.ALIGNMENT_TOP, Double.toString(gDrawFrameY) + ODPConvertConstants.SYMBOL_PERCENT);
    String newStyleInfo = ODPClipConvertUtil.getStyleString(gDrawFrameStyle);
    gDrawFrame.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, newStyleInfo);
  }

  @SuppressWarnings({ "rawtypes", "unchecked" })
  protected Element convertTextBoxInImage(Node element, Element imageNode, Element htmlParent, ConversionContext context,
      boolean inStyleProcessing)
  {
    OdfDocument odfDoc = (OdfDocument) context.getSource();
    Document doc = (Document) context.getTarget();

    // need to parse the current Node again to extract texts into a separate div.
    // we still need add a text-box div element for the text in the image.
    // create a sub div for the node.
    Element txtBoxNode = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV, ODPConvertConstants.TEXTBOX_PREFIX);

    // NOTE: We need to force the parent draw:frame's class styles to be processed (this doesn't happen in
    // AbstractContentHtmlConvertor.parseAttributes for
    // draw:frame except when the immediate child is a draw:text-box)
    StringBuilder stylebuf = new StringBuilder(128);
    String drawImageClassList = ODPConvertUtil.getClasses(getClassElements(element, odfDoc, context));
    List parentClasses = getClassElements(element.getParentNode(), odfDoc, context);
    String drawFrameClassList = ODPConvertUtil.getClasses(parentClasses);
    parseClassAttribute(parentClasses, stylebuf, null, context);

    String txtNodeStyle = ODPConvertConstants.HTML_VALUE_DEFAULT_IMAGEBOX;

    // Handle wrap-option:nowrap (impacts Shapes and Images only)
    String wrapOption = CSSConvertUtil.getAttributeValue(context, HtmlCSSConstants.WORD_WRAP, drawFrameClassList);
    if ((wrapOption != null) && (wrapOption.equals(ODPConvertConstants.CSS_VALUE_NORMAL)))
    {
      txtNodeStyle += HtmlCSSConstants.WHITE_SPACE + ODPConvertConstants.SYMBOL_COLON + ODPConvertConstants.CSS_VALUE_NOWRAP + ";";
    }

    // currently the txtBoxNode haven't associated with shape.

    // need a new layer between imageNode and textBox Node.
    txtBoxNode.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_DRAW_TEXT_BOX);
    txtBoxNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, txtNodeStyle);
    txtBoxNode.setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_TEXTBOX);
    txtBoxNode.setAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL, ODFConstants.ARIA_ROLE_TEXTBOX);
    Element targetNode = (Element) imageNode.appendChild(txtBoxNode);

    // create two div for vertical-align
    Element tableDiv = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);

    tableDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_TABLE_DIV_STYLE);
    targetNode = (Element) targetNode.appendChild(tableDiv);
    Element cellDiv = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);

    Attr attr = doc.createAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    String value = ODPConvertConstants.HTML_CLASS_DRAW_SHAPE_CLASSES + drawFrameClassList + drawImageClassList;

    // Build the table cell div
    StringBuilder cellDivNodeStyle = new StringBuilder(128);

    // Get the Image's class list and remove the "_graphic_text-properties" from any class to ensure we get the GRAPHIC set of properties
    drawFrameClassList = drawFrameClassList.replace(ODPConvertConstants.CSS_GRAPHIC_TEXT_PROPERTIES_CLASS_SUFFIX, "");

    // Add any padding for the image to the frame
    String paddingAdjustment = CSSConvertUtil.getGroupedInlineStyle(context, ODPConvertConstants.HTML_ATTR_PADDING, drawFrameClassList,
        true);

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
      for (int i = 0; i < CSSConvertUtil.ALL_DIMENSIONS; i++)
      {
        String padStyleWithoutPercent = padStyles[i].substring(0, padStyles[i].length() - 1);
        values[i] = Double.parseDouble(padStyleWithoutPercent);
      }

      double width = 100 - values[1] - values[3];
      double height = 100 - values[0] - values[2];
      cellDivNodeStyle.append(ODPConvertConstants.SVG_ATTR_WIDTH + ODPConvertConstants.SYMBOL_COLON + Double.toString(width)
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON);
      cellDivNodeStyle.append(ODPConvertConstants.SVG_ATTR_HEIGHT + ODPConvertConstants.SYMBOL_COLON + Double.toString(height)
          + ODPConvertConstants.SYMBOL_PERCENT + ODPConvertConstants.SYMBOL_SEMICOLON);

    }

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

  // Currently we have an issue where ODP saves the TablePreview for each table into
  // the content.xml which then gets converted. Even though it is set to display:none,
  // it is still shown by the Concord editor.

  // To get around this check if the image is a TablePreview image.
  protected boolean isTablePreviewImage(Node odfElement, Element htmlParent, ConversionContext context)
  {
    boolean isTablePreviewImage = false;

    NamedNodeMap attrs = odfElement.getAttributes();

    if (attrs != null)
    {
      Node xlinkXref = attrs.getNamedItem(ODPConvertConstants.ODF_ATTR_XLINK_HREF);
      if (xlinkXref != null)
      {
        String value = xlinkXref.getNodeValue();
        if (value != null)
        {
          if (value.contains(TABLE_PREVIEW))
          {
            isTablePreviewImage = true;
          }
        }
      }
    }
    return isTablePreviewImage;
  }

  /**
   * Converts the image to a supported format if necessary
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param node
   *          Source node
   * @param drawFrame
   *          Draw Frame of the source node
   * @param htmlElement
   *          Image HTML node
   * @return boolean - valid image exists
   * 
   */
  protected boolean convertImageToSupportedFormat(ConversionContext context, Node node, OdfElement drawFrame, Element htmlElement)
  {
    boolean alreadyConverted = false;
    OdfElement odfElement = (OdfElement) node;

    String imageSrc = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_XLINK_HREF);

    String fileFullName = context.get(ODPConvertConstants.CONTEXT_TARGET_BASE) + File.separator + imageSrc;

    boolean needsClip = false;
    needsClip = ODPClipConvertUtil.isImageClipped(context, drawFrame);

    int rst = processFormatConvert(context, fileFullName);
    if (rst == NO_CONVERT)
    {
      alreadyConverted = true; // Already counted during original copy processing in ODPImageConvertor
    }
    else if (rst == CONVERT)
    {
      int width = (int) (0.5 + 1.2 * Double.parseDouble(ODPClipConvertUtil.convertWidthUnitsToPT(drawFrame)));
      int height = (int) (0.5 + 1.2 * Double.parseDouble(ODPClipConvertUtil.convertHeightUnitsToPT(drawFrame)));
      if (needsClip || !PresentationConfig.isAsyncGraphics()) // Must run conversion synchronously because it needs to be completed prior to
                                                              // clip
      {
        alreadyConverted = runImageConversion(context, fileFullName, width, height, htmlElement);
      }
      else
      // Can run asynchronously since clipping isn't needed
      {
        alreadyConverted = submitImageConversion(context, fileFullName, width, height, htmlElement);
      }
      imageSrc = imageSrc.substring(0, imageSrc.lastIndexOf(ODPConvertConstants.SYMBOL_DOT)) + PRESERVATION_SUFFIX;
      fileFullName = context.get(ODPConvertConstants.CONTEXT_TARGET_BASE) + File.separator + imageSrc;
    }
    else if (rst == CONVERT_OBJECT)
    {
      int width = (int) (0.5 + 1.2 * Double.parseDouble(ODPClipConvertUtil.convertWidthUnitsToPT(drawFrame)));
      int height = (int) (0.5 + 1.2 * Double.parseDouble(ODPClipConvertUtil.convertHeightUnitsToPT(drawFrame)));
      if ((width == 0) || (height == 0))
      {
        width = 1;
        height = 1;
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_NON_DISPLAYABLE_IMAGE, imageSrc);
        ODPCommonUtil.logMessage(Level.INFO, message);
      }
      alreadyConverted = submitObjectReplacementConversion(context, fileFullName, width, height, htmlElement);
      imageSrc = imageSrc + ODPConvertConstants.FILE_SUFFIX_PNG;
      fileFullName = context.get(ODPConvertConstants.CONTEXT_TARGET_BASE) + File.separator + imageSrc;
    }

    // Check Graphic Limit - This will throw a LimitExceededException if the limit is exceeded. The ODP2HTMLConvertor will handle it.
    if (!alreadyConverted)
    {
      PresentationConfig.incrementGraphicCount(context);
    }

    if (rst != UNKNOWN && needsClip)
    {
      return clipImage(context, drawFrame, imageSrc, fileFullName, htmlElement, alreadyConverted);
    }
    if (rst == UNKNOWN)
    {
      ConvertUtil.createPlaceHolder(context, htmlElement, true);
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNKNOWN_IMAGE_FORMAT, imageSrc);
      ODPCommonUtil.logMessage(Level.WARNING, message);
      return false; // No valid image exists
    }

    return true; // Valid image exists
  }

  private boolean clipImage(ConversionContext context, OdfElement drawFrame, String imageSrc, String fileFullName, Element htmlElement,
      boolean alreadyConverted)
  {
    // Currently with image cropping we need to know height, width, x and y location.
    // If a clipped image is also rotated, we may not have this information. So, we check up front to
    // see if all information is available to us. We return if we don't have it.
    // TODO: Handle rotated and cropped images
    if (isRotatedAndCropped(drawFrame))
      return true;

    // Get the clip values
    String clipRight = (String) context.get(ODPConvertConstants.CLIP_RIGHT);
    String clipLeft = (String) context.get(ODPConvertConstants.CLIP_LEFT);
    String clipTop = (String) context.get(ODPConvertConstants.CLIP_TOP);
    String clipBottom = (String) context.get(ODPConvertConstants.CLIP_BOTTOM);

    // Calculate the width measures
    double clipWidth = Double.parseDouble(ODPClipConvertUtil.convertUnitToPT(clipRight))
        + Double.parseDouble(ODPClipConvertUtil.convertUnitToPT(clipLeft)); // Total, clipLeft + clipRight
    // Calculate the height measures
    double clipHeight = Double.parseDouble(ODPClipConvertUtil.convertUnitToPT(clipTop))
        + Double.parseDouble(ODPClipConvertUtil.convertUnitToPT(clipBottom)); // Total clipped height

    // Get information Convert To SVG file
    int height, width = 0;
    int viewableWidth, viewableHeight = 0;
    // Typically the dpiRatio will be one, however if we get a DPI
    // less that 72, we will adjust to 96 DPI
    double dpiWidthRatio = 1.0;
    double dpiHeightRatio = 1.0;

    // Get clipInfo out of cache if it exists
    ODPClipInfo clipInfo = getClipInfo(context, imageSrc, fileFullName);
    Dimension dim = clipInfo.getDim();
    Dimension dpi = clipInfo.getDpi();

    // NOTES: for future reference
    // dWidthCM = actual width of image in cm (pixel width divided by pixels per CM
    // dWidth = width in points of dWidthCM
    // width = "adjust width" in width... the mysterious 1.2 multiplier
    // viewableWidth = width - "adjusted" clipWidth
    // The same is true for the heights
    HashMap<String, Double> stretchMap = null;
    if (dim == null) // Can we detect original dimensions?
    { // No
      viewableWidth = (int) (0.5 + 1.2 * Double.parseDouble(ODPClipConvertUtil.convertWidthUnitsToPT(drawFrame)));
      width = (int) (viewableWidth + (0.5 + 1.2 * clipWidth)); // Actual object width??
      viewableHeight = (int) (0.5 + 1.2 * Double.parseDouble(ODPClipConvertUtil.convertHeightUnitsToPT(drawFrame)));
      height = (int) (viewableHeight + (0.5 + 1.2 * clipHeight)); // Actual object height??
      // Assume no stretching
      stretchMap = new HashMap<String, Double>();
      stretchMap.put(ODPConvertConstants.WIDTH_STRETCH, Double.valueOf(1.0));
      stretchMap.put(ODPConvertConstants.HEIGHT_STRETCH, Double.valueOf(1.0));
    }
    else if (dim != null && dpi == null) // Could not get DPI... use default of dots per inch of 96
    {
      double dWidthCM = (double) dim.width / DOTS_PER_CM;
      double dHeightCM = (double) dim.height / DOTS_PER_CM;
      double dWidth = Double.parseDouble(ODPClipConvertUtil.convertUnitToPT(Double.toString(dWidthCM) + "cm"));
      double dHeight = Double.parseDouble(ODPClipConvertUtil.convertUnitToPT(Double.toString(dHeightCM) + "cm"));
      width = (int) (0.5 + 1.2 * dWidth);
      height = (int) (0.5 + 1.2 * dHeight);
      viewableWidth = (int) (width - (int) (0.5 + 1.2 * clipWidth));
      viewableHeight = (int) (height - (int) (0.5 + 1.2 * clipHeight));
      stretchMap = isImageStretched(drawFrame, viewableWidth, viewableHeight);
    }
    else
    {
      // Check the dpi... it something small adjust
      if (dpi.width < MINIMUM_DOTS_PER_INCH)
      {
        // Adjustment ratio for the dpi and clipping values
        dpiWidthRatio = DOTS_PER_INCH / dpi.width;
      }
      if (dpi.height < MINIMUM_DOTS_PER_INCH)
      {
        // Adjust ratio for the dpi and clipping values
        dpiHeightRatio = DOTS_PER_INCH / dpi.height;
      }
      double dWidthCM = (double) dim.width / (dpi.width * dpiWidthRatio) * ODPConvertConstants.CM_TO_INCH_CONV;
      double dHeightCM = (double) dim.height / (dpi.height * dpiHeightRatio) * ODPConvertConstants.CM_TO_INCH_CONV;
      double dWidth = Double.parseDouble(ODPClipConvertUtil.convertUnitToPT(Double.toString(dWidthCM) + "cm"));
      double dHeight = Double.parseDouble(ODPClipConvertUtil.convertUnitToPT(Double.toString(dHeightCM) + "cm"));
      width = (int) (0.5 + 1.2 * dWidth);
      height = (int) (0.5 + 1.2 * dHeight);
      viewableWidth = (int) (width - (int) (0.5 + 1.2 * (clipWidth * (1 / dpiWidthRatio))));
      viewableHeight = (int) (height - (int) (0.5 + 1.2 * clipHeight * (1 / dpiHeightRatio)));
      stretchMap = isImageStretched(drawFrame, viewableWidth, viewableHeight);
    }

    // TODO: If viewableWidth or viewableHeight are less than 0, we have an image that is negatively cropped.
    // This is not supported in R1 .
    if ((viewableWidth <= 0) || (viewableHeight <= 0))
      return true;

    // Adjust the width and height of the draw frame div to size of original image
    // drawFrameWidth = width of drawframe in the ODP
    // realDrawFrameWidth = drawFrameWidth divided by (amount images is stretched/shrunk)
    // dUnclippedImageWidth = amount clipped on left and right plus realDrawFrameWidth
    // dStretchedImageWidth = dUnclippedImageWidth multiplied by (amount image is stretched/shrunk)
    // sStretchedImageWidth = String of dStretchedImageWidth converted to percentage
    double dClipTop = Measure.extractNumber(clipTop) * (1 / dpiHeightRatio);
    double dClipRight = Measure.extractNumber(clipRight) * (1 / dpiWidthRatio);
    ;
    double dClipBottom = Measure.extractNumber(clipBottom) * (1 / dpiHeightRatio);
    ;
    double dClipLeft = Measure.extractNumber(clipLeft) * (1 / dpiWidthRatio);
    ;
    String clipInfoAttr = "";
    double drawFrameWidth = Measure.extractNumber(drawFrame.getAttribute(ODFConstants.SVG_WIDTH));
    double realDrawFrameWidth = drawFrameWidth / stretchMap.get(ODPConvertConstants.WIDTH_STRETCH);
    double dUnclippedImageWidth = dClipLeft + realDrawFrameWidth + dClipRight;
    double dStretchedImageWidth = dUnclippedImageWidth * stretchMap.get(ODPConvertConstants.WIDTH_STRETCH);
    String sStretchedImageWidth = MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_WIDTH, dStretchedImageWidth, context);

    double drawFrameHeight = Measure.extractNumber(drawFrame.getAttribute(ODFConstants.SVG_HEIGHT));
    double realDrawFrameHeight = drawFrameHeight / stretchMap.get(ODPConvertConstants.HEIGHT_STRETCH);
    double dUnclippedImageHeight = dClipTop + realDrawFrameHeight + dClipBottom;
    double dStretchedImageHeight = dUnclippedImageHeight * stretchMap.get(ODPConvertConstants.HEIGHT_STRETCH);
    String sStretchedImageHeight = MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_HEIGHT, dStretchedImageHeight,
        context);

    // Need to update the location of the image since we are changing size of div (to remove shrinking or stretching of the image)
    String sNewLocationLeft, sNewLocationTop;
    double dNewLocationLeft = Measure.extractNumber(drawFrame.getAttribute(ODFConstants.SVG_X))
        - (dClipLeft * stretchMap.get(ODPConvertConstants.WIDTH_STRETCH));
    sNewLocationLeft = MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_WIDTH, dNewLocationLeft, context);

    double dNewLocationTop = Measure.extractNumber(drawFrame.getAttribute(ODFConstants.SVG_Y))
        - (dClipTop * stretchMap.get(ODPConvertConstants.HEIGHT_STRETCH));
    sNewLocationTop = MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_HEIGHT, dNewLocationTop, context);

    // Get the CSS drawFrame and update the location
    Element drawFrameHtml = getDrawFrame(htmlElement);
    HashMap<String, String> styleInfoMap = ODPClipConvertUtil.getInLineStyleMap(drawFrameHtml);
    String attrValue;

    attrValue = styleInfoMap.get(ODPConvertConstants.SVG_ATTR_WIDTH);
    styleInfoMap.put(ODPConvertConstants.SVG_ATTR_WIDTH, sStretchedImageWidth);
    clipInfoAttr += ODPConvertConstants.CLIP_ORIGINAL_DF_WIDTH_PERCENT + ODPConvertConstants.SYMBOL_COLON + attrValue
        + ODPConvertConstants.SYMBOL_SEMICOLON;
    clipInfoAttr += ODPConvertConstants.CLIP_CALCULATED_DF_WIDTH_PERCENT + ODPConvertConstants.SYMBOL_COLON + sStretchedImageWidth
        + ODPConvertConstants.SYMBOL_SEMICOLON;

    attrValue = styleInfoMap.get(ODPConvertConstants.SVG_ATTR_HEIGHT);
    styleInfoMap.put(ODPConvertConstants.SVG_ATTR_HEIGHT, sStretchedImageHeight);
    clipInfoAttr += ODPConvertConstants.CLIP_ORIGINAL_DF_HEIGHT_PERCENT + ODPConvertConstants.SYMBOL_COLON + attrValue
        + ODPConvertConstants.SYMBOL_SEMICOLON;
    clipInfoAttr += ODPConvertConstants.CLIP_CALCULATED_DF_HEIGHT_PERCENT + ODPConvertConstants.SYMBOL_COLON + sStretchedImageHeight
        + ODPConvertConstants.SYMBOL_SEMICOLON;

    attrValue = styleInfoMap.get(ODPConvertConstants.ALIGNMENT_TOP);
    styleInfoMap.put(ODPConvertConstants.ALIGNMENT_TOP, sNewLocationTop);
    clipInfoAttr += ODPConvertConstants.CLIP_ORIGINAL_DF_Y_PERCENT + ODPConvertConstants.SYMBOL_COLON + attrValue
        + ODPConvertConstants.SYMBOL_SEMICOLON;
    clipInfoAttr += ODPConvertConstants.CLIP_CALCULATED_DF_Y_PERCENT + ODPConvertConstants.SYMBOL_COLON + sNewLocationTop
        + ODPConvertConstants.SYMBOL_SEMICOLON;

    attrValue = styleInfoMap.get(ODPConvertConstants.ALIGNMENT_LEFT);
    styleInfoMap.put(ODPConvertConstants.ALIGNMENT_LEFT, sNewLocationLeft);
    clipInfoAttr += ODPConvertConstants.CLIP_ORIGINAL_DF_X_PERCENT + ODPConvertConstants.SYMBOL_COLON + attrValue
        + ODPConvertConstants.SYMBOL_SEMICOLON;
    clipInfoAttr += ODPConvertConstants.CLIP_CALCULATED_DF_X_PERCENT + ODPConvertConstants.SYMBOL_COLON + sNewLocationLeft
        + ODPConvertConstants.SYMBOL_SEMICOLON;

    // Set the style tag on the drawFrame element and also store the bread crumbs
    String newStyle = ODPClipConvertUtil.getStyleString(styleInfoMap);

    drawFrameHtml.setAttribute(ODPConvertConstants.HTML_STYLE_TAG, newStyle);
    drawFrameHtml.setAttribute(ODPConvertConstants.CLIP_INFO_ATTRIBUTE, clipInfoAttr);

    // Get the target file name
    String targetFileName = getConvertedFileName(fileFullName, drawFrame, drawFrame.getAttribute(ODFConstants.SVG_HEIGHT),
        drawFrame.getAttribute(ODFConstants.SVG_WIDTH));

    // Replace the name of the cropped image into the src attribute
    int indexPictures = targetFileName.indexOf(ODPConvertConstants.FILE_PICTURE_START_PREFIX);
    if(indexPictures==-1)
    	indexPictures = targetFileName.indexOf(ODPConvertConstants.FILE_MEDIA_START_PREFIX);
    String imageSrcName = targetFileName.substring(indexPictures);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_SRC, imageSrcName);

    // This is really the X (horizontal) and Y (vertical) of the visible area
    int leftPixels = (int) (0.5 + 1.2 * (Double.parseDouble(ODPClipConvertUtil.convertUnitToPT(clipLeft)) * (1 / dpiWidthRatio)));
    int topPixels = (int) (0.5 + 1.2 * (Double.parseDouble(ODPClipConvertUtil.convertUnitToPT(clipTop)) * (1 / dpiHeightRatio)));

    // Create the cropped image (or use the same cropped image if this is a duplicate)
    alreadyConverted = submitImageCrop(context, height, width, leftPixels, topPixels, viewableWidth, viewableHeight, fileFullName,
        htmlElement, targetFileName);

    // Remove clip entries from the context
    context.remove(ODPConvertConstants.CLIP_TOP);
    context.remove(ODPConvertConstants.CLIP_RIGHT);
    context.remove(ODPConvertConstants.CLIP_BOTTOM);
    context.remove(ODPConvertConstants.CLIP_LEFT);

    // Check Graphic Limit - This will throw a LimitExceededException if the limit is exceeded. The ODP2HTMLConvertor will handle it.
    if (!alreadyConverted)
    {
      PresentationConfig.incrementGraphicCount(context);
    }
    return true;

  }

  /**
   * 
   * @param drawFrame
   *          currently being process
   * @param viewableWidth
   *          width (in pts) of image viewable
   * @param viewableHeight
   *          height (in pts)of image viewable
   * @return map of stretch characteristics if object is stretched, otherwise values are set to 1 (ie which means not stretched)
   * 
   */
  private HashMap<String, Double> isImageStretched(OdfElement drawFrame, int viewableWidth, int viewableHeight)
  {
    int drawFrameWidth = (int) (0.5 + 1.2 * Double.parseDouble(ODPClipConvertUtil.convertWidthUnitsToPT(drawFrame)));
    int drawFrameHeight = (int) (0.5 + 1.2 * Double.parseDouble(ODPClipConvertUtil.convertHeightUnitsToPT(drawFrame)));
    HashMap<String, Double> stretchMap = new HashMap<String, Double>();
    // TODO: if object is not stretched more than 1 percent, we say not stretched to allow for rounding. (Is this correct??)
    if (((Math.abs(viewableWidth - drawFrameWidth)) > (.01 * drawFrameWidth))
        || ((Math.abs(viewableHeight - drawFrameHeight)) > (.01 * drawFrameHeight)))
    {
      double widthStretch = (double) drawFrameWidth / viewableWidth;
      stretchMap.put(ODPConvertConstants.WIDTH_STRETCH, widthStretch);
      double heightStretch = (double) drawFrameHeight / viewableHeight;
      stretchMap.put(ODPConvertConstants.HEIGHT_STRETCH, heightStretch);
      return stretchMap;
    }
    // Not stretched
    stretchMap.put(ODPConvertConstants.WIDTH_STRETCH, 1.0);
    stretchMap.put(ODPConvertConstants.HEIGHT_STRETCH, 1.0);
    return stretchMap;
  }

  private boolean isRotatedAndCropped(OdfElement drawFrame)
  {
    String w = drawFrame.getAttribute(ODFConstants.SVG_WIDTH);
    String h = drawFrame.getAttribute(ODFConstants.SVG_HEIGHT);
    String x = drawFrame.getAttribute(ODFConstants.SVG_X);
    String y = drawFrame.getAttribute(ODFConstants.SVG_Y);
    if (w.length() == 0 || h.length() == 0 || x.length() == 0 || y.length() == 0)
      return true;
    return false;
  }

  /**
   * 
   * @param context
   * @param imageSrc
   * @param fileFullName
   * @return clipInfo for the image passed in
   */
  @SuppressWarnings("unchecked")
  private ODPClipInfo getClipInfo(ConversionContext context, String imageSrc, String fileFullName)
  {
    Map<String, ODPClipInfo> cachedCropMap = (Map<String, ODPClipInfo>) context.get(ODPConvertConstants.CONTEXT_CACHED_CROP_MAP);
    if (cachedCropMap == null)
    {
      cachedCropMap = new HashMap<String, ODPClipInfo>();
      context.put(ODPConvertConstants.CONTEXT_CACHED_CROP_MAP, cachedCropMap);
    }

    ODPClipInfo clipInfo = (ODPClipInfo) cachedCropMap.get(imageSrc);

    Dimension dpi, dim;
    if (clipInfo == null)
    {
      // Attempt to calculate original dimensions and dpi
      dim = ODPClipConvertUtil.getImageDimension(fileFullName);
      dpi = ODPClipConvertUtil.getDPI(fileFullName, dim);
      clipInfo = new ODPClipInfo(dim, dpi);
      cachedCropMap.put(imageSrc, clipInfo);
    }
    return clipInfo;
  }

  /**
   * getConvertedFileName creates the cropped image file name
   * 
   * @param fileFullName
   *          - name of original file
   * @param drawFrame
   *          - drawFrame of object
   * @param h
   *          - height
   * @param w
   *          - width
   * @return file name to be used for converted object
   */
  private String getConvertedFileName(String fileFullName, Element drawFrame, String h, String w)
  {
    int dotIndex = fileFullName.lastIndexOf(ODPConvertConstants.SYMBOL_DOT);

    String drawStyleName = drawFrame.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
    String width = "W" + w;
    String height = "H" + h;

    String fileNewName = fileFullName.substring(0, dotIndex) + ODPConvertConstants.SYMBOL_UNDERBAR + drawStyleName
        + ODPConvertConstants.SYMBOL_UNDERBAR + height + ODPConvertConstants.SYMBOL_UNDERBAR + width + PRESERVATION_SUFFIX;

    return fileNewName;
  }

  /**
   * submitImageCrop - crops the image
   * 
   * @param context
   *          - ConversionContext
   * @param height
   *          - total height of unclipped object
   * @param width
   *          - total width of unclipped object
   * @param clipLeft
   *          - number of pixels clipped from the left - used to position the object
   * @param clipTop
   *          - number of pixels clipped from the top - used to clip the object
   * @param viewableWidth
   *          - visible width
   * @param viewableHeight
   *          - visible height
   * @param fileFullName
   *          - fullname of file to be converted
   * @param htmlElement
   *          - image element
   * @param targetFileName
   *          - name of file that is converted
   * @return boolean alreadyConverted. If true, the cropped image was already created.
   */
  private static boolean submitImageCrop(final ConversionContext context, final int height, final int width, final double clipLeft,
      final double clipTop, final double viewableWidth, final double viewableHeight, final String fileFullName, final Element htmlElement,
      final String targetFileName)
  {

    boolean alreadyConverted = false;
    // Now go ahead and do the crop
    final Future<?> future = context.getTask(targetFileName);

    if (future == null) // Not previously cropped
    {
      log.fine("Image to crop - setup callable");
      Callable<ConversionWarning> task = new Callable<ConversionWarning>()
      {
        public ConversionWarning call()
        {
          long start = System.currentTimeMillis();
          log.fine("Crop thread starts");
          ConversionWarning cw = null;

          try
          {
            // Now go ahead and crop the image
            // System.out.println("crops the image: "+height+":"+width+":"+clipLeft+":"+clipTop+":"+viewableWidth+":"+viewableHeight);
            cvImageCropper.createCropImageFile(context, height, width, clipLeft, clipTop, viewableWidth, viewableHeight, fileFullName,
                targetFileName);
            log.fine("Crop was successful for: " + targetFileName);
          }
          catch (Throwable th)
          {
            cw = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, th.getLocalizedMessage(), "Error invoking conversion task");
            String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".submitImageCrop");
            ODPCommonUtil.logException(context, Level.WARNING, message, th);
          }

          if (cw != null) // Add the warning to the ConversionResult in the context
          {
            ODPCommonUtil.logMessage(Level.WARNING, ODPCommonUtil.LOG_CROP_FAILURE);
            ODPCommonUtil.addConversionError(context, cw);
          }
          else
          {
            cw = new ConversionWarning(); // Return an empty conversion warning
          }
          long end = System.currentTimeMillis();
          PerformanceAnalysis.recordCroppedImageConversionTime(context, (end - start));
          return cw;
        }
      };

      context.addTask(targetFileName, task);
    }
    else
    { // Was previously cropped
      alreadyConverted = true;
      ConversionWarning cw = null;
      try
      {
        cw = (ConversionWarning) future.get();
      }
      catch (Exception e)
      {
        cw = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, e.getLocalizedMessage(),
            "Error retrieving results from conversion task");
      }
      if (cw != null && cw.getDescription() != null && cw.getDescription().length() > 0)
      {
        log.warning(cw.getDescription());
      }
    }
    return alreadyConverted;
  }

  /**
   * Determines whether or not the specified image is to be converted or not
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param fileName
   *          Filename of the image
   * @return int 0=Don't Convert, 1=Convert, 2=Convert ObjectReplacement 3=Unknown type
   * 
   */
  private int processFormatConvert(ConversionContext context, final String fileName)
  {
    final String extName = fileName.substring(fileName.lastIndexOf(ODPConvertConstants.SYMBOL_DOT) + 1).toLowerCase();
    if (formatsCvt.contains(extName))
    {
      return CONVERT;
    }
    else if (extName.contains(OBJECT_REPLACEMENT))
    {
      return CONVERT_OBJECT;
    }
    else if (noCvtFormats.contains(extName))
    {
      return NO_CONVERT;
    }
    else
    {
      return UNKNOWN;
    }
  }

  /**
   * Creates a conversion task to convert the image
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param fileFullName
   *          Filename of the image
   * @param width
   *          Width of the image
   * @param height
   *          Height of the image
   * @param img
   *          ODF element of the image
   * @return boolean - True = Already converted or copied, False = Conversion or copy performed
   * 
   */
  private boolean runImageConversion(final ConversionContext context, final String fileFullName, final int width, final int height,
      final Element img)
  {
    long start = System.currentTimeMillis();
    log.fine("Presentation Image conversion to browser format starts");

    String extName = fileFullName.substring(fileFullName.lastIndexOf(ODPConvertConstants.SYMBOL_DOT) + 1).toLowerCase();
    File file = new File(fileFullName);
    String fileName = file.getName();

    int dotIndex = fileName.lastIndexOf(ODPConvertConstants.SYMBOL_DOT);
    String fileNewName = fileName.substring(0, dotIndex) + PRESERVATION_SUFFIX;
    final Integer pageNumber = PresentationConfig.getCurrentPageNumber(context);

    final Map<String, Object> param = new HashMap<String, Object>(PARMS_MAP_CAPACITY);
    param.put(ODPConvertConstants.SVG_ATTR_WIDTH, width);
    param.put(ODPConvertConstants.SVG_ATTR_HEIGHT, height);
    param.put("targetName", fileNewName);

    ConversionResult rst = null;

    // Make sure the file has not already been converted (it is possible to reference the same file multiple times in the ODP)
    File targetFile = new File(file.getParentFile().getAbsolutePath() + File.separator + fileNewName);
    boolean newFileNeeded = !targetFile.exists();
    if (newFileNeeded)
    {
      try
      {
        IConversionService conversionService = ConversionService.getInstance();
        IFormatConverter convertor = conversionService.getConverter(formatMimeTypeMap.get(extName), ConversionConstants.PNG_MIMETYPE);
        File directory = new File(file.getParentFile().getAbsolutePath() + File.separator);

        rst = convertor.convert(file, directory, param);

        if (log.isLoggable(Level.FINE))
        {
          log.fine("Image conversion status = " + rst.isSucceed());
        }
      }
      catch (Throwable th)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".createConversionTask");
        ODPCommonUtil.logException(context, Level.WARNING, message, th);
      }
    }
    else
    {
      if (log.isLoggable(Level.FINE))
      {
        log.fine(fileFullName + " has already been converted");
      }
    }

    // Create a placeholder if the conversion failed
    if ((newFileNeeded) && ((rst == null) || (!rst.isSucceed())))
    {
      ConvertUtil.createPlaceHolder(context, img, true);
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_SYNC_IMAGE_ERROR, pageNumber);
      ODPCommonUtil.logMessage(Level.WARNING, message);
      newFileNeeded = false;
    }
    // Update the image src in the HTML if the conversion was successful (or not needed)
    else
    {
      img.setAttribute(ODPConvertConstants.HTML_ATTR_SRC, ODPConvertConstants.FILE_PICTURE_START_PREFIX + fileNewName);
    }

    long end = System.currentTimeMillis();
    PerformanceAnalysis.recordConvertedImageConversionTime(context, (end - start));

    return (!newFileNeeded);
  }

  /**
   * Creates a conversion task to convert the image
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param fileFullName
   *          Filename of the image
   * @param width
   *          Width of the image
   * @param height
   *          Height of the image
   * @param img
   *          ODF element of the image
   * @return boolean - True = Already converted or copied, False = Conversion or copy performed
   */
  private boolean submitImageConversion(final ConversionContext context, final String fileFullName, final int width, final int height,
      final Element img)
  {
    boolean alreadyConverted = false;
    final String extName = fileFullName.substring(fileFullName.lastIndexOf(ODPConvertConstants.SYMBOL_DOT) + 1).toLowerCase();
    final File file = new File(fileFullName);
    String fileName = file.getName();

    int dotIndex = fileName.lastIndexOf(ODPConvertConstants.SYMBOL_DOT);
    final String fileNewName = fileName.substring(0, dotIndex) + PRESERVATION_SUFFIX;

    final Future<?> future = context.getTask(fileNewName);

    if (future == null) // Image not previously converted
    {
      log.fine("Image to convert - setup callable");
      final Integer pageNumber = PresentationConfig.getCurrentPageNumber(context);

      Callable<ConversionWarning> task = new Callable<ConversionWarning>()
      {
        public ConversionWarning call()
        {

          long start = System.currentTimeMillis();
          log.fine("Image thread starts for image: " + fileNewName);

          final Map<String, Object> param = new HashMap<String, Object>(PARMS_MAP_CAPACITY);
          param.put(ODPConvertConstants.SVG_ATTR_WIDTH, width);
          param.put(ODPConvertConstants.SVG_ATTR_HEIGHT, height);
          param.put("targetName", fileNewName);

          ConversionResult rst = null;
          ConversionWarning cw = null;
          try
          {
            IConversionService conversionService = ConversionService.getInstance();
            IFormatConverter convertor = conversionService.getConverter(formatMimeTypeMap.get(extName), ConversionConstants.PNG_MIMETYPE);
            File directory = new File(file.getParentFile().getAbsolutePath() + File.separator);

            rst = convertor.convert(file, directory, param);

            if (log.isLoggable(Level.FINE))
            {
              log.fine("Image conversion status = " + rst.isSucceed());
            }
          }
          catch (Throwable th)
          {
            String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".submitImageConversion");
            ODPCommonUtil.logException(context, Level.WARNING, message, th);
          }

          // Create a placeholder if the conversion failed
          if (rst == null || !rst.isSucceed())
          {
            ConvertUtil.createPlaceHolder(context, img, true);
            String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ASYNC_IMAGE_ERROR, pageNumber);
            ODPCommonUtil.logMessage(Level.WARNING, message);
            cw = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, CREATE_PLACEHOLDER, "Error converting image asynchronously");
          }
          // Update the image src in the HTML if the conversion was successful
          else
          {
            img.setAttribute(ODPConvertConstants.HTML_ATTR_SRC, ODPConvertConstants.FILE_PICTURE_START_PREFIX + fileNewName);
          }

          if (cw == null)
          {
            cw = new ConversionWarning(); // Return an empty conversion warning (which means success)
          }
          long end = System.currentTimeMillis();
          PerformanceAnalysis.recordConvertedImageConversionTime(context, (end - start));
          return cw;
        }
      };

      context.addTask(fileNewName, task); // Start the thread
    }
    else
    // Image was previously converted or previous conversion is still running.
    {
      alreadyConverted = true;
      ConversionWarning cw = null;
      try
      {
        cw = (ConversionWarning) future.get(); // Wait until the conversion finishes
      }
      catch (Exception e)
      {
        cw = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, CREATE_PLACEHOLDER);
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".submitImageConversion");
        ODPCommonUtil.logException(context, Level.WARNING, message, e);
      }
      if (cw.getLocation() != null && CREATE_PLACEHOLDER.equals(cw.getLocation()))
      {
        ConvertUtil.createPlaceHolder(context, img, true);
      }
      // Update the image src in the HTML if the conversion was successful
      else
      {
        img.setAttribute(ODPConvertConstants.HTML_ATTR_SRC, ODPConvertConstants.FILE_PICTURE_START_PREFIX + fileNewName);
      }
    }
    return alreadyConverted;
  }

  /**
   * Creates a conversion task to convert the image
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param fileFullName
   *          Filename of the image
   * @param width
   *          Width of the image
   * @param height
   *          Height of the image
   * @param img
   *          ODF element of the image
   * @return boolean - True = Already converted or copied, False = Conversion or copy performed
   */
  private boolean submitObjectReplacementConversion(final ConversionContext context, final String fileFullName, final int width,
      final int height, final Element img)
  {

    boolean alreadyConverted = false;

    String targetDirName = (String) context.get(ODPConvertConstants.CONTEXT_TARGET_BASE) + File.separator
        + ODPConvertConstants.FILE_PICTURE_START_PREFIX;
    final File targetDirectory = new File(targetDirName);

    final File sourceFile = new File(fileFullName);
    final String fileNewName = sourceFile.getName() + ODPConvertConstants.FILE_SUFFIX_PNG;

    final Future<?> future = context.getTask(fileNewName);

    if (future == null) // Image not previously converted
    {
      log.fine("Object replacement to convert - setup callable");
      Callable<ConversionWarning> task = new Callable<ConversionWarning>()
      {
        public ConversionWarning call()
        {

          long start = System.currentTimeMillis();
          log.fine("Object replacement thread starts for image: " + fileNewName);

          // For Object Replacements, the file format is not indicated in the extension so we need to figure that out
          String extName = ODPMetaFile.getFileType(sourceFile);

          ConversionResult rst = null;
          ConversionWarning cw = null;

          String mimeType = formatMimeTypeMap.get(extName);
          if ((mimeType != null) && (!noCvtFormats.contains(extName)))
          {
            final Map<String, Object> param = new HashMap<String, Object>(PARMS_MAP_CAPACITY);
            param.put(ODPConvertConstants.SVG_ATTR_WIDTH, width);
            param.put(ODPConvertConstants.SVG_ATTR_HEIGHT, height);
            param.put("targetName", fileNewName);

            try
            {
              IConversionService conversionService = ConversionService.getInstance();
              IFormatConverter convertor = conversionService.getConverter(mimeType, ConversionConstants.PNG_MIMETYPE);

              if (convertor != null)
              {
                rst = convertor.convert(sourceFile, targetDirectory, param);
              }

              if (log.isLoggable(Level.FINE))
              {
                log.fine("Object Replacement Image conversion status = " + rst.isSucceed());
              }
            }
            catch (Throwable th)
            {
              String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".createConversionTask");
              ODPCommonUtil.logException(context, Level.WARNING, message, th);
            }

            // Create a placeholder if the conversion failed
            if (rst == null || !rst.isSucceed())
            {
              ConvertUtil.createPlaceHolder(context, img, true);
              ODPCommonUtil.logMessage(Level.WARNING, ODPCommonUtil.LOG_OBJECT_REPLACEMENT_IMAGE_ERROR);
              cw = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, CREATE_PLACEHOLDER, "Error converting image");
            }
            // Update the image src in the HTML if the conversion was successful
            else
            {
              img.setAttribute(ODPConvertConstants.HTML_ATTR_SRC, ODPConvertConstants.FILE_PICTURE_START_PREFIX + fileNewName);
            }

          }
          else
          {
            if (!extName.equals(ODPMetaFile.NOT_VALID_FILE))
            {
              ODPMetaFile.copyFile(fileFullName, targetDirectory, fileNewName);
              img.setAttribute(ODPConvertConstants.HTML_ATTR_SRC, ODPConvertConstants.FILE_PICTURE_START_PREFIX + fileNewName);
            }
            else
            {
              ConvertUtil.createPlaceHolder(context, img, true);
            }
          }

          if (cw == null)
          {
            cw = new ConversionWarning(); // Return an empty conversion warning (which means success)
          }
          long end = System.currentTimeMillis();
          PerformanceAnalysis.recordConvertedImageConversionTime(context, (end - start));
          return cw;
        }
      };

      context.addTask(fileNewName, task); // Start the thread
    }
    else
    // Image was previously converted or previous conversion is still running.
    {
      alreadyConverted = true;
      ConversionWarning cw = null;
      try
      {
        cw = (ConversionWarning) future.get(); // Wait until the conversion finishes
      }
      catch (Exception e)
      {
        cw = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, CREATE_PLACEHOLDER);
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS
            + ".createConsubmitImageConversionversionTask");
        ODPCommonUtil.logException(context, Level.WARNING, message, e);
      }
      if (cw.getLocation() != null && CREATE_PLACEHOLDER.equals(cw.getLocation()))
      {
        ConvertUtil.createPlaceHolder(context, img, true);
      }
      // Update the image src in the HTML if the conversion was successful
      else
      {
        img.setAttribute(ODPConvertConstants.HTML_ATTR_SRC, ODPConvertConstants.FILE_PICTURE_START_PREFIX + fileNewName);
      }
    }
    return alreadyConverted;
  }

  private static OdfElement getDrawFrame(OdfElement image)
  {
    OdfElement drawFrame = (OdfElement) image.getParentNode();

    while (drawFrame != null && !drawFrame.getNodeName().equals(ODFConstants.DRAW_FRAME))
    {
      if (drawFrame.getNodeName().equals(ODFConstants.DRAW_PAGE))
        return null; // If we get to the draw page, there is no draw:frame containing the object
      drawFrame = (OdfElement) drawFrame.getParentNode();
    }

    return drawFrame;

  }

  private static Element getDrawFrame(Element image)
  {
    Element drawFrame = (Element) image.getParentNode();
    String className = drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS).trim();

    while (drawFrame != null && !classIsDrawFrame(className))
    {
      drawFrame = (Element) drawFrame.getParentNode();
      if (null != drawFrame)
        className = drawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS).trim();
    }

    return drawFrame;
  }

  private static boolean classIsDrawFrame(String className)
  {
    String[] classes = className.split(ODPConvertConstants.SYMBOL_WHITESPACE);
    for (int i = 0; i < classes.length; i++)
    {
      if (classes[i].equalsIgnoreCase(ODFConstants.HTML_VALUE_DRAW_FRAME))
        return true;
    }
    return false;
  }

  private static Element getGDrawFrame(Element image)
  {
    Element gDrawFrame = (Element) image.getParentNode();
    String className = gDrawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);

    while (gDrawFrame != null && !className.contains(ODFConstants.HTML_VALUE_G_DRAW_FRAME))
    {
      gDrawFrame = (Element) gDrawFrame.getParentNode();
      if (null != gDrawFrame)
        className = gDrawFrame.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    }
    return gDrawFrame;
  }

  public static String getImageFlipInfo(ConversionContext context, OdfElement drawFrame)
  {
    // Extract the graphic style from the drawFrame
    String styleName = drawFrame.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
    if (styleName.length() == 0)
    {
      return ODPConvertConstants.HTML_VALUE_NONE; // No graphics style
    }

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
          Attr attr = grPropElement.getAttributeNode(ODPConvertConstants.ODF_ATTR_STYLE_MIRROR);
          if (null == attr)
            continue;
          return attr.getValue();
        }
      }
    }
    return ODPConvertConstants.HTML_VALUE_NONE; // Mirror style not found
  }
  private void parseBackgroundColor(ConversionContext context, OdfElement drawFrame, Element imgNode)
  {
    String drawStyleName =  drawFrame.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
    String backgroundColor = null;
    Node bgNode = getBgNode(context, drawStyleName);
    if(bgNode != null)
    {
      String bg = ((Element)bgNode).getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR);
      String fill = ((Element)bgNode).getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL);
      if(bg!=null && !"".equals(bg) && ("solid".equals(fill) || "".equals(fill)))
      {
        backgroundColor = bg;
      }
      else
      {
        Node bgParentNode = bgNode.getParentNode();
        if(bgParentNode != null)
        {
          String parentStyleName = ((Element)bgParentNode).getAttribute(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
          if(parentStyleName!=null && !"".equals(parentStyleName))
          {
            bgNode = getBgNode(context, parentStyleName);
            if(bgNode != null)
            {
              bg = ((Element)bgNode).getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR);
              if(bg!=null && !"".equals(bg) && ("solid".equals(fill) || "".equals(fill)))
              {
                backgroundColor = bg;
              }
            }
          }
        }
      }
    }
    if(backgroundColor != null)
      imgNode.setAttribute(ODPConvertConstants.HTML_STYLE_TAG, imgNode.getAttribute(ODPConvertConstants.HTML_STYLE_TAG)
          +ODPConvertConstants.CSS_BACKGROUND_COLOR+":"+backgroundColor+";");
  }
  
  private Node getBgNode(ConversionContext context, String styleName)
  {
    List<Node> nodeList = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(context, styleName);
    if (nodeList != null && nodeList.size() > 0)
    {
      int size = nodeList.size();
      for (int i = 0; i < size; i++)
      {
        Node node = nodeList.get(i);
        NodeList children = node.getChildNodes();
        for (int j = 0; j < children.getLength(); j++)
        {
          Node child = children.item(j);
          if (child instanceof OdfStyleGraphicProperties)
          {
            return child;
          }
        }
      }
    }
    return null;
  }
}
