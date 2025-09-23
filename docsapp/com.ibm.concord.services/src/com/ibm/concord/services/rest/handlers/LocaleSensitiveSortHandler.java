/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.icu.text.Collator;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class LocaleSensitiveSortHandler implements PostHandler, PutHandler
{
  private static final Logger LOG = Logger.getLogger(LocaleSensitiveSortHandler.class.getName());

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {

    // user authentication
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    if (user == null)
    {
      LOG.log(Level.WARNING, "fobid to access, status code is " + HttpServletResponse.SC_FORBIDDEN);
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    // request
    JSONObject json = JSONObject.parse(request.getReader());
    String strLocale[] = json.get("lang").toString().split("-");
    String lang = strLocale[0].toLowerCase();
    String contry = "";
    if (strLocale.length > 1)
      contry = strLocale[1].toUpperCase();
    Locale locale = new Locale(lang, contry);
    final Collator collator = Collator.getInstance(locale);
    JSONObject dataJSON = (JSONObject) json.get("data");
    Set<Map.Entry<String, String>> dataSet = dataJSON.entrySet();
    List<Map.Entry<String, String>> dataList = new ArrayList<Map.Entry<String, String>>();
    // pour data into a list
    for (Iterator it = dataSet.iterator(); it.hasNext();)
      dataList.add((Map.Entry<String, String>) it.next());

    Boolean bAscending = (Boolean)json.get("bAscending");
    if(bAscending==null || bAscending)
    {
      // comparator
      Comparator<Map.Entry> comparator = new Comparator()
      {
        public int compare(Object element1, Object element2)
        {
          return collator.compare(((Map.Entry) element1).getValue(), ((Map.Entry) element2).getValue());
        }
      };
      // sort
      Collections.sort(dataList, comparator);
    }
    else
    {
      // comparator
      Comparator<Map.Entry> comparator = new Comparator()
      {
        public int compare(Object element1, Object element2)
        {
          return collator.compare(((Map.Entry) element2).getValue(), ((Map.Entry) element1).getValue());
        }
      };
      // sort
      Collections.sort(dataList, comparator);
    }
    // response
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);

    JSONObject resjson = new JSONObject();
    JSONArray items = new JSONArray();

    for (Iterator it = dataList.iterator(); it.hasNext();)
    {
      Map.Entry item = (Map.Entry) it.next();
      items.add(item.getKey());
    }

    resjson.put("items", items);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    resjson.serialize(response.getWriter());

    return;
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doPut(request, response);
  }
}
