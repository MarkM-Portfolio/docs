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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.table.TableTableColumnElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfTableCellProperties;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class TableColumnLocator extends GeneralLocator
{

  public String getStyleId()
  {
    Column column = (Column) target;
    if( column == null)
      return null;
    return column.columnId;
  }
  
  public void traverse(ConversionContext localtorContext, Object input, Object output)
  {
    super.traverse(localtorContext, input, output);
    HashMap<String, List<String>> styleNameMap = (HashMap<String,List<String>>) localtorContext.get("styleNameMap");
    HashMap<String, String> colDefaultCellStyleMap = (HashMap<String, String>) localtorContext.get("colDefaultCellStyleMap");
    Column column = (Column) target;
    if(column != null )
    {
      String cellStyleId = column.styleId;
      String dCellStyleName = ((TableTableColumnElement)element).getTableDefaultCellStyleNameAttribute(); 
      if(ConversionUtil.hasValue(cellStyleId) && !"".equals(dCellStyleName))
      {
        List<String> styleList = null;
        if(!styleNameMap.containsKey(cellStyleId))
        {
          styleList = new ArrayList<String>();
        }
        else
        {
          styleList = styleNameMap.get(cellStyleId);
        }
        styleList.add(dCellStyleName);
        styleNameMap.put(cellStyleId,styleList );
        if(ConversionUtil.hasValue(column.columnId))
        {
          colDefaultCellStyleMap.put(column.columnId, cellStyleId);
          Boolean protect = (Boolean)localtorContext.get("SheetProtect");
          if(protect)
          {
            Map<String, Boolean> map = (Map<String, Boolean>) localtorContext.get("ProtectInfo");
            OdfStyle style = ODSConvertUtil.getOldStyle(localtorContext,dCellStyleName,OdfStyleFamily.TableCell);
            
            if(null != style)
            {
              String cellProtect = style.getProperty(OdfTableCellProperties.CellProtect);       
              if("none".equals(cellProtect))
                map.put(column.columnId, false);
            }
          }
        }
      }
    }
  }
  
  public void startElement(ConversionContext locatorContext,Object output)
  {
    if(output == null)
      return;
    Sheet sheet = (Sheet) output;
    Document doc = (Document) locatorContext.get("Source");
    String id = element.getAttribute(IndexUtil.ID_STRING);
    target = sheet.getStyledColumnById(id);
  }
  
}
