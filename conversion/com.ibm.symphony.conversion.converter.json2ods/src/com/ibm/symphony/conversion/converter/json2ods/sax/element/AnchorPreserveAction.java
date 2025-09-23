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

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSSAXParser;
import com.ibm.symphony.conversion.converter.json2ods.sax.PreserveFragmentReader;
import com.ibm.symphony.conversion.converter.json2ods.sax.XMLFragmenttReader;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.index.ODSOffsetRecorder;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public class AnchorPreserveAction extends PreserveAction
{

  public void doPreserve(ConversionContext context, TransformerHandler hdl,PreserveNameIndex indexName)
  {
    ODSOffsetRecorder reader = (ODSOffsetRecorder)context.get("Recorder");
    String pElement = reader.locateById(indexName.elementId);
    try
    {
      if(pElement != null)
      {
        XMLFragmenttReader fReader =  new PreserveFragmentReader(indexName);
        ODSSAXParser parser = new ODSSAXParser();
        xmlReader = (XMLReader) context.get("XMLReaderInstance2");
        parser.setXMLReader(xmlReader);
        parser.setHandler(fReader);
        parser.parseXML(hdl,pElement);
      }
    }
    catch(Exception e)
    {
    }
  }

}
