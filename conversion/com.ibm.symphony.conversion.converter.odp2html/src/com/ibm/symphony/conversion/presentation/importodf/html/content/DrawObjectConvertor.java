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

import java.util.HashSet;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.draw.OdfDrawObject;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class DrawObjectConvertor extends AbstractContentHtmlConvertor
{
  private static final String CLASS = DrawObjectConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static final PreserveOnlyConvertor preserveOnlyConvertor = new PreserveOnlyConvertor();

  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    // Chart Support -------------------------------------------------------------
    if (PresentationConfig.isNewFeatureEnabled(PresentationConfig.FEATURE_CHARTS))
    {
      // Get HRef Name
      OdfDrawObject drawObject = (OdfDrawObject) odfElement;
      String href = drawObject.getXlinkHrefAttribute();

      if (href == null)
      {
        // Not a Chart, so revert to Preserve Only Logic
        preserveOnlyConvertor.convert(context, odfElement, htmlParent);
      }
      else
      {
        int sublen = href.lastIndexOf(ODPConvertConstants.FILE_RESOURCE_SEPARATOR);
        String hrefName = sublen > 0 ? href.substring(sublen + 1) : href;

        if (isChart(context, hrefName))
        {
          context.put(ODPConvertConstants.CONTEXT_INSIDE_CHART, new Boolean(true));
          convertChart(context, odfElement, htmlParent, hrefName);
        }
        else
        {
          // Not a Chart, so revert to Preserve Only Logic
          preserveOnlyConvertor.convert(context, odfElement, htmlParent);
        }
      }
    }
    // Not a Chart, so revert to Preserve Only Logic
    else
    {
      preserveOnlyConvertor.convert(context, odfElement, htmlParent);
    }
  }

  /*
   * Converts a Chart to its proper HTML structure
   * 
   * @param context Conversion context
   * 
   * @param odfElement Input ODF Element
   * 
   * @param htmlParent Output HTML Parent
   * 
   * @param chartName Chart name
   */
  private final void convertChart(ConversionContext context, Node odfElement, Element htmlParent, String chartName)
  {
    // Pull key information from the Context
    Document doc = (Document) context.getTarget();

    // Determine if we are inside Style processing
    boolean inStyleProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_IN_STYLE);

    // Initialize Key Data
    Element targetNode = null;
    String chartDataPath = ODPConvertConstants.FILE_CHARTS_START_PREFIX + chartName;
    String drawFrameClass = ODPConvertConstants.HTML_VALUE_G_DRAW_FRAME;
    if (inStyleProcessing)
    {
      drawFrameClass = ODPConvertConstants.HTML_VALUE_G_DRAW_FRAME + " " + ODPConvertConstants.HTML_VALUE_BACKGROUND_IMAGE;
    }
    String imageClassAttribute = ODPConvertConstants.HTML_CLASS_DRAW_OBJECT + ODPConvertConstants.SYMBOL_WHITESPACE
        + ODPConvertConstants.HTML_VALUE_CONTENT_BOX_DATA_NODE + ODPConvertConstants.SYMBOL_WHITESPACE;

    // Use the HTML Parent draw_frame as the Top Level Chart DIV
    Element htmlElement = htmlParent;
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CONTEXTBOXTYPE, ODPConvertConstants.HTML_VALUE_CHART);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_GROUP);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_UNGROUPABLE, ODPConvertConstants.HTML_VALUE_YES);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CHART_DATA, chartDataPath);

    // Create the ContentBoxDataNode DIV
    Element htmlElement2 = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement2.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_CONTENT_BOX_DATA_NODE);
    if (inStyleProcessing)
      htmlElement2.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV2_BG_STYLE);
    else
      htmlElement2.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV2_STYLE);

    // Create the Graphic DIV
    Element htmlElement3 = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, drawFrameClass);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE, ODPConvertConstants.HTML_VALUE_PARAGRAPH);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_GRAPHIC);
    htmlElement3.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_DIV3_STYLE);

    // Create the PlaceholderChart Image
    Element imgNode = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_IMG);
    imgNode.setAttribute(ODPConvertConstants.HTML_ATTR_SRC, ODPConvertConstants.FILE_DEFAULT_CHART_IMAGE);
    imgNode.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, imageClassAttribute);
    imgNode.setAttribute(ODPConvertConstants.HTML_ATTR_ALT, ODPConvertConstants.HTML_VALUE_CHART);

    htmlElement3.appendChild(imgNode);
    htmlElement2.appendChild(htmlElement3);
    htmlElement.appendChild(htmlElement2);

    // Preserve the original draw:frame Style Attribute and Parse the draw:object's attributes
    String styleAttr = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    htmlElement = parseAttributes2(odfElement, htmlElement, context);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, styleAttr);

    // Save the draw frame classes in case we need to copy them to a text box
    StringBuilder frameClassList = new StringBuilder(128).append(ODPConvertConstants.SYMBOL_WHITESPACE);
    String classAttr = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (classAttr != null)
    {
      String[] values = classAttr.split(ODPConvertConstants.SYMBOL_WHITESPACE);
      // Skip the draw_custom-shape string
      for (int i = 1; i < values.length; i++)
      {
        frameClassList.append(values[i]);
        frameClassList.append(ODPConvertConstants.SYMBOL_WHITESPACE);
      }
    }

    String classAttribute = ODPConvertConstants.HTML_VALUE_DRAW_FRAME + ODPConvertConstants.SYMBOL_WHITESPACE
        + ODPConvertConstants.HTML_CLASS_DRAW_CHART + ODPConvertConstants.SYMBOL_WHITESPACE + ODPConvertConstants.HTML_VALUE_SVG_SHAPE
        + ODPConvertConstants.SYMBOL_WHITESPACE;

    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classAttribute);

    // We always want to generate a textbox, even if there is currently no text. This will allow the user to add text if they desire.
    String div4Style = ODPConvertConstants.HTML_VALUE_DIV4_STYLE;

    // Create the Graphic DIV
    Element htmlElement4 = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, drawFrameClass);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER, ODPConvertConstants.HTML_VALUE_LAYOUT);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_TEXT_ANCHOR_TYPE, ODPConvertConstants.HTML_VALUE_PARAGRAPH);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_PRESENTATION_CLASS, ODPConvertConstants.HTML_VALUE_OUTLINE);
    htmlElement4.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, div4Style);

    // Create the Textbox Divs
    targetNode = convertTextBoxInChart(context, odfElement, htmlElement4, htmlElement, frameClassList.toString(), inStyleProcessing);

    htmlElement2.appendChild(htmlElement4);

    convertChildren(context, odfElement, targetNode);
  }

  /*
   * Converts the Textbox for the Chart
   * 
   * @param context Conversion context
   * 
   * @param element ODF Element to process
   * 
   * @param groupNode Group node for the textbox
   * 
   * @param htmlParent HTML Parent
   * 
   * @param frameClassList Frame class list
   * 
   * @param inStyleProcessing Flag indicating whether this is in Style processing
   * 
   * @return Element Newly created target node
   */
  protected Element convertTextBoxInChart(ConversionContext context, Node element, Element groupNode, Element htmlParent,
      String frameClassList, boolean inStyleProcessing)
  {
    Document doc = (Document) context.getTarget();

    StringBuilder txtNodeStyle = new StringBuilder(128);

    // No longer calculate position, allow position to be relative to the container
    if (inStyleProcessing)
      txtNodeStyle.append(ODPConvertConstants.HTML_VALUE_DIV5_BG_STYLE);
    else
      txtNodeStyle.append(ODPConvertConstants.HTML_VALUE_DIV5_STYLE);

    // Handle wrap-option:nowrap (impacts non-line Shapes and Images only)
    String wrapOption = CSSConvertUtil.getAttributeValue(context, HtmlCSSConstants.WORD_WRAP, frameClassList);
    if (((wrapOption != null) && (wrapOption.equals(ODPConvertConstants.CSS_VALUE_NORMAL))) || (HtmlConvertUtil.isLineOrConnector(element)))
    {
      txtNodeStyle.append(HtmlCSSConstants.WHITE_SPACE + ODPConvertConstants.SYMBOL_COLON + ODPConvertConstants.CSS_VALUE_NOWRAP
          + ODPConvertConstants.SYMBOL_SEMICOLON);
    }

    // Need to parse the current Node again to extract text into a separate div - we still need add a text-box div element for the text
    Element txtBoxNode = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV, ODPConvertConstants.TEXTBOX_PREFIX);
    txtBoxNode.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.HTML_VALUE_DRAW_TEXT_BOX);
    txtBoxNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, txtNodeStyle.toString());
    txtBoxNode.setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_TEXTBOX);
    txtBoxNode.setAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL, ODFConstants.ARIA_ROLE_TEXTBOX);
    Element targetNode = (Element) groupNode.appendChild(txtBoxNode);

    // Create two div for vertical-align
    Element tableDiv = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);
    tableDiv.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.HTML_VALUE_TABLE_DIV_STYLE);
    targetNode = (Element) targetNode.appendChild(tableDiv);
    Element cellDiv = createHtmlElement(context, element, doc, ODPConvertConstants.HTML_ELEMENT_DIV);

    Attr attr = doc.createAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    String value = ODPConvertConstants.HTML_CLASS_DRAW_CHART_CLASSES + frameClassList;

    // Build the table cell div
    StringBuilder cellDivNodeStyle = new StringBuilder(128);
    cellDivNodeStyle.append(ODPConvertConstants.HTML_VALUE_CELL_DIV_STYLE);

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

  /*
   * Checks if this object is actually a Chart
   * 
   * @param context Conversion context
   * 
   * @param name xlink:href name
   * 
   * @return boolean - True if this is a Chart object
   */
  @SuppressWarnings("unchecked")
  private final boolean isChart(ConversionContext context, String name)
  {
    HashSet<String> chartNameList = (HashSet<String>) context.get(ODPConvertConstants.CONTEXT_CHART_NAMES);
    return chartNameList.contains(name);
  }
}
