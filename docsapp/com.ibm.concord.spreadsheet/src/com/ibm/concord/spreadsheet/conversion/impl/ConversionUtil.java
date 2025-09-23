/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.conversion.impl;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import org.antlr.runtime.CommonTokenStream;
import org.antlr.runtime.Token;

import com.ibm.concord.spreadsheet.SpreadsheetConfig;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.formulalexer.FormulaLexer;
import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.common.utils.FormulaPrioritizer;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ConversionUtil {

  private static final Logger LOG = Logger.getLogger(FormulaPrioritizer.class.getName());
  private static HashMap<String,String> longkey2ShortMap; 
  
  private static final String TEXTREGEX = "@";
  private static final Pattern pattern = Pattern.compile(TEXTREGEX);
	
	
  /**
   * update original formula with the updated text
   * 
   * @param origFormula
   *          the original formula
   * @param tokenList
   *          the token only with the address updated, the index should not be changed which is the original token index in the original
   *          formula.
   * @return the updated formula
   */
  public static String updateFormula(String origFormula, ArrayList<FormulaToken> tokenList, JSONArray tokenArr)
  {
    // if the updated token list is null, just return the original formula
    if (tokenList == null)
      return origFormula;

    int copyStartIndex = 0;
    StringBuffer updatedFormula = new StringBuffer();
    if (origFormula != null)
    {
      Object[] sortTokenArray = sort(tokenList.toArray(), true);
      if(tokenArr == null){
	      for (int i = 0; i < sortTokenArray.length; i++)
	      {
	        try
	        {
	          FormulaToken formulaToken = (FormulaToken) sortTokenArray[i];
	          // copy part of the formula which does not related with the tokens
	          int tokenIndex = formulaToken.getIndex();
	          updatedFormula.append(origFormula.substring(copyStartIndex, tokenIndex));
	          // copy the updated tokens to the updatedFormula
	          String updateTokenAddress = formulaToken.getChangeText();
	          updatedFormula.append(updateTokenAddress);
	          String tokenAddress = formulaToken.getText();
	          copyStartIndex = tokenIndex + tokenAddress.length();
	        }
	        catch (Exception e)
	        {
	          e.printStackTrace();
	        }
	      }
      }else{
    	  tokenArr.clear();
    	  for (int i = 0; i < sortTokenArray.length; i++)
	      {
	        try
	        {
	          FormulaToken formulaToken = (FormulaToken) sortTokenArray[i];
	          // copy part of the formula which does not related with the tokens
	          int tokenIndex = formulaToken.getIndex();
	          updatedFormula.append(origFormula.substring(copyStartIndex, tokenIndex));
	          int ts = updatedFormula.length();
	          // copy the updated tokens to the updatedFormula
	          String updateTokenAddress = formulaToken.getChangeText();
	          updatedFormula.append(updateTokenAddress);
	          int te = updatedFormula.length();
	          JSONArray t = new JSONArray();
	          t.add(ts);
	          t.add(te);
	          tokenArr.add(t);
	          String tokenAddress = formulaToken.getText();
	          copyStartIndex = tokenIndex + tokenAddress.length();
	        }
	        catch (Exception e)
	        {
	          e.printStackTrace();
	        }
	      }
      }
      if (copyStartIndex < origFormula.length())
        updatedFormula.append(origFormula.substring(copyStartIndex));
      return updatedFormula.toString();
    }

    return null;
  }
  
  private static Object[] sort(Object[] array, final boolean bAscend)
  {
    if( (array != null) && (array.length > 1) ){
      Arrays.sort(array, new Comparator()   {
        public int compare(Object obj1, Object obj2)
        {
          Object value1 = ((FormulaToken)obj1).getIndex();
          Object value2 = ((FormulaToken)obj2).getIndex();
          int result = ((Comparable)value1).compareTo(value2);
          return bAscend?result:(0-result);
        }
      });
    }
    
    return array;
  }
 
//  public static FormulaToken generateFormulaToken(String text, HashMap<String, Range> nameRangeList){
//	  FormulaToken token = null;
//	  if(nameRangeList != null)
//	  {
//		  Iterator iter = nameRangeList.entrySet().iterator();
//		  while(iter.hasNext())
//		  {
//			  Map.Entry<String, Range> entry = (Map.Entry<String, Range>) iter.next();
//			  if(entry.getKey().equalsIgnoreCase(text))
//			  {
//				  token = new FormulaToken();
//		          token.setType(FormulaToken.TokenType.NAME);
//		          token.setText(entry.getKey());
//		          Range range = entry.getValue();
//		          ReferenceParser.ParsedRef ref = ReferenceParser.parse(range.getAddress());
//		          token.setRef(ref);
//		          return token;
//			  }
//		  }
//	  }
//	  
//	  ReferenceParser.ParsedRef ref = ReferenceParser.parse(text);
//	  if(ref != null && !ConversionConstant.COL_REFERENCE.equals(ref.type))
//	  {
//		  token = new FormulaToken();
//		  if(ConversionConstant.CELL_REFERENCE.equals(ref.type))
//			  token.setType(FormulaToken.TokenType.CELL);
//		  else
//			  token.setType(FormulaToken.TokenType.RANGE);
//		  token.setRef(ref);
//		  token.setText(text);
//	  }
//	  //#name, also create token
//	  else
//	  {
//		  token = new FormulaToken();
//          token.setType(FormulaToken.TokenType.NAME);
//          token.setText(text);         
//          return token;
//	  }
//	  
//	  return token;
//  }
   
//  public static FormulaToken generateVirtualToken(ArrayList<FormulaToken>tokenList ,FormulaToken left,FormulaToken right){
//	  FormulaToken token = new FormulaToken();
//	  int leftIndex = tokenList.indexOf(left);
//	  int rightIndex = tokenList.indexOf(right);
//	  token.setLIndex(leftIndex);
//	  token.setRIndex(rightIndex);
//	  token.setIndex(-1);
//      token.setType(FormulaToken.TokenType.VREF);
//	  return token;
//  }
  /**
   * Get the token map from the formula.
   * @param formula the cell formula
   * @nameList  the name range list of the current document which is used to match the formula token
   * @return    the token map contains cell reference, range reference and names reference
   *            and the keys are "cell", "range", "names"
   */
//  public static ArrayList<FormulaToken> getTokenFromFormula(String formula, HashMap<String, Range> nameRangeList){
////    System.out.println("Formula is : " + formula);
//    //the key are "cell", "range","names"
//    ArrayList<FormulaToken> tokenList = new ArrayList<FormulaToken>();   
//    if(formula.length() > 2000)
//    	return tokenList;
//    try {
//      ConversionUtil._cellHasUnicode = false;
//      java.io.ByteArrayInputStream strInput = new java.io.ByteArrayInputStream(formula.getBytes("utf-8"));
//      FormulaLexer lexer = new FormulaLexer(new ANTLRInputStream(strInput, "utf-8"));
//      CommonTokenStream tokens = new CommonTokenStream(lexer);
//      tokens.LT(0); // trigger  
//      if(ConversionUtil._cellHasUnicode)
//        normalizeTokens(tokens);
//      FormulaParser parser = new FormulaParser(tokens);
//      //input parameter
//      if(nameRangeList != null)
//    	  parser.nameinstances = nameRangeList;
//      //output parameter
//      parser.tokenList = tokenList;
//      parser.prog();
//      if(parser.error!=null)
//          tokenList.clear();
//    } catch (IOException e1) {
//      tokenList.clear();
//      LOG.log(Level.WARNING, "", e1);
//    } catch (RecognitionException e) {
//      tokenList.clear();
//      LOG.log(Level.WARNING, "the formula : \"" + formula +"\" can not be recognized", e);
//    } finally{
//    	return tokenList;
//    }
//  }

  public static ArrayList<FormulaToken> getTokenFromFormula(String formula){
    if (SpreadsheetConfig.useReferenceJS()==true) 
    {
      return FormulaUtil.parse(formula, null);
    }
    else 
    {
      return FormulaUtil.parseFormulaToken(formula, null, false);
    }
  }
  
  public static void normalizeTokens(CommonTokenStream tokens)
  {
    List tList = tokens.getTokens();
    boolean bStart = false;
    ArrayList<Token> nameTokens = new ArrayList<Token>();
    int size = tList.size();
    for(int i=size - 1; i>=0;i--)
    {
      Token token = (Token)tList.get(i);
      int type = token.getType();
      switch(type)
      {
        case FormulaLexer.NAME1:
          token.setType(FormulaLexer.NAME);
        case FormulaLexer.NAME:
//        case FormulaLexer.FUNC:
        //case FormulaLexer.ARRAY_FORMULAR_START:
        //case FormulaLexer.ARRAY_FORMULAR_END:
        case FormulaLexer.SINGLEQUOT_STRING:
        case FormulaLexer.ODF_TABLE:
            if(!bStart)
                bStart = true;
            nameTokens.add(token);
            break;
        default:
            if(bStart)
            {
                bStart = false;
                //collect all the tokens
                int len = nameTokens.size();
                if(len > 1)
                {
                    StringBuffer text = new StringBuffer();
                    for(int j=len-1; j>=0; j--){
                        Token tokenIter = nameTokens.get(j);
                        text.append(tokenIter.getText());
                        if(j < (len-1))
                          tList.remove(tokenIter);//delete the tokens in nameTokens except the first token
                    }
                    Token nameToken = nameTokens.get(len-1);
                    nameToken.setText(text.toString());
                    nameToken.setTokenIndex(nameToken.getTokenIndex() + len - 1); // also need to adjust token index
                    nameToken.setType(FormulaLexer.NAME);
                }
                nameTokens.clear();
            }
        }
      }
    }
  
  /**
   * get Formula Token of formula from the token array which indicate the token start index and end index of the formula
   * @param formula 
   * @param tokenArr two-dimensional array
   * @return
   */
  public static ArrayList<FormulaToken> getTokenFromTokenArray(String formula, JSONArray tokenArr){
	  ArrayList<FormulaToken> tokenList = new ArrayList<FormulaToken>();
	  if(tokenArr != null){
		  int length = tokenArr.size();
		  for (int i = 0; i < length; i++) {
				JSONArray arrToken = (JSONArray)tokenArr.get(i);
				int from = Integer.parseInt(arrToken.get(0).toString());
				int to = Integer.parseInt(arrToken.get(1).toString());
				String strToken = formula.substring(from, to);
				FormulaToken token = FormulaUtil.generateToken(strToken, null,false);
				if(token != null){
					token.setIndex(from);
					tokenList.add(token);
				}
			}
	  }
	  return tokenList;
  }
  
    public static enum RangeUsage
    {
      NORMAL("normal"), 
      DELETE("delete"), 
      ANCHOR("anchor"), 
      PCOMMENT("pcomment"), 
      INHERIT("inherit"), 
      COPY("copy"), 
      FORMULA("formula"), //table:expression
      VALIDATION_REF("validation_ref"),
      RANGEFILTER("rangefilter"), //preserve range usage, differnt with FILTER usage
      SPLIT("split"), 
      CHART("chart"), 
      CHART_REF("chart_ref"),
      STYLE("style"),//used for preserve style range
      NAMES("NAMES"),
      UNDEFINE_NAMES("UNDEFINENAMES"),
      TASK("TASK"),
      FILTER("FILTER"),
      COMMENT("COMMENTS"),
      IMAGE("IMAGE"),
      SHAPE("SHAPE"),
      CHART_AS_IMAGE("CHART_AS_IMAGE"),
      ACCESS_PERMISSION("ACCESS_PERMISSION"),
      DATA_VALIDATION("DATA_VALIDATION"),
      CONDITIONAL_FORMAT("CONDITIONAL_FORMAT"),
      SHARED_FORMULAS("SHARED_FORMULAS"),
      SHARED_REFS("SHARED_REFS"),
      REFERENCE("REFERENCE"),//the formula reference in value cell
      RECOVER_REFERENCE("RECREF");//the formula reference referred by recover doc, store such range in unnamed range 
      
      private String mValue;
      RangeUsage(String value){
        mValue = value;
      }
      
      public String toString(){
        return mValue;
      }
      
      public static RangeUsage enumValueOf(String value) {
        if(!CommonUtils.hasValue(value))
          return RangeUsage.NORMAL;
        for(RangeUsage aIter : values()) {
            if (value.equalsIgnoreCase(aIter.toString())) {
            return aIter;
            }
        }
        return RangeUsage.NORMAL;
      }
    }
    
    public static enum RangeRelation
    {
      INVALID, NOINTERSECTION, INTERSECTION, EQUAL, SUBSET, SUPERSET
    }
    
    public static enum AreaRelation
    {
      LESS, EQUAL, GREATER, NONE, EQUAL_NOTSHEETRANGE
    }
    
    private static String getShortKey(String longKey)
    {
        if(longkey2ShortMap==null)
        {
           longkey2ShortMap = new HashMap<String,String>();
//           longkey2ShortMap.put(ConversionConstant.VALUE_A, ConversionConstant.VALUE);
           longkey2ShortMap.put("value", ConversionConstant.VALUE);
           longkey2ShortMap.put(ConversionConstant.TEXT_ALIGN_A, ConversionConstant.TEXT_ALIGN);
           longkey2ShortMap.put(ConversionConstant.VERTICAL_ALIGN_A, ConversionConstant.VERTICAL_ALIGN);
           longkey2ShortMap.put(ConversionConstant.BACKGROUND_COLOR_A, ConversionConstant.BACKGROUND_COLOR);
           longkey2ShortMap.put(ConversionConstant.WRAPTEXT_A, ConversionConstant.WRAPTEXT);
           longkey2ShortMap.put(ConversionConstant.DIRECTION_A, ConversionConstant.DIRECTION);
           longkey2ShortMap.put(ConversionConstant.BORDER_LEFT_A, ConversionConstant.BORDER_LEFT);
           longkey2ShortMap.put(ConversionConstant.BORDER_RIGHT_A, ConversionConstant.BORDER_RIGHT);
           longkey2ShortMap.put(ConversionConstant.BORDER_TOP_A, ConversionConstant.BORDER_TOP);
           longkey2ShortMap.put(ConversionConstant.BORDER_BOTTOM_A, ConversionConstant.BORDER_BOTTOM);
           longkey2ShortMap.put(ConversionConstant.BORDER_LEFT_COLOR_A, ConversionConstant.BORDER_LEFT_COLOR);
           longkey2ShortMap.put(ConversionConstant.BORDER_RIGHT_COLOR_A, ConversionConstant.BORDER_RIGHT_COLOR);
           longkey2ShortMap.put(ConversionConstant.BORDER_TOP_COLOR_A, ConversionConstant.BORDER_TOP_COLOR);
           longkey2ShortMap.put(ConversionConstant.BORDER_BOTTOM_COLOR_A, ConversionConstant.BORDER_BOTTOM_COLOR);
           longkey2ShortMap.put(ConversionConstant.BORDER_LEFT_STYLE_A, ConversionConstant.BORDER_LEFT_STYLE);
           longkey2ShortMap.put(ConversionConstant.BORDER_RIGHT_STYLE_A, ConversionConstant.BORDER_RIGHT_STYLE);
           longkey2ShortMap.put(ConversionConstant.BORDER_TOP_STYLE_A, ConversionConstant.BORDER_TOP_STYLE);
           longkey2ShortMap.put(ConversionConstant.BORDER_BOTTOM_STYLE_A, ConversionConstant.BORDER_BOTTOM_STYLE);
           longkey2ShortMap.put(ConversionConstant.WIDTH_A, ConversionConstant.WIDTH);
//           longkey2ShortMap.put(ConversionConstant.HEIGHT_A, ConversionConstant.HEIGHT);
           longkey2ShortMap.put("height", ConversionConstant.HEIGHT);
//           longkey2ShortMap.put(ConversionConstant.RANGE_ADDRESS_A, ConversionConstant.RANGE_ADDRESS);
//           longkey2ShortMap.put(ConversionConstant.RANGE_STARTROWID_A, ConversionConstant.RANGE_STARTROWID);
//           longkey2ShortMap.put(ConversionConstant.RANGE_ENDROWID_A, ConversionConstant.RANGE_ENDROWID);
//           longkey2ShortMap.put(ConversionConstant.RANGE_STARTCOLID_A, ConversionConstant.RANGE_STARTCOLID);
//           longkey2ShortMap.put(ConversionConstant.RANGE_ENDCOLID_A, ConversionConstant.RANGE_ENDCOLID);
//           longkey2ShortMap.put(ConversionConstant.REPEATEDNUM_A, ConversionConstant.REPEATEDNUM);
           longkey2ShortMap.put("repeatednum", ConversionConstant.REPEATEDNUM);
//           longkey2ShortMap.put(ConversionConstant.STYLEID_A, ConversionConstant.STYLEID);
           longkey2ShortMap.put(ConversionConstant.COLUMNID_NAME_A, ConversionConstant.COLUMNID_NAME);
           longkey2ShortMap.put(ConversionConstant.ROWID_NAME_A, ConversionConstant.ROWID_NAME);
           longkey2ShortMap.put(ConversionConstant.COLSPAN_A, ConversionConstant.COLSPAN);
           longkey2ShortMap.put("colspan", ConversionConstant.COLSPAN);
           longkey2ShortMap.put(ConversionConstant.ISCOVERED_A, ConversionConstant.ISCOVERED);
           longkey2ShortMap.put(ConversionConstant.VISIBILITY_A, ConversionConstant.VISIBILITY);
//           longkey2ShortMap.put(ConversionConstant.OFFSET_A, ConversionConstant.OFFSET);
           longkey2ShortMap.put("offset", ConversionConstant.OFFSET);
           
           longkey2ShortMap.put(ConversionConstant.FORMATCATEGORY_A, ConversionConstant.FORMATCATEGORY);
           longkey2ShortMap.put(ConversionConstant.FORMATCURRENCY_A, ConversionConstant.FORMATCURRENCY);
           longkey2ShortMap.put(ConversionConstant.FORMAT_FONTCOLOR_A, ConversionConstant.FORMAT_FONTCOLOR);
           longkey2ShortMap.put(ConversionConstant.FONTNAME_A, ConversionConstant.FONTNAME);
           longkey2ShortMap.put(ConversionConstant.SIZE_A, ConversionConstant.SIZE);
           longkey2ShortMap.put(ConversionConstant.COLOR_A, ConversionConstant.COLOR);
           longkey2ShortMap.put(ConversionConstant.ITALIC_A, ConversionConstant.ITALIC);
           longkey2ShortMap.put(ConversionConstant.UNDERLINE_A, ConversionConstant.UNDERLINE);
           longkey2ShortMap.put(ConversionConstant.STRIKTHROUGH_A, ConversionConstant.STRIKTHROUGH);
           longkey2ShortMap.put(ConversionConstant.BOLD_A, ConversionConstant.BOLD);
        }
        String shortKey = longkey2ShortMap.get(longKey);
        if(shortKey==null)
          shortKey = longKey;
        return shortKey;
    }
    
    /*
     * clone the json obj and map any long key being defined in longkey2ShortMap to corresponding short key
     * it is used when apply to spreadsheet model client messages that contains long key
     */
    public static JSONObject newWithShortKey(JSONObject obj)
    {
      JSONObject newObj = new JSONObject();
      Iterator<?> itor = obj.entrySet().iterator();
      while(itor.hasNext())
      {
          Map.Entry<?, ?> entry = (Map.Entry<?, ?>) itor.next();
          String key = (String)entry.getKey();
          Object value = entry.getValue();
          Object newValue = null;
          if(value instanceof JSONObject)
            newValue = newWithShortKey((JSONObject)value);
          else
            newValue = value;
          newObj.put(getShortKey(key), newValue);
      }
      return newObj;
    }

	static class LevelToken{
      public LevelToken(int level,String text){
        this.level=level;
        this.text=text;
      }
      public String text;
      public int level;
      public int endIndex=-1;
      public int startIndex=-1;
      public boolean wrongPriority=false;
      public boolean func=false;
    }
}
