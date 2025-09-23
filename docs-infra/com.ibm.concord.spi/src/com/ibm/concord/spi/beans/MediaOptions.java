/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.spi.beans;

public class MediaOptions
{
  // Context type, for example - {type: "folder", value: "88361d34-601b-4714-84fc-2d2a0a7bc33b"}
  private String contextType;

  // Context value
  private String contextValue;

  // Folder's visibility property
  private String fVisibility;

  public MediaOptions(String contextType, String contextValue)
  {
    this.contextType = contextType;
    this.contextValue = contextValue;
  }

  public MediaOptions(String contextType, String contextValue, String fVisibility)
  {
    this.contextType = contextType;
    this.contextValue = contextValue;
    this.fVisibility = fVisibility;
  }

  public String getContextType()
  {
    return contextType;
  }

  public void setContextType(String contextType)
  {
    this.contextType = contextType;
  }

  public String getContextValue()
  {
    return contextValue;
  }

  public void setContextValue(String contextValue)
  {
    this.contextValue = contextValue;
  }

  public String getFolderVisibility()
  {
    return fVisibility;
  }

  public void setFolderVisibility(String fVisibility)
  {
    this.fVisibility = fVisibility;
  }

  @Override
  public String toString()
  {
    return "MediaOptions [contextType=" + contextType + ", contextValue=" + contextValue + ", folderVisibility=" + fVisibility + "]";
  }

}
