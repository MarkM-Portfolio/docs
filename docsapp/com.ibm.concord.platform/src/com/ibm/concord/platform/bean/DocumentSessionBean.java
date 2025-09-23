/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.bean;

/**
 * Presents document session related information. The information includes repository id,
 * the document id, the full name of server that is serving this document and the status.
 * 
 */
public class DocumentSessionBean
{
  public final static int STATUS_ACTIVE = 0;
  public final static int STATUS_REACTIVE = 1;
  
  private String repoId;
  private String docId;
  private String servingServer;
  private int status = STATUS_ACTIVE;

  /**
   * 
   * @param repoId specifies the repository id
   * @param docId specifies the document id
   * @param servedServer specifies the server name that serving the document
   * @param status specifies the serving status
   */
  public DocumentSessionBean(String repoId, String docId, String servedServer, int status)
  {
    this.repoId = repoId;
    this.docId = docId;
    this.servingServer = servedServer;
    this.status = status;
  }

  /**
   * Get the document repository id of this bean.
   * 
   * @return
   */
  public String getRepoId()
  {
    return repoId;
  }

  /**
   * Set the document repository id of this bean.
   * 
   * @param repoId
   */
  public void setRepoId(String repoId)
  {
    this.repoId = repoId;
  }

  /**
   * Get the document id of this bean.
   * 
   * @return
   */
  public String getDocId()
  {
    return docId;
  }

  /**
   * Set the document id of this bean.
   * 
   * @param docId
   */
  public void setDocId(String docId)
  {
    this.docId = docId;
  }

  /**
   * Get full name of the server that is serving the document session.
   * 
   * @return full name of the server that is serving the document
   */
  public String getServingServer()
  {
    return servingServer;
  }

  /**
   * Set full name of the server that is serving the document session.
   * 
   * @param servingServer specifies full name of the server that is serving the document
   */
  public void setServingServer(String servingServer)
  {
    this.servingServer = servingServer;
  }

  /**
   * Get the status of the serving server.
   * 
   * @return the status of the serving server
   */
  public int getStatus()
  {
    return this.status;
  }

  /**
   * Set the status of the  serving server.
   * 
   * @param status
   */
  public void setStatus(int status)
  {
    this.status = status;
  }
}
