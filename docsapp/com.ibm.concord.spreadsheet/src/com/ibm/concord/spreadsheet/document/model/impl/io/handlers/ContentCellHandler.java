package com.ibm.concord.spreadsheet.document.model.impl.io.handlers;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.SpreadsheetConfig;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.DocumentFeature;
import com.ibm.concord.spreadsheet.common.ErrorCode;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaError;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaLexer;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaParsedRef;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaToken;
import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.ReferenceToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.TokenType;
import com.ibm.concord.spreadsheet.document.model.impl.CoverInfo;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.FormulaCell;
import com.ibm.concord.spreadsheet.document.model.impl.IDToIndexMap;
import com.ibm.concord.spreadsheet.document.model.impl.Row;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.impl.StyleCell;
import com.ibm.concord.spreadsheet.document.model.impl.ValueCell;
import com.ibm.concord.spreadsheet.document.model.style.StyleManager;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.Position;

/**
 * For content.js, <em>"sheets": { "(sheetId)": { "rows": { "(rowId)": { "(columnId)": ...</em>
 * 
 * @author HanBingfeng
 * 
 */
public class ContentCellHandler extends AbstractFieldHandler<Row>
{
  private static final Logger LOG = Logger.getLogger(ContentCellHandler.class.getName());
  
  private Row row;

  private List<StyleObject> styleList;

  private int columnId;

  private List<ValueCell> valueCells;

  private List<StyleCell> styleCells;

  private List<CoverInfo> coverInfos;

  private ValueCell valueCell;

  private StyleObject styleObject;

  private IDToIndexMap columnIndexMap;

  private int repeat;
  
  private int colSpan, rowSpan;
  
  private int stringIndex;

  private StyleManager styleManager;

  private String link;
  
  private Object calcValue, value;
  
  private int errCode;

  private boolean bDirty;//only used for formula cell
  
  private int cellType;
  
  private boolean hasCoverInfos; // true if storeRawDataAndInfo has already insert cover info to rows
  public void setColumnId(int columnId)
  {
    this.columnId = columnId;
    // start deserializing a new cell
    valueCell = null;
    styleObject = null;
    link = null;
    errCode = ErrorCode.NONE.toIntValue();
    calcValue = null;
    repeat = 0;
    colSpan = rowSpan = 1;
    stringIndex = -1;
    bDirty = false;
    cellType = -1;
  }

  public void setContext(Row o)
  {
    row = o;
    valueCells = row.getValueCells();
    styleCells = row.getStyleCells();
    coverInfos = row.getCoverList();
    hasCoverInfos = (coverInfos.size() > 0);
  }

  @Override
  public void onValue(String field, String value)
  {
    if (ConversionConstant.STYLEID.equals(field))
    {
      if (ConversionConstant.DEFAULT_CELL_STYLE.equals(value))
      {
        styleObject = styleManager.getDefaultCellStyle();
      }
      else if (ConversionConstant.DEFAULT_CELL_STYLE_NAME.equals(value))
      {
        styleObject = styleManager.getDefaultStyle();
      }
      else
      {
        int id = ModelHelper.stripIdType(value);
        styleObject = ModelHelper.safeGetList(styleList, id);
        if (styleObject == null)
        {
          styleObject = new StyleObject();
          ModelHelper.putToList(styleList, id, styleObject);
        }
      }
    }
    else if (ConversionConstant.LINK.equals(field))
    {
      link = value;
    }
    else if (ConversionConstant.VALUE.equals(field))
    {
      ValueCell vc = getValueCell();
      if (row.getParent().getParent().getVersion().hasFeature(DocumentFeature.TYPED_CELL))
      {
        // setting string value and deduce type could be wrong when document version is already 1.02, don't deduce type
        vc.setValue(value, false, /* don't set preserve */ false, /* don't deduce type */ false);
      }
      else
      {
        // calling default way to deduce type
        vc.setValue(value, false, /* don't set preserve */ false);
      }
      if (vc.isFormula())
      {
        FormulaCell fc = null;
        
        if (row.getRowFormulaCellsMap() == null && row.getParent().getFormulaCellsMap() == null)
        {
          fc = new FormulaCell(row.getParent(), row.getId(), vc.getId());
        }
        else
        {
          if (row.getRowFormulaCellsMap() != null)
        	  fc = row.getRowFormulaCellsMap().get(columnId);
          // get it from sheet map
          if (fc == null)
          {
       		  Map<Integer, FormulaCell> rowFormulaMap = row.getParent().getFormulaCellsMap().get(row.getId());
       		  if (rowFormulaMap!=null)
      			  fc = rowFormulaMap.get(columnId);
          }
          if (fc == null)
          {
            fc = new FormulaCell(row.getParent(),row.getId(), vc.getId());
            //if not use reference.js, need to generate formula token list here
            if (!SpreadsheetConfig.useReferenceJS()) {
               List<FormulaToken> tokenlist = FormulaUtil.parseFormulaToken((String)vc.getValue(),fc, true);
               // push directly in parseFormulaToken
               // fc.setTokenList(tokenlist);
            }
          }
          // else, fc got from main draft deserialization, set to value cell
        }
        vc.setFormulaCell(fc);
        Document doc = vc.getDocument();
//        if(doc.isCalculated())
//          fc.setDirty(true,true);
      }
    }
    else if(ConversionConstant.CALCULATEDVALUE.equals(field))
    {
      calcValue = value;
    }
  }

