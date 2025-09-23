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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.logging.Level;

import java.util.logging.Logger;

import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.ColumnRange;
import com.ibm.symphony.conversion.converter.ods2json.sax.ContextInfo;
import com.ibm.symphony.conversion.converter.ods2json.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.attribute.AttributeConvertorFactory;
import com.ibm.symphony.conversion.converter.ods2json.sax.style.TableCellStyleHelper;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.ErrorCode;

public class TableCellContext extends GeneralContext
{

  private static final String CLAZZ = TableCellContext.class.getName();
  private static final Logger LOG = Logger.getLogger(CLAZZ);
  
  private ConversionUtil.Row row;//parent target
  static HashMap<String, Boolean> cellAttrs = new HashMap<String, Boolean>();
  //add the attribute name to cellAttrs when we support such attribute
  static{
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_TABLE_TABLE_FORMULA, true);
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_TYPE, true);
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE, true);
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_OFFICE_BOOLEAN_VALUE, true);
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_OFFICE_STRING_VALUE, true);
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_OFFICE_CURRENCY, true);
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_OFFICE_DATE_VALUE, true);
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_OFFICE_TIME_VALUE, true);
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_REPEATED, true);
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_SPANNED, true);
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME, true);
    cellAttrs.put(ConversionConstant.ODF_ATTRIBUTE_TABLE_CONTENT_VALIDATION_NAME, true);
  }
  public TableCellContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
    mbGenerateXMLIdAtEnd = true;
  }
  
  public void startElement(AttributesImpl attributes)
  {
    super.startElement(attributes);
    
    mbChildPreserve = true;
    this.row = (ConversionUtil.Row)getParentConvertor().getTarget();;
    
    ConversionUtil.Cell cell = new ConversionUtil.Cell();
    this.mTarget = cell;
    String cellRepeateAttr = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_REPEATED);
    int cellRepeateNumber = (cellRepeateAttr == null)?0:Integer.parseInt(cellRepeateAttr);
    if (cellRepeateNumber > 1)
      cell.repeatedNum = (cellRepeateNumber - 1);
  }
  
  //if this cell element contains the unknown attribute
  //such as table:number-rows-spanned, table:content-validation-name
  //when we support such attribute, we should add it to 
  private boolean hasUnknownAttrs(){
    int length = mAttrs.getLength();
    for(int i = 0; i < length; i++){
      String qName = mAttrs.getQName(i);
      if(!cellAttrs.containsKey(qName))
        return true;
    }
    return false;
  }
  
  public void endElement()
  {
    dealWithChildContext();
    ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
    ConversionUtil.Sheet sheet = (ConversionUtil.Sheet) mContext.get("Sheet");
    ConversionUtil.Cell cell = (ConversionUtil.Cell) mTarget;
    String formula = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_TABLE_FORMULA);
    
    int cellRepeateNumber = cell.repeatedNum + 1;
    ContextInfo info = (ContextInfo) mContext.get("TableInfo");
    int cellColumnIndex = info.cellColumnIndex;
    cell.cellIndex = cellColumnIndex;
    if(this.hasUnknownAttrs())
      setCellId(info, cell, sheet, document);
    
    String validationName = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_CONTENT_VALIDATION_NAME);
    if(validationName != null){
    	int sr = info.rowIndex + 1;
    	int er = sr + row.repeatedNum;
    	int sc = cellColumnIndex + 1;
    	int ec = sc + cell.repeatedNum;
    	
    	if(er > ConversionConstant.MAX_ROW_INDEX)
    		er = ConversionConstant.MAX_ROW_NUM;
    	document.addValidationRange(validationName, sheet.sheetName, sr, er, sc, ec);
    }
    
    String colSpanAttr = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_SPANNED);
    int colSpan = (colSpanAttr == null)?1:Integer.parseInt(colSpanAttr);
    if (colSpan > 1)
    {
      int sIndex = cellColumnIndex + 1;
      int eIndex = sIndex + colSpan - 1;
      info.coverInfo.addCoverInfo(info.rowIndex + 1, sIndex, eIndex);
    }
    String rowSpanAttr = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_ROWS_SPANNED);
    int rowSpan = (rowSpanAttr == null)?1:Integer.parseInt(rowSpanAttr);
    String cellStyleName = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);

    String styleId = ODSConvertUtil.findCellStyleId(mContext, cellStyleName);
    String cellStyleId = getCellStyleId( styleId, row.styleId, 
        ODSConvertUtil.getColumnStyleId(mContext, sheet, cellColumnIndex), info.bRowHasDefaultCellStyle);
    if(ConversionUtil.hasValue(styleId) && !ConversionUtil.hasValue(cellStyleId) && cell.repeatedNum > 0)
      cellStyleId = styleId;
    // get commentsId of this cell
    // if the cell has content or has cell style(different with the row/column default cell style)
    // or has comment then add to row in content.js
    boolean bFormula = ODSConvertUtil.isFormulaCell(formula);
    String name = this.getNodeName();
    String typeValue = this.getAttrValue("office:value");
    if (ConversionUtil.hasValue(cell.value) || ConversionUtil.hasValue(cellStyleId) || bFormula //|| cell.comment != null
        || colSpan > 1 || name.contains("covered") || ConversionUtil.hasValue(typeValue))
    {
      //the initial calculateValue should be null, rather than ""
      //because the formula calculate value might be "" and should be exported to json
      cell.calculateValue = null;
      if (bFormula)
      {
        String f = AttributeConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ATTRIBUTE_TABLE_TABLE_FORMULA).convert(mContext, this, cell);
        if(f == null)
        {
          bFormula = false;
        }else
        {
          cell.value = f;
          sheet.formulaCellList.add(cell);
          info.formulaCnt++;
          if( this.getAttrValue("table:number-matrix-columns-spanned") != null || 
              this.getAttrValue("table:number-matrix-rows-spanned") != null)
          {
            //TODO: array formula support, suppose to create a range or just set property for thsi cell(like merge cells)
            cell.type |= ConversionConstant.FORMULA_TYPE_ARRAY;
          }else
            cell.type |= ConversionConstant.FORMULA_TYPE_NORMAL;
        }
      }

      AttributeConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_TYPE).convert(mContext, this, cell);
      
      if(bFormula && (cell.calculateValue == null))
      {
        //the formula cell value is represent by <text:p>
        //cell type should be unknown when there is no <text:p> element
         cell.calculateValue = cell.showValue;
        if(cell.calculateValue == null)
        {
          cell.type = (cell.type & ConversionConstant.FORMULA_TYPE_MASK) | (ConversionConstant.CELL_TYPE_UNKNOWN << 3);
          document.bCalculated = false;
        }else{
          cell.type |= (ConversionConstant.CELL_TYPE_STRING << 3);
        }
      }
      
      if((cell.type & (ConversionConstant.CELL_TYPE_UNKNOWN << 3)) > 0)
        document.bCalculated = false;
      //check if the cell is error type
      // 1) formula return the error
      // 2) user directly write down the error message
      String v = null;
      Object checkValue = null;
      if(bFormula){
        checkValue = cell.calculateValue;
      }else{
        checkValue = cell.value;
        //backward compatiable with IBM Docs exported files which user write down the error directly
        if(ConversionUtil.hasValue(checkValue))
        {
          v = checkValue.toString();
        }
      }
      try
      {
        if( (checkValue instanceof Number && (Float.parseFloat(checkValue.toString()) == 0f) ))// Symphony write the float 0 as the error 
            v = cell.showValue;
      }catch(NumberFormatException  e)
      {
      }
      if(ConversionUtil.hasValue(v))
      {
        ErrorCode code = ErrorCode.enumValueOf(v);
        if(code != null)
        {
          // even it is not a formula, but user input "#N/A" or "#NAME?"
          // the cell type is error
          if(bFormula)
          {
            cell.calculateValue = v;
          }else
          {
            // while for ods, it will export table:formula="of:#N/A", we should not consider it as formula
            // so reset calculate value and ec
            cell.calculateValue = null;
            cell.value = v;
          }
          cell.ec = code;
          cell.type |= (ConversionConstant.CELL_TYPE_ERROR << 3);
        }
      }

      if(colSpan > 1)
        cell.colSpan = colSpan;
      if(rowSpan > 1)
        cell.rowSpan = rowSpan;
      if(ConversionUtil.hasValue(cellStyleId))
        cell.styleId = cellStyleId;
      
      // update rowsIdArray, columnsIdArray
      // the size of columnIdArray might be less than cellColumnIndex
      // due to that the previous column might be default cell style
      // and do not need to create column id for it,
      // so in this condition, we should insert (cellColumnIndex - size of columnIdArray) empty strings
      //if cell has value/style, set the id as normal, because we will use this to check if isOutOfRowCapacilty
      setCellId(info, cell, sheet, document);
      
      if (ConversionUtil.hasValue(cell.value))
      {
        info.maxColInRowWithValue = Math.max(info.maxColInRowWithValue, cellColumnIndex + cellRepeateNumber);
        info.cellCnt++;//here the cell cnt only include the value cell
      }
      row.cellList.add(cell);
      // just convert first row if it is in multiple-row merged cell
      // if (info.coverInfo.isCoveredCell(info.rowIndex + 1, cellColumnIndex + 1) && name.contains("covered")){
      // cell.isCovered = true;
      // }
      // check if the cell is the covered cell
      // the covered cell might be repeated if the row span and col span covered cell are adjacent
      // so we have to split it, because we do not support row span now
      //           1  2  3  4  5
      //            ___________
      // such as A |_________| |
      //         B |_________| |
      //         C |_________|_|
      // A1 colspan is 4, A5 rowspan is 3, B2 colSpan is 4
      // so B2 is the covered cell with repeate number=4
      // the first 3 belong to B2, the last one belong to B5,
      // but we do not support row span, so we should split B2(repeateNum=4)
      // to B2(repeateNum=3) and B5
      int repeateNum = cell.repeatedNum;
      if(repeateNum>0)
      {
        int num = info.cellColumnIndex + repeateNum + 1;
        if(num <= 1023)
        {
          for(int i = 0; i<repeateNum;i++ )
          {
            int index = info.cellColumnIndex + 1 + i;
            int size = sheet.columnIdArray.size();
            if(index >=size)
              sheet.columnIdArray.add("");
          }
        }
         
      }
      int startColIndex = cellColumnIndex + 1;
      int endColIndex = startColIndex + repeateNum;
      ArrayList<ColumnRange> coveredRanges = info.coverInfo.getCoveredColumnRange(info.rowIndex + 1, startColIndex, endColIndex);
      int coveredRangeslength = coveredRanges.size();
      ConversionUtil.Cell splitCoveredCell = null;
      if (coveredRangeslength > 1)
        LOG.log(Level.WARNING, "the covered info might be error");
      else if (coveredRangeslength == 1)
      {
        // int colIndex = startColIndex;
        cell.isCovered = true;
        ColumnRange range = coveredRanges.get(0);
        if (range.endCol < endColIndex)
        {
          cell.repeatedNum = range.endCol - startColIndex;
          splitCoveredCell = new ConversionUtil.Cell(cell);
          splitCoveredCell.cellIndex = range.endCol;
          splitCoveredCell.isCovered = false;
          splitCoveredCell.repeatedNum = endColIndex - range.endCol - 1;
          splitCoveredCell.cellId = ConversionUtil.updateIdArray(splitCoveredCell.cellIndex, sheet, document, false, false);
          splitCoveredCell.rowId = cell.rowId;
        }
      }
      // ODF cell repeat number is different with concord
      // in odf, if cell has content, it still can have repeat number
      // so we have to split it in concord
      splitRepeatedValueCell(cell, sheet, document, info, bFormula);
      if (splitCoveredCell != null)
      {
        row.cellList.add(splitCoveredCell);
        splitRepeatedValueCell(splitCoveredCell, sheet, document, info, bFormula);
      }
    }else if(ConversionUtil.hasValue(cellStyleName)){
      //if cell has style but cell style id is "", means that it must contain the style we do not support
      //so here just create cell id for this cell for tracking the set default cell style in client
      //the cell only have style(does not have value) might be > MAX_REF_ROW_NUM, 
      //but we do not treat it as out of capacity, so call updateIdArray, set bMax=true
      cell.cellId = ConversionUtil.updateIdArray(info.cellColumnIndex, sheet, document, false, true);
      cell.rowId = ConversionUtil.updateIdArray(info.rowIndex, sheet, document, true, true);
      
      if(ConversionUtil.hasValue(row.rowId) && !row.rowId.equals(cell.rowId))
        LOG.log(Level.WARNING, "row id:" + row.rowId + " is not the same with cell.rowId" + cell.rowId);
      row.rowId = cell.rowId;
    }
    //do preserve here, because the cell already has xml id
    super.endElement();
    
    cellColumnIndex += cellRepeateNumber;
    info.cellColumnIndex = cellColumnIndex;
  
  }
  
  private void setCellId(ContextInfo info, ConversionUtil.Cell cell , ConversionUtil.Sheet sheet, ConversionUtil.Document document)
  {
      cell.cellId = ConversionUtil.updateIdArray(info.cellColumnIndex, sheet, document, false, false);
      cell.rowId = ConversionUtil.updateIdArray(info.rowIndex, sheet, document, true, false);
      
      if(ConversionUtil.hasValue(row.rowId) && !row.rowId.equals(cell.rowId))
        LOG.log(Level.WARNING, "row id:" + row.rowId + " is not the same with cell.rowId" + cell.rowId);
      row.rowId = cell.rowId;
      String cellXmlId = generateCellId(cell.rowId,cell.cellId);
      this.addIdOnOdfElement(cellXmlId);
  }

  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    
    GeneralContext context = null;
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case TEXT_P :
      case TEXT_H :
        context = new TextPContext(mImport, uri, localName, qName, mTarget);
        break;
      case DRAW_FRAME:
        context = new DrawFrameContext(mImport, uri, localName, qName, mTarget);
        break;  
      case DRAW_IMAGE:
        context = new DrawImageContext(mImport, uri, localName, qName, mTarget);
        break; 
      case OFFICE_ANNOTATION:
        context = new OfficeAnnotationContext(mImport, uri, localName, qName, mTarget);
        break; 
      case DRAW_A:
        context = new DrawAContext(mImport, uri, localName, qName, mTarget);
        break; 
