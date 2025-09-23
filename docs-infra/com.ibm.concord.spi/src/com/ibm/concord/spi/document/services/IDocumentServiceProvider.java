/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.document.services;

import java.util.Map;


public interface IDocumentServiceProvider
{
  public boolean supportedDocumentService(String type);
  public boolean supportedDocumentMimeType(String mimeType);
  public IDocumentService getDocumentService(String mimeType);
  public IDocumentService getDocumentServiceByType(String type);
  public String getDocumentType(String mimeType);
  public Map<String, String> getDocumentServiceVersions();
}
