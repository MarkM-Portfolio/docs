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

public class IDMFormulaParsedRef
{
  public static final int MASK_ABSOLUTE_NONE = 0;

  public static final int MASK_ABSOLUTE_SHEET = 1;

  public static final int MASK_ABSOLUTE_COLUMN = 2;

  public static final int MASK_ABSOLUTE_ROW = 4;

  public static final int MASK_ABSOLUTE_END_SHEET = 8;

  public static final int MASK_ABSOLUTE_END_COLUMN = 16;

  public static final int MASK_ABSOLUTE_END_ROW = 32;

  public static final int MASK_START_SHEET = 64;

  public static final int MASK_START_COLUMN = 128;

  public static final int MASK_START_ROW = 256;

  public static final int MASK_END_SHEET = 512;

  public static final int MASK_END_COLUMN = 1024;

  public static final int MASK_END_ROW = 2048;

  public static final int MASK_EMPTY_END_SHEET = 4096;

  public static final int MASK_INVALID_SHEET = 8192;

  public static final int MASK_QUOTE_SHEETNAME = 16384;

  public static final int MASK_OUTPUT_SHEETNAME = 32768;

  public static final int MASK_RANGE_NAMES = 65536;

  public static final int MASK_OOXML_FORMAT = 131072;

  public static final int MASK_ONE_PIECE_OF_3D_RANGE = 262144;

  public static final int IDMSSRefType_Invalid = 0;

  public static final int IDMSSRefType_Cell = 1;

  public static final int IDMSSRefType_Range = 2;

  public static final int IDMSSRefType_Row = 3;

  public static final int IDMSSRefType_Column = 4;

  public static final int IDMSSRefType_Unnamerange = 5;

  public static final int IDMSSRefType_NameRange = 6;

  public static final int IDMSSRefType_Sheet = 7;

  public static final int IDMSS_MAX_ROW_NUM = 1048576;

  public static final int IDMSS_MAX_COL_NUM = 1024; // 16384

  public static final int IDMSS_MAX_COL_NUM_MS = 16384;

  public static final String IDMSS_INVALID_REF = "#REF!";

  public static final String IDMSS_ABSOLUTE_TOKEN = "$";

  public static final int IDMSS_DEFAULT_RANGE_MASK = MASK_START_COLUMN | MASK_START_ROW | MASK_END_COLUMN | MASK_END_ROW;

  public static final int IDMSS_DEFAULT_CELL_MASK = MASK_START_COLUMN | MASK_START_ROW;

  public static final int IDMSS_DEFAULT_COLS_MASK = MASK_START_COLUMN | MASK_END_COLUMN;

  public static final int IDMSS_DEFAULT_ROWS_MASK = MASK_START_ROW | MASK_END_ROW;

  public static final int IDMSS_RANGE_MASK = MASK_START_SHEET | MASK_START_COLUMN | MASK_START_ROW | MASK_END_COLUMN | MASK_END_ROW;

  public static final int IDMSS_CELL_MASK = MASK_START_SHEET | MASK_START_COLUMN | MASK_START_ROW;

  public static final int IDMSS_COLS_MASK = MASK_START_SHEET | MASK_START_COLUMN | MASK_END_COLUMN;

  public static final int IDMSS_ROWS_MASK = MASK_START_SHEET | MASK_START_ROW | MASK_END_ROW;

  public static final String IDMSS_ODS_SHEET_SEP = ".";

  public static final String IDMSS_MS_SHEET_SEP = "!";

  public static final String SINGLE_QUOTE = "\'";

  public static final String TWO_SINGLE_QUOTE = "\'\'";

  public static final boolean NO = false;

  public static final boolean YES = true;

  String _sheetName;

  int _startRow;

  int _startCol;

  int _endRow;

  int _endCol;

  // refMask define the address format and can determin the range type
  int _refMask;

  int _index;

  String refType;

  public void initWithStartRow(int sr, int sc, int er, int ec, String sheetname, int refMask)
  {
    _startRow = sr;
    _startCol = sc;
    _endRow = er;
    _endCol = ec;
    _sheetName = sheetname;
    _refMask = refMask;
    _index = 1;
    if (_startRow == -1 && _endRow == -1 && ((_refMask & IDMSS_DEFAULT_COLS_MASK) == IDMSS_DEFAULT_COLS_MASK))
    {
      _startRow = 0;
      _endRow = IDMSS_MAX_ROW_NUM - 1;
    }
    else if (_startCol == -1 && _endCol == -1 && ((_refMask & IDMSS_DEFAULT_ROWS_MASK) == IDMSS_DEFAULT_ROWS_MASK))
    {
      _startCol = 0;
      _endCol = IDMSS_MAX_COL_NUM - 1;
    }
    else if (_endRow == -1 && _endCol == -1 && ((_refMask & IDMSS_DEFAULT_CELL_MASK) == IDMSS_DEFAULT_CELL_MASK))
    {
      _endRow = _startRow;
      _endCol = _startCol;
    }
  }

