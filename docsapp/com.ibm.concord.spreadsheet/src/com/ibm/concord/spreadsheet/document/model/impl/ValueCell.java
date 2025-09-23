package com.ibm.concord.spreadsheet.document.model.impl;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.commons.lang.builder.ToStringStyle;

import com.ibm.concord.spreadsheet.SpreadsheetConfig;
import com.ibm.concord.spreadsheet.common.ErrorCode;
import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaErrProperty;
import com.ibm.concord.spreadsheet.document.model.impl.preserve.PreserveValueCellSet;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;

public class ValueCell extends BasicModel
{
  private final static Logger LOG = Logger.getLogger(ValueCell.class.getName());
  
  public Object value;

  private String link;

  private Row parent;
  
  // index in OOXML shared string table
  // TODO consider add cell properties more wisely...
  private int stringIndex;
  
  // its child formulaCell member, if the cell is a formula cell.
  private FormulaCell formulaCell;
  
  //only used for formula cell
  private Object calcValue;

  public Object[] info;
  
  private int cellType;
  
  public ValueCell(Row parent, int id)
  {
    this.parent = parent;
    this.id = id;
    reset();
    stringIndex = -1;
  }

  public Object getValue()
  {
    return value;
  }
  
  /**
   * set the value for cell and parse the formula to get references if needed
   * @param v the given cell value
   * @param bParse  parse the formula with references or not, only applied for formula cell
   */
  public void setValue(Object v, boolean bParse)
  {
    setValue(v, bParse, true, true);
  }
  
  /**
   * set the value for cell and parse the formula to get references if needed
   * @param v the given cell value
   * @param bParse  parse the formula with references or not, only applied for formula cell
   */
  public void setValue(Object v, boolean bParse, boolean needSetPreserve)
  {
    setValue(v, bParse, needSetPreserve, true);
  }
  
  /**
   * 
   * @param v
   * @param bParse
   * @param needSetPreserve
   *          true if this setValue should change preserve data, false otherwise. For deserialize code, this flag is set to true, otherwise
   *          should set to false, or use the short version of setValue()
   * @param deduceType
   *          true to deduce cell type from the value provided. false to set the value as-is and leave the cell type untouched, default value is true
   * 
   */
  public void setValue(Object v, boolean bParse, boolean needSetPreserve, boolean deduceType)
  {
    // if value is changed from one string to any other, remove stringIndex
    if (stringIndex > 0 && !value.equals(v))
    {
      stringIndex = -1;
    }
    
    reset();
    
    Row row = this.parent;
    Sheet sheet = row.getParent();
    int rowId = row.getId();
    int sheetId = sheet.getId();
    if (needSetPreserve)
    {
      PreserveValueCellSet pvcSet = sheet.getParent().getPreserveManager().getValueCellSet();
      pvcSet.addValueChange(sheetId, rowId, this.id);
    }
    
    if (deduceType)
    {
      cellType = CommonUtils.getCellType(v, null, false);
      this.value = CommonUtils.fixValueByType(v, cellType);
    }
    else
    {
      value = v;
    }
    
    if(bParse)
      this.parse();
  }
  

  private void reset()
  {
    this.value = null;
    this.calcValue = null;
    this.link = null;
    
    if (formulaCell != null)
    {
      formulaCell.reset();
      Row row = this.parent;
      Sheet sheet = row.getParent();
      int rowId = row.getId();
      int sheetId = sheet.getId();
      PreserveValueCellSet pvcSet = sheet.getParent().getPreserveManager().getValueCellSet();
      pvcSet.deleteWholeRowColRef(sheetId, rowId, this.id);
    }
  }

  public void parse()
  {
    if (this.isFormula())
    {
      if (formulaCell == null)
      {
        formulaCell = new FormulaCell(parent.getParent(), parent.id, id);
      }

      String formula = (String) value;
      if (SpreadsheetConfig.useReferenceJS()==true) 
      {
        FormulaUtil.parse(formula, formulaCell);
      }
      else
      {
        FormulaUtil.parseFormulaToken(formula, formulaCell, true);
      }
      formulaCell.setParsed(true);
      formulaCell.setDirty(true);//set new formula which need calculate
      if(formulaCell.containWholeRowColRef())
      {
        Row row = this.parent;
        Sheet sheet = row.getParent();
        int rowId = row.getId();
        int sheetId = sheet.getId();
        PreserveValueCellSet pvcSet = sheet.getParent().getPreserveManager().getValueCellSet();
        pvcSet.addWholeRowColRef(sheetId, rowId, this.id);
      }
    }
  }

  public String getLink()
  {
    return this.link;
  }

  public void setLink(String link)
  {
    this.link = link;
  }
  
  public boolean isNumberValue()
  {
    return value instanceof Number;
  }
  
  public boolean isFormula()
  {
    if(value != null && !isNumberValue())
    {
      return ModelHelper.isFormula((String) value);
    }
    return false;
  }

  public Row getParent()
  {
    return this.parent;
  }
  
