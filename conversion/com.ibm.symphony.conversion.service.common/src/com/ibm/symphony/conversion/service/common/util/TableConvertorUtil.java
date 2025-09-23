/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableProperties;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.props.OdfTableColumnProperties;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;

public class TableConvertorUtil
{
  private static final Logger LOG = Logger.getLogger(TableConvertorUtil.class.getName());

  public static String[] parseNewTableColumns(ConversionContext context, OdfFileDom contentDom, OdfElement odfElement, Element htmlElement)
  {
    int iMaxColNumers = getColumnNumber(htmlElement);
    String tableWidth = getTableWidth(htmlElement);
    String[] tableColWidth = getTableColWidth(iMaxColNumers, tableWidth, htmlElement);
    appendMissingCols(contentDom, odfElement, iMaxColNumers, tableColWidth, htmlElement);
    parseTableWidth(tableWidth, tableColWidth, odfElement);
    markSideCells(htmlElement);

    return tableColWidth;
  }

  public static String[] parseOldTableColumns(ConversionContext context, OdfFileDom contentDom, OdfElement odfElement, Element htmlElement)
  {
    int iMaxColNumers = getColumnNumber(htmlElement);
    String tableWidth = getTableWidth(htmlElement);
    String[] tableColWidth = getTableColWidth(iMaxColNumers, tableWidth, htmlElement);
    insertMissingCols(context, contentDom, odfElement, iMaxColNumers, tableColWidth, htmlElement);
    parseTableWidth(tableWidth, tableColWidth, odfElement);
    markSideCells(htmlElement);

    return tableColWidth;
  }

  public static void appendMissingCols(OdfFileDom contentDom, OdfElement parent, int iNumOfCols, String[] tableColWidth, Element htmlElement)
  {
    String isHeaderColumns = htmlElement.getAttribute("isHeaderColumns");
    boolean isPreviousHeader = false;
    for (int i = 0; i < iNumOfCols; i++)
    {
      if (isHeaderColumn(i, isHeaderColumns))
      {
        if (!isPreviousHeader)
        {
          parent.appendChild(newHeaderColumnNode(contentDom));
        }
        parent.getLastChild().appendChild(newColumnNode(contentDom, tableColWidth[i]));
        isPreviousHeader = true;
      }
      else
      {
        parent.appendChild(newColumnNode(contentDom, tableColWidth[i]));
        isPreviousHeader = false;
      }
    }
  }

  public static void insertMissingCols(ConversionContext context, OdfFileDom contentDom, OdfElement parent, int iNumOfCols,
      String[] tableColWidth, Element htmlElement)
  {
    NodeList nodes = parent.getChildNodes();
    Node firstOtherNode = null;
    while (nodes.getLength() > 0)
    {
      Node node = nodes.item(0);
      if (node.getNodeName().equals(ODFConstants.TABLE_TABLE_COLUMN) || node.getNodeName().equals(ODFConstants.TABLE_TABLE_HEADER_COLUMNS))
        parent.removeChild(node);
      else
      {
        firstOtherNode = node;
        break;
      }
    }

    String isHeaderColumns = htmlElement.getAttribute("isHeaderColumns");
    boolean isPreviousHeader = false;

    for (int i = 0; i < iNumOfCols; i++)
    {
      if (isHeaderColumn(i, isHeaderColumns))
      {
        if (!isPreviousHeader)
        {
          Node newHeaderNode = newHeaderColumnNode(contentDom);
          newHeaderNode.appendChild(newColumnNode(contentDom, tableColWidth[i]));
          parent.insertBefore(newHeaderNode, firstOtherNode);
        }
        else
        {
          firstOtherNode.getPreviousSibling().appendChild(newColumnNode(contentDom, tableColWidth[i]));
        }
        isPreviousHeader = true;
      }
      else
      {
        Node newNode = newColumnNode(contentDom, tableColWidth[i]);
        parent.insertBefore(newNode, firstOtherNode);
        isPreviousHeader = false;
      }
    }
  }

