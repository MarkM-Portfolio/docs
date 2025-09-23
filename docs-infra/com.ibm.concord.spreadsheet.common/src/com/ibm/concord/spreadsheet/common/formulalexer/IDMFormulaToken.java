/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.common.formulalexer;

public class IDMFormulaToken
{
  public static enum LexTokenType {
    SEPERATOR_TYPE, OPERATOR_TYPE, STRING_TYPE, NUMBER_TYPE, ERROR_TYPE, REFERENCE_TYPE, NAME_TYPE, LOGICAL_TYPE, ARRAY_TYPE, FUNCTION_TYPE, WHITESPACE_IGNORE, MISS_PARAM_TYPE
  };

  public static enum TokenSubtype {
    SUBTYPE_INVALID, SEPERATOR_ARGUMENTS, // , or ; depend on locale
    NAME_SHEETNAME,
    SEPERATOR_OPEN, // (
    SEPERATOR_CLOSE, // )
    SEPERATOR_ARRAY_OPEN, // {
    SEPERATOR_ARRAY_CLOSE, // }
    SEPERATOR_ARRAY_ROW, // ;
    SEPERATOR_ARRAY_COL, // , or .
    OPERATOR_PREFIX, // no subtype for operator is infix
    OPERATOR_POSTFIX, // %
    OPERATOR_INTERSECTION, //
    OPERATOR_PLUS, OPERATOR_MINUS, OPERATOR_MUL, OPERATOR_DIV, OPERATOR_INDEX, OPERATOR_CONNECT, OPERATOR_GREATER, OPERATOR_GREATEREQUAL, OPERATOR_LESS, OPERATOR_LESSEQUAL, OPERATOR_EQUAL, OPERATOR_UNION, OPERATOR_COLON, NAME_INVALID
    // the name we can not be recognized, they might not conform with the MS name definition,
    // it might be R1C1 or table formula which we do not support now
  };

  public static enum ErrorTokenType {
    UNMATCHED_BRACE, UNMATCHED_ARRAY, CONST_ARRAY_TYPE, CONST_ARRAY_NUM, INVALID_NAME, INCORRECT_SEPARATOR, INVALID_STRING
  };

  String text;

  String _upperText;

  char ch;

  public LexTokenType type;

  public TokenSubtype subType;

  ErrorTokenType errorType;

  IDMFormulaToken pre;

  int nPar;

  private int offset;

  public Object value;

  public static IDMFormulaToken generateToken(char ch, LexTokenType type, TokenSubtype subType)
  {
    IDMFormulaToken token = new IDMFormulaToken();
    token.nPar = -1;
    token.pre = null;
    token.ch = ch;
    token.text = null;
    token.type = type;
    token.subType = subType;
    return token;
  };

  public static IDMFormulaToken generateTokenFromText(String text, LexTokenType type, TokenSubtype subType)
  {
    IDMFormulaToken token = new IDMFormulaToken();
    token.nPar = -1;
    token.pre = null;
    token.ch = 0;
    token.text = text;
    token.type = type;
    token.subType = subType;
    return token;
  };

  int getPriorityLevel()
  {
    if (type != LexTokenType.OPERATOR_TYPE)
      return -1;

    int level = 0;

    switch (subType)
      {
        case OPERATOR_POSTFIX :
          level = 60;
          break;
        case OPERATOR_PREFIX :
          level = 56;
          break;
        case OPERATOR_INTERSECTION :
          level = 70;
          break;
        case OPERATOR_PLUS :
        case OPERATOR_MINUS :
          level = 40;
          break;
        case OPERATOR_MUL :
        case OPERATOR_DIV :
          level = 50;
          break;
        case OPERATOR_INDEX :
          level = 55;
          break;
        case OPERATOR_CONNECT :
          level = 38;
          break;
        case OPERATOR_GREATER :
        case OPERATOR_GREATEREQUAL :
        case OPERATOR_LESS :
        case OPERATOR_LESSEQUAL :
        case OPERATOR_EQUAL :
          level = 10;
          break;
        case OPERATOR_UNION :
          level = 65;
          break;
        case OPERATOR_COLON :
          level = 80;
          break;
        default:
          break;
      }
    ;

    return level;
  }

