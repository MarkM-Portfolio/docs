/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.revision;

import java.util.Calendar;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public interface IRevision
{

  public static final String REVISION_TYPE_NEW = "new";
  public static final String REVISION_TYPE_ONLINE = "online";
  public static final String REVISION_TYPE_OFFLINE = "offline";
  public static final String REVISION_TYPE_UPLOAD = "upload";
  public static final String REVISION_TYPE_RESTORE = "restore";
  public static final String REVISION_TYPE_LEGACY = "legacy";
  
  public abstract void addModifier(String user);

  public abstract String getRevisionNo();

  public abstract Calendar getPublishTime();

  public abstract boolean isMajor();

  public abstract String getType();

  public abstract JSONArray getModifiers();

  public abstract int getMinorRevisionNo();

  public abstract int getMajorRevisionNo();

  public abstract String getDocUri();

  public abstract String getRepository();
  
  public abstract String getReferenceRevision();
  
  public abstract JSONObject toJson();

}
