/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.spellcheck.servlets;

import java.io.IOException;
import java.net.URLDecoder;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.Response;

import com.ibm.rcp.spellcheck.internal.services.SpellCheckService;

public class SpellCheckServlet extends HttpServlet
{
  private static final Logger LOGGER = Logger.getLogger(SpellCheckServlet.class.toString());

  private static final long serialVersionUID = 1L;

  private SpellCheckService service = null;

  public void init(ServletConfig config)
  {
    service = new SpellCheckService();
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    //path info of language
    String value = request.getPathInfo();
    String language = "en-US";
    if (value != null)
    {
      try
      {
        value = value.substring(1);
        language = URLDecoder.decode(value, "UTF-8");
      }
      catch(Exception e)
      {
        LOGGER.log(Level.WARNING, "failed to decode language from path " + value + ". The default is en-US" , e);
      }
    }
    //query string output
    String queryString = request.getQueryString();
    LOGGER.log(Level.FINER, "query string is " + queryString);
    String parameters[] = queryString.split("&");
    String text = "";
    if(parameters != null && parameters.length != 0)
    {
      String pair[] = parameters[0].split("=");
      if(pair != null && pair.length != 0)
      {
        LOGGER.log(Level.FINER, "text value before decoding is " + pair[1]);
        try
        {
          text = URLDecoder.decode(pair[1], "UTF-8");  
        }
        catch(Exception e)
        {
          LOGGER.log(Level.WARNING, "failed to decode word " + value, e);
        }
      }
    }
    value = request.getParameter("suggestions");
    int suggestion = 0;
    if (value != null)
    {
      try
      {
        suggestion = Integer.parseInt(value);
      }
      catch (NumberFormatException e)
      {
        LOGGER.log(Level.WARNING, "Error happened whening parsing suggestions " + value + " to int value");
      }
    }
    String format = request.getParameter("format");
    LOGGER.log(Level.FINER, "Language is " + language + ". content is " + text + ". suggestion number is " + suggestion + ". format is " + format);
    Response checkResponse = service.check(language, text, suggestion, format, false);
    String retValue = checkResponse.getEntity().toString();
    LOGGER.log(Level.FINER, "the return value from spellcheck service is " + retValue);
    response.setContentType("application/x-json");
    response.setCharacterEncoding("UTF-8");
    response.setHeader("X-Frame-Options", "SAMEORIGIN");
    response.getOutputStream().write(retValue.getBytes());
  }
}
