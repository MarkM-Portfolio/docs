/**
 * 
 */
package com.ibm.concord.filters;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import com.ibm.concord.platform.exceptions.InvalidVersionException;
import com.ibm.concord.platform.util.ConcordVersionCheck;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;

public class VersionCheckFilter implements Filter
{

  private static final Logger LOG = Logger.getLogger(VersionCheckFilter.class.getName());

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.Filter#destroy()
   */
  public void destroy()
  {
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
   */
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    if (ConcordVersionCheck.isValidVersion())
      chain.doFilter(request, response);
    else
    {
      LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), "HCL Docs version is incompatible with Conversion! Please make sure they are using the same version.").toString()); 
      request.setAttribute("error_code", InvalidVersionException.EC_INVALID_VERSION);
      request.getRequestDispatcher("/WEB-INF/pages/error.jsp").forward(request, response);
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
   */
  public void init(FilterConfig arg0) throws ServletException
  {
  }

}
