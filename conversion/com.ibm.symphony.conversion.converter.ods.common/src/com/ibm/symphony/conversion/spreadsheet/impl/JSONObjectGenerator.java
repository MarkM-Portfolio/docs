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
import java.io.StringWriter;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;
import java.util.logging.Logger;

import org.codehaus.jackson.Base64Variant;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.JsonStreamContext;
import org.codehaus.jackson.JsonToken;
import org.codehaus.jackson.ObjectCodec;
import org.codehaus.jackson.impl.JsonGeneratorBase;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONArtifact;
import com.ibm.json.java.JSONObject;

/**
 * <p>
 * {@link JsonGenerator} implementation that generates {@link JSONObject}.
 * <p>
 * For most efficiency, doesn't use {@link JsonGeneratorBase}, validity check is done internally.
 * <p>
 * Doesn't support <strong>any</strong> features. Only <code>write*</code> methods are implemented.
 */
public class JSONObjectGenerator extends JsonGenerator
{
  private static final Logger LOG = Logger.getLogger(JSONObjectGenerator.class.getName());

  private JSONArtifact currentObject;

  private JSONObject rootObject;

  private Stack<JSONArtifact> stack;

  private String fieldName;

  private boolean closed;

  private JsonFactory jsonFactory;

  private boolean isPackRows = false;

  private int levelInRows = 0;

  public JSONObjectGenerator(JsonFactory jsonFactory)
  {
    this.jsonFactory = jsonFactory;
    stack = new Stack<JSONArtifact>();
    closed = false;
  }

  public void setPackRows(boolean isPackRows)
  {
    this.isPackRows = isPackRows;
  }

  @Override
  public void writeStartArray() throws IOException, JsonGenerationException
  {
    if (rootObject == null)
    {
      throw new JsonGenerationException("in start array, expecting root object");
    }

    JSONArray array = new JSONArray();
    if (currentObject instanceof JSONObject)
    {
      assertFieldName("start array");
      ((JSONObject) currentObject).put(fieldName, array);
    }
    else
    {
      ((JSONArray) currentObject).add(array);
    }

    stack.push(currentObject);
    currentObject = array;
  }

  @Override
  public void writeEndArray() throws IOException, JsonGenerationException
  {
    if (stack.isEmpty())
    {
      throw new JsonGenerationException("in end array, expecting parent object");
    }
    if (!(currentObject instanceof JSONArray))
    {
      throw new JsonGenerationException("in end array, expecting start array");
    }

    currentObject = stack.pop();
  }

  @Override
  public void writeStartObject() throws IOException, JsonGenerationException
  {
    JSONObject object = new JSONObject();

    if (rootObject == null)
    {
      rootObject = object;
      currentObject = object;
    }
    else
    {
      if (currentObject instanceof JSONObject)
      {
        assertFieldName("start object");
        ((JSONObject) currentObject).put(fieldName, object);
      }
      else
      {
        ((JSONArray) currentObject).add(object);
      }
      stack.push(currentObject);
      currentObject = object;
    }
  }

  @Override
  public void writeEndObject() throws IOException, JsonGenerationException
  {
    if (rootObject == null)
    {
      throw new JsonGenerationException("in end object, expecting parent object");
    }
    if (!(currentObject instanceof JSONObject))
    {
      throw new JsonGenerationException("in end object, expecting start object");
    }

    if (stack.isEmpty())
    {
      currentObject = null;
    }
    else
    {
      currentObject = stack.pop();
    }
  }

  @Override
  public void writeFieldName(String name) throws IOException, JsonGenerationException
  {
    fieldName = name;
  }

  @Override
  public void writeString(String text) throws IOException, JsonGenerationException
  {
    if (currentObject instanceof JSONObject)
    {
      assertFieldName("write string");

      ((JSONObject) currentObject).put(fieldName, text);
    }
    else
    {
      ((JSONArray) currentObject).add(text);
    }
  }

  @Override
  public void writeString(char[] text, int offset, int len) throws IOException, JsonGenerationException
  {
    writeString(new String(text, offset, len));
  }

  @Override
  public void writeNumber(int v) throws IOException, JsonGenerationException
  {
    if (currentObject instanceof JSONObject)
    {
      assertFieldName("write int number");
      ((JSONObject) currentObject).put(fieldName, v);
    }
    else
    {
      ((JSONArray) currentObject).add(v);
    }
  }

  @Override
  public void writeNumber(long v) throws IOException, JsonGenerationException
  {
    if (currentObject instanceof JSONObject)
    {
      assertFieldName("write long number");
      ((JSONObject) currentObject).put(fieldName, v);
    }
    else
    {
      ((JSONArray) currentObject).add(v);
    }
  }

