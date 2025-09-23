package com.ibm.concord.spreadsheet.document.model.rulesObject;

import java.util.Iterator;
import java.util.List;

import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.document.model.formula.Area;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.formula.SharedReferenceRef;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.rulesObject.RulesObjUtil.RELREFTYPE;
import com.ibm.concord.spreadsheet.document.model.rulesObject.RulesObjUtil.VALUETYPE;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;

public class RuleVal
{
  private Object value;

  protected VALUETYPE type;
  
  private RELREFTYPE relRefType;

  private List<FormulaToken> tokenArray;

  public RuleVal(Object value)
  {
    if (value != null)
    {
      this.value = value;
      type = parseValue(value);
      if (type == VALUETYPE.FORMULA)
        parseFormulaValue();
    }
  }

  public boolean isFormula()
  {
    return type == VALUETYPE.RELFORMULA || type == VALUETYPE.ABSFORMULA || type == VALUETYPE.FORMULA;
  }

  public boolean isRelFormula()
  {
    return type == VALUETYPE.RELFORMULA;
  }
  
  public boolean isRelativeColumn()
  {
    return relRefType == RELREFTYPE.ALL || relRefType == RELREFTYPE.COLUMN;
  }
  
  public boolean isRelativeRow()
  {
    return relRefType == RELREFTYPE.ALL || relRefType == RELREFTYPE.ROW;
  }

  public List<FormulaToken> getTokenArray()
  {
    return tokenArray;
  }

  private VALUETYPE parseValue(Object value)
  {
    if (value instanceof Number)
      return VALUETYPE.NUMBER;
    if (!(value instanceof String))
      return VALUETYPE.UNKNOWN;

    String val = (String) value;
    if (val.startsWith("\""))
      return VALUETYPE.STRING;

    if (val.equalsIgnoreCase("true") || val.equalsIgnoreCase("false"))
      return VALUETYPE.BOOLEAN;

    return VALUETYPE.FORMULA;
  }

  // value type is not same with client side, client need calculate, so name is relative ref. Server only to transform the non-name refs, so
  // name is absolute ref.
  private void parseFormulaValue()
  {
    List<FormulaToken> tokens = FormulaUtil.parseFormulaToken((String) value, null, false, false);
    Iterator<FormulaToken> iter = tokens.iterator();
    this.type = VALUETYPE.ABSFORMULA;
    boolean relativeRow = false;
    boolean relativeCol = false;
    RELREFTYPE relRefType = RELREFTYPE.NONE;
    while (iter.hasNext())
    {
      FormulaToken token = iter.next();
      if (token.getIndex() == -1)
        continue;
      if (token.getType() == FormulaUtil.TokenType.NAME)
        continue;
      String addr = token.getText();
      ReferenceParser.ParsedRef parsedRef = ReferenceParser.parse(addr.trim());
      relRefType = RulesObjUtil.getRelativeRef(parsedRef.patternMask);
      if (relRefType == RELREFTYPE.NONE) {
    	  continue;
      } else if (relRefType == RELREFTYPE.COLUMN) {
    	  relativeCol = true;
      } else if (relRefType == RELREFTYPE.ROW) {
    	  relativeRow = true;
      } else if (relRefType == RELREFTYPE.ALL || (relativeRow && relativeCol)) {
    	  relRefType = RELREFTYPE.ALL;
    	  break;
      }
    }
    if (relRefType != RELREFTYPE.ALL) {
    	if (relativeRow) {
    		relRefType = RELREFTYPE.ROW;
    	} else if (relativeCol) {
    		relRefType = RELREFTYPE.COLUMN;
    	}
    }
    this.relRefType = relRefType;
    if (relRefType != RELREFTYPE.NONE) {
    	this.type = VALUETYPE.RELFORMULA;
    }
    tokenArray = tokens;
  }

  public RuleVal clone()
  {
    RuleVal ret = new RuleVal(null);

    ret.value = value;
    ret.type = type;
    ret.tokenArray = tokenArray;
    ret.relRefType = relRefType;
    return ret;
  }

  public String updateFormula(List<FormulaToken> tokenList, int deltaR, int deltaC, Document doc)
  {
    String ret = (String) value;
    if (tokenList == null || tokenList.size() == 0)
      return ret;

    int copyStartIndex = 0;
    StringBuffer updatedFormula = new StringBuffer();
    int length = tokenList.size();
    for (int i = 0; i < length; i++)
    {
      FormulaToken token = tokenList.get(i);
      // copy part of the formula which does not related with the tokens
      int tokenIndex = token.getIndex();
      if (tokenIndex == -1)// it must be virtual reference
        continue;
      if(copyStartIndex <= tokenIndex && tokenIndex <= ((String)value).length())
    	  updatedFormula.append(ret.substring(copyStartIndex, tokenIndex));
      Area area = token.getArea();
      String text = token.getText();
      if (area == null)
        updatedFormula.append(text);
      else
      {
        int rowSize = 1;
        int colSize = 1;
        if (area instanceof SharedReferenceRef)
        {
          SharedReferenceRef sharedReferenceRef = (SharedReferenceRef) area;
          rowSize = sharedReferenceRef.getRowSize();
          colSize = sharedReferenceRef.getColSize();
        }
        ReferenceParser.ParsedRef parsedRef = ReferenceParser.parse(text.trim());
        int startRow = area.getStartRow();
        int endRow = area.getEndRow();
        int startCol = area.getStartCol();
        int endCol = area.getEndCol();
        int sheetId = area.getSheetId();

        if (ParsedRefType.COLUMN != parsedRef.type)
        {
          if ((parsedRef.patternMask & ReferenceParser.ABSOLUTE_ROW) == 0)
            startRow -= deltaR;
          if ((parsedRef.patternMask & ReferenceParser.ABSOLUTE_END_ROW) == 0)
            endRow = startRow + rowSize - 1;
        }
        if (ParsedRefType.ROW != parsedRef.type)
        {
          if ((parsedRef.patternMask & ReferenceParser.ABSOLUTE_COLUMN) == 0)
            startCol -= deltaC;
          if ((parsedRef.patternMask & ReferenceParser.ABSOLUTE_END_COLUMN) == 0)
            endCol = startCol + colSize - 1;
        }

        Sheet sheet = doc.getSheetById(sheetId);
        String sheetName = sheet == null ? "" : sheet.getSheetName();
        boolean bInvalid = false;
        if (sheetName.equals(""))
          bInvalid = true;
        String addr = ModelHelper.getAddress(sheetName, startRow, startCol, sheetName, endRow, endCol, parsedRef.patternMask, bInvalid);
        updatedFormula.append(addr);
      }
      copyStartIndex = tokenIndex + text.length();
    }
    if (copyStartIndex < ret.length())
      updatedFormula.append(ret.substring(copyStartIndex));
    return updatedFormula.toString();
  }
}