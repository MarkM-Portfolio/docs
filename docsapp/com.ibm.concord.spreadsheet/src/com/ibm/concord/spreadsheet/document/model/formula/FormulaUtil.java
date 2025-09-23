package com.ibm.concord.spreadsheet.document.model.formula;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.antlr.runtime.ANTLRInputStream;
import org.antlr.runtime.CommonTokenStream;
import org.antlr.runtime.RecognitionException;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.common.formulalexer.FormulaLexer;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaError;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaLexer;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaParsedRef;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaToken;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.FormulaCell;
import com.ibm.concord.spreadsheet.document.model.impl.IDManager;
import com.ibm.concord.spreadsheet.document.model.impl.Range;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONObject;

public class FormulaUtil
{
  private static final Logger LOG = Logger.getLogger(FormulaUtil.class.getName());
  
  private static final HashMap<String, Integer> FunctionErrProperties;

  /**
   * Get the token list from the formula, and insert them to cell's token list
   * 
   * @param formula
   *          the cell formula
   * @param cell the value cell object
   */
  public static ArrayList<FormulaToken> parse(String formula, FormulaCell cell)
  {
//    if (formula.length() > 2000)
    ArrayList<FormulaToken> tokenList = new ArrayList<FormulaToken>();
    try
    {
      java.io.ByteArrayInputStream strInput = new java.io.ByteArrayInputStream(formula.getBytes("utf-8"));
      FormulaLexer lexer = new FormulaLexer(new ANTLRInputStream(strInput, "utf-8"));
      CommonTokenStream tokens = new CommonTokenStream(lexer);
      tokens.LT(0); // trigger
      if (lexer._cellHasUnicode)
        ConversionUtil.normalizeTokens(tokens);
      FormulaParser parser = new FormulaParser(tokens);
      // input parameter
      if (cell != null)
        parser.cell = cell;
      
      parser.tokenList = tokenList;
      // output parameter
      parser.prog();
      if(parser.error != null)
        tokenList.clear();
    }
    catch (IOException e1)
    {
      tokenList.clear();
      LOG.log(Level.WARNING, "", e1);
    }
    catch (RecognitionException e)
    {
      tokenList.clear();
      LOG.log(Level.WARNING, "the formula : \"" + formula + "\" can not be recognized", e);
    }
    finally
    {
      if(cell != null)
      {
        cell.setTokenList(tokenList);
      }
    }
    return tokenList;
  }

  public static ArrayList<FormulaToken> parseFormulaToken(String formula, FormulaCell fc, boolean bPush)
  {
	  return parseFormulaToken(formula, fc, bPush, true);
  }
  