  public String getSheetName()
  {
    return _sheetName;
  }

  private int getStartRow()
  {
    return _startRow;
  }

  private int getStartCol()
  {
    return _startCol;
  }

  private int getEndRow()
  {
    return _endRow;
  }

  private int getEndCol()
  {
    return _endCol;
  }

  public int getRefMask()
  {
    return _refMask;
  }

  public int getIndex()
  {
    return _index;
  }

  public void setIndex(int _index)
  {
    this._index = _index;
  }

  public void setRefMask(int mask)
  {
    _refMask = mask;
  }

  public int getIntStartRow()
  {
    if (_startRow >= 0)
      return _startRow + 1;
    return _startRow;
  }

  public int getIntStartCol()
  {
    if (_startCol >= 0)
      return _startCol + 1;
    return _startCol;
  }

  public int getIntEndRow()
  {
    if (_endRow >= 0)
      return _endRow + 1;
    return _endRow;
  }

  public int getIntEndCol()
  {
    if (_endCol >= 0)
      return _endCol + 1;
    return _endCol;
  }

  public void setStartRow(int _startRow)
  {
    this._startRow = _startRow;
  }

  public void setStartCol(int _startCol)
  {
    this._startCol = _startCol;
  }

  public void setEndRow(int _endRow)
  {
    this._endRow = _endRow;
  }

  public void setEndCol(int _endCol)
  {
    this._endCol = _endCol;
  }

  public String getRefType()
  {
    return refType;
  }

  public void setRefType(String refType)
  {
    this.refType = refType;
    if ("names".equals(refType))
    {
      _refMask = _refMask | MASK_RANGE_NAMES;
    }
    else if ("vref".equals(refType))
    {
      _refMask = _refMask | IDMSS_RANGE_MASK;
    }

  }

  public void initInvalid()
  {
    _startRow = -1;
    _startCol = -1;
    _endRow = -1;
    _endCol = -1;
    _index = 1;
  }

  public void setInvalidSheetName()
  {
    _sheetName = IDMSS_INVALID_REF;
    _refMask = _refMask | MASK_INVALID_SHEET;
  }

  public void setSheetName(String sheetname)
  {
    _sheetName = sheetname;
    _refMask = _refMask & (~MASK_INVALID_SHEET);
    _refMask = _refMask | MASK_START_SHEET;
    _refMask = _refMask | MASK_OUTPUT_SHEETNAME;
  }

  String formatSheetName(String name)
  {
    if ((_refMask & MASK_QUOTE_SHEETNAME) > 0)
    {
      String quotename = name.replaceAll(SINGLE_QUOTE, TWO_SINGLE_QUOTE);
      return "'" + quotename + "'";
    }
    return name;
  }

  String translateColByNumber(int colNum)
  {
    if (colNum < 0)
    {
      return IDMSS_INVALID_REF;
    }
    colNum += 1;
    String result = "";
    do
    {
      int digit = colNum % 26;
      String s;
      if (digit == 0)
      {
        s = "Z";
        result = s += (result);
        if (colNum == 26)
          break;
        colNum--;
      }
      else
      {
        s = String.valueOf((char) (digit + 64));
        result = s += (result);
      }
      colNum /= 26;
    }
    while (colNum > 0);
    return result;
  }

  public String translateRowByNumber(int rowNum)
  {
    if (rowNum < 0)
      return IDMSS_INVALID_REF;
    return String.valueOf(rowNum + 1);
  }

