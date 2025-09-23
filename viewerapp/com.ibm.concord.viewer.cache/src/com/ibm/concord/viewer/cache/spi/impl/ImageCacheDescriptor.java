package com.ibm.concord.viewer.cache.spi.impl;

import java.io.File;
import java.util.logging.Logger;

import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;

public class ImageCacheDescriptor extends CacheDescriptor
{

  private static final Logger logger = Logger.getLogger(ImageCacheDescriptor.class.getName());

  public ImageCacheDescriptor(UserBean user, IDocumentEntry docEntry)
  {
    this.userId=user.getId();
    this.customId = user.getCustomerId();
    initLocalCache(docEntry);
  }

  @Override
  public boolean isValid()
  {
    logger.entering(ImageCacheDescriptor.class.getName(), "isValid", cacheURI);

    boolean ret = metaFileValid(new File(getInternalURI(), ICacheDescriptor.CACHE_META_FILE_LABEL))
        && metaFileValid(new File(getInternalURI(), ICacheDescriptor.RENDITION_META_FILE_LABEL));

    logger.exiting(ImageCacheDescriptor.class.getName(), "isValid", ret);
    return ret;
  }

  @Override
  public boolean accessible()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public ViewContext getViewContext()
  {
    return ViewContext.VIEW_IMAGE;
  }
}
