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


import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.dom.element.table.TableTableColumnElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

import com.ibm.symphony.conversion.converter.json2ods.ContextInfo;
import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;

public class TableColumnConvertor extends GeneralConvertor
{
  protected String getNodeId(Object input)
  {
    Column column = (Column) input;
    String xmlId = column.columnId;
    return xmlId;
  }
  
  protected String getStyleId(Object input)
  {
    Column column = (Column) input;
    return column.styleId;
  }
  
  protected void startElement(ConversionContext context, Object input)
  {
    ContextInfo info = (ContextInfo)context.get("ContextInfo");
    Column column = (Column) input;
    String styleId = column.styleId;
    if(styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
      styleId = "";
    if(ConversionUtil.hasValue(styleId))
    {
      if (!info.hasStyledColumn)
        info.hasStyledColumn = true;
    }

  }
  
  protected void setAttributes(ConversionContext context,Object input,OdfElement element)
  {
    super.setAttributes(context, input, element);
    ContextInfo info = (ContextInfo)context.get("ContextInfo");
    Column column = (Column)input;
    setAttribute(column,(TableTableColumnElement)target);
    info.maxColCnt += getRepeatNumber(column);
  }
  
  private void setAttribute(Column column, TableTableColumnElement odfColumn)
  {
    if (column.visibility.equalsIgnoreCase("hide"))
    {
      odfColumn.setTableVisibilityAttribute("collapse");
    }
    else if (column.visibility.equalsIgnoreCase("filter"))
    {
      odfColumn.setTableVisibilityAttribute("filter");
    }
    else
      odfColumn.removeAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_VISIBILITY);
  }
 
  private int getRepeatNumber(Column column)
  {
    int repeatNum = 1;
    TableTableColumnElement odfColumn = (TableTableColumnElement)target;
    if (column.repeatedNum > 0){
      repeatNum = column.repeatedNum + 1;
      odfColumn.setTableNumberColumnsRepeatedAttribute(repeatNum);
    }
    else
      odfColumn.removeAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_REPEATED);
    return repeatNum;
  }
  
  private boolean isDefaultFormatting(ConversionContext context,String sheetId, Column column)
  {
    JsonToODSIndex odsIndex = (JsonToODSIndex)context.get("ODSIndex");
    return odsIndex.isDefaultFormatting(context,sheetId, -1, column.columnIndex);
  }
  
  public void setTableStyleNameAttribute(ConversionContext context,Object input, OdfElement element)
  {
    JsonToODSIndex odsIndex = (JsonToODSIndex)context.get("ODSIndex");
    Sheet sheet = (Sheet)context.get("Sheet");
    Column column = (Column)input;
    HashMap<String,List<Integer>> columnBreakMap = (HashMap<String,List<Integer>>) context.get("columnBreakMap");
    boolean isBreak = false;
    if(columnBreakMap != null)
    {
      int columnIndex = column.columnIndex;
      List<Integer> columnBreakList = columnBreakMap.get(sheet.sheetId);
      if(columnBreakList != null)
      {
        int columnBreakLength = columnBreakList.size() - 1;
        for(int colIndex = columnBreakLength; colIndex >= 0; colIndex--)
        {
          int columnBreakIndex = columnBreakList.get(colIndex);
          if(columnBreakIndex == columnIndex)
            isBreak = true;
        }
      }
    }
    TableTableColumnElement odfColumn = (TableTableColumnElement)element;
    HashMap<String,Integer> columnStyleWidthMap = (HashMap<String,Integer>) context.get("columnStyleWidthMap");
    Iterator<String> columnStyleNameIter = columnStyleWidthMap.keySet().iterator();
    
    HashMap<String,String> columnOldNewStyleMap = (HashMap<String,String>) context.get("columnOldNewStyleMap");
    Iterator<String> columnStyleIdIter = columnOldNewStyleMap.keySet().iterator();
    Boolean hasStyleName = false;
    
    OdfElement odfNode = odsIndex.getOdfNodes(column.columnId);   	
	String oldStyleName = null;
	if(odfNode != null)
	  oldStyleName = odfNode.getAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
	if(oldStyleName != null)
	{
      while(columnStyleIdIter.hasNext())
      {	
    	String newColumnStyleName = columnStyleIdIter.next();
    	if((oldStyleName.equals(columnOldNewStyleMap.get(newColumnStyleName))) && columnStyleWidthMap.get(newColumnStyleName).intValue() == column.width)
    	{
    	  odfColumn.setTableStyleNameAttribute(newColumnStyleName);
	      hasStyleName = true;
	      break;
    	}
      }
	}
    if(!hasStyleName)
    {
      while (columnStyleNameIter.hasNext())
      {
        String columnStyleName = columnStyleNameIter.next();
        boolean isBreakStyle = false;
        if(!isBreak)
        {
          Map<String,Boolean> styleBreakMap = (HashMap<String,Boolean>) context.get("styleBreakMap");
          if(styleBreakMap.containsKey(columnStyleName))
          {
            isBreakStyle = styleBreakMap.get(columnStyleName);
          }
        }
        if (columnStyleWidthMap.get(columnStyleName).intValue() == column.width && (isBreak == isBreakStyle))
        {
          odfColumn.setTableStyleNameAttribute(columnStyleName);
          break;
        }
      }
    }
    String defaultCellStyleName = column.styleId;
    HashMap<String,Map<String,String>> newStyleMap = (HashMap<String,Map<String,String>>) context.get("newStyleMap");
    String oldDefaultCellStyle = odfColumn.getTableDefaultCellStyleNameAttribute();
    if (!ConversionUtil.hasValue(defaultCellStyleName) || isDefaultFormatting(context, sheet.sheetId, column))
      defaultCellStyleName = ODSConvertUtil.DEFAULT_CELL_STYLE_NAME;
    else if(newStyleMap.containsKey(defaultCellStyleName))
    {
      if(ConversionUtil.hasValue(oldDefaultCellStyle) && !ODSConvertUtil.DEFAULT_CELL_STYLE_NAME.equals(oldDefaultCellStyle))  
        defaultCellStyleName = newStyleMap.get(defaultCellStyleName).get(oldDefaultCellStyle);
      else
        defaultCellStyleName = newStyleMap.get(defaultCellStyleName).get(ConversionConstant.KEY_NEW_DEFAULT);
    }
    else
      defaultCellStyleName = oldDefaultCellStyle;
    odfColumn.setTableDefaultCellStyleNameAttribute(defaultCellStyleName);
  }
  
  protected OdfElement createNewElement(ConversionContext context,Object input,OdfElement parent)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("Target");
    try
    {
      TableTableColumnElement tableElement = new TableTableColumnElement(contentDom);
      return tableElement;
    }
    catch (Exception e)
    {
//      LOG.log(Level.WARNING, "can not create a table column", e);
    }
    return null;
  } 
}
