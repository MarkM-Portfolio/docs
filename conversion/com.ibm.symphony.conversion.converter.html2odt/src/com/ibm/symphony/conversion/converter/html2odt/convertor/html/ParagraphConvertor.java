/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.html;

import java.util.HashMap;
import java.util.Map;
import java.util.Stack;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSStyleConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;

public class ParagraphConvertor extends GeneralXMLConvertor
{
  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    // Remove the paragraph added in odt2html for cursor move while only div in body
    if (context.get(Constants.TARGET_ROOT_NODE).equals(ODFConstants.OFFICE_TEXT))
    {
      if (Constants.PARA_FOR_DELETE.equals(htmlElement.getAttribute("_type")) ||
          htmlElement.getAttribute("id").startsWith(Constants.PARA_FOR_DELETE_PRIFIX))
      {
        NodeList nodes = htmlElement.getChildNodes();
        if (nodes.getLength() == 1)
        {
          Node node = nodes.item(0);
          if (node instanceof Element)
          {
            if (node.getNodeName().equalsIgnoreCase(HtmlCSSConstants.BR)  )
            {
              String style = htmlElement.getAttribute(HtmlCSSConstants.STYLE);
              if( style == null || style.indexOf("break-before: page") == -1)
              {
                return;
              }
            }
          }
        }
      }
    }

    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement oldOdfEle = indexTable.getFirstOdfNode(htmlElement);
    IndexUtil.getHtmlId(htmlElement);
    super.doConvertXML(context, htmlElement, parent);

    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);

    if (oldOdfEle == null && odfElement != null)
    {
      OdfStylableElement stylable = (OdfStylableElement) odfElement;
      
      String styleString = htmlElement.getAttribute(HtmlCSSConstants.STYLE);
      if(styleString == null || styleString.length() == 0)
      {
        stylable.setStyleName("Default_20_Text");
      }
      else
      {
        // remove master-page
        OdfStyle oldStyle = CSSUtil.getOldStyle(context, stylable.getStyleName(), OdfStyleFamily.Paragraph);
        if (oldStyle != null && oldStyle.hasAttribute(ODFConstants.STYLE_MASTER_PAGE_NAME))
          oldStyle.removeAttribute(ODFConstants.STYLE_MASTER_PAGE_NAME);
      }
    }

  }

  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null)
    {
      String parentNodeName = parent.getNodeName();
      if(!(ODFConstants.TEXT_H.equals(parentNodeName) || ODFConstants.TEXT_P.equals(parentNodeName)))
        parent.appendChild(odfElement);
      return odfElement;
    }

    return XMLConvertorUtil.convertElement(context, htmlElement, parent);
  }
  
  protected void convertAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    // convert css classes, mainly for Concord document templates
    String templateKey = CSSUtil.getTemplateClassName(context, htmlElement);
    Map<String, String> cssMap = new HashMap<String, String>();
    if (templateKey != null)
    {
      Map<String, Map<String, String>> templatesCSS = (Map<String, Map<String, String>>) context.get(Constants.STYLE_DOC_TEMPLATES_SOURCE);
      Stack<String> templateKeyStack = CSSUtil.generateTemplateKeyStack(templateKey);
      while (!templateKeyStack.empty())
      {
        String tempKey = templateKeyStack.pop();
        Map<String, String> tempMap = templatesCSS.get(tempKey.toLowerCase());
        if (tempMap != null)
        {
          cssMap.putAll(tempMap);
        }
      }

      if (!cssMap.isEmpty())
      {
        CSSStyleConvertorFactory.getInstance().getConvertor(OdfStyleFamily.Paragraph)
            .convertStyle(context, htmlElement, odfElement, null, cssMap);
      }
    }

    super.convertAttributes(context, htmlElement, odfElement);
  }
}
