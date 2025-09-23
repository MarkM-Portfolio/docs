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

import org.odftoolkit.odfdom.OdfElement;
import org.xml.sax.XMLReader;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSSAXParser;
import com.ibm.symphony.conversion.converter.json2ods.sax.PreserveFragmentReader;
import com.ibm.symphony.conversion.converter.json2ods.sax.XMLFragmenttReader;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.ODSOffsetRecorder;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public class CopyPreserveAction extends PreserveAction
{

  public void doPreserve(ConversionContext context, TransformerHandler hdl, PreserveNameIndex indexName,String id)
  {
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    ODSOffsetRecorder reader = (ODSOffsetRecorder)context.get("Recorder");
//    boolean bChange = index.isCellChanged(id);
    boolean bChange = true;
    String pChild = reader.locateById(indexName.elementId);
    if(!bChange)
    {
      if(pChild != null)
      {
        XMLFragmenttReader fReader =  new PreserveFragmentReader(indexName);
        ODSSAXParser parser = new ODSSAXParser();
        xmlReader = (XMLReader) context.get("XMLReaderInstance2");
        parser.setXMLReader(xmlReader);
        parser.setHandler(fReader);
        try
        {
          parser.parseXML(hdl,pChild);
        }
        catch (Exception e)
        {
        }
      }
    }
  }

  public void doPreserve(ConversionContext context, TransformerHandler hdl, PreserveNameIndex indexName)
  {
    // DO Nothing
    
  }

}