  @Override
  public void writeNumber(BigInteger v) throws IOException, JsonGenerationException
  {
    if (currentObject instanceof JSONObject)
    {
      assertFieldName("write BigInteger");
      ((JSONObject) currentObject).put(fieldName, v);
    }
    else
    {
      ((JSONArray) currentObject).add(v);
    }
  }

  @Override
  public void writeNumber(double d) throws IOException, JsonGenerationException
  {
    if (currentObject instanceof JSONObject)
    {
      assertFieldName("write double number");
      ((JSONObject) currentObject).put(fieldName, d);
    }
    else
    {
      ((JSONArray) currentObject).add(d);
    }
  }

  @Override
  public void writeNumber(float f) throws IOException, JsonGenerationException
  {
    if (currentObject instanceof JSONObject)
    {
      assertFieldName("write float number");
      ((JSONObject) currentObject).put(fieldName, f);
    }
    else
    {
      ((JSONArray) currentObject).add(f);
    }
  }

  @Override
  public void writeNumber(BigDecimal dec) throws IOException, JsonGenerationException
  {
    if (currentObject instanceof JSONObject)
    {
      assertFieldName("write BigDecimal");
      ((JSONObject) currentObject).put(fieldName, dec);
    }
    else
    {
      ((JSONArray) currentObject).add(dec);
    }
  }

  @Override
  public void writeNumber(String encodedValue) throws IOException, JsonGenerationException, UnsupportedOperationException
  {
    writeString(encodedValue);
  }

  @Override
  public void writeBoolean(boolean state) throws IOException, JsonGenerationException
  {
    if (currentObject instanceof JSONObject)
    {
      assertFieldName("write boolean");
      ((JSONObject) currentObject).put(fieldName, state);
    }
    else
    {
      ((JSONArray) currentObject).add(state);
    }
  }

  @Override
  public void writeNull() throws IOException, JsonGenerationException
  {
    if (currentObject instanceof JSONObject)
    {
      assertFieldName("write null");
      ((JSONObject) currentObject).put(fieldName, null);
    }
    else
    {
      ((JSONArray) currentObject).add(null);
    }
  }

  /**
   * Copies current event(token) from parser.
   */
  @Override
  public void copyCurrentEvent(JsonParser jp) throws IOException, JsonProcessingException
  {
    switch (jp.getCurrentToken())
      {
        case START_OBJECT :
          writeStartObject();
          break;
        case END_OBJECT :
          writeEndObject();
          break;
        case START_ARRAY :
          writeStartArray();
          break;
        case END_ARRAY :
          writeEndArray();
          break;
        case FIELD_NAME :
          writeFieldName(jp.getCurrentName());
          break;
        case VALUE_STRING :
          // for this generator, 2 writeString()'s are the same, so don't bother jp.hasTextCharacters()
          writeString(jp.getText());
          break;
        case VALUE_NUMBER_INT :
          switch (jp.getNumberType())
            {
              case INT :
                writeNumber(jp.getIntValue());
                break;
              case BIG_INTEGER :
                writeNumber(jp.getBigIntegerValue());
                break;
              default:
                writeNumber(jp.getLongValue());
            }
          break;
        case VALUE_NUMBER_FLOAT :
          switch (jp.getNumberType())
            {
              case BIG_DECIMAL :
                writeNumber(jp.getDecimalValue());
                break;
              case FLOAT :
                writeNumber(jp.getFloatValue());
                break;
              default:
                writeNumber(jp.getDoubleValue());
            }
          break;
        case VALUE_TRUE :
          writeBoolean(true);
          break;
        case VALUE_FALSE :
          writeBoolean(false);
          break;
        case VALUE_NULL :
          writeNull();
          break;
        case VALUE_EMBEDDED_OBJECT :
          throw new UnsupportedOperationException("writing VALUE_EMBEDDED_OBJECT is not supported");
        default:
          throw new IllegalStateException("never here");
      }
  }

