/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.servlet;

import java.io.IOException;
import java.net.URLDecoder;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.parser.ParseException;

import com.ibm.concord.viewer.cache.CacheMetaEnum;
import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.platform.exceptions.MalformedRequestException;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.SimpleLocalEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.spi.exception.AccessException;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.tempstorage.repository.TempStorageRepository;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Decoder;

public class ViewDocServlet extends HttpServlet
{
  private static final long serialVersionUID = 6476845491217397520L;

  private static final Logger LOG = Logger.getLogger(ViewDocServlet.class.getName());

  private static final String ATTR_ERROR_CODE = "error_code";

  private static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  // private long time = 0;

  /**
   * This parses requests to ViewDocServlet.
   */
  static private class RequestParser
  {
    private String repoId;

    private String docUri;

    private String docContentPath;

    private String docVersion = null;

    private boolean isSupportedMode = false;

    private String mimeType;

    private HashMap<String, Boolean> parameters = new HashMap<String, Boolean>();

    private String viewURL;

    private static final String UI_PARAM_NAME = "b";

    private static final String UI_PARAM_MODE = "mode";

    private static final String UI_PARAM_MODE_COMPACT = "compact";

    private static final String UI_PARAM_MODE_SLIDESHOW = "slideshow";

    private static final String UI_PARAM_FOCUSWINDOW = "focusWindow";

    // Pattern to match request path (expecting "/${repoId}/${docUri}/${filePath}")
    private static final Pattern pathPattern = Pattern.compile("/([^/]+)/([^/]+)/(.+)");

    private static final Pattern containVersionPattern = Pattern.compile("(^[0-9]+)/(.+)");

    private static final String UI_PARAM_VALUE_TRUE = "true";

    private static final String UI_PARAM_MIME = "mime";

    private static final String UI_PARAM_CMISDOCUMENTID = "cmisDocumentId";

