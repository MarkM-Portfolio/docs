/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.util;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.json.java.JSONObject;

public class JobHelper
{
  private static final Logger LOG = Logger.getLogger(JobHelper.class.getName());
  /**
   * filePath is the location for the json file
   */
  private String filePath;

  public JobHelper(String filePath)
  {
    this.filePath = filePath;
  }

  /**
   * Write one elements into the json file
   * 
   * @param key
   * @param value
   * @throws Exception
   */
  public void addElement(String key, String value) throws Exception
  {
    try
    {
      JSONObject json = new JSONObject();
      json.put(key, value);
      ViewerUtil.writeJSON(filePath, json);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Add Element(" + key + "," + value + ") failed for File:" + filePath);
    }
  }

  public JSONObject getJson()
  {
    return ViewerUtil.readJSON(filePath);
  }
  /**
   * Write elements arrays into the json file
   * 
   * @param keys
   * @param values
   * @throws Exception
   */
  public void addElements(String keys[], String values[]) throws Exception
  {
    if (keys == null || values == null)
      return;
    if (keys.length != values.length)
      throw new Exception();
    JSONObject json = new JSONObject();
    for (int i = 0; i < keys.length; i++)
    {
      String key = keys[i];
      String value = values[i];
      json.put(key, value);
    }
    try
    {
      ViewerUtil.writeJSON(filePath, json);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Add Elements(" + keys.toString() + "," + values.toString() + ") failed for File:" + filePath);
    }
  }

  /**
   * Read the value for the given key in the json file
   * 
   * @param key
   * @return value
   */
  public String getElement(String key)
  {
    JSONObject json = ViewerUtil.readJSON(filePath);
    return (String) json.get(key);
  }
  
  /**
   * Clean all the elements from the json file
   */
  public void clearElements()
  {
    FileUtil.deleteFile(this.filePath);
  }
  
  public void removeElements(String keys[])
  {
    JSONObject json = ViewerUtil.readJSON(filePath);
    if (keys == null || keys.length == 0 || json.size() == 0)
      return;
    for (int i = 0; i < keys.length; i++)
    {
      json.remove(keys[i]);
    }
    try
    {
      FileUtil.deleteFile(this.filePath);
      ViewerUtil.writeJSON(this.filePath, json);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Remove Elements(" + keys.toString() + ") failed for File:" + filePath);
    }
  }

  public void removeElement(String key)
  {
    JSONObject json = ViewerUtil.readJSON(filePath);
    if (key == null || json.size() == 0)
      return;
    json.remove(key);
    try
    {
      FileUtil.deleteFile(this.filePath);
      ViewerUtil.writeJSON(this.filePath, json);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Remove Element(" + key.toString() + ") failed for File:" + filePath);
    }
  }
}
