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
import java.util.HashMap;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.json.java.OrderedJSONObject;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

/**
 * Class to serialize the ConversionUtil.JSONModel to one JSON file
 * 
 * There have two sets of interface to write into the Java Random Access File: interactive mode vs batch mode,
 *  the interactive mode is to write directly into I/O stream, its disadvantage is there exists too active memory allocation.
 * 
 * The batch mode of  interface will write into one fixed-size (1MB) allocated memory (buffer) instead,
 * the buffer content will be flushed to I/O stream when it contains 1MB content. It will effectively
 * reduce memory allocation.
 * 
 * 
 */
public class AbstractJSONFileAccess
{

  private static final Logger LOG = Logger.getLogger(AbstractJSONFileAccess.class.getName());
  // support the maximum 10 enum items by default, feel free to change it
  public static enum JSONType {TYPE0, TYPE1, TYPE2, TYPE3, TYPE4, TYPE5, TYPE6, TYPE7, TYPE8, TYPE9};
  private int maxNumOfEnum = 10;
  private int numOfEnum = 0; // number of JSONType
  private JSONType lastJSONType;

  final static int maxBufferSize = 1024*1024;
  
  final static String STARTOBJ = "{";
  final static String ENDOBJ = "}";
  final static String STARTARRAY = "[";
  final static String ENDARRAY = "]";
  final static String OBJ_SEPARATOR = ":";
  final static String SEPARATOR = ",";

  private StringBuffer fullBuf;
  JSONType curJSONType = JSONType.TYPE0;
  
  protected RandomAccessFile rFile;

  // the offset in the output stream writer for each key
  protected HashMap<JSONType, Long> offsetMap;

  public AbstractJSONFileAccess(RandomAccessFile file, int numOfEnum, Object object) throws IOException
  {
    init(file, numOfEnum);
  }
  
  public AbstractJSONFileAccess(RandomAccessFile file, int numOfEnum) throws IOException
  {
    init(file, numOfEnum);
  }

  private void init(RandomAccessFile file, int numOfEnum) throws IOException 
  {
    rFile = file;
    this.numOfEnum = numOfEnum;
    offsetMap = new HashMap<JSONType, Long>();
    
    if (numOfEnum <= 0) this.numOfEnum = maxNumOfEnum;
    else this.numOfEnum = numOfEnum < maxNumOfEnum ? numOfEnum : maxNumOfEnum;
    
    lastJSONType = JSONType.valueOf("TYPE" + String.valueOf(this.numOfEnum - 1));
    
    fullBuf = new StringBuffer();
    
    start();
  }
  /**
   * Method to close the current writer.
   * 
   * @throws IOException
   *           Thrown if an error occurs during writer close.
   */
  public void close() throws IOException
  {
    rFile.close();
  }

  /**
   * Method to start to serialize the json file
   */
  public void start() throws IOException
  {
    long offset = writeRawString(STARTOBJ);// begin with '{'

    for (JSONType type : JSONType.values())
    {
      if (type.compareTo(lastJSONType) <=  0)
        offsetMap.put(type, offset);
    }

    writeRawString(ENDOBJ);    
  }

  /*
   * serialize json content to to the stream
   */
  public void serialize() throws IOException
  {
    // to be extended
  }
  
  /*
   * get the key string for the given 'type' enum entry,
   * please extend it to define the customized mapping of 'key' and JSONType
   */
  protected String getKey(JSONType type) {
    // to be extended
    return type.toString();
  }
  
  /*
   * please extend it to define the cutomized mapping of 'key' and JSONType
   */
  public JSONType getJSONType(String str)
  {
    // to be extended
    return JSONType.valueOf(str);
  }
  
  
  /*
   * serialize the pair of 'key' and 'value'
   * @param    withPrefixSep      true if the ',' should be inserted prior to the pair of 'key' and 'value'
   */
  private long writePair(StringBuffer buf,String key, Object value, boolean withPrefixSep) throws IOException
  {
    long length = 0;
    
    if (withPrefixSep)
      length += writeRawString(buf,SEPARATOR);
    
    length += writeString(buf,key);
    length += writeRawString(buf,OBJ_SEPARATOR);
    length += writeObject(buf,value);
    
    return length;
  }
  
