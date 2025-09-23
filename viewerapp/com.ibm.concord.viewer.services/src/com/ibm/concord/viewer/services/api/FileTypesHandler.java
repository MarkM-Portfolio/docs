/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.api;

import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.util.FormatUtil;
import com.ibm.concord.viewer.services.rest.GetHandler;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author yindali@cn.ibm.com
 * 
 */
public class FileTypesHandler implements GetHandler
{
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    JSONArray services = (JSONArray) (Platform.getViewerConfig().getSubConfig("component").get("components"));
    JSONObject mimes = null;
    // find mime types
    for (int i = 0; i < services.size(); i++)
    {
      JSONObject comp = (JSONObject) services.get(i);
      String id = (String) comp.get("id");
      if (id.equalsIgnoreCase("com.ibm.concord.viewer.document.services"))
      {
        JSONObject subconfig = (JSONObject) comp.get("config");
        mimes = (JSONObject) subconfig.get("mime-types");
        break;
      }
    }

    if (mimes == null)
      return;

    JSONObject result = getExtension(mimes);

    response.setStatus(200);
    response.setContentType("application/json");
    response.getWriter().print(result.toString());
  }

  private static JSONObject getExtension(JSONObject mimes)
  {
    JSONObject ret = new JSONObject();
    Iterator<String> iter = FormatUtil.EXT2MIMETYPE.keySet().iterator();

    while (iter.hasNext())
    {
      String key = (String) iter.next();
      ret.put(key, FormatUtil.EXT2MIMETYPE.get(key));
    }
    
    return ret;
  }
}
