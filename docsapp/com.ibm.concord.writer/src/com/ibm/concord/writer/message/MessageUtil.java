package com.ibm.concord.writer.message;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;

import com.ibm.concord.document.common.util.DOMIdGenerator;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import java.util.logging.Level;
/**
 * 
 * @author xuezhiy@cn.ibm.com
 *
 */
public class MessageUtil
{
	private static final Logger LOG = Logger.getLogger(MessageUtil.class.getName());
  public final static String MESSAGE_TEXT = "t";

  public final static String MESSAGE_ELEMENT = "e";

  public final static String MESSAGE_ATTRIBUTE = "a";

  public final static String MESSAGE_TEXT_ATTRIBUTE = "ta";
  
//  public final static String MESSAGE_REPLACE = "rp";

  public final static String MESSAGE_TABLE = "tb";

//  public final static String MESSAGE_SPLIT = "sp";
  
//  public final static String MESSAGE_JOIN = "jn";
  
  public final static String MESSAGE_LIST = "l";

  public final static String MESSAGE_SECTION = "sec";
  
  public final static String MESSAGE_STYLE = "st";
  
  public final static String MESSAGE_KEY = "k";
  
  public final static String MESSAGE_TEXTCOMMENT = "tm";
  
  public final static String MESSAGE_SETTING = "stt";
  
  public final static String MESSAGE_META = "mt";
  
  // Message category
  public final static String MESSAGE_CATEGORY = "mc";
  
  public final static String CATEGORY_CONTENT = "c"; // Content 
  
  public final static String CATEGORY_STYLE = "s";   // Setting
  
  public final static String CATEGORY_LIST = "l";    // Numbering
  
  public final static String CATEGORY_SETTING = "st"; // Setting
  
  public final static String CATEGORY_RELATION = "r";  // Relations
  
  public final static String CATEGORY_FOOTNOTES = "fn"; // footnotes
	  
  public final static String CATEGORY_ENDNOTES = "en"; // footnotes	   
  
  public final static String CATEGORY_META = "mt";      // Meta 
  
  //Message content
  private final static String UPDATES = "updates";
  
  private final static String TRANS = "trans";

  private final static String TYPE = "type";
  
  public final static String DATA = "data";
  
  public final static String PRESERVE = "preserve";
  
