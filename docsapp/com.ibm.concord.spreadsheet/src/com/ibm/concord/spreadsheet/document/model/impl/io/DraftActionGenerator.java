package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.IOException;

import org.apache.commons.collections.ArrayStack;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;

import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory.Rule;

/**
 * The generator reads draft JSON and generate actions described in {@link Actions}.
 */
public class DraftActionGenerator
{
  private ArrayStack ruleStack;

  private ArrayStack fieldPathStack;

  private Rule root, current, next;

  private State state;
  
  private String fieldName;

  public DraftActionGenerator()
  {
    ruleStack = new ArrayStack();
    fieldPathStack = new ArrayStack();
  }

  public void setRootRule(Rule rootRule)
  {
    this.root = rootRule;
    ruleStack.clear();
    fieldPathStack.clear();
    state = null;
    current = null;
    next = null;
  }

  /**
   * Called for every token a JsonParser had met when parsing a draft JSON. The method then generates draft actions and calls method defiend
   * in {@link IDraftActionHandler}.
   * 
   * @return true if the method had moved JsonPraser, false otherwise.
   */
  public boolean onToken(JsonParser jp, IDraftActionHandler handler) throws JsonParseException, IOException
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
                  fieldPathStack.push(fieldName);
                  handler.onAction(fieldPathStack, next.action, jp);
                  next = null;
                  fieldPathStack.pop();
                  state = State.IN_OBJECT;
                  moved = false;
                  break;
                case START_OBJECT :
                  // go deeper in json content, check next rule
                  fieldPathStack.push(fieldName);
                  if (next == null)
                  {
                    // wrong state, next rule is null, we don't know what to do for next, quit
                    throw new IllegalStateException("Met START_OBJECT without next rule. Path: " + fieldPathStack);
                  }
                  ruleStack.push(current);
                  // apply current action
                  handler.onAction(fieldPathStack, next.action, jp);
                  current = next;
                  next = null;
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
                  if (current.next != null)
                  {
                    // current rule has a "*" route assigned
                    next = current.next;
                  }
                  else
                  {
                    next = current.nextRuleMap.get(fieldName);
                    if (next == null)
                    {
                      // wrong state, JSON has an unexpected FIELD_NAME, we don't know how to deal with it
                      throw new IllegalStateException("Met unknown field name " + fieldName + ". Path: " + fieldPathStack);
                    }
                  }
                  handler.onFieldName(next.action, jp);
                  state = State.FIELD_NAME;
                  moved = false;
                  break;
                case END_OBJECT :
                  handler.postAction(fieldPathStack, current.action, jp);
                  if (!fieldPathStack.isEmpty())
                  {
                    fieldPathStack.pop();
                  }
                  fieldName = null;
                  if (!ruleStack.isEmpty())
                  {
                    current = (Rule) ruleStack.pop();
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
}
