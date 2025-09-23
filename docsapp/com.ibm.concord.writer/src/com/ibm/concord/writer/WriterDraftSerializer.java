/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.writer;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.io.Writer;

import com.ibm.concord.spi.draft.IDraftJSONObjectSerializer;
import com.ibm.json.java.JSONObject;
import com.ibm.json.java.internal.Serializer;

public class WriterDraftSerializer implements IDraftJSONObjectSerializer
{
  public void serialize(JSONObject sectionContent, OutputStream sectionOutputStream, InputStream originalDraftSectionInputStream)
      throws IOException
  {
    Writer writer = null;
    try
    {
      writer = new BufferedWriter(new OutputStreamWriter(sectionOutputStream, "UTF-8"));
    }
    catch (UnsupportedEncodingException uex)
    {
      IOException iox = new IOException(uex.toString());
      iox.initCause(uex);
      throw iox;
    }
    DocumentSerializer serializer = new DocumentSerializer(writer);
    serializer.writeObject(sectionContent).flush();
  }

}

class DocumentSerializer extends Serializer
{
  public DocumentSerializer(Writer writer)
  {
    super(writer);
  }

  
/**
 * reference the code in file TestDocs/src/com/ibm/json/java/internal/Serializer.java
 */
  @Override
  public Serializer writeString(String value) throws IOException
  {
    if (null == value) return writeNull();

    writeRawString("\"");

    char[] chars = value.toCharArray();

    for (int i=0; i<chars.length; i++)
    {
        char c = chars[i];
        switch (c)
        {
            case  '"': writeRawString("\\\""); break;
            case '\\': writeRawString("\\\\"); break;
            case    0: writeRawString("\\0"); break;
            case '\b': writeRawString("\\b"); break;
            case '\t': writeRawString("\\t"); break;
            case '\n': writeRawString("\\n"); break;
            case '\f': writeRawString("\\f"); break;
            case '\r': writeRawString("\\r"); break;
            case '/': writeRawString("\\/"); break;
            default:               
              writeRawString(String.valueOf(c));
        }
    }

    writeRawString("\"");

    return this;
  }
}
