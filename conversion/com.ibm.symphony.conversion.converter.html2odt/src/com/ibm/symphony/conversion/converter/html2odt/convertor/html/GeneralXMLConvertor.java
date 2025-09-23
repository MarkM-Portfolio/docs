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

import java.util.ArrayList;
import java.util.List;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.text.OdfTextLineBreak;
import org.odftoolkit.odfdom.doc.text.OdfTextSpace;
import org.odftoolkit.odfdom.doc.text.OdfTextSpan;
import org.odftoolkit.odfdom.doc.text.OdfTextTab;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class GeneralXMLConvertor extends XMLConvertor
{
  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    OdfElement odfElement = convertElement(context, htmlElement, parent);
    if (odfElement != null)
    {
      convertAttributes(context, htmlElement, odfElement);
      convertChildren(context, htmlElement, odfElement);
    }
    else
    {
      convertChildrenDirect(context, htmlElement, parent);
    }
  }

  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null)
    {
      parent.appendChild(odfElement);
      return odfElement;
    }

    return XMLConvertorUtil.convertElement(context, htmlElement, parent);
    
  }

  protected void convertAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    // /TODO to determine style family
    OdfStyleFamily family = OdfStyleFamily.Text;
    if (ODFConstants.TEXT_P.equals(odfElement.getNodeName()))
    {
      family = OdfStyleFamily.Paragraph;
    }
    else if (ODFConstants.TEXT_H.equals(odfElement.getNodeName()))
    {
      family = OdfStyleFamily.Paragraph;
    }
    else if (ODFConstants.DRAW_FRAME.equals(odfElement.getNodeName()))
    {
    	family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_IMAGE.equals(odfElement.getNodeName()))
    {
    	family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_TEXT_BOX.equals(odfElement.getNodeName()))
    {
    	family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_A.equals(odfElement.getNodeName()))
    {
    	family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_CONNECTOR.equals(odfElement.getNodeName()))
    {
        family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_CUSTOM_SHAPE.equals(odfElement.getNodeName()))
    {
        family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_ELLIPSE.equals(odfElement.getNodeName()))
    {
        family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_LINE.equals(odfElement.getNodeName()))
    {
        family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_MEASURE.equals(odfElement.getNodeName()))
    {
        family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_RECT.equals(odfElement.getNodeName()))
    {
        family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_PATH.equals(odfElement.getNodeName()))
    {
        family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_G.equals(odfElement.getNodeName()))
    {
        family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_POLYGON.equals(odfElement.getNodeName()))
    {
        family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_POLYLINE.equals(odfElement.getNodeName()))
    {
        family = OdfStyleFamily.Graphic;
    }
    else if (ODFConstants.DRAW_REGULAR_POLYGON.equals(odfElement.getNodeName()))
    {
        family = OdfStyleFamily.Graphic;
    }
    XMLConvertorUtil.convertAttributes(context, htmlElement, odfElement, family);
  }

  protected void convertChildren(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    List<Node> oldChildren = getOldChildren(context, odfElement);
    
    // convert html children
    Node node = htmlElement.getFirstChild();
    while(node != null)
    {
      convertChild(context, node, odfElement, oldChildren);      
      node = node.getNextSibling();
    }
  }
  protected void convertChildrenDirect(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    //When htmlElement couldn't be convert to an odfElement, should use its parent oldChildren. 
    List<Node> oldChildren = (List<Node>) context.get("currentOldChildren");
    if(oldChildren == null)
      oldChildren = new ArrayList<Node>();
    
    // convert html children
    Node node = htmlElement.getFirstChild();
    while(node != null)
    {
      convertChild(context, node, odfElement, oldChildren);      
      node = node.getNextSibling();
    }
  }
  
  protected void convertChild(ConversionContext context, Node node, OdfElement odfElement, List<Node> oldChildren)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    if (node instanceof Element)
    {
      context.put("currentOldChildren", oldChildren);
      Element htmlChild = (Element) node;      
      Node temp = odfElement.getLastChild();
      IConvertor convertor = XMLConvertorFactory.getInstance().getConvertor(htmlChild);
      convertor.convert(context, htmlChild, odfElement);
      Node odfChild = odfElement.getLastChild();
      if (oldChildren.contains(odfChild) && temp != odfChild)
      {
        int index = oldChildren.indexOf(odfChild);
        while (++index < oldChildren.size())
        {
          Node node1 = oldChildren.get(index);
          if (!indexTable.isOdfNodeIndexed((OdfElement) node1)
              || (indexTable.isOdfNodeIndexed((OdfElement) node1) && node1.getNodeName().toLowerCase().equals("text:span")))
          {
              odfElement.appendChild(node1);
          }
          else
          {
            break;
          }
        }
      }
    }
    else if (node instanceof Text)
    {
      Text txtElement = (Text) node;
      try
      {
        String txt = txtElement.getNodeValue();
        int start = 0;
        int end = txt.indexOf("\u00a0", start);
        if (end != -1)// convert &nbsp; to odf space char
        {
          do
          {
            if (end != start)
              odfElement.appendChild(XMLConvertorUtil.getCurrentFileDom(context).createTextNode(txt.substring(start, end)));
            int spaceCount = 0;
            do
            {
              spaceCount++;
              end++;
            }
            while (end < txt.length() && txt.charAt(end) == '\u00a0');
            if (spaceCount > 0)
            {
              OdfElement space = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_S));
              space.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_C), String.valueOf(spaceCount));
              odfElement.appendChild(space);
            }
            start = end;
            end = txt.indexOf("\u00a0", start);
          }
          while (end != -1);
          odfElement.appendChild(XMLConvertorUtil.getCurrentFileDom(context).createTextNode(txt.substring(start)));
        }
        else
        {
          odfElement.appendChild(XMLConvertorUtil.getCurrentFileDom(context).createTextNode(txt));
        }
      }
      catch (Exception e)
      {
        XMLConvertorUtil.addWarning(context, (Element)node.getParentNode(), Constants.WARNING_ELEMENT, e);
      }
    }
  }
  
  protected List<Node> getOldChildren(ConversionContext context, OdfElement odfElement)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    int length = odfElement.getChildNodes().getLength();
    List<Node> oldChildren = new ArrayList<Node>();    
    for (int i = 0; i < length; i++)
    {
      Node node = odfElement.removeChild(odfElement.getFirstChild());
      append2OldChild(indexTable, oldChildren, node);
    }
    // append preserved objects before any indexable element
    for (int i = 0; i < oldChildren.size(); i++)
    {
      Node node = oldChildren.get(i);
      if (!indexTable.isOdfNodeIndexed((OdfElement) node))
      {
        odfElement.appendChild(node);
      }
      else
      {
        break;
      }
    }
    
    return oldChildren;
  }
  /**
   * below function is to append the element who is needed to be preserve to the old children list.
   * @param indexTable
   * @param oldChildren
   * @param node
   */
  private void append2OldChild(HtmlToOdfIndex indexTable, List<Node> oldChildren, Node node)
  {
    if ((node instanceof OdfTextSpan) && !indexTable.isOdfNodeIndexed((OdfElement) node)
        || node instanceof Text // Text node
        || node instanceof OdfTextLineBreak // line break
        || node instanceof OdfTextTab // text tab
        || node instanceof OdfTextSpace) // text space
    {

    }
    else
    {
      oldChildren.add(node);
    }
  }

}