  public static String getMsgType(JSONObject json)
  {
    try
    {
      return (String) json.get(TYPE);
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
  }
  
  public static String getMsgCategory(JSONObject json)
  {
    try
    {
      return (String) json.get(MESSAGE_CATEGORY);
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
  }
//
//  public static String getData(JSONObject json) {
//    try {
//      return (String)json.get(DATA);
//    } catch (Exception e) {
//      // TODO Auto-generated catch block
//      e.printStackTrace();
//      return null;
//    }
//  }
  
  // for combined message, operations >1, for atom message operations =1
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
        Operation op = Operation.createOperation(json_update);

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
  
  public static void setOperations(JSONObject msg, List<Operation> ops)
  {
    try
    {
      JSONArray json_updates = new JSONArray();
      msg.put(UPDATES, json_updates);
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
  
  public static List<Operation> getTransOperatoins(JSONObject json)
  {
    List<Operation> ret = null;
    try
    {
      JSONArray json_updates = (JSONArray) json.get(TRANS);
      if (json_updates != null){
        List<Operation> ops = new ArrayList<Operation>();
        for (int index = 0; index < json_updates.size(); index++)
        {
          JSONObject json_update = (JSONObject) json_updates.get(index);
          Operation op = Operation.createOperation(json_update);
  
          if (op!=null)
            ops.add(op);
        }
        ret = ops;
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    if(ret == null)
      ret = getOperations(json);
    
    return ret;
  }
  
  public static void setTransOperations(JSONObject msg, List<Operation> ops)
  {
    try
    {
      JSONArray json_updates = new JSONArray();
      msg.put(TRANS, json_updates);
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
  
  /**
   * Get a JSON object by the path. Be careful, you can't get a basic type(string, int), since basic types are value-passed(final).
   * Example, {id:"default",pgSz:{w:"123"}}, you can get the ["pgSz"], but you can't get ["pgSz","w"], since "w" is a basic String.
   * @param model the root doc of settings, content, styles, relations or numbering
   * @param path an array, for example, for settings model, use ["sects",{id:"default"}, "pgSz"]
   * @return for the example, will find the sects array, then find the id== "default" child, then find the pgSz JSON object
   */
  public static JSONObject getJsonByPath(JSONObject model, JSONArray path){
	  if (model == null || path == null ){
		  LOG.warning("BAD argument since no model or no path");
		  return null;
	  }
	  Object current = model;
	  for (int i=0;i<path.size();i++){
		  Object pathitem = path.get(i);
		  if (pathitem instanceof String){
			  current = ((JSONObject)current).get(pathitem);
		  }else if ((pathitem instanceof JSONObject) && (current instanceof JSONArray)){
			  JSONObject temppath = (JSONObject)pathitem;
			  JSONArray curtemp = (JSONArray) current;
			  for (int j=0;j<curtemp.size();j++){
				  JSONObject temp = (JSONObject)curtemp.get(j);
				  boolean found = true;
				  for( Object key : temppath.keySet()){
					  if (!temppath.get(key).equals(temp.get(key))){
						  found = false;
						  break;
					  }
				  }
				  if (found){
					  current = temp;
					  break;
				  }
			  }
			  
		  }else{
			  LOG.log(Level.SEVERE,"target not found!");
			  return null;
		  }
		  
		  if (current == null || !(current instanceof JSONObject || current instanceof JSONArray) ){
			  LOG.log(Level.SEVERE,"target not found or is not a JSON!");
			  return null;
		  }
	  }
	  if(current instanceof JSONArray)
	  {
		  JSONObject content = new JSONObject();
		  ((JSONArray)current).add(content);
		  return content;
	  }
	  return (JSONObject)current;
  }
  
  /**
   * Get the model's children with the key.
   * Used for get text box content with key "txbxContent"
   * @param model
   * @param key
   * @return
   */
  public static Object getObjectByKey(Object model, String key)
  {
    if(model != null && model instanceof JSONObject)
    {
      return ((JSONObject)model).get(key);
    }
    return null;
  }
  
  
  public static Object getTextBoxContent(Object model)
  {
    if(model != null && model instanceof JSONObject)
    {
      Object contentContainer = MessageUtil.getObjectByKey(model, "anchor"); // Anchored text box
      if(contentContainer == null)
        contentContainer = MessageUtil.getObjectByKey(model, "inline"); // Inline text box
      if(contentContainer == null)
      {
        return MessageUtil.getObjectByKey(model, "txbxContent");	// Simple text box (in Canvas/Group)
      }
      else
      {
        Object graphicData = MessageUtil.getObjectByKey(contentContainer, "graphicData");
        Object txbx = MessageUtil.getObjectByKey(graphicData, "txbx");
        return MessageUtil.getObjectByKey(txbx, "txbxContent");
      }
    }
    
    return null;
  }

	public static boolean remove(Object model, String id) {
		JSONArray children = MessageUtil.getChildren(model);
		
		if (children == null) {
			// content in textbox
			if ( model instanceof JSONObject && "txbx".equalsIgnoreCase((String)((JSONObject)model).get("rt")) )
				children = (JSONArray)MessageUtil.getTextBoxContent(model);
		}
		
		if (children!= null) {
			for (int i = 0; i < children.size(); i++) {
				JSONObject item = (JSONObject) children.get(i);
				String itemId = (String) item.get("id");
				if ( itemId != null && itemId.equals(id)) {
					children.remove(item);
					return true;
				}
				else if( MessageUtil.remove(item,id ))
					return true;
			}
		}
		return false;
	}
  
	public static JSONArray getChildren( Object model ){
		if (model instanceof JSONArray) {
			return (JSONArray) model;
		} else if (model instanceof JSONObject) {
			JSONObject jsonModel = (JSONObject) model;
			Set<?> keySet = jsonModel.keySet();
			Iterator<?> iterator = keySet.iterator();
			String key;
			Object value;
			while (iterator.hasNext()) {
				key = (String) iterator.next();
				value = jsonModel.get(key);
				if (value instanceof JSONArray)
					return (JSONArray) value;
			}
		}
		return null;
	}
	
  public static JSONObject getById(Object model, String id)
  {
    JSONObject ret = null;
    if ( model instanceof JSONArray)
    {
      JSONArray arrayModel = (JSONArray) model;
      for (int i = 0; i < arrayModel.size(); i++)
      {
        Object item = arrayModel.get(i);
        ret = MessageUtil.getById(item, id);
        if (ret != null)
          break;
      }
    }
    else if(model instanceof JSONObject)
    {
      JSONObject jsonModel = (JSONObject)model;
      Set<?> keySet = jsonModel.keySet();
      Iterator<?> iterator = keySet.iterator();
      String key;
      Object value;
      while (iterator.hasNext())
      {
        key = (String) iterator.next();
        value = jsonModel.get(key);
        if(value == null)
          continue;
        if(key.equalsIgnoreCase("id") && ( value instanceof String ) && id.equalsIgnoreCase((String)value))
          ret = jsonModel;
        else if (value instanceof JSONObject)
          ret = MessageUtil.getById((JSONObject) value, id);
        else if(value instanceof JSONArray )
          ret = MessageUtil.getById((JSONArray) value, id);
        
        if (ret != null)
          break;
      }
    }
    return ret;
  }
  

  static private boolean _deepCompare(Object src, Object dest)
  {
    if(src.equals(dest) || src == dest)
      return true;
    else if(src instanceof JSONArray && dest instanceof JSONArray)
    {
      JSONArray srcArray = (JSONArray) src, destArray = (JSONArray)dest;
      if(srcArray.size() != destArray.size())
        return false;
      
      for (int i = 0; i < srcArray.size(); i++)
      {
        if(!_deepCompare(srcArray.get(i), destArray.get(i)))
          return false;
      }
    }
    else if(src instanceof JSONObject && dest instanceof JSONObject)
    {
      Set<?> keySet = ((JSONObject)src).keySet();
//      if(keySet.size() != ((JSONObject)dest).keySet().size()) // Preserved attribute..
//        return false;
//      
      Iterator<?> iterator = keySet.iterator();
      String key;
      while (iterator.hasNext())
      {
        key = (String) iterator.next();
        if(PRESERVE.equalsIgnoreCase(key))
          continue;
        
        if(!_deepCompare(((JSONObject)src).get(key), ((JSONObject)dest).get(key)))
          return false;
      }
    }

    return false;
  }
  
  static public boolean isSameObject(Object src, Object dest)
  {
    if(src == dest)
      return true;
    if(src == null || dest == null)
      return false;
    
    return _deepCompare(src, dest) && _deepCompare(dest, src);
  }
  /**
   * Deep Copy.
   * @param target Object to copy.
   * @return A copied Object.
   * TODO:need deal with JSONArray.
   */
  public static Object deepCopy(Object target){
	  if(target==null) return null;
	  if(target instanceof JSONObject){
		  JSONObject typedTarget = (JSONObject)target;
		  JSONObject result = new JSONObject();
		  for(Object key : typedTarget.keySet())
			  result.put(key, deepCopy(typedTarget.get(key)));
		  return result;
	  } 
	  if(target instanceof JSONArray) {
		  JSONArray result = new JSONArray();
		  for(int i=0;i<((JSONArray) target).size();i++)
			  result.add(deepCopy(((JSONArray) target).get(i)));
		  return result;
	  }
	  return target;
  }

  public static String generateId() {
	  String prefix = "id_";
	  return DOMIdGenerator.generate(prefix);
  }
}
