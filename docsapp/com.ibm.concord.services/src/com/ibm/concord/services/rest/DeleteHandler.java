/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface DeleteHandler
{
  /**
   * Process a DELETE request
   * 
   * @param request
   * @param response
   * @throws Exception
   */
  void doDelete(HttpServletRequest request, HttpServletResponse response) throws Exception;
}
