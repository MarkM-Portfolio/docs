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

import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

public class IDMFormulaRefParser
{
  public static final String RANGE = "range";

  public static final String CELL = "cell";

  public static final String ROWS = "rows";

  public static final String COLS = "cols";

  public static final String INVALID = "invalid";

  public static HashMap<String, Integer> funcParamsMap = null;

  String address;

  IDMFormulaLexer.LexFormulaType ftype;

  public char sheetseperator = '.';

  int cursor;

  boolean isDigit(char c)
  {
    return ((c) >= '0' && (c) <= '9');
  }

  boolean isUpper(char c)
  {
    return ((c) >= 'A' && (c) <= 'Z');
  }

  boolean isLower(char c)
  {
    return ((c) >= 'a' && (c) <= 'z');
  }

  boolean isLetter(char c)
  {
    return (isUpper(c) || isLower(c));
  }

  public static final boolean NO = false;

  public static final boolean YES = true;

  static synchronized int funcParamsForCheck(String funcName)
  {
    initFunctionMap();
    Integer num = funcParamsMap.get(funcName);
    if (num == null)
      return -1;
    return num;
  }

  void initWithAddress(String _address)
  {
    // System.out.println("try ref:"+_address); // yuanlin
    address = _address;
    cursor = 0;

  }

  IDMFormulaParsedRef parse()
  {
    boolean absoluteSheet = NO;
    boolean absoluteColumn = NO;
    boolean absoluteRow = NO;
    String sheetName = "";
    int column = -1;
    int row = -1;

    boolean absoluteEColumn = NO;
    boolean absoluteERow = NO;
    int eColumn = -1;
    int eRow = -1;

    String refType = RANGE;

    if (detectAndSkipCharacter('$') > 0)
      absoluteSheet = YES;
    boolean isquotedname = false;
    if (current() == '\'')
      isquotedname = true;
    sheetName = readSheet();
    if (sheetName.isEmpty())
    {
      if (absoluteSheet)
      {
        absoluteSheet = NO;
        absoluteColumn = YES;
      }
    }
    if (detectAndSkipCharacter('$') > 0)
      absoluteColumn = YES;

    char ch = current();
    if (isLetter(ch))
    {
      column = readColumn();

      if (column < 0 || column > IDMFormulaParsedRef.IDMSS_MAX_COL_NUM_MS)
      {
        // error
        return null;
      }
      // column done, read row
      if (detectAndSkipCharacter('$') > 0)
        absoluteRow = YES;

      row = readNumber() - 1;
      if (row < 0)
      {
        if (absoluteRow)
        {
          // error
          return null;
        }
        else
        {
          // no row but only column
          refType = COLS;
        }
      }

    }
    else if (isDigit(ch))
    {
      // not column, should read as row directly.
      refType = ROWS;
      if (absoluteColumn)
      {
        absoluteColumn = NO;
        absoluteRow = YES;
      }
      row = readNumber() - 1;

      if (row < 0)
      {
        // not range
        return null;
      }
    }
    else
    {
      // check invalide name here.
      String ref = address.substring(cursor);

      if (ref.equals(IDMFormulaParsedRef.IDMSS_INVALID_REF))
      {
        absoluteRow = absoluteColumn;

        return IDMFormulaParsedRef.createParseRefWithType(ftype, INVALID, absoluteSheet, sheetName, NO, "", absoluteRow,
            IDMFormulaParsedRef.IDMSS_INVALID_REF, NO, "", NO, "", isquotedname);

        // return [IDMSSUtility createParseRefWithType:INVALID absoluteSheet:absoluteSheet sheet:sheetName absoluateCol:NO colIndex:-1
        // absoluateRow:absoluteRow rowIndex:-1 absoluateEndCol:NO endColIndex:-1 absoluateEndRow:NO endRowIndex:-1];
      }
      else
        return null;
    }

    if (detectAndSkipCharacter(':') == 0)
    {
      if (cursor < address.length())
      {
        // error
        return null;
      }
    }
    else
    {
      // check sheet name. but discard it now.
      if (current() == '\'' || detectCharacter(sheetseperator) >= 0)
      {
        String sheetname2 = readSheet();
        if (!sheetname2.isEmpty())
        {
          return null; // treat it as virtual reference
        }
      }
      // found rest part.

      if (detectAndSkipCharacter('$') > 0)
      {
        if (refType == ROWS)
          absoluteERow = YES;
        else
          absoluteEColumn = YES;
      }

      char ch1 = current();
      if (isLetter(ch1))
      {
        if (refType == ROWS)
        {
          // error
          return null;
        }

        eColumn = readColumn();

        if (eColumn < 0 || eColumn > IDMFormulaParsedRef.IDMSS_MAX_COL_NUM_MS)
        {
          // error
          return null;
        }

        if (refType == COLS)
        {

          if (cursor != address.length())
          {
            // error, should be finished here.
            return null;
          }
        }
        else
        {
          // range type, should read row
          if (detectAndSkipCharacter('$') > 0)
          {
            absoluteERow = YES;
          }

          eRow = readNumber() - 1;

          if (eRow < 0)
          {
            return null;
          }
        }
      }
      else if (isDigit(ch1))
      {
        if (refType != ROWS)
        {
          // error. must be row type here
          return null;
        }

        eRow = readNumber() - 1;

        if (eRow < 0)
        {
          // error;
          return null;
        }
      }
      else
      {
        // error
        return null;
      }

      if (cursor != address.length())
      {
        // error
        return null;
      }
    }
    if (RANGE.equals(refType) && ((column == eColumn && row == eRow) || (column >= 0 && row >= 0 && eColumn < 0 && eRow < 0)))
    {
      refType = CELL;
    }
    // if (row>=0) row++;
    // if (eRow>=0) eRow++;
    // if (column>=0) column++;
    // if (eColumn>=0) eColumn++;
    // System.out.println("ref:"+address+"  s:"+sheetName+" start("+column+","+row+") end ("+eColumn+","+eRow+")"); // yuanlin
    return IDMFormulaParsedRef.createParseRefWithType(ftype, refType, absoluteSheet, sheetName, absoluteColumn, column, absoluteRow, row,
        absoluteEColumn, eColumn, absoluteERow, eRow, isquotedname);

  }