  public String getAddress()
  {
    String address = "";
    String sheetPart = "";
    if ((_refMask & MASK_RANGE_NAMES) == MASK_RANGE_NAMES)
    {
      return _sheetName;
    }
    if (_sheetName != null && !_sheetName.isEmpty() && (_refMask & MASK_OUTPUT_SHEETNAME) > 0)
    {
      if ((_refMask & MASK_ABSOLUTE_SHEET) > 0 &&
          (_refMask & MASK_OOXML_FORMAT) == 0 )
        sheetPart = sheetPart += (IDMSS_ABSOLUTE_TOKEN);
      if ((_refMask & MASK_INVALID_SHEET) > 0)
        sheetPart = sheetPart += (IDMSS_INVALID_REF);
      else
      {
        sheetPart = sheetPart += (formatSheetName(_sheetName));
      }
      if ((_refMask & MASK_OOXML_FORMAT) > 0)
        sheetPart = sheetPart += (IDMSS_MS_SHEET_SEP);
      else
        sheetPart = sheetPart += (IDMSS_ODS_SHEET_SEP);
    }
    if ((_refMask & MASK_START_COLUMN) > 0)
    {
      if ((_refMask & MASK_ABSOLUTE_COLUMN) > 0)
        address = address += (IDMSS_ABSOLUTE_TOKEN);
      if (_startCol < 0)
      {
        address = sheetPart += (IDMSS_INVALID_REF);
        return address;
      }
      address = address += (translateColByNumber(_startCol));
    }
    if ((_refMask & MASK_START_ROW) > 0)
    {
      if ((_refMask & MASK_ABSOLUTE_ROW) > 0)
        address = address += (IDMSS_ABSOLUTE_TOKEN);
      if (_startRow < 0)
      {
        address = sheetPart += (IDMSS_INVALID_REF);
        return address;
      }
      address = address += (translateRowByNumber(_startRow));
    }
    boolean bEndCol = (_refMask & MASK_END_COLUMN) > 0;
    boolean bEndRow = (_refMask & MASK_END_ROW) > 0;
    if (bEndRow || bEndCol)
    {
      address = address += (":");
      if (bEndCol)
      {
        if ((_refMask & MASK_ABSOLUTE_END_COLUMN) > 0)
          address = address += (IDMSS_ABSOLUTE_TOKEN);
        if (_endCol < 0)
        {
          address = sheetPart += (IDMSS_INVALID_REF);
          return address;
        }
        address = address += (translateColByNumber(_endCol));
      }
      if (bEndRow)
      {
        if ((_refMask & MASK_ABSOLUTE_END_ROW) > 0)
          address = address += (IDMSS_ABSOLUTE_TOKEN);
        if (_endRow < 0)
        {
          address = sheetPart += (IDMSS_INVALID_REF);
          return address;
        }
        address = address += (translateRowByNumber(_endRow));
      }
    }
    return sheetPart += (address);
  }

  public boolean isValid()
  {
    if ((_refMask & MASK_INVALID_SHEET) > 0)
      return false;

    if ((_refMask & IDMSS_DEFAULT_RANGE_MASK) == IDMSS_DEFAULT_RANGE_MASK)
    {
      if (_startRow == -1 || _startCol == -1 || _endRow == -1 || _endCol == -1)
        return false;
      else
        return true;
    }
    if ((_refMask & IDMSS_DEFAULT_CELL_MASK) == IDMSS_DEFAULT_CELL_MASK)
    {
      if (_startRow == -1 || _startCol == -1)
        return false;
      else
        return true;
    }
    if ((_refMask & IDMSS_DEFAULT_ROWS_MASK) == IDMSS_DEFAULT_ROWS_MASK)
    {
      if (_startRow == -1 || _endRow == -1)
        return false;
      else
        return true;
    }
    if ((_refMask & IDMSS_DEFAULT_COLS_MASK) == IDMSS_DEFAULT_COLS_MASK)
    {
      if (_startCol == -1 || _endCol == -1)
        return false;
      else
        return true;
    }
    return false;

  }

  public int getType()
  {
    if ((_refMask & IDMSS_DEFAULT_RANGE_MASK) == IDMSS_DEFAULT_RANGE_MASK)
      return IDMSSRefType_Range;
    if ((_refMask & IDMSS_DEFAULT_CELL_MASK) == IDMSS_DEFAULT_CELL_MASK)
      return IDMSSRefType_Cell;
    if ((_refMask & IDMSS_DEFAULT_ROWS_MASK) == IDMSS_DEFAULT_ROWS_MASK)
      return IDMSSRefType_Row;
    if ((_refMask & IDMSS_DEFAULT_COLS_MASK) == IDMSS_DEFAULT_COLS_MASK)
      return IDMSSRefType_Column;
    if ((_refMask & MASK_RANGE_NAMES) == MASK_RANGE_NAMES)
      return IDMSSRefType_NameRange;
    return IDMSSRefType_Invalid;
  }

