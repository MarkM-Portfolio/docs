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

import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.attribute.style.StyleNameAttribute;
import org.odftoolkit.odfdom.dom.element.table.TableTableCellElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.presentation.model.TableIndex;
import com.ibm.json.java.JSONObject;

public class MasterTableCellElementConvertor extends GeneralMasterHtmlConvertor
{
  private static final String CLASS = MasterTableCellElementConvertor.class.getName();

  @SuppressWarnings("unused")
  private static final Logger LOG = Logger.getLogger(CLASS);

  @SuppressWarnings({ "unchecked", "restriction" })
  @Override
  protected void doConvertHtml(ConversionContext context, Node element, Element htmlParent)
  {

    TableIndex index = (TableIndex) context.get(ODPConvertConstants.CONTEXT_TABLE_INDEX);
    JSONObject templateMap = (JSONObject) context.get(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_MAP);
    Map<String, String> templateAttrs = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_ATTRS);

    String colSpan = ((TableTableCellElement) element).getAttribute(ODPConvertConstants.ODF_ATTR_TABLE_NUM_COL_SPANNED);
    int increasement = 1;
    if (colSpan.length() > 0)
      increasement = Integer.parseInt(colSpan);
    index.increaseYIndex(increasement);

    // parse current Node.
    Element htmlElement = (Element) addHtmlElement(element, htmlParent, context);

    // parse attributes.
    htmlElement = parseAttributes(element, htmlElement, context);

    StringBuilder tableClass = new StringBuilder(16);
    try
    {
      OdfStyle tableCellDS = ((OdfDocument) context.getSource()).getStylesDom().getOfficeStyles()
          .getStyle("default", OdfStyleFamily.TableCell);
      if (tableCellDS != null)
      {
        tableClass = tableClass.append(tableCellDS.getOdfAttributeValue(StyleNameAttribute.ATTRIBUTE_NAME) + " ");
      }
      else
      {
        ODPCommonUtil.logMessage(Level.WARNING, ODPCommonUtil.LOG_NO_DEFAULT_TABLE_CELL_STYLE);
      }
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".doConvertHtml");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);
    }

    // The templateMap may not exist or is empty if there are no table:table-templates in the file (Symphony problem?)
    if (templateMap != null && !templateMap.isEmpty())
    {
      tableClass = tableClass.append((String) templateMap.get("body") + " ");

      if (index.isFirstRow() && Boolean.parseBoolean(templateAttrs.get("table:use-first-row-styles")))
      {
        tableClass = tableClass.append((String) templateMap.get("first-row") + " ");
      }
      else if (index.isLastRow() && Boolean.parseBoolean(templateAttrs.get("table:use-last-row-styles")))
      {
        tableClass = tableClass.append((String) templateMap.get("last-row") + " ");
      }

      if (Boolean.parseBoolean(templateAttrs.get("table:use-banding-rows-styles")))
      {
        if (index.isOddRow())
        {
          tableClass = tableClass.append((String) templateMap.get("odd-rows") + " ");
        }
      }

      if (index.isFirstColumn() && Boolean.parseBoolean(templateAttrs.get("table:use-first-column-styles")))
      {
        tableClass = tableClass.append((String) templateMap.get("last-column") + " ");
      }
      else if (index.isLastColumn() && Boolean.parseBoolean(templateAttrs.get("table:use-last-column-styles")))
      {
        tableClass = tableClass.append((String) templateMap.get("last-column") + " ");
      }

      if (Boolean.parseBoolean(templateAttrs.get("table:use-banding-columns-styles")))
      {
        if (index.isOddColumn())
        {
          tableClass = tableClass.append((String) templateMap.get("odd-columns") + " ");
        }
      }
    }

    String classAttr = htmlElement.getAttribute("class");
    if (tableClass != null && classAttr != null)
      htmlElement.setAttribute("class", tableClass.append(classAttr).append(" ").toString());

    // parse Children.
    this.convertChildren(context, element, htmlElement);
  }

}
