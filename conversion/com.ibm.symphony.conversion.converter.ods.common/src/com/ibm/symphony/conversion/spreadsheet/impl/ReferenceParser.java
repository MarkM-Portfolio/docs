/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.impl;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


/**
 * Parse the cell/range address which is referenced by formula or name range
 * 
 */
public class ReferenceParser
{
  final public static String SEPARATOR_SHEET = ".";

  final public static String SEPARATOR_RANGE = ":";

  final public static String SINGLE_QUOTE = "'";
  
  final public static String VALIDATION_SEP_LEFT = "[";
  
  final public static String VALIDATION_SEP_RIGHT = "]";
  
  final public static Pattern PATTERN_RANGE_OP = Pattern.compile(" *" + Pattern.quote(SEPARATOR_RANGE) + " *");
  
  final public static Pattern PATTERN_REF_SHEET = Pattern.compile("([(^\\$)]?([^\\\\\\/\\:\\*\\?]+|" + Pattern.quote(SINGLE_QUOTE)
          + "[^\\\\\\/\\:\\*\\?]+" + Pattern.quote(SINGLE_QUOTE) + "))");
  final public static Pattern PATTERN_COL = Pattern.compile("([(^\\$)]?([a-zA-Z]|[a-zA-Z]{2}|[aA][a-lA-L][a-zA-Z]|[aA][mM][a-jA-J]|#REF!))",
      Pattern.CASE_INSENSITIVE);

  final public static Pattern PATTERN_ROW = Pattern.compile("([(^\\$)]?([1-9][0-9]*|#REF!))", Pattern.CASE_INSENSITIVE);

  final public static Pattern PATTERN_CELL = Pattern.compile("(" + PATTERN_REF_SHEET + Pattern.quote(SEPARATOR_SHEET) + ")?"
      + PATTERN_COL.toString() + PATTERN_ROW.toString());

  final public static Pattern PATTERN_END_CELL = Pattern.compile("((" + PATTERN_REF_SHEET + Pattern.quote(SEPARATOR_SHEET) + ")?|" + "("
      + Pattern.quote(SEPARATOR_SHEET) + ")?)" + PATTERN_COL.toString() + PATTERN_ROW.toString());

  final public static Pattern PATTERN_VALIDATION_CELL = Pattern.compile(Pattern.quote(VALIDATION_SEP_LEFT) + PATTERN_END_CELL + Pattern.quote(VALIDATION_SEP_RIGHT));
  
  final public static Pattern PATTERN_RANGE = Pattern.compile(PATTERN_CELL + PATTERN_RANGE_OP.toString() + PATTERN_END_CELL);

  final public static Pattern PATTERN_VALIDATION_RANGE = Pattern.compile(Pattern.quote(VALIDATION_SEP_LEFT) + PATTERN_END_CELL + Pattern.quote(SEPARATOR_RANGE) + PATTERN_END_CELL
      + Pattern.quote(VALIDATION_SEP_RIGHT)); // different with PATTERN_RANGE, it can be [.$A$1:.$B$1]
  
  final public static Pattern PATTERN_ROWS = Pattern.compile("(" + PATTERN_REF_SHEET + Pattern.quote(SEPARATOR_SHEET) + ")?"
      + PATTERN_ROW + "(" + Pattern.quote(SEPARATOR_RANGE) + PATTERN_ROW + ")?");

  final public static Pattern PATTERN_COLS = Pattern.compile("(" + PATTERN_REF_SHEET + Pattern.quote(SEPARATOR_SHEET) + ")?"
      + PATTERN_COL + "(" + Pattern.quote(SEPARATOR_RANGE) + PATTERN_COL + ")?");

  final public static Pattern PATTERN_TOKEN = Pattern.compile(PATTERN_RANGE + "|" + PATTERN_CELL);

  final public static Pattern PATTERN_VALIDATION_TOKEN = Pattern.compile(PATTERN_VALIDATION_RANGE + "|" + PATTERN_VALIDATION_CELL);
  
  final public static Pattern PATTERN_SINGLE_QUOTE = Pattern.compile("^\'|\'$");

