package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.collections.ArrayStack;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;
import org.codehaus.jackson.util.JsonParserDelegate;
import org.codehaus.jackson.util.TokenBuffer;

/**
 * <p>
 * Special JsonParser that can be modified before calling get.
 */
@SuppressWarnings("rawtypes")
public class ModifiableJsonParser extends JsonParserDelegate
{
  private static final Logger LOG = Logger.getLogger(ModifiableJsonParser.class.getName());

  private static final boolean ENABLE_RECORDING_EVENTS = false;

  private String insertedFieldName;

  private Object insertedValue, modifiedValue;

  private LinkedList insertedFields;

  private Set<String> localRemoveFieldNames;

  private Set<String> globalRemoveFieldNames;

  // stack recording plain events read from every level of current JSON stream
  private ArrayStack eventsStack;

  private Map<String, Object> eventsMap;

  // event key and event object
  private String eventFieldName;

  private enum State {
    /**
     * JsonParser "stops" at returning the inserted token field
     */
    AT_INSERTED_FIELD_NAME,
    /**
     * JsonParser "stops" at returning the inserted token value
     */
    AT_INSERTED_VALUE;
  }

  private State state;

  public ModifiableJsonParser(JsonParser d)
  {
    super(d);
    insertedFields = new LinkedList();
    state = null;
    if (ENABLE_RECORDING_EVENTS)
    {
      eventsStack = new ArrayStack();
    }

    localRemoveFieldNames = new HashSet<String>();
    globalRemoveFieldNames = new HashSet<String>();
  }

  /**
   * Answers if current JsonParser has inserted fields.
   * 
   * @return
   */
  public boolean hasInsertedFields()
  {
    return !insertedFields.isEmpty();
  }

  /**
   * Insert a field, which will be returned by this JsonParser later in call nextToken() or nextValue().
   * 
   * @param fn
   * @param v
   */
  @SuppressWarnings("unchecked")
  public void insertField(String fn, Object v)
  {
    insertedFields.add(fn);
    insertedFields.add(v);
  }

  public JsonParser insertedFieldAsParser()
  {
    TokenBuffer tb = new TokenBuffer(null);
    for (Iterator iterator = insertedFields.iterator(); iterator.hasNext();)
    {
      try
      {
        String fn = (String) iterator.next();
        Object v = iterator.next();
        tb.writeFieldName(fn);
        if (v instanceof String)
        {
          tb.writeString((String) v);
        }
        else if (v instanceof Integer)
        {
          tb.writeNumber(((Number) v).intValue());
        }
        else if (v instanceof Long)
        {
          tb.writeNumber(((Number) v).longValue());
        }
        else if (v instanceof Float)
        {
          tb.writeNumber(((Number) v).floatValue());
        }
        else if (v instanceof Double)
        {
          tb.writeNumber(((Number) v).doubleValue());
        }
        else if (v instanceof Boolean)
        {
          tb.writeBoolean((Boolean) v);
        }
        else
        {
          LOG.log(Level.WARNING, "unknown inserted value type {0}, return value as toString() {1}.",
              new Object[] { insertedValue.getClass(), insertedValue.toString() });
          tb.writeString(v.toString());
        }
      }
      catch (JsonGenerationException e)
      {
        // can't happen since we are writing to tokenbuffer
      }
      catch (IOException e)
      {
        // can't happen since we are writing to tokenbuffer
      }
    }
    return tb.asParser();
  }

  public void clearInsertedFields()
  {
    insertedFields.clear();
  }

  /**
   * <p>
   * Modifies current value, the modified value will be returned by this JsonParser later in get* method. This method will not change
   * current or next value token type, so the value type must adhere current token type, otherwise the value will be ignored.
   * <p>
   * The modified value only affects current token, if nextToken() or nextValue() called without get*, the value will be abandoned.
   * 
   * @param value
   */
  public void modifyValue(Object value)
  {
    modifiedValue = value;
  }

