/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class ObjSvrParameters
{
  private Map<String, String> args;

  private ObjSvrParameters()
  {
    args = new HashMap<String, String>();
  }

  public Map<String, String> getArguments()
  {
    return args;
  }

  private void addArgument(String key, String value)
  {
    args.put(key, value);
  }

  public static ObjSvrParameters parseFrom(HttpServletRequest request)
  {
    ObjSvrParameters p = new ObjSvrParameters();
    if (request.getMethod().equalsIgnoreCase("get"))
    {
      Enumeration<?> e = request.getParameterNames();
      for (; e.hasMoreElements();)
      {
        String key = (String) e.nextElement();
        p.addArgument(key, request.getParameter(key));
      }
    }
    return p;
  }
}
