/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2015.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.integration.validator;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.internal.Messages;

public class ThirdPartyValidator extends UserDataValidator
{

  public ThirdPartyValidator()
  {

  }

  @Override
  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes") Map map)
  {
    if (map.get(Constants.EXTERNAL_REPOSITORY_TYPE) == null || map.get(Constants.EXTERNAL_CMIS_ATOM_PUB) == null
        || map.get(Constants.EXTERNAL_META_URL) == null || map.get(Constants.EXTERNAL_S2S_METHOD) == null
        || map.get(Constants.EXTERNAL_REPOSITORY_HOME) == null)
      return true;
    return false;
  }

  @Override
  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {
    String repoType = map.get(Constants.EXTERNAL_REPOSITORY_TYPE).toString();
    if (repoType != null && repoType.trim().length() != 0)
    {
      if (Constants.REPO_CMIS.equals(repoType))
      {
        String cmisAtom = map.get(Constants.EXTERNAL_CMIS_ATOM_PUB).toString();
        if (cmisAtom == null || cmisAtom.trim().length() == 0)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_CsimAtomNull$uuid"), "",
              Messages.getString("ThirdParty_CsimAtomNull$explanation"), 0, Messages.getString("ThirdParty_CsimAtomNull$message"));
        }
        try
        {
          new URL(cmisAtom);
        }
        catch (MalformedURLException e)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_CsimAtomInvalid$uuid"), "",
              Messages.getString("ThirdParty_CsimAtomInvalid$explanation"), 0, Messages.getString("ThirdParty_CsimAtomInvalid$message"));
        }
      }
      else if (Constants.REPO_REST.equals(repoType))
      {
        String metaUrl = map.get(Constants.EXTERNAL_META_URL).toString();
        if (metaUrl == null || metaUrl.trim().length() == 0)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_metaUrlNull$uuid"), "",
              Messages.getString("ThirdParty_metaUrlNull$explanation"), 0, Messages.getString("ThirdParty_metaUrlNull$message"));
        }
        try
        {
          new URL(metaUrl);
        }
        catch (MalformedURLException e)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_metaUrlInvalid$uuid"), "",
              Messages.getString("ThirdParty_metaUrlInvalid$explanation"), 0, Messages.getString("ThirdParty_metaUrlInvalid$message"));
        }

        String getUrl = map.get(Constants.EXTERNAL_GET_CONTENT_URL).toString();
        if (getUrl == null || getUrl.trim().length() == 0)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_getUrlNull$uuid"), "",
              Messages.getString("ThirdParty_getUrlNull$explanation"), 0, Messages.getString("ThirdParty_getUrlNull$message"));
        }
        try
        {
          new URL(getUrl);
        }
        catch (MalformedURLException e)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_getUrlInvalid$uuid"), "",
              Messages.getString("ThirdParty_getUrlInvalid$explanation"), 0, Messages.getString("ThirdParty_getUrlInvalid$message"));
        }
        // if docs is installed, try to verify the set content url
        boolean docsInstalled = map.get(Constants.SD_DOCS_INSTALLED) != null
            && Boolean.parseBoolean(map.get(Constants.SD_DOCS_INSTALLED).toString()) == true;
        if (docsInstalled)
        {
          String setUrl = map.get(Constants.EXTERNAL_SET_CONTENT_URL).toString();
          if (setUrl == null || setUrl.trim().length() == 0)
          {
            return IMStatuses.ERROR.get(Messages.getString("ThirdParty_setUrlNull$uuid"), "",
                Messages.getString("ThirdParty_setUrlNull$explanation"), 0, Messages.getString("ThirdParty_setUrlNull$message"));
          }
          try
          {
            new URL(setUrl);
          }
          catch (MalformedURLException e)
          {
            return IMStatuses.ERROR.get(Messages.getString("ThirdParty_setUrlInvalid$uuid"), "",
                Messages.getString("ThirdParty_setUrlInvalid$explanation"), 0, Messages.getString("ThirdParty_setUrlInvalid$message"));
          }
        }
      }
    }
    String s2s_method = map.get(Constants.EXTERNAL_S2S_METHOD).toString();
    if (s2s_method != null && s2s_method.trim().length() != 0)
    {
      if (Constants.AUTH_OAUTH2.equals(s2s_method))
      {
        String oauth = map.get(Constants.EXTERNAL_OAUTH_ENDPOINT).toString();
        if (oauth == null || oauth.trim().length() == 0)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_oauthNull$uuid"), "",
              Messages.getString("ThirdParty_oauthNull$explanation"), 0, Messages.getString("ThirdParty_oauthNull$message"));
        }
        try
        {
          new URL(oauth);
        }
        catch (MalformedURLException e)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_oauthInvalid$uuid"), "",
              Messages.getString("ThirdParty_oauthInvalid$explanation"), 0, Messages.getString("ThirdParty_oauthInvalid$message"));
        }
      }
      else if (Constants.AUTH_J2C.equals(s2s_method))
      {
        String alias = map.get(Constants.EXTERNAL_J2C_ALIAS).toString();
        if (alias == null || alias.trim().length() == 0)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_aliasNull$uuid"), "",
              Messages.getString("ThirdParty_aliasNull$explanation"), 0, Messages.getString("ThirdParty_aliasNull$message"));
        }

        String asUser = map.get(Constants.EXTERNAL_AS_USER_KEY).toString();
        if (asUser == null || asUser.trim().length() == 0)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_asUserNull$uuid"), "",
              Messages.getString("ThirdParty_asUserNull$explanation"), 0, Messages.getString("ThirdParty_asUserNull$message"));
        }
      }
      else if (Constants.AUTH_S2S.equals(s2s_method))
      {
        String tokenKey = map.get(Constants.EXTERNAL_TOKEN_KEY).toString();
        if (tokenKey == null || tokenKey.trim().length() == 0)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_tokenKeyNull$uuid"), "",
              Messages.getString("ThirdParty_tokenKeyNull$explanation"), 0, Messages.getString("ThirdParty_tokenKeyNull$message"));
        }
        String tokenValue = map.get(Constants.EXTERNAL_S2S_TOKEN).toString();
        if (tokenValue == null || tokenValue.trim().length() == 0)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_tokenNull$uuid"), "",
              Messages.getString("ThirdParty_tokenNull$explanation"), 0, Messages.getString("ThirdParty_tokenNull$message"));
        }
        String asUser = map.get(Constants.EXTERNAL_AS_USER_KEY).toString();
        if (asUser == null || asUser.trim().length() == 0)
        {
          return IMStatuses.ERROR.get(Messages.getString("ThirdParty_asUserNull$uuid"), "",
              Messages.getString("ThirdParty_asUserNull$explanation"), 0, Messages.getString("ThirdParty_asUserNull$message"));
        }
      }
    }
    // verify repository home
    String repoHome = map.get(Constants.EXTERNAL_REPOSITORY_HOME).toString();
    if (repoHome == null || repoHome.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("ThirdParty_repoHomeNull$uuid"), "",
          Messages.getString("ThirdParty_repoHomeNull$explanation"), 0, Messages.getString("ThirdParty_repoHomeNull$message"));
    }
    try
    {
      new URL(repoHome);
    }
    catch (MalformedURLException e)
    {
      return IMStatuses.ERROR.get(Messages.getString("ThirdParty_repoHomeInvalid$uuid"), "",
          Messages.getString("ThirdParty_repoHomeInvalid$explanation"), 0, Messages.getString("ThirdParty_repoHomeInvalid$message"));
    }
    //everything is okay now.
    return Status.OK_STATUS;
  }

}
