/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json;

import java.io.IOException;
import java.io.RandomAccessFile;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;


public class ContentJSONFileAccess extends AbstractJSONFileAccess {

  private ConversionUtil.Document document;
  
  private static final String CALC_START = "\"calculated\":";//need change with calculated ConversionConstant.CALCULATED
  
  public ContentJSONFileAccess(RandomAccessFile file, int numOfJSONType, Object document) throws IOException
  {
    super(file, numOfJSONType);
    this.document = (ConversionUtil.Document)document;
  }
  
  public ContentJSONFileAccess(RandomAccessFile file, int numOfJSONType) throws IOException
  {
    super(file, numOfJSONType);
  }
  
  /**
   * Method to start to serialize the content.js
   */
  public void start() throws IOException
  {
    super.start();
    
    // write the string "sheets:{}" into the stream and
    // correctly seek the offset of the "sheets" content  
    JSONObject o = new JSONObject();
    JSONType type = getJSONType(ConversionConstant.SHEETS);
    write(type, o);
    adjustOffsetByDelta (type, -1);
    
    //delay export calculated status due to it depends on the cell content 
//    type = getJSONType(ConversionConstant.CALCULATED);
//    long offset = offsetMap.get(type);
//    write(type, true);
//    offsetMap.put(type, offset + 1); // skip the ',' after the "\"sheets\":{}" string
  }
  
  public JSONType getJSONType(String str)
  {
    String key = null;
    // { SHEET, CALCFLAG, STYLE, UNNAME, NAME, PNAME };
    if (str.equalsIgnoreCase(ConversionConstant.SHEETS))
      key = "TYPE0";
    else if (str.equalsIgnoreCase(ConversionConstant.CALCULATED))
      key = "TYPE1";
    else if (str.equalsIgnoreCase(ConversionConstant.STYLES))
      key = "TYPE2";
    else if (str.equalsIgnoreCase(ConversionConstant.UNNAME_RANGE))
      key = "TYPE3";
    else if (str.equalsIgnoreCase(ConversionConstant.NAME_RANGE))
      key = "TYPE4";
    else if (str.equalsIgnoreCase(ConversionConstant.PRESERVE_RANGE))
      key = "TYPE5";
    
    return AbstractJSONFileAccess.JSONType.valueOf(key);
  }
    
  /*
   * get the key string for the given 'type'
   */
  protected String getKey(JSONType type) {
    String key = null;
    switch (type)
    {
      case TYPE0:
        key = ConversionConstant.SHEETS;
        break;
      case TYPE1:
        key = ConversionConstant.CALCULATED;
        break;
      case TYPE2:
        key = ConversionConstant.STYLES;
        break;
      case TYPE3:
        key = ConversionConstant.UNNAME_RANGE;
        break;
      case TYPE4:
        key = ConversionConstant.NAME_RANGE;
        break;
      case TYPE5:
        key = ConversionConstant.PRESERVE_RANGE;
        break;
      default: 
        break;
    }
    
    return key;
  }

  public void serialize() throws IOException
  {
    JSONObject object = null;
    writeBuffer(getJSONType(ConversionConstant.STYLES), document.stylesToJSON());
    object = document.unnamesToJSON();
    if (!object.isEmpty()) writeBuffer(getJSONType(ConversionConstant.UNNAME_RANGE), object);
    object = document.namesToJSON();
    if (!object.isEmpty()) writeBuffer(getJSONType(ConversionConstant.NAME_RANGE), object);    
    object = document.pnamesToJSON();
    if (!object.isEmpty()) writeBuffer(getJSONType(ConversionConstant.PRESERVE_RANGE), object);

    // Have to put the SHEETS content after the PRESERVE_RANGE in order to support row-level partial load at document server
    long offset = offsetMap.get(getJSONType(ConversionConstant.CALCULATED));
    byte[] sheetsBuf = writeSeek(1, offset - 1); 
    byte[] buf = writeSeek(offset, rFile.length() - 1 - offset); // skip the last '}' byte
    rFile.seek(1);
    //write calculated status of this document
    String calcStatus = CALC_START + document.bCalculated;
    byte[] calcBuf = calcStatus.getBytes();
    rFile.write(calcBuf);
    
    rFile.write(buf);
    rFile.write(',');
    rFile.write(sheetsBuf);
    rFile.write('}');
  }
}