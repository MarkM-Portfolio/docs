/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.JsonToken;
import org.codehaus.jackson.impl.JsonGeneratorBase;
import org.codehaus.jackson.util.JsonGeneratorDelegate;

/**
 * <p>
 * {@link JsonGenerator} implementation that generates JSON events. It is a {@link JsonGeneratorDelegate}. It delegates all method calls to
 * underlying {@link JsonGenerator} while generating event calls.
 * <p>
 * For most efficiency, doesn't use {@link JsonGeneratorBase}, validity check is done internally.
 * <p>
 * Doesn't support <strong>any</strong> features. Only <code>write*</code> methods are implemented.
 */
public class JSONEventGenerator extends JsonGeneratorDelegate
{
  private static final Logger LOG = Logger.getLogger(JSONEventGenerator.class.getName());

  private List<AbstractJsonGeneratorListener> listeners;

  public JSONEventGenerator(JsonGenerator d)
  {
    super(d);
  }

  public void addListener(AbstractJsonGeneratorListener listener)
  {
    if (listener == null)
    {
      return;
    }

    if (listeners == null)
    {
      listeners = new ArrayList<AbstractJsonGeneratorListener>();
    }
    listeners.add(listener);
  }

  @Override
  public void writeStartObject() throws IOException, JsonGenerationException
  {
    if (listeners != null)
    {
      for (AbstractJsonGeneratorListener l : listeners)
      {
        l.onStartObject();
      }
    }

    delegate.writeStartObject();
  }

  @Override
  public void writeEndObject() throws IOException, JsonGenerationException
  {
    if (listeners != null)
    {
      for (AbstractJsonGeneratorListener l : listeners)
      {
        l.onEndObject();
      }
    }

    delegate.writeEndObject();
  }

  @Override
  public void writeFieldName(String name) throws IOException, JsonGenerationException
  {
    if (listeners != null)
    {
      for (AbstractJsonGeneratorListener l : listeners)
      {
        l.onFieldName(name);
      }
    }

    delegate.writeFieldName(name);
  }

  @Override
  public void writeString(String text) throws IOException, JsonGenerationException
  {
    if (listeners != null)
    {
      for (AbstractJsonGeneratorListener l : listeners)
      {
        text = l.onString(text);
      }
    }

    delegate.writeString(text);
  }

  @Override
  public void writeNumber(int v) throws IOException, JsonGenerationException
  {
    onWriteNumber(v);
    
    delegate.writeNumber(v);
  }

  @Override
  public void writeNumber(long v) throws IOException, JsonGenerationException
  {
    onWriteNumber(v);

    delegate.writeNumber(v);
  }

  @Override
  public void writeNumber(BigInteger v) throws IOException, JsonGenerationException
  {
    onWriteNumber(v);

    delegate.writeNumber(v);
  }

  @Override
  public void writeNumber(double d) throws IOException, JsonGenerationException
  {
    onWriteNumber(d);

    delegate.writeNumber(d);
  }

  @Override
  public void writeNumber(float f) throws IOException, JsonGenerationException
  {
    onWriteNumber(f);

    delegate.writeNumber(f);
  }

  @Override
  public void writeNumber(BigDecimal dec) throws IOException, JsonGenerationException
  {
    onWriteNumber(dec);

    delegate.writeNumber(dec);
  }

  @Override
  public void writeBoolean(boolean state) throws IOException, JsonGenerationException
  {
    if (listeners != null)
    {
      for (AbstractJsonGeneratorListener l : listeners)
      {
        l.onWriteBoolean(state);
      }
    }

    delegate.writeBoolean(state);
  }

  private void onWriteNumber(Number n)
  {
    if (listeners != null)
    {
      for (AbstractJsonGeneratorListener l : listeners)
      {
        l.onWriteNumber(n);
      }
    }
  }

  @Override
  public void writeNull() throws IOException, JsonGenerationException
  {
    if (listeners != null)
    {
      for (AbstractJsonGeneratorListener l : listeners)
      {
        l.onWriteNull();
      }
    }

    delegate.writeNull();
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
          writeStartObject();
          while (jp.nextToken() != JsonToken.END_OBJECT)
          {
            copyCurrentStructure(jp);
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
}