  /*
   * write the pair of the 'key' string and object into the json segment being specified by jsonType 'type'
   * @param  withPrefixSep  true if the ',' needs to be inserted first
   */
  public void writePairBuffer(JSONType type, String key, Object object, boolean withPrefixSep) throws IOException
  {
    //StringBuffer fullBuf = new StringBuffer();
    if (object == null) return ;
    
    // set current json type
    curJSONType = type;
    
    if (withPrefixSep)
      fullBuf.append(SEPARATOR);
    writeString(fullBuf,key);
    writeRawString(fullBuf,OBJ_SEPARATOR);
    writeObject(fullBuf,object);
    
    flush(fullBuf);
  }
  
  private void flush(StringBuffer stringBuf)throws IOException
  {
	  int length = stringBuf.length();
	  if (length <= 0) return;
	  
	  JSONType type = curJSONType;
	  long offset = offsetMap.get(type);
	  
	  byte[] buf = writeSeek(offset, -1);
	  writeSeekEnd(stringBuf.toString().getBytes());
	  writeSeekEnd(buf);
	  
	  adjustOffset(type, offset, length);
	  
	  stringBuf.delete(0, length);
  }
  
  /*
   * write the pair of the 'key' string and object into the json segment being specified by jsonType 'type'
   * @param  withPrefixSep  true if the ',' needs to be inserted first
   */
  public long writePair(JSONType type, String key, Object object, boolean withPrefixSep) throws IOException
  {
    if (object == null) return 0;
    
    long offset = offsetMap.get(type);
    long length = 0;
    byte[] buf = writeSeek(offset, -1);
    
    if (withPrefixSep)
      length += writeRawString(SEPARATOR);
    length += writeString(key);
    length += writeRawString(OBJ_SEPARATOR);
    length += writeObject(object);
    
    writeSeekEnd(buf);
    
    adjustOffset(type, offset, length);

    return length;
  }
  
  public void writeBuffer(JSONType type, Object object) throws IOException
  {
    //StringBuffer fullBuf = new StringBuffer();
    if (object == null) return ;
    
    // set current JSONType
    curJSONType = type;
    
    long offset = offsetMap.get(type);
    if (offset > 1)
      writeRawString(fullBuf,SEPARATOR);
    
    writeString(fullBuf,getKey(type));
    writeRawString(fullBuf,OBJ_SEPARATOR);

    writeObject(fullBuf,object);
    
    flush(fullBuf);    
  }
  
  /*
   * write the object into the json segment being specified by jsonType 'type'
   */
  public long write(JSONType type, Object object) throws IOException
  {
    if (object == null) return 0;
    
    long offset = offsetMap.get(type);
    long length = 0;
    byte[] buf = writeSeek(offset, -1);
    if (offset > 1)
      length += writeRawString(SEPARATOR);
    
    length += writeString(getKey(type));
    length += writeRawString(OBJ_SEPARATOR);

    length += writeObject(object);
    
    writeSeekEnd(buf);
    
    adjustOffset(type, offset, length);

    return length;
  }
    
  /*
   * serialize the pair of 'key' and 'value'
   * @param    withPrefixSep      true if the ',' should be inserted prior to the pair of 'key' and 'value'
   */
  private long writePair(String key, Object value, boolean withPrefixSep) throws IOException
  {
    long length = 0;
    
    if (withPrefixSep)
      length += writeRawString(SEPARATOR);
    
    length += writeString(key);
    length += writeRawString(OBJ_SEPARATOR);
    length += writeObject(value);
    
    return length;
  }
  
