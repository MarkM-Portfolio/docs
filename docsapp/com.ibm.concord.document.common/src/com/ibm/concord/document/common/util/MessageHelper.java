/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.util;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author qins@cn.ibm.com
 * 
 */
public class MessageHelper
{
  //Message type defination
  public final static String TEXT = "t";

  public final static String ELEMENT = "e";

  public final static String INLINE_STYLE = "s";

  public final static String BLOCK_STYLE = "a";
  
  public final static String REPLACE_NODE = "rn";

  public final static String TABLE = "tb";
  
  public final static String TOC = "toc";
  
  public final static String TASK = "tsk";
  
  public final static String SPLIT = "sp";
  
  public final static String JOIN = "jn";
  
  public final static String LIST="l";
  
  public final static String OUTLINE="o";
  
  public final static String RESET_CONTENT = "rc";

  public final static String STYLE_ELEMENT = "se";
  
  public final static String MOVE_SLIDE = "ms";

  //Message content
  private final static String UPDATES = "updates";

  private final static String TRANS = "trans";

  private final static String TYPE = "type";
  
  public final static String DATA = "data";

  public final static String COMMENTS = "comments";

  private static final String ACTION_KEY = "action";

  private static final String ACTION_ADD = "add";

  private static final String ISWARNING_KEY = "isWarning";
  
  private static final Logger LOG = Logger.getLogger(MessageHelper.class.getName());
  
