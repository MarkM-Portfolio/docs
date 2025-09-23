/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.external.repository.rest;

import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.io.input.AutoCloseInputStream;


public class AutoReleaseHttpConnectionInputStream extends AutoCloseInputStream
{
  private HttpMethod httpMethod;

  public AutoReleaseHttpConnectionInputStream(InputStream in, HttpMethod httpMethod)
  {
    super(in);
    this.httpMethod = httpMethod;
  }

  public void close() throws IOException
  {
    try
    {
      super.close();
    }
    finally
    {
      if (httpMethod != null)
      {
        httpMethod.releaseConnection();
      }
    }
  }
}
