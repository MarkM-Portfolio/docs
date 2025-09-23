/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.servlets;

import java.io.IOException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.provisioning.ConcordProvisioningEndPoint;
import com.ibm.wdp.bss.chttp.endpoint.JsonMessageProcessor;
import com.ibm.wdp.bss.provisioning.EndpointServlet;

class ConcordProvisioningSCServlet extends EndpointServlet
{
  private static final long serialVersionUID = -3887133387154650224L;

  private ConcordProvisioningEndPoint endPoint = new ConcordProvisioningEndPoint();

  public JsonMessageProcessor getServiceEndPoint(HttpServletRequest request) throws Exception
  {
    return this.endPoint;
  }

  protected boolean authenticate(HttpServletRequest request, HttpServletResponse response)
  {
    return true;
  }

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    super.doGet(request, response);
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    super.doPost(request, response);
  }

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    super.doPut(request, response);
  }

  public void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    super.doDelete(request, response);
  }
}

public class ConcordProvisioningServlet extends HttpServlet
{
  private static final long serialVersionUID = 1L;

  private ConcordProvisioningSCServlet bssEndpoint;

  private static final boolean isCloud = Platform.getConcordConfig().isCloud();

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException
  {
    if (!isCloud)
    {
      super.doGet(request, response);
      return;
    }
    bssEndpoint.doGet(request, response);
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    if (!isCloud)
    {
      super.doPost(request, response);
      return;
    }
    bssEndpoint.doPost(request, response);
  }

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    if (!isCloud)
    {
      super.doPut(request, response);
      return;
    }
    bssEndpoint.doPut(request, response);
  }

  public void init() throws ServletException
  {
    if (!isCloud)
    {
      super.init();
      return;
    }
    bssEndpoint.init();
  }

  public void init(ServletConfig config) throws ServletException
  {
    if (!isCloud)
    {
      super.init(config);
      return;
    }
    bssEndpoint = new ConcordProvisioningSCServlet();
    bssEndpoint.init(config);
  }

  public void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    if (!isCloud)
    {
      super.doDelete(request, response);
      return;
    }
    bssEndpoint.doDelete(request, response);
  }

  public void destroy()
  {
    if (!isCloud)
    {
      super.destroy();
      return;
    }
    bssEndpoint.destroy();
  }

}
