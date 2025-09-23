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
import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableElement;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.html.HtmlConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.presentation.model.TableIndex;
import com.ibm.json.java.JSONObject;

public class TableTableElementConvertor extends GeneralContentHtmlConvertor
{
  private static final String CLASS = TableTableElementConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  @SuppressWarnings("restriction")
  @Override
  protected void doConvertHtml(ConversionContext context, Node element, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    double oldParent = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
    setTableContext(context, element);
    JSONObject tableTemplateMap = (JSONObject) context.get(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_REF);

    TableTableElement table = (TableTableElement) element;
    String templateName = table.getTableTemplateNameAttribute();
    Object tableTemplateJson = null;
    if(tableTemplateMap != null && !tableTemplateMap.isEmpty())
    	tableTemplateJson = tableTemplateMap.get(templateName);
    context.put(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_MAP, tableTemplateJson);
    int row_num = table.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_ROW).getLength() - 1;
    int col_num = table.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_COLUMN).getLength() - 1;

    TableIndex tableIndex = new TableIndex(row_num, col_num);

    context.put(ODPConvertConstants.CONTEXT_TABLE_INDEX, tableIndex);

    NamedNodeMap tableAttrs = table.getAttributes();
    int size = tableAttrs.getLength();
    int capacity = ODPCommonUtil.calculateHashCapacity(size);
    Map<String, String> templateAttributes = new HashMap<String, String>(capacity);

    for (int i = 0; i < size; i++)
      templateAttributes.put(tableAttrs.item(i).getNodeName(), tableAttrs.item(i).getNodeValue());

    context.put(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_ATTRS, templateAttributes);

    Element htmlElement = addHtmlElement(element, htmlParent, context);

    // need parse attributes here.
    htmlElement = parseAttributes2(element, htmlElement, context);

    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CELLSPACING, ODPConvertConstants.ZERO);
    htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CELLSPACING, ODPConvertConstants.ZERO);
    htmlElement.setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_GRID);
    String id = "";
    id = htmlElement.getAttribute("id");
    htmlElement.setAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL, "table_" + id);
    StringBuilder styleList = new StringBuilder(htmlElement.getAttribute(ODPConvertConstants.HTML_STYLE_TAG));
    styleList.append(ODPConvertConstants.SYMBOL_WHITESPACE);
    styleList.append("height: 100%; width: 100%;");
    htmlElement.setAttribute(ODPConvertConstants.HTML_STYLE_TAG, styleList.toString());
    
    // Add table template name to the class list. This causes css to include our styles for
    // the template(s) active for each particular table cell. e.g. ".SymSkyblue3 .tableHeaderRow td"
    if (templateName != null && templateName.length() > 0)
    {
      StringBuilder classList = new StringBuilder(htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS));
      classList.append(templateName);
      classList.append(ODPConvertConstants.SYMBOL_WHITESPACE);
      htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, classList.toString());
    }

    NodeList childrenNodes = element.getChildNodes();
    for (int i = 0; i < childrenNodes.getLength(); i++)
    {
      OdfElement childElement = (OdfElement) childrenNodes.item(i);
      // need convert children.
      HtmlContentConvertorFactory.getInstance().getConvertor(childElement).convert(context, childElement, htmlElement);
    }
    context.remove(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_ATTRS);
    context.remove(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_MAP);

    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParent);
    //set direction style to wrapping div element
    String direction = null, tableStyleName = templateAttributes.get(ODPConvertConstants.ODF_ELEMENT_TABLESTYLE_NAME);
    if(tableStyleName != null)
    	direction = CSSConvertUtil.getAttributeValue(context, HtmlCSSConstants.DIRECTION, tableStyleName);

    if(direction == null)
    	direction = HtmlConvertUtil.getDirectionAttr(context, null, true);

    if (HtmlCSSConstants.RTL.equalsIgnoreCase(direction) && HtmlCSSConstants.DIV.equalsIgnoreCase(htmlParent.getNodeName())) {
    	String inlineStyle = htmlParent.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    	inlineStyle = HtmlCSSConstants.DIRECTION + ODPConvertConstants.SYMBOL_COLON + HtmlCSSConstants.RTL + ODPConvertConstants.SYMBOL_SEMICOLON + inlineStyle;
    	htmlParent.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE,inlineStyle);
    }
  }

  @SuppressWarnings("restriction")
  private void setTableContext(ConversionContext context, Node element)
  {
    OdfElement parent = (OdfElement) element.getParentNode();
    context.put(ODPConvertConstants.CONTEXT_TABLE_WIDTH, parent.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_WIDTH));
    context.put(ODPConvertConstants.CONTEXT_TABLE_HEIGHT, parent.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_HEIGHT));
  }
  // public JSONObject getTableTemplateReference(OdfDocument odfDoc, Document htmlDoc)
  // {
  // NodeList tabletemplates = null;
  // try
  // {
  // OdfFileDom styles = odfDoc.getStylesDom();
  // tabletemplates = styles.getElementsByTagName("table:table-template");
  // }
  // catch (Exception e)
  // {
  // ODPCommonUtil.logException(null, e);
  // }
  // TableTemplateReference templateRef = new TableTemplateReference(htmlDoc);
  // for (int i = 0; i < tabletemplates.getLength(); i++)
  // {
  // templateRef.parse(tabletemplates.item(i));
  // }
  //
  // return templateRef.getTemplateReference();
  // }

}