  /**
   * <p>
   * Copies whole structure from parser.
   * <p>
   * Document from {@link JsonGenerator}:
   * <p>
   * <i> Method for copying contents of the current event <b>and following events that it encloses</b> the given parser instance points to.
   * <p>
   * So what constitutes enclosing? Here is the list of events that have associated enclosed events that will get copied:
   * <ul>
   * <li>{@link JsonToken#START_OBJECT}: all events up to and including matching (closing) {@link JsonToken#END_OBJECT} will be copied</li>
   * <li>{@link JsonToken#START_ARRAY} all events up to and including matching (closing) {@link JsonToken#END_ARRAY} will be copied</li>
   * <li>{@link JsonToken#FIELD_NAME} the logical value (which can consist of a single scalar value; or a sequence of related events for
   * structured types (Json Arrays, Objects)) will be copied along with the name itself. So essentially the whole <b>field entry</b> (name
   * and value) will be copied.</li>
   * </ul>
   * <p>
   * After calling this method, parser will point to the <b>last event</b> that was copied. This will either be the event parser already
   * pointed to (if there were no enclosed events), or the last enclosed event copied.
   * 
   */
  @Override
  public void copyCurrentStructure(JsonParser jp) throws IOException, JsonProcessingException
  {
    JsonToken token = jp.getCurrentToken();

    // jump over field
    if (token == JsonToken.FIELD_NAME)
    {
      writeFieldName(jp.getCurrentName());
      token = jp.nextToken();
    }

    switch (token)
      {
        case START_OBJECT :
          if (this.isPackRows == true && this.levelInRows > 0)
          {
            StringWriter out = new StringWriter();
            JsonGenerator generator = jsonFactory.createJsonGenerator(out);
            generator.copyCurrentStructure(jp);
            generator.close();
            // JSONObject rawjson = new JSONObject();
            // rawjson.put("rawjson",out.toString());
            ((JSONObject) currentObject).put(fieldName, out.toString());
            // System.out.println(fieldName + ":" + out);
            break;
          }
          writeStartObject();
          if (this.fieldName != null && this.fieldName.equals(ConversionConstant.ROWS))
          {
            this.levelInRows = 1;
            while (jp.nextToken() != JsonToken.END_OBJECT)
            {
              copyCurrentStructure(jp);
            }
            this.levelInRows = 0;
          }
          else
          {
            while (jp.nextToken() != JsonToken.END_OBJECT)
            {
              copyCurrentStructure(jp);
            }
          }
          writeEndObject();
          break;
        case START_ARRAY :
          writeStartArray();
          while (jp.nextToken() != JsonToken.END_ARRAY)
          {
            copyCurrentStructure(jp);
          }
          writeEndArray();
          break;
        default:
          copyCurrentEvent(jp);
      }
  }

  @Override
  public void flush() throws IOException
  {
    // nothing to do
  }

  @Override
  public boolean isClosed()
  {
    return closed;
  }

  @Override
  public void close() throws IOException
  {
    // nothing to do
    closed = true;
  }

  private void assertFieldName(String context) throws JsonGenerationException
  {
    if (rootObject == null)
    {
      throw new JsonGenerationException("in " + context + ", expecting root object.");
    }
    if (currentObject == null)
    {
      throw new JsonGenerationException("in " + context + ", JSONObject is already closed.");
    }
    if (fieldName == null)
    {
      throw new JsonGenerationException("in " + context + ", expecting field name.");
    }
  }

  public JSONObject getRootObject()
  {
    return rootObject;
  }

  public JSONArtifact getCurrentObject()
  {
    return currentObject;
  }

  public JSONArtifact peekObject()
  {
    return stack.peek();
  }

  /* method below is not supported */
  @Override
  public JsonGenerator enable(Feature f)
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public JsonGenerator disable(Feature f)
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isEnabled(Feature f)
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public JsonGenerator setCodec(ObjectCodec oc)
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public ObjectCodec getCodec()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public JsonGenerator useDefaultPrettyPrinter()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeRawUTF8String(byte[] text, int offset, int length) throws IOException, JsonGenerationException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeUTF8String(byte[] text, int offset, int length) throws IOException, JsonGenerationException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeRaw(String text) throws IOException, JsonGenerationException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeRaw(String text, int offset, int len) throws IOException, JsonGenerationException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeRaw(char[] text, int offset, int len) throws IOException, JsonGenerationException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeRaw(char c) throws IOException, JsonGenerationException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeRawValue(String text) throws IOException, JsonGenerationException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeRawValue(String text, int offset, int len) throws IOException, JsonGenerationException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeRawValue(char[] text, int offset, int len) throws IOException, JsonGenerationException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeBinary(Base64Variant b64variant, byte[] data, int offset, int len) throws IOException, JsonGenerationException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeObject(Object pojo) throws IOException, JsonProcessingException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public void writeTree(JsonNode rootNode) throws IOException, JsonProcessingException
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public JsonStreamContext getOutputContext()
  {
    throw new UnsupportedOperationException();
  }
}