  public static IDMFormulaParsedRef parseRef(String address, IDMFormulaLexer.LexFormulaType formulatype)
  {
    IDMFormulaRefParser parser = new IDMFormulaRefParser();
    parser.ftype = formulatype;
    if (formulatype == IDMFormulaLexer.LexFormulaType.FORMAT_OOXML)
      parser.sheetseperator = '!';
    parser.initWithAddress(address);
    return parser.parse();

  }

  int detectCharacter(char ch)
  {
    int pos = cursor;
    while (pos < address.length())
    {
      char curChar = address.charAt(pos);
      if (curChar == ch)
      {
        return pos;
      }
      pos++;
    }
    return -1;
  }

  char detectAndSkipCharacter(char ch)
  {
    if (cursor < address.length())
    {
      char curChar = address.charAt(cursor);
      if (curChar == ch)
      {
        cursor++;
        return curChar;
      }
    }
    return 0;
  }

  char current()
  {
    if (cursor < address.length())
    {
      return address.charAt(cursor);
    }
    return 0;
  }

  char currentAndMoveNext()
  {
    if (cursor < address.length())
    {
      return address.charAt(cursor++);
    }
    return 0;
  }

  String readSheet()
  {
    int location = cursor;
    int length = 0;
    char c;
    boolean bInString = NO;
    int index = 0;
    char ret[] = new char[500];
    boolean success = NO;
    while ((c = currentAndMoveNext()) > 0)
    {
      if (c == '\'')
      {
        // ret[index++] = c;
        c = currentAndMoveNext();
        if (c == '\'')
        {
          if (index > 500)
            break;

          ret[index++] = c;
          continue;
        }
        else
        {

          bInString = !bInString;
        }
      }

      if (c == sheetseperator)
      {
        if (!bInString)
        {
          success = YES;
          break;
        }
      }
      else
      {
        // \\\\/\\:\\*\\?\\[\\]
        if (c == '\\' || c == '/' || c == '*' || c == ':' || c == '[' || c == ']' || c == '?')
          break;
      }
      if (index > 500)
        break;

      ret[index++] = c;
    }

    ret[index] = 0;

    if (success)
    {
      // _cursor = range.location + index + 1;
      String retstr = new String(ret, 0, index);
      return retstr;
    }
    else
    {
      cursor = location;
      return "";
    }
  }

