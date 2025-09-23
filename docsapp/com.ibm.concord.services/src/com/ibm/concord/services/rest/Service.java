/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

/**
 * 
 */
package com.ibm.concord.services.rest;

import java.io.IOException;
import java.util.Enumeration;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Servlet;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.auth.CsrfAuth;
import com.ibm.concord.services.rest.util.HandlerEntry;
import com.ibm.concord.services.rest.util.HandlerFactory;
import com.ibm.concord.spi.exception.AccessException;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class Service extends HttpServlet implements Servlet
{
  static
  {
    // TODO temporarily register Smart Table Storage here
    // need to refactor when designing dynamic loading
    // SmartTableType.registerTableStore(new TableStore());
  }

  /**
   * 
   */
  private static final long serialVersionUID = 1L;

  /** Logger */
  private static final Logger LOG = Logger.getLogger(Service.class.getName());

  /**
   * Initializes the servlet handler registry
   * 
   * @see javax.servlet.GenericServlet#init(javax.servlet.ServletConfig)
   */
  public void init(ServletConfig servletConfig) throws ServletException
  {
    LOG.entering(this.getClass().getName(), "init", new Object[] { servletConfig.getServletName() });
    super.init(servletConfig);
    LOG.exiting(this.getClass().getName(), "init", new Object[] { servletConfig.getServletName() });
  }

  /**
   * (non-Javadoc)
   * 
   * @see javax.servlet.http.HttpServlet#service(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    LOG.entering(this.getClass().getName(), "service", new Object[] { request.getAuthType(), request.getMethod(), request.getRequestURL() });
    // need to make sure the default encoding on the request is UTF-8
    request.setCharacterEncoding("UTF-8");

    // Check if it's a Mozilla prefetch request first. If it is, don't do
    // anything else.
    if (isPrefetchRequest(request))
    {
      LOG.log(Level.WARNING, "Request is forbidden because it's a prefetch request.");
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    }
    else
    {
      // Find a handler entry for this request
      HandlerEntry handlerEntry = HandlerFactory.getHandlerEntry(request);
      if (handlerEntry == null)
      {
        // If no handler found, respond with 404 status
        // TODO: Translate this warning message
        LOG.log(Level.WARNING, "Could not find a handler for request with path info " + request.getPathInfo());
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      }
      else
      {
        // check secure token, for CSRF and Javascript Hijacking
        if (handlerEntry.isSecure() && !CsrfAuth.getInstance().verify(request))
        {
          // No form token or the csrf token in header is not empty
          if (!handlerEntry.hasFormToken() || !CsrfAuth.getInstance().isEmptyToken(request))
          {
            LOG.logp(Level.SEVERE, "Service", "service", "Csrf authentication fails, resource requested: " + request.getPathInfo());
            ServiceUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED);
            return;
          }
        }

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
    LOG.exiting(this.getClass().getName(), "service", new Object[] { request.getAuthType(), request.getMethod(), request.getRequestURL() });
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
      ServiceUtil.sendError(response, e.getCode());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
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
      ServiceUtil.sendError(response, e.getCode());

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
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
      ServiceUtil.sendError(response, e.getCode());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
    }
  }

  /*
   * (non-Java-doc)
   * 
   * @see javax.servlet.http.HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    PostHandler handler = (PostHandler) request.getAttribute("atom.handler");
    try
    {
      handler.doPost(request, response);
    }
    catch (AccessException e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
      ServiceUtil.sendError(response, e.getCode());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
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
      ServiceUtil.sendError(response, e.getCode());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
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
}