  static String parseSheetName(String name)
  {

    if (name.startsWith(SINGLE_QUOTE) && name.endsWith(SINGLE_QUOTE))
    {
      String dstname = name.substring(1, name.length() - 1);
      dstname = dstname.replaceAll(TWO_SINGLE_QUOTE, SINGLE_QUOTE);
      return dstname;
    }
    return name;
  }

  static int translateColByString(String colName)
  {
    int ret = 0;
    for (int i = 0; i < colName.length(); i++)
    {
      ret *= 26;
      char charater = colName.charAt(i);
      int deta = 0;
      if (charater >= 'a' && charater <= 'z')
      {
        deta = charater - 'a' + 1;
      }
      else if (charater >= 'A' && charater <= 'Z')
      {
        deta = charater - 'A' + 1;
      }
      else
        return -1;
      ret += deta;
    }
    return ret - 1;
  }

  static int swapRefMask(int refMask, boolean bRow)
  {
    int sMask = MASK_ABSOLUTE_COLUMN;
    int eMask = MASK_ABSOLUTE_END_COLUMN;
    if (bRow)
    {
      sMask = MASK_ABSOLUTE_ROW;
      eMask = MASK_ABSOLUTE_END_ROW;
    }
    int sType = refMask & sMask;
    int eType = refMask & eMask;
    if (sType != eType)
    {
      refMask = refMask & ~sMask & ~eMask;
      if (sType != 0)
        refMask |= eMask;
      if (eType != 0)
        refMask |= sMask;
    }
    return refMask;
  }

  static int translateRowByString(String rowName)
  {
    return Integer.valueOf(rowName) - 1;
  }

  public static IDMFormulaParsedRef createParseRefWithType(IDMFormulaLexer.LexFormulaType ftype, String type, boolean absoluteSheet,
      String sheet, boolean absoluteCol, String col, boolean absoluteRow, String row, boolean absoluteEndCol, String endCol,
      boolean absoluteEndRow, String endRow, boolean isquotedname)
  {
    int refMask = MASK_ABSOLUTE_NONE;
    if (ftype == IDMFormulaLexer.LexFormulaType.FORMAT_OOXML)
      refMask |= MASK_OOXML_FORMAT;
    if (absoluteSheet)
      refMask |= MASK_ABSOLUTE_SHEET;
    if (absoluteCol)
      refMask |= MASK_ABSOLUTE_COLUMN;
    if (absoluteRow)
      refMask |= MASK_ABSOLUTE_ROW;
    if (absoluteEndCol)
      refMask |= MASK_ABSOLUTE_END_COLUMN;
    if (absoluteEndRow)
      refMask |= MASK_ABSOLUTE_END_ROW;
    if (isquotedname)
    {
      refMask |= MASK_QUOTE_SHEETNAME;
    }

    String sheetName = "";
    if (!sheet.isEmpty())
    {
      if (sheet.startsWith("#REF") && isquotedname == false)
      {
        sheetName = IDMSS_INVALID_REF;
        refMask |= MASK_INVALID_SHEET;
      }
      else
        sheetName = parseSheetName(sheet);
      refMask |= MASK_START_SHEET;
      refMask |= MASK_OUTPUT_SHEETNAME;
    }
    int colIndex, rowIndex, endColIndex, endRowIndex;
    if (!col.isEmpty())
    {
      colIndex = translateColByString(col);
      if (colIndex >= IDMSS_MAX_COL_NUM)
        return null;
      refMask |= MASK_START_COLUMN;
    }
    else
      colIndex = -1;
    if (!endCol.isEmpty())
    {
      endColIndex = translateColByString(endCol);
      if (endColIndex >= IDMSS_MAX_COL_NUM)
        return null;
      refMask |= MASK_END_COLUMN;
      if (endColIndex < colIndex)
      {
        int tmp = endColIndex;
        endColIndex = colIndex;
        colIndex = tmp;
        refMask = swapRefMask(refMask, NO);
      }
    }
    else
      endColIndex = colIndex;

    if (!row.isEmpty())
    {
      if (row.startsWith("#REF"))
      {
        rowIndex = -1;
        refMask |= MASK_START_ROW;
      }
      else
      {
        rowIndex = translateRowByString(row);
        if (rowIndex >= IDMSS_MAX_ROW_NUM)
          return null;
        refMask |= MASK_START_ROW;
      }
    }
    else
      rowIndex = -1;
    if (!endRow.isEmpty())
    {
      endRowIndex = translateRowByString(endRow);
      if (endRowIndex >= IDMSS_MAX_ROW_NUM)
        return null;
      refMask |= MASK_END_ROW;
      if (endRowIndex < rowIndex)
      {
        int tmp = endRowIndex;
        endRowIndex = rowIndex;
        rowIndex = tmp;
        refMask = swapRefMask(refMask, YES);
      }
    }
    else
      endRowIndex = rowIndex;

    IDMFormulaParsedRef ref = new IDMFormulaParsedRef();
    ref.initWithStartRow(rowIndex, colIndex, endRowIndex, endColIndex, sheetName, refMask);
    ref.setRefType(type);
    return ref;
  }

