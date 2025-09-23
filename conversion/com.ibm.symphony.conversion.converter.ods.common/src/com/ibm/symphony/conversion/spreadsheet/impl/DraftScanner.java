package com.ibm.symphony.conversion.spreadsheet.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.builder.ToStringBuilder;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.impl.DraftScanner.Actions;
import com.ibm.symphony.conversion.spreadsheet.impl.DraftScanner.RangeHandler;

public class DraftScanner
{
  private static Logger LOG = Logger.getLogger(DraftScanner.class.getName());

  private State state;

  private String fieldName;

  private Rule root, current, next;

  private List<Rule> ruleStack;

  private List<String> fieldPathStack;

  DraftActionHandler handler;

  private JsonFactory jsonFactory;

  public DraftScanner()
  {
    fieldPathStack = new ArrayList<String>();
    ruleStack = new ArrayList<Rule>();
    handler = new DraftActionHandler();
    // construct rules for unname range

    // "unnames": {
    // "*": {
    // "__action__": "CONTENT_UNNAME"
    // }
    // },
    root = new Rule();
    root.action = Actions.NO_ACTION;
    Rule unnamesRules = new Rule();
    root.nextRuleMap = new HashMap<String, Rule>();
    root.nextRuleMap.put(ConversionConstant.UNNAME_RANGE, unnamesRules);
    Rule unnamesRule = new Rule();
    unnamesRule.action = Actions.CONTENT_UNNAME;
    unnamesRules.next = unnamesRule;
  }

