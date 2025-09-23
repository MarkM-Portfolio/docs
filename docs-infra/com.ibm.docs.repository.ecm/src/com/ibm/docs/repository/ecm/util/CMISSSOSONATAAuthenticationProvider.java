package com.ibm.docs.repository.ecm.util;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.apache.chemistry.opencmis.client.bindings.spi.StandardAuthenticationProvider;
import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.ConfigurationException;

import com.ibm.connections.httpClient.ByteOrderMarkSkipper;
import com.ibm.connections.httpClient.WASAdminService;
import com.ibm.docs.repository.ecm.ECMRepository;
import com.ibm.docs.framework.Components;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.RepositoryProviderRegistry;

public class CMISSSOSONATAAuthenticationProvider extends StandardAuthenticationProvider
{
  private static String USER_INSTALL_ROOT = "user.install.root";

  private static String CONFIG = "config";

  private static String CELLS = "cells";

  private static String SECURITY_XML = "security.xml";

  public Map<String, List<String>> getHTTPHeaders(String url)
  {

    IComponent repoComp = Components.getComponent(RepositoryComponent.COMPONENT_ID);
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) repoComp.getService(RepositoryProviderRegistry.class);
    ECMRepository repositoryAdapter = (ECMRepository) service.getRepository(RepositoryConstants.REPO_TYPE_ECM);

    Map<String, List<String>> headers = repositoryAdapter.getSONATAHeaders();
    return headers;
  }

  public static String getJ2ASUserName(String aliasName) throws ConfigurationException, IOException
  {
    String userInstallRoot = System.getProperty(USER_INSTALL_ROOT);
    String cellName = WASAdminService.getCellName();
    String configFilePath = userInstallRoot + java.io.File.separator + CONFIG + java.io.File.separator + CELLS + java.io.File.separator
        + cellName + java.io.File.separator + SECURITY_XML;
    File configFile = new File(configFilePath);

    Configuration config = ByteOrderMarkSkipper.loadConfigFile(configFile);
    for (int j = 0;; j++)
    {
      String alias = config.getString("authDataEntries(" + j + ")[@alias]");
      if (alias == null || alias.length() == 0)
        break;
      if (alias.equals(aliasName))
      {
        return config.getString("authDataEntries(" + j + ")[@userId]");
        // password = config.getString("authDataEntries(" + j + ")[@password]");
      }
    }
    return null;
  }
}
