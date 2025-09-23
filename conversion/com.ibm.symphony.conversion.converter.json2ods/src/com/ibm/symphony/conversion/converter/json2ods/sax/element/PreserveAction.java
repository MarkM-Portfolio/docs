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
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.json2ods.sax.ODSSAXParser;
import com.ibm.symphony.conversion.converter.json2ods.sax.PreserveFragmentReader;
import com.ibm.symphony.conversion.converter.json2ods.sax.XMLFragmenttReader;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.index.ODSOffsetRecorder;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public abstract class PreserveAction
{
  protected XMLReader xmlReader;
  public abstract void doPreserve(ConversionContext context, TransformerHandler hdl,PreserveNameIndex indexName);
  
  public void doPreserve(ConversionContext context, TransformerHandler hdl,PreserveNameIndex indexName,String id)
  {
    
  }
  
  protected void doAppend(ConversionContext context, TransformerHandler hdl,PreserveNameIndex indexName)
  {
    
    if(indexName.attrName.equals("child"))
    {
      doAppendAction(context,hdl,indexName);
    }
    else if(indexName.attrName.equals("parent"))
    {
      doAppendAction(context,hdl,indexName);
    }
    else
    {
      String value = indexName.address;
      new AttributesImpl().addAttribute("", "", indexName.attrName, "", value);
    }
  }
  
  private void doAppendAction(ConversionContext context,TransformerHandler hdl, PreserveNameIndex indexName)
  {
    ODSOffsetRecorder reader = (ODSOffsetRecorder)context.get("Recorder");
    String pElement = reader.locateById(indexName.elementId);
    try
    {
      if(pElement != null)
      {
        // check if is comments, simply use string match directly
        if (pElement.startsWith("<office:annotation"))
        {
          Boolean isCommentsUpdated = (Boolean)context.get("commentsupdated");
          // if new comments is updated, ignore preserved comments
          if (isCommentsUpdated != null && isCommentsUpdated == true)
            return;
          int endpos = pElement.indexOf(">");
          int ppos = pElement.indexOf("preserve=\"0\""); // find preserve="0" in attributes
          if (ppos>0 && endpos>0 && ppos<endpos)
          {
            // The comments is imported and no comments in json means the comments is deleted
            // Do not export preserved comments
            if (isCommentsUpdated == null)
              return;
          }
        }
        //
        //SAX Writer
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
