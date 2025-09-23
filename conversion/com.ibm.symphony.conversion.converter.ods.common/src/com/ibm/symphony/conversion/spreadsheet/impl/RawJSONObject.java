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

import java.io.IOException;
import java.io.OutputStream;
import java.io.StringBufferInputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.util.List;

import com.ibm.json.java.JSONObject;

public class RawJSONObject extends JSONObject
{
  private Object rawdata;

  public RawJSONObject(Object rawdata)
  {
    super();
    this.rawdata = rawdata;
  }

  @Override
  public void serialize(OutputStream outputstream) throws IOException
  {
    if (rawdata instanceof String)
    {
      outputstream.write(((String) rawdata).getBytes("UTF-8"));
    }
    else if (rawdata instanceof StringWriter)
    {
      outputstream.write('{');
      StringBuffer buffer = ((StringWriter) rawdata).getBuffer();
      int len = buffer.length();
      int pos = 0;
      while (len > 1024 * 1024)
      {
        char[] charbuf = new char[1024 * 1024];
        buffer.getChars(pos, pos + 1024 * 1024, charbuf, 0);
        String temp = new String(charbuf);
        outputstream.write(temp.getBytes("UTF-8"));
        pos += 1024 * 1024;
        len -= 1024 * 1024;
      }
      if (len > 0)
      {
        char[] charbuf = new char[len];
        buffer.getChars(pos, pos + len, charbuf, 0);
        String temp = new String(charbuf);
        outputstream.write(temp.getBytes("UTF-8"));
      }
      outputstream.write('}');
    }
    else if (rawdata instanceof List)
    {
      JSONWriter jsOut = new JSONWriter(outputstream);
      jsOut.writeJSONStringArray((List) rawdata);
    }

  }

  @Override
  public String serialize() throws IOException
  {
    // TODO Auto-generated method stub
    return super.serialize();
  }

  @Override
  public String serialize(boolean arg0) throws IOException
  {
    // TODO Auto-generated method stub
    return super.serialize(arg0);
  }

  @Override
  public void serialize(OutputStream arg0, boolean arg1) throws IOException
  {
    // TODO Auto-generated method stub
    super.serialize(arg0, arg1);
  }

  @Override
  public void serialize(Writer arg0, boolean arg1) throws IOException
  {
    // TODO Auto-generated method stub
    super.serialize(arg0, arg1);
  }

  @Override
  public void serialize(Writer writer) throws IOException
  {
    if (rawdata instanceof String)
    {
      writer.write("{");
      writer.write(((String) rawdata));
      writer.write("}");
    }
    else if (rawdata instanceof StringWriter)
    {
      writer.write("{");
      StringBuffer buffer = ((StringWriter) rawdata).getBuffer();
      int len = buffer.length();
      int pos = 0;
      while (len > 1024 * 1024)
      {
        char[] charbuf = new char[1024 * 1024];
        buffer.getChars(pos, pos + 1024 * 1024, charbuf, 0);
        writer.write(charbuf);
        pos += 1024 * 1024;
        len -= 1024 * 1024;
      }
      if (len > 0)
      {
        char[] charbuf = new char[len];
        buffer.getChars(pos, pos + len, charbuf, 0);
        writer.write(charbuf);
      }
      writer.write("}");
    }
    else if (rawdata instanceof List)
    {
      JSONWriter jsOut = new JSONWriter(writer);
      jsOut.writeJSONStringArray((List) rawdata);
    }
  }
}
