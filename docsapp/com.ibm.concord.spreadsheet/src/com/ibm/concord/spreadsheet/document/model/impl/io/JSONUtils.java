package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.IOException;
import java.io.OutputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.codehaus.jackson.JsonEncoding;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.JsonToken;

import com.ibm.concord.spreadsheet.document.model.impl.io.swap.IRawDataStorageAdapter;
import com.ibm.concord.spreadsheet.partialload.JSONObjectGenerator;
import com.ibm.json.java.JSONObject;

public class JSONUtils
{
  private static final Logger LOG = Logger.getLogger(Serializer.class.getName());

  /**
   * Reads for every ( key: value ) pair from the JSON object jp currently in call IFieldHandler method to handle each pair.
   * 
   * @param <T>
   * @param handler
   * @param jp
   * @throws JsonParseException
   * @throws IOException
   */
  public static <T> void forEachField(IFieldHandler<T> handler, JsonParser jp) throws JsonParseException, IOException
  {
    JsonToken jt = jp.nextToken();
    String field = null;
    while (jt != JsonToken.END_OBJECT)
    {
      if (field == null)
      {
        field = jp.getCurrentName();
      }
      else
      {
        switch (jt)
          {
            case VALUE_STRING :
              handler.onValue(field, jp.getText());
              break;
            case VALUE_NUMBER_INT :
              Number numberValue = jp.getNumberValue();
              // could be int, long or BigInteger
              if (numberValue instanceof Integer)
              {
                handler.onValue(field, numberValue.intValue());
              }
              else if (numberValue instanceof Long)
              {
                handler.onValue(field, numberValue.longValue());
              }
              else
              {
                // bigInteger, count as double
                handler.onValue(field, numberValue.doubleValue());
              }
              break;
            case VALUE_NUMBER_FLOAT :
              handler.onValue(field, jp.getDoubleValue());
              break;
            case VALUE_TRUE :
            case VALUE_FALSE :
              handler.onValue(field, jp.getBooleanValue());
              break;
            case START_OBJECT :
              // the value is a nested JSON def, read as JSONObject
              if (LOG.isLoggable(Level.FINEST))
              {
                LOG.log(
                    Level.FINEST,
                    "Met a nested JSON def for handler {0}, in field {1}, deserialize as a pure JSONObject, remember it is not good for memory.",
                    new Object[] { handler, field });
              }
              JSONObjectGenerator jg = new JSONObjectGenerator();
              jg.copyCurrentStructure(jp);
              handler.onValue(field, jg.getRootObject());
              break;
            default:
              LOG.log(Level.WARNING, "Unexpected JSON datatype {0}.", jt);
              break;
          }

        field = null;
      }
      jt = jp.nextToken();
    }

    handler.onEnd();
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
   * <p>
   * When called with {@link ModifiableJsonParser}, it is possible to make the jg to accept inserted field in a JSON object after inspected every 
   * other fields, before the object ends. This enables caller to postpone the decision about inserting a field after checking all other siblings.
   * This is done by insert fields to {@link ModifiableJsonParser} after a END_OBJECT is read. Although these fields are inserted after END_OBJECT,
   * it is treated specially during copy. It is written to the jg before jg writes an END_OBJECT.
   * 
   */
  public static void copyCurrentStructure(JsonParser jp, JsonGenerator jg, DraftActionGenerator actionGenerator, IDraftActionHandler handler)
      throws IOException, JsonProcessingException
  {
    JsonToken token = jp.getCurrentToken();

    // jump over field
    if (token == JsonToken.FIELD_NAME)
    {
      actionGenerator.onToken(jp, handler);
      jg.writeFieldName(jp.getCurrentName());
      token = jp.nextToken();
    }

    switch (token)
      {
        case START_OBJECT :
          jg.writeStartObject();
          actionGenerator.onToken(jp, handler);
          while (jp.nextToken() != JsonToken.END_OBJECT)
          {
            copyCurrentStructure(jp, jg, actionGenerator, handler);
          }

          actionGenerator.onToken(jp, handler);
          
          if (jp instanceof ModifiableJsonParser)
          {
            ModifiableJsonParser mjp = (ModifiableJsonParser) jp;
            while (mjp.hasInsertedFields())
            {
              // if current mjp still has inserted fields, it is meant to be inserted in current object,
              // but current object is ending, flush it before ends the object
              JsonParser ijp = mjp.insertedFieldAsParser();
              ijp.nextToken();
              while (ijp.getCurrentToken() != null)
              {
                jg.copyCurrentEvent(ijp);
                ijp.nextToken();
              }
              mjp.clearInsertedFields();
            }
          }
          
          jg.writeEndObject();
          break;
        case START_ARRAY :
          jg.writeStartArray();
          actionGenerator.onToken(jp, handler);

          while (jp.nextToken() != JsonToken.END_ARRAY)
          {
            copyCurrentStructure(jp, jg, actionGenerator, handler);
          }

          jg.writeEndArray();
          actionGenerator.onToken(jp, handler);
          break;
        default:
          actionGenerator.onToken(jp, handler);
          jg.copyCurrentEvent(jp);
          break;
      }
  }

  // read current structure of jp into a raw data
  public static IRawDataStorageAdapter storeRawData(JsonFactory jsonFactory, JsonParser jp, boolean useInflater) throws IOException
  {
    IRawDataStorageAdapter rawData;

    if (useInflater)
    {
      rawData = ModelIOFactory.getInstance().getSwapManager().createCompressedRawDataStorage();
    }
    else
    {
      rawData = ModelIOFactory.getInstance().getSwapManager().createRawDataStorage();
    }
    OutputStream rawOut = rawData.getOutputStream();
    JsonGenerator jg = jsonFactory.createJsonGenerator(rawOut, JsonEncoding.UTF8);
    jg.copyCurrentStructure(jp);
    jg.flush();
    rawData.closeOutputStream();
    return rawData;
  }

  /**
   * Handles (key: value) pair inside one JSON object, between START_OBJECT and END_OBJECT.
   * 
   * @author HanBingfeng
   */
  public static interface IFieldHandler<T>
  {
    /**
     * Set a context object. This object usually accept the value set in onValue methods in this interface.
     * 
     * @param o
     */
    public void setContext(T o);

    /**
     * Called when a field: (string) value pair is found.
     * 
     * @param field
     * @param value
     */
    public void onValue(String field, String value);

    /**
     * Called when a field: (int) value pair is found.
     * 
     * @param field
     * @param value
     */
    public void onValue(String field, int value);

    /**
     * Called when a field: (long) value pair is found. Only called when the number is too large to fit in integer.
     * 
     * @param field
     * @param value
     */
    public void onValue(String field, long value);

    /**
     * Called when a field: (double) value pair is found. Only called if the number is too large to fit in float.
     * 
     * @param field
     * @param value
     */
    public void onValue(String field, double value);

    /**
     * Called when a field: (boolean) value pair is found.
     * 
     * @param field
     * @param value
     */
    public void onValue(String field, boolean value);

    /**
     * Called when a field: { ... } value pair is found.
     * 
     * @param field
     * @param value
     */
    public void onValue(String field, JSONObject value);

    /**
     * Called when END_OBJECT is met.
     */
    public void onEnd();
  }
}