  /**
   * <p>
   * Set one fieldName as "local remove", local removed fields will be disabled and cleared once a END event (END_OBJECT and END_ARRAY) is
   * met.
   * <p>
   * Inserted fields will not be removed. Insert and remove fields with same name will "replace" the field.
   * 
   * @param fieldName
   */
  public void localRemove(String fieldName)
  {
    localRemoveFieldNames.add(fieldName);
  }

  /**
   * <p>
   * Set one fieldName as "global remove", global removed fields will not be disabled and cleared automatically. Can only be removed by
   * cancelGlobalRemove()
   * <p>
   * Inserted fields will not be removed. Insert and remove fields with same name will "replace" the field.
   * 
   * @param fieldName
   */
  public void globalRemove(String fieldName)
  {
    globalRemoveFieldNames.add(fieldName);
  }

  /**
   * Cancel one field name's global removed state.
   * 
   * @param fieldName
   */
  public void cancelGlobalRemove(String fieldName)
  {
    globalRemoveFieldNames.remove(fieldName);
  }

  /**
   * Check if for the current level, a plain field with the name fieldName has parsed and returned.
   * 
   * @param fieldName
   * @return
   */
  public Object getParsedValue(String fieldName)
  {
    if (ENABLE_RECORDING_EVENTS)
    {
      return eventsMap.get(fieldName);
    }
    else
    {
      return null;
    }
  }

  /**
   * Get current value as a generic Java object.
   * 
   * @return
   * @throws IOException
   * @throws JsonParseException
   */
  public Object getValueAsObject() throws JsonParseException, IOException
  {
    Object v;

    switch (getCurrentToken())
      {
        case VALUE_TRUE :
        case VALUE_FALSE :
          return getBooleanValue();
        case VALUE_STRING :
          return getText();
        case VALUE_NUMBER_INT :
          v = getLongValue();
          return v;
        case VALUE_NUMBER_FLOAT :
          v = getDoubleValue();
          return v;
        case VALUE_NULL :
        default:
          return null;
      }
  }

  @Override
  public String getText() throws IOException, JsonParseException
  {
    String ret;
    if ((ret = getValue(String.class)) != null)
    {
      return ret;
    }

    return super.getText();
  }

  @Override
  public BigInteger getBigIntegerValue() throws IOException, JsonParseException
  {
    BigInteger ret;
    if ((ret = getValue(BigInteger.class)) != null)
    {
      return ret;
    }

    return super.getBigIntegerValue();
  }

  @Override
  public byte getByteValue() throws IOException, JsonParseException
  {
    Byte ret;
    if ((ret = getValue(Byte.class)) != null)
    {
      return ret;
    }

    return super.getByteValue();
  }

  @Override
  public short getShortValue() throws IOException, JsonParseException
  {
    Short ret;
    if ((ret = getValue(Short.class)) != null)
    {
      return ret;
    }

    return super.getShortValue();
  }

  @Override
  public BigDecimal getDecimalValue() throws IOException, JsonParseException
  {
    BigDecimal ret;
    if ((ret = getValue(BigDecimal.class)) != null)
    {
      return ret;
    }

    return super.getDecimalValue();
  }

  @Override
  public double getDoubleValue() throws IOException, JsonParseException
  {
    Double ret;
    if ((ret = getValue(Double.class)) != null)
    {
      return ret;
    }

    return super.getDoubleValue();
  }

  @Override
  public float getFloatValue() throws IOException, JsonParseException
  {
    Float ret;
    if ((ret = getValue(Float.class)) != null)
    {
      return ret;
    }

    return super.getFloatValue();
  }

  @Override
  public int getIntValue() throws IOException, JsonParseException
  {
    Integer ret;
    if ((ret = getValue(Integer.class)) != null)
    {
      return ret;
    }

    return super.getIntValue();
  }

