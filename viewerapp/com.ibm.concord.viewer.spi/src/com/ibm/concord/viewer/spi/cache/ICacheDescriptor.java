package com.ibm.concord.viewer.spi.cache;

import com.ibm.concord.viewer.spi.action.ViewContext;

public interface ICacheDescriptor
{
  public static final String CACHE_META_FILE_LABEL = "meta.json";

  public static final String RENDITION_META_FILE_LABEL = "images.json";
  
  public static final String THUMBNAIL_FOLDER_NAME = "thumbnailService";

  public static final String CACHE_DIR_TEMPPREVIEW = "preview";

  public static final String CACHE_DIR_CCMPREVIEW = "ccm_preview";
  
  public static final String PRMIARY_HASH = "primaryhash";
  
  public static final String SECONDARY_HASH = "secondaryhash";
  
  public static final String LOCAL_PATH = "localpath";

  public abstract String getCacheHome();
  
  public abstract String getWorkingDir();

  public abstract String getRelativeURI();

  public abstract String getMediaURI();

  public abstract String getTempURI(String eigenvalue);

  public abstract String getCacheURI(String eigenvalue);

  public abstract String getInternalURI();

  public abstract String getThumbnailURI();

  public abstract String getFullImageURI();

  public abstract String getHtmlURI();
  
  public abstract String getPdfURI();

  public abstract String getTempThumbnailURI();

  public abstract String getTempFullImageURI();

  public abstract String getDocId();

  public abstract String getCustomId();

  public abstract String getPrimaryHash();

  public abstract String getSecondaryHash();
  
  public abstract String getSharedDataName();
  
  public boolean accessible();
  
  public boolean isValid();
  
  public boolean exists();
  
  public String getId();
  
  public ViewContext getViewContext();
  
  public boolean checkPasswordHash (String password);
  
  public boolean isPasswordHashExist ();  
}