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

import java.util.logging.Logger;

import org.apache.batik.dom.svg.SVGDOMImplementation;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class ODFImageCropper
{
  private static final String CLASS = ODFImageCropper.class.getName();

  @SuppressWarnings("unused")
  private static final Logger log = Logger.getLogger(CLASS);

  // =======================================================================
  // Instance Variables
  // =======================================================================
  private boolean ivDebugMode = true;

  // =======================================================================
  // Constants
  // =======================================================================
  private final static String IMAGE = "image";

  private final static String PATTERN = "pattern";

  private final static String PATTERN_CONTENT_UNITS = "patternContentUnits";

  private final static String USER_SPACE_ON_USE = "userSpaceOnUse";

  private final static String FULL = "100%";

  private final static String RECT = "rect";

  private final static String DEFS = "defs";

  public final void setDebugMode(boolean debugMode)
  {
    this.ivDebugMode = debugMode;
  }

  public final boolean isDebugMode()
  {
    return this.ivDebugMode;
  }

  /**
   * Creates the input document for the SVG to PNG translator and generates the cropped image
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
   * @param targetFileName
   *          - name of file that is converted
   * @return
   */
  public void createCropImageFile(ConversionContext context, int height, int width, double clipLeft, double clipTop, double viewableWidth,
      double viewableHeight, String fileFullName, String targetFileName)
  {
    Document doc = SVGDocumentFactory.createSVGDocument();
    SVGDocumentWrapper wrapper = new SVGDocumentWrapper(doc);
    String svgNS = SVGDOMImplementation.SVG_NAMESPACE_URI;

    Element svgRoot = wrapper.getDocument().getDocumentElement();
    svgRoot.setAttributeNS(null, ODFConstants.SVG_ATTR_PRESERVE_ASPECT_RATIO, ODFConstants.HTML_VALUE_NONE);
    svgRoot.setAttribute(ODFConstants.SVG_ATTR_WIDTH, String.valueOf(width));
    svgRoot.setAttribute(ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(height));

    Element rect = createRectElement(wrapper);
    rect.setAttribute(ODFConstants.SVG_ATTR_X, "0");
    rect.setAttribute(ODFConstants.SVG_ATTR_Y, "0");
    // This should be the full width and height
    rect.setAttribute(ODFConstants.SVG_ATTR_WIDTH, String.valueOf(width));
    rect.setAttribute(ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(height));
    rect.setAttribute(ODFConstants.SVG_ATTR_FILL, "url(#imageNameId)"); // Matches pattern ID
    rect.setAttribute(ODFConstants.SVG_ATTR_CLIP_PATH, "url(#RectClip)");

    Element defs = createDefsElement(wrapper);
    // Create the Pattern Element

    Element pattern = wrapper.getDocument().createElementNS(svgNS, PATTERN);
    pattern.setAttribute(ODFConstants.SVG_ATTR_PRESERVE_ASPECT_RATIO, ODFConstants.HTML_VALUE_NONE);
    pattern.setAttribute(ODFConstants.SVG_MARKER_ID, "imageNameId");
    pattern.setAttribute(PATTERN_CONTENT_UNITS, USER_SPACE_ON_USE);
    pattern.setAttribute(ODFConstants.SVG_ATTR_WIDTH, FULL);
    pattern.setAttribute(ODFConstants.SVG_ATTR_HEIGHT, FULL);

    // Create the Image Element
    String imageURL = "file:" + fileFullName;
    ODFDrawingParser.registerImage(context, imageURL); // Register Bitmap Fill Image URL

    Element image = wrapper.getDocument().createElementNS(svgNS, IMAGE);
    image.setAttribute(ODFConstants.SVG_ATTR_PRESERVE_ASPECT_RATIO, ODFConstants.HTML_VALUE_NONE);
    image.setAttribute(ODFConstants.ODF_ATTR_XLINK_HREF, imageURL);
    image.setAttribute(ODFConstants.SVG_ATTR_WIDTH, "100%");
    image.setAttribute(ODFConstants.SVG_ATTR_HEIGHT, "100%");

    // Add the Defs and Fill reference to the SVG Document
    pattern.appendChild(image);
    defs.appendChild(pattern);

    // Create the clipPath element
    Element clipPath = wrapper.getDocument().createElementNS(svgNS, "clipPath");
    clipPath.setAttribute(ODFConstants.SVG_MARKER_ID, "RectClip");
    defs.appendChild(clipPath);

    // create the RECT element for the clip path
    Element clipPathRect = wrapper.getDocument().createElementNS(svgNS, RECT);
    clipPathRect.setAttribute(ODFConstants.SVG_MARKER_ID, "rect1");
    clipPathRect.setAttribute(ODFConstants.SVG_ATTR_X, String.valueOf(clipLeft));
    clipPathRect.setAttribute(ODFConstants.SVG_ATTR_Y, String.valueOf(clipTop));
    clipPathRect.setAttribute(ODFConstants.SVG_ATTR_WIDTH, String.valueOf(viewableWidth));
    clipPathRect.setAttribute(ODFConstants.SVG_ATTR_HEIGHT, String.valueOf(viewableHeight));
    clipPath.appendChild(clipPathRect);

    // Use SVG to create the cropped image file
    createCropImage(doc, targetFileName, width, height);
  }

  /**
   * Creates the cropped image file
   * 
   * @param doc
   *          - Doc containing SVG "xml"
   * @param fileFullName
   *          - file name to crop
   * @param width
   *          - full width of image
   * @param height
   *          - full height of object
   * @return - name of cropped file
   */
  private void createCropImage(Document doc, String targetFileName, float width, float height)
  {
    TranscoderService transcoder = new TranscoderService();
    if (isDebugMode())
    {
      String targetSVGName = targetFileName + ODFConstants.FILE_SUFFIX_SVG;
      transcoder.print(doc, targetSVGName);
    }
    transcoder.convertSVGDOM2PNG(doc, targetFileName, width, height);
  }

  private Element createRectElement(SVGDocumentWrapper wrap)
  {
    Element rect = wrap.getDocument().createElementNS(SVGDOMImplementation.SVG_NAMESPACE_URI, RECT);
    wrap.getDocument().getDocumentElement().appendChild(rect);
    return rect;
  }

  private Element createDefsElement(SVGDocumentWrapper wrap)
  {
    Element defs = wrap.getDocument().createElementNS(SVGDOMImplementation.SVG_NAMESPACE_URI, DEFS);
    wrap.getDocument().getDocumentElement().appendChild(defs);
    return defs;
  }
}
