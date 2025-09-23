/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.servlets;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.config.ConfigConstants;
import com.ibm.docs.common.util.HttpMultiDomainUtil;
import com.ibm.json.java.JSONArray;

/**
 * Servlet implementation class FormLoginServlet
 */
public class FormLoginServlet extends HttpServlet {
  private static final long serialVersionUID = 1L;
  private static String LOGIN_JSP = "/WEB-INF/pages/login.jsp";
  private static String LOGIN_JSP_MOBILE = "/WEB-INF/pages/mobilelogin.jsp";
  private static String REDIRECT_PARAM = "redirect";
  public FormLoginServlet()
  {
    super();
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Cache-Control", "no-cache");
    response.setDateHeader("Expires", 0L);
    response.addHeader("Cache-Control", "private,no-store,max-stale=0");

    String redirectUrl = request.getParameter(REDIRECT_PARAM);
    if (redirectUrl == null)
    {
      redirectUrl = getRedirectCookie(request);
    }
    
    if (redirectUrl != null)
    {
      setRedirectCookie(request, response, redirectUrl);
    }
    else {
      removeRedirectCookie(request, response);
    }
    String login_jsp = "";
    if(!isMobileRequest(request)){
    	login_jsp = LOGIN_JSP;
    }else{
    	login_jsp = LOGIN_JSP_MOBILE;
    }
    //for easy debugging in destop instead of mobile
    //login_jsp = LOGIN_JSP_MOBILE;
    request.setAttribute(REDIRECT_PARAM, redirectUrl);
//    HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
    JSONArray domainList = ConcordConfig.getInstance().getConfigList(ConfigConstants.DOMAIN_LIST_KEY);
    HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
    getServletContext().getRequestDispatcher(login_jsp).forward(request, response);
  }

  private boolean isMobileRequest(HttpServletRequest request){
	  String ua = request.getHeader("User-Agent");
	  ua = ua != null ? ua.toLowerCase() : null;
	  if(ua == null)
		  return false;
	  if(ua.indexOf("ipad")!=-1 && ua.indexOf("mobile")!= -1 && ua.indexOf("safari") == -1){
		  return true;
	  }
	  return false;
  }
  private String getRedirectCookie(HttpServletRequest request)
  {
    Cookie[] aCookies = request.getCookies();
    if(aCookies == null)
    	return null;
    for (int i = 0; i < aCookies.length; i++)
    {
      Cookie c = aCookies[i];
      if (c.getName().equals("WASReqURL"))
      {
        return c.getValue();
      }
    }
    return null;
  }

  private void setRedirectCookie(HttpServletRequest request, HttpServletResponse response, String redirectUrl)
  {
    String s2 = redirectUrl;
    ArrayList<Cookie> arraylist = new ArrayList<Cookie>(2);
    Cookie acookie[] = request.getCookies();
    if(acookie != null)
    {
      Cookie acookie1[] = acookie;
      int i = acookie1.length;
      for(int j = 0; j < i; j++)
      {
        Cookie cookie2 = acookie1[j];
        if("WASReqURL".equals(cookie2.getName()))
          arraylist.add(cookie2);
      }
    }
    Iterator<Cookie> iterator = arraylist.iterator();
    do
    {
      if(!iterator.hasNext())
        break;
      Cookie cookie1 = (Cookie)iterator.next();
      String s3 = cookie1.getPath();
      if(s3 == null)
        s3 = "/";
      cookie1.setPath("/");
      cookie1.setMaxAge(0);
      response.addCookie(cookie1);
    } while(true);

    if(arraylist.isEmpty())
    {
      Cookie cookie = new Cookie("WASReqURL", s2);
      cookie.setPath("/");
      cookie.setSecure(true);
      response.addCookie(cookie);
    }
  }

  private void removeRedirectCookie(HttpServletRequest request, HttpServletResponse response)
  {
    Cookie acookie[] = request.getCookies();
    if(acookie != null)
    {
      Cookie acookie1[] = acookie;
      int i = acookie1.length;
      int j = 0;
      do
      {
        if(j >= i)
          break;
        Cookie cookie = acookie1[j];
        if("WASReqURL".equals(cookie.getName()))
        {
          cookie.setMaxAge(0);
          if(cookie.getPath() == null)
            cookie.setPath("/");
          response.addCookie(cookie);
          break;
        }
        j++;
      } while(true);
    }

  }

}
