package com.ibm.conversion.service.rest.servlet;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.security.Principal;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.ThreadConfig;

public class ConversionLoginServlet extends HttpServlet
{

  /**
   * 
   */
  private static final long serialVersionUID = 1L;
  
  private static final Logger LOG = Logger.getLogger(ConversionLoginServlet.class.getName());
  
  private static String REDIRECT_PARAM = "redirect";
  
  public ConversionLoginServlet()
  {
    super();
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    response.setHeader("X-Frame-Options", "SAMEORIGIN");    
    Principal principal = request.getUserPrincipal();
    if (principal != null)
    {
      response.setHeader("X-LConn-Auth", "true");
      redirect(request, response);
    }
    else
    {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    }
  }
  
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    response.setHeader("X-Frame-Options", "SAMEORIGIN");
    Principal principal = request.getUserPrincipal();
    if (principal != null)
    {
      response.setHeader("X-LConn-Auth", "true");
      redirect(request, response);
    }
    else
    {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    }
  } 
  
  private void redirect(HttpServletRequest request, HttpServletResponse response)
  {
    String redirectUrl = request.getParameter(REDIRECT_PARAM);
    if (redirectUrl != null)
    {  
      try
      {
        redirectUrl = URLDecoder.decode(redirectUrl, "utf-8");        
        HttpServletResponseRedirectTrapper responseTrap = new HttpServletResponseRedirectTrapper(response);
        if (redirectUrl == null)
        {
          redirectUrl = responseTrap.getRedirectURL();
        }        
        URL redirectURL = new URL(redirectUrl);
        if (!request.getServerName().equalsIgnoreCase(redirectURL.getHost()))
        {
          redirectUrl = redirectURL.getFile();
        }      
        response.sendRedirect(response.encodeRedirectURL(redirectUrl));
      }
      catch (UnsupportedEncodingException e)
      {
        LOG.log(Level.WARNING,
            new LogEntry(ThreadConfig.getRequestID(), String.format("UnsupportedEncodingException when redirect: ", new Object[] { e }))
                .toString());
      }
      catch (MalformedURLException e)
      {
        LOG.log(Level.WARNING,
            new LogEntry(ThreadConfig.getRequestID(), String.format("MalformedURLException when redirect: ", new Object[] { e }))
                .toString());
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING,
            new LogEntry(ThreadConfig.getRequestID(), String.format("IOException when redirect: ", new Object[] { e })).toString());
      }
    }
  }
  
  static class HttpServletResponseRedirectTrapper extends HttpServletResponseWrapper
  {
    private String redirectURL;

    public HttpServletResponseRedirectTrapper(HttpServletResponse wrappedResponse) {
      super(wrappedResponse);
    }

    public void sendRedirect(String url) {
      this.redirectURL = url;
    }

    public String getRedirectURL() {
      return redirectURL;
    }
  }  
}