  @Override
  public long getLongValue() throws IOException, JsonParseException
  {
    Long ret;
    if ((ret = getValue(Long.class)) != null)
    {
      return ret;
    }

    return super.getLongValue();
  }

  @Override
  public Number getNumberValue() throws IOException, JsonParseException
  {
    Number ret;
    if ((ret = getValue(Number.class)) != null)
    {
      return ret;
    }

    return super.getNumberValue();
  }
  
  public boolean getBooleanValue() throws IOException, JsonParseException
  {
    Boolean ret;
    if ((ret = getValue(Boolean.class)) != null)
    {
      return ret;
    }

    return super.getBooleanValue();
  }

  @Override
  public String getCurrentName() throws IOException, JsonParseException
  {
    if (state != null)
    {
      return insertedFieldName;
    }
    else
    {
      String name = null;
      if ((name = getValue(String.class)) != null)
        return name;
      return super.getCurrentName();
    }
  }

  @Override
  public JsonToken getCurrentToken()
  {
    if (modifiedValue != null)
    {
      if (modifiedValue instanceof Float || modifiedValue instanceof Double)
      {
        return JsonToken.VALUE_NUMBER_FLOAT;
      }
      else if (modifiedValue instanceof Long || modifiedValue instanceof Integer)
      {
        return JsonToken.VALUE_NUMBER_INT;
      }
      else if (modifiedValue instanceof String)
      {
        return JsonToken.VALUE_STRING;
      }
      else if (modifiedValue instanceof Boolean)
      {
        if (Boolean.TRUE.equals(modifiedValue))
        {
          return JsonToken.VALUE_TRUE;
        }
        else
        {
          return JsonToken.VALUE_FALSE;
        }
      }
      // else, return currToken
    }
    return _currToken;
  }
  
  @Override
  public NumberType getNumberType() throws IOException, JsonParseException
  {
    if (modifiedValue != null)
    {
      if (modifiedValue instanceof Long)
      {
        return NumberType.LONG;
      }
      else if (modifiedValue instanceof Integer)
      {
        return NumberType.INT;
      }
      else if (modifiedValue instanceof Float)
      {
        return NumberType.FLOAT;
      }
      else
      {
        // return everything else as double
        return NumberType.DOUBLE;
      }
    }

    return delegate.getNumberType();
  }

