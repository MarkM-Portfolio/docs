/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.rest;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.JsonFactory;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.spi.impl.HTMLCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.SnapshotDescriptor;
import com.ibm.concord.viewer.platform.ConversionUtils;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.repository.DocumentEntryHelper;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.platform.util.NFSFileUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public class HtmlViewHandler implements GetHandler
{
  private static final Logger LOG = Logger.getLogger(HtmlViewHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    String modified = request.getParameter("version");
    IDocumentEntry docEntry;
    try
    {
      docEntry = RepositoryServiceUtil.getEntry(user, repoId, uri, modified, true);
    }
    catch (Exception e)
    {
      JSONObject json = packageGetDocEntryError(e);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      return;
    }

    JSONObject state = new JSONObject();
    try
    {
      JSONObject criteria = getCriteria(request);
      ICacheDescriptor cache = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry,
          request.getHeader("User-Agent"));

      if (cache instanceof HTMLCacheDescriptor && !cache.isValid())
      {
        // Viewer active-active case - trigger to reload web page from UI
        JSONObject json = new JSONObject();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_GATEWAY_TIMEOUT);
        json.serialize(response.getWriter(), true);
        LOG.log(Level.WARNING, "ViewNext failover case: failed to get the draft data for" + docEntry.getDocUri());
        return;
      }

      if (cache.getViewContext() == ViewContext.VIEW_HTML_SS)
      {
        String clientId = request.getParameter("sid");
        String mode = request.getParameter("mode");
        String serverId = ((SnapshotDescriptor) cache).getSidFromDraftCache(true);
        if (clientId == null || serverId == null || !serverId.equals(clientId))
        {
          LOG.log(Level.WARNING, "Inconsistent snapshot id detected, clientid=" + clientId + ", serverId=" + serverId + ". Doc id: "
              + docEntry.getDocUri());
          response.setStatus(507); // customized HTTP code
          return;
        }
        if ("snapshotCheck".equalsIgnoreCase(mode))
        {
          return;
        }
      }

      EncryptionStreamer sbuilder = null;
      if ((new File(cache.getHtmlURI(), ConversionUtils.ENCRYPTION_DONE)).exists())
        sbuilder = new EncryptionStreamer(docEntry, user);

      JSONObject data = null;
      if (DocumentTypeUtils.isSpreadSheet(docEntry.getMimeType()))
      {
        JsonFactory jsonf = new JsonFactory();
        SpreadsheetDraftDeserializer deserializer = new SpreadsheetDraftDeserializer(criteria, jsonf);
        deserializer.setStreamBuilder(sbuilder); // for decryption support
        data = deserializer.doDeserialize(cache);
      }
      else if (DocumentTypeUtils.isText(docEntry.getMimeType()))
      {
        // for text document to get the content
        // JsonFactory jsonf = new JsonFactory();
        TextDraftDeserializer txtdeser = new TextDraftDeserializer(criteria, null);
        txtdeser.setStreamBuilder(sbuilder); // for decryption support
        data = txtdeser.doDeserialize(cache);
      }
      else if (DocumentTypeUtils.isPres(docEntry.getMimeType()))
      {
        JsonFactory jsonf = new JsonFactory();
        PresDraftDeserializer deserializer = new PresDraftDeserializer(criteria, jsonf);
        deserializer.setStreamBuilder(sbuilder); // for decryption support
        data = deserializer.doDeserialize(cache);
      }
      else
      {
        data = new JSONObject();
        String contentPath = cache.getHtmlURI() + File.separator + "content.html";
        String contentStr = NFSFileUtil.nfs_readFileAsString(new File(contentPath), NFSFileUtil.NFS_RETRY_SECONDS);
        data.put("html", contentStr);
      }
      state.put(MessageConstants.STATE_SEQ_KEY, 0);
      state.put(MessageConstants.CONTENT_STATE_KEY, data);
    }
    catch (Exception e)
    {
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_code", 1601);
      json.put("error_msg", e.getMessage());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      LOG.log(Level.WARNING, " can not access or open draft storage of " + docEntry.getDocUri(), e);

      return;
    }
    JSONObject activityJson = null;
    String clientId = request.getSession().getId();
    JSONObject retJson = new JSONObject();
    retJson.put(MessageConstants.CLIENT_ID, clientId);
    retJson.put(MessageConstants.STATE, state);
    retJson.put(MessageConstants.BEAN, DocumentEntryHelper.toJSON(docEntry));
    retJson.put(MessageConstants.ACTIVITY, activityJson);
    retJson.put(MessageConstants.CLIENT_SEQ, "");
    retJson.put(MessageConstants.BASE_SEQ, 0);
    retJson.put(MessageConstants.STATE_SEQ_KEY, String.valueOf(state.get(MessageConstants.STATE_SEQ_KEY)));
    retJson.put(MessageConstants.SECURE_TOKEN, "");

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    ViewerUtil.gzipJson2Response(retJson, response);
  }

  /**
   * Package the exception happens when getting the document entry into a JSON object.
   * 
   * @param exception
   *          specifies the exception happens when getting the document entry
   * @return the packaged JSON object
   */
  private JSONObject packageGetDocEntryError(Exception exception)
  {
    JSONObject json = new JSONObject();
    json.put("status", "error");
    if (exception instanceof RepositoryAccessException)
    {
      int nErrorCode = ((RepositoryAccessException) exception).getStatusCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOPERMISSION)
      {
        nErrorCode = RepositoryAccessException.EC_REPO_NOEDITPERMISSION;
      }
      json.put("error_code", nErrorCode);
      json.put("error_msg", exception.getMessage());
    }
    return json;
  }

  private JSONObject getCriteria(HttpServletRequest request)
  {
    JSONObject criteria = null;
    try
    {
      String criteriaStr = request.getParameter("criteria");
      if (criteriaStr != null)
      {
        criteria = JSONObject.parse(criteriaStr);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Can not parse the parameter 'criteria' in the request to a json object", e);
    }
    return criteria;
  }
}
