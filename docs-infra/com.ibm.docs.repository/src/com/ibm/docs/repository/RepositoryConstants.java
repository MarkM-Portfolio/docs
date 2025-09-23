package com.ibm.docs.repository;

public interface RepositoryConstants
{
  public final static String REPO_TYPE_LOCAL = "concord.storage";

  public final static String REPO_TYPE_FILES = "lcfiles";

  public final static String REPO_TYPE_ECM = "ecm";
  
  public final static String REPO_TYPE_EXTERNAL_CMIS = "external.cmis";
  
  public final static String REPO_TYPE_EXTERNAL_REST = "external.rest";

  public final static String REPO_ECM_URI_PREFIX = "idd_";

  public final static String REPO_ECM_VERSIONSERIES_PREFIX = "idv_";

  public final static String REPO_ECM_URI_POSTFIX = "@";

  public final static String KEY_CONFIG_OBJECT_STORE = "object_store";
  
  public static final String MEMBER_TYPE_USER = "user";
  
  public static final String MEMBER_TYPE_COMMUNITY = "community";
}
