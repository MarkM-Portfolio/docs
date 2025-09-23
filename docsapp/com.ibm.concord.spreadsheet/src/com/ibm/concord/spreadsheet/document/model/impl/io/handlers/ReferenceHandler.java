package com.ibm.concord.spreadsheet.document.model.impl.io.handlers;


import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.RecoverReferenceToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.TokenType;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.FormulaCell;

/**
 * For reference.js.
 */
public class ReferenceHandler extends AbstractFieldHandler<FormulaCell>
{
  private FormulaCell formulaCell;

  private int index, rightIndex, leftIndex;

  private FormulaToken formulaToken;

  private Document mainDoc, recoverDoc;
  
  private String refName, refValue;
  
  // only available for reference in recover doc which refer to the sheet in main doc
  private TokenType refType;
  
  public static final int INVALID = -0xFF;

  @Override
  public void onValue(String field, String value)
  {
    // we only care about "addr" and "names"
    if (ConversionConstant.RANGE_ADDRESS.equals(field))
      refValue = value;
    else if (ConversionConstant.NAMES_REFERENCE.equals(field))
      refName = value;
    else if(ConversionConstant.REFERENCE_TYPE.equals(field))
      refType = TokenType.enumOf(value);
  }

  @Override
  public void onValue(String field, int value)
  {
    // and "index"
    if (ConversionConstant.FORMULA_TOKEN_INDEX.equals(field))
    {
      index = value;
    }
    else if (ConversionConstant.LEFTTOKENINDEX.equals(field))
    {
      // and "ridx", "lidx"
      leftIndex = value;
    }
    else if (ConversionConstant.RIGHTTOKENINDEX.equals(field))
    {
      rightIndex = value;
    }
  }

  public void setContext(FormulaCell o)
  {
    formulaCell = o;
  }

  public void onEnd()
  {
    boolean bPushRef = false;
    if(refType == TokenType.RECREF)
    {
      if(refName != null)
      {
        RecoverReferenceToken token = new RecoverReferenceToken();//TODO: main Doc or recover doc??
        token.setRefValue(refValue);//the ref value in cell's value
        token.setRefName(refName);//will use the refName corresponding address as the changed text 
        formulaToken = token;
        if(bPushRef)
          formulaCell.pushRef(formulaToken);
      }
    }else if(refValue != null)
    {
      formulaToken = FormulaUtil.generateToken(refValue, formulaCell, bPushRef);
    }else if(refName != null)
    {
      formulaToken = FormulaUtil.generateToken(refName, formulaCell, bPushRef);
    }
  }
  public void resetIndex()
  {
    index = INVALID;
    rightIndex = INVALID;
    leftIndex = INVALID;
    refValue = null;
    refName = null;
    refType = null;
  }

  public int getIndex()
  {
    return index;
  }

  public int getRightIndex()
  {
    return rightIndex;
  }

  public int getLeftIndex()
  {
    return leftIndex;
  }

  public FormulaToken getFormulaToken()
  {
    return formulaToken;
  }
  
  public void setDoc(Document r, Document m)
  {
    recoverDoc = r;
    mainDoc = m;
  }
}
