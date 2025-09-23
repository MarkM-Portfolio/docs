/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.draft;

import java.util.Calendar;




public class DraftMetaEnum
{
  /**
   * Unmodifiable Draft Meta
   */
  public static final DraftMetaEnum CUSTOMER_ID = new DraftMetaEnum("CUSTOMER_ID", String.class);
  public static final DraftMetaEnum DOC_ID = new DraftMetaEnum("DOC_ID", String.class);

  /**
   * Internal Managed Draft Meta
   */
  public static final DraftMetaEnum DRAFT_SYNC_STATE = new DraftMetaEnum("DRAFT_SYNC_STATE", Boolean.class);
  public static final DraftMetaEnum DRAFT_LAST_VISIT = new DraftMetaEnum("DRAFT_LAST_VISIT", Calendar.class);
  public static final DraftMetaEnum DRAFT_LAST_MODIFIED = new DraftMetaEnum("DRAFT_LAST_MODIFIED", Calendar.class);
  public static final DraftMetaEnum DRAFT_LAST_MODIFIER_ID = new DraftMetaEnum("LAST_MODIFIER_ID", String.class);
  public static final DraftMetaEnum DRAFT_CREATED = new DraftMetaEnum("DRAFT_CREATED", Calendar.class);
  public static final DraftMetaEnum DRAFT_BASE_VERSION = new DraftMetaEnum("DRAFT_BASE_VERSION", String.class);

  /**
   * Public Managed Draft Meta
   */
  public static final DraftMetaEnum MIME = new DraftMetaEnum("MIME", String.class);
  public static final DraftMetaEnum TITLE = new DraftMetaEnum("TITLE", String.class);
  public static final DraftMetaEnum EXT = new DraftMetaEnum("EXT", String.class);
  public static final DraftMetaEnum REPOSITORY_ID = new DraftMetaEnum("REPOSITORY_ID", String.class);
  public static final DraftMetaEnum LAST_MODIFIED = new DraftMetaEnum("LAST_MODIFIED", Calendar.class);
  public static final DraftMetaEnum BASE_CONTENT_HASH = new DraftMetaEnum("BASE_CONTENT_HASH", String.class);

  private String key;
  private Class<?> aClass;
  private DraftMetaEnum(String key, Class<?> aClass)
  {
    this.key = key;
    this.aClass = aClass;
  }

  public String getMetaKey()
  {
    return key;
  }

  public Class<?> getMetaValueType()
  {
    return aClass;
  }

  public String toString()
  {
    return key + ' ' + aClass;
  }
}
