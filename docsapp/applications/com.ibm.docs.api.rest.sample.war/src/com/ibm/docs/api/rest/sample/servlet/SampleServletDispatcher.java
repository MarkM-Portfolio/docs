package com.ibm.docs.api.rest.sample.servlet;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.docs.api.rest.sample.handlers.GetHandler;
import com.ibm.docs.api.rest.sample.handlers.PostHandler;

/**
 * Servlet implementation class SampleServletDispatcher
 */
public class SampleServletDispatcher extends HttpServlet
{
  private static final long serialVersionUID = 1L;

  private List<HandlerEntry> handlers;

  private static class HandlerEntry
  {
    private Pattern pathPattern;

    private Object handler;

    public HandlerEntry(String path, Object handler, Set<String> methods)
    {
      this.pathPattern = Pattern.compile(path);
      this.handler = handler;
    }

    public Matcher match(String path)
    {
      Matcher matcher = pathPattern.matcher(path);
      Matcher result = matcher.matches() ? matcher : null;
      return result;
    }

    public Object getHandler()
    {
      return handler;
    }
  }

  /**
   * @see HttpServlet#HttpServlet()
   */
  public SampleServletDispatcher()
  {
    super();
    init();
  }
  
  public void init()
  {
    Properties registryProps = HandlerConfig.getInstance().getHandlers();
    handlers = new ArrayList<HandlerEntry>(registryProps.size());
    
    for (Object entryKey : registryProps.keySet())
    {
      String handlerClassName = (String) entryKey;
      @SuppressWarnings("unchecked")
      HashMap<String, Object> props = (HashMap<String, Object>) registryProps.get(handlerClassName);
      String path = (String) props.get("url");
      Object handler = instantiateHandler(handlerClassName);
      if (handler != null)
      {
        registerHandler(path, handler);
      }
    }
  }
  
  private Object instantiateHandler(String className)
  {
    Class<?> handlerClass = null;
    Object handler = null;
    try
    {
      handlerClass = Class.forName(className);
    }
    catch (ClassNotFoundException e)
    {
    }
    catch (Throwable e1)
    {
    }

    if (handlerClass != null)
    {
      try
      {
        handler = handlerClass.newInstance();
      }
      catch (IllegalAccessException e)
      {
      }
      catch (InstantiationException e)
      {
      }
    }
    return handler;
  }
  
  private void registerHandler(String path, Object handler)
  {
    Set<String> methods = new HashSet<String>();
    if (handler instanceof GetHandler)
    {
      methods.add("GET");
    }
    if (handler instanceof PostHandler)
    {
      methods.add("POST");
    }
    handlers.add(new HandlerEntry(path, handler, methods));
  }
  
  private HandlerEntry getHandlerEntry(HttpServletRequest request)
  {
    String path = request.getPathInfo();
    if (path == null)
    {
      path = "";
    }
    else if (path.endsWith("/"))
    {
      while (path.endsWith("/") && path.length() > 1)
      {
        path = path.substring(0, path.length() - 1);
      }
    }

    HandlerEntry result = null;
    for (HandlerEntry entry : handlers)
    {
      Matcher matcher = entry.match(path);
      if (matcher != null)
      {       
        result = entry;
        break;
      }
    }
    return result;
  }

  /**
   * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    try
    {      
      HandlerEntry handlerEntry = getHandlerEntry(request);      
      GetHandler handler = (GetHandler) handlerEntry.getHandler();
      handler.doGet(request, response);
    }
    catch (Exception e)
    {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
    }
  }
  
  /**
   * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    try
    {      
      HandlerEntry handlerEntry = getHandlerEntry(request);      
      PostHandler handler = (PostHandler) handlerEntry.getHandler();
      handler.doPost(request, response);
    }
    catch (Exception e)
    {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
    }
  }

}