  final public static Pattern PATTERN_TWO_SINGLE_QUOTE = Pattern.compile("(\'){2}");
  
  final public static Pattern PATTERN_FORMAT_SINGLE_QUOTE = Pattern.compile("\'");

  final public static Pattern PATTERN_NEED_QUOTE = Pattern.compile("([\\W]+)|(^\\d)");

  //absolute address type and row/column/sheet exist or not
  //they are used in address mask
  final public static int ABSOLUTE_NONE = 0;
  final public static int ABSOLUTE_SHEET = 1;
  final public static int ABSOLUTE_COLUMN = 2;
  final public static int ABSOLUTE_ROW = 4;
  final public static int ABSOLUTE_END_SHEET = 8;
  final public static int ABSOLUTE_END_COLUMN = 16;
  final public static int ABSOLUTE_END_ROW = 32;
  final public static int START_SHEET = 64;
  final public static int START_COLUMN = 128;
  final public static int START_ROW = 256;
  final public static int END_SHEET = 512;
  final public static int END_COLUMN = 1024;
  final public static int END_ROW = 2048;
  final public static int EMPTY_END_SHEET = 4096;//the end sheet name is empty string, such as Sheet1.A1:.B1
  final public static String ABSOLUTE_TOKEN = "$";
  
  final public static int RANGE_PATTERN_MASK = START_SHEET | START_ROW | START_COLUMN | END_ROW | END_COLUMN;
  public enum ParsedRefType{
    INVALID(ConversionConstant.INVALID_REF),
    CELL(ConversionConstant.CELL_REFERENCE),
    RANGE(ConversionConstant.RANGE_REFERENCE),
    ROW(ConversionConstant.ROW_REFERENCE),
    COLUMN(ConversionConstant.COL_REFERENCE),
    SHEET(ConversionConstant.SHEET_REFERENCE);
    
    String name;
    ParsedRefType(String str){
      name = str;
    }
    
    public String toString(){
      return name;
    }
    
    public static ParsedRefType enumValueOf(String str){
      if(str == null)
        return null;
      str = str.toLowerCase();
      for(ParsedRefType iter : values()){
        if(iter.toString().equals(str))
          return iter;
      }
      return null;
    }
  }
  
  public static class ParsedRef
  {
    
    public String sheetName;

    public String startRow;

    public String startCol;

    public String endSheetName;

    public String endRow;

    public String endCol;

    public ParsedRefType type;// token type

//    public int absoluteAddressType;

    /**
     * <p>
     * Bit Mask for the pattern address
     * <p>
     * By this mask it can define the address pattern.
     * Such as the address has sheet name or not, is row or col or range, whether is absolute address
     * Mask uses an 32b integer.
     * <p>
     * <table>
     * <tr>
     * <td>31~13</td>
     * <td>12</td>
     * <td>11</td>
     * <td>10</td>
     * <td>9</td>
     * <td>8</td>
     * <td>7</td>
     * <td>6</td>
     * <td>5</td>
     * <td>4</td>
     * <td>3</td>
     * <td>2</td>
     * <td>1</td>
     * <td>0</td>
     * </tr>
     * <tr>
     * <td>Reserved</td>
     * <td>Empty End Sheet Name</td>
     * <td>End Row</td>
     * <td>End Column</td>
     * <td>End Sheet</td>
     * <td>Start Row</td>
     * <td>Start Column</td>
     * <td>Start Sheet</td>
     * <td>Absolute End Row</td>
     * <td>Absolute End Column</td>
     * <td>Absolute End Sheet</td>
     * <td>Absolute Start Row</td>
     * <td>Absolute Start Column</td>
     * <td>Absolute Start Sheet</td>
     * </tr>
     * <table>
     * <p>
     * Only 12 bit is used
     */
    public int patternMask;

//    public static int DEFAULT_ADDRESS_MASK = START_SHEET | START_COLUMN | START_ROW | END_SHEET | END_COLUMN | END_ROW; 
    public ParsedRef(String sheet, String sr, String sc, String eSheet, String er, String ec, ParsedRefType t, int aT)
    {
      this(sheet, sr, sc, eSheet, er, ec);
      type = t;
//      absoluteAddressType = aT;
      if(aT >= 0 && aT <= 0x3f) 
        patternMask = aT | patternMask;
      else
        patternMask = aT;
    }

