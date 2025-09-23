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

import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.dom.element.table.TableTableColumnElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class TableColumnElementConvertor extends TableRowOrColumnElementConvertor
{
  protected Element addHtmlElement(Node node, Node htmlParentNode, ConversionContext context)
  {
	Document doc = (Document) context.getTarget();
	Element htmlElement = createHtmlElement(context, node, doc, HtmlCSSConstants.COL);
	htmlParentNode.appendChild(htmlElement);
    return htmlElement;
  }
  
  protected Element parseAttributes2(Node node, Element htmlNode, ConversionContext context)
  {
    OdfDocument odfDoc = (OdfDocument) context.getSource();
    NamedNodeMap attrs = node.getAttributes();
    if (attrs == null)
      return htmlNode;
    List<Node> classList = getClassElements(node, odfDoc, context);
    if (classList != null && !classList.isEmpty())
    {
      parseClassAttribute(classList, null, null, context);
    }
    Map<String, Map<String, String>> contentStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
    if(contentStyles != null)
    {
      String styleName = CSSConvertUtil.getStyleName(((TableTableColumnElement)node).getTableStyleNameAttribute());
      Map<String, String> map = contentStyles.get(styleName);
      if ((map != null) && map.containsKey(ODPConvertConstants.SVG_ATTR_WIDTH))
      {
        String value = map.get(ODPConvertConstants.SVG_ATTR_WIDTH);
        htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, ODPConvertConstants.SVG_ATTR_WIDTH+":"+value);
      }
    }
    
    return htmlNode;
  }
}
