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
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.Servlet;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.spi.exception.AccessException;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class Service extends HttpServlet implements Servlet
{

  /**
   * 
   */
  private static final long serialVersionUID = 1L;

  /** Logger */
  private static final Logger LOG = Logger.getLogger(Service.class.getName());

  /** Registry of handlers */
  private List<HandlerEntry> handlers;

  /** Entry class for each handler in the registry */
  private static class HandlerEntry
  {
    /** The path pattern for this handler */
    private Pattern pathPattern;

    /**
     * The handler itself. It implements one or more of the Atom*Handler interfaces
     */
    private Object handler;

    /** Set of the methods handled by the handler (in uppercase) */
    private Set<String> methods;

    /** The set of methods handled by the handler in string form */
    private String allowedMethods;

    private boolean isSecure;
    
    /** Constructor */
    public HandlerEntry(String path, Object handler, Set<String> methods, boolean isSecure)
    {
      this.pathPattern = Pattern.compile(path);
      this.handler = handler;
      this.methods = methods;
      this.isSecure = isSecure;
      StringBuilder allowedMethodsBuf = new StringBuilder(35);
      for (String method : methods)
      {
        if (allowedMethodsBuf.length() > 0)
        {
          allowedMethodsBuf.append(", ");
        }
        allowedMethodsBuf.append(method);
      }
      if (allowedMethodsBuf.length() > 0)
      {
        allowedMethodsBuf.append(", ");
      }
      allowedMethodsBuf.append("OPTIONS");
      allowedMethods = allowedMethodsBuf.toString();
    }

    /**
     * Determine if the given path matches the pattern for this entry
     * 
     * @param path
     *          to compare
     * @return a matcher object if a match was found, null otherwise
     */
    public Matcher match(String path)
    {
      Matcher matcher = pathPattern.matcher(path);
      Matcher result = matcher.matches() ? matcher : null;
      return result;
    }

    /**
     * Determine if this entry supports the given method
     * 
     * @param method
     * @return true if the method is supported
     */
    public boolean supports(String method)
    {
      boolean containsMethod = methods.contains(method.toUpperCase());
      return containsMethod;
    }

    /**
     * @return the handler
     */
    public Object getHandler()
    {
      return handler;
    }

    /**
     * @return allowed methods
     */
    public String getAllowedMethods()
    {
      return allowedMethods;
    }
    
    public boolean isSecure()
    {
      return isSecure;
    }
  }

  /**
   * Initializes the servlet handler registry
   * 
   * @see javax.servlet.GenericServlet#init(javax.servlet.ServletConfig)
   */
  public void init(ServletConfig servletConfig) throws ServletException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("entering: " + servletConfig);
    }

    super.init(servletConfig);

    Properties registryProps = loadHandlers();
    // Instantiate the handler registry
    handlers = new ArrayList<HandlerEntry>(registryProps.size());

    // Iterate through the keys in the registry
    // Each key is a class name, the value is the mapping for the path
    for (Object entryKey : registryProps.keySet())
    {
      String handlerClassName = (String) entryKey;
      HashMap<String, Object> props = (HashMap<String, Object>) registryProps.get(handlerClassName);
      String path = (String)props.get("url");
      Boolean isSecure = (Boolean)props.get("secure");
      Object handler = instantiateHandler(handlerClassName);
      if (handler != null)
      {
        registerHandler(path, isSecure, handler);
      }
    }
  }

  protected Properties loadHandlers()
  {
    return ServiceConfig.getInstance().getHandlers();
  }

  protected Object instantiateHandler(String className)
  {
    Class<?> handlerClass = null;
    Object handler = null;
    try
    {
      handlerClass = Class.forName(className);
    }
    catch (ClassNotFoundException e)
    {
      LOG.warning("Could not find handler class " + className);
    }
    catch (Throwable e1)
    {
      // Catching Throwable to handle scenarios where the class fails to initialize properly
      LOG.warning("Could not initialize handler class " + className + ": " + e1.getMessage());
    }

    if (handlerClass != null)
    {
      try
      {
        handler = handlerClass.newInstance();
      }
      catch (IllegalAccessException e)
      {
        LOG.warning("Insufficient authority to access class " + className + " or its constructor.");
      }
      catch (InstantiationException e)
      {
        LOG.warning("Class " + className
            + " could not be instantiated. It is either an interface, abstract class or does not have the appropriate constructor.");
      }
    }
    return handler;
  }

  private void registerHandler(String path, boolean isSecure, Object handler)
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("entering: " + path + ", " + handler);
    }
    Set<String> methods = new HashSet<String>();
    if (handler instanceof GetHandler)
    {
      methods.add("GET");
    }
    if (handler instanceof PostHandler)
    {
      methods.add("POST");
    }
    if (handler instanceof PutHandler)
    {
      methods.add("PUT");
    }
    if (handler instanceof DeleteHandler)
    {
      methods.add("DELETE");
    }
    if (handler instanceof HeadHandler)
    {
      methods.add("HEAD");
    }
    handlers.add(new HandlerEntry(path, handler, methods, isSecure));
    
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("exiting: " + path + ", " + handler);
    }
  }

  /**
   * (non-Javadoc)
   * 
   * @see javax.servlet.http.HttpServlet#service(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    // need to make sure the default encoding on the request is UTF-8
    request.setCharacterEncoding("UTF-8");

    // Check if it's a Mozilla prefetch request first. If it is, don't do
    // anything else.
    if (isPrefetchRequest(request))
    {
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    }
    else
    {
      // Find a handler entry for this request
      HandlerEntry handlerEntry = getHandlerEntry(request);
      if (handlerEntry == null)
      {
        // If no handler found, respond with 404 status
        // TODO: Translate this warning message
        LOG.log(Level.WARNING, "Could not find a handler for request with path info " + request.getPathInfo());
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      }
      else
      {

        String method = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(method))
        {
          if (LOG.isLoggable(Level.FINER))
          {
            LOG.finer("service: Options method requested");
          }
          
          request.setAttribute("atom.handler.entry", handlerEntry);
          doOptions(request, response);
        }
        else
        {
          // If the handler entry doesn't support the method, return an error
          // saying we don't support the method
          if (!handlerEntry.supports(method))
          {
            if (LOG.isLoggable(Level.FINER))
            {
              LOG.finer("service: The handler entry does not support the method requested.");
            }
            
            response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            response.setHeader("Allow", handlerEntry.getAllowedMethods());
          }
          else
          {
            // If everything goes right, set a request attribute with the
            // handler
            // for the request and handle the service call as normal
            request.setAttribute("atom.handler", handlerEntry.getHandler());
            super.service(request, response);
          }
        }
      }
    }
  }

  private HandlerEntry getHandlerEntry(HttpServletRequest request)
  {
    // Get the path from the request
    String path = request.getPathInfo();
    if (path == null)
    {
      path = "";
    }
    else if (path.endsWith("/"))
    {
      // Ensure that we don't have any trailing "/"'s at the end of the path
      // string
      while (path.endsWith("/") && path.length() > 1)
      {
        path = path.substring(0, path.length() - 1);
      }
    }

    HandlerEntry result = null;
    // Match the request to a handler for it
    for (HandlerEntry entry : handlers)
    {
      Matcher matcher = entry.match(path);
      if (matcher != null)
      {
        // Store the matcher for later use by the handler
        request.setAttribute("path.matcher", matcher);

        // Set the result of this method and break out of the loop
        result = entry;
        break;
      }
    }
    return result;
  }

  /**
   * @see javax.servlet.http.HttpServlet#doHead(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  protected void doHead(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    HeadHandler handler = (HeadHandler) request.getAttribute("atom.handler");
    try
    {
      handler.doHead(request, response);
    }
    catch (AccessException e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
      response.sendError(e.getCode());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
    }
  }

  /**
   * @see javax.servlet.http.HttpServlet#doOptions(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    HandlerEntry handlerEntry = (HandlerEntry) request.getAttribute("atom.handler.entry");
    response.setStatus(HttpServletResponse.SC_OK);
    response.setHeader("Allow", handlerEntry.getAllowedMethods());
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.http.HttpServlet#doDelete(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    DeleteHandler handler = (DeleteHandler) request.getAttribute("atom.handler");
    try
    {
      handler.doDelete(request, response);
    }
    catch (AccessException e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
      response.sendError(e.getCode());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
    }
    finally
    {
      closeWriter(response);
    }
  }

  /*
   * (non-Java-doc)
   * 
   * @see javax.servlet.http.HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    request.setAttribute("servletcontext", getServletContext());
    GetHandler handler = (GetHandler) request.getAttribute("atom.handler");
    try
    {
      handler.doGet(request, response);
    }
    catch (AccessException e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
      response.sendError(e.getCode());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
    }
    finally
    {
      closeWriter(response);
    }
  }

  /*
   * (non-Java-doc)
   * 
   * @see javax.servlet.http.HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    try
    {
      PostHandler handler = (PostHandler) request.getAttribute("atom.handler");
      try
      {
        handler.doPost(request, response);
      }
      catch (AccessException e)
      {
        LOG.log(Level.WARNING, "exception catched", e);
        response.sendError(e.getCode());
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "exception catched", e);
      }
    }
    finally
    {
      closeWriter(response);
    }

  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.http.HttpServlet#doPut(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    PutHandler handler = (PutHandler) request.getAttribute("atom.handler");
    try
    {
      handler.doPut(request, response);
    }
    catch (AccessException e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
      response.sendError(e.getCode());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
    }
    finally
    {
      closeWriter(response);
    }
  }

  /**
   * Determine if the request is a Mozilla prefetch request
   * 
   * @param request
   *          the servlet request
   * @return true if the request is a Mozilla prefetch request
   */
  protected boolean isPrefetchRequest(HttpServletRequest request)
  {
    boolean result = false;
    Enumeration<?> headers = request.getHeaders("X-moz");
    while (headers.hasMoreElements())
    {
      Object header = headers.nextElement();
      if ("prefetch".equals(header))
      {
        result = true;
        break;
      }
    }
    return result;
  }

  /**
   * Close the response writer in case it is not
   */
  private void closeWriter(HttpServletResponse response)
  {
    try
    {
      PrintWriter writer = response.getWriter();
      if (writer != null)
        writer.close();
    }
    catch (Throwable e)
    {

    }
  }

}
