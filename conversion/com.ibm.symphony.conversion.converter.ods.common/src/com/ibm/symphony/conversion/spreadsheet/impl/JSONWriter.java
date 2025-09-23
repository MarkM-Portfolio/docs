/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.impl;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.RandomAccessFile;
import java.io.Writer;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.json.java.OrderedJSONObject;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

/**
 * Class to serialize the ConversionUtil.JSONModel to one JSON file
 * 
 * There have two sets of interface to write into the Java Random Access File: interactive mode vs batch mode, the interactive mode is to
 * write directly into I/O stream, its disadvantage is there exists too active memory allocation.
 * 
 * The batch mode of interface will write into one fixed-size (1MB) allocated memory (buffer) instead, the buffer content will be flushed to
 * I/O stream when it contains 1MB content. It will effectively reduce memory allocation.
 * 
 * 
 */
public class JSONWriter
{

  private static final Logger LOG = Logger.getLogger(JSONWriter.class.getName());

  final static String STARTOBJ = "{";

  final static String ENDOBJ = "}";

  final static String STARTARRAY = "[";

  final static String ENDARRAY = "]";

  final static String OBJ_SEPARATOR = ":";

  final static String SEPARATOR = ",";

  private Writer localBufferedWriter;

  public JSONWriter(OutputStream outputstream) throws IOException
  {
    localBufferedWriter = new BufferedWriter(new OutputStreamWriter(outputstream, "UTF-8"), 1024 * 1024);
  }

  public JSONWriter(Writer outputWriter) throws IOException
  {
    localBufferedWriter = outputWriter;
  }

  /*
   * serialize json content to to the stream
   */
  public void serializeObject(Object object) throws IOException
  {
    writeObject(localBufferedWriter, object);
    localBufferedWriter.flush();
  }

  /*
   * serialize the pair of 'key' and 'value'
   * 
   * @param withPrefixSep true if the ',' should be inserted prior to the pair of 'key' and 'value'
   */
  private long writePair(Writer buf, String key, Object value, boolean withPrefixSep) throws IOException
  {
    long length = 0;

    if (withPrefixSep)
      length += writeRawString(buf, SEPARATOR);

    length += writeString(buf, key);
    length += writeRawString(buf, OBJ_SEPARATOR);
    length += writeObject(buf, value);

    return length;
  }

  /*
   * write the pair of the 'key' string and object into the json segment being specified by jsonType 'type'
   * 
   * @param withPrefixSep true if the ',' needs to be inserted first
   */
  public void writePairBuffer(Writer buf, String key, Object object, boolean withPrefixSep) throws IOException
  {
    // StringBuffer fullBuf = new StringBuffer();
    if (object == null)
      return;

    if (withPrefixSep)
      buf.write(SEPARATOR);
    writeString(buf, key);
    writeRawString(buf, OBJ_SEPARATOR);
    writeObject(buf, object);
  }

  /**
   * Serialize the given object to stream
   */
  private long writeObject(Writer buf, Object object) throws IOException
  {
    long length = 0;
    if (null == object)
      length = writeNull(buf);
    else if (object instanceof Number)
      length = writeNumber(buf, (Number) object);
    else if (object instanceof String)
      length = writeString(buf, (String) object);
    else if (object instanceof Boolean)
      length = writeBoolean(buf, (Boolean) object);
    else if (object instanceof RawJSONObject)
      ((RawJSONObject) object).serialize(buf);
    else if (object instanceof JSONObject)
      length = writeJSONObject(buf, (JSONObject) object);
    else if (object instanceof JSONArray)
      length = writeJSONArray(buf, (JSONArray) object);
    else
      LOG.log(Level.WARNING, "can not write this Object directly(" + object.toString() + ")");

    return length;
  }

