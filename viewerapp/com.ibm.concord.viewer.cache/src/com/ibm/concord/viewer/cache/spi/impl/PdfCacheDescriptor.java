package com.ibm.concord.viewer.cache.spi.impl;

import java.io.File;
import java.util.Arrays;
import java.util.logging.Logger;

import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;

public class PdfCacheDescriptor extends CacheDescriptor
{

  private static final Logger logger = Logger.getLogger(PdfCacheDescriptor.class.getName());

  public PdfCacheDescriptor(UserBean user, IDocumentEntry docEntry)
  {
	this.userId = user.getId(); 
    this.customId = user.getCustomerId();
    initLocalCache(docEntry);
  }

  @Override
  public boolean isValid()
  {
    logger.entering(PdfCacheDescriptor.class.getName(), "isValid", cacheURI);

    boolean ret = metaFileValid(new File(getInternalURI(), ICacheDescriptor.CACHE_META_FILE_LABEL));
    if (!ret) 
      ret = new File(getInternalURI()+File.separator+"media", "content.pdf").exists();

    logger.exiting(PdfCacheDescriptor.class.getName(), "isValid", ret);
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
    return ViewContext.VIEW_PDF;
  }
}