  public void scan(File file) throws JsonParseException, IOException
  {
    JsonParser jp = null;
    try
    {
      FileInputStream is = new FileInputStream(file);
      jsonFactory = new JsonFactory();
      jp = jsonFactory.createJsonParser(is);
      JsonToken jt = jp.nextToken();
      while (jt != null)
      {
        if (onToken(jp))
          jt = jp.getCurrentToken();
        else
          jt = jp.nextToken();
      }
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.WARNING, "draft scan error due to file can not be found in path" + file != null ? file.getAbsolutePath() : "null");
    }
    finally
    {
      if(jp != null)
        jp.close();
    }
  }

  public JSONObject getPreserveRanges()
  {
    return handler.ranges;
  }

  /**
   * Called for every token a JsonParser had met when parsing a draft JSON. The method then generates draft actions and calls method defiend
   * in {@link IDraftActionHandler}.
   * 
   * @return true if the method had moved JsonPraser, false otherwise.
   */
  public boolean onToken(JsonParser jp) throws JsonParseException, IOException
  {
    JsonToken jt = jp.getCurrentToken();

    boolean moved = false;

    if (state == null)
    {
      if (jt == JsonToken.START_OBJECT)
      {
        state = State.IN_OBJECT;
        current = root;
        moved = false;
      }
    }
    else
    {
      switch (state)
        {
          case FIELD_NAME :
            switch (jt)
              {
                case VALUE_EMBEDDED_OBJECT :
                case VALUE_FALSE :
                case VALUE_NULL :
                case VALUE_NUMBER_FLOAT :
                case VALUE_NUMBER_INT :
                case VALUE_STRING :
                case VALUE_TRUE :
                case START_ARRAY :
                  fieldPathStack.add(fieldName);
                  if (next != null)
                  {
                    handler.onAction(fieldPathStack, next.action, jp);
                    next = null;
                  }
                  fieldPathStack.remove(fieldPathStack.size() - 1);
                  state = State.IN_OBJECT;
                  moved = false;
                  break;
                case START_OBJECT :
                  // go deeper in json content, check next rule
                  fieldPathStack.add(fieldName);
                  ruleStack.add(current);
                  if (next == null)
                  {
                    // next rule is null, we don't know what to do for next, quit
                    jp.skipChildren();
                  }
                  else
                  {
                    // apply current action
                    handler.onAction(fieldPathStack, next.action, jp);
                    current = next;
                    next = null;
                  }
                  state = State.IN_OBJECT;
                  moved = true;
                  break;
                default:
                  // no interest
                  moved = false;
                  break;
              }
            break;
          case IN_OBJECT :
            switch (jt)
              {
                case FIELD_NAME :
                  fieldName = jp.getCurrentName();
                  if (current != null)
                  {
                    if (current.next != null)
                    {
                      // current rule has a "*" route assigned
                      next = current.next;
                    }
                    else if (current.nextRuleMap != null)
                    {
                      next = current.nextRuleMap.get(fieldName);
                    }
                    if (next != null)
                      handler.onFieldName(next.action, jp);
                  }
                  state = State.FIELD_NAME;
                  moved = false;
                  break;
                case END_OBJECT :
                  if (current != null)
                    handler.postAction(fieldPathStack, current.action, jp);
                  if (!fieldPathStack.isEmpty())
                  {
                    fieldPathStack.remove(fieldPathStack.size() - 1);
                  }
                  fieldName = null;
                  if (!ruleStack.isEmpty())
                  {
                    current = (Rule) ruleStack.remove(ruleStack.size() - 1);
                  }
                  else
                  {
                    current = null;
                  }
                  next = null;
                  moved = false;
                  break;
                default:
                  // no interest
                  moved = false;
                  break;
              }
            break;
          default:
            // never here
            break;
        }
    }

    return moved;
  }

  private enum State {
    IN_OBJECT, FIELD_NAME
  };

  public static class Rule
  {
    public Actions action = Actions.NO_ACTION;

    public Rule next = null;

    public Map<String, Rule> nextRuleMap = null;

    public String toString()
    {
      return new ToStringBuilder(this) //
          .append("action", action) //
          .append("next", next) //
          .append("nextRuleMap", nextRuleMap).toString();
    }
  }

  /**
   * Enums every important part in the draft JSON. These part acts like actions needs to take during deserialization.
   */
  public enum Actions {
    NO_ACTION, //
    /**
     * "unames": { "(name)": { ...
     */
    CONTENT_UNNAME
  }

  /**
   * Reads for every ( key: value ) pair from the JSON object jp currently in call IFieldHandler method to handle each pair.
   * 
   * @param <T>
   * @param handler
   * @param jp
   * @throws JsonParseException
   * @throws IOException
   */
  public static <T> void forEachField(IFieldHandler<T> handler, JsonParser jp, JsonFactory factory) throws JsonParseException, IOException
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
              JSONObjectGenerator jg = new JSONObjectGenerator(factory);
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

  public static class RangeHandler implements IFieldHandler<JSONObject>
  {
    protected JSONObject range;

    private RangeType usage;

    private String rangeAddress;

    private JSONObject data;

    public void setContext(JSONObject o)
    {
      range = o;
      rangeAddress = null;
      usage = null;
      data = null;
    }

    @Override
    public void onValue(String field, String value)
    {
      if (ConversionConstant.RANGE_USAGE.equals(field))
      {
        usage = RangeType.enumValueOf(value);
      }
      else if (ConversionConstant.RANGE_ADDRESS.equals(field))
      {
        rangeAddress = value;
      }
    }

    @Override
    public void onValue(String field, JSONObject value)
    {
      if (ConversionConstant.DATAFILED.equals(field))
      {
        data = value;
      }
    }

    @Override
    public void onEnd()
    {
      if (rangeAddress != null && (usage == RangeType.COMMENT || usage == RangeType.TASK))
      {
        range.put(ConversionConstant.RANGE_ADDRESS, rangeAddress);
        range.put(ConversionConstant.RANGE_USAGE, usage.toString());
        if (data != null)
          range.put(ConversionConstant.DATAFILED, data);
      }
    }

    @Override
    public void onValue(String field, int value)
    {
    }

    @Override
    public void onValue(String field, long value)
    {
    }

    @Override
    public void onValue(String field, double value)
    {
    }

    @Override
    public void onValue(String field, boolean value)
    {
    }
  }
}

class DraftActionHandler implements IDraftHandler
{
  RangeHandler rangeHandler = new RangeHandler();

  private JsonFactory factory;

  public void setJsonFactory(JsonFactory f)
  {
    factory = f;
  }

  // result
  public JSONObject ranges = new JSONObject();

  @Override
  public void onAction(List<String> fieldPath, Actions action, JsonParser jp) throws JsonParseException, IOException
  {
    switch (action)
      {
        case NO_ACTION :
          break;
        case CONTENT_UNNAME :
          String id = fieldPath.get(1);
          JSONObject range = new JSONObject();
          rangeHandler.setContext(range);
          DraftScanner.forEachField(rangeHandler, jp, factory);
          if (!range.isEmpty())
            ranges.put(id, range);
          break;
        default:
          break;
      }
  }

  @Override
  public void onFieldName(Actions action, JsonParser jp) throws JsonParseException, IOException
  {
  }

  @Override
  public void postAction(List<String> fieldPath, Actions action, JsonParser jp)
  {
  }

}
