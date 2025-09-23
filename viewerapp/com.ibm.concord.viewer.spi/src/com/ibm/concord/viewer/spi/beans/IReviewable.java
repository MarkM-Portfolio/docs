package com.ibm.concord.viewer.spi.beans;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public interface IReviewable
{
  public static final String GLOBAL_APPROVAL_PROP = "globalApprovalProperties";
  
  public static final String APPROVERS = "approvers";
  
  public static final String LOCK_OWNER = "lockOwner";
  
  public static final String COMMUNITY_OWNER="communityOwner";
  
  public static final String LOCK_OWNER_UID = "id";
  
  public static final String LOCK_OWNER_EMAIL = "email";
  
  public static final String LOCK_OWNER_NAME = "name";
  
  public static final String COMMUNITY_INFO = "communityInfo";

  public static final String COMMUNITY_ID = "communityId";

  public static final String COMMUNITY_TYPE = "communityType";

  public static final String COMMUNITY_URL = "communityURL";
  
  public static final String LIBRARY_INFO = "libraryInfo";

  public static final String COMPONENT_GENERATOR = "generator";
  
  public static final String COMPONENT_ID = "componentId";
  
  public JSONArray getApprovers();

  public JSONObject getGlobalApprovalProperties();

  public JSONObject getLockOwner();
  
  public JSONObject getCommunityInfo();
  
  public JSONObject getLibraryInfo();
}
