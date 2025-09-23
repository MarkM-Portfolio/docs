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

import org.w3c.dom.Node;

import com.ibm.symphony.conversion.spreadsheet.XMLUtil;
import com.ibm.symphony.conversion.spreadsheet.XMLUtil.NODENAME;


public class OdsNodeLocatorFactory
{
  private static OdsNodeLocatorFactory instance = new OdsNodeLocatorFactory();
  
  public static OdsNodeLocatorFactory getInstance()
  {
    return instance;
  }
  public ILocator getLocator(Object input)
  {
    // TODO Auto-generated method stub
    Node node  = (Node)input;
    String nodeName = node.getNodeName();
    NODENAME type = XMLUtil.getXMLToken(nodeName);
    if(type == null)
      type = NODENAME.DEFAULTNAME;
    ILocator convertor = null;
    switch(type)
    {
      case TABLE_TABLE:
        convertor = new TableTableLocator();
        break;
      case TABLE_TABLE_COLUMN:
        convertor = new TableColumnLocator();
        break;
      case TABLE_TABLE_ROW:
        convertor = new TableRowLocator();
        break;
      case TABLE_TABLE_CELL:
        convertor = new TableTableCellLocator();
        break;
      case TABLE_COVERED_TABLE_CELL:
        convertor = new TableTableCellLocator();
        break;
      case DEFAULTNAME:
      default:
        convertor = new GeneralLocator();
    }
    return convertor;
  }
}
