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

import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawFrameElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawGElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawImageElement;
import org.odftoolkit.odfdom.dom.element.presentation.PresentationNotesElement;
import org.odftoolkit.odfdom.dom.element.style.StyleMasterPageElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class StyleMasterPageElementConvertor extends GeneralContentHtmlConvertor
{
  private static final String CLASS = StyleMasterPageElementConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);
  
  private static final PresentationNotesConvertor pnc = new PresentationNotesConvertor();

  @SuppressWarnings("restriction")
  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    String masterPageName = (String) context.get(ODPConvertConstants.CONTEXT_DRAWPAGE_MASTER_NAME);

    StyleMasterPageElement master = (StyleMasterPageElement) odfElement;
    String styleName = master.getStyleNameAttribute();
    String styleRefName = master.getDrawStyleNameAttribute();

    styleName = ODPConvertUtil.replaceUnderlineToU(styleName);

    if (styleName.equals(masterPageName))
    {
      Node classAttr = htmlParent.getAttributes().getNamedItem(ODPConvertConstants.HTML_ATTR_CLASS);
      if (classAttr != null)
      {
        StringBuilder classBuf = new StringBuilder(128);
        classBuf.append(classAttr.getNodeValue().trim()); 
        classBuf.append(ODPConvertConstants.SYMBOL_WHITESPACE);
        classBuf.append(styleRefName);
        // The editor would like an indication if the background image is repeat in the class list
        String backgroundRepeat = CSSConvertUtil.getAttributeValue(context, ODPConvertConstants.CSS_BACKGROUND_REPEAT, styleRefName);
        if (backgroundRepeat != null && "repeat".equals(backgroundRepeat))
        {
          classBuf.append(" backgroundRepeat");
        }
        Element element = (Element) htmlParent;
        element.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classBuf.toString());
      }
      // create background div & img
      // if (Boolean.parseBoolean(bgVisible)) {
      // targetNode = appendIMGElement(targetNode, drawFill,
      // imageName, styleRefName);
      // }
      // end

      NodeList elements = master.getChildNodes();
      for (int j = 0; j < elements.getLength(); j++)
      {
        Node masterElement = elements.item(j);
        if (masterElement instanceof DrawFrameElement)
        {
          // handle this in a separate convertor (DrawFrame Convertor)
          context.put(ODPConvertConstants.CONTEXT_PARENT_ELEMENT, master);
          new DrawFrameElementConvertor().doConvertHtml(context, (OdfElement) masterElement, htmlParent);
          context.remove(ODPConvertConstants.CONTEXT_PARENT_ELEMENT);
        } 
        else if (masterElement instanceof PresentationNotesElement) 
        {
          context.put(ODPConvertConstants.CONTEXT_PARENT_ELEMENT, master);
          pnc.doConvertHtml(context, (OdfElement) masterElement, htmlParent);
          context.remove(ODPConvertConstants.CONTEXT_PARENT_ELEMENT);
        }
        else if (masterElement instanceof DrawGElement || masterElement instanceof DrawImageElement || HtmlConvertUtil.isShape(masterElement))
        {

          double parentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
          context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, 0.0);
          boolean parentInStyleProcessing = (Boolean) context.get(ODPConvertConstants.CONTEXT_IN_STYLE);
          context.put(ODPConvertConstants.CONTEXT_IN_STYLE, true);
          
          HtmlContentConvertorFactory.getInstance().getConvertor(masterElement).convert(context, masterElement, htmlParent);
          
          context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, parentSize);
          context.put(ODPConvertConstants.CONTEXT_IN_STYLE, parentInStyleProcessing);
        }
        // else
        // {
        // parse(masterElement,targetNode);
        // }
      }
    }
  }
}