  public static boolean isHeaderColumn(int colNum, String markString)
  {
    boolean isHeader = false;
    if(markString != null && colNum < markString.length())
    {
      char markChar = markString.charAt(colNum);
      if (markChar == '0')
        isHeader = true;
    }
    return isHeader;
  }

  private static OdfElement newHeaderColumnNode(OdfFileDom contentDom)
  {
    OdfElement odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TABLE_TABLE_HEADER_COLUMNS));
    return odfElement;
  }

  private static OdfElement newColumnNode(OdfFileDom contentDom, String width)
  {
    OdfElement odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TABLE_TABLE_COLUMN));
    OdfStylableElement stylable = (OdfStylableElement) odfElement;

    if (width.endsWith("%"))
    {
      width = UnitUtil.getRelativeLength(width);
      stylable.setProperty(OdfTableColumnProperties.RelColumnWidth, width);
    }
    else
    {
      if (width.endsWith("px"))
        width = UnitUtil.getCMLength(width) + "cm";

      stylable.setProperty(OdfTableColumnProperties.ColumnWidth, width);
    }

    return odfElement;
  }

  public static int getColumnNumber(Element htmlElement)
  {
    int iMaxColNumber = 0;
    NodeList trChilden = getHtmlTRNodes(htmlElement);

    if (trChilden != null && trChilden.item(0)!= null)
    {
      NodeList tdChilden = ((Element) trChilden.item(0)).getChildNodes();
      if (tdChilden != null)
      {
        iMaxColNumber = tdChilden.getLength();

        for (int i = 0; i < tdChilden.getLength(); i++)
        {
          Element tdElement = (Element) tdChilden.item(i);
          if (!tdElement.getAttribute(HtmlCSSConstants.COLSPAN).equals(""))
          {
            iMaxColNumber = iMaxColNumber + (Integer.valueOf(tdElement.getAttribute(HtmlCSSConstants.COLSPAN)).intValue() - 1);
          }
        }
      }
    }
    return iMaxColNumber;
  }

  private static int getOldOdfColumnNum(OdfElement input)
  {
    int iColumnNum = 0;
    if (input.hasChildNodes())
    {
      NodeList nodes = input.getChildNodes();
      for (int i = 0; i < nodes.getLength(); i++)
      {
        Node node = nodes.item(i);
        if (node != null)
        {
          if (node.getNodeName().equals(ODFConstants.TABLE_TABLE_COLUMN))
            iColumnNum++;
          if (node.getNodeName().equals(ODFConstants.TABLE_TABLE_HEADER_COLUMNS))
            iColumnNum += node.getChildNodes().getLength();
        }

      }
    }
    return iColumnNum;
  }

  public static boolean isColumnUpdated(ConversionContext context, OdfElement odfElement, Element htmlElement)
  {
    NodeList htmlTrChilden = getHtmlTRNodes(htmlElement);
    Node odfTrChilden = getFirstOdfTRNode(odfElement);

    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();

    NodeList htmlTdChilden = ((Element) htmlTrChilden.item(0)).getChildNodes();
    List<Node> odfTdChilden = getOdfTdNodes(odfTrChilden);
    int htmlTdChildNum = htmlTdChilden.getLength();
    int odfTdChildNum = odfTdChilden.size();
    int oldOdfColumnNum = getOldOdfColumnNum(odfElement);

    if (htmlTdChildNum != odfTdChildNum)
      return true;

    for (int i = 0; i < htmlTdChilden.getLength(); i++)
    {
      Element tdElement = (Element) htmlTdChilden.item(i);
      OdfElement odfTdElement = (OdfElement) odfTdChilden.get(i);

      if (!tdElement.getAttribute(HtmlCSSConstants.COLSPAN).equals("") || !tdElement.getAttribute(HtmlCSSConstants.ROWSPAN).equals(""))
        return false;

      String index = indexTable.getOdfIndex(tdElement);
      if (!odfTdElement.getAttribute(IndexUtil.ID_STRING).equals(index))
        return true;
    }

    if (htmlTdChildNum != oldOdfColumnNum)
      return true;

    return false;
  }

  public static void parseTableWidth(String oldWidth, String[] colWidth, OdfElement odfElement)
  {
    if (oldWidth == null)
    {
      String newWidth = UnitUtil.getSumofWidth(colWidth);
      OdfStylableElement stylable = (OdfStylableElement) odfElement;

      if (newWidth.endsWith("%"))
      {
        stylable.setProperty(OdfStyleTableProperties.RelWidth, newWidth);
      }
      else
      {
        if (newWidth.endsWith("px"))
          newWidth = UnitUtil.getCMLength(newWidth) + "cm";

        stylable.setProperty(OdfStyleTableProperties.Width, newWidth);
      }
    }
  }

  public static String getTableWidth(Element htmlElement)
  {
    String tableWidth = null;
    tableWidth = getNodeWidth(htmlElement);

    return (tableWidth.equals("")) ? null : tableWidth;
  }

  private static String[] getTableColWidth(int iNumOfCols, String tableWidth, Element htmlElement)
  {
    String[] colWidth = null;
    boolean[] htmlHeaderCol = null;

    NodeList trChilden = getHtmlTRNodes(htmlElement);

    try
    {
      if (trChilden != null)
      {
        htmlHeaderCol = new boolean[iNumOfCols];
        for (int a = 0; a < htmlHeaderCol.length; a++)
        {
          htmlHeaderCol[a] = true;
        }

        int trLength = trChilden.getLength();
        String[][] width = new String[trLength][iNumOfCols];

        for (int j = 0; j < trLength; j++)
        {

          NodeList tdChilden = ((Element) trChilden.item(j)).getChildNodes();
          int realColNum = 0;
          for (int i = 0; i < tdChilden.getLength(); i++)
          {
            Element tdElement = (Element) tdChilden.item(i);

            while (realColNum < iNumOfCols && width[j][realColNum] != null)
            {
              realColNum++;
            }

            if (realColNum >= iNumOfCols)
              break;

            if (htmlHeaderCol[realColNum] && tdElement.getNodeName().equalsIgnoreCase(HtmlCSSConstants.TD))
              htmlHeaderCol[realColNum] = false;

            String nodewidth = getNodeWidth(tdElement);
            if (nodewidth.equals(""))
              nodewidth = "-1";

            width[j][realColNum] = nodewidth;

            int colSpanNum = getColSpanNum(tdElement);
            int rowSpanNum = getRowSpanNum(tdElement);

            if (colSpanNum > 1 || rowSpanNum > 1)
            {
              for (int a = 0; a < rowSpanNum; a++)
              {
                width[j + a][realColNum] = nodewidth;

                if (colSpanNum > 1)
                {
                  nodewidth += "/";
                  nodewidth += colSpanNum;
                  width[j + a][realColNum] = nodewidth;

                  for (int b = 1; b < colSpanNum; b++)
                  {
                    width[j + a][realColNum + b] = ((j + a) == 0) ? nodewidth : "-1";

                    if (htmlHeaderCol[realColNum + b] && !htmlHeaderCol[realColNum])
                      htmlHeaderCol[realColNum + b] = false;
                  }
                }
              }
              realColNum = realColNum + colSpanNum - 1;
            }
            realColNum++;
          }
        }
        StringBuffer sbuffer = new StringBuffer();
        for (int a = 0; a < htmlHeaderCol.length; a++)
        {
          if (htmlHeaderCol[a])
          {
            sbuffer.append("0");
          }
          else
          {
            sbuffer.append("1");
          }
        }
        htmlElement.setAttribute("isHeaderColumns", sbuffer.toString());
        colWidth = caculateWidth(tableWidth, width);
      }
    }
    catch (ArrayIndexOutOfBoundsException e)
    {
      LOG.log(Level.WARNING, e.getMessage());
    }

    return colWidth;
  }

  public static int getColSpanNum(Element tdElement)
  {
    String colSpan = tdElement.getAttribute(HtmlCSSConstants.COLSPAN);

    if (colSpan != null && !colSpan.trim().equals(""))
    {
      return Integer.valueOf(colSpan).intValue();
    }

    return 1;
  }

  public static int getRowSpanNum(Element tdElement)
  {
    String rowSpan = tdElement.getAttribute(HtmlCSSConstants.ROWSPAN);

    if (rowSpan != null && !rowSpan.trim().equals(""))
    {
      return Integer.valueOf(rowSpan).intValue();
    }
    return 1;
  }

  public static String[] caculateWidth(String tableWidth, String[][] width)
  {
    if (width == null)
      return null;

    String[] tdWidth = new String[width[0].length];
    int nullCount = 0;

    for (int i = 0; i < tdWidth.length; i++)
    {
      String minWidth = null;
      for (int j = 0; j < width.length; j++)
      {
        String tmp = (width[j][i] == null || width[j][i].equals("") || width[j][i].startsWith("-1")) ? null : width[j][i];
        if (tmp != null && compareTableLength(tmp, "0") >= 0)
        {
          if (minWidth == null)
            minWidth = tmp;
          else if (compareTableLength(tmp, minWidth) < 0)
            minWidth = tmp;
        }
      }
      if (minWidth == null)
        nullCount++;

      tdWidth[i] = minWidth;
    }

    tdWidth = processDivideLength(tdWidth);

    if (nullCount > 0)
    {
      String averageWidth = "";
      if (tableWidth == null)
      {
        averageWidth = String.valueOf(100 / (tdWidth.length)) + "%";
      }
      else
      {
        String sumWidth = UnitUtil.getSumofWidth(tdWidth);
        String leftWidth = null;
        if (sumWidth == null)
          leftWidth = tableWidth;
        else
          leftWidth = UnitUtil.decreaseLength(tableWidth, sumWidth);

        averageWidth = (UnitUtil.getLength(leftWidth) / nullCount) + UnitUtil.getUnit(leftWidth);
      }
      for (int i = 0; i < tdWidth.length; i++)
      {
        if (tdWidth[i] == null)
          tdWidth[i] = averageWidth;
      }
    }

    return tdWidth;
  }

  private static String getNodeWidth(Element tdChilden)
  {
    String tdWidth = "";
    NamedNodeMap attrs = tdChilden.getAttributes();
    Node width = (attrs == null) ? null : attrs.getNamedItem(HtmlCSSConstants.WIDTH);

    if (width != null)
    {
      tdWidth = width.getNodeValue();
    }
    else
    {
      Node style = (attrs == null) ? null : attrs.getNamedItem(HtmlCSSConstants.STYLE);
      if (style != null && style.getNodeValue() != null)
      {
        Map<String, String> styleMap = ConvertUtil.buildCSSMap(style.getNodeValue().toLowerCase());
        if (styleMap != null && styleMap.containsKey(HtmlCSSConstants.WIDTH))
          tdWidth = styleMap.get(HtmlCSSConstants.WIDTH);
        // defect 47660 - different of padding between browser and symphony
        String nodeName = tdChilden.getNodeName().toLowerCase();
        if ((nodeName.equals(HtmlCSSConstants.TD) || nodeName.equals(HtmlCSSConstants.TH)) && (tdWidth.length() > 0)
            && !tdWidth.endsWith("%"))
        {
          String LRPaddingWidth = ConvertUtil.getLRPadding(styleMap);
          if (LRPaddingWidth != null && LRPaddingWidth.length() > 0)
            tdWidth = UnitUtil.addLength(tdWidth, LRPaddingWidth);
        }
        // end defect 47660
      }
    }

    return tdWidth.trim();
  }

  public static NodeList getHtmlTRNodes(Element input)
  {
    Element element = input;

    if (element.hasChildNodes())
    {
      NodeList nodes = element.getChildNodes();
      for (int i = 0; i < nodes.getLength(); i++)
      {
        Node node = nodes.item(i);
        if (node != null)
        {
          if (node.getNodeName().equals(HtmlCSSConstants.TR))
            return nodes;
          if (node.getNodeName().equals(HtmlCSSConstants.TBODY))
            return node.getChildNodes();
        }

      }
    }
    return null;
  }

  private static Node getFirstOdfTRNode(OdfElement input)
  {
    if (input.hasChildNodes())
    {
      NodeList nodes = input.getChildNodes();
      for (int i = 0; i < nodes.getLength(); i++)
      {
        Node node = nodes.item(i);
        if (node != null)
        {
          if (node.getNodeName().equals(ODFConstants.TABLE_TABLE_ROW))
            return node;
          if (node.getNodeName().equals(ODFConstants.TABLE_TABLE_HEADER_ROWS))
          {
            NodeList childHeadNodes = node.getChildNodes();
            if (childHeadNodes != null && childHeadNodes.getLength() > 0)
              return childHeadNodes.item(0);
          }
        }
      }
    }
    return null;
  }

  private static List<Node> getOdfTdNodes(Node input)
  {
    List<Node> tdList = new ArrayList<Node>();
    if (input != null && input.hasChildNodes())
    {
      NodeList nodes = input.getChildNodes();
      for (int i = 0; i < nodes.getLength(); i++)
      {
        Node node = nodes.item(i);
        if (node != null)
        {
          if (node.getNodeName().equals(ODFConstants.TABLE_TABLE_CELL))
            tdList.add(node);
        }
      }
    }
    return tdList;
  }

  public static void markSideCells(Element htmlElement)
  {
    /**
     * mark the cell which is the first child/last child of TR ,but not the real left cell/right cell of the table , by using attribute
     * isLeftCell/isRightCell = false; And mark the rowspan cell isBottomCell = true;
     */
    NodeList childTRNodes = getHtmlTRNodes(htmlElement);
    int iTRChildLength = childTRNodes.getLength();

    for (int i = 0; i < iTRChildLength; i++)
    {
      NodeList childTDNodes = childTRNodes.item(i).getChildNodes();
      int iTDChildLength = childTDNodes.getLength();

      for (int j = 0; j < iTDChildLength; j++)
      {
        Element tdChildElement = (Element) childTDNodes.item(j);
        String rowSpanValue = tdChildElement.getAttribute(HtmlCSSConstants.ROWSPAN);
        if (!rowSpanValue.equals(""))
        {
          int iSpanNum = Integer.valueOf(tdChildElement.getAttribute(HtmlCSSConstants.ROWSPAN)).intValue();
          if (j == 0)
            addSideMark(childTRNodes, i, iSpanNum, 0);
          else if (j == iTDChildLength - 1)
            addSideMark(childTRNodes, i, iSpanNum, 1);

          if (iSpanNum + i == iTRChildLength)
            tdChildElement.setAttribute("isBottomCell", "true");
        }
      }
    }
  }

  private static void addSideMark(NodeList TRNodes, int start, int spanRowNum, int mark)
  {
    // 0,isLeftCell = false;1,isRightCell = false
    int loopNumber = spanRowNum - 1;
    while (loopNumber > 0)
    {
      int rowNumber = start + loopNumber;
      Node trNode = TRNodes.item(rowNumber);
      Node node = null;
      String markString = "isLeftCell";
      if (mark == 0)
      {
        node = trNode.getFirstChild();
      }
      else if (mark == 1)
      {
        node = trNode.getLastChild();
        markString = "isRightCell";
      }

      Element tdElement = (Element) node;
      if (node != null)
      {
        tdElement.setAttribute(markString, "false");
      }

      loopNumber--;
    }
  }

  public static OdfElement parseHeaderRow(ConversionContext context, OdfFileDom contentDom, Element htmlElement, OdfElement parent)
  {
    OdfElement newParent = parent;
    if (isHeaderRow(htmlElement))
    {
      try
      {
        HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
        OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
        if (odfElement != null)
        {
          if (!odfElement.getParentNode().getNodeName().equalsIgnoreCase(ODFConstants.TABLE_TABLE_HEADER_ROWS))
          {
            Node previousNode = odfElement.getPreviousSibling();
            if (previousNode.getNodeName().equalsIgnoreCase(ODFConstants.TABLE_TABLE_HEADER_ROWS))
            {
              previousNode.appendChild(odfElement);
              newParent = (OdfElement) previousNode;
            }
            else
            {
              Node newNode = newHeaderRowNode(contentDom);
              newNode.appendChild(odfElement);
              Node refNode = odfElement.getNextSibling();
              if (refNode == null)
              {
                parent.appendChild(newNode);
                newParent = (OdfElement) parent.getLastChild();
              }
              else
              {
                parent.insertBefore(newNode, refNode);
                newParent = (OdfElement) refNode.getPreviousSibling();
              }
            }
          }
        }
        else
        {
          Node lastNode = parent.getLastChild();
          if (lastNode == null || !lastNode.getNodeName().equalsIgnoreCase(ODFConstants.TABLE_TABLE_HEADER_ROWS))
          {
            parent.appendChild(newHeaderRowNode(contentDom));
          }
          lastNode = parent.getLastChild();
          newParent = (OdfElement) lastNode;
        }
      }
      catch (Exception e)
      {
        e.printStackTrace();
      }
    }
    return newParent;
  }


  public static boolean isHeaderRow(Element htmlElement)
  {
    boolean isHeader = true;
    String role = htmlElement.getAttribute(HtmlCSSConstants.ROLE);
    if(role != null && role.equalsIgnoreCase("colheader"))
      return isHeader;

    if (htmlElement.hasChildNodes())
    {
      NodeList nodes = htmlElement.getChildNodes();
      for (int i = 0; i < nodes.getLength(); i++)
      {
        Node node = nodes.item(i);
        if (node != null)
        {
          if (node.getNodeName().equals(HtmlCSSConstants.TD))
          {
            isHeader = false;
            break;
          }
        }
      }
    }
    else
    {
      Node previousNode = htmlElement.getPreviousSibling();
      if (previousNode == null || !isHeaderRow((Element) previousNode))
      {
        isHeader = false;
      }
    }
    return isHeader;
  }

  public static OdfElement newHeaderRowNode(OdfFileDom contentDom)
  {

    OdfElement odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TABLE_TABLE_HEADER_ROWS));

    return odfElement;
  }

  private static int compareTableLength(String l1, String l2)
  {
    String data1 = l1.indexOf("/") > 0 ? l1.substring(0, l1.indexOf("/")) : l1;
    String data2 = l2.indexOf("/") > 0 ? l2.substring(0, l2.indexOf("/")) : l2;

    if (data2.equals("0"))
      data2 += UnitUtil.getUnit(data1);

    return UnitUtil.compareLength(data1, data2);
  }

  private static String[] processDivideLength(String[] input)
  {
    if (input != null)
    {
      for (int i = 0; i < input.length; i++)
      {
        String tmp = input[i];
        if (tmp != null && tmp.indexOf("/") > 0)
        {
          int splitId = tmp.indexOf("/");
          input[i] = UnitUtil.divideLength(tmp.substring(0, splitId), tmp.substring(splitId + 1, tmp.length()));
        }
      }
    }
    return input;
  }
}
