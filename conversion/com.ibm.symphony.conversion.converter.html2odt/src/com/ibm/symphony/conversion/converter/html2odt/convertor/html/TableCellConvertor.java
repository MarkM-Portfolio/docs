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
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.text.OdfTextParagraph;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import symphony.org.w3c.tidy.DomUtil;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.common.HtmlTemplateCSSParser;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;

public class TableCellConvertor extends GeneralXMLConvertor
{
  public static HashSet<String> cssTextProperty = new HashSet<String>();
  static{
    cssTextProperty.add(HtmlCSSConstants.FONT_FAMILY);
    cssTextProperty.add(HtmlCSSConstants.FONT_SIZE);
    cssTextProperty.add(HtmlCSSConstants.FONT_WEIGHT);
    cssTextProperty.add(HtmlCSSConstants.COLOR);
    cssTextProperty.add(HtmlCSSConstants.FONT_STYLE);
  }
  
  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    // if existing nodes,return value from indexTable
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null)
    {
      try
      {
        parent.appendChild(odfElement);
     // if child not indexed,parse new child.
        parseOldCellContent(context, htmlElement, odfElement, XMLConvertorUtil.getCurrentFileDom(context));
        return odfElement;
      }
      catch (Exception e)
      {
        XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e);
      }
    }
    // if new nodes,return new node
    return convertNewElement(context, htmlElement, indexTable, parent);
  }

  protected OdfElement convertNewElement(ConversionContext context, Element htmlElement, HtmlToOdfIndex indexTable, OdfElement parent)
  {
    try
    {
      OdfFileDom contentDom = XMLConvertorUtil.getCurrentFileDom(context);
      OdfElement odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TABLE_TABLE_CELL));
      indexTable.addEntryByHtmlNode(htmlElement, odfElement);

      // add table cell attribute parser here
      parent.appendChild(odfElement);

      htmlElement.setAttribute("isNewDocsCell", "true");

      // Add content child,temporary
      parseCellContent(context, htmlElement, odfElement, contentDom);
      return odfElement;

    }
    catch (Exception e)
    {
      XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e);
    }

    return null;
  }

  protected void convertAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    parseTableCellStyleClassAttr(odfElement, htmlElement);
    OdfStyleFamily family = OdfStyleFamily.TableCell;

    // Add table cell attribute:
    if (odfElement.hasAttribute(ODFConstants.TABLE_NUM_COLUMNS_SPAN))
      odfElement.removeAttribute(ODFConstants.TABLE_NUM_COLUMNS_SPAN);

    if (odfElement.hasAttribute(ODFConstants.TABLE_NUM_ROWS_SPAN))
      odfElement.removeAttribute(ODFConstants.TABLE_NUM_ROWS_SPAN);

    NamedNodeMap attributes = htmlElement.getAttributes();
    Node colSpanAttr = attributes.getNamedItem(HtmlCSSConstants.COLSPAN);
    Node rowSpanAttr = attributes.getNamedItem(HtmlCSSConstants.ROWSPAN);

    if (colSpanAttr != null)
    {
      OdfName attrName = ConvertUtil.getOdfName(ODFConstants.TABLE_NUM_COLUMNS_SPAN);
      String attrValue = colSpanAttr.getNodeValue();
      if (attrValue != null && attrValue.length() > 0 && Integer.valueOf(attrValue) > 1)
        odfElement.setOdfAttributeValue(attrName, attrValue);
    }

    if (rowSpanAttr != null)
    {
      OdfName attrName = ConvertUtil.getOdfName(ODFConstants.TABLE_NUM_ROWS_SPAN);
      String attrValue = rowSpanAttr.getNodeValue();
      if (attrValue != null && attrValue.length() > 0 && Integer.valueOf(attrValue) > 1)
        odfElement.setOdfAttributeValue(attrName, attrValue);
    }

    TableConvertor.convertTableAttributes(context, htmlElement, odfElement, family);
  }

  protected void convertChildren(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    addCellDefaultStyle(htmlElement);
    super.convertChildren(context, htmlElement, odfElement);
  }
  
  private void parseTableCellStyleClassAttr(OdfElement odfElement, Element htmlElement)
  {
    String tableStyle = htmlElement.getAttribute(Constants.CLASS);
    String[] styles = tableStyle.split(" ");
    tableStyle = TableConvertor.getStyleName(styles, OdfStyleFamily.TableCell, odfElement);

    if (tableStyle != null && !tableStyle.equals(""))
    {
      OdfName attName = ConvertUtil.getOdfName(ODFConstants.TABLE_STYLE_NAME);
      odfElement.setOdfAttributeValue(attName, tableStyle);
    }
  }

  private void parseOldCellContent(ConversionContext context, Element htmlElement, OdfElement odfElement, OdfFileDom contentDom)
  {
    int length = odfElement.getChildNodes().getLength();
    for (int i = 0; i < length; i++)
    {
      Node node = odfElement.item(i);
      if ((node instanceof OdfTextParagraph) && !((OdfElement) node).hasAttribute(IndexUtil.ID_STRING) // text:p without index
      )
      {
        odfElement.removeChild(node);
        break;
        // don't preserve, just remove
      }
    }
    parseCellContent(context, htmlElement, odfElement, contentDom);
  }

  private void parseCellContent(ConversionContext context, Element htmlElement, OdfElement odfElement, OdfFileDom contentDom)
  {
    if (htmlElement.hasChildNodes())
    {
      NodeList childNodes = htmlElement.getChildNodes();
      for (int i = 0; i < childNodes.getLength(); i++)
      {
        Node childNode = childNodes.item(i);
        if (childNode instanceof Text)
        {

          String childText = childNode.getNodeValue();
          // log.info("Directly text node of table cell." + childText);
          if (childText != null && !childText.equals(""))
          {
            if (childText.equals("\u00a0"))
              childText = "";
            else
              childText = childText.replaceAll("\u00a0", "\u0020");

            Element htmlPElement = htmlElement.getOwnerDocument().createElement(HtmlCSSConstants.P);
            htmlPElement.setAttribute(IndexUtil.ID_STRING, DOMIdGenerator.generate());
            htmlElement.insertBefore(htmlPElement, childNode);
            htmlElement.removeChild(childNode);
            htmlPElement.appendChild(htmlElement.getOwnerDocument().createTextNode(childText));
          }
        }
        else
        {
          String childNodeName = childNode.getNodeName();

          if (HtmlCSSConstants.DIV.equalsIgnoreCase(childNodeName))
          {
            addCSSStyleOnParagraph(context, htmlElement, childNode);
            
            HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
            OdfElement divOdfElement = indexTable.getFirstOdfNode((Element) childNode);
            Element element = (Element) childNode;
            String _type = element.getAttribute("_type");
            if (divOdfElement == null && (_type == null || _type.length() == 0))
            {
              // removeDivNode
              DomUtil.setElementName((Element) childNodes.item(i), HtmlCSSConstants.P);

            }
          }
          else if (HtmlCSSConstants.SPAN.equalsIgnoreCase(childNodeName))
          {
            if (childNode.hasChildNodes())
            {
              Element htmlPElement = htmlElement.getOwnerDocument().createElement(HtmlCSSConstants.P);
              htmlPElement.setAttribute(IndexUtil.ID_STRING, DOMIdGenerator.generate());
              htmlElement.insertBefore(htmlPElement, childNode);
              htmlPElement.appendChild(childNode.cloneNode(true));
              htmlElement.removeChild(childNode);
            }
          }
          else if (HtmlCSSConstants.IMG.equalsIgnoreCase(childNodeName))
          {
            Element htmlPElement = htmlElement.getOwnerDocument().createElement(HtmlCSSConstants.P);
            htmlPElement.setAttribute(IndexUtil.ID_STRING, DOMIdGenerator.generate());
            htmlElement.insertBefore(htmlPElement, childNode);
            htmlPElement.appendChild(childNode.cloneNode(true));
            htmlElement.removeChild(childNode);
          }
          else if (HtmlCSSConstants.P.equalsIgnoreCase(childNodeName))
          {
            addCSSStyleOnParagraph(context, htmlElement, childNode);
          }
        }
      }
    }
  }

  private void addCellDefaultStyle(Element htmlElement)
  {
    String isNewCell = htmlElement.getAttribute("isNewDocsCell");
    if (isNewCell == null || !isNewCell.equals("true"))
      return;
    
    Element tableElement = HtmlTemplateCSSParser.getTableElement(htmlElement);
    String isImportedTable = tableElement.getAttribute("isImportedTable");
    if (isImportedTable == null || !isImportedTable.equals("true"))
      return;

    String strCurrentStyle = htmlElement.getAttribute(Constants.STYLE);
    if(strCurrentStyle == null)
      strCurrentStyle = "";

    Map<String, String> defaultCSSMap = new HashMap<String, String>();
    if(strCurrentStyle.indexOf("border")<0)
      defaultCSSMap.put("border", "0.002cm solid #000000");
    if(strCurrentStyle.indexOf("padding")<0)    
      defaultCSSMap.put("padding", "0.097cm");
    if(strCurrentStyle.indexOf("font-family")<0) 
      defaultCSSMap.put("font-family", "Arial,Verdana,sans-serif");
    if(strCurrentStyle.indexOf("font-size")<0) 
      defaultCSSMap.put("font-size", "12pt");

    htmlElement.setAttribute(Constants.STYLE, ConvertUtil.convertMapToStyle(defaultCSSMap) + strCurrentStyle.trim());
    
    htmlElement.removeAttribute("isNewDocsCell");
  }
  
  private void addCSSStyleOnParagraph(ConversionContext context, Element htmlElement, Node node)
  {
    Map<String, String> cssStyleMap = getCSSStyleOfTableCell(context, htmlElement);
    if(cssStyleMap != null)
    {
      Map<String, String> newStyleMap = new HashMap<String, String>();
      String oldStyle = ((Element) node).getAttribute(HtmlCSSConstants.STYLE);
      if(oldStyle != null && !"".equals(oldStyle))
      {
        Map<String, String> oldStyleMap = ConvertUtil.buildCSSMap(oldStyle);
        
        newStyleMap.putAll(cssStyleMap);
        newStyleMap.putAll(oldStyleMap);
      }
      else
        newStyleMap.putAll(cssStyleMap);
      
      if(HtmlCSSConstants.TH.equals(htmlElement.getNodeName()) && !newStyleMap.containsKey(HtmlCSSConstants.FONT_WEIGHT))
      {
        newStyleMap.put(HtmlCSSConstants.FONT_WEIGHT, "bold");
      }
      
      ((Element) node).setAttribute(HtmlCSSConstants.STYLE, ConvertUtil.convertMapToStyle(newStyleMap));
    }
  }
  private Map<String, String> getCSSStyleOfTableCell(ConversionContext context, Element htmlElement)
  {
    Map<String, String> thCSSMap = HtmlTemplateCSSParser.getTableMergedStyle(context, htmlElement);
    if(thCSSMap != null)
    {
      Map<String, String> cssStyleMap = new HashMap<String, String>();
      Iterator<Entry<String, String>> iterator = thCSSMap.entrySet().iterator();
      while(iterator.hasNext())
      {
        Entry<String, String> entry = iterator.next();
        if(cssTextProperty.contains(entry.getKey()))
          cssStyleMap.put(entry.getKey(), entry.getValue());
      }
      return cssStyleMap;
    }
    else
      return null;
  }

}