    public ParsedRef(String sheet, String sr, String sc, String eSheet, String er, String ec)
    {
      boolean bStartRow = false;
      boolean bStartCol = false;
      boolean bEndRow = false;
      boolean bEndCol = false;
      if(sheet != null)
      {
        sheetName = sheet;
        patternMask |= START_SHEET;
      }
      if(sr != null)
      {
        startRow = sr;
        patternMask |= START_ROW;
        bStartRow = true;
      }
      if(sc != null)
      {
        startCol = sc;
        patternMask |= START_COLUMN;
        bStartCol = true;
      }
      if(eSheet != null)
      {
        endSheetName = eSheet;
        patternMask |= END_SHEET;
        if(endSheetName.length() == 0)
          patternMask |= EMPTY_END_SHEET;
      }
      if(er != null)
      {
        endRow = er;
        patternMask |= END_ROW;
        bEndRow = true;
      }
      if(ec != null)
      {
        endCol = ec;
        patternMask |= END_COLUMN;
        bEndCol = true;
      }
      //set type
      if(bStartRow && bStartCol)
      {
        if(bEndRow && bEndCol)
          type = ParsedRefType.RANGE;
        else
          type = ParsedRefType.CELL;
      }
      else if(bStartRow)
      {
        if(!bStartCol && !bEndCol)
        {
          type = ParsedRefType.ROW;
        }
      }
      else if(bStartCol)
      {
        if(!bStartRow && !bEndRow)
        {
          type = ParsedRefType.COLUMN;
        }
      }
    }
    public String toString()
    {
      return this.getAddressByMask(patternMask, false);
    }
    @Deprecated
    public String getAddress(boolean bInvalidSheetName)
    {
      return getAddressByMask(patternMask, bInvalidSheetName);
    }
    
    public String getAddressByMask(int mask, boolean bInvalidSheetName)
    {
        return getAddressByMask(mask, bInvalidSheetName, false);
    }
    
