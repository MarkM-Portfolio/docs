/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.Components;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class RepositoryServiceUtil
{
  private static final Logger LOG = Logger.getLogger(RepositoryServiceUtil.class.getName());

  public static IRepositoryAdapter getRepositoryAdapter(String repoId)
  {
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Components.getComponent(RepositoryComponent.COMPONENT_ID)
        .getService(RepositoryProviderRegistry.class);
    return service.getRepository(repoId);
  }

  public static String getDefaultRepositoryId()
  {
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Components.getComponent(RepositoryComponent.COMPONENT_ID)
        .getService(RepositoryProviderRegistry.class);
    return service.getDefaultId();
  }

  public static MediaDescriptor download(UserBean caller, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    return download(caller, docEntry, true);
  }

  public static MediaDescriptor download(UserBean caller, IDocumentEntry docEntry, boolean logDownload) throws RepositoryAccessException
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(docEntry.getRepository());
    InputStream contentStream = repoAdapter.getContentStream(caller, docEntry, logDownload);
    return new MediaDescriptor(docEntry.getTitle() + '.' + docEntry.getExtension(), docEntry.getMimeType(), contentStream);
  }

  public static IDocumentEntry upload4Community(UserBean caller, String repoId, String folderUri, MediaDescriptor media)
      throws RepositoryAccessException
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(repoId);
    return repoAdapter.createDocument(caller, folderUri, "communityFiles", media.getTitle(), media.getStream(), null, null,
        media.getOptions());
  }

  public static String getFolderUri(UserBean caller, String repoId, String communityUuid) throws RepositoryAccessException
  {
    if (repoId == null)
      repoId = RepositoryServiceUtil.getDefaultRepositoryId();
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(repoId);
    return repoAdapter.getFolderUri(caller, communityUuid);
  }

  public static IDocumentEntry upload(UserBean caller, String repoId, MediaDescriptor media) throws RepositoryAccessException
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(repoId);
    return repoAdapter.createDocument(caller, caller.getId(), "personalFiles", media.getTitle(), media.getStream(), media.getIsExternal(),
        media.getPropagate(), media.getOptions());
  }

  public static IDocumentEntry update(UserBean caller, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary,
      boolean overwrite) throws RepositoryAccessException
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(docEntry.getRepository());
    IDocumentEntry result = null;
    if (media.getStream() != null)
    {
      result = repoAdapter.setContentStream(caller, docEntry, media, versionSummary, overwrite);
    }

    if (media.getTitle() != null)
    {
      result = repoAdapter.renameDocument(caller, docEntry, media.getTitle());
    }
    return result;
  }

  public static IDocumentEntry update(UserBean caller, IDocumentEntry docEntry, MediaDescriptor media, File mediaFile,
      String versionSummary, boolean overwrite) throws RepositoryAccessException
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(docEntry.getRepository());
    IDocumentEntry result = null;
    if (media.getStream() != null)
    {
      if (media.getTitle() == null)
      {
        result = repoAdapter.setContentStream(caller, docEntry, media.getStream(), versionSummary, overwrite);
      }
      else
      {
        long count = 1;
        String adjustLabel = media.getTitle();
        BufferedInputStream is = new BufferedInputStream(media.getStream());
        is.mark(Integer.MAX_VALUE); // will reset the stream later if setContentStream fails
        media.setStream(is);
        IDocumentEntry entry = repoAdapter.setContentStream(caller, docEntry, media, versionSummary, overwrite);
        while (entry == null)
        {
          LOG.log(Level.INFO, "Found conlicft file name {0}.", new Object[] { adjustLabel });

          if (count == 1)
          {
            count = System.currentTimeMillis();
          }

          String suffix = "_" + count + "." + extractExt(media.getTitle());
          int lenSuffix = suffix.getBytes().length;
          adjustLabel = trimExt(media.getTitle());
          if (adjustLabel.getBytes().length + lenSuffix > 252)
            adjustLabel = adjustLabel.substring(0, adjustLabel.length() - ("_" + count).length()) + suffix;
          else
            adjustLabel = adjustLabel + suffix;
          count++;

          LOG.log(Level.INFO, "Resolve the file name conflict using a new name {0}.", new Object[] { adjustLabel });

          try
          {
            media.setTitle(adjustLabel);
            media.getStream().reset();
            entry = repoAdapter.setContentStream(caller, docEntry, media, versionSummary, overwrite);
          }
          catch (IOException e)
          {
            throw new RepositoryAccessException(e);
          }
        }
        result = entry;
      }
    }
    else
    {
      if (media.getTitle() == null)
      {
        ;
      }
      else
      {
        result = repoAdapter.renameDocument(caller, docEntry, media.getTitle());
      }
    }
    return result;
  }

  private static String trimExt(String title)
  {
    String result;
    int index = title.lastIndexOf('.');
    if (index == -1)
    {
      result = title;
    }
    else
    {
      result = title.substring(0, index);
    }

    return result;
  }

  private static String extractExt(String title)
  {
    String result;
    int index = title.lastIndexOf('.');
    if (index == -1)
    {
      result = "";
    }
    else
    {
      result = title.substring(index + 1);
    }

    return result;
  }

  public static boolean supportedRepository(String repoId)
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(repoId);
    return (repoAdapter != null);
  }

  public static boolean draftTransferable(String repoId)
  {
    if (repoId != null && (repoId.equalsIgnoreCase(RepositoryConstants.REPO_TYPE_ECM)
        || repoId.equalsIgnoreCase(RepositoryConstants.REPO_TYPE_EXTERNAL_CMIS)))
    {
      return true;
    }
    return false;
  }

  public static boolean supportRecentFiles(String repoId)
  {
    if (repoId != null && (repoId.equalsIgnoreCase(RepositoryConstants.REPO_TYPE_ECM)
        || repoId.equalsIgnoreCase(RepositoryConstants.REPO_TYPE_EXTERNAL_CMIS)))
    {
      return false;
    }
    return true;
  }

  public static boolean supportCheckin(String repoId)
  {
    if (repoId != null && (repoId.equalsIgnoreCase(RepositoryConstants.REPO_TYPE_ECM)
        || repoId.equalsIgnoreCase(RepositoryConstants.REPO_TYPE_EXTERNAL_CMIS)))
    {
      return true;
    }
    return false;
  }

  public static String getRepoTypeFromId(String repoId)
  {
    IRepositoryAdapter repoAdapter = getRepositoryAdapter(repoId);
    if (repoAdapter != null)
    {
      return repoAdapter.getRepoType();
    }
    return null;
  }

  public static void notifySessionEventToRepository(IDocumentEntry docEntry, String eventType)
  {
    String repoId = docEntry.getRepository();
    IRepositoryAdapter repository = getRepositoryAdapter(repoId);
    if (repository != null)
    {
      JSONObject msg = new JSONObject();
      msg.put("type", eventType);
      msg.put("repoId", repoId);
      msg.put("docId", docEntry.getDocId());
      repository.notifyServerEvent(msg);
    }
  }
}
