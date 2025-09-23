/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.platform.util.LimitsUtil;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.docs.common.util.FormatUtil;
import com.ibm.json.java.JSONObject;

public class ListHandler implements GetHandler
{

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    String method = request.getParameter("method");
    if ("fileType".equalsIgnoreCase(method))
    {

      String[] exts = new String(FormatUtil.ALL_EXTS).split(",");
      Map<String, String> formats = new HashMap<String, String>();
      for (int i = 0; i < exts.length; i++)
      {
        String ext = exts[i];
        String mime = FormatUtil.ALL_FORMATS.get(ext.substring(1)); // trim "." in extension
        IDocumentService docSrv = DocumentServiceUtil.getDocumentService(mime);
        long size = LimitsUtil.getShownSizeLimit((JSONObject) docSrv.getConfig().get("limits"), mime);
        formats.put(ext, String.valueOf(size)); // in KB
      }

      JSONObject filstypeJson = new JSONObject();
      filstypeJson.putAll(formats);

      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_OK);
      filstypeJson.serialize(response.getWriter());
      return;
    }

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
  }

}