  int readColumn()
  {
    int ret = 0;
    char c;

    while ((c = currentAndMoveNext()) > 0)
    {
      int deta = 0;
      if (isUpper(c))
      {
        deta = c - 'A' + 1;
      }
      else if (isLower(c))
      {
        deta = c - 'a' + 1;
      }
      else
      {
        cursor--;
        break;
      }
      ret *= 26;
      ret += deta;
    }
    return ret - 1;
  }

  int readNumber()
  {
    char c;
    int ret = 0;
    while ((c = currentAndMoveNext()) > 0)
    {
      if (isDigit(c))
      {
        ret *= 10;
        ret += (c - '0');
      }
      else
      {
        if (ret == 0)
          ret = -1;
        cursor--;
        break;
      }
    }
    return ret;
  }

  static void initFunctionMap()
  {
    if (funcParamsMap == null)
    {
      funcParamsMap = new HashMap<String, Integer>();
      funcParamsMap.put("+", 2);
      funcParamsMap.put("-", 2);
      funcParamsMap.put("*", 3);
      funcParamsMap.put("/", 3);
      funcParamsMap.put("ABS", 4);
      funcParamsMap.put("ACCRINT", 1);
      funcParamsMap.put("ACCRINTM", 1);
      funcParamsMap.put("ACOS", 4);
      funcParamsMap.put("ACOSH", 4);
      funcParamsMap.put("ACOT", 1);
      funcParamsMap.put("ACOTH", 1);
      funcParamsMap.put("ADDRESS", 5);
      funcParamsMap.put("AMORDEGRC", 1);
      funcParamsMap.put("AMORLINC", 1);
      funcParamsMap.put("AND", 6);
      funcParamsMap.put("ARABIC", 1);
      funcParamsMap.put("AREAS", 1);
      funcParamsMap.put("ASC", 1);
      funcParamsMap.put("ASIN", 4);
      funcParamsMap.put("ASINH", 4);
      funcParamsMap.put("ATAN", 4);
      funcParamsMap.put("ATAN2", 3);
      funcParamsMap.put("ATANH", 4);
      funcParamsMap.put("AVEDEV", 1);
      funcParamsMap.put("AVERAGE", 6);
      funcParamsMap.put("AVERAGEA", 6);
      funcParamsMap.put("AVERAGEIF", 1);
      funcParamsMap.put("AVERAGEIFS", 1);
      funcParamsMap.put("BAHTTEXT", 1);
      funcParamsMap.put("BASE", 5);
      funcParamsMap.put("BESSELI", 1);
      funcParamsMap.put("BESSELJ", 1);
      funcParamsMap.put("BESSELK", 1);
      funcParamsMap.put("BESSELY", 1);
      funcParamsMap.put("BETA.DIST", 1);
      funcParamsMap.put("BETA.INV", 1);
      funcParamsMap.put("BETADIST", 1);
      funcParamsMap.put("BETAINV", 1);
      funcParamsMap.put("BIN2DEC", 1);
      funcParamsMap.put("BIN2HEX", 1);
      funcParamsMap.put("BIN2OCT", 1);
      funcParamsMap.put("BINOM.DIST", 1);
      funcParamsMap.put("BINOM.DIST.RANGE", 1);
      funcParamsMap.put("BINOM.INV", 1);
      funcParamsMap.put("BINOMDIST", 1);
      funcParamsMap.put("BITAND", 1);
      funcParamsMap.put("BITLSHIFT", 1);
      funcParamsMap.put("BITOR", 1);
      funcParamsMap.put("BITRSHIFT", 1);
      funcParamsMap.put("BITXOR", 1);
      funcParamsMap.put("CALL", 1);
      funcParamsMap.put("CEILING", 3);
      funcParamsMap.put("CEILING.MATH", 1);
      funcParamsMap.put("CELL", 1);
      funcParamsMap.put("CHAR", 4);
      funcParamsMap.put("CHIDIST", 1);
      funcParamsMap.put("CHIINV", 1);
      funcParamsMap.put("CHISQ.DIST.RT", 1);
      funcParamsMap.put("CHISQ.INV.RT", 1);
      funcParamsMap.put("CHISQ.TEST", 1);
      funcParamsMap.put("CHITEST", 1);
      funcParamsMap.put("CHOOSE", 6);
      funcParamsMap.put("CLEAN", 1);
      funcParamsMap.put("CODE", 4);
      funcParamsMap.put("COLUMN", 7);
      funcParamsMap.put("COLUMNS", 4);
      funcParamsMap.put("COMBIN", 3);
      funcParamsMap.put("COMBINA", 1);
      funcParamsMap.put("COMPLEX", 1);
      funcParamsMap.put("CONCATENATE", 6);
      funcParamsMap.put("CONFIDENCE", 1);
      funcParamsMap.put("CONFIDENCE.NORM", 1);
      funcParamsMap.put("CONVERT", 8);
      funcParamsMap.put("CORREL", 1);
      funcParamsMap.put("COS", 4);
      funcParamsMap.put("COSH", 4);
      funcParamsMap.put("COT", 1);
      funcParamsMap.put("COTH", 1);
      funcParamsMap.put("CSC", 1);
      funcParamsMap.put("CSCH", 1);
      funcParamsMap.put("COUNT", 6);
      funcParamsMap.put("COUNTA", 6);
      funcParamsMap.put("COUNTBLANK", 4);
      funcParamsMap.put("COUNTIF", 3);
      funcParamsMap.put("COUNTIFS", 1);
      funcParamsMap.put("COUPDAYBS", 1);
      funcParamsMap.put("COUPDAYS", 1);
      funcParamsMap.put("COUPDAYSNC", 1);
      funcParamsMap.put("COUPNCD", 1);
      funcParamsMap.put("COUPNUM", 1);
      funcParamsMap.put("COUPPCD", 1);
      funcParamsMap.put("COVAR", 1);
      funcParamsMap.put("COVARIANCE.P", 1);
      funcParamsMap.put("CRITBINOM", 1);
      funcParamsMap.put("CUMIPMT", 1);
      funcParamsMap.put("CUMPRINC", 1);
      funcParamsMap.put("DATE", 8);
      funcParamsMap.put("DATEDIF", 1);
      funcParamsMap.put("DATEVALUE", 4);
      funcParamsMap.put("DAVERAGE", 1);
      funcParamsMap.put("DAY", 4);
      funcParamsMap.put("DAYS", 3);
      funcParamsMap.put("DAYS360", 5);
      funcParamsMap.put("DB", 1);
      funcParamsMap.put("DCOUNT", 1);
      funcParamsMap.put("DCOUNTA", 1);
      funcParamsMap.put("DDB", 1);
      funcParamsMap.put("DEC2BIN", 1);
      funcParamsMap.put("DEC2HEX", 1);
      funcParamsMap.put("DEC2OCT", 1);
      funcParamsMap.put("DECIMAL", 1);
      funcParamsMap.put("DEGREES", 4);
      funcParamsMap.put("DELTA", 1);
      funcParamsMap.put("DEVSQ", 1);
      funcParamsMap.put("DGET", 1);
      funcParamsMap.put("DISC", 1);
      funcParamsMap.put("DMAX", 1);
      funcParamsMap.put("DMIN", 1);
      funcParamsMap.put("DOLLAR", 2);
      funcParamsMap.put("DOLLARDE", 1);
      funcParamsMap.put("DOLLARFR", 1);
      funcParamsMap.put("DPRODUCT", 1);
      funcParamsMap.put("DSTDEV", 1);
      funcParamsMap.put("DSTDEVP", 1);
      funcParamsMap.put("DSUM", 1);
      funcParamsMap.put("DURATION", 1);
      funcParamsMap.put("DVAR", 1);
      funcParamsMap.put("DVARP", 1);
      funcParamsMap.put("EDATE", 1);
      funcParamsMap.put("EFFECT", 1);
      funcParamsMap.put("ENCODEURL", 1);
      funcParamsMap.put("EOMONTH", 1);
      funcParamsMap.put("ERF", 1);
      funcParamsMap.put("ERF.PRECISE", 1);
      funcParamsMap.put("ERFC", 1);
      funcParamsMap.put("ERFC.PRECISE", 1);
      funcParamsMap.put("ERROR.TYPE", 1);
      funcParamsMap.put("EUROCONVERT", 1);
      funcParamsMap.put("EVEN", 4);
      funcParamsMap.put("EXACT", 3);
      funcParamsMap.put("EXP", 4);
      funcParamsMap.put("EXPON.DIST", 1);
      funcParamsMap.put("EXPONDIST", 1);
      funcParamsMap.put("F.DIST.RT", 1);
      funcParamsMap.put("F.INV.RT", 1);
      funcParamsMap.put("F.TEST", 1);
      funcParamsMap.put("FACT", 4);
      funcParamsMap.put("FACTDOUBLE", 1);
      funcParamsMap.put("FALSE", 9);
      funcParamsMap.put("FDIST", 1);
      funcParamsMap.put("FIND", 5);
      funcParamsMap.put("FINDB", 1);
      funcParamsMap.put("FINV", 1);
      funcParamsMap.put("FISHER", 1);
      funcParamsMap.put("FISHERINV", 1);
      funcParamsMap.put("FILTERXML", 1);
      funcParamsMap.put("FIXED", 10);
      funcParamsMap.put("FLOOR", 3);
      funcParamsMap.put("FLOOR.MATH", 1);
      funcParamsMap.put("FORECAST", 1);
      funcParamsMap.put("FORMULA", 4);
      funcParamsMap.put("FORMULATEXT", 1);
      funcParamsMap.put("FREQUENCY", 3);
      funcParamsMap.put("FTEST", 1);
      funcParamsMap.put("FV", 1);
      funcParamsMap.put("FVSCHEDULE", 1);
      funcParamsMap.put("GAMMA", 1);
      funcParamsMap.put("GAMMA.DIST", 1);
      funcParamsMap.put("GAMMA.INV", 1);
      funcParamsMap.put("GAMMADIST", 1);
      funcParamsMap.put("GAMMAINV", 1);
      funcParamsMap.put("GAMMALN", 1);
      funcParamsMap.put("GAMMALN.PRECISE", 1);
      funcParamsMap.put("GAUSS", 1);
      funcParamsMap.put("GCD", 1);
      funcParamsMap.put("GEOMEAN", 1);
      funcParamsMap.put("GESTEP", 1);
      funcParamsMap.put("GETPIVOTDATA", 1);
      funcParamsMap.put("GROWTH", 1);
      funcParamsMap.put("HARMEAN", 1);
      funcParamsMap.put("HEX2BIN", 1);
      funcParamsMap.put("HEX2DEC", 1);
      funcParamsMap.put("HEX2OCT", 1);
      funcParamsMap.put("HLOOKUP", 11);
      funcParamsMap.put("HOUR", 4);
      funcParamsMap.put("HYPERLINK", 2);
      funcParamsMap.put("HYPGEOM.DIST", 1);
      funcParamsMap.put("HYPGEOMDIST", 1);
      funcParamsMap.put("IF", 10);
      funcParamsMap.put("IFNA", 1);
      funcParamsMap.put("IMABS", 1);
      funcParamsMap.put("IMAGINARY", 1);
      funcParamsMap.put("IMARGUMENT", 1);
      funcParamsMap.put("IMCONJUGATE", 1);
      funcParamsMap.put("IMCOS", 1);
      funcParamsMap.put("IMCOSH", 1);
      funcParamsMap.put("IMCOT", 1);
      funcParamsMap.put("IMCSC", 1);
      funcParamsMap.put("IMCSCH", 1);
      funcParamsMap.put("IMDIV", 1);
      funcParamsMap.put("IMEXP", 1);
      funcParamsMap.put("IMLN", 1);
      funcParamsMap.put("IMLOG10", 1);
      funcParamsMap.put("IMLOG2", 1);
      funcParamsMap.put("IMPOWER", 1);
      funcParamsMap.put("IMPRODUCT", 1);
      funcParamsMap.put("IMREAL", 1);
      funcParamsMap.put("IMSEC", 1);
      funcParamsMap.put("IMSECH", 1);
      funcParamsMap.put("IMSIN", 1);
      funcParamsMap.put("IMSINH", 1);
      funcParamsMap.put("IMSQRT", 1);
      funcParamsMap.put("IMSUB", 1);
      funcParamsMap.put("IMSUM", 1);
      funcParamsMap.put("IMTAN", 1);
      funcParamsMap.put("INDEX", 12);
      funcParamsMap.put("INDIRECT", 2);
      funcParamsMap.put("INFO", 1);
      funcParamsMap.put("INT", 4);
      funcParamsMap.put("INTERCEPT", 1);
      funcParamsMap.put("INTRATE", 1);
      funcParamsMap.put("IPMT", 1);
      funcParamsMap.put("IRR", 1);
      funcParamsMap.put("ISBLANK", 4);
      funcParamsMap.put("ISERR", 4);
      funcParamsMap.put("ISERROR", 4);
      funcParamsMap.put("ISEVEN", 4);
      funcParamsMap.put("ISFORMULA", 4);
      funcParamsMap.put("ISLOGICAL", 4);
      funcParamsMap.put("ISNA", 4);
      funcParamsMap.put("ISNONTEXT", 4);
      funcParamsMap.put("ISNUMBER", 4);
      funcParamsMap.put("ISODD", 4);
      funcParamsMap.put("ISOWEEKNUM", 1);
      funcParamsMap.put("ISPMT", 1);
      funcParamsMap.put("ISREF", 4);
      funcParamsMap.put("ISTEXT", 4);
      funcParamsMap.put("JIS", 1);
      funcParamsMap.put("KURT", 1);
      funcParamsMap.put("LARGE", 3);
      funcParamsMap.put("LCM", 1);
      funcParamsMap.put("LEFT", 2);
      funcParamsMap.put("LEFTB", 1);
      funcParamsMap.put("LEN", 4);
      funcParamsMap.put("LENB", 4);
      funcParamsMap.put("LINEST", 1);
      funcParamsMap.put("LN", 4);
      funcParamsMap.put("LOG", 2);
      funcParamsMap.put("LOG10", 4);
      funcParamsMap.put("LOGEST", 1);
      funcParamsMap.put("LOGINV", 1);
      funcParamsMap.put("LOGNORM.DIST", 1);
      funcParamsMap.put("LOGNORM.INV", 1);
      funcParamsMap.put("LOGNORMDIST", 1);
      funcParamsMap.put("LOOKUP", 5);
      funcParamsMap.put("LOWER", 4);
      funcParamsMap.put("MATCH", 5);
      funcParamsMap.put("MAX", 6);
      funcParamsMap.put("MAXA", 1);
      funcParamsMap.put("MDETERM", 1);
      funcParamsMap.put("MDURATION", 1);
      funcParamsMap.put("MEDIAN", 6);
      funcParamsMap.put("MID", 8);
      funcParamsMap.put("MIDB", 1);
      funcParamsMap.put("MIN", 6);
      funcParamsMap.put("MINA", 1);
      funcParamsMap.put("MINUTE", 4);
      funcParamsMap.put("MINVERSE", 1);
      funcParamsMap.put("MIRR", 1);
      funcParamsMap.put("MMULT", 3);
      funcParamsMap.put("MOD", 2);
      funcParamsMap.put("MODE", 6);
      funcParamsMap.put("MODE.SNGL", 1);
      funcParamsMap.put("MONTH", 4);
      funcParamsMap.put("MROUND", 1);
      funcParamsMap.put("MULTINOMIAL", 1);
      funcParamsMap.put("MUNIT", 1);
      funcParamsMap.put("N", 4);
      funcParamsMap.put("NA", 13);
      funcParamsMap.put("NEGBINOM.DIST", 1);
      funcParamsMap.put("NEGBINOMDIST", 1);
      funcParamsMap.put("NETWORKDAYS", 5);
      funcParamsMap.put("NOMINAL", 1);
      funcParamsMap.put("NORM.DIST", 1);
      funcParamsMap.put("NORM.INV", 1);
      funcParamsMap.put("NORM.S.DIST", 1);
      funcParamsMap.put("NORM.S.INV", 1);
      funcParamsMap.put("NORMDIST", 1);
      funcParamsMap.put("NORMINV", 1);
      funcParamsMap.put("NORMSDIST", 1);
      funcParamsMap.put("NORMSINV", 1);
      funcParamsMap.put("NOT", 4);
      funcParamsMap.put("NOW", 13);
      funcParamsMap.put("NPER", 1);
      funcParamsMap.put("NPV", 1);
      funcParamsMap.put("NUMBERVALUE", 1);
      funcParamsMap.put("OCT2BIN", 1);
      funcParamsMap.put("OCT2DEC", 1);
      funcParamsMap.put("OCT2HEX", 1);
      funcParamsMap.put("ODD", 4);
      funcParamsMap.put("ODDFPRICE", 1);
      funcParamsMap.put("ODDFYIELD", 1);
      funcParamsMap.put("ODDLPRICE", 1);
      funcParamsMap.put("ODDLYIELD", 1);
      funcParamsMap.put("OFFSET", 11);
      funcParamsMap.put("OR", 6);
      funcParamsMap.put("PDURATION", 1);
      funcParamsMap.put("PEARSON", 1);
      funcParamsMap.put("PERCENTILE", 1);
      funcParamsMap.put("PERCENTILE.INC", 1);
      funcParamsMap.put("PERCENTRANK", 1);
      funcParamsMap.put("PERCENTRANK.INC", 1);
      funcParamsMap.put("PERMUT", 1);
      funcParamsMap.put("PERMUTATIONA", 1);
      funcParamsMap.put("PHI", 1);
      funcParamsMap.put("PHONETIC", 1);
      funcParamsMap.put("PI", 13);
      funcParamsMap.put("PMT", 1);
      funcParamsMap.put("POISSON", 1);
      funcParamsMap.put("POISSON.DIST", 1);
      funcParamsMap.put("POWER", 3);
      funcParamsMap.put("PPMT", 1);
      funcParamsMap.put("RRI", 1);
      funcParamsMap.put("PRICE", 1);
      funcParamsMap.put("PRICEDISC", 1);
      funcParamsMap.put("PRICEMAT", 1);
      funcParamsMap.put("PROB", 1);
      funcParamsMap.put("PRODUCT", 6);
      funcParamsMap.put("PROPER", 4);
      funcParamsMap.put("PV", 1);
      funcParamsMap.put("QUARTILE", 1);
      funcParamsMap.put("QUARTILE.INC", 1);
      funcParamsMap.put("QUOTIENT", 1);
      funcParamsMap.put("RADIANS", 1);
      funcParamsMap.put("RAND", 13);
      funcParamsMap.put("RANDBETWEEN", 3);
      funcParamsMap.put("RANK", 5);
      funcParamsMap.put("RANK.EQ", 1);
      funcParamsMap.put("RATE", 1);
      funcParamsMap.put("RECEIVED", 1);
      funcParamsMap.put("REGISTER.ID", 1);
      funcParamsMap.put("REPLACE", 14);
      funcParamsMap.put("REPLACEB", 1);
      funcParamsMap.put("REPT", 3);
      funcParamsMap.put("RIGHT", 2);
      funcParamsMap.put("RIGHTB", 2);
      funcParamsMap.put("ROMAN", 2);
      funcParamsMap.put("ROUND", 2);
      funcParamsMap.put("ROUNDDOWN", 2);
      funcParamsMap.put("ROUNDUP", 2);
      funcParamsMap.put("ROW", 7);
      funcParamsMap.put("ROWS", 4);
      funcParamsMap.put("RSQ", 1);
      funcParamsMap.put("RTD", 1);
      funcParamsMap.put("SEARCH", 5);
      funcParamsMap.put("SEARCHB", 1);
      funcParamsMap.put("SEC", 1);
      funcParamsMap.put("SECH", 1);
      funcParamsMap.put("SECOND", 4);
      funcParamsMap.put("SERIESSUM", 1);
      funcParamsMap.put("SHEET", 7);
      funcParamsMap.put("SHEETS", 1);
      funcParamsMap.put("SIGN", 1);
      funcParamsMap.put("SIN", 4);
      funcParamsMap.put("SINH", 4);
      funcParamsMap.put("SKEW", 1);
      funcParamsMap.put("SKEW.P", 1);
      funcParamsMap.put("SLN", 1);
      funcParamsMap.put("SLOPE", 1);
      funcParamsMap.put("SMALL", 3);
      funcParamsMap.put("SQL.REQUEST", 1);
      funcParamsMap.put("SQRT", 4);
      funcParamsMap.put("SQRTPI", 1);
      funcParamsMap.put("STANDARDIZE", 1);
      funcParamsMap.put("STDEV", 6);
      funcParamsMap.put("STDEV.P", 1);
      funcParamsMap.put("STDEV.S", 1);
      funcParamsMap.put("STDEVA", 6);
      funcParamsMap.put("STDEVP", 6);
      funcParamsMap.put("STDEVPA", 6);
      funcParamsMap.put("STEYX", 1);
      funcParamsMap.put("SUBSTITUTE", 11);
      funcParamsMap.put("SUBTOTAL", 15);
      funcParamsMap.put("SUM", 6);
      funcParamsMap.put("SUMIF", 5);
      funcParamsMap.put("SUMIFS", 1);
      funcParamsMap.put("SUMPRODUCT", 6);
      funcParamsMap.put("SUMSQ", 1);
      funcParamsMap.put("SUMX2MY2", 1);
      funcParamsMap.put("SUMX2PY2", 1);
      funcParamsMap.put("SUMXMY2", 1);
      funcParamsMap.put("SYD", 1);
      funcParamsMap.put("T", 1);
      funcParamsMap.put("T.DIST.2T", 1);
      funcParamsMap.put("T.DIST.RT", 1);
      funcParamsMap.put("T.INV.2T", 1);
      funcParamsMap.put("T.TEST", 1);
      funcParamsMap.put("TAN", 4);
      funcParamsMap.put("TANH", 4);
      funcParamsMap.put("TBILLEQ", 1);
      funcParamsMap.put("TBILLPRICE", 1);
      funcParamsMap.put("TBILLYIELD", 1);
      funcParamsMap.put("TDIST", 1);
      funcParamsMap.put("TEXT", 3);
      funcParamsMap.put("TIME", 8);
      funcParamsMap.put("TIMEVALUE", 4);
      funcParamsMap.put("TINV", 1);
      funcParamsMap.put("TODAY", 13);
      funcParamsMap.put("TRANSPOSE", 1);
      funcParamsMap.put("TREND", 1);
      funcParamsMap.put("TRIM", 1);
      funcParamsMap.put("TRIMMEAN", 1);
      funcParamsMap.put("TRUE", 13);
      funcParamsMap.put("TRUNC", 2);
      funcParamsMap.put("TTEST", 1);
      funcParamsMap.put("TYPE", 4);
      funcParamsMap.put("UNICHAR", 1);
      funcParamsMap.put("UNICODE", 1);
      funcParamsMap.put("UPPER", 4);
      funcParamsMap.put("VALUE", 4);
      funcParamsMap.put("VAR", 6);
      funcParamsMap.put("VAR.P", 1);
      funcParamsMap.put("VAR.S", 1);
      funcParamsMap.put("VARA", 6);
      funcParamsMap.put("VARP", 6);
      funcParamsMap.put("VARPA", 6);
      funcParamsMap.put("VDB", 1);
      funcParamsMap.put("VLOOKUP", 11);
      funcParamsMap.put("WEBSERVICE", 1);
      funcParamsMap.put("WEEKDAY", 2);
      funcParamsMap.put("WEEKNUM", 2);
      funcParamsMap.put("WEIBULL", 1);
      funcParamsMap.put("WEIBULL.DIST", 1);
      funcParamsMap.put("WORKDAY", 5);
      funcParamsMap.put("XIRR", 1);
      funcParamsMap.put("XNPV", 1);
      funcParamsMap.put("XOR", 1);
      funcParamsMap.put("YEAR", 4);
      funcParamsMap.put("YEARFRAC", 1);
      funcParamsMap.put("YIELD", 1);
      funcParamsMap.put("YIELDDISC", 1);
      funcParamsMap.put("YIELDMAT", 1);
      funcParamsMap.put("Z.TEST", 1);
      funcParamsMap.put("ZTEST", 1);

    }
  }

}
