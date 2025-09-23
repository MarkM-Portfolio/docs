/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.docs.validator;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.internal.Messages;

public class DocsValidator extends UserDataValidator
{
  private static final String FILE_SUBFIX = "/files";

  private static final String CONN_SUBFIX = "/connections";

  public DocsValidator()
  {
  }

  @Override
  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes") Map map)
  {
    // If Docs panel is not loaded, don't validate the user data
    if (map.get(Constants.DOCS_INSTALL_LOCATION) == null || map.get(Constants.DOCS_CONN_FILES_URL) == null
        || map.get(Constants.DOCS_CONNECTION_URL) == null || map.get(Constants.DOCS_CONV_SERVICE_URL) == null
        || map.get(Constants.DOCS_CONN_ADMIN) == null)
      return true;
    return false;
  }

  @Override
  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {
    String installLoc = map.get(Constants.DOCS_INSTALL_LOCATION).toString();
    if (installLoc == null || installLoc.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("DocsPanel_InstallLocNull$uuid"), "",
          Messages.getString("DocsPanel_InstallLocNull$explanation"), 0, Messages.getString("DocsPanel_InstallLocNull$message"));
    }
    boolean isICSameCell = map.get(Constants.SD_SAME_IC_CESS) != null
        && Boolean.parseBoolean(map.get(Constants.SD_SAME_IC_CESS).toString()) == true;
    boolean isICN = map.get(Constants.SD_IS_ICN) != null && Boolean.parseBoolean(map.get(Constants.SD_IS_ICN).toString()) == true;
    if (!isICSameCell && !isICN)
    {
      String filesUrl = map.get(Constants.DOCS_CONN_FILES_URL).toString();
      if (filesUrl == null || filesUrl.trim().length() == 0)
      {
        return IMStatuses.ERROR.get(Messages.getString("DocsPanel_FilesUrlNull$uuid"), "",
            Messages.getString("DocsPanel_FilesUrlNull$explanation"), 0, Messages.getString("DocsPanel_FilesUrlNull$message"));
      }
      try
      {
        new URL(filesUrl);
        if (filesUrl.trim().indexOf(FILE_SUBFIX) == -1)
        {
          return IMStatuses.ERROR.get(Messages.getString("DocsPanel_FilesUrlInvalid$uuid"), "",
              Messages.getString("DocsPanel_FilesUrlInvalid$explanation"), 0, Messages.getString("DocsPanel_FilesUrlInvalid$message"));
        }

      }
      catch (MalformedURLException e)
      {
        return IMStatuses.ERROR.get(Messages.getString("DocsPanel_FilesUrlInvalid$uuid"), "",
            Messages.getString("DocsPanel_FilesUrlInvalid$explanation"), 0, Messages.getString("DocsPanel_FilesUrlInvalid$message"));
      }

      String connectionsUrl = map.get(Constants.DOCS_CONNECTION_URL).toString();
      if (connectionsUrl == null || connectionsUrl.trim().length() == 0)
      {
        return IMStatuses.ERROR.get(Messages.getString("DocsPanel_ConnUrlNull$uuid"), "",
            Messages.getString("DocsPanel_ConnUrlNull$explanation"), 0, Messages.getString("DocsPanel_ConnUrlNull$message"));
      }
      try
      {
        new URL(connectionsUrl);
        if (connectionsUrl.trim().indexOf(CONN_SUBFIX) == -1)
        {
          return IMStatuses.ERROR.get(Messages.getString("DocsPanel_ConnUrlInvalid$uuid"), "",
              Messages.getString("DocsPanel_ConnUrlInvalid$explanation"), 0, Messages.getString("DocsPanel_ConnUrlInvalid$message"));
        }
      }
      catch (MalformedURLException e)
      {
        return IMStatuses.ERROR.get(Messages.getString("DocsPanel_ConnUrlInvalid$uuid"), "",
            Messages.getString("DocsPanel_ConnUrlInvalid$explanation"), 0, Messages.getString("DocsPanel_ConnUrlInvalid$message"));
      }
    }

    String convService = map.get(Constants.DOCS_CONV_SERVICE_URL).toString();
    if (convService == null || convService.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("DocsPanel_ConvServiceNull$uuid"), "",
          Messages.getString("DocsPanel_ConvServiceNull$explanation"), 0, Messages.getString("DocsPanel_ConvServiceNull$message"));
    }
    if (!isICN)
    {
      String connAdmin = map.get(Constants.DOCS_CONN_ADMIN).toString();
      if (connAdmin == null || connAdmin.trim().length() == 0)
      {
        return IMStatuses.ERROR.get(Messages.getString("DocsPanel_ConnAdminNull$uuid"), "",
            Messages.getString("DocsPanel_ConnAdminNull$explanation"), 0, Messages.getString("DocsPanel_ConnAdminNull$message"));
      }
    }

    Object authType = map.get(Constants.DOCS_AUTHORIZATION);
    if (Constants.DOCS_AUTHORIZATION_TAM.equals(authType.toString()))
    {
      Object authServerHostOfDocs = map.get(Constants.DOCS_TAM_HOST);
      if (authServerHostOfDocs == null || authServerHostOfDocs.toString().trim().length() == 0)
      {
        return IMStatuses.ERROR.get("CLFAD3011E", Messages.getString("NULL_ERROR_VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS_EXPLANATION"),
            Messages.getString("NULL_ERROR_VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS_USERACTION"), 1,
            Messages.getString("NULL_ERROR_VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS"));
      }
      else
      {
        try
        {
          URL url = new URL(authServerHostOfDocs.toString().trim());
          if (url.getProtocol().isEmpty() || url.getHost().isEmpty())
          {
            throw new MalformedURLException();
          }
        }
        catch (MalformedURLException e)
        {
          return IMStatuses.ERROR.get("CLFAD3012E",
              Messages.getString("INVALID_ERROR_VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS_EXPLANATION"),
              Messages.getString("INVALID_ERROR_VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS_USERACTION"), 1,
              Messages.getString("INVALID_ERROR_VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS"));
        }
      }
    }
    return Status.OK_STATUS;
  }

}
