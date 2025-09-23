/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import org.w3c.dom.Node;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;


public class TablePropertiesConvertor
{
  private static TablePropertiesConvertor instance = new TablePropertiesConvertor(); 
  public static TablePropertiesConvertor getInstance()
  {
    return instance;
  }
  
  public void convert(ConversionContext context, Node child)
  {
	  Node node = child.getAttributes().getNamedItem(ODFConstants.STYLE_MASTER_PAGE_NAME);
	  String tableName = (node != null) ? node.getNodeValue() : "";
	  ConversionUtil.Document doc = (ConversionUtil.Document) context.get("Source");
	  for (int sheetIndex = 0; sheetIndex < doc.sheetList.size(); sheetIndex++)
	  {
		  ConversionUtil.Sheet sheet = doc.sheetList.get(sheetIndex);
		  if(tableName.indexOf(sheet.sheetName) != 0)
		  {
			  node = child.getFirstChild().getAttributes().getNamedItem("style:writing-mode");
			  if(node != null)
				  node.setNodeValue(sheet.sheetDirection.equalsIgnoreCase(ConversionConstant.RTL) ? ODFConstants.RL_TB : ODFConstants.LR_TB);
			  break;			
		  }
	  }
  }
}
