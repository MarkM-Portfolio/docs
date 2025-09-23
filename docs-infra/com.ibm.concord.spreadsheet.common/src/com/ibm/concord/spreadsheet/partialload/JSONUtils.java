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

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class JSONUtils
{
  /**
   * Copies { key : value } pair from source JSON object. If value not exists, then don't copy.
   * 
   * @param source
   * @param key
   * @return the value copied
   */
  public static Object copyValue(JSONObject source, JSONObject target, String key)
  {
    Object[] result = copyPath(source, target, new String[] { key });

    return result[result.length - 1];
  }

  /**
   * Copies { key1 : { key2 : { ... : { value } ... } } } structure from source JSON object. The path will ensured. That is, the path till
   * last element will be created. But if last value not exists, last key will not be created.
   * 
   * @param source
   * @param pathParts
   * @return the JSONObject on the path. If last value is not created, last element is null.
   */
  public static Object[] copyPath(JSONObject source, JSONObject target, String[] pathParts)
  {
    JSONObject o = target;
    int pathLength = pathParts.length;
    JSONObject sourceObj = source;
    Object[] pathElements = new Object[pathLength];

    for (int i = 0; i < pathLength - 1; i++)
    {
      String pathName = pathParts[i];
      Object tmpSource = null;

      // read sourceObj
      if (sourceObj != null)
      {
        tmpSource = source.get(pathName);
        if (tmpSource == null || !(tmpSource instanceof JSONObject))
        {
          sourceObj = null;
        }
        else
        {
          sourceObj = (JSONObject) tmpSource;
        }
      }

      // ensure path
      JSONObject tmpThis = (JSONObject) o.get(pathName);
      if (tmpThis == null)
      {
        tmpThis = new JSONObject();
        o.put(pathName, tmpThis);
      }
      o = tmpThis;
      pathElements[i] = o;
    }

    // null safe copy from soureObj -> o
    if (sourceObj != null)
    {
      String key = pathParts[pathLength - 1];
      Object val = sourceObj.get(key);
      if (val != null)
      {
        o.put(key, val);
        pathElements[pathLength - 1] = val;
      }
    }
    return pathElements;
  }

  public static JSONObject[] ensurePath(JSONObject object, String[] pathParts)
  {
    int length = pathParts.length;
    JSONObject o = object;
    JSONObject[] pathElements = new JSONObject[length];

    for (int i = 0; i < length; i++)
    {
      String pathName = pathParts[i];
      JSONObject tmp = (JSONObject) o.get(pathName);
      if (tmp == null)
      {
        tmp = new JSONObject();
        o.put(pathName, tmp);
      }
      o = tmp;
      pathElements[i] = tmp;
    }

    return pathElements;
  }

  /**
   * 
   * @param pathParts
   *          "[n]" means n-th element in a JSONArray
   * @return
   */
  public static Object[] findPath(JSONObject object, String[] pathParts)
  {
    Object o = object;
    Object tmp;
    Object[] pathElements = new Object[pathParts.length];
    for (int i = 0; i < pathParts.length; i++)
    {
      String pathName = pathParts[i];
      if (pathName.startsWith("["))
      {
        // locate in JSONArray
        int index = Integer.parseInt(pathName.substring(1, pathName.length() - 1));
        if (o instanceof JSONArray)
        {
          JSONArray tmpArray = (JSONArray) o;
          if (index < 0 || index >= tmpArray.size())
          {
            // path ends
            return pathElements;
          }
          else
          {
            tmp = tmpArray.get(index);
            if (tmp != null)
            {
              pathElements[i] = tmp;
              o = tmp;
            }
            else
            {
              return pathElements;
            }
          }
        }
        else
        {
          return pathElements;
        }
      }
      else
      {
        // locate in JSONObject
        if (o instanceof JSONObject)
        {
          tmp = ((JSONObject) o).get(pathName);
          if (tmp != null)
          {
            pathElements[i] = tmp;
            o = tmp;
          }
          else
          {
            return pathElements;
          }
        }
        else
        {
          return pathElements;
        }
      }
    }
    return pathElements;
  }
}
