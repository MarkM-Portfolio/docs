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

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableColumnElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableCellElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfTableColumnProperties;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.converter.html2odp.style.CSSStyleConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odp.styleattr.PropertyConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odp.template.TableTemplateParser;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.util.TableConvertorUtil;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class TableConvertor extends AbstractODPConvertor
{

  protected void doContentConvert(ConversionContext context, Element htmlElement, OdfElement parent)
  {
	try{
		// if existing nodes,return value from indexTable
		setTableContext(context, parent);
		HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
		OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
		OdfFileDom contentDom = (OdfFileDom) context.get("target");
		if (odfElement != null)
		{
			// Update any accessibility information that might have changed
			setAccessibilityInfo(context, htmlElement, parent);
			// add table columns
			convertAttritubes(context, htmlElement, odfElement, parent);
			updateWidthInHtml(context, htmlElement);
			if(!checkTableColGroup(context,contentDom, htmlElement, odfElement)){
				String[] tableColWidth = TableConvertorUtil.parseOldTableColumns(context, contentDom, odfElement, htmlElement);
				//TODO:  will need to update this when we support merged columns - this array in the context 
				//       has the length of each column, but we are not handling rowspans or colspans at all 
				//       The hope was that the TableConvertorUtil could give us the widths of all the cells, but
				//       that is common code, so we need to determine how to fix this (defect 10692)
				context.put(ODPConvertConstants.CONTEXT_TABLE_CELL_WIDTH_ARRAY, tableColWidth);    	  
			}
			
			Node firstHTMLChild = htmlElement.getFirstChild();
			
			if (firstHTMLChild != null && firstHTMLChild.getNodeName().equals(HtmlCSSConstants.TBODY))
				convertChildren(context, (Element) firstHTMLChild, odfElement);
			else
				convertChildren(context, htmlElement, odfElement);
			
			// if (TableConvertorUtil.isColumnUpdated(context, odfElement, htmlElement))
			// Always update the column width and not just when new columns are added
			updateTableColumnWidth(context, odfElement);
		}
		else
		{
			convertNewElement(context, htmlElement, indexTable, parent);
			odfElement = indexTable.getFirstOdfNode(htmlElement);
			// Add any accessibility information provided
			setAccessibilityInfo(context, htmlElement, parent);
		}
		convertTableTemplateStyles(context, htmlElement, odfElement);
		// TODO: reCaculate the style name of each node in the table for duplicate.
		context.remove(ODPConvertConstants.CONTEXT_TABLE_CELL_WIDTH_ARRAY);
	}catch (Exception e){
		ODPCommonUtil.logException(context, ODPCommonUtil.LOG_ERROR_CONVERT_TABLE, e);
	}
  }

  private boolean checkTableColGroup(ConversionContext context,OdfFileDom contentDom, Element htmlElement, OdfElement odfElement) {
	NodeList cols = getHtmlColNodes(htmlElement);
	if (cols != null) {
		String[] tableColWidth = new String[cols.getLength()];
		for (int i = 0; i < cols.getLength(); i++) {
			Element element = (Element) cols.item(i);
			String style = element.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
			// If style width value exists, remove width attribute from td
			if (style != null && style.toLowerCase().contains(ODPConvertConstants.SVG_ATTR_WIDTH + ":")) {
				style = style.substring(style.indexOf(ODPConvertConstants.SVG_ATTR_WIDTH+":") + 6).trim();
				if(style.contains("%"))
					style = style.substring(0,style.indexOf("%") + 1);
				else
					style = "20%";
				tableColWidth[i] = style;
			}
		}
		context.put(ODPConvertConstants.CONTEXT_TABLE_CELL_WIDTH_ARRAY,tableColWidth);
		TableConvertorUtil.insertMissingCols(context, contentDom, odfElement, cols.getLength(),tableColWidth, htmlElement);
		TableConvertorUtil.markSideCells(htmlElement);
		htmlElement.removeChild(cols.item(0).getParentNode());
		return true;
	}
	return false;
}

@SuppressWarnings("restriction")
  private void setTableContext(ConversionContext context, OdfElement parent)
  {
    context.put(ODPConvertConstants.CONTEXT_TABLE_WIDTH, parent.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_WIDTH));
    context.put(ODPConvertConstants.CONTEXT_TABLE_HEIGHT, parent.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_HEIGHT));
  }

  private void parseTableStyleClassAttr(ConversionContext context, OdfElement odfElement, Element htmlElement)
  {
    /**
     * 1.if contains common class style.it seems that all the tables contain common CSS currently. 2.Recaculate a new style name.
     */

    String tableStyle = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    String[] styles = tableStyle.split(" ");
    //D40051: [FF]Table  export from IBM docs, has background when open in Symphony or AOO 
    if(tableStyle.toLowerCase().indexOf("symdefault")>=0 && !htmlElement.hasAttribute("table_template-name")){
    	htmlElement.setAttribute("table_template-name", "SymDefault");
    }

    tableStyle = getStyleName(context, styles, OdfStyleFamily.Table, odfElement);

    if (tableStyle != null && tableStyle.length() > 0)
    {
      OdfName attName = ConvertUtil.getOdfName(ODFConstants.TABLE_STYLE_NAME);
      odfElement.setOdfAttributeValue(attName, tableStyle);
    }
  }

  @SuppressWarnings({ "restriction", "unchecked" })
  public static String getStyleName(ConversionContext context, String[] styles, OdfStyleFamily odfStyleFamily, OdfElement odfElement)
  {

    String nodeName = odfElement.getAttribute(ODFConstants.TABLE_STYLE_NAME);
    if (nodeName == null || nodeName.length() == 0)
    {
      // Get the style name, which is the name immediately following the "table_table" or "table_table-cell" in the styles
      int nbrStyles = styles.length - 1; // don't need to look at the last one for "table_table" because we need the one after "table_table"
      for (int i = 0; i < nbrStyles; i++)
      {
        // assume our class style name is the first name after "table_table-cell" or "table_table"
        if (styles[i].startsWith("table_table"))
        {
          StringBuilder styleName = new StringBuilder(128);
          // now look up the style name in the content.html styles.
          if (odfElement instanceof TableTableCellElement) // table-cells have a special css selector name
          {
            styleName.append(ODPConvertConstants.CSS_TABLE_CELL_SELECTOR); // prefix "td.table_table-cell" for css selector name we use for
                                                                           // cell styles
          }
          else
          {
            styleName.append(ODPConvertConstants.SYMBOL_DOT); // prefix is just a "dot"
          }
          styleName.append(styles[i + 1]);

          // now make sure it's really a style, and not a special keyword
          Map<String, String> cssStyles = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
          if (cssStyles != null)
          {
            String style = cssStyles.get(styleName.toString());
            if (style != null) // we found the style, so this is the style name we should use
            {
              return styles[i + 1];
            }
          }
        }
      }
    }
    else
    {
      // ODF element has the style name, but make sure the html element still has it specified.  If not, 
      // we don't want to return it
      for (String style : styles)
      {
         if (style.startsWith(nodeName))
        {
          return nodeName;
        }
      }
    }
    
    return null;  // we didn't find the style
 }

  @SuppressWarnings("restriction")
  private void updateTableColumnWidth(ConversionContext context, OdfElement odfElement)
  {
    NodeList children = odfElement.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      OdfElement element = (OdfElement) children.item(i);
      if (!(element instanceof TableTableColumnElement))
        break;
      String styleName = element.getAttribute(ODPConvertConstants.ODF_ATTR_TABLE_STYLE_NAME);
      OdfFileDom contentDom = (OdfFileDom) context.get("target");
      OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
      OdfStyle style = autoStyles.getStyle(styleName, OdfStyleFamily.TableColumn);
      String relColumnWidth = style.getProperty(OdfTableColumnProperties.RelColumnWidth);
      String pColumnWidth = UnitUtil.getPercentage(relColumnWidth);
      PropertyConvertorFactory.getInstance().getConvertor("colWidth").convert(context, style, null, "colWidth", pColumnWidth);
    }
  }

  @SuppressWarnings("restriction")
  protected void convertNewElement(ConversionContext context, Element htmlElement, HtmlToOdfIndex indexTable, OdfElement parent)
  {
    try
    {
      OdfFileDom contentDom = (OdfFileDom) context.get("target");
      OdfElement odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TABLE_TABLE));
      indexTable.addEntryByHtmlNode(htmlElement, odfElement);

      parent.appendChild(odfElement);

      convertAttritubes(context, htmlElement, odfElement, parent);

      // parseNewTableAlignment(odfElement);

      if(!checkTableColGroup(context, contentDom, htmlElement, odfElement)){
    	  // add table columns
          String[] tableColWidth = TableConvertorUtil.parseNewTableColumns(context, contentDom, odfElement, htmlElement);
          //TODO:  will need to update this when we support merged columns - see earlier comment 
          context.put(ODPConvertConstants.CONTEXT_TABLE_CELL_WIDTH_ARRAY, tableColWidth);  	  
      }

      convertChildren(context, htmlElement, odfElement);
      updateTableColumnWidth(context, odfElement);
    }
    catch (Exception e)
    {
      ODPCommonUtil.logException(context, ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION, e);
    }
  }

  protected void convertTableTemplateStyles(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    NamedNodeMap attributes = htmlElement.getAttributes();

    // Get class attribute
    Node drawPageStyleClasses = attributes.getNamedItem(ODPConvertConstants.HTML_ATTR_CLASS);
    String classValue = drawPageStyleClasses.getNodeValue();
    String[] classStyles = classValue.split(ODPConvertConstants.SYMBOL_WHITESPACE);

    for (String style : classStyles)
    {
      if (style != null)
      {
        if (TableTemplateParser.isTemplateStyle(style))
        {
          TableTemplateParser.applyPredefinedStyles(context, htmlElement, odfElement, style);
        }
        else if (TableTemplateParser.isCustomTemplate(style))
        {
          TableTemplateParser.applyCustomStyles(context, htmlElement, odfElement, classStyles);
          break;
        }
      }
    }
  }

  protected void convertAttritubes(ConversionContext context, Element htmlElement, OdfElement odfElement, OdfElement odfParent)
  {
    OdfStyleFamily family = OdfStyleFamily.Table;
    parseTableStyleClassAttr(context, odfElement, htmlElement);
    super.parseAttributes(context, htmlElement, odfElement, odfParent, family);
    convertTableAttributes(context, htmlElement, odfElement, family);
  }

  protected void convertChildren(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    convertTableChildren(context, htmlElement, odfElement);
  }

  @SuppressWarnings("restriction")
  public static void convertTableChildren(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    // remove span without id first
    HtmlToOdfIndex indexTable = (HtmlToOdfIndex) context.get("indexTable");
    OdfFileDom contentDom = (OdfFileDom) context.get("target");
    List<Node> oldChildren = getOldChildren(odfElement);

    // convert html children
    NodeList htmlChildren = htmlElement.getChildNodes();

    int size = htmlChildren.getLength();
    int capacity = ODPCommonUtil.calculateArrayCapacity(size);
    List<Node> htmlNodeList = new ArrayList<Node>(capacity);

    for (int i = 0; i < size; i++)
    {
      htmlNodeList.add(htmlChildren.item(i));
    }

    // append preserved objects before any indexable element
    for (int i = 0; i < oldChildren.size(); i++)
    {
      // log.fine( "oldChildren:" + oldChildren.get(i).getNodeName());
      Node node = oldChildren.get(i);
      // log.fine( "node:" + node.getNodeName());
      if (!(node instanceof Text) && !indexTable.isOdfNodeIndexed((OdfElement) node)  && !ODPConvertConstants.ODF_ELEMENT_TEXTLIST.equals(node.getNodeName()))
      {
        convertPreservedNOIDNode(context, oldChildren, htmlNodeList, odfElement, node, indexTable);
      }
      else
      {
        break;
      }
    }

    while (!htmlNodeList.isEmpty())
    {
      Node node = htmlNodeList.get(0);
      if (node instanceof Element)
      {
        convertHtmlNode(context, oldChildren, htmlNodeList, odfElement, indexTable);
      }
      else if (node instanceof Text)
      {
        Text txtElement = (Text) node;
        try
        {
          odfElement.appendChild(contentDom.createTextNode(txtElement.getNodeValue()));
        }
        catch (Exception e)
        {
        }
        htmlNodeList.remove(0);
      }

    }
  }

  @SuppressWarnings("restriction")
  private static List<Node> getOldChildren(OdfElement odfElement)
  {
    List<Node> oldChildren = new ArrayList<Node>();
    int length = odfElement.getChildNodes().getLength();
    for (int i = 0; i < length; i++)
    {
      Node node = odfElement.removeChild(odfElement.getFirstChild());
      String nodeName = node.getNodeName();
      if ((nodeName.equals(ODFConstants.TABLE_TABLE_HEADER_ROWS)))
      {
        NodeList childNodes = node.getChildNodes();
        for (int j = 0; j < childNodes.getLength(); j++)
        {
          oldChildren.add(childNodes.item(j));
        }
      }
      else
      {
        oldChildren.add(node);
      }
    }

    return oldChildren;
  }

  @SuppressWarnings("restriction")
  private static void convertPreservedNOIDNode(ConversionContext context, List<Node> oldChildren, List<Node> htmlNodeList,
      OdfElement odfElement, Node inputNode, HtmlToOdfIndex indexTable)
  {
    if (!inputNode.hasChildNodes())
    {
      odfElement.appendChild(inputNode);
      OdfElement thisElement = (OdfElement) inputNode;
      if (thisElement.hasAttributes())
      {
        OdfStylableElement stylable = (OdfStylableElement) thisElement;
        stylable.setStyleName(stylable.getStyleName());
      }
    }
    else
    {
      OdfElement thisElement = (OdfElement) inputNode.cloneNode(false);
      odfElement.appendChild((Node) thisElement);
      if (thisElement.hasAttributes())
      {
        OdfStylableElement stylable = (OdfStylableElement) thisElement;
        stylable.setStyleName(stylable.getStyleName());
      }
      Node newOdfNode = odfElement.getLastChild();
      NodeList childNodes = inputNode.getChildNodes();
      for (int i = 0; i < childNodes.getLength(); i++)
      {
        Node newNode = childNodes.item(i);
        if (!indexTable.isOdfNodeIndexed((OdfElement) newNode)  && !ODPConvertConstants.ODF_ELEMENT_TEXTLIST.equals(newNode.getNodeName()) )
        {
          convertPreservedNOIDNode(context, oldChildren, htmlNodeList, (OdfElement) newOdfNode, newNode, indexTable);
        }
        else
        {
          convertHtmlNode(context, oldChildren, htmlNodeList, (OdfElement) newOdfNode, indexTable);
        }
      }
    }
  }

  // private void parseNewTableAlignment(OdfElement odfElement)
  // {
  // OdfStylableElement stylable = (OdfStylableElement) odfElement;
  // if (!stylable.hasProperty(OdfStyleTableProperties.Align))
  // {
  // stylable.setProperty(OdfStyleTableProperties.Align, "left");
  // }
  //
  // }

  /**
   * This addresses an issue with the way imported documents set the width variable. Currently there is a width attribute on each of the
   * table cells (td elements) that specify the width of the column. When saved from the editor, there is also a width value placed in the
   * style setting with the original width remains as a width attribute
   * 
   * This is an issue with this approach when using the common table convertor utils used by pres, sheet and doc though in that the width
   * attribute is checked and if it exists it will be used and the style width value is ignored.
   * 
   * To get around this the html will be updated that is used to compute the width of the column to use the proper values when passed to the
   * common convertor utils.
   * 
   */
  private static void updateWidthInHtml(ConversionContext context, Element htmlElement)
  {

    if (htmlElement != null)
    {
      NodeList tableRows = getHtmlTRNodes(htmlElement);

      if (tableRows != null)
      {
        // First row is special in that we need to keep the width attribute
        // around if the style width value is empty or doesn't exist
        // The common utils first check the width then the style width values
        // So need to preserve width if the style width is not
        // set (i.e. column width didn't change in the editor)
        Element firstRow = (Element) tableRows.item(0);

        if (firstRow != null)
        {
          // Walk through first row of cells to check for style width and width on td
          NodeList cols = firstRow.getChildNodes();

          for (int k = 0; k < cols.getLength(); k++)
          {
            Element col = (Element) cols.item(k);

            String style = col.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
            // If style width value exists, remove width attribute from td
            if (style != null && style.toLowerCase().contains(ODPConvertConstants.SVG_ATTR_WIDTH + ":"))
            {
              col.removeAttribute(ODPConvertConstants.SVG_ATTR_WIDTH);
            }
          }
        }

        // Walk through rest of rows and remove width value.
        // This is necessary since the common table convertor utils check each
        // cell in each row to see if the column width values are different
        // and always uses the min value. If we don't remove the old value could
        // get used.
        for (int j = 1; j < tableRows.getLength(); j++)
        {
          Element tableRow = (Element) tableRows.item(j);
          NodeList columns = tableRow.getChildNodes();

          // Walk through td children of row and remove width
          for (int l = 0; l < columns.getLength(); l++)
          {
            Element col = (Element) columns.item(l);
            col.removeAttribute(ODPConvertConstants.SVG_ATTR_WIDTH);
          }
        }
      }
    }
  }

  /**
   * Get the Col elements (col) in ColGroup  from the html element
   */
  private static NodeList getHtmlColNodes(Element table)
  {
    if (table.hasChildNodes())
    {
      NodeList nodes = table.getChildNodes();
      for (int i = 0; i < nodes.getLength(); i++)
      {
        Node node = nodes.item(i);
        if (node != null)
        {
          if (node.getNodeName().equals(HtmlCSSConstants.COLGROUP))
                 return node.getChildNodes();
          if (node.getNodeName().equals(HtmlCSSConstants.COL))
            return nodes;
        }
      }
    }
    return null;
  }
  
  /**
   * Get the row elements (tr) from the html element
   */
  private static NodeList getHtmlTRNodes(Element element)
  {
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

  @SuppressWarnings("restriction")
  private static void convertHtmlNode(ConversionContext context, List<Node> oldChildren, List<Node> htmlNodeList, OdfElement odfElement,
      HtmlToOdfIndex indexTable)
  {
    Node node = htmlNodeList.get(0);
    Element htmlChild = (Element) node;
    boolean isParentIndexed = true;
    if (!indexTable.isOdfNodeIndexed(odfElement))
      isParentIndexed = false;

    IConvertor convertor = ODPConvertFactory.getInstance().getConvertor(htmlChild);

    // append odfChild and preserved objects after the odfChild and before next indexable element
    OdfElement odfChild = indexTable.getFirstOdfNode(htmlChild);
    if (odfChild != null && !odfElement.equals(odfChild))
    {
      odfElement.appendChild(odfChild);

      if (isParentIndexed)
      {
        int index = oldChildren.indexOf((Node) odfChild);
        while (++index < oldChildren.size())
        {
          Node node1 = oldChildren.get(index);
          if (!indexTable.isOdfNodeIndexed((OdfElement) node1) && !node1.getNodeName().equals(ODPConvertConstants.ODF_ELEMENT_TEXTLIST))
          {
            convertPreservedNOIDNode(context, oldChildren, htmlNodeList, odfElement, node1, indexTable);
          }
          else
          {
            break;
          }
        }
      }
    }
    Element target = ODFConvertorUtil.convertElement(context, htmlChild);
    if (target == null || target.getNodeName().equals(ODPConvertConstants.ODF_ELEMENT_TEXTSPAN))
    {
      context.put("Reorder", false);
      context.put("oldChildren", oldChildren);
    }
    else
    {
      context.put("Reorder", true);
      context.put("oldChildren", new ArrayList<Node>());
    }
    convertor.convert(context, htmlChild, odfElement);
    htmlNodeList.remove(0);
  }

  public static void convertTableAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement, OdfStyleFamily family)
  {
    try
    {
      String tableStyle = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      String[] styles = tableStyle.split(" ");

      String styleName = getStyleName(context, styles, OdfStyleFamily.Table, odfElement);
      String styleString = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);

      CSSStyleConvertorFactory.getInstance().getConvertor(family).convertStyle(context, htmlElement, odfElement, styleName, styleString);
    }
    catch (Exception e)
    {
      ODPCommonUtil.logException(context, ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION, e);
    }
  }
  
  /**
   * Add or update accessibility information associated with this Table
   * @param context - the current conversion context
   * @param htmlNode - the table element
   * @param odfParent - the parent to add/update the svg:title or svg:desc
   */
  @SuppressWarnings("restriction")
  private void setAccessibilityInfo(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
    // First handle any aria information
    try
    {
      String ariaTitle = htmlNode.getAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL);
      if (ariaTitle != null && ariaTitle.length() > 0)
      {
        // Add or update the svg:title
        NodeList svgTitles = odfParent.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_SVGTITLE);
        if (svgTitles.getLength() == 0)
        {
          // Add a new svg:title
          OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
          OdfElement titleElement = contentDom.createElementNS(
              ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_SVGTITLE), ODPConvertConstants.ODF_ELEMENT_SVGTITLE);
          Text t = contentDom.createTextNode(ariaTitle);
          titleElement.appendChild(t);
          odfParent.appendChild(titleElement);
        }
        else
        {
          // Update the svg:title if it has been updated
          Node svgTitle = svgTitles.item(0);
          String currentTitle = svgTitle.getTextContent();
          if (currentTitle == null || !currentTitle.equals(ariaTitle))
          {
            svgTitle.setTextContent(ariaTitle);
          }
        }
      }

      String ariaLabels = htmlNode.getAttribute(ODFConstants.HTML_ATTR_ARIA_DESCRIBEDBY);
      if (ariaLabels != null && ariaLabels.length() > 0)
      {
        String[] ariaLabelIDs = ariaLabels.trim().split("\\s+"); // Split by whitespace
        for (String ariaLabel : ariaLabelIDs)
        {
          if (!ariaLabel.startsWith(ODFConstants.HTML_ATTR_ARIA_IGNORE_PREFIX))
          {
            // Find the label containing the description.  It should be the sibling following the <table> element.
            Node sibling = htmlNode.getNextSibling();
            if (sibling != null && sibling.getNodeName().equals(ODFConstants.HTML_ELEMENT_LABEL))
            {
              String id = ((Element)sibling).getAttribute(ODFConstants.HTML_ATTR_ID);
              if (id != null && id.equals(ariaLabel))
              {
                Node textNode = sibling.getFirstChild();
                if (textNode != null && textNode instanceof Text)
                {
                  String svgDescText = textNode.getNodeValue();
                  if (svgDescText != null && svgDescText.length() > 0)
                  {
                    // Add or update the svg:desc
                    NodeList svgDescriptions = odfParent.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_SVGDESC);
                    if (svgDescriptions.getLength() == 0)
                    {
                      // Add a new svg:desc
                      OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
                      OdfElement descElement = contentDom.createElementNS(
                          ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ELEMENT_SVGDESC), ODPConvertConstants.ODF_ELEMENT_SVGDESC);
                      Text t = contentDom.createTextNode(svgDescText);
                      descElement.appendChild(t);
                      odfParent.appendChild(descElement);
                    }
                    else
                    {
                      // Update the svg:desc if it has been updated
                      Node svgDesc = svgDescriptions.item(0);
                      String currentDesc = svgDesc.getTextContent();
                      if (currentDesc == null || !currentDesc.equals(svgDescText))
                      {
                        svgDesc.setTextContent(svgDescText);
                      }
                    }
                  }
                }
              }
            }
            break;
          }
        }
      }
    }
    catch (Exception e)
    {
      ODPCommonUtil.logException(context, Level.SEVERE, ODPCommonUtil.LOG_FAILED_ARIA_EXPORT, e);
    }
  }
}
