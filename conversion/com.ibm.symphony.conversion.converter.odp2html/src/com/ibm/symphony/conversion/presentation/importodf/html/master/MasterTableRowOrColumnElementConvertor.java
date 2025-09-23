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

import org.odftoolkit.odfdom.dom.element.table.TableTableColumnElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableRowElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.presentation.model.TableIndex;

public class MasterTableRowOrColumnElementConvertor extends GeneralMasterHtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {

    double oldParent = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);

    Element htmlElement = null;
    if (odfElement instanceof TableTableColumnElement)
    {
      htmlElement = getSubHtmlElement(htmlParent, "colgroup");
      if (htmlElement == null)
      {
        htmlElement = ((Document) context.getTarget()).createElement("colgroup");
        // we added a div here.
        htmlParent.appendChild(htmlElement);
      }

    }
    else if (odfElement instanceof TableTableRowElement)
    {
      TableIndex tableIndex = (TableIndex) context.get(ODPConvertConstants.CONTEXT_TABLE_INDEX);
      int increasement = 1;
      tableIndex.increaseXIndex(increasement);
      tableIndex.setY(-1);

      htmlElement = getSubHtmlElement(htmlParent, "tbody");
      if (htmlElement == null)
      {
        // first time.
        htmlElement = ((Document) context.getTarget()).createElement("tbody");
        // we added a div here.
        htmlParent.appendChild(htmlElement);
      }
    }
    htmlElement = (Element) addHtmlElement(odfElement, htmlElement, context);

    // need parse attributes here.
    htmlElement = parseAttributes(odfElement, htmlElement, context);

    this.convertChildren(context, odfElement, htmlElement);

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
