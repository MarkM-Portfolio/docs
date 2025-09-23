package com.ibm.concord.spreadsheet.document.model.impl;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONObject;

/**
 * 
 * @author HanBingfeng
 * 
 * @param <T>
 *          the range ID type
 */
public class Range<T>
{
  private static final Logger LOG = Logger.getLogger(Range.class.getName());
  
  protected T id = null;

  protected Document parent;

  protected int sheetId = IDManager.INVALID;

  protected int endSheetId = IDManager.INVALID;

  protected int startRowId = IDManager.INVALID;

  protected int endRowId = IDManager.INVALID;

  protected int startColId = IDManager.INVALID;

  protected int endColId = IDManager.INVALID;

  protected RangeUsage usage = ConversionUtil.RangeUsage.NORMAL;

  protected String address = null;

  protected JSONObject data;// other data info for range, such as task cache info for task, and series info for chart

  protected boolean bEnableMaxRow = true;
  
  protected int startRowIndex = -1;
  
  protected int rowDelta = 0;
  
  protected ParsedRefType type = ParsedRefType.INVALID;

  protected ParsedRefType bakType = ParsedRefType.INVALID;

  protected int patternMask;//generate range address according to patternMask 
  
  private RangeInfo rangeInfoFor3D; // only the 3D name range has this value, because the row/col index will never be changed even delete/insert row/col
  
  /**
   * Only used when deserialize, and should set row/col ids immediately after construct
   * @param p Document handler
   * @param id  rangeId
   */
  public Range(Document p, T id)
  {
    parent = p;
    this.id = id;
  }

  public Range(Document p, ParsedRef ref, String sheetName, boolean bEnableMaxRow)
  {
    parent = p;
    this.bEnableMaxRow = bEnableMaxRow;
    updateAddress(ref, sheetName);
  }
  
  public Range(Document p, String refValue, String sheetName,  boolean bEnableMaxRow)
  {
    this(p, ReferenceParser.parse(refValue),sheetName,bEnableMaxRow);
  }
  
  public Range(Document p, T rangeId,int sheetId, int endSheetId, int startRowId,int endRowId,int startColId,int endColId, boolean bEnableMaxRow)
  {
    parent = p;
    this.id = rangeId;
    this.sheetId = sheetId;
    this.endSheetId = endSheetId;
    this.startRowId = startRowId;
    this.endRowId = endRowId;
    this.startColId = startColId;
    this.endColId = endColId;
    
    if (IDManager.INVALID != this.startRowId && IDManager.INVALID == this.startColId && IDManager.INVALID == this.endColId)
    {
      this.type = ParsedRefType.ROW;
    }else if (IDManager.INVALID == this.startRowId && IDManager.INVALID != this.startColId && IDManager.INVALID == this.endRowId)
    {
      this.type = ParsedRefType.COLUMN;
    }
    else if (IDManager.INVALID != this.startRowId && IDManager.INVALID != this.startColId)
    {
      this.type = ParsedRefType.RANGE;
    }
    //set default pattern mask
    patternMask |= ReferenceParser.START_SHEET;
    if (IDManager.INVALID != this.endSheetId)
      patternMask |= ReferenceParser.END_SHEET;
    if (IDManager.INVALID != this.startRowId)
      patternMask |= ReferenceParser.START_ROW;
    if(IDManager.INVALID != this.endRowId)
      this.patternMask |= ReferenceParser.END_ROW;
    if (IDManager.INVALID != this.startColId)
      patternMask |= ReferenceParser.START_COLUMN;
    if(IDManager.INVALID != this.endColId)
      this.patternMask |= ReferenceParser.END_COLUMN;
  }
  
  public Range(Range<T> range)
  {
	  this.parent = range.parent;
	  this.id = range.id;
	  this.sheetId = range.sheetId;
	  this.endSheetId = range.endSheetId;
	  this.startRowId = range.startRowId;
	  this.endRowId = range.endRowId;
	  this.startColId = range.startColId;
	  this.endColId = range.endColId;
	  this.type = range.type;
	  
	  this.usage = range.usage;
	  this.patternMask = range.patternMask;
	  this.bakType = range.bakType;
  }
  
