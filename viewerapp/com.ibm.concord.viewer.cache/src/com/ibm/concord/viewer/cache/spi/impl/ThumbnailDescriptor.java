package com.ibm.concord.viewer.cache.spi.impl;

import java.util.Arrays;

import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.cache.ICacheStorageAdapter;

public class ThumbnailDescriptor extends CacheDescriptor
{
  public ThumbnailDescriptor(IDocumentEntry entry)
  {
    initLocalCache(entry);
  }

  public ThumbnailDescriptor(String docUri, String lastMod, String repoId)
  {
    repositoryId = repoId;
    cacheHome = getCacheHomeByRepoId(repositoryId);
    String[] hash = ViewerUtil.hash(docUri);
    this.cacheURI = ViewerUtil.pathConnect(Arrays.asList(new String[] {
        cacheHome,
        RepositoryServiceUtil.ECM_FILES_REPO_ID.equals(repoId) ? ICacheDescriptor.CACHE_DIR_CCMPREVIEW
            : ICacheDescriptor.CACHE_DIR_TEMPPREVIEW, hash[0], hash[1], docUri, lastMod }));
  }

  public String getThumbnailServiceURI()
  {
    return getInternalURI() + ICacheStorageAdapter.separator + ICacheDescriptor.THUMBNAIL_FOLDER_NAME;
  }

  @Override
  public String getMediaURI()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getTempURI(String eigenvalue)
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getId()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getThumbnailURI()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getFullImageURI()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getHtmlURI()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getTempThumbnailURI()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getTempFullImageURI()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public ViewContext getViewContext()
  {
    return ViewContext.VIEW_THUMBNAIL;
  }

  @Override
  public boolean accessible()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isValid()
  {
    throw new UnsupportedOperationException();
  }
}
