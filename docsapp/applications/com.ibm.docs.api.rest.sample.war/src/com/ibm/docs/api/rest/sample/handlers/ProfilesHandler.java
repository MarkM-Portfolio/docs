package com.ibm.docs.api.rest.sample.handlers;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.docs.api.rest.sample.util.FileUtil;
import com.ibm.docs.api.rest.sample.util.RequestParser;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ProfilesHandler implements GetHandler
{

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    ServletContext context = request.getSession().getServletContext();
    
    String id = request.getParameter("userid");
    
    String filePath = context.getRealPath("/WEB-INF/samples/");
    String metaFilePath = filePath + "profiles.json";
    FileUtil file = new FileUtil(filePath, metaFilePath);
    JSONObject obj = file.getMeta();
    
    JSONObject ret = null;
    if(obj != null)
    {
      JSONArray array = (JSONArray)obj.get("items");
      if (id != null)
      {
        array.size();
        for(int i=0; i<array.size(); i++)
        {
          ret = (JSONObject) array.get(i);
          if (id.equalsIgnoreCase((String)ret.get("id")))
          {
            response.setContentType("text/x-json");
            response.setCharacterEncoding("UTF-8");
            ret.serialize(response.getWriter());   
            return;
          }
        }
      }
      else
      {
        ret = (JSONObject) array.get(0);
        response.setContentType("text/x-json");
        response.setCharacterEncoding("UTF-8");
        ret.serialize(response.getWriter());   
        return;        
      }
    }
    response.sendError(HttpServletResponse.SC_NO_CONTENT);
  }
}
