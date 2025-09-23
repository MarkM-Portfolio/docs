package com.ibm.docs.api.rest.sample.handlers;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.docs.api.rest.sample.util.FileUtil;
import com.ibm.docs.api.rest.sample.util.RequestParser;
import com.ibm.json.java.JSONObject;

public class GetMetaHandler implements GetHandler
{  
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    RequestParser parser = new RequestParser(request);
    String docId = parser.getDocId();
    
    ServletContext context = request.getSession().getServletContext();
    
    String filePath = context.getRealPath("/WEB-INF/samples/" + docId);
    String metaFilePath = filePath + ".meta";
    FileUtil file = new FileUtil(filePath, metaFilePath);
    JSONObject obj = file.getMeta();
    
    if(obj != null)
    {
      response.setContentType("text/x-json");
      response.setCharacterEncoding("UTF-8");
      obj.serialize(response.getWriter());
    }
    else
    {
      response.sendError(HttpServletResponse.SC_NO_CONTENT);
    }
  }

}
