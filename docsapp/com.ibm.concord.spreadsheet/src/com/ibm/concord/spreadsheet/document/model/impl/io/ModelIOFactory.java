package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Stack;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.builder.ToStringBuilder;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;

import com.ibm.concord.spreadsheet.document.model.impl.io.swap.ISwapInOnlyManager;
import com.ibm.concord.spreadsheet.document.model.impl.io.swap.InMemorySwapInOnlyManager;

/**
 * <p>
 * Constructs a factory that creates serializer and deserializer for one draft assigned.
 * <h1>The Deserialization</h1>
 * <p>
 * This factory reads the file <u>deserialization-rules.json</u> to build a <em>{@link Rule}</em> chain for deserialization. The rules guide
 * deserializer to read each JSON file (in the sequence of meta.js, content.js, reference.js and preserve.js).
 * <p>
 * The file named <u>deserialization-rules.json</u> describes deserialization rules for every files. The root object is under key "rules",
 * which is an array of 4 objects, each for the 4 JSON files in same sequence mentioned above. Each object is defined as,
 * 
 * <pre>
 * <code>
 *  RULE = {
 *      [*] "<em>FIELD_NAME</em>": RULE,
 *      [?] "*": RULE,
 *      [?] "__action__": "<em>One action defined in {@link Actions}</em>"
 *  }
 * </code>
 * </pre>
 * <p>
 * Rules are defined recursively. One rule can have 0 or more "FIELD_NAME" items, exclusive or, 0 or 1 "*" item. The "FIELD_NAME" item
 * determines what to do(i.e. what rule to go) when the "FIELD_NAME" is met. The "*" item means go to the rule no matter what field name
 * meets. Rules can also have 0 or 1 "__action__" item. The value of the item is one of the enum value defined in {@link Actions}, which
 * will guide the deserializer to do appropriate actions.
 * 
 * <h1>The serialization</h1>
 * <p>
 * See {@link Serializer}.
 * 
 */
public class ModelIOFactory
{
  private static final Logger LOG = Logger.getLogger(ModelIOFactory.class.getName());

  private static final String RULE_JSON_PATH = "com/ibm/concord/spreadsheet/document/model/impl/io/deserialization-rules.json";

  private static final String FIELD_ACTION = "__action__";

  private static final String FIELD_ANY = "*";

  public static enum LoadMode {
    /**
     * Load all sheet content as model in memory
     */
    ALL,
    /**
     * Load all rows in a sheet as (byte[]) streams.
     */
    ROWS_AS_STREAM,
    /**
     * Load all cells in a sheet as (byte[]) streams.
     */
    CELLS_AS_STREAM
  }

  public final static LoadMode LOAD_MODE = LoadMode.CELLS_AS_STREAM;
  
  /**
   * Flag to indicate that it is running inside NodeJS owned JVM
   */
  public final static boolean HAS_NODE, HAS_STORAGE_MANAGER;

  private static ModelIOFactory instance;

  private ISwapInOnlyManager swapManager;

  private Rule[] rootRules;

  private JsonFactory jsonFactory;

  private Rule metaRowRule, contentSheetRule, contentSheetRowRule;

  private enum State {
    RULES_START, IN_RULE, VALUE_ACTION, FIELD_NAME
  };
  
  static
  {
    HAS_NODE = "true".equals(System.getProperty("has.node"));
    if (HAS_NODE)
    {
      if (LOG.isLoggable(Level.INFO))
      {
        LOG.log(Level.INFO, "ModelIOFactory started in NodeJS environment.");
      }
    }
    

    boolean hasDSM = true;
    
    try
    {
      Class.forName("com.ibm.concord.draft.DraftStorageManager");
    }
    catch (Exception ex)
    {
      hasDSM = false;
      LOG.info("Running without DSM, possibly outside WAS.");
    }
    catch (Error ex)
    {
      hasDSM = false;
      LOG.info("Running without DSM, possibly outside WAS.");
    }
    
    HAS_STORAGE_MANAGER = hasDSM;
  }

  
  /**
   * Constructs the factory. The factory is heavy and thread safe. So should maintain singleton per server.
   * 
   * @throws JsonParseException
   * @throws IOException
   */
  public ModelIOFactory(JsonFactory jf) throws JsonParseException, IOException
  {
    rootRules = new Rule[4];
    jsonFactory = jf;
    init();

    instance = this;
  }

  /**
   * Creates a {@link Deserializer} to read draft JSON and construct document model.
   * 
   * @param dd
   * @return created {@link Deserializer}
   */
  public Deserializer createDeserializer()
  {
    Deserializer de = new Deserializer();
    de.setJsonFactory(jsonFactory);
    de.setRules(rootRules);
    return de;
  }