  public static IDMFormulaParsedRef createParseRefWithType(IDMFormulaLexer.LexFormulaType ftype, String type, boolean absoluteSheet,
      String sheet, boolean absoluteCol, int col, boolean absoluteRow, int row, boolean absoluteEndCol, int endCol, boolean absoluteEndRow,
      int endRow, boolean isquotedname)
  {
    int refMask = MASK_ABSOLUTE_NONE;
    if (ftype == IDMFormulaLexer.LexFormulaType.FORMAT_OOXML)
      refMask |= MASK_OOXML_FORMAT;
    if (absoluteSheet)
      refMask |= MASK_ABSOLUTE_SHEET;
    if (absoluteCol)
      refMask |= MASK_ABSOLUTE_COLUMN;
    if (absoluteRow)
      refMask |= MASK_ABSOLUTE_ROW;
    if (absoluteEndCol)
      refMask |= MASK_ABSOLUTE_END_COLUMN;
    if (absoluteEndRow)
      refMask |= MASK_ABSOLUTE_END_ROW;
    if (isquotedname)
    {
      refMask |= MASK_QUOTE_SHEETNAME;
    }
    String sheetName = "";
    if (!sheet.isEmpty())
    {
      if (sheet.startsWith("#REF") && isquotedname == false)
      {
        sheetName = IDMSS_INVALID_REF;
        refMask |= MASK_INVALID_SHEET;
      }
      else
        sheetName = parseSheetName(sheet);
      refMask |= MASK_START_SHEET;
      refMask |= MASK_OUTPUT_SHEETNAME;
    }
    int colIndex, rowIndex, endColIndex, endRowIndex;
    if (col >= 0)
    {
      colIndex = col;
      if (colIndex >= IDMSS_MAX_COL_NUM)
        return null;
      refMask |= MASK_START_COLUMN;
    }
    else
      colIndex = -1;
    if (endCol >= 0)
    {
      endColIndex = endCol;
      if (endColIndex >= IDMSS_MAX_COL_NUM)
        return null;
      refMask |= MASK_END_COLUMN;
      if (endColIndex < colIndex)
      {
        int tmp = endColIndex;
        endColIndex = colIndex;
        colIndex = tmp;
        refMask = swapRefMask(refMask, NO);
      }
    }
    else
      endColIndex = colIndex;

    if (row >= 0)
    {
      rowIndex = row;
      if (rowIndex >= IDMSS_MAX_ROW_NUM)
        return null;
      refMask |= MASK_START_ROW;
    }
    else
      rowIndex = -1;
    if (endRow >= 0)
    {
      endRowIndex = endRow;
      if (endRowIndex >= IDMSS_MAX_ROW_NUM)
        return null;
      refMask |= MASK_END_ROW;
      if (endRowIndex < rowIndex)
      {
        int tmp = endRowIndex;
        endRowIndex = rowIndex;
        rowIndex = tmp;
        refMask = swapRefMask(refMask, YES);
      }
    }
    else
      endRowIndex = rowIndex;
    IDMFormulaParsedRef ref = new IDMFormulaParsedRef();
    ref.initWithStartRow(rowIndex, colIndex, endRowIndex, endColIndex, sheetName, refMask);
    ref.setRefType(type);
    return ref;
  }

  public IDMFormulaParsedRef clone()
  {
    IDMFormulaParsedRef ret = new IDMFormulaParsedRef();
    ret._sheetName = this._sheetName;
    ret._startRow = this._startRow;
    ret._startCol = this._startCol;
    ret._endRow = this._endRow;
    ret._endCol = this._endCol;
    ret._refMask = this._refMask;
    ret._index = this._index;
    ret.refType = this.refType;
    return ret;
  }
  
  @Override
  public String toString()
  {
    // TODO Auto-generated method stub
    return "<" + this.getAddress() + ">";
  }

}
