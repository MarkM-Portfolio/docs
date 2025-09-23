/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.formulalexer;

import java.util.ArrayList;
import java.util.List;

import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaToken.ErrorTokenType;
import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaToken.LexTokenType;
import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaToken.TokenSubtype;

public class IDMODFFormulaLexer
{
  String formula;

  List<IDMFormulaToken> tokens;

  IDMFormulaStack tokenStack;

  int formulaLen;

  int offset;

  boolean bInArray;

  int nBrackets;

  IDMFormulaError ferror;

  String curentLocale;

  String langCode;

  char _separator;

  char _separatorCol;

  char _separatorRow;

  char _chartseparator;

  char _unionChar;

  char _intersectionChar;

  char _separatorSheetname;

  char _decimal;

  public static enum State {
    STATE_START, STATE_STRING, STATE_NUM, STATE_NAME, STATE_STOP, STATE_SHEET_SPECIAL
  };

  public IDMODFFormulaLexer()
  {
    ferror = (null);
    offset = (0);
    formulaLen = (0);
    nBrackets = (0);
    curentLocale = "en";
    langCode = "en";
    bInArray = false;
    tokens = new ArrayList<IDMFormulaToken>();
    tokenStack = new IDMFormulaStack();
    _decimal = '.';
    _separator = ';';
    _chartseparator = ',';
    _separatorCol = ';';
    _separatorRow = '|';
    _unionChar = '~';
    _intersectionChar = '!';
    _separatorSheetname = '.';
  }

  public void initWithFormula(String formula)
  {
    this.formula = formula;
    this.tokens = new ArrayList<IDMFormulaToken>();
    this.offset = 0;
    this.formulaLen = formula.length();
  }

