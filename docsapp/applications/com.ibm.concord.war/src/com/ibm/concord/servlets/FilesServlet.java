package com.ibm.concord.servlets;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.Platform;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;

public class FilesServlet extends HttpServlet
{
  private static final Logger LOG = Logger.getLogger(FilesServlet.class.getName());
  private static final long serialVersionUID = 1L;

  private String successView = "/WEB-INF/pages/mobilefiles.jsp";

  private String failView = "/login?error=true";
  
  private String blankView = "/WEB-INF/pages/mobileblank.jsp";

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  {
    doPost(req, resp);
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  {
    boolean valid = validUserAuthority(req, resp);
    if (valid)
    {
      if (isMobileRequest(req))
      {
        RepositoryProviderRegistry registry = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(RepositoryProviderRegistry.class);
        String repoId = registry.getDefaultId();
        if(repoId == null){
           LOG.log(Level.WARNING,"Can not find default repository");
           repoId = "concord.storage";
        }
        req.setAttribute("repoId", registry.getDefaultId());
        if( req.getRequestURI().endsWith( "/blank" ) )
        {
          getServletContext().getRequestDispatcher(blankView).forward(req, resp);
        }
        else
        {
          getServletContext().getRequestDispatcher(successView).forward(req, resp);
        }
        
      }
      else
      {
        resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        resp.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    else
    {
      getServletContext().getRequestDispatcher(failView).forward(req, resp);
    }
  }

  private boolean isMobileRequest(HttpServletRequest request)
  {
    // for testing&debuging in desktop
    String browserLimited = getInitParameter("browserLimited");
    if ("false".equals(browserLimited))
    {
      return true;
    }
    String ua = request.getHeader("User-Agent");
    ua = ua != null ? ua.toLowerCase() : null;
    if (ua == null)
      return false;
    if ((ua.indexOf("ipad") != -1 && ua.indexOf("mobile") != -1 && ua.indexOf("safari") == -1) 
        || (ua.indexOf("iphone") != -1 && ua.indexOf("mobile") != -1))
    {
      return true;
    }
    return false;
  }

  // it's just a test method
  private boolean validUserAuthority(HttpServletRequest req, HttpServletResponse resp)
  {
    return true;
  }

}
