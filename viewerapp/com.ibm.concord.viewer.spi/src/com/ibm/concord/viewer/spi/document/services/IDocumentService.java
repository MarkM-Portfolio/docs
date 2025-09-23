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

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.job.IConversionJob;
import com.ibm.json.java.JSONObject;

public interface IDocumentService
{
  public void init(JSONObject config);

  /**
   * Called when it need to import a document from repository to Concord for EDIT. Document service implementation may need to perform conversion
   * job, modify or initialize the document if necessary, then, store the document content in draft storage.
   * 
   * @param caller
   *          caller of this request
   * @param mode 
   * @param entry
   *          entry to describe the document on repository
   * @return new value for IDocumentEntry
   * @throws Exception
   */
  public IDocumentEntry importDocument(UserBean caller, String userAgent, String mode, IDocumentEntry entry, IConversionJob job) throws Exception;

  /**
   * forward the request to document's viewer JSP page
   * @param caller
   *        caller of this request
   * @param docEntry
   *        IDocumentEntry which represents the document in repository
   * @param request
   * @param response
   */
  public void forwardViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;

  public JSONObject getConfigs();
}