    public String getAddressByMask(int mask, boolean bInvalidSheetName, boolean nonInvalid)
    {
      StringBuffer address = new StringBuffer();
      boolean bSheet = (mask & START_SHEET) > 0;
      if (sheetName != null && bSheet)
      {
        if ((mask & ABSOLUTE_SHEET) > 0)
          address.append(ABSOLUTE_TOKEN);
        //in fact, "#REF!" is a valid sheet name
        //so if bInvalidSheetName = true, should export #REF! directly
        //else the sheet name with "#REF!" should be embraced by single quote
        if(bInvalidSheetName)
          address.append(ConversionConstant.INVALID_REF);//without singlequote embraced
        else
          address.append(ReferenceParser.formatSheetName(sheetName));
        if ((mask ^ START_SHEET) == 0)
          return address.toString();
        address.append(SEPARATOR_SHEET);
      }
      boolean bStartCol = (mask & START_COLUMN) > 0;
      if (bStartCol)
      {
        if ((mask & ABSOLUTE_COLUMN) > 0)
          address.append(ABSOLUTE_TOKEN);
        address.append(startCol);
      }
      boolean bStartRow = (mask & START_ROW) > 0;
      if (bStartRow)
      {
        if ((mask & ABSOLUTE_ROW) > 0)
          address.append(ABSOLUTE_TOKEN);
        address.append(startRow);
      }
      boolean bEndSheet = (mask & END_SHEET) > 0 || (mask & EMPTY_END_SHEET) > 0;
      boolean bEndCol = (mask & END_COLUMN) > 0;
      boolean bEndRow = (mask & END_ROW) > 0;

      //return Sheet1!#REF! directly if it is row/column type
      if( (bStartRow && bEndRow && !bStartCol && !bEndCol && startRow.equals(ConversionConstant.INVALID_REF))
          || (!bStartRow && !bEndRow && bStartCol && bEndCol && startCol.equals(ConversionConstant.INVALID_REF)))
          return address.toString();
      
      if (bEndSheet || bEndCol || bEndRow)
      {
        address.append(SEPARATOR_RANGE);
        if(bEndSheet)
        {
          if (endSheetName != null && (mask & EMPTY_END_SHEET) == 0)
          {
            if ((mask & ABSOLUTE_END_SHEET) > 0)
              address.append(ABSOLUTE_TOKEN);
            if(endSheetName.length() > 0)
            {
              if(bInvalidSheetName)
                address.append(ConversionConstant.INVALID_REF);//without singlequote embraced
              else
                address.append(ReferenceParser.formatSheetName(endSheetName));
            }
          }
          address.append(SEPARATOR_SHEET);
        }
        if ( bEndCol)
        {
          if(endCol == null)
            endCol = startCol;
          if ((mask & ABSOLUTE_END_COLUMN) > 0)
            address.append(ABSOLUTE_TOKEN);
          address.append(endCol);
        }
        if (bEndRow)
        {
          if(endRow == null)
            endRow = startRow;
          if ((mask & ABSOLUTE_END_ROW) > 0)
            address.append(ABSOLUTE_TOKEN);
          address.append(endRow);
        }
      }
      
      if(!nonInvalid && ( (bStartRow && ConversionConstant.INVALID_REF.equals(startRow))
          || (bStartCol && ConversionConstant.INVALID_REF.equals(startCol))
          || (bEndRow && ConversionConstant.INVALID_REF.equals(endRow))
          || (bEndCol && ConversionConstant.INVALID_REF.equals(endCol)))){
        StringBuffer invalidAddress = new StringBuffer();
        if(bSheet){
          //in fact, "#REF!" is a valid sheet name
          //so if bInvalidSheetName = true, should export #REF! directly
          //else the sheet name with "#REF!" should be embraced by single quote
          if(bInvalidSheetName)
            invalidAddress.append(ConversionConstant.INVALID_REF);//without singlequote embraced
          else
            invalidAddress.append(ReferenceParser.formatSheetName(sheetName));
          invalidAddress.append(SEPARATOR_SHEET);
        }
        invalidAddress.append(ConversionConstant.INVALID_REF);
        if(bEndSheet){
          if (endSheetName != null && (mask & EMPTY_END_SHEET) == 0)
          {
            invalidAddress.append(SEPARATOR_RANGE);
            if(endSheetName.length() > 0)
            {
              if(bInvalidSheetName)
                invalidAddress.append(ConversionConstant.INVALID_REF);//without singlequote embraced
              else
                invalidAddress.append(ReferenceParser.formatSheetName(endSheetName));
            }
            invalidAddress.append(SEPARATOR_SHEET);
            invalidAddress.append(ConversionConstant.INVALID_REF);
          }
        }
        return invalidAddress.toString();
      }
      return address.toString();
    }
    
    /**
     * if range type is row range or col range, return the address with the range pattern
     * that is contain start/end column for row range and start/end row for colrange
     * such as Sheet1.$1:$2 --> Sheet1.$A$1:$AMJ$2
     *         Sheet1.A:B   --> Sheet1.A$1:B$1048576
     * @return
     */
    public String transformRowColToRangeAddress()
    {
      boolean bRow = (type == ParsedRefType.ROW);
      boolean bCol = (type == ParsedRefType.COLUMN);
      if(bRow || bCol)
      {
        ParsedRef ref = new ParsedRef(this.sheetName, this.startRow, this.startCol, this.endSheetName, this.endRow, this.endCol, this.type, this.patternMask);
        if(bRow)
        {
          ref.startCol = "A";
          ref.endCol = "AMJ";
          ref.type = ReferenceParser.ParsedRefType.RANGE;
          ref.patternMask |= ReferenceParser.ABSOLUTE_COLUMN;
          ref.patternMask |= ReferenceParser.START_COLUMN;
          ref.patternMask |= ReferenceParser.ABSOLUTE_END_COLUMN;
          ref.patternMask |= ReferenceParser.END_COLUMN;
        }else if(bCol)
        {
          ref.startRow = "1";
          ref.endRow = "1048576";
          ref.type = ReferenceParser.ParsedRefType.RANGE;
          ref.patternMask |= ReferenceParser.ABSOLUTE_ROW;
          ref.patternMask |= ReferenceParser.START_ROW;
          ref.patternMask |= ReferenceParser.ABSOLUTE_END_ROW;
          ref.patternMask |= ReferenceParser.END_ROW;
        }
        return ref.toString();
      }
      return toString();
    }
    
