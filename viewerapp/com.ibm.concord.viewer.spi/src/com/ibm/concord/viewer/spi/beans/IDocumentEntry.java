/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.beans;

import java.util.Calendar;
import java.util.Set;

public interface IDocumentEntry
{
  public static final char DOC_URI_SEP = '@';

  public static final String DOC_URI = "doc_uri";
  public static final String TITLE = "title";
  public static final String MIMETYPE = "mimetype";
  public static final String OWNER = "owner";
  public static final String EXT = "extension";
  public static final String REPO_ID = "repo_id";
  public static final String REPO_TYPE = "repo_type";
  public static final String MODIFIED = "modified";
  public static final String SHARABLE = "sharable";
  public static final String COMMUNITY_ID = "community_id";

  public abstract String getDocUri();

  public abstract String getDocId();

  public abstract String getMimeType();

  public abstract String getTitle();

  public abstract String getRepository();
  
  public abstract String getRepositoryType();

  public abstract String getExtension();

  public abstract String getDescription();

  public abstract String getVersion();

  public abstract Calendar getModified();

  public abstract String[] getModifier();

  public abstract long getMediaSize();

  /**
   * return[0] = user directory id
   * return[1] = user email
   * return[2] = user display name
   */
  public abstract String[] getCreator();

  public abstract Set<Permission> getPermission();
  
  public abstract boolean getIsSharable();
  
  public abstract void setMimeType(String mimeType);
  
  public abstract boolean isEncrypt();
  
  public abstract boolean isIBMDocs();

  public abstract boolean hasViewPermission();
  
  public String getFileDetailsURL();
  
  public abstract String getCommunityId();
  
  public boolean getPwdProtected();
  
  public void setPwdProtected(boolean isPwdProtected);
  
}