/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2015.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.docs.validator;

import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.internal.Messages;

public class SharedStorageValidator extends UserDataValidator
{

  public SharedStorageValidator()
  {
  }

  @Override
  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes") Map arg0)
  {
    return false;
  }

  @Override
  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {
    boolean convInstalled = map.get(Constants.SD_CONV_INSTALLED) != null
        && Boolean.parseBoolean(map.get(Constants.SD_CONV_INSTALLED).toString()) == true;
    boolean viewerInstalled = map.get(Constants.SD_VIEWER_INSTALLED) != null
        && Boolean.parseBoolean(map.get(Constants.SD_VIEWER_INSTALLED).toString()) == true;
    boolean docsInstalled = map.get(Constants.SD_DOCS_INSTALLED) != null
        && Boolean.parseBoolean(map.get(Constants.SD_DOCS_INSTALLED).toString()) == true;
    boolean isSameNode = map.get(Constants.SD_VIEWER_SAME_IC_NODE) != null
        && Boolean.parseBoolean(map.get(Constants.SD_VIEWER_SAME_IC_NODE).toString()) == true;
    boolean isICN = map.get(Constants.SD_IS_ICN) != null && Boolean.parseBoolean(map.get(Constants.SD_IS_ICN).toString()) == true;

    if (convInstalled && docsInstalled)
    {
      String sharedDir = map.get(Constants.SD_DOCS_SHARED_LOCAL_PATH).toString();
      if (sharedDir == null || sharedDir.trim().length() == 0)
      {
        return IMStatuses.ERROR.get(Messages.getString("DocsPanel_SharedDirNull$uuid"), "",
            Messages.getString("DocsPanel_SharedDirNull$explanation"), 0, Messages.getString("DocsPanel_SharedDirNull$message"));
      }
    }
    if (convInstalled && !isICN)
    {
      String viewerLocalPath = map.get(Constants.SD_VIEWER_SHARED_LOCAL_PATH).toString();
      if (viewerLocalPath == null || viewerLocalPath.trim().length() == 0)
      {
        return IMStatuses.ERROR.get("CLFAD3008E", Messages.getString("NULL_ERROR_VIEWER_SHARED_DIRECTORY_EXPLANATION"),
            Messages.getString("NULL_ERROR_VIEWER_SHARED_DIRECTORY_USERACTION"), 1,
            Messages.getString("NULL_ERROR_VIEWER_SHARED_DIRECTORY"));
      }
    }
    if (docsInstalled)
    {
      String docsServerLoc = map.get(Constants.SD_DOCS_SERVER_DATA_LOC).toString();
      if (docsServerLoc == null || docsServerLoc.trim().length() == 0)
      {
        return IMStatuses.ERROR.get(Messages.getString("DocsPanel_ServerLocNull$uuid"), "",
            Messages.getString("DocsPanel_ServerLocNull$explanation"), 0, Messages.getString("DocsPanel_ServerLocNull$message"));
      }
    }
    if (viewerInstalled)
    {
      String viewerServerLoc = map.get(Constants.SD_VIEWER_SERVER_DATA_LOC).toString();
      if (viewerServerLoc == null || viewerServerLoc.trim().length() == 0)
      {
        return IMStatuses.ERROR
            .get(Messages.getString("DocsPanel_ViewerServerLocNull$uuid"), "",
                Messages.getString("DocsPanel_ViewerServerLocNull$explanation"), 0,
                Messages.getString("DocsPanel_ViewerServerLocNull$message"));
      }

      if (!isSameNode)
      {
        String uploadFPath = map.get(Constants.SD_UPLOAD_FILES_PATH).toString();
        if (uploadFPath == null || uploadFPath.trim().length() == 0)
        {
          return IMStatuses.ERROR.get(Messages.getString("DocsPanel_UploadFPathNull$uuid"), "",
              Messages.getString("DocsPanel_UploadFPathNull$explanation"), 0, Messages.getString("DocsPanel_UploadFPathNull$message"));
        }
      }
    }
    
    if (docsInstalled && viewerInstalled)
    {
      String docsServerLoc = map.get(Constants.SD_DOCS_SERVER_DATA_LOC_ON_VIEWER).toString();
      if (docsServerLoc == null || docsServerLoc.trim().length() == 0)
      {
        return IMStatuses.ERROR
            .get(Messages.getString("DocsPanel_ViewerServerLocNull$uuid"), "",
                Messages.getString("DocsPanel_ViewerServerLocNull$explanation"), 0,
                Messages.getString("DocsPanel_ViewerServerLocNull$message"));
      }
    }    

    return Status.OK_STATUS;
  }

}