  /*
   * serialize the 'object' JSONObject to current write postion in stream
   */
  private long writeJSONObject(JSONObject object) throws IOException
  {
    if (object == null) return 0;
    
    long length = 0;
    boolean firstItem = true;
    length += writeRawString(STARTOBJ);
    Iterator<String> iter = null;
    if (object instanceof OrderedJSONObject) {
    	iter = ((OrderedJSONObject)object).getOrder();
    } else {
    	iter = object.keySet().iterator();
    }
    while (iter.hasNext()) {
      String key = (String)iter.next();
      Object value = object.get(key);
      length += writePair(key, value, !firstItem);
      if (firstItem) firstItem = false;
    }
    length += writeRawString(ENDOBJ);
    
    return length;
  }
  
  /*
   * serialize json array
   */
  private long writeJSONArray (JSONArray object) throws IOException
  {
    // TODO to be implemented later
    return 0;
  }

  /**
   * Serialize the given object to stream
   */
  private long writeObject(Object object) throws IOException
  {
    if (null == object)
      return writeNull();
    
    if (object instanceof Number)
      return writeNumber((Number) object);
    
    if (object instanceof String)
      return writeString((String) object);
    
    if (object instanceof Boolean)
      return writeBoolean((Boolean) object);
    
    if (object instanceof JSONObject)
      return writeJSONObject((JSONObject) object);
    
    if (object instanceof JSONArray)
      return writeJSONArray ((JSONArray) object);

    LOG.log(Level.WARNING, "can not write this Object directly(" + object.toString() + ")");
    return 0;
  }
  

  /**
   * Serialize the given object to stream
   */
  private long writeObject(StringBuffer buf,Object object) throws IOException
  {
	long length = 0;
    if (null == object)
      length = writeNull(buf);
    else if (object instanceof Number)
      length = writeNumber(buf,(Number) object);
    else if (object instanceof String)
      length = writeString(buf,(String) object);
    else if (object instanceof Boolean)
      length = writeBoolean(buf,(Boolean) object);
    else if (object instanceof JSONObject)
      length = writeJSONObject(buf,(JSONObject) object);
    else if (object instanceof JSONArray)
      length = writeJSONArray (buf,(JSONArray) object);
    else
      LOG.log(Level.WARNING, "can not write this Object directly(" + object.toString() + ")");
    
    if (buf.length() >= maxBufferSize)
    	flush(buf);
    
    return length;
  }

  private long writeNull() throws IOException
  {
    rFile.writeBytes("null");
    return 4;
  }

  /*
   * write the string with prefix and postfix '"'
   */
  private long writeString(String value) throws IOException
  {
    if (null == value)
      return writeNull();
    long length = 0;
    length += writeRawString(String.valueOf('"'));
    char[] chars = value.toCharArray();

    for (int i = 0; i < chars.length; i++)
    {
      char c = chars[i];
      switch (c)
        {
          case '"' :
            length += writeRawString("\\\"");
            break;
          case '\\' :
            length += writeRawString("\\\\");
            break;
          case 0 :
            length += writeRawString("\\0");
            break;
          case '\b' :
            length += writeRawString("\\b");
            break;
          case '\t' :
            length += writeRawString("\\t");
            break;
          case '\n' :
            length += writeRawString("\\n");
            break;
          case '\f' :
            length += writeRawString("\\f");
            break;
          case '\r' :
            length += writeRawString("\\r");
            break;
          case '/' :
            length += writeRawString("\\/");
            break;
          default:
            if ((c >= 32) && (c <= 126))
            {
              length += writeRawString(String.valueOf(c));
            }
            else
            {
              //FIXME non-BMP character won't be supported
              length += writeRawString("\\u");
              length += writeRawString(alignRight(Integer.toHexString(c), 4));
            }
            break;
        }
    }

    length += writeRawString(String.valueOf('"'));

    return length;
  }