  public void setParent(Document p)
  {
    parent = p;
  }
  
  public boolean equals(Range<T> rangeModel)
  {
    if(rangeModel == null)
      return false;
    boolean bEqual = this.sheetId == rangeModel.getSheetId()
          && (this.startRowId == rangeModel.startRowId || type == ParsedRefType.COLUMN)//for column type, the start row id might not update to the first row
          && this.endRowId == rangeModel.endRowId
          && (this.startColId == rangeModel.startColId || type == ParsedRefType.ROW)
          && this.endColId == rangeModel.endColId
          && this.startRowIndex == rangeModel.startRowIndex
          && this.rowDelta == rangeModel.rowDelta
          && this.usage == rangeModel.getUsage();
//    if(bEqual){
//      if( this.usage == RangeUsage.REFERENCE )
//          bEqual = (type != RangeType.INVALID && type == rangeModel.type)//the same range type, otherwise A#REF!:B#REF! will be the same with A:B
//                    || ( bakType == rangeModel.bakType );//or all change to the invalid type, but typeBak are the same 
//      
//    }
    return bEqual;
  }
  
  public boolean equals(Range<T> rangeModel, boolean ignorePattern)
  {
	  if(!ignorePattern)
		  return equals(rangeModel);
	  
	  if(rangeModel == null)
	      return false;
	  
	  RangeInfo rInfo = this.getRangeInfo();	  
	  RangeInfo rInfo1 = rangeModel.getRangeInfo();
	  
	  boolean bEqual = rInfo.sheetId == rInfo1.sheetId
	  		&& rInfo.startRow == rInfo1.startRow
	  		&& rInfo.endRow == rInfo1.endRow
	  		&& rInfo.startCol == rInfo1.startCol
	  		&& rInfo.endCol == rInfo1.endCol;
	  
	  return bEqual;
  }
  
  private void normalize()
  {
    IDManager idManager = parent.getIDManager();
    int srIndex = idManager.getRowIndexById(this.sheetId, this.startRowId);
    int erIndex = idManager.getRowIndexById(this.sheetId, this.endRowId);
    if(srIndex > erIndex && erIndex > IDManager.INVALID)//IDManager.MAXID is also less than IDManager.INVALID
    {
      int rId = this.startRowId;
      this.startRowId = this.endRowId;
      this.endRowId = rId;
    }
    
    int scIndex = idManager.getColIndexById(this.sheetId, this.startColId);
    int ecIndex = idManager.getColIndexById(this.sheetId, this.endColId);
    if(scIndex > ecIndex && ecIndex > IDManager.INVALID)
    {
      int cId = this.startColId;
      this.startColId = this.endColId;
      this.endColId = cId;
    }
  }
  
  public T getId()
  {
    return id;
  }

  public void setId(T id)
  {
    this.id = id;
  }
  
  public Document getParent()
  {
    return parent;
  }

  public int getSheetId()
  {
    return sheetId;
  }

  public void setSheetId(int sheetId)
  {
    this.sheetId = sheetId;
    check3DRange();
  }

  public int getEndSheetId()
  {
    return endSheetId;
  }

  public void setEndSheetId(int endSheetId)
  {
    this.endSheetId = endSheetId;
    check3DRange();
  }
  