  /**
   * Generate token for each reference from a formula string. It is use new NFA Machine to parse formula
   * @param formula    the text representation for formula
   * @param fc    the parsed value cell
   * @param bPushRef    true to push the token to cell's token list
   * @return formula token which represent the reference in the cell
   */
  public static ArrayList<FormulaToken> parseFormulaToken(String formula, FormulaCell fc, boolean bPush, boolean bListener)
  {
    ArrayList<FormulaToken> rettokens = new ArrayList<FormulaToken>();
    ArrayList<IDMFormulaError> ferr = new ArrayList<IDMFormulaError>();
    List<IDMFormulaToken> tokens = IDMFormulaLexer.parseq(formula, ferr, IDMFormulaLexer.InternalFormulaType);
    // error. ignore
    if (ferr.size() > 0)
      return rettokens;
    boolean inVRef = false;
    FormulaToken lastRef = null;
    for (IDMFormulaToken token : tokens)
    {
      if (token.type == IDMFormulaToken.LexTokenType.OPERATOR_TYPE && token.getText() != null && token.getText().equals(":"))
      {
        if (lastRef != null)
        {
          inVRef = true;
        }
      }
      else if (token.type == IDMFormulaToken.LexTokenType.REFERENCE_TYPE)
      {
        FormulaToken formulatoken = FormulaUtil.generateToken(token.getText(), fc, bPush, bListener);
        formulatoken.setIndex(token.getOffset());
        rettokens.add(formulatoken);
        if (inVRef == true && lastRef != null)
        {
          boolean is3DRef = false;
          if (lastRef.getType() == TokenType.NAME)
          {
            // 3d ref
            String sheetName = IDMFormulaParsedRef.parseSheetName(lastRef.getText());
            if (fc != null && fc.getSheet() != null && fc.getSheet().getParent() != null) {
              Sheet sheet = fc.getSheet().getParent().getSheetByName(sheetName);
              if (sheet!=null)
              {
                int index = lastRef.getIndex();
                int endindex = formulatoken.getIndex() + formulatoken.getText().length();
                if (formulatoken.getText().startsWith("'"))
                    endindex = endindex - 1;
                String text = formula.substring(index, endindex); 
                fc.deleteRef(lastRef);
                rettokens.remove(lastRef);
                fc.deleteRef(formulatoken);
                rettokens.remove(formulatoken);
                // System.out.println("3d ref: "+ text);
                FormulaToken token3d = FormulaUtil.generateToken(text, fc, bPush, bListener);
                token3d.setIndex(index);
                lastRef = token3d;
                is3DRef = true;
              }
            }
          }
          if (is3DRef == false)
          {
            FormulaToken vreftoken = FormulaUtil.generateVirtualToken(lastRef, formulatoken, fc, bPush);
            vreftoken.setIndex(-1);
            lastRef = vreftoken;
          }
        }
        else
        {
          lastRef = formulatoken;
        }
        inVRef = false;
        // System.out.println("fref:"+ref.getAddress()+" sheetId:"+sheetId + " type:"+ref.getRefType()); // yuanlin
      }
      else if (token.type == IDMFormulaToken.LexTokenType.NAME_TYPE)
      {
        FormulaToken formulatoken = FormulaUtil.generateToken(token.getText(), fc, true, bListener);
        formulatoken.setIndex(token.getOffset());
        rettokens.add(formulatoken);
        if (inVRef == true && lastRef != null)
        {
          FormulaToken vreftoken = FormulaUtil.generateVirtualToken(lastRef, formulatoken, fc, bPush);
          vreftoken.setIndex(-1);
          lastRef = vreftoken;
        }
        else
        {
          lastRef = formulatoken;
        }
        inVRef = false;
        // System.out.println("fref:"+ref.getAddress()+" sheetId:"+sheetId+ " type:"+ref.getRefType()); // yuanlin
      }
      else
      {
        lastRef = null;
        inVRef = false;
      }

    }

    return rettokens;
  }
  /**
   * only the valid formula reference can be generated as range formula token
   * 1) CELL reference, such as Sheet1!A1, A1
   * 2) RANGE reference, such as Sheet1!A1:B2 $A1:B$2
   * 3) COLUMN/ROW reference, such as Sheet1!A:B, 1:2, Sheet1!#REF!, #REF!
   * although Sheet1!#REF! is valid reference, but do not put it in reference.js because do not need to transform it
   * notice that Sheet1!A:#REF!, #REF!:#REF! are all treated as invalid reference.
   * @return
   */
  public static boolean isValidFormulaRef(ReferenceParser.ParsedRef parsedRef){
    if(parsedRef == null)
      return false;
    if(ParsedRefType.CELL == parsedRef.type || ParsedRefType.RANGE == parsedRef.type
        || isValidWholeRowColRef(parsedRef))
      return true;
    return false;
  }
  
  public static boolean isValidWholeRowColRef(ReferenceParser.ParsedRef parsedRef){
    if((ParsedRefType.ROW == parsedRef.type && parsedRef.endRow != null //Sheet1!A or Sheet1!1 or Sheet1!A:#REF! is not allowed for formula ref
            && (!ConversionConstant.INVALID_REF.equals(parsedRef.startRow) && !ConversionConstant.INVALID_REF.equals(parsedRef.endRow) ))
        || (ParsedRefType.COLUMN == parsedRef.type && parsedRef.endCol != null
            && (!ConversionConstant.INVALID_REF.equals(parsedRef.startCol) && !ConversionConstant.INVALID_REF.equals(parsedRef.endCol) )))
      return true;
    return false;
  }
  