  /**
   * Method to generate a string with a particular width. Alignment is done using zeroes if it does not meet the width requirements.
   * 
   * @param s
   *          The string to write
   * @param len
   *          The minimum length it should be, and to align with zeroes if length is smaller.
   * @return A string properly aligned/correct width.
   */
  private String alignRight(String s, int len)
  {
    if (len == s.length())
      return s;

    StringBuffer sb = new StringBuffer(s);

    while (sb.length() < len)
    {
      sb.insert(0, '0');
    }

    return sb.toString();
  }


  // Write number
  private long writeNumber(StringBuffer buf,Number value) throws IOException
  {
    if (null == value)
      return writeNull(buf);

    if (value instanceof Float)
    {
      if (((Float) value).isNaN())
        return writeNull(buf);
      if (Float.NEGATIVE_INFINITY == value.floatValue())
        return writeNull();
      if (Float.POSITIVE_INFINITY == value.floatValue())
        return writeNull(buf);
    }

    if (value instanceof Double)
    {
      if (((Double) value).isNaN())
        return writeNull(buf);
      if (Double.NEGATIVE_INFINITY == value.doubleValue())
        return writeNull(buf);
      if (Double.POSITIVE_INFINITY == value.doubleValue())
        return writeNull(buf);
    }

    return writeRawString(buf,value.toString());
  }

  private long writeNull(StringBuffer buf) throws IOException
  {
    buf.append("null");
    return 4;
  }

  // Write true or false
  private long writeBoolean(StringBuffer buf,Boolean value) throws IOException
  {
    if (null == value)
      return writeNull(buf);

    return writeRawString(buf,value.toString());
  }


  // Write number
  private long writeNumber(Number value) throws IOException
  {
    if (null == value)
      return writeNull();

    if (value instanceof Float)
    {
      if (((Float) value).isNaN())
        return writeNull();
      if (Float.NEGATIVE_INFINITY == value.floatValue())
        return writeNull();
      if (Float.POSITIVE_INFINITY == value.floatValue())
        return writeNull();
    }

    if (value instanceof Double)
    {
      if (((Double) value).isNaN())
        return writeNull();
      if (Double.NEGATIVE_INFINITY == value.doubleValue())
        return writeNull();
      if (Double.POSITIVE_INFINITY == value.doubleValue())
        return writeNull();
    }

    return writeRawString(value.toString());
  }

  /*
   * write the string with prefix and postfix '"'
   */
  private long writeString(StringBuffer buf, String value) throws IOException
  {
    if (null == value)
      return writeNull();
    long length = 0;
    length += writeRawString(buf,String.valueOf('"'));
    //char[] chars = value.toCharArray();

    int len = value.length();
    
    for (int i = 0; i < len ; i++)
    {
      char c = value.charAt(i);
      switch (c)
        {
          case '"' :
            length += writeRawString(buf,"\\\"");
            break;
          case '\\' :
            length += writeRawString(buf,"\\\\");
            break;
          case 0 :
            length += writeRawString(buf,"\\0");
            break;
          case '\b' :
            length += writeRawString(buf,"\\b");
            break;
          case '\t' :
            length += writeRawString(buf,"\\t");
            break;
          case '\n' :
            length += writeRawString(buf,"\\n");
            break;
          case '\f' :
            length += writeRawString(buf,"\\f");
            break;
          case '\r' :
            length += writeRawString(buf,"\\r");
            break;
          case '/' :
            length += writeRawString(buf,"\\/");
            break;
          default:
            if ((c >= 32) && (c <= 126))
            {
              length += writeRawString(buf,String.valueOf(c));
            }
            else
            {
              //FIXME non-BMP character won't be supported
              length += writeRawString(buf,"\\u");
              length += writeRawString(buf,alignRight(Integer.toHexString(c), 4));
            }
            break;
        }
    }

    length += writeRawString(buf,String.valueOf('"'));

    return length;
  }  

  // Write the raw string
  private long writeRawString(StringBuffer buf,String str) throws IOException
  {
    if (str == null)
      return writeNull(buf);
    buf.append(str);
    return str.length();
  }
  
