/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.services.rest.util;

import java.io.IOException;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;

import com.ibm.concord.platform.auth.CsrfAuth;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.docs.directory.beans.UserBean;

public class CsrfHelper
{
  private static final Logger LOG = Logger.getLogger(CsrfHelper.class.getName());

  private static final String CSRF = "csrf";

  public static void handleCsrfFormToken(UserBean caller, List<?> items, HttpServletRequest request, HttpServletResponse response)
      throws IOException
  {
    for (Object item : items)
    {
      FileItem fileItem = (FileItem) item;
      if (CSRF.equalsIgnoreCase(fileItem.getFieldName()))
      {
        String value = fileItem.getString();
        boolean verified = CsrfAuth.getInstance().verify(caller, value);
        if (!verified)
        {
          LOG.logp(Level.SEVERE, "Service", "service", "Csrf form token authentication fails, resource requested: " + request.getPathInfo());
          ServiceUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED);
          return;
        }
        items.remove(fileItem);
        break;
      }
    }
  }
}