  public static ReferenceToken generateToken(String text, FormulaCell cell, boolean bPushRef){
	  return generateToken(text, cell, bPushRef, true);
  }
  
  /**
   * Generate token for each reference represent by text
   * @param text    the text representation for reference
   * @param cell    the parsed value cell
   * @param bPushRef    true to push the token to cell's token list
   * @return formula token which represent the reference in the cell
   */
  public static ReferenceToken generateToken(String text, FormulaCell cell, boolean bPushRef, boolean bListener){
    ReferenceToken token = null;

    ReferenceParser.ParsedRef parsedRef = ReferenceParser.parse(text.trim());
    if(!bListener)
    {
		 if(parsedRef != null)
	     {
	       if(isValidFormulaRef(parsedRef))
	       {
	         token = new ReferenceToken(null);
	         token.setType(TokenType.RANGE);
	         token.setText(text);
	       }
	     }
		 if(token == null)
		 {
			 token = new ReferenceToken(null);
			 token.setText(text);
		     token.setType(TokenType.NAME);
		 }
		return token;
    }
    
    
    if(cell == null)
    {
//      LOG.log(Level.WARNING, "the cell is null when generate formula token with text {0} for this cell", text);
      //must called by ConversionUtil.getTokenFromFormula by OT, only FormulaToken.text for range token is needed
      if(parsedRef != null)
      {
        if(isValidFormulaRef(parsedRef))
        {
          token = new ReferenceToken(null);
          token.setType(TokenType.RANGE);
          token.setText(text);
        }
      }
    }else
    {
    boolean bName = true;
    Sheet sheet = cell.getSheet();
    Document doc = sheet.getParent();
    if(parsedRef != null)
    {
      if(isValidFormulaRef(parsedRef))
      {
        bName = false;
        //TODO: test if insert #REF!.A1, or Sheet1.#REF!1
        int sheetId = IDManager.INVALID;
        if(parsedRef.sheetName != null)
        {
          Sheet s = doc.getSheetByName(parsedRef.sheetName);
          if(s != null)
            sheetId = s.getId();
        }else
        {
          sheetId = sheet.getId();
        }
        int endSheetId = IDManager.INVALID;
        if(parsedRef.endSheetName != null)
        {
          Sheet s = doc.getSheetByName(parsedRef.endSheetName);
          if(s != null)
            endSheetId = s.getId();
        }
        Area area = null;
        if(sheetId != IDManager.INVALID)
        {
          area = doc.getAreaManager().startListeningArea(ModelHelper.getRangeInfoFromParseRef(parsedRef, sheetId, endSheetId), cell, null);
        }
        token = new ReferenceToken(doc);
        token.setType(TokenType.RANGE);
        token.setArea(area);
        token.setText(text);
        token.setRefMask(parsedRef.patternMask);
        if(!token.isValid())
        {
//          token.setError(ERRORCODE.INVALID_REF);
        }
        else
        {
          if(bPushRef)
          {
            cell.pushRef(token);
          }
        }
      }
    }
    if(bName)
    {
      token = new ReferenceToken(doc);
      token.setText(text);//TODO: use the define in name range
      token.setType(TokenType.NAME);
      Area area = doc.getAreaManager().startListeningArea(text.toLowerCase(), cell);
      if(area != null)
      {
        Range<String> nameRange = doc.getRangeList().getRangeByUsage(text.toLowerCase(), RangeUsage.NAMES);
        token.setRefMask(nameRange.getParsedRef().patternMask);
        JSONObject data = nameRange.getData();
        if(data != null)
        {
          String name = (String)data.get("name");
          if(name != null)
            token.setText(name);
        }
        token.setArea(area);
        if(!token.isValid()) 
        {
//          token.setError(ERRORCODE.INVALID_REF);
        }if(bPushRef)
          cell.pushRef(token);
      }
      //need add undefined name range to cell because calculation engine is not enabled?
      else
      {
//        token.setError(ERRORCODE.INVALID_NAME);
        token.setArea(null);
        if(bPushRef)
          cell.pushRef(token);
      }
    }
    }
    return token;
  }
  
