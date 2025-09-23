/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload.serialize;

import com.ibm.json.java.JSONObject;

/**
 * Result for handling JSON values {@link IValueHandler} returns.
 */
public interface IValueHandlerResult
{
  /**
   * Possible operations for each JSON value.
   */
  public enum OPERATION {
    /**
     * Needs to iterate deeper in the JSON construct. getContext() in this case should returns a new {@link IJsonValueHandler}
     * implementation.
     */
    OP_ITERATE_DEEPER,
    /**
     * Skip children.
     */
    OP_RESULT_SKIP,
    /**
     * Do nothing and jump to next value
     */
    OP_RESULT_NEXT,
    /**
     * Serialize JSON value to generator
     */
    OP_RESULT_TAKE_ORIGIN,
    /**
     * Serialize a new JSON object to generator, getContext() returns a JSONObject
     */
    OP_RESULT_TAKE_NEW,
    /**
     * end the iteration
     */
    OP_RESULT_END
  };

  public OPERATION getOperation();

  public Object getContext();
  

  /**
   * Skip children.
   */
  public static IValueHandlerResult SKIP = new IValueHandlerResult()
  {
    public OPERATION getOperation()
    {
      return OPERATION.OP_RESULT_SKIP;
    }

    public Object getContext()
    {
      return null;
    }
  };

  /**
   * Serialize JSON value to generator
   */
  public static IValueHandlerResult TAKE_ORIGIN = new IValueHandlerResult()
  {
    public OPERATION getOperation()
    {
      return OPERATION.OP_RESULT_TAKE_ORIGIN;
    }

    public Object getContext()
    {
      return null;
    }
  };

  /**
   * Do nothing and jump to next value
   */
  public static IValueHandlerResult NEXT = new IValueHandlerResult()
  {

    public OPERATION getOperation()
    {
      return OPERATION.OP_RESULT_NEXT;
    }

    public Object getContext()
    {
      return null;
    }
  };

  /**
   * end the iteration
   */
  public static IValueHandlerResult END = new IValueHandlerResult()
  {

    public OPERATION getOperation()
    {
      return OPERATION.OP_RESULT_END;
    }

    public Object getContext()
    {
      return null;
    }
  };

  /**
   * Create a handler result for iterating deeper into original JSON.
   */
  public final class IterateDeeper implements IValueHandlerResult
  {
    private IValueHandler handler;

    public IterateDeeper(IValueHandler handler)
    {
      this.handler = handler;
    }

    public OPERATION getOperation()
    {
      return OPERATION.OP_ITERATE_DEEPER;
    }

    public Object getContext()
    {
      return handler;
    }
  }

  /**
   * Create a handler result for serialize new JSONObject to replace original JSON.
   */
  public final class TakeNew implements IValueHandlerResult
  {
    private JSONObject value;

    public TakeNew(String key, Object val)
    {
      value = new JSONObject();
      value.put(key, val);
    }

    public TakeNew(JSONObject value)
    {
      this.value = value;
    }

    public OPERATION getOperation()
    {
      return OPERATION.OP_RESULT_TAKE_NEW;
    }

    public Object getContext()
    {
      return value;
    }
  }
}
