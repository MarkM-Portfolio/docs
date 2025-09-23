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

import java.util.ArrayList;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odp.style.CSSStyleConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;

public class GeneralODPConvertor extends AbstractODPConvertor
{
  private static final String CLASS = GeneralODPConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  @SuppressWarnings("restriction")
  @Override
  protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
    String nodeName = htmlNode.getNodeName();
    if (nodeName.equals(ODFConstants.HTML_ELEMENT_LABEL))
    {
      // Skip labels - they are processed in conjunction with the html they are associated with
      return;
    }
    
    String odfNodeName = getOdfNodeName(htmlNode);
    if (odfNodeName.equals(ODPConvertConstants.ODF_ELEMENT_TEXTSPAN)
        && odfParent.getNodeName().equals(ODPConvertConstants.ODF_ELEMENT_TEXT_A))
    {
      // We want to ignore the span and put the text item directly under the A. Symphony doesn't seem to like
      // the span element surrounding the text - this causes the link not to show up in the editor.
      this.convertChildren(context, (Element) htmlNode, odfParent);
    }
    else if (!ContentConvertUtil.NOT_FOUND.equals(odfNodeName))
    {

      OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);

      OdfElement odfElement = null;
      HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
      if (indexTable.isHtmlNodeIndexed((Element) htmlNode))
      {
        odfElement = indexTable.getFirstOdfNode((Element) htmlNode);
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
        if (!IndexUtil.NO_ID_NODES.contains(htmlNode.getNodeName()))
        {
          indexTable.addEntryByHtmlNode((Element) htmlNode, odfElement);
        }
      }
      // 47481
      // Element htmlElement = (Element) htmlNode;
      // String className = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      // if (className != null && className.equals(ODPConvertConstants.NEWTEXTCONTENT))
      // context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, new Double(18));

      // Remove any space placeholder children
      if (htmlNode.getNodeName().equals(HtmlCSSConstants.SPAN))
      {
        removeSpacePlaceholder(htmlNode);
      }

      // Make sure we found an ODF Element (today we are only looking at the content.xml in HtmlToOdfIndex, not styles.xml)
      if (odfElement != null)
      {
        parseAttributes(context, htmlNode, odfElement, odfParent);
      }
      else
      {
        Element htmlElement = (Element) htmlNode;
        String drawLayer = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_DRAW_LAYER);
        if (!ODPConvertConstants.HTML_VALUE_BACKGROUND.equalsIgnoreCase(drawLayer))
        {
          ODPCommonUtil.logMessage(Level.WARNING, ODPCommonUtil.LOG_NO_MATCHING_ODF_NODE);
        }
        else
        {
          log.fine("ODF node matching the HTML background object node was not located.  This is likely due to it being in the styles.xml.");
        }
        return;
      }

      // krings - check to see if this is a field... if so call utility routine for special processing
      // We do not want to append the span if it is a field, otherwise it will appear twice in Symphony (once for the span and once for the field)
      boolean isField = ContentConvertUtil.isField(context);
      if (isField)
        ContentConvertUtil.handleFields(context, odfParent, odfElement);
      else
        odfParent.appendChild(odfElement);
      this.convertChildren(context, (Element) htmlNode, odfElement);
    }
    else
    {
      String drawFrameClasses = htmlNode.getAttribute("class");
      if (drawFrameClasses.contains("draw_frame_classes"))
        // Add the styles to the draw_frame
        updateDrawFrameStyle(context, htmlNode, odfParent, drawFrameClasses);
      this.convertChildren(context, (Element) htmlNode, odfParent);
    }

    // convert children.
  }

  @SuppressWarnings({ "restriction", "unchecked" })
  /**
   * Update the draw:style if necessary.
   * @param context - Conversion context
   * @param htmlNode - current html node being processed
   * @param odfElement - corresponding ODF element
   * @param drawFrameClasses - list of class associated with draw:frame
   */
  private void updateDrawFrameStyle(ConversionContext context, Element htmlNode, OdfElement odfElement, String drawFrameClasses)
  {
    String[] classes = drawFrameClasses.split(ODPConvertConstants.SYMBOL_WHITESPACE);
    for (int i = 0; i < classes.length; i++)
    {
      // Check to see if there is a gr style
      if (classes[i].startsWith(ODPConvertConstants.HTML_ELEMENT_STYLE_GR))
      {
        OdfElement odfParent = (OdfElement) odfElement.getParentNode();
        // Get the parent node, which should be the draw:frame
        if ((null != odfParent) && odfParent.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ELEMENT_DRAWFRAME))
        {
          String drawStyleName = odfParent.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STYLE_NAME);
          // If the draw:style name is not set, or it is set to a CDUP, set it.
          if (drawStyleName == null || drawStyleName.length() == 0 || drawStyleName.contains(ODPConvertConstants.STYLE_COPY_IDENTIFIER))
          {
            Map<String, String> cssMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
            String grStyleName = classes[i];
            String styleString = cssMap.get(ODPConvertConstants.SYMBOL_DOT + grStyleName);
            CSSStyleConvertorFactory.getInstance().getConvertor(OdfStyleFamily.Graphic)
                .convertStyle(context, htmlNode, odfParent, grStyleName, styleString);
            String presStyleName = odfParent.getAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
            if (presStyleName != null)
              odfParent.removeAttribute(ODPConvertConstants.ODF_ATTR_PRE_STYLE_NAME);
            break;
          }
        }
      }
    }
  }

}
