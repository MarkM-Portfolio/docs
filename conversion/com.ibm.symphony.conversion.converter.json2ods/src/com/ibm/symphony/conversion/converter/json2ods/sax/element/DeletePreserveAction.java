/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import javax.xml.transform.sax.TransformerHandler;

import org.xml.sax.XMLReader;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public class DeletePreserveAction extends PreserveAction
{

  public void doPreserve(ConversionContext context, TransformerHandler hdl,PreserveNameIndex indexName)
  {
    doAppend(context, hdl, indexName);
  }

}
