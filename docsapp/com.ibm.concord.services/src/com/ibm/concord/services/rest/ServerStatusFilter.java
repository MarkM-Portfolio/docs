/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.services.rest;

import java.io.IOException;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock.ReadLock;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.services.rest.util.HandlerEntry;
import com.ibm.concord.services.rest.util.HandlerFactory;
import com.ibm.concord.services.servlet.SmartCloudInitializer;
import com.ibm.concord.services.servlet.SmartCloudInitializer.ServerStatus;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.DocumentSession.SessionStatus;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.json.java.JSONObject;

public class ServerStatusFilter  implements Filter
{
  private static Logger LOG = Logger.getLogger(ServerStatusFilter.class.getName());
  
  private static Pattern PATTERN_DOCUMENT_APP_REQUEST = Pattern.compile("/.+/app/[^/]+/([^/]+)/([^/?]+).*");
  
  private static boolean IS_CLOUD;
  
  @Override
  public void init(FilterConfig config) throws ServletException
  {
    IS_CLOUD = Platform.getConcordConfig().isCloud();
  }

  @Override
  public void destroy()
  {
    
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    String repoId = null;
    String docId = null;
    
    if (IS_CLOUD)
    {
      HttpServletRequest httpRequest = (HttpServletRequest) request;
      ServerStatus status = SmartCloudInitializer.getServerStatus();
      if (status == ServerStatus.INACTIVATING)
      {
        String servletPath = httpRequest.getServletPath();
        if ("/app/doc".equals(servletPath)) {
          Matcher m = PATTERN_DOCUMENT_APP_REQUEST.matcher(httpRequest.getRequestURI());
          if (m.matches()) {
            repoId = m.group(1);
            docId = m.group(2);
          }
        } else if("/api".equals(servletPath)) {
          HandlerEntry handlerEntry = HandlerFactory.getHandlerEntry(httpRequest);
          if (handlerEntry != null)
          {
            Matcher m = (Matcher) request.getAttribute("path.matcher");
            if (m.matches() && m.groupCount() >= 2) {
	            repoId = m.group(1);
	            docId = m.group(2);
            }
          }
        }
        if (docId != null) 
        {
          DocumentSession session = SessionManager.getInstance().getSession(repoId, docId);
          if (session != null)
          {
            ReentrantReadWriteLock inactiveLock = session.getInactiveLock();
            ReadLock lock = inactiveLock.readLock();
            lock.lock();
            try
            {
              SessionStatus sessionStatus = session.getStatus();
              if (sessionStatus == SessionStatus.ACTIVE)
              {
                chain.doFilter(request, response);
                return;
              }
              LOG.log(Level.INFO, "session status for " + docId + " is " + sessionStatus + ". Return 503 directly.");
            }
            catch (Exception e)
            {
              LOG.log(Level.WARNING,
                  "Exception happens for request " + httpRequest.getRequestURI() + " when server is inactivating status", e);
            }
            finally
            {
              try
              {
                lock.unlock();
              }
              catch (Exception e)
              {
                LOG.log(Level.WARNING, "unlock read lock for " + docId + " failed.", e);
              }
            }

          } else {
            LOG.log(Level.INFO, "session for " + docId + " does not exist. Return 503 directly.");
          }
          
          // return 503 for proxy routing to other servers
          HttpServletResponse httpResponse = (HttpServletResponse) response;
          setUnavailableResponse(httpResponse, session);
          return;
        }
      } else if(status == ServerStatus.INACTIVE)
      {
        LOG.log(Level.WARNING, "The docs proxy might have problems, because this inacive server still receive request" + httpRequest.getRequestURI() + ". Return 503 directly.");
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        setUnavailableResponse(httpResponse, null);
        return;
      }
    } 
    chain.doFilter(request, response);
  }

  private void setUnavailableResponse(HttpServletResponse response, DocumentSession session) throws IOException 
  {
    response.setContentType("text/x-json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
    // must make sure ServerStatusFilter is behind HttpSettingFilter because of "IBMDocsApp" header
    response.setHeader("IBMDocsApp", null);
    response.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    
    String errorMsg = "Server is upgrading or under maintainence";
    JSONObject result = new JSONObject();
    result.put("status", "error");
    result.put("error_code", DocumentServiceException.EC_DOCUMENT_SERVICE_MAINTAINENCE);
    result.put("error_msg", errorMsg);
    //TODO: delete cookie?
    if(session != null)
    {
      IDocumentEntry entry = session.getDocumentEntry();
      //TODO: check if there are docs server with latest build has already active now that only have one data center
      // or other data center has already been upgraded
      // need topology znode has latest build info for docs server to compare
      if (isDraftFormatChanged(entry))
      {
        LOG.log(Level.INFO, "Reload document " + entry.getDocUri() + " due to draft format changed a lot.");
        result.put("reload", "true");
      }
    }
    
    result.serialize(response.getWriter());
  }
  
  public static boolean isDraftFormatChanged(IDocumentEntry entry)
  {
    int level = SmartCloudInitializer.getDraftChangeLevel();
    String docType = DocumentServiceUtil.getDocumentType(entry);
    if ( (docType.equalsIgnoreCase("text") && (level & SmartCloudInitializer.DRAFT_CHANGE_TEXT_MASK) > 0)
        || (docType.equalsIgnoreCase("pres") && (level & SmartCloudInitializer.DRAFT_CHANGE_PRES_MASK) > 0)
        || (docType.equalsIgnoreCase("sheet") && (level & SmartCloudInitializer.DRAFT_CHANGE_SHEET_MASK) > 0))
    {
      return true;
    }
    return false;
  }
//  
//  /**
//   * Prerequisite:
//   *                Data Center / Server will be upgrade
//   *                Need set data in zookeeper 
//   *                        /data/docs/data/${topologyName}/status -> DataCenterStatus.UPGRADING 
//   *                        /data/docs/data/${topologyName}/build-timestamp -> ${docsBuildVersion}
//   *                        /data/docs/data/${topologyName}/${serverName}/status -> ServerStatus.INACTIVATING
//   *                        
//   * Result:        Return true when
//   *                1) Only one Data Center
//   *                    At least one of the members in this data center has the latest docs build with active status
//   *                2) More than one Data Centers
//   *                    At least one of the data centers has the lastest docs build with active status
//   */
//  
//  
//  private boolean hasLatestServer()
//  {
//    // TODO Auto-generated method stub
//    return false;
//  }
//
//  /**
//   * Check status of doc session, return true if session is valid
//   * @param docId
//   */
//  private boolean checkSession(String repoId, String docId)
//  {
//    DocumentSession session = SessionManager.getInstance().getSession(repoId, docId);
//    if (session != null)
//    {
//      synchronized(session) 
//      {
//        SessionStatus status = session.getStatus();
//        LOG.log(Level.INFO, "session status for " + docId + " is " + status);
//        if (status == SessionStatus.ACTIVE)
//          return true;
//      }
//    } else {
//      LOG.log(Level.INFO, "session for " + docId + " is not exist");
//    }
//    return false;
//  }
}
