/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload.serialize.impl;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;

import com.ibm.concord.spreadsheet.partialload.serialize.IArrayFilter;
import com.ibm.concord.spreadsheet.partialload.serialize.IObjectFilter;
import com.ibm.concord.spreadsheet.partialload.serialize.IValueHandler;
import com.ibm.concord.spreadsheet.partialload.serialize.IValueHandlerResult;
import com.ibm.concord.spreadsheet.partialload.serialize.IValueHandlerResult.OPERATION;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * Util methods for JSON serialization using Jackson streaming API.
 */
public class SerializationUtils
{
  /**
   * <p>
   * Parse JSON using JsonParser, iterate each token, and conditionaly serialize them. Handy for merging JSON streams.
   * <p>
   * To start, the JSON generator will write a FIELD_NAME in all cases(after a START_OBJECT or START_ARRAY). Make sure to put JSON generator
   * in an correct state.
   * 
   * @param jsonParser
   *          parser to read JSON in
   * @param jsonGenerator
   *          generate to serialize JSON to
   * @param handler
   *          an implementation of {@link IValueHandler} to handle JSON value parser has returned. The handler must return an
   *          IValueHandler.OPERATION.END in some case to end the iteration
   * @throws JsonParseException
   * @throws IOException
   */
  public static void iterateSerializing(JsonParser jsonParser, JsonGenerator jsonGenerator, IValueHandler handler)
      throws JsonParseException, IOException
  {
    JsonToken jsonToken = jsonParser.getCurrentToken();
    // jump to a JSON value (non-FIELD_NAME)
    if (jsonToken == JsonToken.FIELD_NAME)
    {
      jsonToken = jsonParser.nextToken();
    }

    IValueHandlerResult result = null;

    while (result == null || result.getOperation() != OPERATION.OP_RESULT_END)
    {
      result = handler.handle(jsonParser);
      switch (result.getOperation())
        {
          case OP_RESULT_END :
            // do nothing, ends the iteration
            break;
          case OP_ITERATE_DEEPER :
            // move deeper in
            jsonGenerator.writeFieldName(jsonParser.getCurrentName());
            jsonGenerator.writeStartObject();
            // move inside current value
            jsonToken = jsonParser.nextValue();
            iterateSerializing(jsonParser, jsonGenerator, (IValueHandler) result.getContext());
            jsonGenerator.writeEndObject();
            // move to next value for processing
            jsonToken = jsonParser.nextValue();
            break;
          case OP_RESULT_SKIP :
            jsonParser.skipChildren();
            jsonToken = jsonParser.nextValue();
            break;
          case OP_RESULT_TAKE_NEW :
            Object context = result.getContext();
            if (context instanceof JSONObject)
            {
              serializeSection(jsonGenerator, (JSONObject) context);
            }
            else
            {
              serializeSection(jsonGenerator, (JSONArray) context);
            }
            jsonParser.skipChildren();
            jsonToken = jsonParser.nextValue();
            break;
          case OP_RESULT_TAKE_ORIGIN :
            // if current token is START_OBJECT or START_ARRAY, the copy() interace
            // will write START_OBJECT but not the FIELD_NAME, write the field name outside it
            jsonToken = jsonParser.getCurrentToken();
            if (jsonToken != JsonToken.FIELD_NAME)
            {
              jsonGenerator.writeFieldName(jsonParser.getCurrentName());
            }
            jsonGenerator.copyCurrentStructure(jsonParser);
            jsonToken = jsonParser.nextValue();
            break;
          default:
            jsonToken = jsonParser.nextValue();
            break;
        }
    }
    handler.onEnd(jsonParser);
  }

