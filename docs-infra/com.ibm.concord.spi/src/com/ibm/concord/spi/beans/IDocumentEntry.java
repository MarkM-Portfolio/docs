/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.beans;

import java.util.Calendar;
import java.util.Set;

import com.ibm.concord.spi.beans.Permission;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public interface IDocumentEntry
{
  public static final char DOC_URI_SEP = '@';

  public static final String DOC_URI = "doc_uri";
  public static final String TITLE = "title";
  public static final String MIMETYPE = "mimetype";
  public static final String OWNER = "owner";
  public static final String EXT = "extension";
  public static final String REPO_ID = "repo_id";
  public static final String MODIFIED = "modified";
  public static final String SHARABLE = "sharable";
  public static final String PUBLISHABLE = "publishable";
  public static final String ISCOMMUNITYFILE = "iscommunityfile";
  public static final String COMMUNITY_ID = "community_id";
  public static final String READ_ONLY = "read_only";
  public static final String IS_EXTERNAL = "is_external";
  public static final String FNCS_SERVER = "fncsServer";
  public static final String PWC_ID = "privateWorkCopyId";  
  public static final String APPROVERS = "approvers";
  public static final String APPROVAL_PROPERTIES = "globalApprovalProperties";
  public static final String IS_LOCKED = "locked";
  public static final String LOCK_OWNER = "lockOwner";

  public abstract String getDocUri();

  public abstract String getDocId();

  public abstract String getMimeType();

  public abstract String getTitle();

  public abstract String getTitleWithExtension();

  public abstract String getRepository();
  
  public abstract String getRepositoryType();

  public abstract String getExtension();

  public abstract String getDescription();
  
  public abstract String getFileDetailsURL();
  
  public abstract String getFilesListURL();
  
  public abstract String getVersion();

  public abstract Calendar getModified();

  public abstract String[] getModifier();

  public abstract long getMediaSize();
  
  public abstract String getLibraryId();
  
  /**
   * 
   * @return the real repository docEntry, does not combined with the draft meta
   */
  public abstract IDocumentEntry getRepoDocEntry();

  /**
   * return[0] = user directory id
   * return[1] = user email
   * return[2] = user display name
   */
  public abstract String[] getCreator();

  public abstract Set<Permission> getPermission();
  
  public abstract boolean getIsSharable();
  
  public abstract boolean getIsPublishable();
  
  public abstract String getCommunityId();
  
  public abstract String getCommunityType();
  
  public abstract String getCommunityUrl();
  
  /**
   * Whether this document is allowed to be shared with people outside organization.
   */
  public abstract boolean isExternal();
  
  public abstract boolean isPublished();
  
  public abstract boolean isEncrypt();
  
  public abstract boolean isLocked();
  
  /**
   * return[0] = user directory id
   * return[1] = user email
   * return[2] = user display name
   */
  public abstract String[] getLockOwner();
  
  public abstract void setMimeType(String mimeType);
  
  public abstract String getLibraryType();
  
  public abstract String getLibraryGenerator();
  
  
  /**
   * 
   * ECM/CCM interfaces
   */
  public abstract String getFncsServer();
  
  public abstract String getPrivateWorkCopyId();
 
  public abstract JSONObject getGlobalApproval();
  
  public abstract JSONArray getApprovers();  
  
  public abstract String getVersionSeriesId();
  
  public abstract String getVersionSeriesUri();
  
  public abstract String getContentHash();
}