  public static FormulaToken generateVirtualToken(FormulaToken left,FormulaToken right, FormulaCell cell, boolean bPushRef){
    VirtualFormulaToken token = new VirtualFormulaToken();
    token.setLeftToken(left);
    token.setRightToken(right);
    if(cell != null)
    {
      //ConversionUtil.getTokenFromFormula for OT do not need text for virtual token
      token.setText(left.getText() + ":" + right.getText());
      if(bPushRef)
        cell.pushRef(token);
    }
    return token;
}
  
  /**
   * update the formula string with the changed text of each token in tokenList
   * @param formula the original formula string   
   * @param tokenList the token list of this formula
   * @return the updated formula by replacing the orignial reference address with the changed text
   */
  public static String updateFormula(String formula, List<FormulaToken> tokenList)
  {
    if (tokenList == null || tokenList.size() == 0)
      return formula;

    int copyStartIndex = 0;
    StringBuffer updatedFormula = new StringBuffer();
    int length = tokenList.size();
    for (int i = 0; i < length; i++)
    {
      try
      {
        FormulaToken token = tokenList.get(i);
        // copy part of the formula which does not related with the tokens
        int tokenIndex = token.getIndex();
        if(tokenIndex == -1)//it must be virtual reference
          continue;
        updatedFormula.append(formula.substring(copyStartIndex, tokenIndex));
        // copy the updated tokens to the updatedFormula
        ReferenceToken refToken = (ReferenceToken)token;
        Area area = token.getArea();
        String updateTokenAddress = null;
        
        if(area == null || refToken.getType() == TokenType.NAME)
          updateTokenAddress = refToken.getChangeText();
        else
          updateTokenAddress = refToken.getAddress();
        int index = updatedFormula.length();
        updatedFormula.append(updateTokenAddress);
        
        String tokenAddress = token.getText();
        copyStartIndex = tokenIndex + tokenAddress.length();
        token.setText(updateTokenAddress);
        token.setIndex(index);
      }
      catch (Exception e)
      {
        e.printStackTrace();
      }
    }
    if (copyStartIndex < formula.length())
      updatedFormula.append(formula.substring(copyStartIndex));
    return updatedFormula.toString();
  }
  

  public enum TokenType {
    RANGE(ConversionConstant.RANGE_REFERENCE), 
    NAME(ConversionConstant.NAMES_REFERENCE),
    VREF(ConversionConstant.VIRTUAL_REFERENCE),
    RECREF(ConversionConstant.RECOVER_REFERENCE);
    
    private String mValue;
  
    TokenType(String value)
    {
      mValue = value;
    }
  
    public String toString()
    {
      return mValue;
    }
  
    public static TokenType enumOf(String value)
    {
      for (TokenType iter : values())
      {
        if (iter.toString().equalsIgnoreCase(value))
        {
          return iter;
        }
      }
      return null;
    }
  }

  /**
   * token which contains in formula
   * 
   */
  public static abstract class FormulaToken implements Serializable
  {
    
    private static final long serialVersionUID = 1L;

    String mText;

    String mChangeText;

    int mIndex;

    TokenType mType;

//    ERRORCODE err;

    public void setText(String text)
    {
      mText = text;
      mChangeText = text;
    }

    public String getText()
    {
      return mText;
    }

    public void setOnlyText(String text)
    {
      mText = text;
    }

    public void setChangeText(String text)
    {
      mChangeText = text;
    }

    public String getChangeText()
    {
      return mChangeText;
    }

    public void setIndex(int index)
    {
      mIndex = index;
    }

    public int getIndex()
    {
      return mIndex;
    }

//    public void setError(ERRORCODE e)
//    {
//      err = e;
//    }
//
//    public ERRORCODE getError()
//    {
//      return err;
//    }

    public void setType(TokenType type)
    {
      mType = type;
    }

    public TokenType getType()
    {
      return mType;
    }

    public boolean isValid()
    {
      return true;
    }
    
    public Area getArea()
    {
      return null;
    }
  }
  