  public static List<String> getTargetNodes(JSONObject json)
  {
    try
    {
      List<String> nodes = new ArrayList<String>();
      JSONArray ops = (JSONArray) json.get(UPDATES);
      if (ops == null)
        return nodes;
      for (int index = 0; index < ops.size(); index++)
      {
        JSONObject op = (JSONObject) ops.get(index);
        if (!op.isEmpty())
        {
          Object tmp = op.get(Operation.TARGET);
          if (tmp != null)
          {
            String targetNode = tmp.toString();
            nodes.add(targetNode);
          }
          // for two special case, extra id
          if (op.get(Operation.TYPE).toString().equalsIgnoreCase(Operation.DELETE_ELEMENT))
          {
            JSONArray list = (JSONArray) op.get(Operation.ELEMENT_LIST);
            for (int j = 0; j < list.size(); j++)
            {
              nodes.add((String) list.get(j));
            }
          }
          if (op.get(Operation.TYPE).toString().equalsIgnoreCase(Operation.SET_BLOCK_STYLE))
          {
            nodes.add(op.get(Operation.BLOCK_ID).toString());
          }
          if (op.get(Operation.TYPE).toString().equalsIgnoreCase(Operation.DELETE_TASK))
          {
            nodes.add(op.get(Operation.REFID).toString());
          }
        }
      }
      return nodes;
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
  }
  public static List<String> getTargetNodes(List<Operation> ops)
  {
    try
    {
      List<String> nodes = new ArrayList<String>();
      if (ops == null)
        return nodes;
      for (int index = 0; index < ops.size(); index++)
      {
        Operation op = ops.get(index);
       
          String targetNode = op.getTarget();
          if (targetNode != null)
          {
            nodes.add(targetNode);
          }
          // for two special case, extra id
          if (op.getType().equalsIgnoreCase(Operation.DELETE_ELEMENT))
          {
            List<String> list=((DeleteElementOperation)op).getList();
            for (int j = 0; j < list.size(); j++)
            {
              if(list.get(j) != null)
                nodes.add((String) list.get(j));
            }
          }
          if (op.getType().equalsIgnoreCase(Operation.SET_BLOCK_STYLE))
          {
            String id = ((BlockStyleOperation)op).getBlockId();
            if(id != null)
              nodes.add(id);
          }
          if (op.getType().equalsIgnoreCase(Operation.DELETE_TASK))
          {
            nodes.add(((TaskOperation)op).getRefId());
          }
      }
      return nodes;
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
  }
  // for combind message, operations >1, for atom message operations =1
  public static List<Operation> getOperations(JSONObject json)
  {
    try
    {
      List<Operation> ops = new ArrayList<Operation>();
      JSONArray json_updates = (JSONArray) json.get(UPDATES);
      if (json_updates == null)
        return ops;
      for (int index = 0; index < json_updates.size(); index++)
      {
        JSONObject json_update = (JSONObject) json_updates.get(index);
        Operation op = createOperation(json_update);
        if(LOG.isLoggable(Level.FINER))
        {
        	LOG.finer(json_update.toString());
        }
        if (op!=null)
          ops.add(op);
      }
      return ops;
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return null;
    }
  }
  
  public static boolean is4AddWarningComment(JSONObject msg)
  {
    boolean isWarning = false;
    String action = (String) msg.get(ACTION_KEY);
    if (ACTION_ADD.equalsIgnoreCase(action))
    {
      JSONObject dataObj = (JSONObject) msg.get(DATA);
      if (dataObj != null)
      {
        Object value = dataObj.get(ISWARNING_KEY);
        if (value != null && value instanceof Boolean)
        {
          isWarning = (Boolean) value;
        }
      }
    }
    return isWarning;
  }

  public static void setOperations(JSONObject json, List<Operation> ops)
  {
    try
    {
      JSONArray json_updates = new JSONArray();
      json.put(UPDATES, json_updates);
      for (int index = 0; index < ops.size(); index++)
      {
        Operation op = ops.get(index);
        json_updates.add(op.write());
      }

    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  public static String getType(JSONObject json)
  {
    try
    {
      String combinedType = (String) json.get(TYPE);
      return combinedType;
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
  }

  public static String getStringByType(JSONObject json, String type)
  {
    try
    {
      String combinedType = (String) json.get(type);
      return combinedType;
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
  }

  // if this message is changed on transformation, we will save the modified content
  public static List<Operation> getTransOperations(JSONObject json)
  {
    try
    {
      List<Operation> ops = new ArrayList<Operation>();
      JSONArray json_updates = (JSONArray) json.get(TRANS);
      if (json_updates == null)
        return null;
      for (int index = 0; index < json_updates.size(); index++)
      {
        JSONObject json_update = (JSONObject) json_updates.get(index);
        Operation op = createOperation(json_update);
        if (op!=null)
          ops.add(op);
      }
      return ops;
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return null;
    }
  }

  public static void setTransOperations(JSONObject json, List<Operation> ops)
  {
    try
    {
      JSONArray json_updates = new JSONArray();
      json.put(TRANS, json_updates);
      for (int index = 0; index < ops.size(); index++)
      {
        Operation op = ops.get(index);
        json_updates.add(op.write());
      }

    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }
  
  public static String getData(JSONObject json) {
    try {
      return (String)json.get(DATA);
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
  }
  
  public static Operation createOperation(JSONObject update)
  {
    String type = (String) update.get(Operation.TYPE);
    if( type == null )
    		return null;
    
    Operation op = null;

    if (type.equals(Operation.SET_INLINE_STYLE) || type.equals(Operation.REMOVE_INLINE_STYLE))
        op = new InlineStyleOperation();
    else if (type.equals(Operation.INSERT_STYLE_ELEMENT))
        op = new InsertStyleElementOperation();   
    else if (type.equals(Operation.DELETE_STYLE_ELEMENT))
        op = new DeleteStyleElementOperation(); 
    else if( type.equals(Operation.SET_BLOCK_STYLE)|| type.equals(Operation.REMOVE_BLOCK_STYLE) )
        op = new BlockStyleOperation();
    else if(type.equals(Operation.INSERT_TEXT))
        op = new InsertTextOperation();
    else if(type.equals(Operation.DELETE_TEXT))
        op = new DeleteTextOperation();
    else if(type.equals(Operation.INSERT_ELEMENT))
        op = new InsertElementOperation();
    else if(type.equals(Operation.DELETE_ELEMENT))
        op = new DeleteElementOperation();
    else if (type.equals(Operation.INSERT_TASK) || type.equals(Operation.DELETE_TASK) || type.equals(Operation.UPDATE_TASK))
    	op = new TaskOperation();
    else if(type.equals(Operation.UPDATE_FRAGMENT))
        op = new UpdateFragmentOperation();
    else if(type.equals(Operation.RESET_CONTENT_ACTION))
        op = new ResetContentOperation();
    else if(type.equalsIgnoreCase(Operation.UPDATE_LIST_VALUE))
    	op = new UpdateListValueOperation();
    else if(type.equalsIgnoreCase(Operation.CHANGE_LIST_TYPE)){
    	op= new ChangeListTypeOperation();
    }
    	
    if (op!=null && op.read(update))
      return op;
    else
      return null;
  }
}
