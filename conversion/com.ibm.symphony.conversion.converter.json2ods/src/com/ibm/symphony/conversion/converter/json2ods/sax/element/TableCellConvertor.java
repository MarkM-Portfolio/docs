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

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.xml.sax.XMLReader;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.json2ods.sax.CellFragmentReader;
import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.json2ods.sax.ODSSAXParser;
import com.ibm.symphony.conversion.converter.json2ods.sax.PreserveFragmentReader;
import com.ibm.symphony.conversion.converter.json2ods.sax.XMLFragmenttReader;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.index.IndexUtil;
import com.ibm.symphony.conversion.spreadsheet.index.ODSOffsetRecorder;

public class TableCellConvertor extends GeneralSAXConvertor
{

  
  private static final Logger LOG = Logger.getLogger(TableCellConvertor.class.getName());
  
  protected String getNodeId(Object input)
  {
    if(ConversionUtil.hasValue(id))
      return id;
    Cell cell = (Cell)input;
    return IndexUtil.generateCellId(cell.rowId, cell.cellId);
  }
  
  protected String getStyleId(Object input)
  {
    Cell cell = (Cell)input;
    return cell.styleId;
  }
  
  public void convert(ConversionContext context,Object input, Object output)
  {
    reader = (ODSOffsetRecorder) context.get("Recorder");
    hdl = (TransformerHandler)output;
    String xml = getTargetXMLById(context, input);
    
    try
    {
      XMLFragmenttReader fReader =  new CellFragmentReader(context,input);
      ODSSAXParser parser = new ODSSAXParser();
      XMLReader xmlReader = (XMLReader)context.get("XMLReaderInstance1");;
      parser.setXMLReader(xmlReader);
      parser.setHandler(fReader);
      parser.parseXML(context,hdl,input, xml);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  
  protected String createNewElement(ConversionContext context,Object input)
  {
    try
    {
      Cell cell = (Cell) input;
      String xml = "";
      
      if(cell.isCovered)
      {
          xml = "<table:covered-table-cell></table:covered-table-cell>";
      }
      else
      {
          xml = "<table:table-cell></table:table-cell>";
      }
      return xml;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "can not create a table cell", e);
    }
    return null;
  }
}
