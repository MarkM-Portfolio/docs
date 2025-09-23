/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.rest;

import java.io.IOException;
import java.net.URLDecoder;

import javax.servlet.http.Cookie;

import org.apache.commons.fileupload.disk.DiskFileItemFactory;

import com.ibm.json.java.JSONObject;

public class ServiceUtil
{
  public static final DiskFileItemFactory FILE_ITEM_FACTORY;

  static
  {
    FILE_ITEM_FACTORY = new DiskFileItemFactory();
  }

  public static JSONObject getDataFromCookie(Cookie cookies[], String type)
  {
    for(int i = 0; i < cookies.length; i++)
    {
      Cookie cookie = cookies[i];
      if(cookie.getName().equals("deepdetect"))
      {
        try
        {
          String value = cookie.getValue();
          if(value != null && !value.equals("") && !value.equals("null"))
          {
            value = URLDecoder.decode(value, "UTF-8");
            JSONObject obj = JSONObject.parse(value);
            if(obj != null)
            {
              return (JSONObject)obj.get(type);  
            }
          }
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
    return null;
  }
}
