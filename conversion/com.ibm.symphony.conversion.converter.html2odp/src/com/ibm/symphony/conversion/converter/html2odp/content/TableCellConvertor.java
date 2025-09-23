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
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

import symphony.org.w3c.tidy.DomUtil;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextParagraph;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.TableConvertorUtil;

public class TableCellConvertor extends GeneralODPConvertor
{
  private static final String CLASS = TableCellConvertor.class.getName();

  // private static final Logger log = Logger.getLogger(CLASS);

  protected void doContentConvert(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    String odfNodeName = getOdfNodeName(htmlElement);
    if (!ContentConvertUtil.NOT_FOUND.equals(odfNodeName))
    {
      HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
      OdfElement odfElement = null;
      boolean isNewCell = false;
      if (indexTable.isHtmlNodeIndexed(htmlElement))
      {
        try
        {
          OdfFileDom contentDom = (OdfFileDom) context.get("target");
          odfElement = indexTable.getFirstOdfNode(htmlElement);
          parseOldCellContent(context, htmlElement, odfElement, contentDom);
        }
        catch (Exception e)
        {
          String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".doContentConvert");
          ODPCommonUtil.logException(context, Level.WARNING, message, e);
        }
      }
      else
      {
        isNewCell = true;
        odfElement = convertNewElement(context, htmlElement, indexTable, parent);
      }
      convertAttritubes(context, htmlElement, odfElement);

      // save old context values that could be changed
      Double originalFontSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
      Object originalParentWidth = (Object) context.get(ODPConvertConstants.CONTEXT_PARENT_WIDTH);

      // set cell width in the context - needed to convert values that are in % to cm's (e.g. margin-left)
      calculateCellWidthForChildren(context, htmlElement);

      calculateFontSizeForChildren(context, htmlElement, odfElement);
      convertChildren(context, htmlElement, odfElement);
      if(isNewCell)
        fixupCoveredCell(context, htmlElement, parent);

      // Put old context values back
      context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, originalFontSize);
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, originalParentWidth);
    }
    else
    {
      convertChildren(context, htmlElement, parent);
    }
    // remove the list clone map to make sure it isn't used outside the table cell.
    context.remove(ODPConvertConstants.CONTEXT_EXPORT_LIST_CLONE_MAP);
    // remove the list suffix to ensure we use a new one for the next container
    context.remove(ODPConvertConstants.CONTEXT_LIST_STYLE_SUFFIX);
  }

  @SuppressWarnings("restriction")
  protected OdfElement convertNewElement(ConversionContext context, Element htmlElement, HtmlToOdfIndex indexTable, OdfElement parent)
  {
    try
    {
      OdfFileDom contentDom = (OdfFileDom) context.get("target");
      OdfElement odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TABLE_TABLE_CELL));
      ArrayList<OdfElement> elements = ContentConvertUtil.processPreserveOnlyElements(contentDom, htmlElement);
      if (elements != null)
      {
        for (int i = 0; i < elements.size(); i++)
        {
          OdfElement preserveOnly = (OdfElement) elements.get(i);
          odfElement.appendChild(preserveOnly);
        }
      }
      indexTable.addEntryByHtmlNode(htmlElement, odfElement);

      // add table cell attribute parser here
      parent.appendChild(odfElement);

      // Add content child,temporary
      parseCellContent(context, htmlElement, odfElement, contentDom);
      return odfElement;

    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".convertNewElement");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);
    }

    return null;
  }

  /**
   * Method to determine the parent font size for any text or other elements that could be contained within the cell. Need to ensure the
   * original parent font size is saved off before calling this method as it could get overwritten.
   */
  @SuppressWarnings({ "unchecked", "restriction" })
  private void calculateFontSizeForChildren(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    Map<String, OdfElement> stylesMap = (Map<String, OdfElement>) context.get(ContentConvertUtil.ODP_STYLES_MAP);

    // mich - defect 9248, retrieves a list of style names sorted in order of css effective precedence
    List<String> styleNames = getCellStyleNames(context, htmlElement, odfElement, stylesMap);

    try
    {
      for (String styleName : styleNames)
      {
        styleName = ContentConvertUtil.getOriginalNameFromCDUPStyle(styleName);
        if (stylesMap.containsKey(styleName))
        {
          OdfStyle style = (OdfStyle) stylesMap.get(styleName);
          OdfStylePropertiesBase textProps = style.getPropertiesElement(OdfStylePropertiesSet.TextProperties);

          if (textProps != null)
          {
            String fontsize = textProps.getAttribute(ODPConvertConstants.ODF_ATTR_FONT_SIZE);

            if (fontsize != null && fontsize.length() > 0)
            {
              fontsize = fontsize.replace("pt", "");
              Double size = Double.parseDouble(fontsize);
              context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, size);
              break;
            }
          }
        }
      }
    }
    catch (NumberFormatException nfe)
    {
      ODPCommonUtil.logException(context, Level.WARNING, ODPCommonUtil.LOG_UNABLE_TO_PARSE_CELL, nfe);
    }
  }

  /**
   * Returns a list of style names in order of css style effective precedence in the scope of table cells.
   * 
   * @param context
   *          - the current conversion context
   * @param htmlElement
   *          - current html element being exported
   * @param odfElement
   *          - current odf element being converted
   * @return the list of style names
   */
  @SuppressWarnings("restriction")
  private List<String> getCellStyleNames(ConversionContext context, Element htmlElement, OdfElement odfElement,
      Map<String, OdfElement> stylesMap)
  {
    ArrayList<String> styleNames = new ArrayList<String>();

    String tableCellStyle = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    String[] tableStyles = tableCellStyle.split(ODPConvertConstants.SYMBOL_WHITESPACE);

    // first picks the style name set as the table:style-name attribute of the cell element
    boolean foundCellStyleName = false;
    String cellStyleNameAttr = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_TABLE_STYLE_NAME);
    for (String name : tableStyles)
    {
      // styles may have been made unique by appending some random numbers, thus the check here with startsWith
      if (name.startsWith(cellStyleNameAttr))
      {
        styleNames.add(name);
        foundCellStyleName = true;
        break;
      }
    }
    // in some cases, the name of this style changes completely, and it's important that it comes first
    // if none could be found so far, this below tries to find it using the parent node name
    if (!foundCellStyleName)
    {
      for (String name : tableStyles)
      {
        if (stylesMap.containsKey(name))
        {
          OdfStyle style = (OdfStyle) stylesMap.get(name);
          if (style.getParentNode().getNodeName().equals(ODPConvertConstants.ODF_STYLE_AUTO))
          {
            styleNames.add(name);
            break;
          }
        }
      }
    }

    // then picks the other styles in reverse order to follow the css effective precedence
    int listSize = tableStyles.length;
    for (int i = listSize - 1; i >= 0; i--)
    {
      String name = tableStyles[i];
      if (!styleNames.contains(name))
      {
        styleNames.add(name);
      }
    }

    return styleNames;
  }

  /**
   * Method to determine the cell width for this cell. Needed to convert child attributes that are in percentages to centimeters, such as
   * margin-left. The resulting width is stored in the context for children to use.
   * 
   * @param context
   *          - conversion context
   * @param htmlElement
   *          - current <td>element
   * 
   */
  private void calculateCellWidthForChildren(ConversionContext context, Element htmlElement)
  {
    // find out table width
    String tableWidth = (String) context.get(ODPConvertConstants.CONTEXT_TABLE_WIDTH);
    if (tableWidth == null)
    {
      tableWidth = (String) context.get(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
      if (tableWidth == null) // shouldn't be null, but just to be safe
        return;
    }

    double tableWidth_d = Measure.extractNumber(tableWidth);

    // Get the width of the cell
    // TODO: will need to update this when we support merged columns - this array in the context
    // has the default width of each column, but we are not handling rowspans or colspans at all

    String[] tableColWidth = (String[]) context.get(ODPConvertConstants.CONTEXT_TABLE_CELL_WIDTH_ARRAY);
    if (tableColWidth != null && tableColWidth.length > 0)
    {
      // first figure out what column we are currently in
      int currentColumn = 0;
      Node prevSib = htmlElement.getPreviousSibling();
      while (prevSib != null)
      {
        currentColumn++;
        prevSib = prevSib.getPreviousSibling();
      }

      // now set the parent width in the context to be the cell width (cell-width-percent * table-width)
      double cellWidth_d = Measure.extractNumber(tableColWidth[currentColumn]);

      Double parentWidth_d = (cellWidth_d / 100) * tableWidth_d;
      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, parentWidth_d.toString() + "cm");
    }
  }

  protected void convertAttritubes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    OdfStyleFamily family = OdfStyleFamily.TableCell;

    // Add table cell attribute:
    NamedNodeMap attributes = htmlElement.getAttributes();
    Node colSpanAttr = attributes.getNamedItem(HtmlCSSConstants.COLSPAN);
    Node rowSpanAttr = attributes.getNamedItem(HtmlCSSConstants.ROWSPAN);

    if (colSpanAttr != null)
    {
      OdfName attrName = ConvertUtil.getOdfName(ODFConstants.TABLE_NUM_COLUMNS_SPAN);
      String attrValue = colSpanAttr.getNodeValue();
      odfElement.setOdfAttributeValue(attrName, attrValue);
    }

    if (rowSpanAttr != null)
    {
      OdfName attrName = ConvertUtil.getOdfName(ODFConstants.TABLE_NUM_ROWS_SPAN);
      String attrValue = rowSpanAttr.getNodeValue();
      odfElement.setOdfAttributeValue(attrName, attrValue);
    }

    TableConvertor.convertTableAttributes(context, htmlElement, odfElement, family);
  }

  protected void convertChildren(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    TableConvertor.convertTableChildren(context, htmlElement, odfElement);
  }

  @SuppressWarnings("restriction")
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
          // log.fine("Directly text node of table cell." + childText);
          if (childText != null && childText.length() > 0)
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
            HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
            OdfElement divOdfElement = indexTable.getFirstOdfNode((Element) childNode);
            if (divOdfElement == null)
            {
              // removeDivNode
              DomUtil.setElementName((Element) childNodes.item(i), HtmlCSSConstants.P);

            }
          }
          else if (HtmlCSSConstants.SPAN.equalsIgnoreCase(childNodeName) && !isListSpan(childNode))
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
        }
      }
    }
  }

  /**
   * Check if the htmlElement is a SPAN that was converted from a text:list (due to text:list-header optimization logic)
   * 
   * @param htmlElement
   *          - the SPAN
   * @return true if this span is a converted text:list
   */
  private boolean isListSpan(Node htmlElement)
  {
    String classValue = ((Element) htmlElement).getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if (classValue.contains(ODPConvertConstants.HTML_CLASS_TEXT_LIST))
      return true;
    else
      return false;
  }
  
  private void fixupCoveredCell(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    Document htmlDoc = htmlElement.getOwnerDocument();
    int colSpanNum = TableConvertorUtil.getColSpanNum(htmlElement);
    int rowSpanNum = TableConvertorUtil.getRowSpanNum(htmlElement);
    if(colSpanNum > 1)
    {
      if(rowSpanNum > 1)
      {
        createCoveredTD(htmlElement, htmlElement.getParentNode(), colSpanNum - 1, true);
        convertNextCoveredCell(context, htmlElement, odfElement, colSpanNum - 1 );
        createRowCoveredTD(htmlElement, rowSpanNum, colSpanNum);
      }
      else
      {
        createCoveredTD(htmlElement, htmlElement.getParentNode(), colSpanNum - 1, true);
        convertNextCoveredCell(context, htmlElement, odfElement, colSpanNum - 1 );
      }
    }
    else if(rowSpanNum > 1)
    {
      createRowCoveredTD(htmlElement, rowSpanNum, 1);
    }
  }
 
  private void convertNextCoveredCell(ConversionContext context, Element htmlElement, OdfElement odfElement, int num)
  {
    Node next;
    for(int i=0;i<num;i++)
    {
      next = htmlElement.getNextSibling();
      IConvertor convertor = ODPConvertFactory.getInstance().getConvertor(next);
      convertor.convert(context, next, odfElement);
    }
  }

  private void createRowCoveredTD(Element htmlElement, int rowSpanNum, int colSpanNum)
  {
    int curPosNum = getPreSiblingNum(htmlElement);
    Node curTR = htmlElement.getParentNode();
    Node tr = curTR.getNextSibling();
    for(int i=1;i<rowSpanNum;i++)
    {
      Node refNode = tr.getFirstChild();
      for(int j = 0;j<curPosNum;j++)
      {
        if(refNode == null)
          break;
        
        refNode = refNode.getNextSibling();
      }
      createCoveredTD(refNode, tr, colSpanNum, false);
      tr = tr.getNextSibling();      
    }    
  }
  
  private void createCoveredTD(Node refNode, Node parent, int num, boolean after)
  {
    if(parent == null)
      return;

    if(refNode!= null && after)
      refNode = refNode.getNextSibling();

    for(int i= 0;i<num;i++)
    {
      Node CTD = parent.getOwnerDocument().createElement("ctd");
      if(refNode != null)
        parent.insertBefore(CTD, refNode);
      else
        parent.appendChild(CTD);
    }
  }
  
  private int getPreSiblingNum(Node htmlNode)
  {
    int count = 0;
    while(htmlNode.getPreviousSibling() != null)
    {
      count++;
      htmlNode = htmlNode.getPreviousSibling();
    }
    return count;
  }

}
