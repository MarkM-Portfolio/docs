/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.draft.section;


public class DraftSection
{
  public static final DraftSection TEMPLATE = new DraftSection("master.html");

  private String sectionPath;
  private String sectionLabel;

  public static DraftSection getRevisionSection(String sectionLabel)
  {
    return new DraftSection("Revision", sectionLabel);
  }

  public static DraftSection getPictureSection(String sectionLabel)
  {
    return new DraftSection("Pictures", sectionLabel);
  }
  
  public static DraftSection getChartSection(String sectionLabel)
  {
    return new DraftSection("Charts", sectionLabel);
  }

  public static DraftSection getReservedSection(String sectionLabel)
  {
    return new DraftSection("Reserved", sectionLabel);
  }

  private DraftSection(String sectionPath, String sectionLabel)
  {
	this.sectionPath = sectionPath;
    this.sectionLabel = sectionLabel;
  }

  public DraftSection(String sectionLabel)
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
