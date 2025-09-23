/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.framework;

import com.ibm.json.java.JSONObject;

public class ComponentDescriptor
{
  public String id;

  public String className;

  public JSONObject config;

  public String toString()
  {
    return "ComponentDescriptor{" + "id=" + id + "," + "className=" + className + "," + "config=" + config;
  }
}