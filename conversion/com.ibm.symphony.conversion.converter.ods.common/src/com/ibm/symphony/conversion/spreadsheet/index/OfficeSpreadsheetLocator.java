/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.index;

import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;

public class OfficeSpreadsheetLocator extends GeneralLocator
{
  
  public void traverseChildren(ConversionContext context)
  {
    Document doc = (Document)context.get("Source");
    NodeList list = element.getChildNodes();
    int length = list.getLength();
    for (int i = 0; i < length; i++)
    {
      Node child = list.item(i);
      String id = "";
      if(child instanceof Element)
        id = ((Element) child).getAttribute(IndexUtil.ID_STRING);
      ILocator convertor = OdsNodeLocatorFactory.getInstance().getLocator(child);
      convertor.traverse(context, child, null);
    }
  }
  
}
