/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lcfiles.daemon;


public class EventInfo
{
  public enum EventType {
    IGNORE, PURGE_ALL, PURGE_VERSION, GENERATE_THUMBNAIL, UPLOAD_FILE, UPLOAD_DRAFT, UPDATE_DRAFT, CREATE_DRAFT, PUBLISH_DRAFT, RESTORE_ALL;
  }

  public enum RepositoryType {
    LCFILES, ECM;
  }

  public String actorId;

  public String actorEmail;

  public String actorName;

  public String extention;

  public String docId;

  public String relativePath;

  public String modified;

  public String mimetype;

  public String title;

  public String version;

  public String fileSize;

  public EventType request;

  public String repoId;
  
  public String relatedCommunityIds;
}
