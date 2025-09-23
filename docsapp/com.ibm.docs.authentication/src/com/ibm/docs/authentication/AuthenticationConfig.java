/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.authentication;

import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class AuthenticationConfig
{
  public static String getAuthenticationAdapterClass(String repoId)
  {
    JSONObject config = ComponentRegistry.getInstance().getComponent(AuthenticationComponent.COMPONENT_ID).getConfig();
    JSONArray adapters = (JSONArray) config.get("adapters");
    for (int i = 0; i < adapters.size(); i++)
    {
      JSONObject adapterConfig = (JSONObject) adapters.get(i);
      try
      {
        String id = (String) adapterConfig.get("id");
        if (repoId.equalsIgnoreCase(id))
        {
          return (String) adapterConfig.get("class");
        }
      }
      catch (Exception e)
      {
        throw new IllegalStateException(e);
      }
    }
    return null;
  }
}
