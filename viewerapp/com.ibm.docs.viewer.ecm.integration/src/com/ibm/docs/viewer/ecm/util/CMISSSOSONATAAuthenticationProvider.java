/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.viewer.ecm.util;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.apache.chemistry.opencmis.client.bindings.spi.StandardAuthenticationProvider;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.RepositoryComponent;
import com.ibm.concord.viewer.platform.repository.RepositoryProviderRegistry;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.docs.viewer.ecm.repository.ECMRepository;

public class CMISSSOSONATAAuthenticationProvider extends StandardAuthenticationProvider
{
  private static final long serialVersionUID = -6600499832306843580L;

  private static final Logger LOG = Logger.getLogger(CMISSSOSONATAAuthenticationProvider.class.getName());

  public Map<String, List<String>> getHTTPHeaders(String url)
  {

    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
        RepositoryServiceUtil.ECM_FILES_REPO_ID);
    ECMRepository ecmAdapter = (ECMRepository) service.getRepository(RepositoryServiceUtil.ECM_FILES_REPO_ID);
    Map<String, List<String>> headers = ecmAdapter.getSONATAHeaders();
    return headers;
  }
}
