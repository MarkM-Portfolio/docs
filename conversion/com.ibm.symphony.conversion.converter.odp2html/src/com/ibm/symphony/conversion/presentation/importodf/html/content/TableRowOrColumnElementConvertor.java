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

import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableColumnElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableRowElement;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.presentation.model.TableIndex;

public class TableRowOrColumnElementConvertor extends GeneralContentHtmlConvertor
{
  private static final String CLASS = TableRowOrColumnElementConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  @SuppressWarnings("unchecked")
  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    double oldParent = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
    Document doc = (Document) context.getTarget();

    TableIndex tableIndex = (TableIndex) context.get(ODPConvertConstants.CONTEXT_TABLE_INDEX);
    
    Element htmlElement = null;
    if (odfElement instanceof TableTableColumnElement){
      htmlElement = getSubHtmlElement(htmlParent, ODPConvertConstants.HTML_ELEMENT_COLGROUP);
      if (htmlElement == null)
      {
        // first time we need add a COLGROUP at here
        htmlElement = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_COLGROUP);
        htmlParent.appendChild(htmlElement);
      }
    } else if (odfElement instanceof TableTableRowElement){
      int increasement = 1;
      tableIndex.increaseXIndex(increasement);
      tableIndex.setY(-1);

      htmlElement = getSubHtmlElement(htmlParent, ODPConvertConstants.HTML_ELEMENT_TBODY);
      if (htmlElement == null)
      {
        // first time we need add a TBODY at here
        htmlElement = createHtmlElement(context, odfElement, doc, ODPConvertConstants.HTML_ELEMENT_TBODY);
        htmlParent.appendChild(htmlElement);
      }
    }

    htmlElement = addHtmlElement(odfElement, htmlElement, context);

    // need parse attributes here.
    htmlElement = parseAttributes2(odfElement, htmlElement, context);
    
    if (odfElement instanceof TableTableRowElement)
    {
      htmlElement.setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_ROW);

      Map<String, Map<String, String>> contentStyles = (Map<String, Map<String, String>>) context
          .get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);

      if(contentStyles != null)
      {
        String styleName = CSSConvertUtil.getStyleName(((TableTableRowElement) odfElement).getTableStyleNameAttribute());
        Map<String, String> map = contentStyles.get(styleName);
        if ((map != null) && map.containsKey(ODPConvertConstants.SVG_ATTR_HEIGHT))
        {
          Attr heightAttr = doc.createAttribute(ODPConvertConstants.SVG_ATTR_HEIGHT);
          String value = map.get(ODPConvertConstants.SVG_ATTR_HEIGHT);
          ODPCommonUtil.setAttributeNode(htmlElement, heightAttr, value);
          map.remove(ODPConvertConstants.SVG_ATTR_HEIGHT);
        }
      }
      
      // When we have a table template, add class= values on the <tr> so we pick up the css selectors for the row styling 
      JSONObject templateMap = (JSONObject) context.get(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_MAP);
      if (templateMap != null)
      {
        Map<String, String> templateAttrs = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_ATTRS);

        StringBuilder trClass = new StringBuilder(128);

        if (tableIndex.isFirstRow() && Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_FIRST_ROW_STYLES)))
        {
          trClass.append(ODPConvertConstants.CSS_TABLE_HEADER_ROW);
          trClass.append(ODPConvertConstants.SYMBOL_WHITESPACE);
        }
        else if (tableIndex.isLastRow()
            && Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_LAST_ROW_STYLES)))
        {
          trClass.append(ODPConvertConstants.CSS_TABLE_LAST_ROW);
          trClass.append(ODPConvertConstants.SYMBOL_WHITESPACE);
        }
        if (tableIndex.isOddRow())
        {
          if (Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_BANDING_ROWS_STYLES))
              && (!tableIndex.isLastRow() || !Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_LAST_ROW_STYLES))))
          {
            // Add "tableAlternateRow" for our css styling to pick up the alternate row styling
            trClass.append(ODPConvertConstants.CSS_TABLE_ALTERNATE_ROW);
            trClass.append(ODPConvertConstants.SYMBOL_WHITESPACE);
          }
        }
        else
        {
          // don't add alternate row if we are the header row
          if (!tableIndex.isFirstRow()
              || !Boolean.parseBoolean(templateAttrs.get(ODPConvertConstants.ODF_ELEMENT_TABLEUSE_FIRST_ROW_STYLES)))
          {
            // (AlternateRowHack) this is backwards, because the editor implemented alternateRow backwards.
            trClass.append(ODPConvertConstants.CSS_ALTERNATE_ROW);
            trClass.append(ODPConvertConstants.SYMBOL_WHITESPACE);
          }
        }

        // put the new values in the element class
        if (trClass.length() > 0)
        {
          String classAttr = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
          if (classAttr != null && classAttr.length() > 0)
          {
            trClass.insert(0, classAttr);
          }
          htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, trClass.toString());
        }
      }
    }

    this.convertChildren(context, odfElement, htmlElement);

    context.remove(ODPConvertConstants.CONTEXT_TABLE_CELL_WIDTH);

    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParent);
  }

  private Element getSubHtmlElement(Element parent, String tagName)
  {
    Element targetChild = null;
    NodeList children = parent.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node child = children.item(i);
      if (child.getNodeName().equals(tagName))
      {
        targetChild = (Element) child;
        break;
      }
    }
    return targetChild;
  }
}
