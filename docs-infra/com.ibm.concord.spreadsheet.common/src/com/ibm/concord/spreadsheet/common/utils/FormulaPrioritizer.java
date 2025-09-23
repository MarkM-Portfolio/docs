/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.common.utils;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.antlr.runtime.ANTLRInputStream;
import org.antlr.runtime.CommonTokenStream;
import org.antlr.runtime.Token;

import com.ibm.concord.spreadsheet.common.formulalexer.FormulaLexer;

public class FormulaPrioritizer
{
  private static final Logger LOG = Logger.getLogger(FormulaPrioritizer.class.getName());

  public static String prioritize(String formula)
  {
    try
    {
      // ConversionUtil._cellHasUnicode = false;
      ByteArrayInputStream strInput = new java.io.ByteArrayInputStream(formula.getBytes("utf-8"));
      FormulaLexer lexer = new FormulaLexer(new ANTLRInputStream(strInput, "utf-8"));
      CommonTokenStream tokens = new CommonTokenStream(lexer);
      // tokens.getTokens(); // trigger
      // if(ConversionUtil._cellHasUnicode)
      // ConversionUtil.normalizeTokens(tokens);
      String fv = FormulaPrioritizer.prioritize(tokens.getTokens());
      if (!formula.equals(fv))
        formula = fv;
      ;
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    return formula;
  }

  /*
   * set correct priority for the operator token return the new formula string
   */
  public static String prioritize(List<Token> tokenList)
  {
    List<LevelToken> levelList = new ArrayList<LevelToken>(10);
    int length = tokenList.size();
    String firstChar = tokenList.get(0).getText();
    int i = 1; // the first token is "=" or "{=", ignore it
    if (firstChar.equals("{"))
      i = 2;
    for (; i < length; ++i)
    {
      Token token = tokenList.get(i);
      int type = token.getType();
      LevelToken o = new LevelToken(getPriorityLevel(type), token.getText());
      // for case =2+3*SUM+3 and =2+3*SUM (a1) +3
      if (type == FormulaLexer.NAME)
      {
        int next = i + 1;
        if (next < length)
        {
          while (next < length && tokenList.get(next).getType() == FormulaLexer.WHITESPACE)
          {
            next++;
          }
          if (next < length && tokenList.get(next).getType() == FormulaLexer.P_OPEN)
            o.func = true;
        }
        levelList.add(o);
      }
      else if (type == FormulaLexer.FUNC)
      {
        o.func = true;
        // because FUNC is NAME '(' so that need to split the FUNC to 2 LevelItem to prioritize
        o.text = o.text.substring(0, o.text.length() - 1);
        levelList.add(o);
        o = new LevelToken(100, "(");
        levelList.add(o);
      }
      else
      {
        levelList.add(o);
      }

    }
    doPriority(levelList, 0, false);

    return firstChar.equals("{") ? ("{" + getFormulaString(levelList)) : getFormulaString(levelList);
  }

  /*
   * Traverse the given token list, check whether there has any operator token that has wrong priority and determine its startindex and
   * endindex.
   * 
   * @param list the array of items that has 'level', 'text' and 'func'
   * 
   * @param index the start index of the 'list' array from which doPriority is executed
   * 
   * @param bRecursive true if it is one recursive function call
   */
  private static int doPriority(List<LevelToken> list, int index, boolean bRecursive)
  {
    int length = list.size();
    int prevIndex = index;
    int currentLevel = -1;
    LevelToken item = null;
    Stack<LevelToken> itemStack = new Stack<LevelToken>();
    if (bRecursive)
    { // skip the "(" token at recursive call
      if (list.get(index).level == 100){
        index++;
        //restart the priority check
        prevIndex = index;
      }
    }
    // boolean bFirstOperand = false; // the first operand isn't found yet
    while (index < length)
    {
      LevelToken o = list.get(index);
      int level = o.level;
      // ignore all operators that don't follow any operand and
      // ignore the level 0 or -1 token
      // if (level <= 0 || !bFirstOperand) { // level 0 or -1 should be ignored
      // if (level == 0 && !bFirstOperand)
      // bFirstOperand = true; // the first operand is found
      if (level <= 0)
      {
        index++;
        continue;
      }
      if (level == 40)
      {
        boolean bSingleOperator = false;
        if (prevIndex == index)// the start of the expression, such as "-" is the first character after '(', ',', '='
          bSingleOperator = true;
        else if (currentLevel > 0)
        {
          // the previous token is the operator token rather than the operand, ignore the whitespace token
          boolean bAllWhitespace = true;
          for (int i = index - 1; i > prevIndex; i--)
          {
            LevelToken tmp = list.get(i);
            if (tmp.level != -1)
            {
              bAllWhitespace = false;
              break;
            }
          }
          if (bAllWhitespace)
            bSingleOperator = true;
        }
        if (bSingleOperator)
        {
          level = 56;
          LevelToken tmp = list.get(index);
          tmp.level = level;// change "+"/"-" from infix operator priority to prefix operator priority, such as =-A1:B1^2
        }
      }
      // find the matched "}" token and exit at recursive call
      if (bRecursive)
      {
        if (level == 101)
        { // the matched "P_CLOSE" token is found, exit the while loop

          if (itemStack.size() > 0 && (itemStack.peek().endIndex == -1))
          {
            item = itemStack.pop();
            item.endIndex = index;
          }
          index++; // skip the matched token
          break;
        }
        else if (level == 102)
        { // it is the argument separator ","
          // to process the end of formula string
          while (!itemStack.isEmpty())
          {
            item = itemStack.pop();
            item.endIndex = index;
          }
          //restart the priority check
          currentLevel = -1;
          index++; // skip the matched token
          prevIndex = index;
          continue;
        }
      }
      if (currentLevel == -1 || level > currentLevel)
      {
        if (level > 100)
        {
          LOG.log(Level.INFO, "wrong formula syntax");
        }
        else if (level == 100)
        { // "("
          if (currentLevel == -1)
            currentLevel = level;
          prevIndex = index;
          index = doPriority(list, index, true);
          continue;
        }
        else if (currentLevel != -1)
        {
          // check whether the previous token is function token, if yes,
          // get the index of low level operator prior to the function token
          // for example: 1+SUM(2)*3
          if (prevIndex > 1 && list.get(prevIndex - 1).func)
          {
            prevIndex -= 2;
            o.startIndex = prevIndex;
          }
          else
          {
            prevIndex--;
            int whitespace = 0;
            if (o.level == 80 || o.level == 70)
            {
			  // do nothing for case =-A1!A2  -> =-(A1!A2)
              // do nothing because for colon operator we need set the prevIndex before the operand in the case: =----a1:a2:a3
              // ,=1---a1:a2:a3
            }
            else
            {
              while (prevIndex >= 0)
              { // find the previous avaliable operator in the case : =1+---1^2
                LevelToken tmp = list.get(prevIndex);
                if (tmp.level == 0 || tmp.level == 100 || tmp.level == 101 || tmp.level == 102)
                {
                  break;
                }
                else if (tmp.level == -1)
                { // should record the beginning whitespace
                  whitespace++;
                }
                else if (tmp.level == 60)
                {
                  break;
                }
                else if (tmp.level == level)
                {
                  prevIndex--; // case: =8/--2*2 or =8/--2^2 --> =(8/--2*2) set before number 8
                  if (prevIndex >= 0 && list.get(prevIndex).level == 60)
                  {
                    prevIndex++; // case: =a1%*-100*1 --> =a1%*(-100*1) set before asterisk
                  }
                }
                else
                  whitespace = 0; // should ignore the whitespace which is among in the substring.

                prevIndex--;
              }
            }
            // ignore the first whitespace but not others =- 4 + -- 1 % => =- 4 +( -- 1 %)
            o.startIndex = ++prevIndex + whitespace;
          }
          o.wrongPriority = true;

          itemStack.push(o);
          // shoule go to the next avaliable operator for the case: =-1*----3
          int next_index = index + 1;
          while (next_index < length)
          {
            LevelToken tmp = list.get(next_index);
            if (tmp.level == 0 || tmp.level == 100 || tmp.level == 101 || tmp.level == 102)
            {
              index = next_index - 1;
              break;
            }
            else if (o.level == 60)
            {
              if (o.level == tmp.level)
              {// case =-A1%%%*-10 -> =(-a1%%%*-10)
               // shift next
              }
              else
              { // case =1+a1%+a1% -> 1+(a1%)+(a1%)
                index = next_index - 1;
                break;
              }
            }
            next_index++;
          }
        }
      }
      else if (!itemStack.isEmpty())
      {
        // when process one operator we should check current index weather we should set the stored operator's right bracket in the case
        // :1+2*2^3*4+3
        while (!itemStack.isEmpty())
        {
          item = itemStack.peek();
          LevelToken previousItem = list.get(item.startIndex);
          if (item.level > level && level <= previousItem.level)
          {
            item.endIndex = index;
            itemStack.pop();
          }
          else
          {
            // shoule go to the next avaliable operator for the case: =-1*----3
            int next_index = index + 1;
            while (next_index < length)
            {
              LevelToken tmp = list.get(next_index);
              if (tmp.level == 0 || tmp.level == 100 || tmp.level == 101 || tmp.level == 102)
              {
                index = next_index - 1;
                break;
              }
              else if (o.level == 60)
              {
                if (o.level == tmp.level)
                {// case =-A1%%%*-10 -> =(-a1%%%*-10)
                 // shift next
                }
                else
                { // case =1+a1%+a1% -> 1+(a1%)+(a1%)
                  index = next_index - 1;
                  break;
                }
              }
              next_index++;
            }
            break;
          }
        }
      }
      currentLevel = level;
      prevIndex = index;
      index++;
    }

    // to process the end of formula string
    while (!itemStack.isEmpty())
    {
      item = itemStack.pop();
      item.endIndex = index;
    }
    return index;
  }

  /*
   * Get the new formula string with correct priority setting
   * 
   * @return the new formula string
   */
  /* string */private static String getFormulaString(List<LevelToken> list)
  {
    LevelToken temp = new LevelToken(0, ""); // in case ")" should be append to the last token text
    list.add(temp);

    int length = list.size();
    for (int i = 0; i < length; ++i)
    {
      LevelToken o = list.get(i);
      if (o.wrongPriority)
      {
        // we ignore the first opeartor like = ----3*4 -> = (----3*4) but not for colon
        // for the case = -a1:a2:a3 -> =-(a1:a2:a3)
    	// =-A1!A2 => =-(A1!A2)  and =----A1!A2 -> =----(A1!A2) 
        // it's a bit tricky here.
        if (o.startIndex == 0 && o.level != 80 && o.level != 70)
          list.get(o.startIndex).text = "(" + list.get(o.startIndex).text;
        else
          list.get(o.startIndex).text += "(";
        list.get(o.endIndex).text = ")" + list.get(o.endIndex).text;
      }
    }

    String formula = "="; // formula string always starts with "="
    for (int i = 0; i < length; ++i)
      if (list.get(i).text != null)
        formula += list.get(i).text;
      else
        return null; // sth wrong exists???

    return formula;
  }

  static class LevelToken
  {
    public LevelToken(int level, String text)
    {
      this.level = level;
      this.text = text;
    }

    public String text;

    public int level;

    public int endIndex = -1;

    public int startIndex = -1;

    public boolean wrongPriority = false;

    public boolean func = false;
  }

  /*
   * Get the priority level of the token with specified token type 'type'
   * 
   * @return the priority level
   */
  private static int getPriorityLevel(int type)
  {
    int level = 0;
    switch (type)
      {
        case FormulaLexer.WHITESPACE : // for case: =1> =2,=1* -2,etc,we should ignore any spaces.
        case FormulaLexer.WHITESPACE1 :
          level = -1;
          break;
        case FormulaLexer.LESS : // "<"
        case FormulaLexer.GREATER : // ">"
        case FormulaLexer.LESSEQUAL : // "<="
        case FormulaLexer.GREATEREQUAL : // ">="
        case FormulaLexer.NOTEQUAL : // "<>"
        case FormulaLexer.EQUAL :// "="
          level = 10;
          break;
        // these operator are invalid
        // case FormulaLexer.MODEQUAL: // "%="
        // case FormulaLexer.MULTEEQUAL: // "*="
        // case FormulaLexer.DIVEQUAL: // "/="
        // case FormulaLexer.PLUSEQUAL: // "+="
        // case FormulaLexer.MINUSEQUAL: // "-="
        // level = 20;
        // break;
        // case FormulaLexer.NOTEQUAL: // "<>"
        // case FormulaLexer.NOTEQUAL2: // "!="
        // case FormulaLexer.EQUAL:// "="
        // level = 30;
        // break;
        case FormulaLexer.AND : // "&"
          level = 38;
          break;
        case FormulaLexer.PLUS : // "+"
        case FormulaLexer.MINUS : // "-"
          level = 40;
          break;
        case FormulaLexer.MULT : // "*"
        case FormulaLexer.DIV : // "/"
          level = 50;
          break;
        case FormulaLexer.POW : // "^"
          level = 55;
          break;
        //56 preserved for "+"/"-" as the prefix operator rather than infix operator
        case FormulaLexer.MODE : // "%"
          level = 60;
          break;
        case FormulaLexer.CONCATENATION : // "~"
          level = 65;
          break;
        case FormulaLexer.INTERSECT : // "!"
          level = 70;
          break;
        case FormulaLexer.COLON : // ":"
          level = 80;
          break;
        // case FormulaLexer.RANGE_FUNC: // function token will be ignored
        // level = 99;
        // break;
        case FormulaLexer.P_OPEN : // "("
        case FormulaLexer.ARRAY_FORMULAR_START :
          level = 100;
          break;
        case FormulaLexer.P_CLOSE : // ")"
        case FormulaLexer.ARRAY_FORMULAR_END :
          level = 101;
          break;
        case FormulaLexer.ARG_SEP : // "," FIXME
        case FormulaLexer.ARG_SEP_WRONG :
          level = 102;
          break;
        default:
          break;
      }
    ;

    return level;
  }
}
