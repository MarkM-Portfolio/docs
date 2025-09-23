/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.document.services;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.CacheMetaEnum;
import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.cache.spi.impl.HTMLCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.ImageCacheDescriptor;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.json.java.JSONObject;

public class DocumentServiceUtil
{
  private static final Logger LOG = Logger.getLogger(DocumentServiceUtil.class.getName());

  public static String getDocumentType(IDocumentEntry docEntry)
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    return serviceProvider.getDocumentType(docEntry.getMimeType());
  }

  public static IDocumentService getDocumentService(String mimeType)
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    
    return serviceProvider.getDocumentService(mimeType);
  }

  public static IDocumentService getDocumentServiceByType(String type)
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    return serviceProvider.getDocumentServiceByType(type);
  }

  public static boolean supportedDocumentService(String type)
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    return serviceProvider.supportedDocumentService(type);
  }

  public static void storeDraft(UserBean caller, IDocumentEntry docEntry, JSONObject renditionMeta, boolean htmlCache) throws Exception
  {
    try
    {
      ICacheDescriptor draftDescriptor = htmlCache ? new HTMLCacheDescriptor(caller, docEntry) : new ImageCacheDescriptor(caller, docEntry);
      Map<CacheMetaEnum, Object> draftMeta = new HashMap<CacheMetaEnum, Object>();
      draftMeta.put(CacheMetaEnum.MIME, docEntry.getMimeType());
      draftMeta.put(CacheMetaEnum.TITLE, docEntry.getTitle());
      draftMeta.put(CacheMetaEnum.EXT, docEntry.getExtension());
      draftMeta.put(CacheMetaEnum.CACHE_LAST_BUILD, docEntry.getModified());
      draftMeta.put(CacheMetaEnum.CACHE_BASE_VERSION, docEntry.getVersion());

      CacheStorageManager.getCacheStorageManager().newCache(draftDescriptor, null, draftMeta, renditionMeta);
    }
    catch (CacheStorageAccessException e)
    {
      LOG.log(Level.WARNING, "DraftStorageAccessException of : Draft: " + docEntry.getDocUri(), e);
    }
    catch (CacheDataAccessException e)
    {
      LOG.log(Level.WARNING, "DraftDataAccessException of : Draft: " + docEntry.getDocUri(), e);
    }
  }

  public static void forwardView(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    String type = serviceProvider.getDocumentType(docEntry.getMimeType());

    request.setAttribute("doc_entry", docEntry);
    request.setAttribute("doc_type", type);
    request.setAttribute("doc_mode", "view");

    IDocumentService ds = getDocumentService(docEntry.getMimeType());
    if (ds != null)
    {
      ds.forwardViewPage(caller, docEntry, request, response);
    }
    else
    {
      response.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
    }
  }
}