  /**
   * Reference token is used by range, cell and name
   *
   */
  public static class ReferenceToken extends FormulaToken
  {
    private Area area;
    private int refMask = ReferenceParser.RANGE_PATTERN_MASK;
    private Document doc;

    public ReferenceToken(Document d)
    {
      doc = d;
    }
    
    public void setRefMask(int m)
    {
      refMask = m;
    }
    
    public int getRefMask()
    {
      return refMask;
    }

    public Area getArea()
    {
      return area;
    }
    
    public void setArea(Area a)
    {
      area = a;
    }
    
    private String getSheetName()
    {
      Sheet sheet = doc.getSheetById(area.getSheetId());
      String sheetName = null;
      if(sheet != null)
        sheetName = sheet.getSheetName();
      return sheetName;
    }
    
    private String getEndSheetName()
    {
      String sheetName = null;
      Sheet sheet = doc.getSheetById(area.getEndSheetId());
      if(sheet != null)
        sheetName = sheet.getSheetName();
      return sheetName;
    }

    public String getAddress()
    {
      if(area == null)
        return null;
      String sheetName = getSheetName();
      boolean bInvalid = false;
      if(sheetName == null)
      {
        sheetName = "";
        bInvalid = true;
      }
      String endSheetName = getEndSheetName();
      if (endSheetName == null)
      {
        endSheetName = sheetName;
        bInvalid = true;
      }
      return ModelHelper.getAddress(sheetName, area.getStartRow(), area.getStartCol(), 
          endSheetName, area.getEndRow(), area.getEndCol(), refMask, bInvalid);
    }
    
    public ReferenceParser.ParsedRef getParsedRef()
    {
      if(area == null)
        return null;
      String sheetName = getSheetName();
      if(sheetName == null)
        sheetName = "";
      String endSheetName = getEndSheetName();
      if (endSheetName == null)
      {
        endSheetName = sheetName;
      }
      return ModelHelper.getParsedRef(sheetName, area.getStartRow(), area.getStartCol(), 
          endSheetName, area.getEndRow(), area.getEndCol(), refMask);
    }
    
    public boolean isValid()
    {
      return (area != null && getSheetName() != null && area.isValid());
//      return !(mText == null || mText.contains(ConversionConstant.INVALID_REF) || err != null);
    }

    //set the parent document which is only used when referenceToken is in the recover doc or main doc
    public void setDocument(Document pDoc)
    {
      doc = pDoc;
    }
    
    public ReferenceToken copy()
    {
    	ReferenceToken newToken = new ReferenceToken(doc);
    	newToken.mText = mText;
    	newToken.mChangeText = mChangeText;
    	newToken.mIndex = mIndex;
    	newToken.mType = mType;
		newToken.area = area;
		newToken.refMask = refMask;
		
    	return newToken;
    }
  }
  
  public static class VirtualFormulaToken extends FormulaToken
  {
    private FormulaToken lToken;

    private FormulaToken rToken;
    
    public VirtualFormulaToken()
    {
      setIndex(-1);
      setType(TokenType.VREF);
    }

    public void setLeftToken(FormulaToken t)
    {
      lToken = t;
    }

    public FormulaToken getLeftToken()
    {
      return lToken;
    }

    public void setRightToken(FormulaToken t)
    {
      rToken = t;
    }

    public FormulaToken getRightToken()
    {
      return rToken;
    }

    @Override
    public boolean isValid()
    {
      return (lToken != null && ( lToken.isValid() || lToken.getType() == TokenType.NAME) 
          && rToken != null && (rToken.isValid()  || rToken.getType() == TokenType.NAME));
    }
  }
  
  //the token used for recover document which refer the area that defined as unnamed range in maindoc
  public static class RecoverReferenceToken extends FormulaToken
  {
    private String refName;//the unnamed range id
    private String refValue;//the original address which is used in the formula cell of the recover doc
    //text and changetext in FormulaToken is useless
    public RecoverReferenceToken()
    {
      setType(TokenType.RECREF);
    }
    