  @Override
  public void onValue(String field, int value)
  {
    if (ConversionConstant.VALUE.equals(field))
    {
      getValueCell().setValue(value, false, /* don't set preserve */ false);
    }
    else if (ConversionConstant.REPEATEDNUM.equals(field))
    {
      repeat = value;
    }
    else if (ConversionConstant.COLSPAN.equals(field))
    {
      colSpan = value;
    }
    else if (ConversionConstant.ROWSPAN.equals(field))
    {
      rowSpan = value;
    }
    else if (ConversionConstant.KEY_STRING_INDEX.equals(field))
    {
      stringIndex = value;
    }
    else if(ConversionConstant.CALCULATEDVALUE.equals(field))
    {
      calcValue = value;
    }
    else if(ConversionConstant.FORMULA_ERRORCODE.equals(field))
    {
      errCode = value;
    }
    else if (ConversionConstant.CELL_TYPE.equals(field))
    {
      cellType = value;
    }
  }

  @Override
  public void onValue(String field, long value)
  {
    if (ConversionConstant.VALUE.equals(field))
    {
      getValueCell().setValue(value, false, /* don't set preserve */ false);
    }
    else if(ConversionConstant.CALCULATEDVALUE.equals(field))
    {
      calcValue = value;
    }
  }

  @Override
  public void onValue(String field, double value)
  {
    if (ConversionConstant.VALUE.equals(field))
    {
      getValueCell().setValue(value, false, /* don't set preserve */ false);
    }
    else if(ConversionConstant.CALCULATEDVALUE.equals(field))
    {
      calcValue = value;
    }
  }

  @Override
  public void onValue(String field, boolean value)
  {
    if(ConversionConstant.CELL_DIRTY.equals(field))
    {
      bDirty = value;
    }
  }
  
