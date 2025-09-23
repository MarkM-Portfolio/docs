/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.master;

import java.util.HashMap;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableElement;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.presentation.model.TableIndex;
import com.ibm.json.java.JSONObject;

public class MasterTableElementConvertor extends GeneralMasterHtmlConvertor
{

  @SuppressWarnings("restriction")
  @Override
  protected void doConvertHtml(ConversionContext context, Node element, Element htmlParent)
  {
    // TODO Auto-generated method stub
    // super.doConvertHtml(context, element, htmlParent);

    JSONObject tableTemplateMap = (JSONObject) context.get(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_REF);

    TableTableElement table = (TableTableElement) element;
    String templateName = table.getTableTemplateNameAttribute();
    context.put(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_MAP, tableTemplateMap.get(templateName));

    int row_num = table.getElementsByTagName("table:table-row").getLength() - 1;
    int col_num = table.getElementsByTagName("table:table-column").getLength() - 1;

    TableIndex tableIndex = new TableIndex(row_num, col_num);

    context.put(ODPConvertConstants.CONTEXT_TABLE_INDEX, tableIndex);

    NamedNodeMap tableAttrs = table.getAttributes();
    int size = tableAttrs.getLength();
    int capacity = ODPCommonUtil.calculateHashCapacity(size);
    Map<String, String> templateAttributes = new HashMap<String, String>(capacity);

    for (int i = 0; i < size; i++)
      templateAttributes.put(tableAttrs.item(i).getNodeName(), tableAttrs.item(i).getNodeValue());

    context.put(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_ATTRS, templateAttributes);

    Element htmlElement = (Element) addHtmlElement(element, htmlParent, context);

    // need parse attributes here.
    htmlElement = parseAttributes(element, htmlElement, context);

    htmlElement.setAttribute("cellspacing", "0");
    htmlElement.setAttribute("cellpadding", "0");

    NodeList childrenNodes = element.getChildNodes();
    for (int i = 0; i < childrenNodes.getLength(); i++)
    {
      OdfElement childElement = (OdfElement) childrenNodes.item(i);
      // need convert children.
      HtmlMasterConvertorFactory.getInstance().getConvertor(childElement).convert(context, childElement, htmlElement);
    }
    context.remove(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_ATTRS);
    context.remove(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_MAP);

  }

}