//      case OFFICE_ANNOTATION:
        // context = new AnnotationContext(importer, localName, qName, target);
        // break;
      default:
        context =  new GeneralContext(mImport, uri, localName, qName, mTarget);
    }
    return context;
  }

  private void splitRepeatedValueCell(ConversionUtil.Cell cell, ConversionUtil.Sheet sheet, ConversionUtil.Document document, ContextInfo info, boolean bFormula)
  {
    if (cell != null && ConversionUtil.hasValue(cell.value) && cell.repeatedNum > 0)
    {
      int cellColumnIndex = cell.cellIndex;
      int cellRepeateNumber = cell.repeatedNum + 1;
      info.cellCnt += cell.repeatedNum;
      if(bFormula)
        info.formulaCnt += cell.repeatedNum;
      cell.repeatedNum = 0;
      int repeateColCount = cellColumnIndex + cellRepeateNumber - sheet.columnIdArray.size();
      for (int i = 0; i < repeateColCount; i++)
        sheet.columnIdArray.add("");
      
      for (int i = 1; i < cellRepeateNumber; i++)
      {
        ConversionUtil.Cell cloneCell = new ConversionUtil.Cell(cell);
        int index = cellColumnIndex + i;
        cloneCell.cellIndex = index;
        String repeatColIdInArray = sheet.columnIdArray.get(index);
        if (repeatColIdInArray.equalsIgnoreCase(""))
        {
          repeatColIdInArray = document.createId(false);// ConversionConstant.COLUMNID + document.maxColumnId++;
          sheet.columnIdArray.set(index, repeatColIdInArray);
        }
        cloneCell.cellId = repeatColIdInArray;
        cloneCell.rowId = row.rowId;
        row.cellList.add(cloneCell);
      }
    }

  }

  private CellStyleType cloneNewStyle(CellStyleType orginStyle, Document document)
  {
    CellStyleType cellStyle = new CellStyleType(orginStyle);
    cellStyle.styleId = TableCellStyleHelper.createStyleId(mContext);
    document.cellStyleList.add(cellStyle);
    return cellStyle;
  }

  // after child context has been converted complete
  // should set mbChildPreserve=true to collect all the child convertor
  private void dealWithChildContext()
  {
    ConversionUtil.Cell cell = (ConversionUtil.Cell) mTarget;
    StringBuilder buf = new StringBuilder();
    int length = this.mChildConvertors.size();
    boolean hasText = false;
    for (int i = 0; i < length; i++)
    {
      GeneralContext conv = mChildConvertors.get(i);
      if (conv instanceof TextPContext)
      {
        hasText = true;
        TextPContext pContext = (TextPContext) conv;
        buf.append(pContext.getText());
        boolean hasLink = pContext.isHyperlinkExist();
        if (hasLink)
        {
          cell.link = pContext.getHerf();
          // add hyperlink style
          ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
          CellStyleType orginstyle = document.getCellStyleFromStyleId(cell.styleId);
          if (orginstyle == null || orginstyle.fontUnderline != true || !"#0000ff".equalsIgnoreCase(orginstyle.fontColor))
          {
            CellStyleType newstyle = (orginstyle == null) ? cloneNewStyle(new CellStyleType(), document) : cloneNewStyle(orginstyle,
                document);
            newstyle.fontUnderline = true;
            newstyle.fontColor = "#0000ff";
            cell.styleId = newstyle.styleId;
          }

        }
      }
    }
    
    if(hasText)
    {
      String value = buf.toString();
      if (value.endsWith("\n"))
      {
        int end = value.lastIndexOf("\n");
        value = value.substring(0, end);
      }
   // TODO: bug fix for getDisplayText, the comment content has also been append
      cell.showValue = value;
      cell.value = value;
    }else
      cell.showValue = null;
  }

