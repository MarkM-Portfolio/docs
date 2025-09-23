/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.style;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.attribute.style.StyleFamilyAttribute;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.odftoolkit.odfdom.dom.style.props.OdfTableColumnProperties;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;

public class TableColumnStyleConvertor extends GeneralStyleConvertor
{
  public OdfStyleFamily getStyleFamily()
  {
    return OdfStyleFamily.TableColumn;
  }
  
  public void convertDefaultColumnStyle(ConversionContext context)
  {
    OdfFileDom contentDom = (OdfFileDom)context.get("Target");
    HashMap<String,Integer> columnStyleWidthMap = (HashMap<String,Integer>) context.get("columnStyleWidthMap");
    OdfOfficeAutomaticStyles autoStyles = null;
    try
    {
      autoStyles = contentDom.getAutomaticStyles();
    }
    catch (Exception e)
    {
    }
    columnStyleWidthMap.put(ODSConvertUtil.DEFAULT_EXPORT_COLUMN_STYLE_NAME, ConversionUtil.Column.defaultWidth);
    OdfStyle odfColumnStyle = new OdfStyle((OdfFileDom)autoStyles.getOwnerDocument());
    odfColumnStyle.setStyleNameAttribute(ODSConvertUtil.DEFAULT_EXPORT_COLUMN_STYLE_NAME);
    odfColumnStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_COLUMN.toString());
    odfColumnStyle.setProperty(OdfTableColumnProperties.ColumnWidth, ODSConvertUtil.convertPXToINCH(ConversionUtil.Column.defaultWidth));
    autoStyles.appendChild(odfColumnStyle);
  }
  
  
  public void convertStyle(ConversionContext context, Column styledColumn)
  {
    Document doc = (Document)context.get("Source");
    OdfFileDom contentDom = (OdfFileDom)context.get("Target");
    HashMap<String,Integer> columnStyleWidthMap = (HashMap<String,Integer>) context.get("columnStyleWidthMap");
    OdfOfficeAutomaticStyles autoStyles = null;
    try
    {
      autoStyles = contentDom.getAutomaticStyles();
    }
    catch (Exception e)
    {
    }
    String columnStyleName = ODSConvertUtil.getStyleName(OdfStyleFamily.TableColumn, ConversionConstant.COLUMNID) ;
    columnStyleWidthMap.put(columnStyleName, styledColumn.width);
    HashMap<String,List<String>> styleNameMap = (HashMap<String,List<String>>) context.get("styleNameMap");
    List<String> styleList = styleNameMap.get(styledColumn.columnId);
    if(styleList == null)
      createStyle(context,styledColumn,columnStyleName,null);
    else
    {
      Iterator<String> it = styleList.iterator();
      while(it.hasNext())
      {
        String oldStyleName = it.next();
        //check the specific value 
        createStyle(context,styledColumn,columnStyleName,oldStyleName);
        break;
      }
    }
  }
  
  public void createStyle(ConversionContext context, Column styledColumn,String columnStyleName,String oldStyleName)
  {
    OdfFileDom contentDom = (OdfFileDom)context.get("Target");
    OdfOfficeAutomaticStyles autoStyles = null;
    try
    {
      autoStyles = contentDom.getAutomaticStyles();
    }
    catch (Exception e)
    {
    }
    OdfStyle odfColumnStyle = super.convertStyle(context, styledColumn.columnId,oldStyleName);
    odfColumnStyle.setStyleNameAttribute(columnStyleName);
    odfColumnStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_COLUMN.toString());
    odfColumnStyle.setProperty(OdfTableColumnProperties.ColumnWidth, ODSConvertUtil.convertPXToINCH(styledColumn.width));
    autoStyles.appendChild(odfColumnStyle);
    
    Map<String,Boolean> styleBreakMap = (HashMap<String,Boolean>) context.get("styleBreakMap");
    String breakBefore = odfColumnStyle.getProperty(OdfTableColumnProperties.BreakBefore);
    String breakAfter = odfColumnStyle.getProperty(OdfTableColumnProperties.BreakAfter);
    if((ConversionUtil.hasValue(breakBefore) && !"auto".equals(breakBefore)) || (ConversionUtil.hasValue(breakAfter) && !"auto".equals(breakAfter)))
    {
      styleBreakMap.put(columnStyleName, true);
    }
    
    HashMap<String,String> columnOldNewStyleMap = (HashMap<String,String>) context.get("columnOldNewStyleMap");
    if(oldStyleName != null)
      columnOldNewStyleMap.put(columnStyleName, oldStyleName);
  }
  
}
