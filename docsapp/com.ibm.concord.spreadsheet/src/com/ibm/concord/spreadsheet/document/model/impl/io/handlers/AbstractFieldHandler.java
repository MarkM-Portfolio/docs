package com.ibm.concord.spreadsheet.document.model.impl.io.handlers;

import com.ibm.concord.spreadsheet.document.model.impl.io.JSONUtils.IFieldHandler;
import com.ibm.json.java.JSONObject;

/**
 * Abstract implementation of {@link IFieldHandler} just do nothing for each method.
 */
public abstract class AbstractFieldHandler<T> implements IFieldHandler<T>
{
  public AbstractFieldHandler()
  {
    ;
  }

  public void onValue(String field, String value)
  {
    ;
  }

  public void onValue(String field, int value)
  {
    ;
  }

  public void onValue(String field, boolean value)
  {
    ;
  }

  public void onValue(String field, long value)
  {
    ;
  }

  public void onValue(String field, double value)
  {
    ;
  }

  public void onValue(String field, JSONObject value)
  {
    ;
  }

  public void onEnd()
  {
    ;
  }
}
