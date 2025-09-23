/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */


package com.ibm.symphony.conversion.converter.html2odp.template;

public class TemplateBean
{
  byte[] titleImgStream;
  byte[] pageImgStream;
  String titleImgName;
  String pageImgName;
  byte[] styleXml;
  String titleStyleName;
  String pageStyleName;
  
  /**
   * @return the titleStyleName
   */
  public String getTitleStyleName()
  {
    return titleStyleName;
  }
  /**
   * @param titleStyleName the titleStyleName to set
   */
  public void setTitleStyleName(String titleStyleName)
  {
    this.titleStyleName = titleStyleName;
  }
  /**
   * @return the pageStyleName
   */
  public String getPageStyleName()
  {
    return pageStyleName;
  }
  /**
   * @param pageStyleName the pageStyleName to set
   */
  public void setPageStyleName(String pageStyleName)
  {
    this.pageStyleName = pageStyleName;
  }
  
  /**
   * @return the titleImgName
   */
  public String getTitleImgName()
  {
    return titleImgName;
  }
  /**
   * @return the titleImgStream
   */
  public byte[] getTitleImgStream()
  {
    return titleImgStream;
  }
  /**
   * @param titleImgStream the titleImgStream to set
   */
  public void setTitleImgStream(byte[] titleImgStream)
  {
    this.titleImgStream = titleImgStream;
  }
  /**
   * @return the pageImgStream
   */
  public byte[] getPageImgStream()
  {
    return pageImgStream;
  }
  /**
   * @param pageImgStream the pageImgStream to set
   */
  public void setPageImgStream(byte[] pageImgStream)
  {
    this.pageImgStream = pageImgStream;
  }
  /**
   * @return the styleXml
   */
  public byte[] getStyleXml()
  {
    return styleXml;
  }
  /**
   * @param styleXml the styleXml to set
   */
  public void setStyleXml(byte[] styleXml)
  {
    this.styleXml = styleXml;
  }
  /**
   * @param titleImgName the titleImgName to set
   */
  public void setTitleImgName(String titleImgName)
  {
    this.titleImgName = titleImgName;
  }
  /**
   * @return the pageImgName
   */
  public String getPageImgName()
  {
    return pageImgName;
  }
  /**
   * @param pageImgName the pageImgName to set
   */
  public void setPageImgName(String pageImgName)
  {
    this.pageImgName = pageImgName;
  }
}
