/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.viewer.validator;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.internal.Messages;

public class ViewerClusterValidator extends UserDataValidator
{

  @Override
  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes") Map map)
  {
    if (map.get(Constants.VIEWER_CONVERSION_SERVICE_PATH) == null)
      return true;
    return false;
  }

  @Override
  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {

    boolean isSameCell = map.get(Constants.VIEWER_SAME_CELL_AS_CONVERSION) != null
        && Boolean.parseBoolean(map.get(Constants.VIEWER_SAME_CELL_AS_CONVERSION).toString()) == true;

    if (!isSameCell)
    {
      Object connSrvPath = map.get(Constants.VIEWER_CONVERSION_SERVICE_PATH);
      if (connSrvPath == null || connSrvPath.toString().trim().length() == 0)
      {
        return IMStatuses.ERROR.get("CLFAD3009E", Messages.getString("NULL_ERROR_VIEWER_CONNECTION_SERVICE_PATH_EXPLANATION"),
            Messages.getString("INVALID_ERROR_VIEWER_CONNECTION_SERVICE_PATH_USERACTION"), 1,
            Messages.getString("NULL_ERROR_VIEWER_CONNECTION_SERVICE_PATH"));
      }
      else
      {
        try
        {
          URL url = new URL(connSrvPath.toString().trim());
          if (url.getProtocol().isEmpty() || url.getHost().isEmpty())
          {
            throw new MalformedURLException();
          }
        }
        catch (MalformedURLException e)
        {
          return IMStatuses.ERROR.get("CLFAD3010E", Messages.getString("INVALID_ERROR_VIEWER_CONNECTION_SERVICE_PATH_EXPLANATION"),
              Messages.getString("INVALID_ERROR_VIEWER_CONNECTION_SERVICE_PATH_USERACTION"), 1,
              Messages.getString("INVALID_ERROR_VIEWER_CONNECTION_SERVICE_PATH"));
        }

      }
    }

    Object authType = map.get(Constants.VIEWER_AUTHENTICATION_TYPE);
    if (authType.toString().equals("TAM"))
    {
      Object authServerHostOfDocs = map.get(Constants.VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS);
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

    Object cleaningCache = map.get(Constants.VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE);
    if (cleaningCache == null || cleaningCache.toString().trim().length() == 0)
    {
      return IMStatuses.ERROR.get("CLFAD3013E",
          Messages.getString("NULL_ERROR_VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE_EXPLANATION"),
          Messages.getString("NULL_ERROR_VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE_USERACTION"), 1,
          Messages.getString("NULL_ERROR_VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE"));
    }
    else
    {
      try
      {
        int days = new Integer(cleaningCache.toString());
        if (days < 0)
        {
          throw new NumberFormatException();
        }
      }
      catch (NumberFormatException e)
      {
        return IMStatuses.ERROR.get("CLFAD3014E",
            Messages.getString("INVALID_ERROR_VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE_EXPLANATION"),
            Messages.getString("INVALID_ERROR_VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE_USERACTION"), 1,
            Messages.getString("INVALID_ERROR_VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE"));
      }
    }

    Object triggerCleaning = map.get(Constants.VIEWER_TRIGGERING_LATEST_VERSION_CLEANING);
    if (triggerCleaning == null || triggerCleaning.toString().trim().length() == 0)
    {
      return IMStatuses.ERROR.get("CLFAD3015E", Messages.getString("NULL_ERROR_VIEWER_TRIGGERING_LATEST_VERSION_CLEANING_EXPLANATION"),
          Messages.getString("NULL_ERROR_VIEWER_TRIGGERING_LATEST_VERSION_CLEANING_USERACTION"), 1,
          Messages.getString("NULL_ERROR_VIEWER_TRIGGERING_LATEST_VERSION_CLEANING"));
    }
    else
    {
      try
      {
        int days = new Integer(triggerCleaning.toString());
        if (days < 64)
        {
          throw new NumberFormatException();
        }
      }
      catch (NumberFormatException e)
      {
        return IMStatuses.ERROR.get("CLFAD3016E",
            Messages.getString("INVALID_ERROR_VIEWER_TRIGGERING_LATEST_VERSION_CLEANING_EXPLANATION"),
            Messages.getString("INVALID_ERROR_VIEWER_TRIGGERING_LATEST_VERSION_CLEANING_USERACTION"), 1,
            Messages.getString("INVALID_ERROR_VIEWER_TRIGGERING_LATEST_VERSION_CLEANING"));
      }
    }

    return Status.OK_STATUS;

  }
}
