package com.ibm.concord.spreadsheet.partialload;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;

import org.codehaus.jackson.Base64Variant;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.JsonStreamContext;
import org.codehaus.jackson.ObjectCodec;

/**
 * JsonGenerator that does nothing for all of the methods.
 */
public class NullJsonGenerator extends JsonGenerator
{
  @Override
  public void close() throws IOException
  {
    ;
  }

  @Override
  public void copyCurrentEvent(JsonParser arg0) throws IOException, JsonProcessingException
  {
    ;
  }

  @Override
  public void copyCurrentStructure(JsonParser arg0) throws IOException, JsonProcessingException
  {
    ;
  }

  @Override
  public JsonGenerator disable(Feature arg0)
  {
    return null;
  }

  @Override
  public JsonGenerator enable(Feature arg0)
  {
    return null;
  }

  @Override
  public void flush() throws IOException
  {
    ;
  }

  @Override
  public ObjectCodec getCodec()
  {
    return null;
  }

  @Override
  public JsonStreamContext getOutputContext()
  {
    return null;
  }

  @Override
  public boolean isClosed()
  {
    return false;
  }

  @Override
  public boolean isEnabled(Feature arg0)
  {
    // TODO Auto-generated method stub
    return false;
  }

  @Override
  public JsonGenerator setCodec(ObjectCodec arg0)
  {
    return null;
  }

  @Override
  public JsonGenerator useDefaultPrettyPrinter()
  {
    return null;
  }

  @Override
  public void writeBinary(Base64Variant arg0, byte[] arg1, int arg2, int arg3) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeBoolean(boolean arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeEndArray() throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeEndObject() throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeFieldName(String arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeNull() throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeNumber(int arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeNumber(long arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeNumber(BigInteger arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeNumber(double arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeNumber(float arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeNumber(BigDecimal arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeNumber(String arg0) throws IOException, JsonGenerationException, UnsupportedOperationException
  {
    ;
  }

  @Override
  public void writeObject(Object arg0) throws IOException, JsonProcessingException
  {
    ;
  }

  @Override
  public void writeRaw(String arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeRaw(char arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeRaw(String arg0, int arg1, int arg2) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeRaw(char[] arg0, int arg1, int arg2) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeRawUTF8String(byte[] arg0, int arg1, int arg2) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeRawValue(String arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeRawValue(String arg0, int arg1, int arg2) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeRawValue(char[] arg0, int arg1, int arg2) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeStartArray() throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeStartObject() throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeString(String arg0) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeString(char[] arg0, int arg1, int arg2) throws IOException, JsonGenerationException
  {
    ;
  }

  @Override
  public void writeTree(JsonNode arg0) throws IOException, JsonProcessingException
  {
    ;
  }

  @Override
  public void writeUTF8String(byte[] arg0, int arg1, int arg2) throws IOException, JsonGenerationException
  {
    ;
  }
}
