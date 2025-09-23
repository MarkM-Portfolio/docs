/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.servlets;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.services.rest.handlers.VersionHandler;

public class DocsVersionServlet extends HttpServlet
{
  private static final long serialVersionUID = -4160232016899367202L;
  /** Logger */
  private static final Logger LOG = Logger.getLogger(DocsVersionServlet.class.getName());

  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  { 
    VersionHandler handler = new VersionHandler();
    try
    {
      handler.doGet(req, resp);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "exception catched", e);
      ServiceUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST);
    }
  }
}
