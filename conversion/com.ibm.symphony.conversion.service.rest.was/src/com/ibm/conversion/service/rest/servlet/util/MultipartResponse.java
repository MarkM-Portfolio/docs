/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet.util;

import java.io.IOException;
import java.util.UUID;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

public class MultipartResponse {

  HttpServletResponse res;
  ServletOutputStream out;
  boolean endedLastResponse = true;
  private String boundary;

  public MultipartResponse(HttpServletResponse response) throws IOException {
    res = response;
    out = res.getOutputStream();
    boundary = UUID.randomUUID().toString();
    res.setContentType("multipart/x-mixed-replace;boundary=" + boundary);
    out.println();
    out.println("--" + boundary);
  }
  public void startResponse(String contentType) throws IOException {
    if (!endedLastResponse) {
      endResponse();
    }
    out.println("Content-Type: " + contentType);
    out.println();
    endedLastResponse = false;
  }

  public void endResponse() throws IOException {
    out.println();
    out.println("--" + boundary);
//    out.flush();
    endedLastResponse = true;
  }

  public void finish() throws IOException {
	out.println();
    out.println("--" + boundary + "--");
    out.flush();
  }
}
