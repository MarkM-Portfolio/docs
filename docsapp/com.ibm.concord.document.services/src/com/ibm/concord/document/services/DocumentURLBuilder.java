/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.services;

import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.common.util.URLConfig;

public class DocumentURLBuilder
{
  private static String getURLPrefix()
  {
    String pre = URLConfig.getScheme() + "://" + URLConfig.getServerName();
    if (URLConfig.getServerPort() != 80)
    {
      pre += ":" + URLConfig.getServerPort();
    }
    return pre;
  }
  
  public static String getEditDocumentURI(IDocumentEntry docEntry)
  {
    String uri = URLConfig.getContextPath() + "/app/doc/" + docEntry.getRepository() + "/" + docEntry.getDocUri() + "/edit/content";
    return uri;
  }

  public static String getViewDocumentURI(IDocumentEntry docEntry)
  {
    String uri = URLConfig.getContextPath() + "/app/doc/" + docEntry.getRepository() + "/" + docEntry.getDocUri() + "/view/content";
    return uri;
  }
  
  //hardcode here, may use config file in future.
  public static String getLCViewDocumentURI(IDocumentEntry docEntry)
  {
    String uri = "/viewer/app/" + docEntry.getRepository() + "/" + docEntry.getDocUri() + "/content";
    return uri;
  }  
  
  public static String getLCFileDetailURI(IDocumentEntry docEntry)
  {
    String uri = docEntry.getFileDetailsURL();
    return uri;
  }  
  
  public static String getViewDocumentURL(IDocumentEntry docEntry)
  {
    return getURLPrefix() + getViewDocumentURI(docEntry);
  }
    
  public static String getEditDocumentURL(IDocumentEntry docEntry)
  {
    return getURLPrefix() + getEditDocumentURI(docEntry);
  }
  
}
