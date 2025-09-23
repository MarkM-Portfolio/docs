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

import java.io.StringReader;
import java.util.Map;

import javax.xml.parsers.SAXParser;

import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;

public class TableCellSAXLocator
{
  public static void buildStyleMap(ConversionContext context,Cell cell)
  {
    if(cell == null)
      return;
    ODSOffsetRecorder reader = (ODSOffsetRecorder) context.get("Recorder");
    String id = IndexUtil.generateCellId(cell.rowId, cell.cellId);
    if(id != null)
    {
      String xml = reader.locateById(id);
      
      if(xml != null)
      {
        XMLReader xmlReader;
        try
        {
          xmlReader = (XMLReader) context.get("XMLReaderInstance1");
          CellFragementLocator handler = new CellFragementLocator(context,cell);
          xmlReader.setContentHandler(handler);
          StringReader contentReader = new StringReader(xml);
          InputSource source = new InputSource(contentReader);
          xmlReader.parse(source);
        }
        catch (Exception e)
        {
        }

      }
      else
      {
        Boolean protect = (Boolean)context.get("SheetProtect");
        if(protect && ConversionUtil.hasValue(cell.styleId))
        {
          Map<String, Boolean> map = (Map<String, Boolean>) context.get("ProtectInfo");
          map.put(cell.styleId, false);
        }
      }
    }

  }
}
