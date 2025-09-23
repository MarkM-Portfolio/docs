/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.sanity.servlet;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.HttpStatus;

import com.ibm.docs.sanity.util.FileUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author dragon
 */
public class RestAPITestService extends HttpServlet
{
  private static final long serialVersionUID = 8144660549530240280L;

  private static final Logger LOG = Logger.getLogger(RestAPITestService.class.getName());

  private List<RestAPIHandlerEntry> apiHandlers = null;

  public RestAPITestService()
  {
  }

  public void init() throws ServletException
  {
    this.apiHandlers = new ArrayList<RestAPIHandlerEntry>();
    this.apiHandlers.add(new RestAPIHandlerEntry("/comment/([^/]+)/getCommentUserList", "CommentUserList"));
    this.apiHandlers.add(new RestAPIHandlerEntry("/mention", "Mention"));
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.GenericServlet#destroy()
   */
  public void destroy()
  {
    this.apiHandlers = null;
  }

  /**
   * This method is used to get sample mention user list.
   * 
   * @param httpServletRequest
   * @param httpServletResponse
   * @throws IOException
   */
  public void getCommentUserList(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException
  {
    LOG.entering(this.getClass().getName(), "getCommentUserList");
    ServletContext servletContext = httpServletRequest.getSession().getServletContext();
    String realPath = servletContext.getRealPath("/WEB-INF/samples/");
    String profilePath = realPath + "MentionUserList.json";
    JSONObject users = FileUtil.getJson(profilePath);
    if (users != null)
    {
      httpServletResponse.setContentType("text/x-json");
      httpServletResponse.setCharacterEncoding("UTF-8");
      String keyword = httpServletRequest.getParameter("name");
      keyword = new String(keyword.getBytes("ISO-8859-1"), "UTF-8");
      JSONArray array = (JSONArray) users.get("items");
      JSONArray result = new JSONArray();

      try
      {
        Thread.sleep(1000);
      }
      catch (InterruptedException e)
      {
      }

      for (int i = 0; i < array.size(); i++)
      {
        JSONObject user = (JSONObject) array.get(i);
        String name = replaceBlank((String) user.get("name"));

        if ((name.length() >= keyword.length() && name.substring(0, keyword.length()).equals(keyword)) || keyword.equals(""))
        {
          result.add(user);
        }
      }
      users.put("items", result);
      users.serialize(httpServletResponse.getWriter());
      return;
    }
    httpServletResponse.sendError(HttpStatus.SC_NO_CONTENT);
    LOG.exiting(this.getClass().getName(), "getCommentUserList");
  }

  private String replaceBlank(String str)
  {
    String dest = "";
    if (str != null)
    {
      Pattern p = Pattern.compile("\\s*|\t|\r|\n");
      Matcher m = p.matcher(str);
      dest = m.replaceAll("");
    }
    return dest;
  }

  public void postMention(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException
  {
    LOG.entering(this.getClass().getName(), "postMention");
    try
    {
      /*
       * type - There are two kinds of types. One is comment and another is reply. author - The user's id who is mention others in a comment
       * or reply. mentionList - All id information of mentioned users in a comment or a reply. Indeed, it is an id's array. owner - The
       * author of the current comment. If the type's value is "comment". The author's value is the same as the owner's obviously. link -
       * The URL of the current Docs file. fileid - The id of the current Docs file. filename - The title information of the current Docs
       * file content - The content of the comment or reply commentsid -The unique id of the comment.
       */
      JSONObject jsonBody = JSONObject.parse(httpServletRequest.getReader());
      LOG.log(Level.INFO, "The posted Comment & Mention data is: " + jsonBody.toString());

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception happens while processing Comment & Mention notification", e);
      httpServletResponse.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    LOG.exiting(this.getClass().getName(), "postMention");
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
  {
    LOG.entering(this.getClass().getName(), "doGet", req.getPathInfo());
    try
    {
      String func = getHandlerEntry(req).getAPI();
      for (Method method : getClass().getMethods())
      {
        if (generateAPIName(req, func).toUpperCase().equals(method.getName().toUpperCase()))
        {
          method.invoke(this, new Object[] { req, resp });
          return;
        }
      }
    }
    catch (SecurityException e)
    {
      LOG.log(Level.SEVERE, "SecurityException occur .", e);
      try
      {
        resp.sendError(HttpStatus.SC_BAD_REQUEST);
      }
      catch (IOException e1)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e1);
      }
    }
    catch (NullPointerException e2)
    {
      LOG.log(Level.SEVERE, "NullPointerException occur .", e2);
      try
      {
        resp.sendError(HttpStatus.SC_NO_CONTENT);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e);
      }
    }
    catch (Exception e3)
    {
      LOG.log(Level.SEVERE, "Exception occur .", e3);
      try
      {
        resp.sendError(HttpStatus.SC_NOT_FOUND);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e);
      }
    }
    LOG.exiting(this.getClass().getName(), "doGet");
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  {
    LOG.entering(this.getClass().getName(), "doPost", req.getPathInfo());
    try
    {
      String func = getHandlerEntry(req).getAPI();
      for (Method method : getClass().getMethods())
      {
        if (generateAPIName(req, func).toUpperCase().equals(method.getName().toUpperCase()))
        {
          method.invoke(this, new Object[] { req, resp });
          return;
        }
      }
    }
    catch (SecurityException e)
    {
      LOG.log(Level.SEVERE, "SecurityException occur .", e);
      try
      {
        resp.sendError(HttpStatus.SC_BAD_REQUEST);
      }
      catch (IOException e1)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e1);
      }
    }
    catch (NullPointerException e2)
    {
      LOG.log(Level.SEVERE, "NullPointerException occur .", e2);
      try
      {
        resp.sendError(HttpStatus.SC_NO_CONTENT);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e);
      }
    }
    catch (Exception e3)
    {
      LOG.log(Level.SEVERE, "Exception occur .", e3);
      try
      {
        resp.sendError(HttpStatus.SC_NOT_FOUND);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IOException occur .", e);
      }
    }
    LOG.exiting(this.getClass().getName(), "doPost");
  }

  private RestAPIHandlerEntry getHandlerEntry(HttpServletRequest httpServletRequest)
  {
    LOG.entering(this.getClass().getName(), "RestAPIHandlerEntry");
    String str = "";
    String pathInfo = httpServletRequest.getPathInfo();
    if (pathInfo != null)
    {
      if (pathInfo.endsWith("/"))
      {
        while (pathInfo.endsWith("/") && pathInfo.length() > 1)
        {
          pathInfo = pathInfo.substring(0, pathInfo.length() - 1);
        }
      }
      str = pathInfo;
    }
    RestAPIHandlerEntry entry = null;
    for (RestAPIHandlerEntry apiHandlerEntry : this.apiHandlers)
    {
      if (apiHandlerEntry.match(str) != null)
      {
        entry = apiHandlerEntry;
        break;
      }
    }
    LOG.exiting(this.getClass().getName(), "doPost", "RestAPIHandlerEntry : " + entry.toString());
    return entry;
  }

  private String generateAPIName(HttpServletRequest httpServletRequest, String str)
  {
    LOG.entering(this.getClass().getName(), "generateAPIName");
    String method = httpServletRequest.getMethod();
    StringBuffer sb = new StringBuffer();
    if ("GET".equals(method))
    {
      return sb.append("get").append(str).toString();
    }
    if ("POST".equals(method))
    {
      return sb.append("post").append(str).toString();
    }
    LOG.exiting(this.getClass().getName(), "generateAPIName", "str : " + str);
    return str;
  }

  private class RestAPIHandlerEntry
  {
    private String api;

    private Pattern pathPattern;

    public RestAPIHandlerEntry(String str, String api)
    {
      this.pathPattern = Pattern.compile(str);
      this.api = api;
    }

    public Matcher match(String str)
    {
      Matcher matcher = this.pathPattern.matcher(str);
      if (matcher.matches())
      {
        return matcher;
      }
      return null;
    }

    public String getAPI()
    {
      return this.api;
    }

    /*
     * (non-Javadoc)
     * 
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString()
    {
      return "RestAPIHandlerEntry [api=" + api + ", pathPattern=" + pathPattern + "]";
    }
  }
}