  @Override
  public JsonToken nextToken() throws IOException, JsonParseException
  {
    // reset modified value
    if (modifiedValue != null)
    {
      modifiedValue = null;
    }

    if (state == null)
    {
      // no inserted values
      if (_currToken == JsonToken.FIELD_NAME)
      {
        // next would be the original value after previous field
        _currToken = super.nextToken();
      }
      else
      {
        if (!insertedFields.isEmpty())
        {
          // have inserted fields,
          insertedFieldName = (String) insertedFields.poll();
          insertedValue = insertedFields.poll();
          state = State.AT_INSERTED_FIELD_NAME;
          _currToken = JsonToken.FIELD_NAME;
        }
        else
        {
          _currToken = super.nextToken();
        }
      }
    }
    else
    {
      // deal with inserted fields
      if (state == State.AT_INSERTED_FIELD_NAME)
      {
        state = State.AT_INSERTED_VALUE;
        if (insertedValue instanceof String)
        {
          _currToken = JsonToken.VALUE_STRING;
        }
        else if (insertedValue instanceof Integer || insertedValue instanceof Long)
        {
          _currToken = JsonToken.VALUE_NUMBER_INT;
        }
        else if (insertedValue instanceof Float || insertedValue instanceof Double)
        {
          _currToken = JsonToken.VALUE_NUMBER_FLOAT;
        }
        else if (insertedValue instanceof Boolean)
        {
          if ((Boolean) insertedValue)
          {
            _currToken = JsonToken.VALUE_TRUE;
          }
          else
          {
            _currToken = JsonToken.VALUE_FALSE;
          }
        }
        else
        {
          LOG.log(Level.WARNING, "unknown inserted value type {0}, return value as toString() {1}.",
              new Object[] { insertedValue.getClass(), insertedValue.toString() });
          insertedValue = insertedValue.toString();
          _currToken = JsonToken.VALUE_STRING;
        }
      }
      else
      {
        // state == State.AT_INSERTED_VALUE
        if (!insertedFields.isEmpty())
        {
          // have more inserted fields,
          insertedFieldName = (String) insertedFields.pop();
          insertedValue = insertedFields.pop();
          state = State.AT_INSERTED_FIELD_NAME;
          _currToken = JsonToken.FIELD_NAME;
        }
        else
        {
          state = null;
          _currToken = super.nextToken();
        }
      }
    }

    // check if current token is a removed field, but don't remove inserted field
    if (_currToken == JsonToken.FIELD_NAME && state == null)
    {
      String name = getCurrentName();
      if (globalRemoveFieldNames.contains(name) || localRemoveFieldNames.contains(name))
      {
        // hit removed field name, skip whole structure
        // skip one token
        _currToken = nextToken();
        if (_currToken == JsonToken.START_ARRAY || _currToken == JsonToken.START_OBJECT)
        {
          // skip whole structure
          skipChildren();
          // now jp points to the corresponding end event, skip this event
          _currToken = nextToken();
        }
        else
        {
          // jp points to a plain event, skip it
          _currToken = nextToken();
        }

        // now _currToken is got from current overridden nextToken(), all necessary process about recording, etc is already
        // done, return now
        return _currToken;
      }
      // else, keep this field
    }
    // else, no check removal

    // _currToken is determined to be returned, and recorded
    if (_currToken != null)
    {
      switch (_currToken)
        {
          case START_OBJECT :
            if (ENABLE_RECORDING_EVENTS)
            {
              // start recording events map
              eventsMap = new HashMap<String, Object>();
              eventsStack.push(eventsMap);
              // clear event field name since it is a complex structure
              eventFieldName = null;
            }
            break;
          case END_OBJECT :
            if (ENABLE_RECORDING_EVENTS)
            {
              eventsStack.pop();
              if (eventsStack.isEmpty())
              {
                // matching the root object end, nothing to read after this,
                eventsMap = null;
              }
              else
              {
                eventsMap = (Map<String, Object>) eventsStack.peek();
              }
            }
            // continue to END_ARRAY
          case END_ARRAY :
            // end event met, clear local removes
            localRemoveFieldNames.clear();
            break;
          case FIELD_NAME :
            if (ENABLE_RECORDING_EVENTS)
            {
              eventFieldName = getCurrentName();
            }
            break;
          case VALUE_TRUE :
          case VALUE_FALSE :
          case VALUE_NUMBER_INT :
          case VALUE_NUMBER_FLOAT :
          case VALUE_STRING :
          case VALUE_NULL :
            if (ENABLE_RECORDING_EVENTS)
            {
              if (eventFieldName != null && eventsMap != null)
              {
                eventsMap.put(eventFieldName, getValueAsObject());
              }
            }
            break;
          default:
            // clear eventFieldName for it is a complex structure
            if (ENABLE_RECORDING_EVENTS)
            {
              eventFieldName = null;
            }
        }
    }

    return _currToken;
  }

  private <T> T getValue(Class<T> clazz) throws JsonParseException, IOException
  {
    // if there's modifiedValue set, return modifiedValue instead
    if (modifiedValue != null)
    {
      if (clazz.isInstance(modifiedValue))
      {
        return clazz.cast(modifiedValue);
      }
      // else, modifiedValue can't be used
    }
    // no modified value, check inserted token

    if (state != null)
    {
      if (clazz.isInstance(insertedValue))
      {
        return clazz.cast(insertedValue);
      }
      else
      {
        throw new JsonParseException("wrong cast inserted value", getCurrentLocation());
      }
    }

    // no modified stuff, fall back to default
    return null;
  }
}
