package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.IOException;
import java.util.List;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;

/**
 * Handles draft actions, called back from {@link DraftActionGenerator}.
 */
public interface IDraftActionHandler
{
  /**
   * <p>
   * Reads JSON from current JsonParser, according to the fieldPath and action provided.
   * <p>
   * The fieldPath gives current position in the JSON file. The action is a value of {@link Actions}. It guides the deserializer to read
   * appropriate data from the JsonParser. The JsonParser, according to the action, stops at the position of a VALUE, or a START_ARRAY, or a
   * START_OBJECT. When the method ends, the JsonParser must stop at the same VALUE, or the corresponding END_ARRAY, or END_OBJECT.
   * 
   * @param fieldPath
   *          a list of Strings to show the current position of the JSON file.
   * @param action
   *          the deserialize action the model should take
   * @param jp
   * @throws IOException
   * @throws JsonParseException
   * 
   */
  public void onAction(List<String> fieldPath, Actions action, JsonParser jp) throws JsonParseException, IOException;

  /**
   * Called when a field name is met in current JsonParser. After the field name is recorded in path list to pass into onAction.
   * 
   * @param jp
   * @throws JsonParseException
   * @throws IOException
   */
  public void onFieldName(Actions action, JsonParser jp) throws JsonParseException, IOException;

  /**
   * <p>
   * Called when END_OBJECT is met and the rule containing the action is going to be replaced from the "parent" rule from the rule stack.
   * 
   * @param fieldPath
   * @param action
   * @param jp
   * @throws JsonParseException
   * @throws IOException
   */
  public void postAction(List<String> fieldPath, Actions action, JsonParser jp);
}
