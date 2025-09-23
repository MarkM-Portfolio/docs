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

import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Entry class for each handler in the registry
 * 
 */
public class HandlerEntry
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

  private boolean isGateKeeper;

  private boolean hasFormToken;

  /** Constructor */
  public HandlerEntry(String path, Object handler, Set<String> methods, boolean isSecure, boolean isGateKeeper, boolean hasFormToken)
  {
    this.pathPattern = Pattern.compile(path);
    this.handler = handler;
    this.methods = methods;
    this.isSecure = isSecure;
    this.isGateKeeper = isGateKeeper;
    this.hasFormToken = hasFormToken;
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

  public boolean isGateKeeper()
  {
    return isGateKeeper;
  }

  public boolean hasFormToken()
  {
    return hasFormToken;
  }
}
