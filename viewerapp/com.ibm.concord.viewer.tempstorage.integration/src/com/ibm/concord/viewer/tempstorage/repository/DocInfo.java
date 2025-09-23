/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.tempstorage.repository;

import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;

public class DocInfo
{
  private String uri;
  private String mime;
  private String ext;
  private String title;
  private InputStream ins;
  private HttpServletRequest request;
  
  public void setMimeType(String mime)
  {
    this.mime = mime;
  }
  public String getMimeType()
  {
    return mime;
  }
  public void setExtension(String ext)
  {
    this.ext = ext;
  }
  public String getExtension()
  {
    return ext;
  }
  public void setTitle(String title)
  {
    this.title = title;
  }
  public String getTitle()
  {
    return title;
  }
  public void setInputStream(InputStream ins)
  {
    this.ins = ins;
  }
  public InputStream getInputStream()
  {
    return ins;
  }
  public void setRequest(HttpServletRequest request)
  {
    this.request = request;
  }
  public HttpServletRequest getRequest()
  {
    return request;
  }
  public void setUri(String uri)
  {
    this.uri = uri;
  }
  public String getUri()
  {
    return uri;
  }

}