  /*
   * serialize the 'object' JSONObject to current write postion in stream
   */
  private long writeJSONObject(StringBuffer buf, JSONObject object) throws IOException
  {
    if (object == null)
      return 0;
    long length = 0;
    // check raw json string
    boolean israw = false;
    Iterator<String> iterraw = object.keySet().iterator();
    if (iterraw.hasNext())
    {
      String key = (String) iterraw.next();
      if (key.equals("rawjson"))
      {
        Object value = object.get(key);
        length += writeRawString(buf, value.toString());
        israw = true;
      }
    }
    if (!israw)
    {
      //
      boolean firstItem = true;
      length += writeRawString(buf, STARTOBJ);
      Iterator<String> iter = object.keySet().iterator();
      if (object instanceof OrderedJSONObject)
      {
        OrderedJSONObject o = (OrderedJSONObject) object;
        iter = o.getOrder();
      }
      while (iter.hasNext())
      {
        String key = (String) iter.next();
        Object value = object.get(key);
        length += writePair(buf, key, value, !firstItem);
        if (firstItem)
          firstItem = false;
      }
      length += writeRawString(buf, ENDOBJ);
    }
    return length;
  }
  
  /*
   * serialize json array
   */
  private long writeJSONArray (StringBuffer buf,JSONArray object) throws IOException
  {
    if (object == null)
      return 0;
    long length = 0;
    // check raw json string
    boolean israw = false;
    //
    boolean firstItem = true;
    length += writeRawString(buf, STARTARRAY);
    Iterator<String> iter = object.iterator();
    while (iter.hasNext())
    {
      Object value = iter.next();
      length += writeObject(buf, value);
      if (iter.hasNext())
        length += writeRawString(buf,SEPARATOR);
    }
    length += writeRawString(buf, ENDARRAY);
    return length;
  }  
  
  // Write true or false
  private long writeBoolean(Boolean value) throws IOException
  {
    if (null == value)
      return writeNull();

    return writeRawString(value.toString());
  }
  
  // Write the raw string
  private long writeRawString(String str) throws IOException
  {
    if (str == null)
      return writeNull();

    rFile.writeBytes(str);
    return str.length();
  }

  public void adjustOffsetByDelta (JSONType jsonType, long delta) {
    long offset = offsetMap.get(jsonType);
    offset += delta;
    offsetMap.put(jsonType, offset);
  }
  /*
   * Adjust the offset (write position) for the given 'type' of content and
   * those 'type' which content is put behind the given 'type' of content
   */
  private void adjustOffset(JSONType jsonType, long startWritePos, long writeLength)
  {
    for (JSONType type : JSONType.values())
    {
      if (type.compareTo(lastJSONType) <= 0) {
        if (type.compareTo(jsonType) >= 0)
        {
          long offset = offsetMap.get(type);
          if (startWritePos <= offset)
          {
            offset += writeLength;
            offsetMap.put(type, offset);
          }
        }
      }
    }
  }
  
  /**
   * Method to seek to the pos, then want to write something at there so we should cache the already existing content from pos, otherwise
   * the content will be overridden by the new write content
   * 
   * @param pos             the write position
   * @param cacheLength     if given -1, cache all the bytes from pos to the end of file
   * @return the cached bytes
   * @throws IOException
   */
  protected byte[] writeSeek(long pos, long cacheLength) throws IOException
  {
    rFile.seek(pos);
    if (cacheLength == -1)
      cacheLength = rFile.length() - pos;// cache all the bytes from pos to the file end
    
    byte[] buf = new byte[(int) cacheLength];
    rFile.read(buf);
    rFile.seek(pos);
    return buf;
  }

  /**
   * Method to end the seek write operation it will write back the cached content
   * 
   * @param buf     the cached content
   * @throws IOException
   */
  private void writeSeekEnd(byte[] buf) throws IOException
  {
    rFile.write(buf);
  }
}