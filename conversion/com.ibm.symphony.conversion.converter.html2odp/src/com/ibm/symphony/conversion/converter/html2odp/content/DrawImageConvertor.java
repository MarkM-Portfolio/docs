/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.content;

import java.io.File;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.draw.OdfDrawImage;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.type.Color;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;

@SuppressWarnings("restriction")
public class DrawImageConvertor extends AbstractODPConvertor
{
  // private static final String CLASS = DrawImageConvertor.class.getName();
  //
  // private static final Logger log = Logger.getLogger(CLASS);

  @Override
  protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
	  try{
		  // Check if we are in shape processing to ensure we don't export the draw:image for a shape
		  Boolean inShapeProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_INSIDE_SHAPE);
		  if ((inShapeProcessing != null) && (inShapeProcessing))
		  {
			  // For the Shape <img> we still want to handle the accessibility information
			  setAccessibilityInfo(context, htmlNode, odfParent);
			  return;
		  }
		  
		  // TODO currently the image always filled to 100% for width and height,
		  // thus don't need convert them.
		  String odfNodeName = getOdfNodeName(htmlNode);
		  if (!ContentConvertUtil.NOT_FOUND.equals(odfNodeName) && !ODFConvertorUtil.isDrawingObject(htmlNode))
		  {
			  OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
			  HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
			  OdfElement odfElement = null;
			  if (indexTable.isHtmlNodeIndexed((Element) htmlNode))
			  {
				  odfElement = indexTable.getFirstOdfNode((Element) htmlNode);
				  // Update any accessibility information that might have changed
				  setAccessibilityInfo(context, htmlNode, odfParent);
			  }
			  else
			  {
				  odfElement = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(odfNodeName), odfNodeName);
				  ArrayList<OdfElement> elements = ContentConvertUtil.processPreserveOnlyElements(contentDom, htmlNode);
				  if (elements != null)
				  {
					  for (int i = 0; i < elements.size(); i++)
					  {
						  OdfElement preserveOnly = (OdfElement) elements.get(i);
						  odfElement.appendChild(preserveOnly);
					  }
				  }
				  
				  indexTable.addEntryByHtmlNode((Element) htmlNode, odfElement);
				  parseAttributes(context, htmlNode, odfElement, odfParent);
				  // mich - defect 10365, some html image elements are intentionally skipped and lead to empty draw:image xml elements,
				  // only non-empty elements should be added here
				  if (odfElement.getAttributes().getLength() > 0)
				  {
					  odfParent.appendChild(odfElement);
					  // Add any accessibility information provided
					  setAccessibilityInfo(context, htmlNode, odfParent);
				  }
			  }
			  