  private long writeJSONArray(Writer buf, JSONArray object) throws IOException
  {
    if (object == null || object.isEmpty())
      buf.write("[]");
    else
    {
      long length = 0;
      boolean firstItem = true;
      length += writeRawString(buf, STARTARRAY);
      Iterator<Object> iter = object.iterator();
      while (iter.hasNext())
      {
        if (!firstItem)
          writeRawString(buf, this.SEPARATOR);
        Object value = iter.next();
        length += writeObject(buf, value);
        if (firstItem)
          firstItem = false;
      }
      length += writeRawString(buf, ENDARRAY);
      return length;
    }
    return 2;
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
  private long writeNumber(Writer buf, Number value) throws IOException
  {
    if (null == value)
      return writeNull(buf);

    if (value instanceof Float)
    {
      if (((Float) value).isNaN())
        return writeNull(buf);
      if (Float.NEGATIVE_INFINITY == value.floatValue())
        return writeNull(buf);
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

    return writeRawString(buf, value.toString());
  }

  private long writeNull(Writer buf) throws IOException
  {
    buf.write("null");
    return 4;
  }

  // Write true or false
  private long writeBoolean(Writer buf, Boolean value) throws IOException
  {
    if (null == value)
      return writeNull(buf);

    return writeRawString(buf, value.toString());
  }

  /*
   * write the string with prefix and postfix '"'
   */
  private long writeString(Writer buf, String value) throws IOException
  {
    if (null == value)
      return writeNull(buf);
    long length = 0;
    length += writeRawString(buf, String.valueOf('"'));
    // char[] chars = value.toCharArray();

    int len = value.length();

    for (int i = 0; i < len; i++)
    {
      char c = value.charAt(i);
      switch (c)
        {
          case '"' :
            length += writeRawString(buf, "\\\"");
            break;
          case '\\' :
            length += writeRawString(buf, "\\\\");
            break;
          case 0 :
            length += writeRawString(buf, "\\0");
            break;
          case '\b' :
            length += writeRawString(buf, "\\b");
            break;
          case '\t' :
            length += writeRawString(buf, "\\t");
            break;
          case '\n' :
            length += writeRawString(buf, "\\n");
            break;
          case '\f' :
            length += writeRawString(buf, "\\f");
            break;
          case '\r' :
            length += writeRawString(buf, "\\r");
            break;
          case '/' :
            length += writeRawString(buf, "\\/");
            break;
          default:
            if ((c >= 32) && (c <= 126))
            {
              length += writeRawString(buf, String.valueOf(c));
            }
            else
            {
              // FIXME non-BMP character won't be supported
              length += writeRawString(buf, "\\u");
              length += writeRawString(buf, alignRight(Integer.toHexString(c), 4));
            }
            break;
        }
    }

    length += writeRawString(buf, String.valueOf('"'));

    return length;
  }

  // Write the raw string
  private long writeRawString(Writer buf, String str) throws IOException
  {
    if (str == null)
      return writeNull(buf);
    buf.write(str);
    return str.length();
  }

  /*
   * serialize the 'object' JSONObject to current write postion in stream
   */
  private long writeJSONObject(Writer buf, JSONObject object) throws IOException
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
  private long writeJSONStringArray(Writer buf, List rowIdArray) throws IOException
  {
    if (rowIdArray == null)
      buf.write("[]");
    else
    {
      long length = 0;
      boolean firstItem = true;
      length += writeRawString(buf, STARTARRAY);
      Iterator<String> iter = rowIdArray.iterator();
      while (iter.hasNext())
      {
        if (!firstItem)
          writeRawString(buf, this.SEPARATOR);
        String value = (String) iter.next();
        length += writeObject(buf, value);
        if (firstItem)
          firstItem = false;
      }
      length += writeRawString(buf, ENDARRAY);
      return length;
    }
    return 2;
  }

  public long writeJSONStringArray(List rowIdArray) throws IOException
  {
    return writeJSONStringArray(localBufferedWriter, rowIdArray);
  }

}