  private void check3DRange(){
    if(this.endSheetId == sheetId) {
      if (this.rangeInfoFor3D != null) {
        // change from 3D ref to 2D
        // for 3D ref, start/end col/row id has not been set
        Sheet sheet = parent.getSheetById(sheetId);
        String sheetName = null;
        if (sheet != null)
          sheetName = sheet.getSheetName();
        ParsedRef ref = new ParsedRef(sheetName, ReferenceParser.translateRow(this.rangeInfoFor3D.startRow), ReferenceParser.translateCol(this.rangeInfoFor3D.startCol),
            null, ReferenceParser.translateRow(this.rangeInfoFor3D.endRow), ReferenceParser.translateCol(this.rangeInfoFor3D.endCol));
        ref.patternMask = this.patternMask;
        updateAddress(ref, sheetName);
      }
    }
  }

  public int getStartRowId()
  {
    return startRowId;
  }

  public void setStartRowId(int startRowId)
  {
    this.startRowId = startRowId;
  }

  public int getEndRowId()
  {
    return endRowId;
  }

  public void setEndRowId(int endRowId)
  {
    this.endRowId = endRowId;
  }

  public int getStartColId()
  {
    return startColId;
  }

  public void setStartColId(int startColId)
  {
    this.startColId = startColId;
  }

  public int getEndColId()
  {
    return endColId;
  }

  public void setEndColId(int endColId)
  {
    this.endColId = endColId;
  }

  public RangeUsage getUsage()
  {
    return usage;
  }

  public void setUsage(RangeUsage usage)
  {
    this.usage = usage;
  }

  public boolean isEnableMaxRow()
  {
    return bEnableMaxRow;
  }

  public void setEnableMaxRow(boolean enableMaxRow)
  {
    this.bEnableMaxRow = enableMaxRow;
  }

  public ParsedRefType getType()
  {
    return type;
  }

  public void setType(ParsedRefType type)
  {
    this.type = type;
  }

  public ParsedRefType getBakType()
  {
    return bakType;
  }

  public void setBakType(ParsedRefType bakType)
  {
    this.bakType = bakType;
  }

  public JSONObject getData()
  {
    if(data == null)
      data = new JSONObject();
    return data;
  }
  
  public void setData(JSONObject d)
  {
    data = d;
  }
  
  public void setInvalidSheetName()
  {
    ParsedRef ref = getParsedRef();
    //update address before set invalid, such as there might be insert/delete row before set invalid sheet name
    this.address = ref.getAddressByMask(patternMask, true);
    this.bakType = this.type;
    this.type = ParsedRefType.INVALID;
  }
  
  public void recoverSheetName()
  {
    if(this.bakType != ParsedRefType.INVALID)
      this.type = this.bakType;
    this.address = this.getAddress();
  }
  
  public ParsedRef getParsedRef()
  {
    RangeInfo info = getRangeInfo();
    ParsedRef patternRef = null;

    if (info.sheetId != IDManager.INVALID)
    {
      String sSheet = null;
      String eSheet = null;
      String sr = null;
      String er = null;
      String sc = null;
      String ec = null;;
      if ((patternMask & ReferenceParser.START_SHEET) > 0)
      {
        Sheet sheet = parent.getSheetById(info.sheetId);
        sSheet = sheet.getSheetName();
        if (info.endSheetId > 0 && info.endSheetId != info.sheetId) {
            Sheet endSheet = parent.getSheetById(info.endSheetId);
            eSheet = endSheet.getSheetName();
         }
      }
      if ((patternMask & ReferenceParser.START_ROW) > 0)
        sr = ReferenceParser.translateRow(info.startRow);
      if ((patternMask & ReferenceParser.END_ROW) > 0)
        er = ReferenceParser.translateRow(info.endRow);
      if ((patternMask & ReferenceParser.START_COLUMN) > 0)
        sc = ReferenceParser.translateCol(info.startCol);
      if ((patternMask & ReferenceParser.END_COLUMN) > 0)
        ec = ReferenceParser.translateCol(info.endCol);
      patternRef = new ParsedRef(sSheet, sr, sc, eSheet, er, ec);
      patternRef.patternMask = this.patternMask;
    }
    
    return patternRef;
  }
  
  public String getAddress()
  {
	  return getAddress(false);
  }
  
