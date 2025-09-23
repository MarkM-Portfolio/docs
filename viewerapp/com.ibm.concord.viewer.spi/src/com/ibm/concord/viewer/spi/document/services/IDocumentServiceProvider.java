/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.document.services;


public interface IDocumentServiceProvider
{
  public boolean supportedDocumentService(String type);
  public IDocumentService getDocumentService(String mimeType);
  public IDocumentService getDocumentServiceByType(String type);
  public String getDocumentType(String mimeType);
}
