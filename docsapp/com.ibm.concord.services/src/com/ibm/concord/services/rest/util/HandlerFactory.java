/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.services.rest.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.services.rest.DeleteHandler;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.HeadHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.concord.services.rest.ServiceConfig;

public class HandlerFactory
{
  private static final Logger LOG = Logger.getLogger(HandlerFactory.class.getName());

  /** Registry of handlers */
  private static List<HandlerEntry> handlers = null;

  /**
   * To Get the specific HandlerEntry due to the request
   * 
   * @param request
   * @return the wanted HandlerEntry instance
   */
  public static HandlerEntry getHandlerEntry(HttpServletRequest request)
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
    for (HandlerEntry entry : loadHandlerEntries())
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
   * To get all Handlers from /com/ibm/concord/services/rest/service-config.xml
   * 
   * @return
   */
  public static List<HandlerEntry> loadHandlerEntries()
  {
    if (handlers != null)
      return handlers;

    Properties registryProps = loadHandlers();
    // Instantiate the handler registry
    handlers = new ArrayList<HandlerEntry>(registryProps.size());

    // Iterate through the keys in the registry
    // Each key is a class name, the value is the mapping for the path
    for (Object entryKey : registryProps.keySet())
    {
      String handlerClassName = (String) entryKey;
      @SuppressWarnings("unchecked")
      HashMap<String, Object> props = (HashMap<String, Object>) registryProps.get(handlerClassName);
      String path = (String) props.get("url");
      Boolean isSecure = (Boolean) props.get("secure");
      Boolean isGateKeeper = (Boolean) props.get("gatekeeper");
      Boolean hasFormToken = (Boolean) props.get("formtoken");

      Object handler = instantiateHandler(handlerClassName);
      if (handler != null)
      {
        registerHandler(path, isSecure, isGateKeeper, hasFormToken, handler);
      }
    }
    return handlers;
  }

  private static Properties loadHandlers()
  {
    return ServiceConfig.getInstance().getHandlers();
  }

  private static Object instantiateHandler(String className)
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

  private static void registerHandler(String path, boolean isSecure, boolean isGateKeeper, boolean hasFormToken, Object handler)
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
    handlers.add(new HandlerEntry(path, handler, methods, isSecure, isGateKeeper, hasFormToken));

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("exiting: " + path + ", " + handler);
    }
  }

}