  //TODO: test row/col type range to getAddress
  //and test Sheet1.A1:.A2, and Sheet1.A1:A2
  //return the address as the pattern address/pattern ref
  //if nonInvalid is true, then return Sheet1.#REF!9:#REF!15, if it is false, return Sheet1.#REF!
  public String getAddress(boolean nonInvalid)
  {
    IDManager idManager = parent.getIDManager();
    ParsedRef ref = getParsedRef();
    if(ref != null)
    {
      return ref.getAddressByMask(patternMask, false, nonInvalid);
    }
    //for #REF!.A1
//    this.address = ref.getAddressByMask(patternMask, true);
    return this.address;
  }
  
  /**
   * set the range address
   * @param address
   * @param bAnalyzeAddress true for setting the type of range
   */
  public void setAddress(String address, boolean bAnalyzeAddress)
  {
    this.address = address;
    ParsedRef ref = ReferenceParser.parse(address);
    if(bAnalyzeAddress)
      updateAddress(ref, null);
    else if(ref != null){
      //if address is like Sheet1.#REF! pattern
      //can not make sure that it is row/column type
      //for name range/chart, it might not recovered correctly by undoRange delta info
      //so use the endrow or end column id is "M" to treat it as column/row type
      if(ref.type == ParsedRefType.ROW && ConversionConstant.INVALID_REF.equals(ref.startRow)
          && ref.startCol == null && ref.endRow == null && ref.endCol == null)
      {
        if(endRowId == IDManager.MAXID)
        {
          ref.patternMask = ref.patternMask | ReferenceParser.START_COLUMN;
          ref.patternMask = ref.patternMask | ReferenceParser.ABSOLUTE_COLUMN;
          ref.patternMask = ref.patternMask | ReferenceParser.END_COLUMN;
          ref.patternMask = ref.patternMask | ReferenceParser.ABSOLUTE_END_COLUMN;
          ref.patternMask = ref.patternMask & ~ReferenceParser.START_ROW;
          ref.patternMask = ref.patternMask & ~ReferenceParser.END_ROW;
        }else if(endColId == IDManager.MAXID)
        {
          ref.patternMask = ref.patternMask | ReferenceParser.START_ROW;
          ref.patternMask = ref.patternMask | ReferenceParser.ABSOLUTE_ROW;
          ref.patternMask = ref.patternMask | ReferenceParser.END_ROW;
          ref.patternMask = ref.patternMask | ReferenceParser.ABSOLUTE_END_ROW;
          ref.patternMask = ref.patternMask & ~ReferenceParser.START_COLUMN;
          ref.patternMask = ref.patternMask & ~ReferenceParser.END_COLUMN;
        }else
        {
          boolean bRange = true;
          if(startRowId == IDManager.INVALID && endRowId == IDManager.INVALID){
            if(endColId == IDManager.INVALID)
              bRange = false;
          }else if(startColId == IDManager.INVALID && endColId == IDManager.INVALID){
            if(endRowId == IDManager.INVALID)
              bRange = false;
          }
          //range pattern
          ref.patternMask = ref.patternMask | ReferenceParser.START_ROW;
          ref.patternMask = ref.patternMask | ReferenceParser.START_COLUMN;
          if(this.usage == ConversionUtil.RangeUsage.NAMES)
          {
        	ref.patternMask = ref.patternMask | ReferenceParser.ABSOLUTE_ROW;
        	ref.patternMask = ref.patternMask | ReferenceParser.ABSOLUTE_COLUMN;
          }
         
          if(bRange){
            ref.patternMask = ref.patternMask | ReferenceParser.END_ROW;
            ref.patternMask = ref.patternMask | ReferenceParser.END_COLUMN;
            if(this.usage == ConversionUtil.RangeUsage.NAMES)
            {
              ref.patternMask = ref.patternMask | ReferenceParser.ABSOLUTE_END_ROW;
              ref.patternMask = ref.patternMask | ReferenceParser.ABSOLUTE_END_COLUMN;
            }
          }
        }
      }
      this.patternMask = ref.patternMask;
    }
  }
  public boolean is3D()
  {
    return (sheetId>0 && endSheetId>0 && sheetId!=endSheetId);
  }