			  this.convertChildren(context, (Element) htmlNode, odfElement);
		  }
		  else
		  {
			  this.convertChildren(context, (Element) htmlNode, odfParent);
		  }
	  }catch (Exception e){
		  ODPCommonUtil.logException(context, ODPCommonUtil.LOG_ERROR_CONVERT_IMGDRAWFRAME, e);
	  }
  }

  protected void parseAttributes(ConversionContext context, Element htmlNode, OdfElement element, OdfElement odfParent)
  {
	// deal with background color first
	String style = htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
	Map<String, String> styleMap = ConvertUtil.buildCSSMap(style);
	String bgc = styleMap.get(ODPConvertConstants.CSS_BACKGROUND_COLOR);
	if(bgc != null)
	{
		String drawStyleName =  odfParent.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
		if(drawStyleName != null && !"".equals(drawStyleName))
		{
		    Node bgNode = getBgNode(context, drawStyleName);
		    if(bgNode != null)
		    	((Element) bgNode).setAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR, bgc);
		}
		else
		{
			drawStyleName = "gr"+UUID.randomUUID().toString().substring(0, 4);
			OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
			OdfStyle odfStyle = new OdfStyle(contentDom);
			odfStyle.setStyleFamilyAttribute(OdfStyleFamily.Graphic.getName());
			odfStyle.setStyleNameAttribute(drawStyleName);
			odfStyle.setProperty(OdfStyleGraphicProperties.FillColor, Color.toSixDigitHexRGB(bgc));
			odfStyle.setProperty(OdfStyleGraphicProperties.Fill, "solid");
			OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
			autoStyles.appendChild(odfStyle);
			odfParent.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME), ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME, drawStyleName);
		}
	}
	
    // for image, only deal with src currently.
    OdfDrawImage drawImage = (OdfDrawImage) element;
    String oldSrc = htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_SRC);
    String sourceRoot = (String) context.get(ODPConvertConstants.CONTEXT_SOURCE_PATH);
    URI imageURI = null;

    if (oldSrc == null)
      return;

    try
    {
      if (oldSrc.startsWith(ODPConvertConstants.HTTP_PREFIX))
      {
        imageURI = new URI(oldSrc);
      }
      else if (oldSrc.startsWith(ODPConvertConstants.HTML_B64_SRC_PREFIX))
      {
        return;
        // mich - defect 10365, removed ability for base64 inline images to be saved as files as they're not needed
        // As of fixing this defect, the ability to insert inline images from the editor has been removed. If this ability was to
        // be added back, this save process will be needed so that images inserted from the editor can be saved, so we need to
        // keep this code below around.
        /*
         * DO NOT REMOVE THIS CODE BELOW, IT IS INTENTIONALLY PRESERVED String b64 =
         * oldSrc.substring(ODPConvertConstants.HTML_B64_SRC_PREFIX.length());
         * 
         * BASE64Decoder decoder = new BASE64Decoder(); byte[] image = decoder.decodeBuffer(b64);
         * 
         * String name = UUID.randomUUID().toString(), filepath = sourceRoot + File.separator +
         * ODPConvertConstants.FILE_PICTURE_START_PREFIX + name + ODPConvertConstants.FILE_SUFFIX_PNG;
         * 
         * if (image != null) { BufferedOutputStream file = null;
         * 
         * try { // any exception thrown here should get caught by the outer catch // as long as the finally exits normally File outfile =
         * new File(filepath); file = new BufferedOutputStream(new FileOutputStream(outfile)); file.write(image); imageURI =
         * outfile.toURI(); } finally { ODPMetaFile.closeResource(file); } } } DO NOT REMOVE THIS CODE ABOVE, IT IS INTENTIONALLY PRESERVED
         */
      }
      else
      {
        // When an image with a space in its name is copied, the browser/editor changes the space in the name to %20, so switch back
        oldSrc = oldSrc.replaceAll("%20", " ");

        String imageName = null;
        int nameStart = oldSrc.lastIndexOf(ODPConvertConstants.FILE_RESOURCE_SEPARATOR) + 1;
        if (nameStart > -1)
        {
          imageName = oldSrc.substring(nameStart);
        }

        File imageSrcFile = new File(sourceRoot + File.separator + ODPConvertConstants.FILE_PICTURE_START_PREFIX + imageName);
        if (imageSrcFile.exists())
        {
          imageURI = imageSrcFile.toURI();
        }
        else
        {
          String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_IMAGE_FILE_NOT_EXIST, oldSrc);
          ODPCommonUtil.logMessage(Level.WARNING, message);
        }
      }

      if (imageURI != null)
      {
        drawImage.newImage(imageURI);
      }
      else
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_URI_NOT_EXIST, oldSrc);
        ODPCommonUtil.logMessage(Level.WARNING, message);
      }
    }
    catch (URISyntaxException e)
    {
      ODPCommonUtil.logException(context, Level.SEVERE, ODPCommonUtil.LOG_FAILED_IMAGE_EXPORT, e);
    }
    catch (Exception e)
    {
      ODPCommonUtil.logException(context, Level.SEVERE, ODPCommonUtil.LOG_FAILED_IMAGE_EXPORT, e);
    }
  }
  
  /**
   * Add or update accessibility information associated with this Shape or Image
   * @param context - the current conversion context
   * @param htmlNode - the img element
   * @param odfParent - the parent to add/update the svg:title or svg:desc
   */
  private void setAccessibilityInfo(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
    // First handle any aria information
    try
    {
      String altText = htmlNode.getAttribute(HtmlCSSConstants.ALT);
      if (altText != null && altText.length() > 0)
      {
        // Add or update the svg:title
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

      String ariaLabels = htmlNode.getAttribute(ODFConstants.HTML_ATTR_ARIA_DESCRIBEDBY);
      if (ariaLabels != null && ariaLabels.length() > 0)
      {
        String[] ariaLabelIDs = ariaLabels.trim().split("\\s+"); // Split by whitespace
        for (String ariaLabel : ariaLabelIDs)
        {
          if (!ariaLabel.startsWith(ODFConstants.HTML_ATTR_ARIA_IGNORE_PREFIX))
          {
            // Find the label containing the description.  It should be the sibling following the <img> element.
            Node sibling = htmlNode.getNextSibling();
            if (sibling != null && sibling.getNodeName().equals(ODFConstants.HTML_ELEMENT_LABEL))
            {
              String id = ((Element)sibling).getAttribute(ODFConstants.HTML_ATTR_ID);
              if (id != null && id.equals(ariaLabel))
              {
                Node textNode = sibling.getFirstChild();
                if (textNode != null && textNode instanceof Text)
                {
                  String svgDescText = textNode.getNodeValue();
                  if (svgDescText != null && svgDescText.length() > 0)
                  {
                    // Add or update the svg:desc
                    NodeList svgDescriptions = odfParent.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_SVGDESC);
                    if (svgDescriptions.getLength() == 0)
                    {
                      // Add a new svg:desc
                      OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
                      OdfElement descElement = contentDom.createElementNS(
                          ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_SVGDESC), ODPConvertConstants.ODF_ELEMENT_SVGDESC);
                      Text t = contentDom.createTextNode(svgDescText);
                      descElement.appendChild(t);
                      odfParent.appendChild(descElement);
                    }
                    else
                    {
                      // Update the svg:desc if it has been updated
                      Node svgDesc = svgDescriptions.item(0);
                      String currentDesc = svgDesc.getTextContent();
                      if (currentDesc == null || !currentDesc.equals(svgDescText))
                      {
                        svgDesc.setTextContent(svgDescText);
                      }
                    }
                  }
                }
              }
            }
            break;
          }
        }
      }
    }
    catch (Exception e)
    {
      ODPCommonUtil.logException(context, Level.SEVERE, ODPCommonUtil.LOG_FAILED_ARIA_EXPORT, e);
    }
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