  /**
   * Serialize a JSONArray. It will start by a START_OBJECT, START_ARRAY or a single value. Write a START_ARRY before calling this method.
   * 
   * @param jsonGenerator
   * @param jsonArray
   * @param jsonObjectFilter
   * @param jsonArrayFilter
   * @throws JsonGenerationException
   * @throws IOException
   */
  public static void serializeSection(JsonGenerator jsonGenerator, JSONArray jsonArray, IObjectFilter jsonObjectFilter,
      IArrayFilter jsonArrayFilter) throws JsonGenerationException, IOException
  {
    for (Iterator iterator = jsonArray.iterator(); iterator.hasNext();)
    {
      Object object = (Object) iterator.next();
      if (object instanceof JSONObject)
      {
        JSONObject o = (JSONObject) object;
        if (jsonObjectFilter != null)
        {
          o = jsonObjectFilter.doFilter(null, o);
        }
        if (o != null)
        {
          jsonGenerator.writeStartObject();
          serializeSection(jsonGenerator, o, jsonObjectFilter, jsonArrayFilter);
          jsonGenerator.writeEndObject();
        }
      }
      else if (object instanceof JSONArray)
      {
        JSONArray o = (JSONArray) object;
        if (jsonArrayFilter != null)
        {
          o = jsonArrayFilter.doFilter(null, o);
        }

        if (o != null)
        {
          jsonGenerator.writeStartArray();
          serializeSection(jsonGenerator, o, jsonObjectFilter, jsonArrayFilter);
          jsonGenerator.writeEndArray();
        }
      }
      else
      {
        serializeParts(jsonGenerator, object);
      }
    }
  }

  public static void serializeSection(JsonGenerator jsonGenerator, JSONArray jsonArray) throws JsonGenerationException, IOException
  {
    serializeSection(jsonGenerator, jsonArray, null, null);
  }

  /**
   * serialize jsonObject using current jsonGenerator. It will start by writing FIELD_NAME. Write a START_OBJECT before calling this method.
   * 
   * @param jsonGenerator
   * @param jsonObject
   * @throws IOException
   * @throws JsonGenerationException
   */
  public static void serializeSection(JsonGenerator jsonGenerator, JSONObject jsonObject, IObjectFilter jsonObjectFilter,
      IArrayFilter jsonArrayFilter) throws JsonGenerationException, IOException
  {
    Set<Map.Entry> entries = jsonObject.entrySet();
    for (Iterator iterator = entries.iterator(); iterator.hasNext();)
    {
      Entry entry = (Entry) iterator.next();
      Object o = entry.getValue();
      String key = (String) entry.getKey();
      jsonGenerator.writeFieldName(key);
      if (o instanceof JSONObject)
      {
        JSONObject obj = (JSONObject) o;
        if (jsonObjectFilter != null)
        {
          obj = jsonObjectFilter.doFilter(key, obj);
        }

        if (obj != null)
        {
          jsonGenerator.writeStartObject();
          serializeSection(jsonGenerator, obj, jsonObjectFilter, jsonArrayFilter);
          jsonGenerator.writeEndObject();
        }
      }
      else if (o instanceof JSONArray)
      {
        JSONArray obj = (JSONArray) o;
        if (jsonArrayFilter != null)
        {
          obj = jsonArrayFilter.doFilter(key, obj);
        }
        if (obj != null)
        {
          jsonGenerator.writeStartArray();
          serializeSection(jsonGenerator, obj, jsonObjectFilter, jsonArrayFilter);
          jsonGenerator.writeEndArray();
        }
      }
      else
      {
        serializeParts(jsonGenerator, o);
      }
    }
  }

  /**
   * serialize jsonObject using current jsonGenerator
   * 
   * @param jsonGenerator
   * @param jsonObject
   * @throws IOException
   * @throws JsonGenerationException
   */
  public static void serializeSection(JsonGenerator jsonGenerator, JSONObject jsonObject) throws JsonGenerationException, IOException
  {
    serializeSection(jsonGenerator, jsonObject, null, null);
  }

  /*
   * Generate a part of JSON value.
   */
  private static void serializeParts(JsonGenerator jsonGenerator, Object o) throws JsonGenerationException, IOException
  {
    if (o == null)
    {
      jsonGenerator.writeNull();
    }
    else if (o instanceof String)
    {
      jsonGenerator.writeString((String) o);
    }
    else if (o instanceof Boolean)
    {
      jsonGenerator.writeBoolean((Boolean) o);
    }
    else if (o instanceof Integer)
    {
      jsonGenerator.writeNumber((Integer) o);
    }
    else if (o instanceof Long)
    {
      jsonGenerator.writeNumber((Long) o);
    }
    else if (o instanceof Float)
    {
      jsonGenerator.writeNumber((Float) o);
    }
    else if (o instanceof Double)
    {
      jsonGenerator.writeNumber((Double) o);
    }
    else
    {
      jsonGenerator.writeString(o.toString());
    }
  }
}
