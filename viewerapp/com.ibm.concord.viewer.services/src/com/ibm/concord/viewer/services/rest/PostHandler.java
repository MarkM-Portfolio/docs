/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.rest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface PostHandler
{
  /**
   * Process a POST request
   * 
   * @param request
   * @param response
   * @throws Exception
   */
  void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception;
}
