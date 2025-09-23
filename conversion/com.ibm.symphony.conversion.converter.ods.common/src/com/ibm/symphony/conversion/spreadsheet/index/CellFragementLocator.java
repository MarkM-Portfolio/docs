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

import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;

public class CellFragementLocator extends DefaultHandler
{
  private ConversionContext localtorContext;
  private String cellStyleId;
  private String cellColId;

  CellFragementLocator(ConversionContext context,Cell cell)
  {
    this.localtorContext = context;
    this.cellStyleId = cell.styleId;
    this.cellColId = cell.cellId;
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    if(!qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL) && !qName.equals(ConversionConstant.ODF_ELEMENT_TABLECONVEREDTABLE_CELL))
      return;
    String styleName = attributes.getValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
    
    
    if(ConversionUtil.hasValue(styleName))
    {
      if(ConversionUtil.hasValue(cellStyleId))
      {
        HashMap<String, List<String>> styleNameMap = (HashMap<String,List<String>>) localtorContext.get("styleNameMap");
        HashMap<String, String> mColCellMap = (HashMap<String,String>) localtorContext.get("MergeColumnCellMap");
        List<String> styleList = styleNameMap.get(cellStyleId);
        if( styleList == null )
          styleList = new ArrayList<String>();
        if(!styleList.contains(styleName))
          styleList.add(styleName);
        styleNameMap.put(cellStyleId,styleList);
        mColCellMap.put(cellStyleId, cellColId);
      }
      else if(ConversionUtil.hasValue(cellColId))
      {
        HashMap<String, List<String>> columnCellMap = (HashMap<String,List<String>>) localtorContext.get("columnCellMap");
        List<String> styleList = columnCellMap.get(cellColId);
        if( styleList == null )
          styleList = new ArrayList<String>();
        if(!styleList.contains(styleName))
          styleList.add(styleName);
        columnCellMap.put(cellColId,styleList);
      }
    }
    else
    {
      boolean isProtect = true;
      Map<String, Boolean> map = (Map<String, Boolean>) localtorContext.get("ProtectInfo");
      if(ConversionUtil.hasValue(cellColId))
      {
        if(map.containsKey(cellColId))
          isProtect = false;
      }
      Boolean protect = (Boolean)localtorContext.get("SheetProtect");
      if(protect && ( !isProtect && ConversionUtil.hasValue(cellStyleId)))
      {
        map.put(cellStyleId, false);
      }
    }
  }
  
  public void endElement(String uri, String localName, String qName) throws SAXException
  {
  }
}
