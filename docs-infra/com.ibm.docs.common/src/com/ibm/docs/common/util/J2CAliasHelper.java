package com.ibm.docs.common.util;

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.ConfigurationException;

import com.ibm.connections.httpClient.ByteOrderMarkSkipper;
import com.ibm.connections.httpClient.WASAdminService;
import com.ibm.websphere.crypto.InvalidPasswordDecodingException;
import com.ibm.websphere.crypto.PasswordUtil;
import com.ibm.websphere.crypto.UnsupportedCryptoAlgorithmException;

public class J2CAliasHelper
{
  public static final Logger LOG = Logger.getLogger(J2CAliasHelper.class.getName());
  
  public static String[] getJ2ASUserName(String j2c_alias)
  {
    String userName = null;
    String passWord = null;
    String userInstallRoot = System.getProperty("user.install.root");
    String cellName = WASAdminService.getCellName();
    String configFilePath = userInstallRoot + java.io.File.separator + "config" + java.io.File.separator + "cells" + java.io.File.separator
        + cellName + java.io.File.separator + "security.xml";
    File configFile = new File(configFilePath);

    Configuration config;
    try
    {
      config = ByteOrderMarkSkipper.loadConfigFile(configFile);
      for (int j = 0;; j++)
      {
        String alias = config.getString("authDataEntries(" + j + ")[@alias]");
        if (alias == null || alias.length() == 0)
          break;
        if (alias.equals(j2c_alias))
        {
          userName = config.getString("authDataEntries(" + j + ")[@userId]");
          String encodePSW = config.getString("authDataEntries(" + j + ")[@password]");
          passWord = PasswordUtil.decode(encodePSW);
        }
      }      
    }
    catch (ConfigurationException e)
    {
      LOG.log(Level.WARNING, "Exception: " + e);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Exception: " + e);
    }
    catch (InvalidPasswordDecodingException e)
    {
      LOG.log(Level.WARNING, "Exception: " + e);
    }
    catch (UnsupportedCryptoAlgorithmException e)
    {
      LOG.log(Level.WARNING, "Exception: " + e);
    }

    String[] pairs = new String[] {userName, passWord};
    return pairs;
  }

}