    public String getRefName()
    {
      return refName;
    }
    public void setRefName(String refName)
    {
      this.refName = refName;
    }
    public String getRefValue()
    {
      return refValue;
    }
    public void setRefValue(String refValue)
    {
      this.refValue = refValue;
    }
  }
  
  /**
   * Formula Error Property Set
   * which is determined by formula function
   */
  public static enum FormulaErrProperty
  {
    NONE(0), IGNORE_ERR(1), IGNORE_RECURSIVE(2),
    IGNORE_NONEPARAM(4), CARE_SHEET(8), UPDATE_ALWAYS(16),
    SET_VALUE_ALWAYS(32), GET_ARRAY(64), CALC_ALWAYS(128),
    NOTIFY_ALWAYS(256), CHECK_CR_AFTER_CAL(512), IGNORE_ERR_REF(1024),
    CHANGE_PER_LOCALE(2048), CARE_SHOWHIDE(4096), CARE_FILTER(8192);
    
    private int value;
    private FormulaErrProperty(int v)
    {
      value = v;
    }
    
    public int getValue()
    {
      return value;
    }
    
    public FormulaErrProperty valueOf(int v)
    {
      switch(v)
      {
        case 1:
          return IGNORE_ERR;//no use for now
        case 2:
          return IGNORE_RECURSIVE;//no use for now
        case 4:
          return IGNORE_NONEPARAM;//no use for now
        case 8:
          return CARE_SHEET;
        case 16:
          return UPDATE_ALWAYS;
        case 32:
          return SET_VALUE_ALWAYS;//no use for now
        case 64:
          return GET_ARRAY;//no use for now
        case 128:
          return CALC_ALWAYS;//no use for now
        case 256:
          return NOTIFY_ALWAYS;//no use for now
        case 512:
          return CHECK_CR_AFTER_CAL;//no use for now
        case 1024:
          return IGNORE_ERR_REF;//no use for now
        case 2048:
          return CHANGE_PER_LOCALE;//no use for now
        case 4096:
          return CARE_SHOWHIDE;
        case 8192:
          return CARE_FILTER;
        default:
          return NONE;
      }
    }
  }
  
  static 
  {
    //set UPDATE_ALWAYS if the function's result is always change,
    // or it may create a new related reference when calc such formula
    FunctionErrProperties = new HashMap<String, Integer>();
    FunctionErrProperties.put("rand", FormulaErrProperty.UPDATE_ALWAYS.getValue());
    FunctionErrProperties.put("randbetween", FormulaErrProperty.UPDATE_ALWAYS.getValue());
    FunctionErrProperties.put("now", FormulaErrProperty.UPDATE_ALWAYS.getValue());
    FunctionErrProperties.put("row", FormulaErrProperty.UPDATE_ALWAYS.getValue());//in case =ROW()
    FunctionErrProperties.put("column", FormulaErrProperty.UPDATE_ALWAYS.getValue());
    FunctionErrProperties.put("rows", FormulaErrProperty.UPDATE_ALWAYS.getValue());
    FunctionErrProperties.put("columns", FormulaErrProperty.UPDATE_ALWAYS.getValue());
    FunctionErrProperties.put("formula", FormulaErrProperty.UPDATE_ALWAYS.getValue());
    FunctionErrProperties.put("now", FormulaErrProperty.UPDATE_ALWAYS.getValue());
    FunctionErrProperties.put("today", FormulaErrProperty.UPDATE_ALWAYS.getValue());
    FunctionErrProperties.put("indirect", FormulaErrProperty.UPDATE_ALWAYS.getValue());
    FunctionErrProperties.put("offset", FormulaErrProperty.UPDATE_ALWAYS.getValue());//??
    
    FunctionErrProperties.put("sheet", FormulaErrProperty.CARE_SHEET.getValue());
    
    FunctionErrProperties.put("subtotal", FormulaErrProperty.CARE_FILTER.getValue() | FormulaErrProperty.CARE_SHOWHIDE.getValue());
  }
  
  public static void setErrPropByFuncName(String funcName, FormulaCell cell)
  {
    cell.updateErrProps(FunctionErrProperties.get(funcName.toLowerCase()));
  }
}