  public String getText()
  {
    if (text == null || text.isEmpty())
    {
      text = String.valueOf(ch);
    }
    return text;
  }

  public String getDescription()
  {
    String description = "";
    switch (type)
      {
        case SEPERATOR_TYPE :
          description += ("SEPERATOR_TYPE");
          break;
        case OPERATOR_TYPE :
          description += ("OPERATOR_TYPE");
          break;
        case STRING_TYPE :
          description += ("STRING_TYPE");
          break;
        case NUMBER_TYPE :
          description += ("NUMBER_TYPE");
          break;
        case ERROR_TYPE :
          description += ("ERROR_TYPE");
          break;
        case REFERENCE_TYPE :
          description += ("REFERENCE_TYPE");
          break;
        case NAME_TYPE :
          description += ("NAME_TYPE");
          break;
        case LOGICAL_TYPE :
          description += ("LOGICAL_TYPE");
          break;
        case ARRAY_TYPE :
          description += ("ARRAY_TYPE");
          break;
        case FUNCTION_TYPE :
          description += ("FUNCTION_TYPE");
          break;
        case WHITESPACE_IGNORE :
          description += ("WHITESPACE_IGNORE");
          break;
        case MISS_PARAM_TYPE :
          description += ("MISS_PARAM_TYPE");
          break;
        default:
          description += ("UNKNOWN_TYPE");
          break;
      }
    description = description + " ";
    switch (subType)
      {
        case SEPERATOR_ARGUMENTS :
          description += ("SEPERATOR_ARGUMENTS");
          break;
        case SEPERATOR_OPEN :
          description += ("SEPERATOR_OPEN");
          break;
        case SEPERATOR_CLOSE :
          description += ("SEPERATOR_CLOSE");
          break;
        case SEPERATOR_ARRAY_OPEN :
          description += ("SEPERATOR_ARRAY_OPEN");
          break;
        case SEPERATOR_ARRAY_CLOSE :
          description += ("SEPERATOR_ARRAY_CLOSE");
          break;
        case SEPERATOR_ARRAY_ROW :
          description += ("SEPERATOR_ARRAY_ROW");
          break;
        case SEPERATOR_ARRAY_COL :
          description += ("SEPERATOR_ARRAY_COL");
          break;
        case OPERATOR_PREFIX :
          description += ("OPERATOR_PREFIX");
          break;
        case OPERATOR_POSTFIX :
          description += ("OPERATOR_POSTFIX");
          break;
        case OPERATOR_INTERSECTION :
          description += ("OPERATOR_INTERSECTION");
          break;
        case OPERATOR_PLUS :
          description += ("+");
          break;
        case OPERATOR_MINUS :
          description += ("-");
          break;
        case OPERATOR_MUL :
          description += ("*");
          break;
        case OPERATOR_DIV :
          description += ("/");
          break;
        case OPERATOR_INDEX :
          description += ("^");
          break;
        case OPERATOR_CONNECT :
          description += ("&");
          break;
        case OPERATOR_GREATER :
          description += (">");
          break;
        case OPERATOR_GREATEREQUAL :
          description += (">=");
          break;
        case OPERATOR_LESS :
          description += ("<");
          break;
        case OPERATOR_LESSEQUAL :
          description += ("<=");
          break;
        case OPERATOR_EQUAL :
          description += ("=");
          break;
        case NAME_INVALID :
          description += ("NAME_INVALID");
          break;
        default:
          description += ("UNKNOWN_ARGUMENTS");
          break;
      }
    description = description + " text:";
    if (text != null)
      description += (text);
    if (ch > 0)
      description += String.valueOf(ch);
    return description;
  }

  public String upperText()
  {
    if (_upperText == null || _upperText.isEmpty())
    {
      _upperText = text.toUpperCase();
    }
    return _upperText;
  }

  public void setOffset(int offset)
  {
    this.offset = offset;
  }

  public int getOffset()
  {
    return offset;
  }

}
