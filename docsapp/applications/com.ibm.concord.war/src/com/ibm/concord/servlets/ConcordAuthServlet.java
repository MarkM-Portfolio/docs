package com.ibm.concord.servlets;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class ConcordAuthServlet
 * This is used for SAML authentication in SC
 */
public class ConcordAuthServlet extends HttpServlet
{
  private static final long serialVersionUID = 1L;

  private static String SHOULDNOTEXIST1 = "shouldnotexist1";  // url for not authenticated 

  private static String SHOULDNOTEXIST2 = "shouldnotexist2";  // url for verified SAML assertion

  private static String BACKFROMSAML = "backfromsaml";  // url for post SAML assertion, will be revised to shouldnotexist2 

  private static String LOGOUT = "logout";  // logout

  private static String EXPIRATION = "expiration";  // url for unauthenticated request of api, static resource, etc. 

  /**
   * @see HttpServlet#HttpServlet()
   */
  public ConcordAuthServlet()
  {
    super();
  }

  /**
   * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    handleAuthSAMLRequest(request, response);
  }

  /**
   * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    handleAuthSAMLRequest(request, response);
  }
  
  private void handleAuthSAMLRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    String uri = request.getRequestURI();
    if(uri != null)
    {
      if( uri.indexOf(SHOULDNOTEXIST1) >= 0 )
      {// 401
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return;
      }
      if( uri.indexOf(EXPIRATION) >= 0 )
      {// 403
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        return;
      }
      else if( uri.indexOf(LOGOUT) >= 0 || uri.indexOf(SHOULDNOTEXIST2) >= 0 )
      {// 200
        response.setStatus(HttpServletResponse.SC_OK);
        return;
      }
      else
      {
        response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
        return;
      }      
    }
  }

}
