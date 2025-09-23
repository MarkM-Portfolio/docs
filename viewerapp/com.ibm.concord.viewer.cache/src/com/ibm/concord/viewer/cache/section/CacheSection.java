/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.cache.section;


public class CacheSection
{
  public static final CacheSection TEMPLATE = new CacheSection("master.html");

  private String sectionPath;
  private String sectionLabel;

  public static CacheSection getRevisionSection(String sectionLabel)
  {
    return new CacheSection("Revision", sectionLabel);
  }

  public static CacheSection getPictureSection(String sectionLabel)
  {
    return new CacheSection("Pictures", sectionLabel);
  }

  public static CacheSection getReservedSection(String sectionLabel)
  {
    return new CacheSection("Reserved", sectionLabel);
  }

  private CacheSection(String sectionPath, String sectionLabel)
  {
	this.sectionPath = sectionPath;
    this.sectionLabel = sectionLabel;
  }

  public CacheSection(String sectionLabel)
  {
    this.sectionPath = "";
    this.sectionLabel = sectionLabel;
  }

  public String getSectionLabel()
  {
    return sectionLabel;
  }

  public String getSectionPath()
  {
    return sectionPath;
  }
}