  void parse()
  {
    if (formula.isEmpty())
      return;
    IDMFormulaToken curToken = null;
    IDMFormulaToken preToken = null;
    int maxTokenNum = 65536;
    while ((curToken = nextToken()) != null && ferror == null)
    {
      maxTokenNum--;
      if ( (preToken != null && 
           preToken.getOffset() == curToken.getOffset() &&
           preToken.getText().equals(curToken.getText())) 
           || maxTokenNum<0 )
      {
        // preToken == curToken || invoke nextToken() too many times, maybe the deadlock loop. mark it as can not parsed
        ferror = IDMFormulaError.IDMUnParseError;
        break;
      }
      IDMFormulaToken stackToken = tokenStack.peek();
      IDMFormulaToken funcToken = null;
      if (stackToken != null)
        funcToken = stackToken.pre;
      boolean bInFunc = false;
      if (funcToken != null && funcToken.type == IDMFormulaToken.LexTokenType.FUNCTION_TYPE)
        bInFunc = true;
      LexTokenType type = curToken.type;
      TokenSubtype subType = curToken.subType;

      if (type == IDMFormulaToken.LexTokenType.SEPERATOR_TYPE)
      {
        switch (subType)
          {
            case SEPERATOR_OPEN :
              nBrackets++;
              tokenStack.push(curToken);
              if (bInFunc)
                curToken.nPar = 0; // init number of function/expression params
              break;
            case SEPERATOR_CLOSE :
              nBrackets--;
              if (nBrackets < 0)
              {
                error(curToken, IDMFormulaToken.ErrorTokenType.UNMATCHED_BRACE);
              }
              else
              {
                if (bInFunc)
                {
                  stackToken.nPar++;
                  if (preToken == stackToken && stackToken.nPar == 1)
                    stackToken.nPar = 0;
                }
              }
              tokenStack.pop();
              break;
            case SEPERATOR_ARRAY_OPEN :
              if (bInArray)
                error(curToken, IDMFormulaToken.ErrorTokenType.UNMATCHED_ARRAY);
              bInArray = true;
              tokenStack.push(curToken);
              break;
            case SEPERATOR_ARRAY_CLOSE :
              if (!bInArray)
                error(curToken, IDMFormulaToken.ErrorTokenType.UNMATCHED_ARRAY);
              bInArray = false;
              // mergeAndBuildArrayToken();
              tokenStack.pop();
              break;
            case SEPERATOR_ARGUMENTS :
              if (bInFunc == true)
                stackToken.nPar++;
              else if (stackToken != null)
              {
                type = IDMFormulaToken.LexTokenType.OPERATOR_TYPE;
                curToken.type = type;
                subType = IDMFormulaToken.TokenSubtype.OPERATOR_UNION;
                curToken.subType = subType;
              }
              break;
            default:
              break;
          } // end switch
        TokenSubtype preSubType = (preToken == null) ? IDMFormulaToken.TokenSubtype.SUBTYPE_INVALID : preToken.subType;
        if (!(preSubType == IDMFormulaToken.TokenSubtype.SEPERATOR_OPEN && subType == IDMFormulaToken.TokenSubtype.SEPERATOR_CLOSE)
            && (preSubType == IDMFormulaToken.TokenSubtype.SEPERATOR_ARGUMENTS
                || preSubType == IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_COL
                || preSubType == IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_ROW || preSubType == IDMFormulaToken.TokenSubtype.SEPERATOR_OPEN)
            && (subType == IDMFormulaToken.TokenSubtype.SEPERATOR_ARGUMENTS || subType == IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_COL
                || subType == IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_ROW || subType == IDMFormulaToken.TokenSubtype.SEPERATOR_CLOSE))
        {
          IDMFormulaToken t = generateToken('\0', IDMFormulaToken.LexTokenType.MISS_PARAM_TYPE,
              IDMFormulaToken.TokenSubtype.SUBTYPE_INVALID);
          pushToList(t);
          if (bInArray)
          {
            // array item miss error
            error(stackToken, IDMFormulaToken.ErrorTokenType.CONST_ARRAY_NUM);
          }
        }
      } // end if
      else
      {
        // whitespace
        if (type == IDMFormulaToken.LexTokenType.OPERATOR_TYPE && subType == IDMFormulaToken.TokenSubtype.OPERATOR_INTERSECTION)
        {
          if (preToken.type != IDMFormulaToken.LexTokenType.NAME_TYPE && preToken.type != IDMFormulaToken.LexTokenType.REFERENCE_TYPE
              && preToken.subType != IDMFormulaToken.TokenSubtype.SEPERATOR_CLOSE)
          {
            type = IDMFormulaToken.LexTokenType.WHITESPACE_IGNORE;
            curToken.type = type;
          }
        }
        else if (type == IDMFormulaToken.LexTokenType.NAME_TYPE)
        {
          Object value = "";
          LexTokenType changeType = curToken.type;
          Boolean boolValue = IDMFormulaLexer.isLogical(curToken.text);
          if (boolValue != null)
          {
            changeType = IDMFormulaToken.LexTokenType.LOGICAL_TYPE;
            value = boolValue;
          }
          else if (curToken.text != null && !curToken.text.isEmpty() && curToken.text.charAt(0) == '#')
          {
            IDMFormulaError error = IDMFormulaLexer.errorInstanceByName(curToken.text.toUpperCase());
            // #warning error should improve performance.
            if (error != null)
            {
              changeType = IDMFormulaToken.LexTokenType.ERROR_TYPE;
              value = error.errorCode + " " + error.message;
            }
          }
          if (changeType != curToken.type)
            curToken.type = changeType;
          curToken.value = value;
        }
        // else if (bInArray && type != IDMFormulaToken.LexTokenType.STRING_TYPE && type != IDMFormulaToken.LexTokenType.NUMBER_TYPE
        // && type != IDMFormulaToken.LexTokenType.ERROR_TYPE && type != IDMFormulaToken.LexTokenType.LOGICAL_TYPE
        // && type != IDMFormulaToken.LexTokenType.WHITESPACE_IGNORE)
        // {
        // // array item type error
        // error(stackToken, IDMFormulaToken.ErrorTokenType.CONST_ARRAY_TYPE);
        // }
      }
      // preserve all space for formula transform
      // if (type != IDMFormulaToken.LexTokenType.WHITESPACE_IGNORE)
      {
        pushToList(curToken);
        mergeAndAdaptToken(curToken);
        if (tokens.size() > 0)
          preToken = tokens.get(tokens.size() - 1); // curToken;
        else
          preToken = null;
      }
    }
    mergeAndAdaptToken(null);
    if (nBrackets != 0)
    {
      error(curToken, IDMFormulaToken.ErrorTokenType.UNMATCHED_BRACE);
    }
    if (bInArray)
    {
      error(curToken, IDMFormulaToken.ErrorTokenType.UNMATCHED_ARRAY);
    }
  };