    public RequestParser(HttpServletRequest request)
    {
      // Use HttpServletRequest.getPathInfo to get a decoded path.
      Matcher matcher = pathPattern.matcher(request.getPathInfo());
      Matcher result = matcher.matches() ? matcher : null;
      if (result != null)
      {
        repoId = result.group(1);
        docUri = result.group(2);
        docContentPath = result.group(3);
        matcher = containVersionPattern.matcher(docContentPath);
        result = matcher.matches() ? matcher : null;
        if (result != null) // contains version
        {
          docVersion = result.group(1);
          docContentPath = result.group(2);
        }
      }

      try
      {
        Enumeration<String> names = request.getParameterNames();
        StringBuffer msg = new StringBuffer("View request is ").append(request.getRequestURI());
        if (names.hasMoreElements())
        {
          msg.append("?");
          String name = names.nextElement();
          String value = request.getParameter(name);
          msg.append(name).append("=").append(value);
        }
        while (names.hasMoreElements())
        {
          String name = names.nextElement();
          String value = request.getParameter(name);
          msg.append("&").append(name).append("=").append(value);
        }
        viewURL = msg.toString();
        LOG.log(Level.FINER, viewURL);

        String param = request.getParameter(UI_PARAM_NAME);
        if (param != null && !"".equals(param))
        {
          param = new String(new BASE64Decoder().decodeBuffer(param));

          LOG.log(Level.FINE, "Decoded {0}={1}", new String[] { UI_PARAM_NAME, param });

          String[] params = param.split("&");
          for (int i = 0; i < params.length; i++)
          {
            int index = params[i].indexOf("=");
            String name = params[i].substring(0, index);
            String value = params[i].substring(index + 1);
            parameters.put(name.toLowerCase(), new Boolean(value));
          }

        }

        param = request.getParameter(UI_PARAM_MODE);
        if (param != null && (param.contains(UI_PARAM_MODE_COMPACT) || param.contains(UI_PARAM_MODE_SLIDESHOW)))
        {
          parameters.put(UI_PARAM_MODE_COMPACT, true);
          isSupportedMode = true;
        }
        else
        {
          parameters.put(UI_PARAM_MODE_COMPACT, false);
        }

        param = request.getParameter(UI_PARAM_FOCUSWINDOW);
        if (param == null || param.equalsIgnoreCase(UI_PARAM_VALUE_TRUE))
        {
          parameters.put(UI_PARAM_FOCUSWINDOW, true);
        }
        else
        {
          parameters.put(UI_PARAM_FOCUSWINDOW, false);
        }
        if (repoId.equals(TempStorageRepository.REPO_ID_TEMP_STORAGE))
        {
          UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);

          param = request.getParameter(UI_PARAM_MIME);
          if (param != null && !param.isEmpty())
          {
            mimeType = URLDecoder.decode(param, "UTF-8");
          }
          LOG.log(Level.INFO, "Decoded {0}={1}", new String[] { UI_PARAM_MIME, mimeType });

          boolean isAttachment = !docContentPath.equalsIgnoreCase("content");
          IDocumentEntry docEntry = RepositoryServiceUtil.getEntry(user, repoId, docUri, docVersion, mimeType, isAttachment);

          ICacheDescriptor sourceCacheDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user,
              new SimpleLocalEntry(docUri, docEntry.getMimeType(), RepositoryServiceUtil.TEMP_STORAGE_REPO_ID));

          JSONObject meta = CacheStorageManager.getCacheStorageManager().getCachedTempstorageMeta(sourceCacheDesc);
          String printValue = (String) meta.get(CacheMetaEnum.PRINT.getMetaKey());

          Boolean print = false;
          if (printValue != null)
          {
            if (printValue.equalsIgnoreCase("enable"))
            {
              print = true;
            }
          }
          else
          {
            printValue = ViewerUtil.getiNotesPrint();
            if (printValue.equalsIgnoreCase("enable"))
            {
              print = true;
            }
          }

          String cacheControl = (String) meta.get(CacheMetaEnum.CACHE_CONTROL.getMetaKey());
          if (cacheControl == null || cacheControl.equals(""))
          {
            cacheControl = ViewerUtil.getiNotesCache();
          }
          parameters.put("print", print);
          request.setAttribute("cache-control-value", cacheControl);
        }
        else if (repoId.equalsIgnoreCase(RepositoryServiceUtil.MAIL_REPO_ID))
        {
          param = request.getParameter(UI_PARAM_MIME);
          if (param != null && !param.isEmpty())
          {
            mimeType = URLDecoder.decode(param, "UTF-8");
          }
          LOG.log(Level.INFO, "Decoded {0}={1}", new String[] { UI_PARAM_MIME, mimeType });
        }
        else if (repoId.equalsIgnoreCase(RepositoryServiceUtil.ECM_FILES_REPO_ID))
        {
          param = request.getParameter(UI_PARAM_CMISDOCUMENTID);
          if (param != null && !param.isEmpty())
          {
            String[] tokens = docUri.split("@");
            docUri = param + "@" + tokens[1];
            LOG.log(Level.INFO, "Decoded {0}, set docUri={1}", new String[] { UI_PARAM_CMISDOCUMENTID, docUri });
          }
        }
      }
      catch (Exception e)
      {
        LOG.warning("Error occurred when parsing UI parameters.  " + e);
      }
    }

    public String getViewURL()
    {
      return viewURL;
    }

    public String getMimeType()
    {
      return mimeType;
    }

    public String getRepoId()
    {
      return repoId;
    }

    public String getDocUri()
    {
      return docUri;
    }

    public String getDocContentPath()
    {
      return docContentPath;
    }

    public String getDocVersion()
    {
      return docVersion;
    }

    public HashMap<String, Boolean> getParameters()
    {
      return parameters;
    }

    public Boolean isSupportedMode()
    {
      return isSupportedMode;
    }

  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    long start = System.currentTimeMillis();
    // time = Calendar.getInstance().getTimeInMillis();
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    RequestParser requestParser = new RequestParser(request);

    String repoId = requestParser.getRepoId();
    String uri = requestParser.getDocUri();
    String contentPath = requestParser.getDocContentPath();
    String version = requestParser.getDocVersion();

    // Add view document log here
    StringBuffer msg = new StringBuffer();
    try
    {
      if (repoId == null || repoId.length() <= 0 || uri == null || uri.length() <= 0 || contentPath == null || contentPath.length() <= 0)
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_SEVERE_MALFORMED_URL);
        msg.append(" " + request.getRequestURL());
        LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
            ServiceCode.SEVERE_MALFORMED_URL, msg.toString())).toString());
        request.setAttribute(ATTR_ERROR_CODE, MalformedRequestException.EC_MALFORMED_INVALID_REQUEST);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }

      // get document entry
      IDocumentEntry docEntry = null;
      try
      {
        boolean isAttachment = !contentPath.equalsIgnoreCase("content");

        if (!isAttachment && !ViewerConfig.getInstance().isFullViewerSupported() && !requestParser.isSupportedMode())
        {
          LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(" Full viewer is called! %s . ",
              requestParser.getViewURL())).toString());
          request.setAttribute(ATTR_ERROR_CODE, MalformedRequestException.EC_FULLVIEWER_INVALID_REQUEST);
          request.getRequestDispatcher(ERROR_JSP).forward(request, response);
          return;
        }

        if (repoId.equalsIgnoreCase(RepositoryServiceUtil.MAIL_REPO_ID)
            || repoId.equalsIgnoreCase(RepositoryServiceUtil.TEMP_STORAGE_REPO_ID))
        {
          docEntry = RepositoryServiceUtil.getEntry(user, repoId, uri, version, requestParser.getMimeType(), isAttachment);
        }
        else
        {
          docEntry = RepositoryServiceUtil.getEntry(user, repoId, uri, version, isAttachment);
        }

        if (docEntry != null && version == null)
        {
          version = String.valueOf(docEntry.getModified().getTimeInMillis());
        }
      }
      catch (RepositoryAccessException e)
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_ERROR_ACCESS_REPOSITORY);
        LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
            ServiceCode.ERROR_ACESS_REPOSITORY, msg.toString())).toString());
        int nErrorCode = e.getStatusCode();
        if (nErrorCode == RepositoryAccessException.EC_REPO_NOPERMISSION)
        {
          nErrorCode = RepositoryAccessException.EC_REPO_NOVIEWPERMISSION;
        }
        request.setAttribute(ATTR_ERROR_CODE, nErrorCode);
        String repoType = RepositoryServiceUtil.getRepoTypeFromId(repoId);
        if (!RepositoryServiceUtil.EXTERNAL_CMIS_REPO_TYPE.equals(repoType) && !RepositoryServiceUtil.EXTERNAL_REST_REPO_TYPE.equals(repoType))
          request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }
      catch (NullPointerException e)
      {
        LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(),
            "IRepositoryAdapter is null caused by repoId is not correct!").toString());
        request.setAttribute(ATTR_ERROR_CODE, HttpServletResponse.SC_BAD_REQUEST);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }
      catch (ParseException e)
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_SEVERE_CONNECTIONS_NOT_CONNECTED);
        LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
            ServiceCode.SEVERE_CONNECTIONS_NOT_CONNECTED, msg.toString())).toString());
        request.setAttribute(ATTR_ERROR_CODE, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }

      if (docEntry == null)
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_ERROR_GET_DOC_ENTRY);
        msg.append(" . Document ");
        msg.append(uri);
        msg.append(" is not found");
        LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
            ServiceCode.ERROR_GET_DOC_ENTRY, msg.toString())).toString());
        // not found
        request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOTFOUNDDOC);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }

      if (repoId.equalsIgnoreCase("lcfiles"))
      {
        // view from Files
        msg.append(ServiceCode.S_INFO_VIEW_FROM_FILES);
        msg.append(" " + user.getId());
        msg.append(" views ");
        msg.append(docEntry.getDocId());
        LOG.log(Level.FINEST, LoggerUtil.getLogMessage(ServiceCode.INFO_VIEW_FROM_FILES, msg.toString()));
      }
      else if (repoId.equalsIgnoreCase("ecm"))
      {
        // view from CCM
        msg.append(ServiceCode.S_INFO_VIEW_FROM_CCM);
        msg.append(" " + user.getId());
        msg.append(" views ");
        msg.append(docEntry.getDocId());
        LOG.log(Level.FINEST, LoggerUtil.getLogMessage(ServiceCode.INFO_VIEW_FROM_CCM, msg.toString()));
      }
      else if (repoId.equalsIgnoreCase(RepositoryServiceUtil.MAIL_REPO_ID)
          || repoId.equalsIgnoreCase(RepositoryServiceUtil.VSFILES_REPO_ID))
      {
        // view from Verse
        msg.append(ServiceCode.S_INFO_VIEW_FROM_VERSE);
        msg.append(" " + user.getId());
        msg.append(" views ");
        msg.append(docEntry.getDocId());
        LOG.log(Level.FINEST, LoggerUtil.getLogMessage(ServiceCode.INFO_VIEW_FROM_VERSE, msg.toString()));
      }

      if (docEntry.isEncrypt())
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_INFO_DOCUMENT_ENCRYPTED);
        msg.append(docEntry.getDocUri());
        msg.append(" is encrypted");
        LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
            ServiceCode.INFO_DOCUMENT_ENCRYPTED, msg.toString())).toString());
        // document is encrypted
        request.setAttribute(ATTR_ERROR_CODE, AccessException.EC_DOCUMENT_ENCRYPT);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }

      IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
      if (docSrv == null)
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_ERROR_UNSUPPORTTED_MIME);
        msg.append("The MIME type of ");
        msg.append(docEntry.getDocUri());
        msg.append(" is " + docEntry.getMimeType());
        LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
            ServiceCode.ERROR_UNSUPPORTTED_MIME, msg.toString())).toString());
        request.setAttribute(ATTR_ERROR_CODE, UnsupportedMimeTypeException.EC_MIME_UNSUPPORTED_TYPE);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }
      if (!docEntry.hasViewPermission())
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_INFO_NO_VIEW_PERMISSION);
        msg.append(" No permission to view ");
        msg.append(docEntry.getDocUri());
        LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
            ServiceCode.INFO_NO_VIEW_PERMISSION, msg.toString())).toString());
        request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOVIEWPERMISSION);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }

      ViewActionBuilder.getViewAction(user, docEntry, contentPath, version, requestParser.getParameters(), request.getHeader("User-Agent"))
          .exec(request, response);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "The outer try catch in ViewDocServlet throws exception:" + uri);
      LOG.logp(Level.WARNING, "ViewDocServlet", "doGet", e.getMessage(), e);
    }

    long end = System.currentTimeMillis();
    LOG.log(Level.FINE, "The view cost is: " + (end - start) + "ms. The request URL is " + request.getRequestURL());
  }
}
