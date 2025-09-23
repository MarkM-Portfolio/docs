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
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class PresentationElementConvertor extends AbstractContentHtmlConvertor
{
  private static final String CLASS = PresentationElementConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  @SuppressWarnings("restriction")
  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    Element targetNode = addHtmlElement(odfElement, htmlParent, context);

    targetNode = parseAttributes(odfElement, targetNode, context);

    Map<String, String> headFootMap = new HashMap<String, String>();

    context.put(ODPConvertConstants.CONTEXT_DRAWPAGE_HEAD_FOOT, headFootMap);

    NodeList children = odfElement.getChildNodes();

    // first convert all the headers and footers nodes.
    for (int j = 0; j < children.getLength(); j++)
    {
      Node e = children.item(j);
      if(!(e instanceof OdfElement))
    	  continue;
      OdfElement node = (OdfElement) e;
      if (!ODPConvertConstants.ODF_ELEMENT_DRAWPAGE.equalsIgnoreCase(node.getNodeName()))
      {
        // header or footer nodes.
        //<presentation:date-time-decl presentation:name="dtd1" presentation:source="fixed">Fixed FOOTER Date</presentation:date-time-decl>
        String headOrFootName = node.getAttribute(ODPConvertConstants.ODF_ELEMENT_PRESENTATION_NAME);
        if (headOrFootName != null)
          headFootMap.put(headOrFootName, node.getTextContent());
        String headOrFootStyle = node.getAttribute(ODPConvertConstants.ODF_ATTR_DATE_STYLE_NAME);
        if (headOrFootStyle != null)
          headFootMap.put(headOrFootName + ODPConvertConstants.HTML_ATTR_STYLE, headOrFootStyle);
        if (null != node.getTextContent())
          headFootMap.put(headOrFootName + ODPConvertConstants.TEXT, node.getTextContent());
      }
    }
    // then convert the draw:page elements.

    NodeList drawPageList = ((OdfElement) odfElement).getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_DRAWPAGE);

    for (int j = 0; j < drawPageList.getLength(); j++)
    {
      OdfElement node = (OdfElement) drawPageList.item(j);
      context.put(ODPConvertConstants.CONTEXT_DRAWPAGE_PAGE_NUMBER, String.valueOf(j + 1));
      HtmlContentConvertorFactory.getInstance().getConvertor(node).convert(context, node, targetNode);
    }

    //we have to put all lst- style to the end of style list, due to lst- priority is higher than all master style
    Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
	if(styles != null){
		Map<String, Map<String, String>> temp = new HashMap<String, Map<String, String>>();
		Iterator<Map.Entry<String,Map<String,String>>> itr = styles.entrySet().iterator();
		while(itr.hasNext()){
			Map.Entry<String,Map<String,String>> entry = itr.next();
			if(entry.getKey().startsWith(".lst") || entry.getKey().startsWith(".IL")){
				itr.remove();
				temp.put(entry.getKey(), entry.getValue());
			}
		}
		styles.putAll(temp);
	}
    
    context.remove(ODPConvertConstants.CONTEXT_DRAWPAGE_PAGE_NUMBER);
    context.remove(ODPConvertConstants.CONTEXT_DRAWPAGE_HEAD_FOOT);
  }

}