  // FormulaToken tokenByIndex( int index )
  // {
  // if (index<0 || index >= tokens.size()) return null;
  // return tokens.get(index);
  // };
  //
  IDMFormulaToken nextToken()
  {
    State state = State.STATE_START;
    IDMFormulaToken token = null;
    while (!eof() && state != State.STATE_STOP)
    {
      char current_char = currentAndMoveCursor();
      switch (state)
        {
          case STATE_START :
          {
            switch (current_char)
              {
                case '[' :
                  backward(1);
                  state = State.STATE_SHEET_SPECIAL;
                  break;
                case '(' :
                {
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.SEPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.SEPERATOR_OPEN);
                  break;
                }
                case ')' :
                {
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.SEPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.SEPERATOR_CLOSE);
                  break;
                }
                case '{' :
                {
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.SEPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_OPEN);
                  break;
                }
                case '}' :
                {
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.SEPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_CLOSE);
                  break;
                }
                case ';' :
                case '|' :
                case ',' :
                {
                  if (_decimal == current_char)
                  {
                    backward(1);
                    state = State.STATE_NUM;
                  }
                  else if (bInArray)
                  {
                    if (current_char == _separatorRow)
                    {
                      token = generateToken(current_char, IDMFormulaToken.LexTokenType.SEPERATOR_TYPE,
                          IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_ROW);
                    }
                    else if (current_char == _separatorCol)
                    {
                      token = generateToken(current_char, IDMFormulaToken.LexTokenType.SEPERATOR_TYPE,
                          IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_COL);
                    }
                  }
                  else if (_separator == current_char)
                  {
                    token = generateToken(current_char, IDMFormulaToken.LexTokenType.SEPERATOR_TYPE,
                        IDMFormulaToken.TokenSubtype.SEPERATOR_ARGUMENTS);
                  }
                  else if (_chartseparator == current_char)
                  {
                    token = generateToken(current_char, IDMFormulaToken.LexTokenType.SEPERATOR_TYPE,
                        IDMFormulaToken.TokenSubtype.SEPERATOR_ARGUMENTS);
                  }
                  else
                  {
                    // error;
                    token = generateToken(current_char, IDMFormulaToken.LexTokenType.SEPERATOR_TYPE,
                        IDMFormulaToken.TokenSubtype.SUBTYPE_INVALID);
                    error(token, IDMFormulaToken.ErrorTokenType.INCORRECT_SEPARATOR);
                  }

                  break;
                }
                case '.' :
                {
                  if (_decimal == current_char)
                  {
                    backward(1);
                    state = State.STATE_NUM;
                  }
                  else if (bInArray && (_separator == _separatorCol))
                  {
                    token = generateToken(current_char, IDMFormulaToken.LexTokenType.SEPERATOR_TYPE,
                        IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_COL);
                  }
                  break;
                }
                case '~' :
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.OPERATOR_UNION);
                  break;
                case '!' :
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.OPERATOR_INTERSECTION);
                  break;
                case '+' :
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.OPERATOR_PLUS);
                  break;
                case '-' :
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.OPERATOR_MINUS);
                  break;
                case '*' :
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE, IDMFormulaToken.TokenSubtype.OPERATOR_MUL);
                  break;
                case '/' :
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE, IDMFormulaToken.TokenSubtype.OPERATOR_DIV);
                  break;
                case '^' :
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.OPERATOR_INDEX);
                  break;
                case '&' :
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.OPERATOR_CONNECT);
                  break;
                case '=' :
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.OPERATOR_EQUAL);
                  break;
                case '%' :
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.OPERATOR_POSTFIX);
                  break;
                case ' ' :
                case 0xA0 :
                case 0x3000 :
                {
                  // int start = offset - 1;
                  StringBuffer sb = new StringBuffer();
                  char nextChar = currentAndMoveCursor();
                  while (nextChar == ' ' || nextChar == 0xA0 || nextChar == 0x3000)
                  {
                    sb.append(nextChar);
                    nextChar = currentAndMoveCursor();

                  }
                  // int beginpos = start;
                  // int endpos = offset-start-1;
                  if (nextChar != 0)
                    backward(1);
                  // String text = formula.substring(beginpos,beginpos+endpos);
                  token = generateTokenFromText(" " + sb.toString(), IDMFormulaToken.LexTokenType.WHITESPACE_IGNORE,
                      IDMFormulaToken.TokenSubtype.SUBTYPE_INVALID);
                  break;
                }
                case '>' :
                case '<' :
                {
                  char nextChar = currentAndMoveCursor();
                  if (nextChar == '=')
                  {
                    if (current_char == '>')
                      token = generateTokenFromText(current_char + "=", IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                          IDMFormulaToken.TokenSubtype.OPERATOR_GREATEREQUAL);
                    else
                      token = generateTokenFromText(current_char + "=", IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                          IDMFormulaToken.TokenSubtype.OPERATOR_LESSEQUAL);
                  }
                  else
                  {
                    if (nextChar != 0)
                      backward(1);
                    if (current_char == '>')
                      token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                          IDMFormulaToken.TokenSubtype.OPERATOR_GREATER);
                    else
                      token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                          IDMFormulaToken.TokenSubtype.OPERATOR_LESS);
                  }
                  break;
                }
                case '"' :
                  state = State.STATE_STRING;
                  break;
                case ':' :
                  token = generateToken(current_char, IDMFormulaToken.LexTokenType.OPERATOR_TYPE,
                      IDMFormulaToken.TokenSubtype.OPERATOR_COLON);
                  break;
                default:
                  break;

              }
            // name Or number
            if (token == null)
            {
              if (state == State.STATE_START)
              {
                backward(1);
                if (IDMFormulaLexer.isDigit(current_char))
                  state = State.STATE_NUM;
                else
                  state = State.STATE_NAME;
              }
            }
            else
              state = State.STATE_STOP;
            break;
          }
          case STATE_STRING :
          {
            backward(1);
            int offsetsave = offset;

            String text = readString();
            token = generateTokenFromText(text, IDMFormulaToken.LexTokenType.STRING_TYPE, IDMFormulaToken.TokenSubtype.SUBTYPE_INVALID);
            token.setOffset(offsetsave);
            state = State.STATE_STOP;
            break;
          }
          case STATE_SHEET_SPECIAL :
          {
            backward(1);
            int offsetsave = offset;

            String text = readTableFormula();
            token = generateTokenFromText(text, IDMFormulaToken.LexTokenType.NAME_TYPE, IDMFormulaToken.TokenSubtype.SUBTYPE_INVALID);
            token.setOffset(offsetsave);
            state = State.STATE_STOP;
            break;
          }
          case STATE_NUM :
          {
            int cursor = offset - 1;
            backward(1);// from STATE_START to STATE_NUM, 2 chars have been read
            Object returnValue = readNumber();
            if (returnValue != null)
            {
              state = State.STATE_STOP;
              token = generateToken('0', IDMFormulaToken.LexTokenType.NUMBER_TYPE, IDMFormulaToken.TokenSubtype.SUBTYPE_INVALID);
              token.value = returnValue;
              token.setOffset(cursor);
            }
            else
            {
              offset = cursor;// backward to before number state.
              state = State.STATE_NAME;
            }
            break;
          }
          case STATE_NAME :
          {
            backward(1);
            int offsetsave = offset;
            String text = readName();
            state = State.STATE_STOP;
            token = generateTokenFromText(text, IDMFormulaToken.LexTokenType.NAME_TYPE, IDMFormulaToken.TokenSubtype.SUBTYPE_INVALID);
            token.setOffset(offsetsave);
          }
          default:
            break;
        }
    }
    return token;
  }

  boolean eof()
  {
    return offset >= formulaLen;
  }

  char currentAndMoveCursor()
  {
    if (eof())
      return 0;
    int index = offset++;
    return formula.charAt(index);
  }

  void pushToList(IDMFormulaToken token)
  {
    IDMFormulaToken pretoken = null;
    if (tokens.size() > 0)
      pretoken = tokens.get(tokens.size() - 1);
    token.pre = pretoken;
    tokens.add(token);
  }

  void mergeAndBuildArrayToken()
  {

    IDMFormulaToken arrayStart = tokenStack.peek();
    int index = -1;
    for (int i = 0; i < tokens.size(); i++)
    {
      IDMFormulaToken t = tokens.get(i);
      if (t == arrayStart)
      {
        index = i;
        break;
      }
    }
    if (index >= 0)
    {
      List<List<IDMFormulaToken>> array = new ArrayList<List<IDMFormulaToken>>();
      List<IDMFormulaToken> newobj = new ArrayList<IDMFormulaToken>();
      array.add(newobj);
      for (int i = index + 1; i < tokens.size(); i++)
      {
        {
          IDMFormulaToken token = tokens.get(i);

          switch (token.type)
            {
              case SEPERATOR_TYPE :
              {
                if (token.subType == IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_ROW)
                {
                  array.add(newobj);
                }
                else if (token.subType == IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_COL)
                {
                  // skip this.
                }
                else
                {
                  error(token, IDMFormulaToken.ErrorTokenType.UNMATCHED_ARRAY);
                }
                break;
              }
              case NUMBER_TYPE :
              case ERROR_TYPE :
              case STRING_TYPE :
              case LOGICAL_TYPE :
              {
                array.get(array.size() - 1).add(token);
                break;
              }
              case OPERATOR_TYPE :
              {
                // if(token.subType == IDMFormulaToken.TokenSubtype.OPERATOR_PREFIX && i<tokens.size()-1)
                // {
                // // get next token, if it is number type, continue,
                // // else set error, ----2 with continous prefix operator is not allowed
                // i++;
                // IDMFormulaToken nextToken = tokens.get(i);
                // if(nextToken.type == IDMFormulaToken.LexTokenType.NUMBER_TYPE){
                // // do nothing here just lexer parse.
                //
                // // nextToken.value = token.getText() + nextToken.value;
                // // nextToken.setOffset(token.getOffset());
                // // array.get(array.size() - 1).add(nextToken);
                //
                // } else
                // error(token, IDMFormulaToken.ErrorTokenType.CONST_ARRAY_TYPE);
                // }
              }
              case WHITESPACE_IGNORE :
              {
                // ignore;
                break;
              }
              default:
              {
                // error
                error(token, IDMFormulaToken.ErrorTokenType.UNMATCHED_ARRAY);
                break;
              }
            }
        }
      }
      arrayStart.value = array.size(); // yuanlin debug
      // tokens.subList(index + 1, tokens.size()).clear();
      arrayStart.type = IDMFormulaToken.LexTokenType.ARRAY_TYPE;
    }
  }

  void error(IDMFormulaToken token, ErrorTokenType errorType)
  {
    if (token != null)
      token.errorType = errorType;
    IDMFormulaError nerror = new IDMFormulaError("-1", "null");
    ferror = nerror;
  }

  void mergeAndAdaptToken(IDMFormulaToken token)
  {
    int index = tokens.size();
    IDMFormulaToken preToken = null;
    if (token != null)
    {
      preToken = token.pre;
      index--;
    }
    else
    {
      if (tokens.size() > 0)
        preToken = tokens.get(tokens.size() - 1);
    }

    if (preToken != null)
    {
      LexTokenType preType = preToken.type;

      if (preType == IDMFormulaToken.LexTokenType.NAME_TYPE)
      {
        if (token != null && token.subType == IDMFormulaToken.TokenSubtype.SEPERATOR_OPEN)
        {
          setFuncToken(preToken);
          int funcdesc = IDMFormulaRefParser.funcParamsForCheck(preToken.upperText());
          if (funcdesc > 0)
          {
            return;
          }
        }

        IDMFormulaParsedRef ref = IDMFormulaRefParser.parseRef(preToken.text, IDMFormulaLexer.LexFormulaType.FORMAT_ODF);
        if (ref != null)
        {
          preToken.type = IDMFormulaToken.LexTokenType.REFERENCE_TYPE;
          preToken.value = ref;
          ref.setIndex(preToken.getOffset());
          return;
        }
        return;
      }
      else if (preType == IDMFormulaToken.LexTokenType.OPERATOR_TYPE)
      {
        if (preToken.subType == IDMFormulaToken.TokenSubtype.OPERATOR_INTERSECTION
            && (token == null || token.type == IDMFormulaToken.LexTokenType.OPERATOR_TYPE || (token.type == IDMFormulaToken.LexTokenType.SEPERATOR_TYPE
                && token.subType != IDMFormulaToken.TokenSubtype.SEPERATOR_OPEN && token.subType != IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_OPEN)))
        {
          // A1 +B1, the whitespace should be ignored
          preToken.type = IDMFormulaToken.LexTokenType.WHITESPACE_IGNORE;
          return;
        }

        index--;
        IDMFormulaToken preToken2 = preToken.pre;

        // pass the white space ignore token
        while (preToken2 != null && (preToken2.type == IDMFormulaToken.LexTokenType.WHITESPACE_IGNORE))
        {
          preToken2 = preToken2.pre;
          index--;
        }
        if (preToken.ch == ':' && token != null)
        {
          if ((token.type == IDMFormulaToken.LexTokenType.NAME_TYPE // A:B
              || token.type == IDMFormulaToken.LexTokenType.REFERENCE_TYPE // A1:B2
          || token.type == IDMFormulaToken.LexTokenType.NUMBER_TYPE) && (preToken2.type == IDMFormulaToken.LexTokenType.NAME_TYPE // A:B
              || preToken2.type == IDMFormulaToken.LexTokenType.REFERENCE_TYPE // A1:B2
          || preToken2.type == IDMFormulaToken.LexTokenType.NUMBER_TYPE)) // 1:1
          {
            String text = (preToken2.text == null ? String.valueOf(preToken2.value) : preToken2.text);
            // yuanlin. modifi "!" to "." for odf format
            if (text.indexOf(":") < 0 || text.indexOf(_separatorSheetname) < 0)
            {
              text = text + ":" + (token.text == null ? String.valueOf(token.value) : token.text);
              IDMFormulaParsedRef ref = IDMFormulaRefParser.parseRef(text, IDMFormulaLexer.LexFormulaType.FORMAT_ODF);
              if (ref != null)
              {
                preToken2.type = IDMFormulaToken.LexTokenType.REFERENCE_TYPE;
                preToken2.value = ref;
                preToken2.text = text;
                ref.setIndex(preToken2.getOffset());
                tokens.subList(index, tokens.size()).clear();
                preToken2.subType = IDMFormulaToken.TokenSubtype.SUBTYPE_INVALID;// incase it is invalid name before
              }

            }
          }
        }
        else if (preToken.ch == '-' || preToken.ch == '+')
        {
          if (preToken2 == null)
            preToken.subType = IDMFormulaToken.TokenSubtype.OPERATOR_PREFIX;
          else
          {
            if ((preToken2.type == IDMFormulaToken.LexTokenType.OPERATOR_TYPE && preToken2.subType != IDMFormulaToken.TokenSubtype.OPERATOR_POSTFIX) // 5%+1,
                                                                                                                                                     // not
                                                                                                                                                     // prefix
                || (preToken2.type == IDMFormulaToken.LexTokenType.SEPERATOR_TYPE && (preToken2.subType != IDMFormulaToken.TokenSubtype.SEPERATOR_CLOSE && preToken2.subType != IDMFormulaToken.TokenSubtype.SEPERATOR_ARRAY_CLOSE)))
              preToken.subType = IDMFormulaToken.TokenSubtype.OPERATOR_PREFIX;
          }
        }
      }
      else if (preType == IDMFormulaToken.LexTokenType.NUMBER_TYPE && token != null && token.type == IDMFormulaToken.LexTokenType.NAME_TYPE)
      {
        preToken.type = IDMFormulaToken.LexTokenType.NAME_TYPE;
        preToken.text = String.valueOf(preToken.value) + token.text;
        preToken.value = null;
        tokens.subList(tokens.size() - 1, tokens.size()).clear();
      }
    }
  }

  char current()
  {
    return formula.charAt(offset);
  }

  char next()
  {
    offset++;
    if (eof())
      return 0;
    return formula.charAt(offset);
  }

  void backward(int howmany)
  {
    offset -= howmany;
  }

  String readString()
  {
    // one " is already loaded, parse rest part
    int qCount = 1;
    String mStr = "";

    do
    {
      char current = currentAndMoveCursor();
      if (current == '"')
      {
        boolean ceof = eof();
        char next = currentAndMoveCursor();
        if (next == '"' && !ceof)
        {
          mStr += ("\"");
        }
        else
        {
          backward(1);
          // next cursor is not ", parse done.
          qCount--;
          break;
        }
      }
      else
      {
        mStr += (current);
      }
    }
    while (!eof());

    if (qCount != 0)
    {
      error(null, IDMFormulaToken.ErrorTokenType.INVALID_STRING);
    }
    return mStr;
  }

  /**
   * numerical-constant = whole-number-part(1) ,[full-stop](2),[exponent-part](4) | full-stop(2), fractional-part(3), [exponent-part](4) |
   * whole-number-part(1), full-stop(2), fractional-part(3) [exponent-part](4)
   */
  static final int MAX_NUMBER_LEN = 500;

  Object readNumber()
  {
    Object ret = 0;
    int state = 1;
    String numberStr = "";
    int numberIndex = 0;
    char c;
    boolean isDouble = false;
    try
    {
      while ((c = currentAndMoveCursor()) > 0)
      {
        switch (state)
          {
            case 1 :// whole-number-part
            {
              if (IDMFormulaLexer.isDigit(c))
                state = 1;
              else if (c == _decimal)
                state = 2;
              else if (c == 'e' || c == 'E')
                state = 4;
              else
                state = 0;
              break;
            }
            case 2 :// full-stop
            {
              isDouble = true;
              if (IDMFormulaLexer.isDigit(c))
                state = 3;
              else if (c == 'e' || c == 'E')
                state = 4;
              else
                state = 0;
              break;
            }
            case 3 :// fractional-part
            {

              if (IDMFormulaLexer.isDigit(c))
                state = 3;
              else if (c == 'e' || c == 'E')
                state = 4;
              else
                state = 0;
              break;
            }
            case 4 :// exponent-part
            {
              isDouble = true;
              if (c == '+' || c == '-')
                state = 5;
              else if (IDMFormulaLexer.isDigit(c))
                state = 5;
              else
                state = -1;// error
              break;
            }
            case 5 :
            {
              if (IDMFormulaLexer.isDigit(c))
                state = 5;
              else
                state = 0;
              break;
            }
          }
        if (state > 0)
        {
          // [value appendFormat:@"%C", c];
          numberStr += ((char) c);
        }
        else
          break;
      }

      if (numberStr.length() == 0)
        return ret;

      if (state == 0)
      {
        backward(1);

        if (isDouble)
        {
          double value = Double.valueOf(numberStr);
          ret = value;
          // return ret;
          return numberStr; // number string

        }
        else
        {
          long value = Long.valueOf(numberStr);
          ret = value;
          // return ret;
          return numberStr; // number string
        }
      }
      else
      {
        if (eof())
        {
          if (isDouble)
          {
            double value = Double.valueOf(numberStr);
            ret = value;
            // return ret;
            return numberStr; // number string

          }
          else
          {
            long value = Long.valueOf(numberStr);
            ret = value;
            // return ret;
            return numberStr; // number string
          }
        }
        else
        {
          backward(1);
          return null;
        }
      }
    }
    catch (Exception e)
    {
    }
    return null;
  }

  String readTableFormula()
  {
    int start = offset;
    String text = "";
    int nFormula = 0;
    // just read strings between '[' and ']'
    do
    {
      char current_char = currentAndMoveCursor();
      if (current_char == '\'')
      {
        text = readName();
      }
      else if (current_char == '[')
      {
        nFormula++;
      }
      else if (current_char == ']')
      {
        nFormula--;
        if (nFormula <= 0)
        {
          text = formula.substring(start, offset);
          return text;
        }
      }
    }
    while (!eof());
    text = formula.substring(start);
    return text;
  }

  String readName()
  {
    int start = offset;
    String text = "";
    char firstchar = current();
    if (firstchar == '$')
    {
      currentAndMoveCursor();
      firstchar = current();
    }
    if (firstchar == '\'')
    {
      char prechar = '\'';
      do
      {
        char current_char = currentAndMoveCursor();
        if (current_char == '\'' && prechar != '\'')
        {
          text = formula.substring(start, offset);
          break;
        }
        else if (current_char == '\'' && prechar == '\'')
        {
          prechar = 0;
        }
        else
        {
          prechar = current_char;
        }
      }
      while (!eof());
    }
    {
      do
      {
        char current_char = currentAndMoveCursor();

        switch (current_char)
          {
            case '(' :
            case ')' :
            case '[' :
            case '{' :
            case '}' :
            case ',' :
            case ';' :
            case '+' :
            case '-' :
            case '*' :
            case '/' :
            case '^' :
            case '&' :
            case '=' :
            case '%' :
            case ' ' :
            case 0xA0 :
            case 0x3000 :
            case '>' :
            case '<' :
            case ':' :
            case '~' :
            case '!' :
              // case '"':
              // case "'":
              // case '[':
              if (firstchar == '#' && current_char == '!')
                break;
              backward(1);
              text = formula.substring(start, offset);
              return text;
            case '#' :
              firstchar = '#';
            default:

              break;
          }
      }
      while (!eof());
    }
    text = formula.substring(start);
    return text;
  }

  IDMFormulaToken generateToken(char ch, LexTokenType type, TokenSubtype subType)
  {
    IDMFormulaToken token = IDMFormulaToken.generateToken(ch, type, subType);
    token.setOffset(offset - 1);
    return token;
  }

  IDMFormulaToken generateTokenFromText(String text, LexTokenType type, TokenSubtype subType)
  {
    IDMFormulaToken token = IDMFormulaToken.generateTokenFromText(text, type, subType);
    token.setOffset(offset - 1);
    return token;
  }

  void setFuncToken(IDMFormulaToken token)
  {
    /*
     * NSString* text = token.text; try { text = websheet.functions.FormulaTranslate.transFuncNameLocale2En(text); value =
     * websheet.functions.Formulas.getFunc(text); type = this.TOKEN_TYPE.FUNCTION_TYPE; }catch(e) { if(e ==
     * websheet.Constant.ERRORCODE["1001"]) value = e; }
     */
    token.type = IDMFormulaToken.LexTokenType.FUNCTION_TYPE;
    token.text = token.upperText();

  }

  String trimFormula(String formula)
  {
    if (!formula.isEmpty())
    {
      if (formula.substring(0, 1) == "=")
      {
        return formula.substring(1);
      }
      else
      {
        return formula;
      }
    }
    else
    {
      return "";
    }
  }

  void setLocale(String locale)
  {
    curentLocale = locale;
    langCode = locale;
  }

  String getLocale()
  {
    if (curentLocale.isEmpty())
    {
      curentLocale = "en";
      langCode = "en";
    }
    return curentLocale;
  }

  String getLangeCode()
  {
    if (langCode.isEmpty())
    {
      langCode = "en";
    }
    return langCode;
  }

}