  public boolean isValid()
  {
	  return this.type != ParsedRefType.INVALID ;
  }
  /**
   * return the range info which contains sheetId, start/end row/col index
   * according to the range type, 
   * E.g. if it is cell, start row index is equal with end row index, so does col index
   * if it is row range, start row is not equal with end row, and start/end col index is IDManager.INVALID
   * if the range is invalid, the index will be IDManager.INVALID
   * @return RangeInfo
   */
  public RangeInfo getRangeInfo()
  {
    int sheetId = this.sheetId;
    int sr = IDManager.INVALID;
    int sc = IDManager.INVALID;
    int er = IDManager.INVALID;
    int ec = IDManager.INVALID;
    
    IDManager idManager = parent.getIDManager();
    Sheet sheet = parent.getSheetById(sheetId);
    if (sheet != null)
    {
      if (this.is3D()) {
        this.rangeInfoFor3D.sheetId = sheetId;
        this.rangeInfoFor3D.endSheetId = endSheetId;
        return this.rangeInfoFor3D.clone();
      }
      if(ParsedRefType.COLUMN == type || ParsedRefType.COLUMN == bakType){
        sr = 1;
        er = ConversionConstant.MAX_ROW_NUM;
      }else{
        if (this.bEnableMaxRow && IDManager.INVALID != this.startRowId && this.startRowId == IDManager.MAXID)
          sr = this.startRowIndex > ConversionConstant.MAX_ROW_NUM ? ConversionConstant.MAX_ROW_NUM : this.startRowIndex;
        else
          sr = idManager.getRowIndexById(this.sheetId, this.startRowId);
  
        if (this.bEnableMaxRow && IDManager.INVALID != this.endRowId && this.endRowId == IDManager.MAXID)
        {
          er = (sr > 0) ? sr + this.rowDelta : this.rowDelta;
          er = er > ConversionConstant.MAX_ROW_NUM ? ConversionConstant.MAX_ROW_NUM : er;
        }
        else
        {
          er = idManager.getRowIndexById(this.sheetId, this.endRowId);
          if (er == IDManager.INVALID && this.endRowId == IDManager.INVALID && type != ParsedRefType.INVALID)
            er = sr;
        }
      }      
      if(ParsedRefType.ROW == type || ParsedRefType.ROW == bakType){
        sc = 1;
        ec = ConversionConstant.MAX_COL_NUM;
      }else{
        sc = idManager.getColIndexById(this.sheetId, this.startColId);
        sc = sc > ConversionConstant.MAX_COL_NUM ? ConversionConstant.MAX_COL_NUM : sc;
      
        ec = idManager.getColIndexById(this.sheetId, this.endColId);
        ec = ec > ConversionConstant.MAX_COL_NUM ? ConversionConstant.MAX_COL_NUM : ec;
        if (ec == IDManager.INVALID && this.endColId == IDManager.INVALID && type != ParsedRefType.INVALID)
          ec = sc;
      }
    }else
    {
      //sheet does not exist
      sheetId = IDManager.INVALID;
    }
    Sheet endSheet = parent.getSheetById(endSheetId);
    if (endSheet == null)
    {
      endSheetId = IDManager.INVALID;
    }
    
    RangeInfo info = new RangeInfo(sheetId, endSheetId, sr, sc, er, ec, this.type);
    return info;
  }
  
  
  public void updateAddress(ReferenceParser.ParsedRef ref, String sheetName)
  {
    if (null == ref)
    {
      LOG.info("the paresedRef is null");
      return;
    }
    try
    {
      Sheet sheet = null;
      IDManager idManager = parent.getIDManager();
      this.patternMask = ref.patternMask;
      String refShName = ref.getSheetName();
      if (null != refShName && refShName.length() > 0)
      {
        sheetName = refShName;
      }else if( null == sheetName)
      {
        // the sheetId might be given before updateAddress
        if (sheetId != IDManager.INVALID)
        {
          sheet = parent.getSheetById(sheetId);
          if (sheet != null)
          {
            sheetName = sheet.getSheetName();
          }
        }
      }
      
      if (sheetName != null)
        sheet = parent.getSheetByName(sheetName);
      else
        LOG.log(Level.WARNING, "the range {0} does not have a sheet name ", ref.toString());
      
      if (sheet != null)
      {
        this.address = ref.getAddressByMask(patternMask, false);
        int sheetId = sheet.getId();
       
        this.type = ref.type;
        bakType = type;
        
        String endSheetName = ref.getEndSheetName();
        if (null != endSheetName)
        {
          Sheet endSheet = parent.getSheetByName(endSheetName);
          if (endSheet != null && endSheet.getId()!=sheetId)
          {
            this.sheetId = sheetId;
            this.endSheetId = endSheet.getId();
            this.rangeInfoFor3D = ModelHelper.getRangeInfoFromParseRef(ref, this.sheetId, this.endSheetId);
            this.startRowId = IDManager.INVALID;
            this.startColId = IDManager.INVALID;
            this.endRowId = IDManager.INVALID;
            this.endColId = IDManager.INVALID;
            return;
          }
        } 
        this.sheetId = this.endSheetId = sheetId;
        this.rangeInfoFor3D = null;
        
        int srIndex = IDManager.INVALID;
        int erIndex = IDManager.INVALID;
        int scIndex = IDManager.INVALID;
        int ecIndex = IDManager.INVALID;
        
        int gMaxRow = ConversionConstant.MAX_REF_ROW_NUM;
        
        if(type == ParsedRefType.COLUMN)
        {
          this.startRowId = idManager.getRowIdByIndex(sheetId, 1, true);
          this.endRowId = IDManager.MAXID;
        }else
        {
        String str = ref.getStartRow();
        if(null != str && (patternMask & ReferenceParser.START_ROW) > 0)
        {
          if(str.equals(ConversionConstant.INVALID_REF))
          {
            type = ParsedRefType.INVALID;
            this.startRowId = IDManager.INVALID;
          }else
          {
            srIndex = ReferenceParser.translateRow(str);
            if(this.bEnableMaxRow && srIndex > gMaxRow)
            {
              this.startRowIndex = srIndex;
              this.startRowId = IDManager.MAXID;
            }else
              this.startRowId = idManager.getRowIdByIndex(sheetId, srIndex, true);
          }
        }
        else
          this.startRowId = IDManager.INVALID;
        
        str = ref.getEndRow();
        if(null != str && (patternMask & ReferenceParser.END_ROW) > 0)
        {
          if(str.equals(ConversionConstant.INVALID_REF))
          {
            this.type = ParsedRefType.INVALID;
            this.endRowId = IDManager.INVALID;
          }else
          {
            erIndex = ReferenceParser.translateRow(str);
            if(this.bEnableMaxRow && erIndex > gMaxRow)
            {
              this.endRowId = IDManager.MAXID;
              this.rowDelta = (srIndex > 0) ? ( erIndex - srIndex ) : erIndex;
            }else
              this.endRowId = idManager.getRowIdByIndex(sheetId, erIndex, true);
          }
        }
        else
            this.endRowId = IDManager.INVALID;
        }
        if(type == ParsedRefType.ROW){
          this.startColId = idManager.getColIdByIndex(sheetId, 1, true);
          this.endColId = IDManager.MAXID;
        }else
        {
        String str = ref.getStartCol();
        if(null != str && (patternMask & ReferenceParser.START_COLUMN) > 0)
        {
          if(str.equals(ConversionConstant.INVALID_REF))
          {
            this.type = ParsedRefType.INVALID;
            this.startColId = IDManager.INVALID;
          }else
          {
            scIndex = ReferenceParser.translateCol(str);
            this.startColId = idManager.getColIdByIndex(sheetId, scIndex, true);
          }
        }
        else
          this.startColId = IDManager.INVALID;
        
        str = ref.getEndCol();
        if(null != str && (patternMask & ReferenceParser.END_COLUMN) > 0)
        {
          if(str.equals(ConversionConstant.INVALID_REF))
          {
            this.type = ParsedRefType.INVALID;
            this.endColId = IDManager.INVALID;
          }else
          {
            ecIndex = ReferenceParser.translateCol(str);
            this.endColId = idManager.getColIdByIndex(sheetId, ecIndex, true);
          }
        }
        else
            this.endColId = IDManager.INVALID;
        }
      }
      else
      {
        this.type = ParsedRefType.INVALID;
        this.address = ref.getAddressByMask(patternMask, true);
        this.sheetId = IDManager.INVALID;
        this.startRowId = IDManager.INVALID;
        this.startColId = IDManager.INVALID;
        this.endRowId = IDManager.INVALID;
        this.endColId = IDManager.INVALID;
      }
    }
    catch (Exception e)
    {
      this.type = ParsedRefType.INVALID;
      e.printStackTrace();
    }
  }

