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
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.attribute.style.StyleFamilyAttribute;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.odftoolkit.odfdom.dom.style.props.OdfTableColumnProperties;
import org.odftoolkit.odfdom.dom.style.props.OdfTableRowProperties;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class TableRowStyleConvertor extends GeneralStyleConvertor
{

  private Map<OdfStyleProperty,String> optimalRowHeightStyle;
  // Map for row style name -- row height
  public TableRowStyleConvertor()
  {
	optimalRowHeightStyle = new HashMap<OdfStyleProperty,String>();
  }
  
  public static String getSheetDefaultRowStyleName(Sheet sheet)
  {
    if(sheet != null)
      return ODSConvertUtil.DEFAULT_EXPORT_TABLE_ROW_STYLE_NAME + "_" + sheet.sheetId;
    return null;
  }
  public void convertDefaultRowStyle(ConversionContext context)
  {
    Document doc = (Document)context.get("Source");
    OdfFileDom contentDom = (OdfFileDom)context.get("Target");
    HashMap<String,Integer> rowStyleHeightMap = (HashMap<String,Integer>) context.get("rowStyleHeightMap");
    OdfOfficeAutomaticStyles autoStyles = null;
    try
    {
      autoStyles = contentDom.getAutomaticStyles();
    }
    catch (Exception e)
    {
    }
    rowStyleHeightMap.put(ODSConvertUtil.DEFAULT_EXPORT_TABLE_ROW_STYLE_NAME, ConversionUtil.Row.defaultHeight);
    OdfStyle odfRowStyle = new OdfStyle((OdfFileDom)autoStyles.getOwnerDocument());
    odfRowStyle.setStyleNameAttribute(ODSConvertUtil.DEFAULT_EXPORT_TABLE_ROW_STYLE_NAME);
    odfRowStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_ROW.toString());
    odfRowStyle.setProperty(OdfTableRowProperties.RowHeight, ODSConvertUtil.convertPXToINCH(ConversionUtil.Row.defaultHeight));
    odfRowStyle.setProperty(OdfTableRowProperties.UseOptimalRowHeight, "true");
    autoStyles.appendChild(odfRowStyle);
    //create each sheet default row height
    for(Sheet sheet : doc.sheetList)
    {
      if(sheet.rowHeight != ConversionUtil.Row.defaultHeight)
      {
        String sheetRowStyleName = getSheetDefaultRowStyleName(sheet);
        if(sheetRowStyleName != null)
        {
          rowStyleHeightMap.put(sheetRowStyleName, sheet.rowHeight);
          OdfStyle odfSheetRowStyle = new OdfStyle((OdfFileDom)autoStyles.getOwnerDocument());
          odfSheetRowStyle.setStyleNameAttribute(sheetRowStyleName);
          odfSheetRowStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_ROW.toString());
          odfSheetRowStyle.setProperty(OdfTableRowProperties.RowHeight, ODSConvertUtil.convertPXToINCH(sheet.rowHeight));
          odfSheetRowStyle.setProperty(OdfTableRowProperties.UseOptimalRowHeight, "true");
          autoStyles.appendChild(odfSheetRowStyle);
        }
      }
    }
  }
  
  public void convertStyle(ConversionContext context, Row styledRow)
  {
    Document doc = (Document)context.get("Source");
    OdfFileDom content = (OdfFileDom)context.get("Target");
    HashMap<String,Integer> rowStyleHeightMap = (HashMap<String,Integer>) context.get("rowStyleHeightMap");
    OdfOfficeAutomaticStyles autoStyles = null;
    try
    {
      autoStyles = content.getAutomaticStyles();
    }
    catch (Exception e)
    {
    }
    String rowStyleName = ODSConvertUtil.getStyleName(OdfStyleFamily.TableRow, ConversionConstant.ROWID) ;
    rowStyleHeightMap.put(rowStyleName, styledRow.height);
    HashMap<String,List<String>> styleNameMap = (HashMap<String,List<String>>) context.get("styleNameMap");
    List<String> styleList = styleNameMap.get(styledRow.rowId);
    if(styleList == null)
    {
      createStyle(context,styledRow,rowStyleName,null,false );
    }
    else
    {
      Iterator<String> it = styleList.iterator();
      while(it.hasNext())
      {
        String oldStyleName = it.next();
        createStyle(context,styledRow,rowStyleName,oldStyleName,false );
        createOptRowHeightStyle(context,styledRow,oldStyleName );
        break;
      }
    }
  }
  public OdfStyleFamily getStyleFamily()
  {
    return OdfStyleFamily.TableRow;
  }
  
  
  public void createStyle(ConversionContext context, Row styledRow,String rowStyleName,String oldStyleName, Boolean isORHchanged)
  {
    OdfFileDom content = (OdfFileDom)context.get("Target");
    OdfOfficeAutomaticStyles autoStyles = null;
    try
    {
      autoStyles = content.getAutomaticStyles();
    }
    catch (Exception e)
    {
    }
    OdfStyle odfRowStyle = super.convertStyle(context, styledRow.rowId,oldStyleName);
        
    if(isORHchanged)
    {
	  odfRowStyle.setProperties(optimalRowHeightStyle);
	}
    
    odfRowStyle.setStyleNameAttribute(rowStyleName);
    odfRowStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_ROW.toString());
    odfRowStyle.setProperty(OdfTableRowProperties.RowHeight, ODSConvertUtil.convertPXToINCH(styledRow.height));
    autoStyles.appendChild(odfRowStyle);
    
    Map<String,Boolean> styleBreakMap = (HashMap<String,Boolean>) context.get("styleBreakMap");
    String breakBefore = odfRowStyle.getProperty(OdfTableRowProperties.BreakBefore);
    String breakAfter = odfRowStyle.getProperty(OdfTableRowProperties.BreakAfter);
    if((ConversionUtil.hasValue(breakBefore) && !"auto".equals(breakBefore)) || (ConversionUtil.hasValue(breakAfter) && !"auto".equals(breakAfter)))
    {
      styleBreakMap.put(rowStyleName, true);
    }
    
    HashMap<String,Map<String,Boolean>> rowOldNewStyleMap = (HashMap<String,Map<String,Boolean>>) context.get("rowOldNewStyleMap");
    if(oldStyleName != null )
    {
      Map<String, Boolean> oldStyleMap = new HashMap<String, Boolean>();
      oldStyleMap.put(oldStyleName,isORHchanged);
      rowOldNewStyleMap.put(rowStyleName, oldStyleMap);
    }
  }
  
  private void createOptRowHeightStyle(ConversionContext context, Row styledRow, String oldStyleName)
  {
    OdfStyle odfRowStyle = super.convertStyle(context, styledRow.rowId,oldStyleName);
    Map<OdfStyleProperty,String> styleMap = odfRowStyle.getStyleProperties();
    int oldRowHeight = 0;
    
	String oldHeight = odfRowStyle.getProperty(OdfTableRowProperties.RowHeight);
	if(oldHeight != null)
	{
	  oldRowHeight = Length.parseInt(oldHeight, Unit.PIXEL);
	  if("true".equals(odfRowStyle.getProperty(OdfTableRowProperties.UseOptimalRowHeight)) && oldRowHeight != styledRow.height)
	  {
	    styleMap.put(OdfTableRowProperties.UseOptimalRowHeight, "false");
	    optimalRowHeightStyle = styleMap;

	    String rowNewStyleName = ODSConvertUtil.getStyleName(OdfStyleFamily.TableRow, ConversionConstant.ROWID) ;
	    HashMap<String,Integer> rowStyleHeightMap = (HashMap<String,Integer>) context.get("rowStyleHeightMap");
	    rowStyleHeightMap.put(rowNewStyleName, styledRow.height);
	    createStyle(context,styledRow,rowNewStyleName, oldStyleName, true);
	  }
	}
  }
}