  /**
   * Creates a {@link Serializer} to write model to the designated draft.
   * 
   * @param dd
   * @return created {@link Serializer}
   */
  public Serializer createSerializer()
  {
    Serializer se = new Serializer();
    se.setJsonFactory(jsonFactory);
    if(HAS_NODE)
      se.setNodeJSEnabled(true);
    return se;
  }

  public static ModelIOFactory getInstance()
  {
    return instance;
  }

  public Rule getPartialRule(int index, String... path)
  {
    Rule root = rootRules[index];

    for (int i = 0; i < path.length; i++)
    {
      String p = path[i];
      if (root.next != null && "*".equals(p))
      {
        // these 2 conditions being true at the same time
        root = root.next;
      }
      else if (root.nextRuleMap != null)
      {
        root = root.nextRuleMap.get(p);
        if (root == null)
        {
          return null;
        }
        // else, continue searching
      }
      else
      {
        // empty rule, return null
        return null;
      }
    }

    return root;
  }

  public Rule getMetaRowRule()
  {
    if (metaRowRule == null)
    {
      metaRowRule = getPartialRule(0, "rows");
    }

    return metaRowRule;
  }

  public Rule getContentSheetRule()
  {
    if (contentSheetRule == null)
    {
      contentSheetRule = getPartialRule(1, "sheets", "*");
    }

    return contentSheetRule;
  }

  public Rule getContentSheetRowRule()
  {
    if (contentSheetRowRule == null)
    {
      contentSheetRowRule = getPartialRule(1, "sheets", "*", "rows", "*");
    }

    return contentSheetRowRule;
  }

  public ISwapInOnlyManager getSwapManager()
  {
    if (swapManager == null)
    {
      swapManager = new InMemorySwapInOnlyManager();
    }

    return swapManager;
  }

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

  // read in deserialization-rules.json and build rule chain
  private void init() throws JsonParseException, IOException
  {
    ClassLoader loader = getClass().getClassLoader();
    InputStream jsonIn = loader.getResourceAsStream(RULE_JSON_PATH);
    JsonParser jp = jsonFactory.createJsonParser(jsonIn);
    Stack<Rule> ruleStack = new Stack<ModelIOFactory.Rule>();
    JsonToken jt = jp.nextToken();
    State state = null;
    int ruleCount = 0;
    Rule currentRule = null;
    Rule nextRule = null;

    while (jt != null)
    {
      if (state == null)
      {
        if (jt == JsonToken.START_ARRAY)
        {
          state = State.RULES_START;
        }
      }
      else
      {
        switch (state)
          {
            case RULES_START :
              switch (jt)
                {
                  case START_OBJECT :
                    // begin of a set of rules
                    currentRule = new Rule();
                    ruleStack.clear();
                    rootRules[ruleCount++] = currentRule;
                    state = State.IN_RULE;
                    break;
                  case END_ARRAY :
                    // end of story
                    state = null;
                    break;
                  default:
                    break;
                }
              break;
            case IN_RULE :
              switch (jt)
                {
                  case FIELD_NAME :
                    String fieldName = jp.getCurrentName();
                    if (FIELD_ACTION.equals(fieldName))
                    {
                      // need to update current rule's action
                      state = State.VALUE_ACTION;
                    }
                    else
                    {
                      if (FIELD_ANY.equals(fieldName))
                      {
                        currentRule.nextRuleMap = null;
                        nextRule = new Rule();
                        currentRule.next = nextRule;
                      }
                      else
                      {
                        currentRule.next = null;
                        if (currentRule.nextRuleMap == null)
                        {
                          currentRule.nextRuleMap = new HashMap<String, ModelIOFactory.Rule>();
                        }
                        nextRule = new Rule();
                        currentRule.nextRuleMap.put(fieldName, nextRule);
                      }
                      state = State.FIELD_NAME;
                    }
                    break;
                  case END_OBJECT :
                    if (ruleStack.empty())
                    {
                      state = State.RULES_START;
                    }
                    else
                    {
                      currentRule = ruleStack.pop();
                      // remain in the state
                    }
                    break;
                  default:
                    break;
                }
              break;
            case VALUE_ACTION :
              if (jt == JsonToken.VALUE_STRING)
              {
                String action = jp.getText();
                try
                {
                  currentRule.action = Actions.valueOf(action);
                }
                catch (IllegalArgumentException e)
                {
                  LOG.log(Level.WARNING, "no matching deserialize Actions enum item", e);
                  currentRule.action = Actions.NO_ACTION;
                }
              }
              state = State.IN_RULE;
              break;
            case FIELD_NAME :
              if (jt == JsonToken.START_OBJECT)
              {
                ruleStack.push(currentRule);
                currentRule = nextRule;
                nextRule = null;
              }
              state = State.IN_RULE;
              break;
            default:
              // never here
              break;
          }
      }
      jt = jp.nextToken();
    }
  }
}
