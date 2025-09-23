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

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.html2odp.style.CSSStyleConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odp.style.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.CSSProperties;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class TextParagraphConvertor extends AbstractODPConvertor
{
 
  @SuppressWarnings("restriction")
  @Override
  protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
	  try{
	    Element htmlElement = (Element) htmlNode;
	    OdfElement odfElement = convertElement(context, htmlElement);
	    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
	    indexTable.addEntryByHtmlNode(htmlElement, odfElement);
	
	    // Remove any space placeholder children
	    boolean isEmpty = removeSpacePlaceholder(htmlNode);
	    
	    // check to see if we can just discard this paragraph. If the import code marked this as
	    // removal-candidate.
	    String candidate = htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_REMOVAL_CANDIDATE);
	    if ( candidate != null && !(candidate.length() == 0) && isEmpty )
	    {
	      return;
	    }
	
	    // the calls below might change the parent font size so save it first,
	    // then restore it after this node's children are converted.
	    Double tempParentTextSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
	
	    // should pass the family in to parseAttributes
	    parseAttributes(context, htmlNode, odfElement, odfParent);
	
	    // mich - defect 4695, on export, font-size either from an inline style of P tags, or a CSS class referenced by P tags must
	    // be taken in account
	    setParentFontSizeContext(context, odfElement);
	
	    odfParent.appendChild(odfElement);
	    convertChildren(context, htmlElement, odfElement);
	
	    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE,tempParentTextSize);
	  } catch (Exception e){
			String errorClass = this.getClass().getName();
			System.out.println("=====Error occur in: "+ errorClass);
			System.out.println("=====Follow content maybe lost: "+getTextContent(htmlNode,""));
			e.printStackTrace();
	  };
  }

  @SuppressWarnings("restriction")
  protected void parseAttributes(ConversionContext context, Element htmlNode, OdfElement element, OdfElement odfParent)
  {
    NamedNodeMap attributes = htmlNode.getAttributes();

    for (int i = 0; i < attributes.getLength(); i++)
    {
      Node attr = attributes.item(i);
      String nodeName = attr.getNodeName();
      String nodeValue = attr.getNodeValue();
      if (nodeName.equals(ODPConvertConstants.HTML_ATTR_FIELD))
      {
        context.put(ODPConvertConstants.CONTEXT_FIELD_BOOLEAN_ATTRIBUTE, true);
        context.put(ODPConvertConstants.CONTEXT_FIELD_TYPE, nodeValue);
      }
      if (ContentConvertUtil.isPreservedAttribute(nodeName))
      {
        String qName = ContentConvertUtil.convertToQName(nodeName);
        String val = element.getAttribute(qName);
        if (val.compareTo(nodeValue) != 0)
        {
          // If a table has been copied and pasted in concord, we don't want to omit this. Overall not
          // sure why this was included for default cell style name. If something comes up revisit but
          // for now comment out this check. Predefined and Custom styles have been modified to handle as well.
          /*
           * if (qName.equals(ODPConvertConstants.ODF_STYLE_DEFAULT_CELL_STYLE_NAME) && (val == null || "".equals(val))) continue;
           */
          // if(!qName.equals("presentation:class") && !nodeValue.equals("group"))
          element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, nodeValue);
        }
      }
      else if (ODPConvertConstants.HTML_ATTR_STYLE.equals(nodeName))
      {
        String styleName = getStyleNameFromClass(attributes);
        if(styleName.startsWith("MT_") || styleName.startsWith("MP_"))
        	styleName = "P";
        String styleString = nodeValue;

        // If inline style contains line-height
        if (styleString.contains(ODPConvertConstants.CSS_LINE_HEIGHT)) 
        {
          String [] styles = styleString.split(ODPConvertConstants.SYMBOL_SEMICOLON);
          styleString = "";
          for (int j = 0; j < styles.length; j++) {
            if (!styles[j].trim().startsWith(ODPConvertConstants.CSS_LINE_HEIGHT))
              styleString += styles[j] + ODPConvertConstants.SYMBOL_SEMICOLON;
          }
          String customStyle = htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE);
          if (customStyle.contains("abs-"+ODPConvertConstants.CSS_LINE_HEIGHT)) 
          {
        	CSSProperties absLHcp = new CSSProperties(htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
          	String lhd = absLHcp.getProperty("abs-"+ODPConvertConstants.CSS_LINE_HEIGHT);
        	styleString += ODPConvertConstants.CSS_LINE_HEIGHT + ":" + lhd + ODPConvertConstants.SYMBOL_SEMICOLON;
          }
        }
        CSSStyleConvertorFactory.getInstance().getConvertor(OdfStyleFamily.Paragraph).convertStyle(context, htmlNode, element, styleName, styleString);
      }
    }
  }

  /**
   * Sets the font size of the current element in the context so it's available when converting the children, thus the font size
   * being referred to as the parent font size.
   *
   * @param context
   *          - conversion context
   * @param odfElement
   *          - odf element to set the font size of
   */
  @SuppressWarnings("restriction")
  private void setParentFontSizeContext(ConversionContext context, OdfElement odfElement)
  {
    String styleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME);
    if (styleName == null || styleName.length() == 0)
    {
      return;
    }
    OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
    Double parentFontSize = CSSUtil.getTextSize(contentDom.getOdfDocument(), styleName, OdfStyleFamily.Paragraph);
    if (parentFontSize != null)
    {
      context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, parentFontSize);
    }
  }

}
