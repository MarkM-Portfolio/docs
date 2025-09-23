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

import java.io.File;

import com.ibm.concord.spi.beans.DraftDescriptor;

public class SectionDescriptor
{
  private DraftDescriptor draftDescriptor;
  private DraftSection section;

  public SectionDescriptor(DraftDescriptor draftDescriptor, DraftSection section)
  {
    if (draftDescriptor == null || section == null)
    {
      throw new NullPointerException();
    }

    this.draftDescriptor = draftDescriptor;
    this.section = section;
  }

  public String getSectionUri()
  {
	if (section.getSectionPath() != null && section.getSectionLabel() != null)
	{
	  File sectionFolder = new File(draftDescriptor.getURI(), section.getSectionPath());
	  return new File(sectionFolder, section.getSectionLabel()).getPath();
	}
	else if (section.getSectionPath() != null && section.getSectionLabel() == null)
    {
      File sectionFolder = new File(draftDescriptor.getURI(), section.getSectionPath());
  	  return sectionFolder.getPath();
    }
	else if (section.getSectionPath() == null && section.getSectionLabel() != null)
    {
      File sectionFile = new File(draftDescriptor.getURI(), section.getSectionLabel());
  	  return sectionFile.getPath();
    }
    else
    {
      throw new IllegalStateException();
    }
  }
  
  /**
   * Gets the transaction file or folder URL for this section in transaction temporary directory.
   * 
   * @return
   */
  public String getSectionTransUri()
  {
    if (section == null)
    {
      throw new IllegalStateException("Section can not be null.");
    }
    else if (section.getSectionPath() != null && section.getSectionLabel() != null)
    {
      File sectionFolder = new File(draftDescriptor.getTransURI(), section.getSectionPath());
      return new File(sectionFolder, section.getSectionLabel()).getPath();
    }
    else if (section.getSectionPath() != null && section.getSectionLabel() == null)
    {
      File sectionFolder = new File(draftDescriptor.getTransURI(), section.getSectionPath());
      return sectionFolder.getPath();
    }
    else if (section.getSectionPath() == null && section.getSectionLabel() != null)
    {
      File sectionFile = new File(draftDescriptor.getTransURI(), section.getSectionLabel());
      return sectionFile.getPath();
    }
    else
    {
      throw new IllegalStateException("Illegal section path or label.");
    }
  }

  public DraftDescriptor getDraftDescriptor()
  {
    return draftDescriptor;
  }

  public DraftSection getSection()
  {
    return section;
  }

  public String toString()
  {
    return draftDescriptor.toString() + "\t" + section.getSectionPath() + "\t" + section.getSectionLabel();
  }
}