  public static class RangeInfo
  {
    // sheetId
    private int sheetId;
    // endSheetId
    private int endSheetId;
    // 1-based start row number
    private int startRow;

    private int startCol;

    private int endRow;

    private int endCol;
    
    private ParsedRefType type;
    

    public RangeInfo(int sId, int sr, int sc, int er, int ec, ParsedRefType t)
    {
      this(sId, sId, sr, sc, er, ec, t);
    }
    
    public RangeInfo(int sId, int eId, int sr, int sc, int er, int ec, ParsedRefType t)
    {
      sheetId = sId;
      if (eId > 0)
        endSheetId = eId;
      else
        endSheetId = sheetId;
      startRow = sr;
      startCol = sc;
      endRow = er;
      endCol = ec;
      type = t;
    }

    public int getSheetId()
    {
      return sheetId;
    }

    public int getEndSheetId()
    {
      return endSheetId;
    }

    public int getStartRow()
    {
      return startRow;
    }

    public int getStartCol()
    {
      return startCol;
    }

    public int getEndRow()
    {
      return endRow;
    }

    public int getEndCol()
    {
      return endCol;
    }
    
    public ParsedRefType getType()
    {
      return type;
    }
    
    public RangeInfo clone() 
    {
      return new RangeInfo(sheetId, endSheetId, startRow, startCol, endRow, endCol, type);
    }
    public boolean isValid()
    {
      if(startRow < 1) 
        return false;
      if(startRow > ConversionConstant.MAX_ROW_NUM )
      {
        LOG.log(Level.WARNING, "start row index should not exceed {0}", ConversionConstant.MAX_ROW_NUM);
        return false;
      }
      if(endRow < 1) 
        return false;
      if(endRow > ConversionConstant.MAX_ROW_NUM )
      {
        LOG.log(Level.WARNING, "end row index should not exceed {0}", ConversionConstant.MAX_ROW_NUM);
        return false;
      }
      if(startCol < 1) 
        return false;
      if(startCol > ConversionConstant.MAX_COL_NUM )
      {
        LOG.log(Level.WARNING, "start col index should not exceed {0}", ConversionConstant.MAX_COL_NUM);
        return false;
      }
      if(endCol < 1) 
        return false;
      if(endCol > ConversionConstant.MAX_COL_NUM )
      {
        LOG.log(Level.WARNING, "end col index should not exceed {0}", ConversionConstant.MAX_COL_NUM);
        return false;
      }
      return true;
    }

    public boolean is3D()
    {
      return (sheetId>0 && endSheetId>0 && sheetId!=endSheetId);
    }
  }

}