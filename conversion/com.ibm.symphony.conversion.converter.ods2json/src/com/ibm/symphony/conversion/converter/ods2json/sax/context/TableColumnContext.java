/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.style.OdfStyleTableColumnProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableRowProperties;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.ContextInfo;
import com.ibm.symphony.conversion.converter.ods2json.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.attribute.AttributeConvertorFactory;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class TableColumnContext extends GeneralContext
{
  private static final String CLAZZ = TableColumnContext.class.getName();
  private static final Logger LOG = Logger.getLogger(CLAZZ);
//  private boolean bInvalid;//if the context is invalid or not, invalid means that it should not convert as JSONModel
  public TableColumnContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
//    ConversionUtil.Sheet sheet = (Sheet) mContext.get("Sheet");
//    if(sheet == null)
//      mbInvalid = true;
//    else
//      mbInvalid = false;
  }
  
  public void startElement(AttributesImpl attributes){
//    if (mbInvalid)
//      return;
    super.startElement(attributes);
    ConversionUtil.Document document = (Document) mContext.get("Target");
    ConversionUtil.Sheet sheet = (Sheet) mContext.get("Sheet");
    ContextInfo Info = (ContextInfo) mContext.get("TableInfo");
    
    ConversionUtil.Column column = new ConversionUtil.Column();
    this.mTarget = column;
    
    int columnIndex = Info.columnIndex;
    int width = 0;
    String sWidth = XMLUtil.getStyleProperty(mContext, this, OdfStyleTableColumnProperties.ColumnWidth);
    if (sWidth != null)
      width = (int) Math.round(Length.parseDouble(sWidth, Unit.PIXEL));
    String defaultCellStyleName = this.getAttrValue("table:default-cell-style-name");
    String visibility = AttributeConvertorFactory.getInstance().getConvertor("table:visibility").convert(mContext, this, column);
//  check if the defaultCellStyle is the default style of the current document
    String styleId = "";
    if (defaultCellStyleName != null)
      styleId = ODSConvertUtil.findCellStyleId(mContext, defaultCellStyleName);
    if (styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
      styleId = "";
    String colRepeateNumberAttr = this.getAttrValue("table:number-columns-repeated");
    int colRepeateNumber = (colRepeateNumberAttr == null) ? 1 : Integer.parseInt(colRepeateNumberAttr);
    if (colRepeateNumber > 1)
      column.repeatedNum = (colRepeateNumber - 1);
    //set column id for each column incase that the default cell style name is we can not recognized
    column.columnId = ConversionUtil.updateIdArray(columnIndex, sheet, document, false, false);
    this.addIdOnOdfElement(column.columnId);
    
    // if the column is no default height and has default cell style then add to columns in meta.js
    if ((width != ConversionConstant.DEFAULT_WIDTH_VALUE) || ConversionUtil.hasValue(styleId) || ConversionUtil.hasValue(visibility))
    {
      // columnIndex is unique in the current sheet
      column.columnIndex = columnIndex;
      column.sheetId = sheet.sheetId;
      column.width = width;
      column.visibility = visibility;
      if (ConversionUtil.hasValue(styleId))
      {
        column.styleId = styleId;
        if (!Info.hasStyledColumn)
          Info.hasStyledColumn = true;
        column.defaultCellStyleName = defaultCellStyleName;
      }
      document.uniqueColumns.uniqueColumnList.add(column);
    }
  }
  
  public void endElement(){
//    if (mbInvalid)
//      return;
    super.endElement();
    ConversionUtil.Document document = (Document) mContext.get("Target");
    ContextInfo Info = (ContextInfo) mContext.get("TableInfo");
//    Integer colRepeateNumberAttr = columnElement.getTableNumberColumnsRepeatedAttribute();
//    int colRepeateNumber = (colRepeateNumberAttr == null) ? 1 : colRepeateNumberAttr.intValue();
    ConversionUtil.Column column = (ConversionUtil.Column)this.mTarget;
    int defaultWidth = document.defaultColumnWidth;
    
    Info.columnIndex += (column.repeatedNum + 1);
    
    if(column.width != defaultWidth || (ConversionUtil.hasValue(column.styleId) && !column.styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE_NAME)))
    	Info.maxColInRowWithStyle = Math.min(Info.columnIndex, ConversionConstant.MAX_SHOW_COL_NUM);
    else
    	Info.maxColInRowWithStyle = Math.min(Info.columnIndex - column.repeatedNum, ConversionConstant.MAX_SHOW_COL_NUM);
  }
  
}