  @Override
  public void onEnd()
  {
    // add previous style cell and value cell
    if (valueCell != null)
    {
      if (stringIndex > 0)
      {
        valueCell.setStringIndex(stringIndex);
      }
      
      if (row.getParent().getParent().getVersion().hasFeature(DocumentFeature.TYPED_CELL) && cellType == -1)
      {
        // typed cell default value is 0
        cellType = 0;
      }
      
      if (cellType > -1)
      {
        // first fix value, since set value will refresh its cell type
        // then set cell type got from draft JSON.
        if (valueCell.isFormula())
        {
          valueCell.setCalcValue(CommonUtils.fixValueByType(calcValue, cellType));
        }
        else
        {
          // refresh value but don't deduce type, take the fixed value as-is
          valueCell.setValue(CommonUtils.fixValueByType(valueCell.getValue(), cellType), false, false, false);
        }
        
        valueCell.setCellType(cellType);
      }
      
      ModelHelper.insert(valueCells, valueCell, valueCells.size() - 1);
      
      if (cellType == -1 && styleObject != null && ConversionConstant.BOOLEAN_TYPE.equals(styleObject.getAttribute(ConversionConstant.FORMATCATEGORY)))
      {
        // cell has boolean style, refresh cell type to boolean
        valueCell.setCellType(CommonUtils.getCellType(valueCell.getValue(), valueCell.getCalcValue(), true));
      }
    }
    
    // store link in valuecell
    if (link != null)
    {
      getValueCell().setLink(link);
    }

    if(bDirty)
    {
      FormulaCell fc = getValueCell().getFormulaCell();
      if(fc == null)
      {
        LOG.log(Level.WARNING, "the cell contain dirty flag should be a formula cell");
      }
      else
        fc.setDirty(bDirty, true);//document is loading, then do not need append this formula cell to formula track
    }
    
    if(calcValue != null)
      getValueCell().setCalcValue(calcValue);
    
    if (styleObject != null)
    {
      // have style to set, check if it can be merged to previous style cell
      // get previous cell
      boolean merged = false;
      StyleCell nextStyleCell = null;
      Position nextPos = null;

      if (!styleCells.isEmpty())
      {
        int index = columnIndexMap.get(columnId);
        // forward merging
        nextPos = ModelHelper.search(styleCells, index + repeat + 1, styleCells.size() - 1);
        if (nextPos.isFind)
        {
          nextStyleCell = styleCells.get(nextPos.index);
          // this, and the statement below, tries to auto-merge current style cell with cells that before or after it
          // this merge should exclude style cell with style that is preserved, add the flag
          // but WARN that this fix will not work when ModelIOFactory.LOAD_MODE is set to ALL
          // since during first load, content is loaded prior to styles, all styles are dummy without any content
          // at the first loading moment, so the preserved flag will always be false.
          if (nextStyleCell.getStyle() == styleObject && !styleObject.isPreserved())
          {
            nextStyleCell.setId(columnId);
            repeat = repeat + nextStyleCell.getRepeatedNum() + 1;
            nextStyleCell.setRepeatedNum(repeat);
            merged = true;
          }
        }
        // backward merging
        Position prevPos = ModelHelper.search(styleCells, index - 1, styleCells.size() - 1);
        if (prevPos.isFind)
        {
          StyleCell prevStyleCell = styleCells.get(prevPos.index);
          if (prevStyleCell.getStyle() == styleObject && !styleObject.isPreserved())
          {
            // merge to previous styleCell, and need to replace columnId, index and repeat with the one in prev style cell
            repeat = repeat + prevStyleCell.getRepeatedNum() + 1;
            prevStyleCell.setRepeatedNum(repeat);
            if (merged && nextStyleCell != null)
            {
              // already did a forward merging, now prevStyleCell covers nextStyleCell, remove nextStyleCell from styleCells
              styleCells.remove(nextPos.index);
            }
            merged = true;
          }
        }
      }

      if (!merged)
      {
        // didn't merge, create new cell
        StyleCell sc = new StyleCell(row, columnId);
        sc.setStyle(styleObject);
        sc.setRepeatedNum(repeat);
        ModelHelper.insert(styleCells, sc, styleCells.size() - 1);
      }
    }
    
    if(!hasCoverInfos && (colSpan > 1 || rowSpan > 1)) 
    {
      CoverInfo cover = new CoverInfo(row, columnId, colSpan, rowSpan);
      ModelHelper.insert(coverInfos, cover, coverInfos.size() - 1);
      row.getParent().insertCoverInfoInColumn(cover, -1, -1);
    }
  }

  public void setContextSheet(Sheet st)
  {
    columnIndexMap = st.getIdStruct().columnIdToIndexMap;
  }

  public void setStyleList(List<StyleObject> styleList)
  {
    this.styleList = styleList;
  }

  public void setStyleManager(StyleManager styleManager)
  {
    this.styleManager = styleManager;
  }

  private ValueCell getValueCell()
  {
    if (valueCell == null)
    {
      valueCell = new ValueCell(row, columnId);
    }
    return valueCell;
  }
}