    public String getStartCellAddress()
    {
      if(ParsedRefType.CELL != this.type)
      {
        ParsedRef ref = new ParsedRef(this.sheetName, this.startRow, this.startCol, this.endSheetName, this.endRow, this.endCol, this.type, this.patternMask);
        if(ref.startRow == null)
        {
          ref.startRow = "1";
          ref.patternMask |= ABSOLUTE_ROW;
          ref.patternMask |= START_ROW;
        }
        if(ref.startCol == null)
        {
          ref.startCol = "A";
          ref.patternMask |= ABSOLUTE_COLUMN;
          ref.patternMask |= START_COLUMN;
        }
        ref.type = ParsedRefType.CELL;
        ref.patternMask &= ~( END_ROW | END_COLUMN | END_SHEET | EMPTY_END_SHEET);
        return ref.toString();
      }
      return toString();
    }

    public String getSheetName()
    {
      return sheetName;
    }

    public String getStartRow()
    {
      return startRow;
    }
    
    public int getIntStartRow()
    {
      return ReferenceParser.translateRow(startRow);
    }

    public String getStartCol()
    {
      return startCol;
    }

    public int getIntStartCol()
    {
      return ReferenceParser.translateCol(startCol);
    }
    
    public String getEndSheetName()
    {
      return endSheetName;
    }

    public String getEndRow()
    {
      return endRow;
    }

    public int getIntEndRow()
    {
      return ReferenceParser.translateRow(endRow);
    }
    
    public String getEndCol()
    {
      return endCol;
    }
    
    public int getIntEndCol()
    {
      return ReferenceParser.translateCol(endCol);
    }

    public ParsedRefType getType()
    {
      return type;
    }
    
    public boolean isValid()
    {
      return !(ConversionConstant.INVALID_REF.equals(sheetName)
          || ConversionConstant.INVALID_REF.equals(startRow)
          || ConversionConstant.INVALID_REF.equals(endRow)
          || ConversionConstant.INVALID_REF.equals(startCol)
          || ConversionConstant.INVALID_REF.equals(endCol));
    }

    
  }

  public static ParsedRef parse(String text)
  {
    try
    {
      if (text != null)
      {

        Matcher m = PATTERN_TOKEN.matcher(text);
        if (m.matches())
        {
//          for (int i = 0; i < m.groupCount(); i++)
//          {
//            System.out.println("group(" + i + "):" + m.group(i));
//          }
          ParsedRef ref = null;
          if (m.group(20) != null && m.group(22) != null)
            ref = _createParseRef(m.group(18), m.group(20), m.group(22), null, null, null, ParsedRefType.CELL, true);
          else if (m.group(4) != null && m.group(6) != null && m.group(13) != null && m.group(15) != null)
          {
            String eSheet = m.group(10);
            if (SEPARATOR_SHEET.equals(m.group(12)))
              eSheet = "";
            ref = _createParseRef(m.group(2), m.group(4), m.group(6), eSheet, m.group(13), m.group(15), ParsedRefType.RANGE,
                true);
          }
          return ref;
        }
        // do not need to parse row/column/sheet address when parse formula
        else
        {
          m = PATTERN_ROWS.matcher(text);
          if (m.matches())
          {
//            for (int i = 0; i < m.groupCount(); i++)
//            {
//              System.out.println("group(" + i + "):" + m.group(i));
//            }
            ParsedRef ref = _createParseRef(m.group(2), null, m.group(4), null, null, m.group(7), ParsedRefType.ROW, true);
            return ref;
          }
          else
          {
            m = PATTERN_COLS.matcher(text);
            if (m.matches())
            {
//              for (int i = 0; i < m.groupCount(); i++)
//              {
//                System.out.println("group(" + i + "):" + m.group(i));
//              }
              ParsedRef ref = _createParseRef(m.group(2), m.group(4), null, null, m.group(7), null, ParsedRefType.COLUMN, true);
              return ref;
            }
          }
        }
      }
    }
    catch (Exception e)
    {
    }
    return null;
  }