  public Sheet getSheet()
  {
    return getParent().getParent();
  }
  
  public Document getDocument()
  {
    return getSheet().getParent();
  }
  
  public void setParent(Row r)
  {
    this.parent = r;
  }
  
  public IDManager getIDManager()
  {
    return parent.getIDManager();
  }

  public int getIndex()
  {
    return this.getIDManager().getColIndexById(this.parent.getParent().getId(), this.id);
  }

  public int getRepeatedNum()
  {
    return 0;
  }

  public void setRepeatedNum(int num)
  {
  }

  public void copy(BasicModel model)
  {

  }


  @Override
  public boolean isMergable(BasicModel model)
  {
    return false;
  }

  /**
   * according to the tokenList and original formula string
   * replace the new address with original address of reference to generate the latest formula
   * @return
   */
  public String updateFormula()
  {
    if (formulaCell != null)
    {
      value = FormulaUtil.updateFormula((String)value, formulaCell.getTokenList());
    }
    // else, not a formula cell
    return (String)value;
  }
  
  public FormulaCell getFormulaCell()
  {
    return formulaCell;
  }

  public void setFormulaCell(FormulaCell formulaCell)
  {
    this.formulaCell = formulaCell;
  }

  public int getStringIndex()
  {
    return stringIndex;
  }

  public void setStringIndex(int stringIndex)
  {
    this.stringIndex = stringIndex;
  }

public String toString()
  {
    return new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE)//
        .append("index", getIndex()) //
        .append("value", value != null?value.toString():"") //
        .append("link", link).toString();
  }

  /**
   * Remove from the model
   */
  public void remove()
  {
    setValue("", true);
    parent = null;
  }
  
  public Object getCalcValue()
  {
    return calcValue;
  }
  
  public void setCalcValue(Object cv)
  {
    cellType = CommonUtils.getCellType(value, cv, false);
    calcValue = CommonUtils.fixValueByType(cv, cellType);
  }
  
  public int getErrProp()
  {
    FormulaCell fc = this.getFormulaCell();
    if(fc != null)
      return fc.getErrProps();
    return 0;
  }
  
  public void setErrProp(int e)
  {
    FormulaCell fc = this.getFormulaCell();
    if(fc != null)
      fc.updateErrProps(e);
  }
  
  public boolean isDirty()
  {
    if(isFormula())
    {
      FormulaCell fCell = getFormulaCell();
      if(fCell == null)
      {
        LOG.log(Level.WARNING, "do not have formula cell for cell :" + this.getValue());
        return true;
      }else
      {
        boolean bDirty = fCell.isDirty();
        if(bDirty)
          return true;
        else if(calcValue == null)//the draft might import published ods without cv for formula cell
          return true;
      }
    }
    return false;
  }
  //this method is only called by node.js
  public void setDirty(boolean bD)
  {
    FormulaCell fCell = getFormulaCell();
    if(fCell != null)
      fCell.setDirty(bD);
  }
  
  ////////////////////////////Functions used by NodeJS////////////////////////////////
  /**
   * Return the cell infos in the order of 
   * [SheetName, colIndex, rowIndex,value, cellType, visibility]
   * [bDirty, errProp ,calcValue, errorCode]  
   */
  public Object[] getInfo()
  {
    if(info != null)
      return info;
    if (parent != null)
    {
      Sheet sheet = parent.getParent();
      if (sheet != null)
      {
        info = new Object[2];
        Object[] infoCell = new Object[6];
        int colId = getId();
        int rowId = parent.getId();
        IDManager idMan = sheet.getIDManager();
        int colIndex = idMan.getColIndexById(sheet.getId(), colId);
        int rowIndex = idMan.getRowIndexById(sheet.getId(), rowId);
        int i = 0;
        infoCell[i++] = sheet.getSheetName();
        infoCell[i++] = colIndex;
        infoCell[i++] = rowIndex;
        infoCell[i++] = value;
        infoCell[i++] = cellType;
        if(parent.getVisibility() != null)
          infoCell[i++] = parent.getVisibility().toString();
        Object[] infoFCell = null;
        if( isFormula()){
          infoFCell = new Object[6];
          i = 0;
          boolean bDirty = true;
          int errProps = FormulaErrProperty.NONE.getValue();
          if(formulaCell != null)
          {
            bDirty = formulaCell.isDirty();
            errProps = formulaCell.getErrProps();
          }
          infoFCell[i++] = bDirty;
          infoFCell[i++] = errProps;
          
          if(calcValue != null){
            infoFCell[i++] = calcValue;
            ErrorCode code = ErrorCode.getByErrorMessage(calcValue.toString().toUpperCase());
            int codeNum = 0;
            if(code != null)
              codeNum = code.toIntValue();
            infoFCell[i++] = codeNum;
          }
        }
        
        info[0] = infoCell;
        info[1] = infoFCell;
        return info;
      }
    }
    return null;
  }

  public int getCellType()
  {
    return cellType;
  }

  public void setCellType(int cellType)
  {
    this.cellType = cellType;
  }
}
