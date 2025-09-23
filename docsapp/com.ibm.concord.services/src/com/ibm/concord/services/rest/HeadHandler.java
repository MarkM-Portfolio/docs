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

public interface HeadHandler
{
  /**
   * Process a HEAD request
   * 
   * @param request
   * @param response
   * @throws Exception
   */
  void doHead(HttpServletRequest request, HttpServletResponse response) throws Exception;
}