  static ParsedRef _createParseRef(String sheet, String startCol, String startRow, String endSheet, String endCol, String endRow,
      ParsedRefType type, boolean bNormalize)
  {
//    int addressMask = 0;
    int absoluteType = ABSOLUTE_NONE;
    if (sheet != null)
    {
//      addressMask |= START_SHEET;
      if(sheet.indexOf(ABSOLUTE_TOKEN) == 0)
      {
        sheet = sheet.substring(1);
        absoluteType |= ABSOLUTE_SHEET;
//        addressMask |= ABSOLUTE_SHEET;
      }
    }
    if (startCol != null)
    {
//      addressMask |= START_COLUMN;
      if(startCol.indexOf(ABSOLUTE_TOKEN) == 0)
      {
        startCol = startCol.substring(1);
        absoluteType |= ABSOLUTE_COLUMN;
//        addressMask |= ABSOLUTE_COLUMN;
      }
    }
    if (startRow != null)
    {
//      addressMask |= START_ROW;
      if(startRow.indexOf(ABSOLUTE_TOKEN) == 0)
      {
        startRow = startRow.substring(1);
        absoluteType |= ABSOLUTE_ROW;
//        addressMask |= ABSOLUTE_ROW;
      }
    }
    if (endSheet != null)
    {
//      addressMask |= END_SHEET;
      if(endSheet.indexOf(ABSOLUTE_TOKEN) == 0)
      {
        endSheet = endSheet.substring(1);
        absoluteType |= ABSOLUTE_END_SHEET;
//        addressMask |= ABSOLUTE_END_SHEET;
      }else if(endSheet.length() == 0)
      {
//        addressMask |= EMPTY_END_SHEET;
      }
    }
    if (endCol != null)
    {
//      addressMask |= END_COLUMN;
      if(endCol.indexOf(ABSOLUTE_TOKEN) == 0)
      {
        endCol = endCol.substring(1);
        absoluteType |= ABSOLUTE_END_COLUMN;
//        addressMask |= ABSOLUTE_END_COLUMN;
      }
    }
    if (endRow != null)
    {
//      addressMask |= END_ROW;
      if(endRow.indexOf(ABSOLUTE_TOKEN) == 0)
      {
        endRow = endRow.substring(1);
        absoluteType |= ABSOLUTE_END_ROW;
//        addressMask |= ABSOLUTE_END_ROW;
      }
    }
    //check if it is valid row number
    if ((startRow != null) && (!ConversionConstant.INVALID_REF.equalsIgnoreCase(startRow))){
      int sr = Integer.parseInt(startRow);
      if(sr > ConversionConstant.MAX_ROW_NUM)
        return null;
    }
    if ((endRow != null) && (!ConversionConstant.INVALID_REF.equalsIgnoreCase(endRow))){
      int er = Integer.parseInt(endRow);
      if(er > ConversionConstant.MAX_ROW_NUM)
        return null;
    }
    // normalize row/column to make sure that start is less than end
    if (bNormalize)
    {
      if (startCol != null)
        startCol = startCol.toUpperCase();
      if (endCol != null)
      {
        endCol = endCol.toUpperCase();
        if (!ConversionConstant.INVALID_REF.equals(startCol) && !ConversionConstant.INVALID_REF.equals(endCol))
        {
          int sc = translateCol(startCol);
          int ec = translateCol(endCol);
          if (ec < sc)
          {
            String col = endCol;
            endCol = startCol;
            startCol = col;
            absoluteType = swapAbsoluteType(absoluteType, false);
          }
        }
      }
      if ((startRow != null) && (!ConversionConstant.INVALID_REF.equalsIgnoreCase(startRow)) && (endRow != null)
          && (!ConversionConstant.INVALID_REF.equalsIgnoreCase(endRow)))
      {
        int sr = Integer.parseInt(startRow);
        int er = Integer.parseInt(endRow);
        if (er < sr)
        {
          String row = endRow;
          endRow = startRow;
          startRow = row;

          absoluteType = swapAbsoluteType(absoluteType, true);
        }
      }
    }
    String newSheetName = normalizeSheetName(sheet);
    String newEndSheetname = normalizeSheetName(endSheet);
    ParsedRef ref = new ParsedRef(newSheetName, startRow, startCol, newEndSheetname, endRow, endCol, type, absoluteType);
    return ref;
  }

