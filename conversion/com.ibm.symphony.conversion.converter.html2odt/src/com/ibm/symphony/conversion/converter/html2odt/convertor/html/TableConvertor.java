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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableProperties;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfTableProperties;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.odftoolkit.odfdom.OdfName;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.common.HtmlTemplateCSSParser;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSStyleConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.util.TableConvertorUtil;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class TableConvertor extends GeneralXMLConvertor
{
  private static final String NEWTABLENAMEPREFIX = "Table_";

  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    OdfElement odfElement = convertElement(context, htmlElement, parent);
    if (odfElement != null)
    {
      try
      {
        parseTableColumns(context, htmlElement);        
        convertAttritubes(context, htmlElement, odfElement);
        convertChildren(context, htmlElement, odfElement);
      }
      catch (Exception e)
      {
        XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e);
      }
      stripInvalidTable(odfElement,parent);
    }
  }

  private void stripInvalidTable( OdfElement table, OdfElement parent)
  {
    if(table == null) return;
    if(table.getChildNodes().getLength() == 0)
      parent.removeChild(table);
  }

  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null)
    {
      parent.appendChild(odfElement);
      htmlElement.setAttribute("isImportedTable", "true");
      return odfElement;
    }

    if (parent.getNodeName().equals("office:body"))
      parent = (OdfElement) parent.getChildNodes().item(0);

    return XMLConvertorUtil.convertElement(context, htmlElement, parent);
  }

  protected void convertAttritubes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    parseTableName(context, odfElement, htmlElement);
    parseTableStyleClassAttr(odfElement, htmlElement);

    OdfStyleFamily family = OdfStyleFamily.Table;
    convertTableAttributes(context, htmlElement, odfElement, family);
  }

  protected void convertChildren(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    convertTableCaption(context, odfElement, htmlElement);

    List<Node> oldChildren = getOldChildren(context, odfElement);
    
    // convert html children
    Node node = htmlElement.getFirstChild();
    while(node != null)
    {
      String nodeName = node.getNodeName();
      if(nodeName.equals(HtmlCSSConstants.COLGROUP) || nodeName.equals(HtmlCSSConstants.TBODY))
      {
        NodeList childs  = node.getChildNodes();
        for(int j=0; j< childs.getLength();j++)
        {
          convertChild(context, childs.item(j), odfElement, oldChildren);
        }
      }
      else
        convertChild(context, node, odfElement, oldChildren);

      node = node.getNextSibling();
    }
    parseTableAlignment(context, odfElement, htmlElement);
  }

  protected List<Node> getOldChildren(ConversionContext context, OdfElement odfElement)
  {
    List<Node> oldChildren = new ArrayList<Node>();
    int length = odfElement.getChildNodes().getLength();    
    for (int i = 0; i < length; i++)
    {
      Node node = odfElement.removeChild(odfElement.getFirstChild());
      String nodeName = node.getNodeName();
      if(nodeName.equals(ODFConstants.TABLE_TABLE_HEADER_COLUMNS) || nodeName.equals(ODFConstants.TABLE_TABLE_HEADER_ROWS))
      {
        NodeList childs = node.getChildNodes();
        for(int j=0; j< childs.getLength(); j++)
        {
          oldChildren.add(childs.item(j));
        }
      }
      else
        oldChildren.add(node);
    }
     context.put("currentOldChildren", oldChildren);
    return oldChildren;
  }

  public static void convertTableAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement, OdfStyleFamily family)
  {
    try
    {
      OdfFileDom contentDom = XMLConvertorUtil.getCurrentFileDom(context);
      String styleName = htmlElement.getAttribute(Constants.CLASS);
      String styleString = htmlElement.getAttribute(Constants.STYLE);

      CSSStyleConvertorFactory.getInstance().getConvertor(family).convertStyle(context, htmlElement, odfElement, styleName, styleString);
    }
    catch (Exception e)
    {
      XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ATTRIBUTE, e);
    }
  }

  private void parseTableStyleClassAttr(OdfElement odfElement, Element htmlElement)
  {

    // 1.if contains common class style.it seems that all the tables contain common CSS currently.
    // 2.Recaculate a new style name.

    String tableStyle = htmlElement.getAttribute(Constants.CLASS);

    String[] styles = tableStyle.split(" ");

    if (!odfElement.hasAttribute(ODFConstants.TABLE_STYLE_NAME))
    {
      tableStyle = getStyleName(styles, OdfStyleFamily.Table, odfElement);

      if (tableStyle != null && !tableStyle.equals(""))
      {
//        OdfName attName = ConvertUtil.getOdfName(ODFConstants.TABLE_STYLE_NAME);
//        odfElement.setOdfAttributeValue(attName, tableStyle);
        htmlElement.setAttribute("oldODFStyleName", tableStyle);
      }
    }
    else
    {
      htmlElement.setAttribute("oldODFStyleName", odfElement.getAttribute(ODFConstants.TABLE_STYLE_NAME));
    }
  }

  private void parseTableName(ConversionContext context, OdfElement odfElement, Element htmlElement)
  {
    // get unique table name and change the odf attribute.
    String tableName = getTableName(context, htmlElement.getAttribute(HtmlCSSConstants.NAME));
    OdfName attName = ConvertUtil.getOdfName(ODFConstants.TABLE_NAME);

    odfElement.setOdfAttributeValue(attName, tableName);
  }

  private String getTableName(ConversionContext context, String tableName)
  {
    Map<String, List<String>> tableMap = getTableMap(context);
    List<String> allTableNames = (List<String>) tableMap.get("TableNameList1");
    List<String> allUpdatedTableNames = (List<String>) tableMap.get("TableNameList2");

    if (tableName == null || tableName.equals("") || tableName.startsWith(NEWTABLENAMEPREFIX))
    {
      tableName = getNewTableName(allUpdatedTableNames, tableName);
      allUpdatedTableNames = addInNameList(allUpdatedTableNames, tableName);
    }
    else
    {
      if (allTableNames == null)
        allTableNames = addInNameList(allTableNames, tableName);
      else if (allTableNames.contains(tableName))
      {
        tableName = getNewTableName(allUpdatedTableNames, tableName);
        allUpdatedTableNames = addInNameList(allUpdatedTableNames, tableName);
      }
      else
        allTableNames = addInNameList(allTableNames, tableName);
    }

    tableMap.put("TableNameList1", allTableNames);
    tableMap.put("TableNameList2", allUpdatedTableNames);
    return tableName;
  }

  private static List<String> addInNameList(List<String> nameList, String tableName)
  {
    if (nameList == null)
      nameList = new ArrayList<String>();

    nameList.add(tableName);
    return nameList;
  }

  private static String getNewTableName(List<String> nameList, String tableName)
  {
    if (nameList == null)
      return NEWTABLENAMEPREFIX + "1";

    tableName = NEWTABLENAMEPREFIX + (nameList.size() + 1);

    if (nameList != null && nameList.contains(tableName))
    {
      for (int i = nameList.size() + 1; i > 0; i--)
      {
        if (!nameList.contains(NEWTABLENAMEPREFIX + i))
        {
          tableName = NEWTABLENAMEPREFIX + i;
          break;
        }
      }
    }
    return tableName;
  }

  private void convertTableCaption(ConversionContext context, OdfElement odfElement, Element htmlElement)
  {
    if (htmlElement.hasChildNodes())
    {
      Node firstNode = htmlElement.getFirstChild();

      if ((firstNode instanceof Element) && firstNode.getNodeName().equals(HtmlCSSConstants.CAPTION))
      {
        IConvertor convertor = XMLConvertorFactory.getInstance().getConvertor(firstNode);
        convertor.convert(context, firstNode, odfElement);

        htmlElement.removeChild(firstNode);
      }
    }
  }

  private void parseTableAlignment(ConversionContext context, OdfElement odfElement, Element htmlElement)
  {
    OdfStylableElement stylable = (OdfStylableElement) odfElement;
    if (!stylable.hasProperty(OdfStyleTableProperties.Align))
    {
      stylable.setProperty(OdfStyleTableProperties.Align, "left");
    }
    else if (stylable.getProperty(OdfStyleTableProperties.Align).equals("margins"))
    {
      String oldStyleName = htmlElement.getAttribute("oldODFStyleName");
      OdfStyle oldStyle = CSSUtil.getOldStyle(context, oldStyleName, OdfStyleFamily.Table);
      if (oldStyle != null)
      {
        double oldWidth = Length.parseDouble(oldStyle.getProperty(OdfTableProperties.Width), Unit.CENTIMETER);
        double newWidth = Length.parseDouble(stylable.getProperty(OdfTableProperties.Width), Unit.CENTIMETER);
        double d_value = oldWidth - newWidth;
        if (d_value > 0.5)
        {
          String marginRight = stylable.getProperty(OdfStyleTableProperties.MarginRight);
          double dMarginRight = (marginRight == null) ? 0 : Length.parseDouble(marginRight, Unit.CENTIMETER);
          dMarginRight += d_value;
          BigDecimal b = new BigDecimal(dMarginRight);
          dMarginRight = b.setScale(4, BigDecimal.ROUND_HALF_UP).doubleValue();

          stylable.setProperty(OdfStyleTableProperties.MarginRight, dMarginRight + "cm");
        }
      }
    }
  }

  private Map<String, List<String>> getTableMap(ConversionContext context)
  {
    Map<String, List<String>> tableMap = (Map<String, List<String>>) context.get("TableMap");
    if (tableMap == null)
    {
      tableMap = new HashMap<String, List<String>>();
      context.put("TableMap", tableMap);
    }
    return tableMap;
  }

  public static String getStyleName(String[] styles, OdfStyleFamily odfStyleFamily, OdfElement odfElement)
  {
    for (int i = 0; i < styles.length; i++)
    {
      if (!HtmlTemplateCSSParser.isTemplateStyle(styles[i], odfStyleFamily.getName()))
        return styles[i];
    }

    String nodeName = odfElement.getAttribute(ODFConstants.TABLE_NAME);
    if (nodeName == null || nodeName.equals(""))
      nodeName = null;

    return nodeName;
  }

  private void parseTableColumns(ConversionContext context, Element htmlElement)
  {
    if(!isColGroupTable(htmlElement))
      fixupColGroup(context, htmlElement);
    TableConvertorUtil.markSideCells(htmlElement);
  }

  private void fixupColGroup(ConversionContext context, Element htmlElement)
  {
    int iMaxColNumbers = TableConvertorUtil.getColumnNumber(htmlElement);
    String tableWidth = TableConvertorUtil.getTableWidth(htmlElement);
    String[] tableColWidth = getTableColWidth(context, iMaxColNumbers, tableWidth, htmlElement);
    insertColGroup(iMaxColNumbers, tableColWidth, htmlElement);
  }

  public void insertColGroup(int iNumOfCols, String[] tableColWidth, Element htmlElement)
  {
    Document htmlDoc = htmlElement.getOwnerDocument();
    Node cgNode = htmlDoc.createElement(HtmlCSSConstants.COLGROUP);
    htmlElement.insertBefore(cgNode, htmlElement.getFirstChild());
    String isHeaderColumns = htmlElement.getAttribute("isHeaderColumns");

    for (int i = 0; i < iNumOfCols; i++)
    {
      Element col = htmlDoc.createElement(HtmlCSSConstants.COL);
      cgNode.appendChild(col);
      if(TableConvertorUtil.isHeaderColumn(i, isHeaderColumns))
        col.setAttribute(HtmlCSSConstants.ROLE, "rowheader");
      String style = "width:" + tableColWidth[i] + ";";
      col.setAttribute(HtmlCSSConstants.STYLE, style);
    }
    
    String newTableWidth = UnitUtil.getSumofWidth(tableColWidth);
    String tableStyle = htmlElement.getAttribute(HtmlCSSConstants.STYLE);
    if(tableStyle == null) tableStyle= "";
    tableStyle += "width:" + newTableWidth + ";";
    htmlElement.setAttribute(HtmlCSSConstants.STYLE, tableStyle);
  }

  private String[] getTableColWidth(ConversionContext context, int iNumOfCols, String tableWidth, Element htmlElement)
  {
    String[] colWidth = null;
    boolean[] htmlHeaderCol = null;

    NodeList trChilden = TableConvertorUtil.getHtmlTRNodes(htmlElement);

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

          if (htmlHeaderCol[realColNum] && tdElement.getNodeName().equalsIgnoreCase(HtmlCSSConstants.TD) && 
              (tdElement.getAttribute(HtmlCSSConstants.CLASS) == null ||
              !tdElement.getAttribute(HtmlCSSConstants.CLASS).equalsIgnoreCase("tableHeaderCol")))
            htmlHeaderCol[realColNum] = false;

          String nodewidth = getNodeWidth(context, tdElement);
          if (nodewidth.equals(""))
            nodewidth = "-1";

          width[j][realColNum] = nodewidth;

          int colSpanNum = TableConvertorUtil.getColSpanNum(tdElement);
          int rowSpanNum = TableConvertorUtil.getRowSpanNum(tdElement);

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
      colWidth = TableConvertorUtil.caculateWidth(tableWidth, width);
    }
    return colWidth;
  }

  private String getNodeWidth(ConversionContext context, Element tdChilden)
  {
    String tdWidth = "";
    Map<String, String> styleMap = HtmlTemplateCSSParser.getTableMergedStyle(context, tdChilden);
    if (styleMap != null && styleMap.containsKey(HtmlCSSConstants.WIDTH))
      tdWidth = styleMap.get(HtmlCSSConstants.WIDTH);
    // defect 47660 - different of padding between browser and symphony
    String nodeName = tdChilden.getNodeName().toLowerCase();
    if ((nodeName.equals(HtmlCSSConstants.TD) || nodeName.equals(HtmlCSSConstants.TH)) && (tdWidth.length() > 0) && !tdWidth.endsWith("%"))
    {
      String LRPaddingWidth = ConvertUtil.getLRPadding(styleMap);
      if (LRPaddingWidth != null && LRPaddingWidth.length() > 0)
        tdWidth = UnitUtil.addLength(tdWidth, LRPaddingWidth);
    }

    return tdWidth.trim();
  }

  private boolean isColGroupTable(Element tableElement)
  {
    Node firstChild = tableElement.getFirstChild();
    if(firstChild != null && firstChild.getNodeName().equals(HtmlCSSConstants.COLGROUP))
      return true;
    return false;
  }

}
