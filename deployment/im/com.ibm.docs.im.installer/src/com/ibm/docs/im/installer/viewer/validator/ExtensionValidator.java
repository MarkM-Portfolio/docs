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

import java.io.File;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.internal.Messages;

public class ExtensionValidator extends UserDataValidator
{

  @Override
  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes") Map arg0)
  {
    return false;
  }

  @Override
  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {

    boolean isViewerExtInstalled = map.get(Constants.VIEWER_EXT_INSTALLED) != null
        && Boolean.parseBoolean(map.get(Constants.VIEWER_EXT_INSTALLED).toString()) == true;

    boolean isDocsExtInstalled = map.get(Constants.DOCS_EXT_INSTALLED) != null
        && Boolean.parseBoolean(map.get(Constants.DOCS_EXT_INSTALLED).toString()) == true;

    if (isDocsExtInstalled)
    {
      Object docsExtInstallLocation = map.get(Constants.DOCS_EXT_IC_INSTALLATION_PATH);
      if (docsExtInstallLocation == null || docsExtInstallLocation.toString().trim().length() == 0)
      {
        return IMStatuses.ERROR.get("CLFAD3001E", Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH_USERACTIONFF"), 1,
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH"));
      }

      File dir = new File(docsExtInstallLocation.toString());
      if (dir==null || !dir.exists())
      {
        return IMStatuses.ERROR.get("CLFAD30011E", Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH1_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH1_USERACTION"), 1,
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH2"));
      }
      
      if (!checkExtJarDir(docsExtInstallLocation.toString()))
      {
        return IMStatuses.ERROR.get("CLFAD30010E", Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH1_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH1_USERACTION"), 1,
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH1"));
      }
      
      Object docsExtSharedPath = map.get(Constants.DOCS_EXT_SHARED_PATH);
      if (docsExtSharedPath == null || docsExtSharedPath.toString().trim().length() == 0)
      {
        return IMStatuses.ERROR.get("CLFAD3002E", Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH_USERACTION"), 1, Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH"));
      }
      
      dir = new File(docsExtSharedPath.toString());
      if (dir==null || !dir.exists())
      {
        return IMStatuses.ERROR.get("CLFAD30021E", Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH1_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH1_USERACTIONN"), 1, Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH2"));
      }

      if (!checkDeamonDir(docsExtSharedPath.toString(),docsExtInstallLocation.toString()))
      {
        return IMStatuses.ERROR.get("CLFAD30020E", Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH1_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH1_USERACTIONN"), 1, Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH1"));
      }
      
      String docAuthType = (String) map.get(Constants.DOCS_EXT_AUTH_TYPE);
      if (Constants.AUTH_TYPE_SAML.equals(docAuthType))
      {
        Object docsExtJ2CAlias = map.get(Constants.DOCS_EXT_J2C_ALIAS);
        if (docsExtJ2CAlias == null || docsExtJ2CAlias.toString().trim().length() == 0)
        {
          return IMStatuses.ERROR.get("CLFAD3003E", Messages.getString("NULL_ERROR_DOCS_EXT_J2C_ALIAS_EXPLANATION"),
              Messages.getString("NULL_ERROR_DOCS_EXT_J2C_ALIAS_USERACTION"), 1, Messages.getString("NULL_ERROR_DOCS_EXT_J2C_ALIAS"));
        }
      }

      Object docsExtICVersion = map.get(Constants.DOCS_EXT_IC_VERSION);
      if (docsExtICVersion == null || docsExtICVersion.toString().trim().length() == 0)
      {
        return IMStatuses.ERROR.get("CLFAD3004E", Messages.getString("NULL_ERROR_DOCS_EXT_IC_VERSION_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_IC_VERSION_USERACTION"), 1, Messages.getString("NULL_ERROR_DOCS_EXT_IC_VERSION"));
      }
      else
      {
        try
        {
          Float version = new Float(docsExtICVersion.toString());
          if ( version != 5.0 && version != 5.5)
          {
            throw new NumberFormatException();
          }
        }
        catch (NumberFormatException e)
        {
          return IMStatuses.ERROR.get("CLFAD3005E", Messages.getString("INVALID_ERROR_DOCS_EXT_IC_VERSION_INVALID_EXPLANATION"),
              Messages.getString("INVALID_ERROR_DOCS_EXT_IC_VERSION_INVALID_USERACTION"), 1,
              Messages.getString("INVALID_ERROR_DOCS_EXT_IC_VERSION_INVALID"));
        }
      }
    }
    if (isViewerExtInstalled)
    {
      Object docsExtInstallLocation = map.get(Constants.DOCS_EXT_IC_INSTALLATION_PATH);
      if (docsExtInstallLocation == null || docsExtInstallLocation.toString().trim().length() == 0 )
      {
        return IMStatuses.ERROR.get("CLFAD3001E", Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH_USERACTIONFF"), 1,
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH"));
      }
      
      File dir = new File(docsExtInstallLocation.toString());
      if (dir==null || !dir.exists())
      {
        return IMStatuses.ERROR.get("CLFAD30011E", Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH1_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH1_USERACTION"), 1,
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH2"));
      }
      
      if (!checkExtJarDir(docsExtInstallLocation.toString()))
      {
        return IMStatuses.ERROR.get("CLFAD30010E", Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH1_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH1_USERACTION"), 1,
            Messages.getString("NULL_ERROR_DOCS_EXT_INSTALLATION_PATH1"));
      }

      Object docsExtSharedPath = map.get(Constants.DOCS_EXT_SHARED_PATH);
      if (docsExtSharedPath == null || docsExtSharedPath.toString().trim().length() == 0)
      {
        return IMStatuses.ERROR.get("CLFAD3002E", Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH_USERACTION"), 1, Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH"));
      }
      
      dir = new File(docsExtSharedPath.toString());
      if (dir==null || !dir.exists())
      {
        return IMStatuses.ERROR.get("CLFAD30021E", Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH1_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH1_USERACTIONN"), 1, Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH2"));
      }
      
      if (!checkDeamonDir(docsExtSharedPath.toString(),docsExtInstallLocation.toString()))
      {
        return IMStatuses.ERROR.get("CLFAD30020E", Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH1_EXPLANATION"),
            Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH1_USERACTIONN"), 1, Messages.getString("NULL_ERROR_DOCS_EXT_SHARED_PATH1"));
      }
      
      String viewerAuthType = (String) map.get(Constants.VIEWER_EXT_AUTH_TYPE);
      if (Constants.AUTH_TYPE_SAML.equals(viewerAuthType))
      {
        Object viewerExtJ2CAlias = map.get(Constants.VIEWER_EXT_J2C_ALIAS);
        if (viewerExtJ2CAlias == null || viewerExtJ2CAlias.toString().trim().length() == 0)
        {
          return IMStatuses.ERROR.get("CLFAD3006E", Messages.getString("NULL_ERROR_VIEWER_EXT_J2C_ALIAS_EXPLANATION"),
              Messages.getString("NULL_ERROR_VIEWER_EXT_J2C_ALIAS_USERACTIONF"), 1, Messages.getString("NULL_ERROR_VIEWER_EXT_J2C_ALIAS"));
        }
      }
    }
    return Status.OK_STATUS;
  }

  private boolean checkExtJarDir(String path)
  {
    if (path == null)
      return false;

    boolean bRet = false;    
    String pathFmt = (new StringBuffer()).append("/").append("provision").append("/").append("webresources")
        .toString();
    
    path = path.replace("\\", "/");
    
    // Properties prop = System.getProperties();
    // String os = prop.getProperty("os.name");
    // if (os.startsWith("win") || os.startsWith("Win"))

    int len = path.length();
    int subLen = pathFmt.length();
    if (len <= subLen)
      return false;

    if (path.endsWith(File.separator))
    {
      String subPath = path.substring(len - subLen - 1, len - 1);
      if (subPath.equalsIgnoreCase(pathFmt))
        bRet = true;
    }
    else
    {
      String subPath = path.substring(len - subLen, len);
      if (subPath.equalsIgnoreCase(pathFmt))
        bRet = true;
    }

    return bRet;
  }

  private boolean checkDeamonDir(String path,String extPath)
  {
    if (path == null || extPath==null)
      return false;

    boolean bRet = false;    
    //check ../provision/webresources    
    String pathFmt = (new StringBuffer()).append("/").append("provision").append("/").append("webresources")
        .toString();    
    path = path.replace("\\", "/");
    extPath = extPath.replace("\\", "/");
    String start = (new StringBuffer()).append("^").append(extPath.toLowerCase().substring(0, extPath.toLowerCase().indexOf(pathFmt))).toString();    
    Pattern pattern = Pattern.compile(start);    
    Matcher matcher = pattern.matcher((new StringBuffer()).append(path.toLowerCase()).toString());    
    if (matcher.find())
    {
      bRet = true;
    }
    
    return bRet;
  }  
}