  // change the start/end col/row absolute type
  public static int swapAbsoluteType(int type, boolean bRow)
  {
    int sType = ABSOLUTE_COLUMN;
    int eType = ABSOLUTE_END_COLUMN;
    if (bRow)
    {
      sType = ABSOLUTE_ROW;
      eType = ABSOLUTE_END_ROW;
    }
    int endType = type & eType;
    int startType = type & sType;
    if (endType != startType)
    {
      type = type & (~eType) & (~sType);
      if (endType > 0)
        type |= sType;
      if (startType > 0)
        type |= eType;
    }
    return type;
  }

  // normalize the sheet name incase that the first/end char of sheet name is
  // single quote
  public static String normalizeSheetName(String sheet)
  {
    if (sheet != null)
    {
      Matcher m = PATTERN_SINGLE_QUOTE.matcher(sheet);
      sheet = m.replaceAll("");
      m = PATTERN_TWO_SINGLE_QUOTE.matcher(sheet);
      sheet = m.replaceAll("'");
    }
    return sheet;
  }
  
  //add single quote for sheet name when parseRef.toString()
  public static String formatSheetName(String sheet)
  {
    if (sheet != null)
    {
      StringBuffer buf = new StringBuffer();
      Matcher m = PATTERN_NEED_QUOTE.matcher(sheet);
      boolean isFind = m.find();
      if (isFind)
        buf.append(SINGLE_QUOTE);
      m = PATTERN_FORMAT_SINGLE_QUOTE.matcher(sheet);
      sheet = m.replaceAll("''");
      buf.append(sheet);
      if (isFind)
        buf.append(SINGLE_QUOTE);
      return buf.toString();
    }
    return null;
  }
  
  /**
   * returns -1 if wrong column 1-based!
   * 
   * @param column
   * @return
   */
  public static int translateCol(String column)
  {
    if (column != null && !ConversionConstant.INVALID_REF.equals(column))
    {
      int colIndex = 0;
      for (int i = 0; i < column.length(); i++)
      {
        colIndex = 26 * colIndex;
        colIndex += (Character.toUpperCase(column.charAt(i)) - 'A') + 1;
      }
      return colIndex;
    }
    return -1;
  }

  public static String translateCol(int colIndex)
  {
    if (colIndex < 1)
      return ConversionConstant.INVALID_REF;
    final StringBuilder sb = new StringBuilder();
    int tempColNum = colIndex;

    while (tempColNum >= 1)
    {
      int mod = tempColNum % 26;
      final int div = tempColNum / 26;
      if (mod == 0)
      {
        mod = 26;
        tempColNum = div - 1;
      }
      else
      {
        tempColNum = div;
      }
      sb.append(intToColumnChar(mod));
    }
    sb.reverse();
    return sb.toString();
  }

  public static String translateRow(int rowIndex)
  {
    if (rowIndex < 1)// or > 65536
      return ConversionConstant.INVALID_REF;
    else
      return String.valueOf(rowIndex);
  }

  public static int translateRow(String row)
  {
    int rowIndex = -1;
    if (row != null && !ConversionConstant.INVALID_REF.equals(row))
      rowIndex = Integer.parseInt(row);
    return rowIndex;
  }

  /**
   * @param i
   * @return
   */
  public static char intToColumnChar(final int i)
  {
    return (char) (('A') + (i - 1) % 26);
  }