//styleid is empty or equal to DEFAULT_CELL_STYLE are not same
  // @param bRowHasDefaultCellStyle recognize the rowStyleId is collected from the most occurred cell style(true)
  // or is stored in odf document(false, Symphony always does not store default cell style for row)
  private String getCellStyleId(String cellStyleId, String rowStyleId, String columnStyleId, boolean bRowHasDefaultCellStyle)
  {

    String returnStyleId = "";
    if (ConversionUtil.hasValue(cellStyleId))
    {
      if (ConversionUtil.hasValue(rowStyleId))
      {
        // if cell style is equal to row style, won't set this style
        if (!cellStyleId.equals(rowStyleId))
          returnStyleId = cellStyleId;
      }
      else if (ConversionUtil.hasValue(columnStyleId))
      {
        // if cell style is equal to column style, won't set this style
        if (!cellStyleId.equals(columnStyleId))
          returnStyleId = cellStyleId;
      }
      else
        returnStyleId = cellStyleId;
    }
    else if (ConversionUtil.hasValue(rowStyleId))
    {
      if (bRowHasDefaultCellStyle)
      {
        // NOTE HERE: row default style is always collected from the cells
        if (rowStyleId.equals(columnStyleId))
          returnStyleId = "";
        else if (ConversionUtil.hasValue(columnStyleId))
          returnStyleId = columnStyleId;
        else
          returnStyleId = ConversionConstant.DEFAULT_CELL_STYLE;
      }
      else
        returnStyleId = "";
    }
    else if (ConversionUtil.hasValue(columnStyleId))
    {
      returnStyleId = "";
    }

    return returnStyleId;
  }
  
  public String generateCellId(String rowId,String colId)
  {
    if(rowId == null || colId == null || "".equals(rowId) || "".equals(colId))
      return null;
    return rowId + "_" + colId;
  }

}