  public static void main(String[] args)
  {
//    String[] pArray = input.split("((?<=\\s\\').*?(?=\\'))");
    ParsedRef r0 = ReferenceParser.parse("'Sheet 1'.$A1:.B12");
    String st  = r0.getStartCellAddress();
    r0 = ReferenceParser.parse("'Sheet 1'.C$2:$B12");
    st  = r0.getStartCellAddress();
    r0 = ReferenceParser.parse("'Sheet 1'.$C$2:D12");
    st  = r0.getStartCellAddress();
    r0 = ReferenceParser.parse("'Sheet 1'.$B:A");
    st  = r0.getStartCellAddress();
    r0 = ReferenceParser.parse("'Sheet '' 1'.A");
    st  = r0.getStartCellAddress();
    r0 = ReferenceParser.parse("Sheet1.1:2");
    st  = r0.getStartCellAddress();
    r0 = ReferenceParser.parse("Sheet1.1");
    st  = r0.getStartCellAddress();
    r0 = ReferenceParser.parse("Sheet1.#REF!");
    r0 = ReferenceParser.parse("Sheet1.#REF!:#REF!");
    
    ParsedRef r1 = ReferenceParser.parse("$'She''et 2'.$D$4:$'Sheet ''''2'.$AZ$2");
    r1.toString();
    int col = ReferenceParser.translateCol(r1.startCol);
    System.out.println("columnIndex:" + col + "ColChar:" + ReferenceParser.translateCol(col) + "; RowIndex:" + r1.startRow);
    ParsedRef r2 = ReferenceParser.parse("$'Sheet 2'.$AMJ:.$B");
    col = ReferenceParser.translateCol(r2.startCol);
    System.out.println("columnIndex:" + col + "ColChar:" + ReferenceParser.translateCol(col) + "; RowIndex:" + r2.startRow);
    ParsedRef r3 = ReferenceParser.parse("$'Sheet 2'.$14:$'Sheet 2'.$900");
    col = ReferenceParser.translateCol(r3.startCol);
    System.out.println("columnIndex:" + col + "ColChar:" + ReferenceParser.translateCol(col) + "; RowIndex:" + r3.startRow);
    ParsedRef ref1 = ReferenceParser.parse("$AMJ4");
    col = ReferenceParser.translateCol(ref1.startCol);
    System.out.println("columnIndex:" + col + "ColChar:" + ReferenceParser.translateCol(col) + "; RowIndex:" + ref1.startRow);
    ParsedRef ref2 = ReferenceParser.parse("'Sheet 2'.C1:.$B3");
    col = ReferenceParser.translateCol(ref2.startCol);
    System.out.println("columnIndex:" + col + "ColChar:" + ReferenceParser.translateCol(col) + "; RowIndex:" + ref2.startRow);
    ParsedRef ref3 = ReferenceParser.parse("'Sheet 2'.D4:'Sheet 2'.AZ2");
    st  = ref3.getStartCellAddress();
    col = ReferenceParser.translateCol(ref3.startCol);
    System.out.println("columnIndex:" + col + "ColChar:" + ReferenceParser.translateCol(col) + "; RowIndex:" + ref3.startRow);
    ParsedRef ref4 = ReferenceParser.parse("Sheet1.$#REF!1:$B#REF!");
    col = ReferenceParser.translateCol(ref4.startCol);
    System.out.println("columnIndex:" + col + "ColChar:" + ReferenceParser.translateCol(col) + "; RowIndex:" + ref4.startRow);
    ParsedRef ref5 = ReferenceParser.parse("Sheet1.$1");
    col = ReferenceParser.translateRow(ref5.startCol);
    System.out.println("columnIndex:" + col + "ColChar:" + ReferenceParser.translateCol(col) + "; RowIndex:" + ref4.startRow);
    ParsedRef ref6 = ReferenceParser.parse("$Sheet1.D:$#ref!");
    col = ReferenceParser.translateCol(ref6.startCol);
    System.out.println("columnIndex:" + col + "ColChar:" + ReferenceParser.translateCol(col) + "; RowIndex:" + ref4.startRow);
  }
}
