/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.common.util;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.net.URL;
import java.net.UnknownHostException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.Vector;

import org.eclipse.core.runtime.FileLocator;
import org.eclipse.core.runtime.Path;
import org.osgi.framework.Version;
import com.ibm.cic.agent.core.api.IAgent;
import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.ICustomPanelData;
import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.common.core.api.utils.EncryptionUtils;
import com.ibm.cic.common.core.model.IFeature;
import com.ibm.cic.common.core.model.IOffering;
import com.ibm.docs.im.installer.common.CommonPlugin;

public class IMUtil
{
  static ILogger logger = IMLogger.getLogger(IMUtil.class.getCanonicalName());
	
  public static Vector<String[]> nodeInfo;

  public static Map<String, String> componentWASPath = new HashMap<String, String>();

  public static Map<String, String> viewerUserDataKeys = new HashMap<String, String>();

  public static Map<String, String> viewerExtUserDataKeys = new HashMap<String, String>();

  public static Map<String, String> docsUserDataKeys = new HashMap<String, String>();

  public static Map<String, String> docsExtUserDataKeys = new HashMap<String, String>();

  public static Map<String, String> docsProxyUserDataKeys = new HashMap<String, String>();

  public static Map<String, String> conversionUserDataKeys = new HashMap<String, String>();

  public static Map<String, Map<String, String>> componentToPropMap = new HashMap<String, Map<String, String>>();

  public static Map<String, String> conversionNameMap = new HashMap<String, String>();

  public static Map<String, String> docsNameMap = new HashMap<String, String>();

  public static Map<String, String> viewerNameMap = new HashMap<String, String>();

  public static Map<String, String> proxyNameMap = new HashMap<String, String>();

  public static Map<String, String> docsExtNameMap = new HashMap<String, String>();

  public static Map<String, String> viewerExtNameMap = new HashMap<String, String>();

  public static Map<String, Map<String, String>> nameMap = new HashMap<String, Map<String, String>>();

  public static String[] pythonScriptList = { "create_cluster_and_server.py", "get_app_nodes.py", "get_appsrv_soap_port.py",
      "get_cluster_info_for_app.py", "get_dmgr_soap_port.py", "get_local_host.py", "get_node_variable.py", "get_topology_info.py",
      "isDmgr.py", "prepare_job_targets.py", "verifyWASAdminPWD.py" };

  public static boolean bScriptCopied = false;

  static
  {
    // to unify key names for same key of different component
    nameMap.put(Constants.VIEWER_ID, viewerNameMap);
    nameMap.put(Constants.CONVERSION_ID, conversionNameMap);
    nameMap.put(Constants.DOCS_ID, docsNameMap);
    nameMap.put(Constants.DOCS_PROXY_ID, proxyNameMap);
    nameMap.put(Constants.DOC_EXT_ID, docsExtNameMap);
    nameMap.put(Constants.VIEWER_EXT_ID, viewerExtNameMap);

    conversionNameMap.put("sectionName", "[Conversion]");
    conversionNameMap.put("installRootKeyName", "conversion_install_root");
    conversionNameMap.put("IMInstallRootKeyName", Constants.CONV_INSTALL_LOCATION);
    conversionNameMap.put("NodeList", Constants.CONV_NODES);
    
    viewerNameMap.put("sectionName", "[Viewer]");
    viewerNameMap.put("installRootKeyName", "viewer_install_root");
    viewerNameMap.put("IMInstallRootKeyName", Constants.VIEWER_INSTALLATION_LOCATION);
    viewerNameMap.put("NodeList", Constants.VIEWER_NODES);

    docsNameMap.put("sectionName", "[Docs]");
    docsNameMap.put("installRootKeyName", "docs_install_root");
    docsNameMap.put("IMInstallRootKeyName", Constants.DOCS_INSTALL_LOCATION);
    docsNameMap.put("NodeList", Constants.DOCS_NODES);

    proxyNameMap.put("sectionName", "[Proxy]");
    proxyNameMap.put("installRootKeyName", "docs_install_root");
    proxyNameMap.put("IMInstallRootKeyName", Constants.PROXY_INSTALL_LOCATION);
    
    docsExtNameMap.put("sectionName", "[ICExt]");
    docsExtNameMap.put("installRootKeyName", "ext_install_root");
    docsExtNameMap.put("IMInstallRootKeyName", Constants.DOCS_EXT_INSTALL_ROOT);
    
    viewerExtNameMap.put("sectionName", "[ICExt]");
    viewerExtNameMap.put("installRootKeyName", "ext_install_root");
    viewerExtNameMap.put("IMInstallRootKeyName", Constants.VIEWER_EXT_INSTALL_ROOT);
    
    
   
    // For generating cfg.properties files, properties to IM profile key map
    componentToPropMap.put(Constants.VIEWER_ID, viewerUserDataKeys);
    componentToPropMap.put(Constants.CONVERSION_ID, conversionUserDataKeys);
    componentToPropMap.put(Constants.DOCS_ID, docsUserDataKeys);
    componentToPropMap.put(Constants.DOCS_PROXY_ID, docsProxyUserDataKeys);
    componentToPropMap.put(Constants.DOC_EXT_ID, docsExtUserDataKeys);
    componentToPropMap.put(Constants.VIEWER_EXT_ID, viewerExtUserDataKeys);    
    /**
     * viewer
     */
    viewerUserDataKeys.put("viewer_install_root", Constants.VIEWER_INSTALLATION_LOCATION);
    viewerUserDataKeys.put("shared_data_dir", Constants.SD_VIEWER_SERVER_DATA_LOC);
    viewerUserDataKeys.put("was_install_root", Constants.LOCAL_WAS_INSTALL_ROOT);
    viewerUserDataKeys.put("was_soap_port", Constants.SOAP_PORT);
    viewerUserDataKeys.put("conversion_url", Constants.CONVERSION_URL); // TODO: if is in same cell
    viewerUserDataKeys.put("files_path", Constants.SD_UPLOAD_FILES_PATH);
    viewerUserDataKeys.put("editor_installed", Constants.VIEWER_EDITOR_INSTALLED);
    viewerUserDataKeys.put("scope", Constants.VIEWER_SCOPE);
    viewerUserDataKeys.put("scope_name", Constants.VIEWER_SCOPE_NAME);
    viewerUserDataKeys.put("node_name", Constants.VIEWER_NODE_NAME);
    viewerUserDataKeys.put("browser_cache", Constants.VIEWER_CACHE_CONTROL_SETTING);
    viewerUserDataKeys.put("enable_print", Constants.VIEWER_PRINT_SETTING);
    viewerUserDataKeys.put("auth_type", Constants.VIEWER_AUTHENTICATION_TYPE);
    viewerUserDataKeys.put("auth_host", Constants.VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS);
    viewerUserDataKeys.put("multi_tenancy", Constants.VIEWER_MULTITENANCY_ENABLEMENT);
    viewerUserDataKeys.put("convert_on_upload", Constants.VIEWER_ENABLE_UPLOAD_CONVERSION);
    viewerUserDataKeys.put("housekeeping_frequency", Constants.VIEWER_HOUSEKEEPING_FREQUENCY);
    viewerUserDataKeys.put("housekeeping_age_threshold_of_rendition_latest_version",
        Constants.VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE);
    viewerUserDataKeys.put("housekeeping_size_threshold_of_rendition_cache", Constants.VIEWER_TRIGGERING_LATEST_VERSION_CLEANING);
    viewerUserDataKeys.put("ecm_fncmis_server_url", Constants.ECM_FNCMIS_URL);
    viewerUserDataKeys.put("ecm_fncs_server_url", Constants.ECM_FNCS_URL);
    viewerUserDataKeys.put("ecm_admin_j2c_alias", Constants.ECM_J2C_ALIAS);
    viewerUserDataKeys.put("ecm_community_server_url", Constants.ECM_COMMUNITIES_URL);
    
    viewerUserDataKeys.put("external_s2s_method", Constants.EXTERNAL_S2S_METHOD);
    viewerUserDataKeys.put("external_customer_id", Constants.EXTERNAL_CUSTOMER_ID);
    viewerUserDataKeys.put("external_oauth_endpoint", Constants.EXTERNAL_OAUTH_ENDPOINT);
    viewerUserDataKeys.put("external_j2c_alias", Constants.EXTERNAL_J2C_ALIAS);
    viewerUserDataKeys.put("external_s2s_token", Constants.EXTERNAL_S2S_TOKEN);
    viewerUserDataKeys.put("external_as_user_key", Constants.EXTERNAL_AS_USER_KEY);
    viewerUserDataKeys.put("external_cmis_atom_pub", Constants.EXTERNAL_CMIS_ATOM_PUB);
    viewerUserDataKeys.put("external_object_store", Constants.EXTERNAL_OBJECT_STORE);
    viewerUserDataKeys.put("docs_call_back_url", Constants.VIEWER_CALL_BACK_URL);
    viewerUserDataKeys.put("external_profiles_url", Constants.EXTERNAL_PROFILES_URL);
    viewerUserDataKeys.put("external_repository_home", Constants.EXTERNAL_REPOSITORY_HOME);
    viewerUserDataKeys.put("external_meta_url", Constants.EXTERNAL_META_URL);
    viewerUserDataKeys.put("external_get_content_url", Constants.EXTERNAL_GET_CONTENT_URL);    
    viewerUserDataKeys.put("external_token_key", Constants.EXTERNAL_TOKEN_KEY);       
    
    viewerUserDataKeys.put("docs_url", Constants.DOCS_URL);    
    viewerUserDataKeys.put("docs_shared_data_dir", Constants.SD_DOCS_SERVER_DATA_LOC_ON_VIEWER);
    viewerUserDataKeys.put("ic_admin_j2c_alias", Constants.IC_ADMIN_J2C_ALIAS);
    viewerUserDataKeys.put("external_oauth_authorize", Constants.EMPTY_VALUE);
    viewerUserDataKeys.put("toscana_file_server", Constants.EMPTY_VALUE);
    viewerUserDataKeys.put("toscana_oauth_endpoint", Constants.EMPTY_VALUE);
    viewerUserDataKeys.put("local_host_domain", Constants.LOCAL_HOST_NAME);
    viewerUserDataKeys.put("files_url", Constants.IC_FILES_URL);
   
    
    /**
     * viewer ext
     */
    viewerExtUserDataKeys.put("ext_install_root", Constants.VIEWER_EXT_INSTALL_ROOT);
    viewerExtUserDataKeys.put("was_install_root", Constants.LOCAL_WAS_INSTALL_ROOT);
    viewerExtUserDataKeys.put("was_soap_port", Constants.SOAP_PORT);
    viewerExtUserDataKeys.put("enable_upload_conversion", Constants.VIEWER_EXT_IGNORE_EVENT);
    viewerExtUserDataKeys.put("auth_type", Constants.VIEWER_EXT_AUTH_TYPE);
    viewerExtUserDataKeys.put("viewer_admin_j2c_alias", Constants.VIEWER_EXT_J2C_ALIAS);
    viewerExtUserDataKeys.put("files_scope", Constants.FILES_SCOPE); // TODO: How about not a cluster?
    viewerExtUserDataKeys.put("files_scope_name", Constants.IC_FILES_CLUSTER);
    viewerExtUserDataKeys.put("news_scope", Constants.FILES_SCOPE);
    viewerExtUserDataKeys.put("news_scope_name", Constants.IC_NEWS_CLUSTER);
    viewerExtUserDataKeys.put("common_scope", Constants.FILES_SCOPE);
    viewerExtUserDataKeys.put("common_scope_name", Constants.IC_COMMON_CLUSTER);
    viewerExtUserDataKeys.put("ic_extension_path", Constants.DOCS_EXT_IC_INSTALLATION_PATH);
    viewerExtUserDataKeys.put("deamon_shared_path", Constants.DOCS_EXT_SHARED_PATH);
    viewerExtUserDataKeys.put("ccm_enabled", Constants.DOCS_EXT_IC_CCM_ENABLED);
    
    
    docsExtUserDataKeys.put("files_scope", Constants.FILES_SCOPE); // TODO: How about not a cluster?
    docsExtUserDataKeys.put("files_scope_name", Constants.IC_FILES_CLUSTER);
    // docsExtUserDataKeys.put("files_node_name", Constants.);
    docsExtUserDataKeys.put("news_scope", Constants.FILES_SCOPE);
    docsExtUserDataKeys.put("news_scope_name", Constants.IC_NEWS_CLUSTER);
    // docsExtUserDataKeys.put("news_node_name", Constants.);
    docsExtUserDataKeys.put("common_scope", Constants.FILES_SCOPE);
    docsExtUserDataKeys.put("common_scope_name", Constants.IC_COMMON_CLUSTER);
    // docsExtUserDataKeys.put("common_node_name", Constants.);
    viewerExtUserDataKeys.put("viewer_server_url", Constants.VIEWER_URL);
    viewerExtUserDataKeys.put("restart_connections", Constants.RESTART_CONNECTIONS);

    /**
     * docs
     */

    docsUserDataKeys.put("docs_install_root", Constants.DOCS_INSTALL_LOCATION);
    docsUserDataKeys.put("was_soap_port", Constants.SOAP_PORT);
    docsUserDataKeys.put("shared_data_dir", Constants.SD_DOCS_SERVER_DATA_LOC);
    docsUserDataKeys.put("was_install_root", Constants.LOCAL_WAS_INSTALL_ROOT);
    docsUserDataKeys.put("conversion_url", Constants.DOCS_CONV_SERVICE_URL);
    docsUserDataKeys.put("ic_admin_j2c_alias", Constants.DOCS_CONN_ADMIN);
    docsUserDataKeys.put("files_url", Constants.DOCS_CONN_FILES_URL);
    docsUserDataKeys.put("email_url", Constants.DOCS_CONNECTION_URL);
    docsUserDataKeys.put("auth_type", Constants.DOCS_AUTHORIZATION);
    docsUserDataKeys.put("auth_host", Constants.DOCS_TAM_HOST);
    docsUserDataKeys.put("mt", Constants.DOCS_MULTITENANCY);
    docsUserDataKeys.put("spreadsheet_nodejs_install", Constants.DOCS_NODEJS);

    docsUserDataKeys.put("restart_webservers", Constants.RESTART_WEB_SERVERS);

    docsUserDataKeys.put("social_suit_enabled", Constants.WC_INSTALL_CHOICE);
    docsUserDataKeys.put("ST_domain", Constants.WC_SERVER_DOMAIN);
    docsUserDataKeys.put("integrate_with_LC", Constants.WC_INSTALL_TYPE_CM);
    docsUserDataKeys.put("use_initial_name", Constants.WC_USE_INITIAL_NAME);
    //This configuration disabled
    //docsUserDataKeys.put("LC_config_xml_path", Constants.WC_CONN_CONFIG_LOCATION);
    docsUserDataKeys.put("LC_connect_attempt_count", Constants.WC_CONN_ATTEMPTS);
    docsUserDataKeys.put("LC_connect_attempt_interval", Constants.WC_CONN_ATTEMPTS_TIME);
    docsUserDataKeys.put("ST_standalone_available", Constants.WC_INSTALL_TYPE_ST);
    docsUserDataKeys.put("ST_server", Constants.WC_ST_SERVER_URL);
    docsUserDataKeys.put("SSL_ST_server", Constants.WC_SSL_SERVER_URL);

    docsUserDataKeys.put("db_type", Constants.DB_PRODUCT_NAME);
    docsUserDataKeys.put("db_hostname", Constants.DB_SERVER_HOST_URL);
    docsUserDataKeys.put("db_port", Constants.DB_SERVER_PORT);
    docsUserDataKeys.put("db_name", Constants.DB_DOCS_DATABASE);
    docsUserDataKeys.put("db_jdbc_driver_path", Constants.DB_JDBC_PATH);

    docsUserDataKeys.put("ecm_cmis_server_url", Constants.ECM_FNCMIS_URL);
    docsUserDataKeys.put("ecm_fncs_server_url", Constants.ECM_FNCS_URL);
    docsUserDataKeys.put("ecm_admin_j2c_alias", Constants.ECM_J2C_ALIAS);
    docsUserDataKeys.put("ecm_community_server_url", Constants.ECM_COMMUNITIES_URL);
    docsUserDataKeys.put("ecm_navigator_server_url", Constants.ECM_NAVIGATOR_URL);

    docsUserDataKeys.put("scope", Constants.DOCS_SCOPE);
    docsUserDataKeys.put("scope_name", Constants.DOCS_SCOPE_NAME);
    docsUserDataKeys.put("node_name", Constants.DOCS_NODE_NAME);
    docsUserDataKeys.put("software_mode", Constants.SOFTWARE_MODE);
    docsUserDataKeys.put("webserver_name", Constants.IHS_SERVER_NAME);
    docsUserDataKeys.put("non_job_mgr_mode", Constants.NON_JOB_MGR_NAME);
    
    docsUserDataKeys.put("external_s2s_method", Constants.EXTERNAL_S2S_METHOD);
    docsUserDataKeys.put("external_customer_id", Constants.EXTERNAL_CUSTOMER_ID);
    docsUserDataKeys.put("external_oauth_endpoint", Constants.EXTERNAL_OAUTH_ENDPOINT);
    docsUserDataKeys.put("external_j2c_alias", Constants.EXTERNAL_J2C_ALIAS);
    docsUserDataKeys.put("external_s2s_token", Constants.EXTERNAL_S2S_TOKEN);
    docsUserDataKeys.put("external_as_user_key", Constants.EXTERNAL_AS_USER_KEY);
    docsUserDataKeys.put("external_cmis_atom_pub", Constants.EXTERNAL_CMIS_ATOM_PUB);
    docsUserDataKeys.put("external_object_store", Constants.EXTERNAL_OBJECT_STORE);
    docsUserDataKeys.put("docs_call_back_url", Constants.DOCS_CALL_BACK_URL);
    docsUserDataKeys.put("external_profiles_url", Constants.EXTERNAL_PROFILES_URL);
    docsUserDataKeys.put("external_repository_home", Constants.EXTERNAL_REPOSITORY_HOME);
    docsUserDataKeys.put("external_meta_url", Constants.EXTERNAL_META_URL);
    docsUserDataKeys.put("external_get_content_url", Constants.EXTERNAL_GET_CONTENT_URL);
    docsUserDataKeys.put("external_set_content_url", Constants.EXTERNAL_SET_CONTENT_URL);
    docsUserDataKeys.put("external_token_key", Constants.EXTERNAL_TOKEN_KEY); 
    
    docsUserDataKeys.put("external_oauth_authorize", Constants.EMPTY_VALUE);
    docsUserDataKeys.put("external_current_user_profiles_url", Constants.EMPTY_VALUE);
    
    /**
     * docs ext
     */
    docsExtUserDataKeys.put("ext_install_root", Constants.DOCS_EXT_INSTALL_ROOT);
    docsExtUserDataKeys.put("was_install_root", Constants.LOCAL_WAS_INSTALL_ROOT);
    docsExtUserDataKeys.put("was_soap_port", Constants.SOAP_PORT);
    docsExtUserDataKeys.put("ic_extension_path", Constants.DOCS_EXT_IC_INSTALLATION_PATH);
    docsExtUserDataKeys.put("deamon_shared_path", Constants.DOCS_EXT_SHARED_PATH);
    docsExtUserDataKeys.put("files_scope", Constants.FILES_SCOPE);
    docsExtUserDataKeys.put("files_scope_name", Constants.IC_FILES_CLUSTER);
    // docsExtUserDataKeys.put("files_node_name", Constants.);
    docsExtUserDataKeys.put("news_scope", Constants.FILES_SCOPE);
    docsExtUserDataKeys.put("news_scope_name", Constants.IC_NEWS_CLUSTER);
    // docsExtUserDataKeys.put("news_node_name", Constants.);
    docsExtUserDataKeys.put("common_scope", Constants.FILES_SCOPE);
    docsExtUserDataKeys.put("common_scope_name", Constants.IC_COMMON_CLUSTER);
    // docsExtUserDataKeys.put("common_node_name", Constants.);
    docsExtUserDataKeys.put("docs_server_url", Constants.DOCS_URL);
    docsExtUserDataKeys.put("ignore_event", Constants.DOCS_EXT_IGNORE_EVENT);
    docsExtUserDataKeys.put("auth_type", Constants.DOCS_EXT_AUTH_TYPE);
    docsExtUserDataKeys.put("docs_admin_j2c_alias", Constants.DOCS_EXT_J2C_ALIAS);
    docsExtUserDataKeys.put("ic_version", Constants.DOCS_EXT_IC_VERSION);
    docsExtUserDataKeys.put("restart_connections", Constants.RESTART_CONNECTIONS);
    docsExtUserDataKeys.put("ccm_enabled", Constants.DOCS_EXT_IC_CCM_ENABLED);
    /**
     * docs proxy
     */

    docsProxyUserDataKeys.put("docs_install_root", Constants.PROXY_INSTALL_LOCATION);
    docsProxyUserDataKeys.put("was_proxy_profile_root", Constants.LOCAL_WAS_INSTALL_ROOT);
    docsProxyUserDataKeys.put("was_soap_port", Constants.SOAP_PORT);
    docsProxyUserDataKeys.put("was_ipc_port", Constants.KEY_FOR_EMPTY_VALUE);
    docsProxyUserDataKeys.put("scope", Constants.FILES_SCOPE);
    docsProxyUserDataKeys.put("proxy_scope_name", Constants.DOCS_PROXY_NAME);
    docsProxyUserDataKeys.put("proxy_node_name", Constants.KEY_FOR_EMPTY_VALUE);
    docsProxyUserDataKeys.put("software_mode", Constants.SOFTWARE_MODE);
    docsProxyUserDataKeys.put("docs_scope_name", Constants.DOCS_SCOPE_NAME);
    docsProxyUserDataKeys.put("webserver_name", Constants.IHS_SERVER_NAME);
    docsProxyUserDataKeys.put("restart_webservers", Constants.RESTART_WEB_SERVERS);
    docsProxyUserDataKeys.put("docs_context_root", Constants.DOCS_CONTEXT_ROOT);

    /**
     * conversion
     */
    conversionUserDataKeys.put("conversion_install_root", Constants.CONV_INSTALL_LOCATION);
    conversionUserDataKeys.put("docs_shared_storage_type", Constants.SD_DOCS_TYPE);
    conversionUserDataKeys.put("docs_shared_storage_local_path", Constants.SD_DOCS_SHARED_LOCAL_PATH);
    conversionUserDataKeys.put("docs_shared_storage_remote_server", Constants.SD_DOCS_SHARED_REMOTE_SERVER);
    conversionUserDataKeys.put("docs_shared_storage_remote_path", Constants.SD_DOCS_SHARED_REMOTE_PATH);
    //Before 1.0.5.1, start
    conversionUserDataKeys.put("conversion_shared_data_server", Constants.SD_DOCS_SHARED_REMOTE_SERVER);    
    conversionUserDataKeys.put("conversion_shared_data_root_remote", Constants.SD_DOCS_SHARED_REMOTE_PATH);   
    conversionUserDataKeys.put("conversion_shared_data_root", Constants.SD_DOCS_SHARED_LOCAL_PATH);    
    //End
    conversionUserDataKeys.put("viewer_shared_storage_type", Constants.SD_VIEWER_TYPE);
    conversionUserDataKeys.put("viewer_shared_storage_local_path", Constants.SD_VIEWER_SHARED_LOCAL_PATH);
    conversionUserDataKeys.put("viewer_shared_storage_remote_server", Constants.SD_VIEWER_SHARED_REMOTE_SERVER);
    conversionUserDataKeys.put("viewer_shared_storage_remote_path", Constants.SD_VIEWER_SHARED_REMOTE_PATH);
    //Before 1.0.5.1, start
    conversionUserDataKeys.put("conversion_shared_data_server_viewer", Constants.SD_VIEWER_SHARED_REMOTE_SERVER);
    conversionUserDataKeys.put("conversion_shared_data_root_remote_viewer", Constants.SD_VIEWER_SHARED_REMOTE_PATH);
    conversionUserDataKeys.put("viewer_shared_data_name", Constants.SD_VIEWER_SHARED_LOCAL_PATH);
    //End
    conversionUserDataKeys.put("viewer_url", Constants.SD_VIEWER_FULLY_HOSTNAME);

    conversionUserDataKeys.put("was_install_root", Constants.LOCAL_WAS_INSTALL_ROOT);
    conversionUserDataKeys.put("was_soap_port", Constants.SOAP_PORT);
    conversionUserDataKeys.put("sym_count", Constants.CONV_CPU_NUMBER);
    conversionUserDataKeys.put("sym_start_port", Constants.CONV_START_PORT);

    conversionUserDataKeys.put("scope", Constants.CONV_SCOPE);
    conversionUserDataKeys.put("scope_name", Constants.CONV_SCOPE_NAME);
    conversionUserDataKeys.put("node_name", Constants.CONV_NODE_NAME);
    conversionUserDataKeys.put("webserver_name", Constants.IHS_SERVER_NAME);
    conversionUserDataKeys.put("software_mode", Constants.SOFTWARE_MODE);
    conversionUserDataKeys.put("restart_webservers", Constants.RESTART_WEB_SERVERS);
    conversionUserDataKeys.put("non_job_mgr_mode", Constants.NON_JOB_MGR_NAME);
  }

  public static enum Feature {
    IBMDOCS, IBMDOCSEXT, IBMVIEWER, IBMVIEWEREXT, IBMDOCSPROXY, IBMCONVERSION
  }

  private IMUtil()
  {
  }

  /**
   * Iterate through IAgentJob and return an offering instance from a job found in that array, which matches the specified offeringId.
   * 
   * @param jobs
   * @param offeringId
   * @return IAgentJob that refers to the specified offeringId
   */
  public static IOffering findInstalledOffering(IAgentJob[] jobs, String offeringId)
  {
    for (IAgentJob job : jobs)
    {
      IOffering offering = job.getOffering();
      if (offering != null && offering.getIdentity().getId().equals(offeringId) == true)
      {
        return offering;
      }
    }
    return null;
  }

  /**
   * Iterate through IAgentJob and return an IM deployment type.
   * 
   * @param data
   * @param type
   * @return boolean that refers to whether the deployment type is the given type
   */
  public static boolean isDeployType(IAgentJob[] jobs, String type)
  {
    if (jobs == null)
      return false;

    if (type.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_INSTALL))
      return jobs[0].isInstall();
    else if (type.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_MODIFY))
      return jobs[0].isModify();
    else if (type.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_ROLLBACK))
      return jobs[0].isRollback();
    else if (type.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_UNINSTALL))
      return jobs[0].isUninstall();
    else if (type.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_UPDATE))
      return jobs[0].isUpdate();
    else
      return false;
  }

  /**
   * Iterate through IAgentJob and return an IM deployment type.
   * 
   * @param data
   * @param type
   * @return boolean that refers to whether the deployment type is the given type
   */
  public static String getDeployType(IAgentJob[] jobs)
  {
    if (jobs == null)
      return null;

    if (jobs[0].isInstall())
      return Constants.IM_DEPLOYMENT_TYPE_INSTALL;
    else if (jobs[0].isModify())
      return Constants.IM_DEPLOYMENT_TYPE_MODIFY;
    else if (jobs[0].isRollback())
      return Constants.IM_DEPLOYMENT_TYPE_ROLLBACK;
    else if (jobs[0].isUninstall())
      return Constants.IM_DEPLOYMENT_TYPE_UNINSTALL;
    else if (jobs[0].isUpdate())
      return Constants.IM_DEPLOYMENT_TYPE_UPDATE;
    else
      return null;
  }

  /**
   * Iterate through features and return the given feature selected or not.
   * 
   * @param data
   * @param ver
   *          , version with format x.x.x
   * @return boolean that refers to whether the given version is the upgrade version
   */
  public static boolean isUpgradeFromVersion(IAgentJob[] jobs, IAgent iAgent, IProfile profile, String ver)
  {
    if (jobs == null || iAgent == null || profile == null || ver == null)
      return false;

    boolean bSameVer = false;
    {
      IOffering iOffering = IMUtil.findOffering(jobs, Constants.OFFERING_ID);
      if (iOffering != null)
      {
        IOffering installedOffering = iAgent.findInstalledOffering(profile, iOffering.getIdentity());
        if (installedOffering != null)
        {
          Version version = installedOffering.getVersion();
          int major = version.getMajor();
          int minor = version.getMinor();
          int micro = version.getMicro();
          String sVer = String.valueOf(major) + "." + String.valueOf(minor) + "." + String.valueOf(micro);
          if (sVer.equalsIgnoreCase(ver))
            bSameVer = true;
        }
      }
    }

    return bSameVer;
  }

  public static String getOfferingVersion(IAgentJob[] jobs, IAgent iAgent, IProfile profile)
  {
    if (jobs == null || iAgent == null || profile == null)
      return null;

    String versionString = null;
    {
      IOffering iOffering = IMUtil.findOffering(jobs, Constants.OFFERING_ID);
      if (iOffering != null)
      {

        Version version = iOffering.getVersion();
        versionString = version.toString();

      }
    }

    return versionString;
  }
  /**
   * Iterate through features and return the given feature selected or not.
   * 
   * @param data
   *          *
   * @return boolean that refers to whether the modify happens between same version
   */
  public static boolean isSameVersionModification(IAgentJob[] jobs, IAgent iAgent, IProfile profile)
  {
    if (jobs == null || iAgent == null || profile == null)
      return false;

    boolean bSameVer = false;
    {
      IOffering iOffering = IMUtil.findOffering(jobs, Constants.OFFERING_ID);
      if (iAgent != null && profile != null && iOffering != null)
      {
        Version version = iOffering.getVersion();
        int major = version.getMajor();
        int micro = version.getMicro();
        int minor = version.getMinor();
        String cVer = String.valueOf(major) + "." + String.valueOf(micro) + "." + String.valueOf(minor);

        IOffering installedOffering = iAgent.findInstalledOffering(profile, iOffering.getIdentity());
        if (installedOffering != null)
        {
          Version iVersion = installedOffering.getVersion();
          int iMajor = iVersion.getMajor();
          int iMicro = iVersion.getMicro();
          int iMinor = iVersion.getMinor();
          String iVer = String.valueOf(iMajor) + "." + String.valueOf(iMicro) + "." + String.valueOf(iMinor);
          if (cVer.equalsIgnoreCase(iVer))
            bSameVer = true;
        }
      }
    }

    return bSameVer;
  }

  /**
   * Iterate through features and return the given feature selected or not.
   * 
   * @param data
   * @param featureid
   * @return boolean that refers to whether the given feature is selected
   */
  public static boolean isFeatureSelected(IAgentJob[] jobs, String featureid)
  {
    if (jobs == null || featureid == null)
      return false;

    IFeature[] iFeatures = jobs[0].getFeaturesArray();
    for (int i = 0; i < iFeatures.length; i++)
    {
      if (iFeatures[i].getSelector().getIdentity().getId().equalsIgnoreCase(featureid))
        return true;
    }

    return false;
  }

  /**
   * Iterate through features and return the given feature selected or not.
   * 
   * @param data
   * @param featureid
   * @return boolean that refers to whether the given feature is selected as an added one for modification
   */
  public static boolean isFeatureAdded(IAgentJob[] jobs, IAgent iAgent, IProfile profile, String featureid)
  {
    if (jobs == null || iAgent == null || profile == null || featureid == null)
      return false;

    boolean bSelected = false;
    {
      IFeature[] iFeatures = jobs[0].getFeaturesArray();
      if (iFeatures != null)
      {
        for (int i = 0; i < iFeatures.length; i++)
        {
          if (iFeatures[i].getSelector().getIdentity().getId().equalsIgnoreCase(featureid))
          {
            bSelected = true;
            break;
          }
        }
      }
    }
    boolean bInstalled = false;
    if (bSelected)
    {
      bInstalled = isFeatureInstalled(jobs, iAgent, profile, featureid);
    }

    return bSelected && (!bInstalled);
  }

  public static boolean isFeatureInstalled(IAgentJob[] jobs, IAgent iAgent, IProfile profile, String featureid)
  {
    if (jobs == null || iAgent == null || profile == null)
      return false;
    boolean bInstalled = false;
    IOffering iOffering = IMUtil.findOffering(jobs, Constants.OFFERING_ID);
    if (iOffering != null)
    {
      IOffering installedOffering = iAgent.findInstalledOffering(profile, iOffering.getIdentity());
      if (installedOffering != null)
      {
        IFeature[] installedFeatures = iAgent.getInstalledFeatures(profile, installedOffering);
        if (installedFeatures != null)
        {
          for (int i = 0; i < installedFeatures.length; i++)
          {
            if (installedFeatures[i].getSelector().getIdentity().getId().equalsIgnoreCase(featureid))
            {
              bInstalled = true;
              break;
            }
          }
        }
      }
    }
    return bInstalled;

  }

  /**
   * Iterate through features and return the given feature selected or not.
   * 
   * @param data
   * @param featureid
   * @return boolean that refers to whether the given feature is selected as an added one for modification
   */
  public static boolean isFeatureRemoved(IAgentJob[] jobs, IAgent iAgent, IProfile profile, String featureid)
  {
    if (jobs == null || iAgent == null || profile == null || featureid == null)
      return false;

    boolean bDisSelected = true;
    {
      IFeature[] iFeatures = jobs[0].getFeaturesArray();
      if (iFeatures != null)
      {
        for (int i = 0; i < iFeatures.length; i++)
        {
          if (iFeatures[i].getSelector().getIdentity().getId().equalsIgnoreCase(featureid))
          {
            bDisSelected = false;
            break;
          }
        }
      }
    }
    boolean bInstalled = false;
    if (bDisSelected)
    {
      IOffering iOffering = IMUtil.findOffering(jobs, Constants.OFFERING_ID);
      if (iAgent != null && iOffering != null && profile != null)
      {
        IFeature[] installedFeatures = iAgent.getInstalledFeatures(profile, iOffering);
        if (installedFeatures != null)
        {
          for (int i = 0; i < installedFeatures.length; i++)
          {
            if (installedFeatures[i].getSelector().getIdentity().getId().equalsIgnoreCase(featureid))
            {
              bInstalled = true;
              break;
            }
          }
        }
      }
    }

    return (bDisSelected && bInstalled);
  }

  /**
   * Iterate through features and return the given feature selected or not.
   * 
   * @param data
   * @param featureid
   * @return boolean that refers to whether the given feature is selected as an added one for modification
   */
  public static boolean isFeatureAddOrRemoved(IAgentJob[] jobs, IAgent iAgent, IProfile profile)
  {
    if (jobs == null || iAgent == null || profile == null)
      return false;

    boolean bFeature = false;
    {
      IFeature[] iFeatures = jobs[0].getFeaturesArray();
      if (iFeatures != null)
      {
        for (int i = 0; i < iFeatures.length; i++)
        {
          bFeature = false;
          String featureID = iFeatures[i].getSelector().getIdentity().getId();
          IOffering iOffering = IMUtil.findOffering(jobs, Constants.OFFERING_ID);
          if (iAgent != null && iOffering != null && profile != null)
          {
            IFeature[] installedFeatures = iAgent.getInstalledFeatures(profile, iOffering);
            if (installedFeatures != null)
            {
              for (int ii = 0; ii < installedFeatures.length; ii++)
              {
                if (installedFeatures[i].getSelector().getIdentity().getId().equalsIgnoreCase(featureID))
                {
                  bFeature = true;
                  break;
                }
              }
              if (!bFeature)
                return true;
            }
          }
        }
      }
    }

    if (bFeature)
    {
      IOffering iOffering = IMUtil.findOffering(jobs, Constants.OFFERING_ID);
      if (iAgent != null && iOffering != null && profile != null)
      {
        IFeature[] installedFeatures = iAgent.getInstalledFeatures(profile, iOffering);
        if (installedFeatures != null)
        {
          for (int ii = 0; ii < installedFeatures.length; ii++)
          {
            bFeature = false;
            String featureID = installedFeatures[ii].getSelector().getIdentity().getId();
            if (jobs != null)
            {
              IFeature[] iFeatures = jobs[0].getFeaturesArray();
              if (iFeatures != null)
              {
                for (int i = 0; i < iFeatures.length; i++)
                {
                  if (iFeatures[i].getSelector().getIdentity().getId().equalsIgnoreCase(featureID))
                  {
                    bFeature = true;
                    break;
                  }
                }
              }
            }
          }
          if (!bFeature)
            return true;
        }
      }
    }

    return bFeature;
  }

  /**
   * Iterate through IAgentJob and return an offering instance from a job found in that array, which matches the specified offeringId.
   * 
   * @param jobs
   * @param offeringId
   * @return IAgentJob that refers to the specified offeringId
   */
  public static IOffering findOffering(IAgentJob[] jobs, String offeringId)
  {
    for (IAgentJob job : jobs)
    {
      IOffering offering = job.getOffering();
      if (offering != null && offering.getIdentity().getId().equals(offeringId) == true)
      {
        return offering;
      }
    }
    return null;
  }

  /**
   * *
   * 
   * @param listStr
   * @param listSEP
   *          *
   * @return String[] that separated list members
   */
  public static Vector<String> parseListString(String listStr, String listSEP)
  {
    if (listStr == null)
      return null;

    Vector<String> results = new Vector<String>();
    String[] ret1 = listStr.split(listSEP);
    for (String entry : ret1)
    {
      results.add(entry);
    }

    return results;
  }

  /**
   * *
   * 
   * @param listStr
   * @param listSEP
   * @param subListSEP
   * @return String[] that separated list members
   */
  public static Vector<String[]> parseListString(String listStr, String listSEP, String subListSEP)
  {
    if (listStr == null)
      return null;

    Vector<String[]> results = new Vector<String[]>();
    String[] ret1 = listStr.split(listSEP);
    for (String entry : ret1)
    {
      results.add(entry.split(subListSEP));
    }

    return results;
  }

  /**
   * *
   * 
   * @param listStr
   * @param listSEP
   * @param subListSEP
   * @param srvType
   * @return String[] that nodes with given type,DEPLOYMENT_MANAGER,WEB_SERVER & APPLICATION_SERVER
   */
  public static Vector<String[]> parseListString(String listStr, String listSEP, String subListSEP, String srvType)
  {
    if (listStr == null)
      return null;

    Vector<String[]> results = new Vector<String[]>();
    String[] ret1 = listStr.split(listSEP);
    for (String entry : ret1)
    {
      String[] nodeInfo = entry.split(subListSEP);
      if (nodeInfo[0].equalsIgnoreCase(srvType))
        results.add(nodeInfo);
    }

    return results;
  }

  /**
   * *
   * 
   * @param listStr
   * @param listSEP
   * @param subListSEP
   * @param srvType
   * @return String[] that nodes with given type,DEPLOYMENT_MANAGER,WEB_SERVER & APPLICATION_SERVER
   */
  public static Vector<String[]> parseListString(String listStr, String listSEP, String subListSEP, String srvType, String osType)
  {
    if (listStr == null)
      return null;

    Vector<String[]> results = new Vector<String[]>();
    String[] ret1 = listStr.split(listSEP);
    for (String entry : ret1)
    {
      // hostname:ostype:srvType:nodename
      String[] nodeInfo = entry.split(subListSEP);
      if (nodeInfo[2].equalsIgnoreCase(srvType) && nodeInfo[1].equalsIgnoreCase(osType))
        results.add(nodeInfo);
    }

    return results;
  }
  /**
   * *
   * 
   * @param liscompDataProfile,
   * @param profile   * 
   * @return String, return the os type of component node 
   */
  public static String getComponentOSType(String compDataProfile,IProfile profile)
  {
    if (compDataProfile == null || profile==null)
      return null;
    
    String com_node_info = profile.getOfferingUserData(compDataProfile, Constants.OFFERING_ID);
    //hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::servername::clustername;
    if (com_node_info!=null)
    {
        String[] nodesInfo = com_node_info.split(Util.LIST_SEPRATOR);
        for (String node : nodesInfo)
        {
          String[] nodeInfo = node.split(Util.LIST_SUB_SEPRATOR);
          return nodeInfo[1];
        }
    }
    
    return null;
  }

  /**
   * *
   * 
   * @param repository
   *          , all resources
   * @param segments
   *          , identified resources
   * 
   * @return String[] that nodes with given type,DEPLOYMENT_MANAGER,WEB_SERVER & APPLICATION_SERVER
   */
  public static String convertListToString(Map<NodeID, String> repository, String[] segments, String type, String cluster)
  {
    if (repository == null || repository.size() == 0 || segments == null || segments.length == 0 || type == null || cluster==null)
      return null;

    String ret = null;
    ;
    for (String entry : segments)
    {
      // hostname:ostype:srvType:nodename
      if (ret == null)
      {
        
        ret = repository.get(new NodeID(cluster,entry,type));
      }
      else
      {
        ret = ret + Util.LIST_SEPRATOR + repository.get(new NodeID(cluster,entry,type));
      }
    }

    return ret;
  }

  /**
   * *
   * 
   * @param index
   *          *
   * @return String that is the IBM Docs component name
   */
  public static String getConponent(int index)
  {
    switch (index)
      {
        case 1 :
          return Constants.IBMCONVERSION;
        case 2 :
          return Constants.IBMDOCS;
        case 3 :
          return Constants.IBMVIEWER;
        case 4 :
          return Constants.IBMDOCSPROXY;
        case 5 :
          return Constants.WEBSERVER;
        default:
          return Constants.IBMNONE;
      }
  }

  /**
   * *
   * 
   * @param index
   *          *
   * @return String that is the IBM Docs component name
   */
  public static int getConponent(String compName)
  {
    if (compName.equalsIgnoreCase(Constants.IBMCONVERSION))
      return 1;
    else if (compName.equalsIgnoreCase(Constants.IBMDOCS))
      return 2;
    else if (compName.equalsIgnoreCase(Constants.IBMVIEWER))
      return 3;
    else if (compName.equalsIgnoreCase(Constants.IBMDOCSPROXY))
      return 4;
    else if (compName.equalsIgnoreCase(Constants.IBMNONE))
      return 5;
    else
      return 0;
  }

  /**
   * To verify the database connection due to user's configuration data
   * 
   * @param dataMap
   * @return
   * @throws Exception
   */
  public static boolean isDBConnected(Map<String, String> dataMap) throws Exception
  {
    String nameValue = dataMap.get(Constants.DB_USER_NAME);
    String dbPassword = EncryptionUtils.decrypt(dataMap.get(Constants.DB_PASSWORD));
    String serverHost = dataMap.get(Constants.DB_SERVER_HOST_URL);
    String prodDBName = dataMap.get(Constants.DB_PRODUCT_NAME);
    String dbName = dataMap.get(Constants.DB_DOCS_DATABASE);
    String jdbcPath = dataMap.get(Constants.DB_JDBC_PATH);
    String dbServerPort = dataMap.get(Constants.DB_SERVER_PORT);
    // TODO by HuaiDong

    return true;
  }
  
  /**
   * 
   * @param profile
   * @return whether it is the same node with IC due to the given profile
   */
  public static boolean isViewerSameNodeWithIC(IProfile profile)
  {
    if (profile==null)
      return false;    
    
    //Currently return
    boolean ret = true;
    
    if (isSameCellWithIC(profile))
    {
      // nodename => [hostname,ostype,nodetype,nodename,USER_INSTALL_ROOT,WAS_INSTALL_ROOT]
      Map<String, String[]> nodeMapInfo = new HashMap<String, String[]>();      
      // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::;
      String nodeListInfo = profile.getOfferingUserData(Constants.NODE_HOST_LIST, Constants.OFFERING_ID);
      String[] nodes_hosts = nodeListInfo.split(Util.LIST_SEPRATOR);
      for (String node_host : nodes_hosts)
      {
        // nodehostlist.append(node_host).append(Util.LIST_SEPRATOR);
        Vector<String> nodeInfoV = IMUtil.parseListString(node_host, Constants.SEPARATE_SUB_SUB_CHARS);
        String[] nodeInfoArr = new String[nodeInfoV.size()];
        nodeInfoV.toArray(nodeInfoArr);
        nodeMapInfo.put(nodeInfoArr[3], nodeInfoArr);
      }
      
      // IC cluster info based on common,files and news
      //ip list of ic node
      List icNodeIPList = new ArrayList();      
      StringBuffer ic_clusters_info = new StringBuffer();
      String appCluster = profile.getOfferingUserData(Constants.IC_FILES_CLUSTER_INFO, Constants.OFFERING_ID);
      if (appCluster != null)
        if (ic_clusters_info.length() == 0)
          ic_clusters_info.append(appCluster);
        else
          ic_clusters_info.append(Util.LIST_SEPRATOR).append(appCluster);

      appCluster = profile.getOfferingUserData(Constants.IC_COMMON_CLUSTER_INFO, Constants.OFFERING_ID);
      if (appCluster != null)
        if (ic_clusters_info.length() == 0)
          ic_clusters_info.append(appCluster);
        else
          ic_clusters_info.append(Util.LIST_SEPRATOR).append(appCluster);

      appCluster = profile.getOfferingUserData(Constants.IC_NEWS_CLUSTER_INFO, Constants.OFFERING_ID);
      if (appCluster != null)
        if (ic_clusters_info.length() == 0)
          ic_clusters_info.append(appCluster);
        else
          ic_clusters_info.append(Util.LIST_SEPRATOR).append(appCluster);

      if (ic_clusters_info.length() > 0)
      {
        //app:::cluster::node,server:node,server:node,server:...;
        String[] ic_app_nodes_hosts = ic_clusters_info.toString().split(Util.LIST_SEPRATOR);
        for (String ic_app_node_host : ic_app_nodes_hosts)
        {
          //app:::cluster::node,server:node,server:node,server:...
          String[] appClusterInfo = ic_app_node_host.split(Constants.SEPARATE_SUB_CHARS);
          //cluster::node,server:node,server:node,server:...
          String[] nodesInfo = appClusterInfo[1].split(Constants.SEPARATE_SUB_SUB_CHARS);
          //node,server:node,server:node,server:...
          String[] nodes = nodesInfo[1].split(Util.LIST_SUB_SEPRATOR);
          for (String nodeInfo:nodes)
          {
            //node,server
            String[] node = nodeInfo.split(Constants.SEPARATE_COMMA_CHARS);
            String hostname = nodeMapInfo.get(node[0])[0];
            if (hostname!=null)
            {
              InetAddress addr = null;
              try
              {
                addr = InetAddress.getByName(hostname);
                icNodeIPList.add(addr.getHostAddress()); 
              }
              catch (UnknownHostException e)
              {
                // TODO Auto-generated catch block
                e.printStackTrace();
                return false;
              }                       
            }
          }
        }
      }
      
      //ip list of viewer node
      List viewerNodeIPList = new ArrayList();
      // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::servername::clustername;
      String viewerNodesInfo = profile.getOfferingUserData(Constants.VIEWER_NODES, Constants.OFFERING_ID);
      if (viewerNodesInfo != null)
      {
        String[] viewer_nodes_hosts = viewerNodesInfo.split(Util.LIST_SEPRATOR);
        for (String viewer_node_host : viewer_nodes_hosts)
        {
          // nodehostlist.append(node_host).append(Util.LIST_SEPRATOR);
          Vector<String> nodeInfoV = IMUtil.parseListString(viewer_node_host, Constants.SEPARATE_SUB_SUB_CHARS);
          String[] nodeInfoArr = new String[nodeInfoV.size()];
          nodeInfoV.toArray(nodeInfoArr);
          String hostname = nodeMapInfo.get(nodeInfoArr[3])[0];
          if (hostname!=null)
          {
            InetAddress addr = null;
            try
            {
              addr = InetAddress.getByName(hostname);
              if (icNodeIPList.indexOf(addr.getHostAddress())==-1)
              {
                ret = false;
                break;
              }
            }
            catch (UnknownHostException e)
            {
              // TODO Auto-generated catch block
              e.printStackTrace();
              return false;
            }                       
          }          
        }
      }
    }

    return ret;
  }

  /**
   * 
   * @param profile
   * @return whether it is the same node with IC due to the given profile
   */
  public static boolean isViewerSameNodeWithIC(IProfile profile,String nodeName)
  {
    if (profile==null || nodeName==null)
      return false;
    
    boolean ret = false;
    if (profile != null && isSameCellWithIC(profile))
    {
      // nodename => [hostname,ostype,nodetype,nodename,USER_INSTALL_ROOT,WAS_INSTALL_ROOT]
      Map<String, String[]> nodeMapInfo = new HashMap<String, String[]>();      
      // hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT::;
      String nodeListInfo = profile.getOfferingUserData(Constants.NODE_HOST_LIST, Constants.OFFERING_ID);
      String[] nodes_hosts = nodeListInfo.split(Util.LIST_SEPRATOR);
      for (String node_host : nodes_hosts)
      {
        // nodehostlist.append(node_host).append(Util.LIST_SEPRATOR);
        Vector<String> nodeInfoV = IMUtil.parseListString(node_host, Constants.SEPARATE_SUB_SUB_CHARS);
        String[] nodeInfoArr = new String[nodeInfoV.size()];
        nodeInfoV.toArray(nodeInfoArr);
        nodeMapInfo.put(nodeInfoArr[3], nodeInfoArr);
      }
      
   // IC cluster info based on common,files and news
      //ip list of ic node
      List icNodeIPList = new ArrayList();      
      StringBuffer ic_clusters_info = new StringBuffer();
      String appCluster = profile.getOfferingUserData(Constants.IC_FILES_CLUSTER_INFO, Constants.OFFERING_ID);
      if (appCluster != null)
        if (ic_clusters_info.length() == 0)
          ic_clusters_info.append(appCluster);
        else
          ic_clusters_info.append(Util.LIST_SEPRATOR).append(appCluster);

      appCluster = profile.getOfferingUserData(Constants.IC_COMMON_CLUSTER_INFO, Constants.OFFERING_ID);
      if (appCluster != null)
        if (ic_clusters_info.length() == 0)
          ic_clusters_info.append(appCluster);
        else
          ic_clusters_info.append(Util.LIST_SEPRATOR).append(appCluster);

      appCluster = profile.getOfferingUserData(Constants.IC_NEWS_CLUSTER_INFO, Constants.OFFERING_ID);
      if (appCluster != null)
        if (ic_clusters_info.length() == 0)
          ic_clusters_info.append(appCluster);
        else
          ic_clusters_info.append(Util.LIST_SEPRATOR).append(appCluster);

      if (ic_clusters_info.length() > 0)
      {
        //app:::cluster::node,server:node,server:node,server:...;
        String[] ic_app_nodes_hosts = ic_clusters_info.toString().split(Util.LIST_SEPRATOR);
        for (String ic_app_node_host : ic_app_nodes_hosts)
        {
          //app:::cluster::node,server:node,server:node,server:...
          String[] appClusterInfo = ic_app_node_host.split(Constants.SEPARATE_SUB_CHARS);
          //cluster::node,server:node,server:node,server:...
          String[] nodesInfo = appClusterInfo[1].split(Constants.SEPARATE_SUB_SUB_CHARS);
          //node,server:node,server:node,server:...
          String[] nodes = nodesInfo[1].split(Util.LIST_SUB_SEPRATOR);
          for (String nodeInfo:nodes)
          {
            //node,server
            String[] node = nodeInfo.split(Constants.SEPARATE_COMMA_CHARS);
            String hostname = nodeMapInfo.get(node[0])[0];
            if (hostname!=null)
            {
              InetAddress addr = null;
              try
              {
                addr = InetAddress.getByName(hostname);
                icNodeIPList.add(addr.getHostAddress()); 
              }
              catch (UnknownHostException e)
              {
                // TODO Auto-generated catch block
                e.printStackTrace();
                return false;
              }                       
            }
          }
        }
      }
      
      String hostname = nodeMapInfo.get(nodeName)[0];
      if (hostname!=null)
      {
        InetAddress addr = null;
        try
        {
          addr = InetAddress.getByName(hostname);
          if (icNodeIPList.indexOf(addr.getHostAddress())!=-1)
          {
            ret = true;
          }
        }
        catch (UnknownHostException e)
        {
          // TODO Auto-generated catch block
          e.printStackTrace();
          return false;
        }                       
      }
    }

    return ret;
  }
  /**
   * 
   * @param profile
   * @return whether it is the same cell with IC due to the given profile
   */
  public static boolean isSameCellWithIC(IProfile profile)
  {
    boolean ret = false;
    if (profile != null)
    {
      String sameCell = profile.getOfferingUserData(Constants.SAME_CELL_WITH_IC, Constants.OFFERING_ID);
      if (sameCell!=null && Boolean.valueOf(sameCell))        
        ret = true;
    }

    return ret;
  }

  public static boolean isSameCellWithConversion(ICustomPanelData data)
  {
    boolean isModify = isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_MODIFY);
    boolean isUpgrade = isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE);
    if (isModify || isUpgrade)
    {
      return isFeatureInstalled(data.getAllJobs(), data.getAgent(), data.getProfile(), Constants.CONVERSION_ID);
    }else
    {
      return isFeatureSelected(data.getAllJobs(), Constants.CONVERSION_ID);
    }
  }

  public static String getFeatureConfig(IProfile iProfile) throws IOException
  {
    if (iProfile == null)
      return null;
        
    String installationRoot = iProfile.getInstallLocation();
    int index = 0;
    String separator = null;
    if (installationRoot.indexOf(File.separator)==-1)
      separator = "/";
    else
      separator = File.separator;
    if (installationRoot.endsWith(separator))
    {
      index = installationRoot.indexOf(separator);
      if (index != installationRoot.length())
      {
        index = installationRoot.substring(0, installationRoot.length() - 2).lastIndexOf(separator);
      }
    }
    else
    {
      index = installationRoot.lastIndexOf(separator);      
    }
    
    installationRoot = installationRoot.substring(0, index);
    
    installationRoot = (new StringBuilder()).append(installationRoot).append(separator).append("fConfig")
        .toString();
    File file = new File(installationRoot);
    if (!file.exists())
      file.mkdirs();
    String s = "fconfig.ini";
    String targetFilePath = (new StringBuilder()).append(installationRoot).append(separator).append(s).toString();                    
    s = "/fConfig/" + s;
    InputStream inputstream = CommonPlugin.class.getClassLoader().getResourceAsStream(s);
    File tartFile = new File(targetFilePath);
    
    if (!tartFile.exists())
      copyFile(inputstream, targetFilePath);
    
    return targetFilePath;
  }
  
  public static String getScriptsPath(IProfile iProfile) throws IOException
  {
    if (iProfile == null)
      return null;

    URL url = CommonPlugin.getDefault().getBundle().getResource("/pythonScripts");
    if (url == null)
      return null;

    String absPath = new Path(FileLocator.toFileURL(url).getPath()).toOSString();

    return absPath;
  }
  
  public static boolean copyFile(InputStream inputstream, String s)
  {
    if (inputstream == null || s == null)
      return false;

    try
    {
      FileOutputStream fileoutputstream = new FileOutputStream(s);
      for (int i = inputstream.read(); i != -1; i = inputstream.read())
        fileoutputstream.write(i);

      inputstream.close();
      fileoutputstream.close();
      return true;
    }
    catch (FileNotFoundException filenotfoundexception)
    {
      return false;
    }
    catch (IOException ioexception)
    {
    }

    return false;
  }

  // java helper functions
  /**
   * Quietly and cleanly closes the Closeable object (Streams, Readers, etc) if it is still open
   * 
   * @param closeable
   *          Closeable object (Streams, Readers, etc)
   */
  public static void closeResource(Closeable closeable, PrintWriter writer)
  {
    if (closeable != null)
    {
      try
      {
        closeable.close();
      }
      catch (IOException e)
      {
        String closeInformationMessage = String.format("IOException closing resource. %s.", e.getMessage());
        writer.println(closeInformationMessage);
      }
    }
  }

  public static void storeAllUserData(IProfile profile,String path) throws Exception
 {
    //String path = profile.getInstallLocation();
   String compoentListString = profile.getOfferingUserData(Constants.COMPONENT_LIST, Constants.OFFERING_ID);
   List<String> components = new ArrayList<String>(Arrays.asList(compoentListString.split(",")));   
   String deployType = profile.getOfferingUserData(Constants.DEPLOY_TYPE, Constants.OFFERING_ID);
   
   String scriptInstallRootPropertiesPath = path + File.separator + "%s" + File.separator + "%s";
   // not cfg.node.properties for proxy
   String scriptInstallRootPropertiesPathProxy = path + File.separator + "%s" + File.separator + "proxy" + File.separator + "cfg.properties";
   
   String scriptInstallerPropertiesPath = path + File.separator + "%s" + "Installer" + File.separator + "installer" + File.separator + "%s";   
   
   for (String s : components)
   {
     List<String> withNodecfgComponents = Arrays.asList(Constants.DOCS_ID, Constants.CONVERSION_ID);
     String nodeInstallRoot = null;
     String IMInstallRootKeyName = nameMap.get(s).get("IMInstallRootKeyName");

     // to write the cfg.node.properties, need to 1. set the right WAS install root for node. 2. backup the user input 
     // component install root before force set it to location/component 
     if( withNodecfgComponents.contains(s) )
     {       
       // 1. -----------------------------

       // backup the user input WAS install location, set it as node WAS install root for cfg.node.properties
       String localWASInstallRoot = profile.getOfferingUserData(Constants.LOCAL_WAS_INSTALL_ROOT, Constants.OFFERING_ID);  

       // extract the node WAS install root
       String componentNodes = profile.getOfferingUserData(nameMap.get(s).get("NodeList"), Constants.OFFERING_ID);
       String nodeWASInstallRoot = componentNodes.split(Constants.LIST_SEPRATOR)[0].split(Constants.SEPARATE_SUB_SUB_CHARS)[5];
       profile.setOfferingUserData(Constants.LOCAL_WAS_INSTALL_ROOT, nodeWASInstallRoot, Constants.OFFERING_ID); 
       
       // write cfg.node.properties to script installer
       String componentPropNodePath =  String.format(scriptInstallerPropertiesPath, s.substring(3), "cfg.node.properties");
       storeUserData(s, componentPropNodePath, profile);   
       
       // write cfg.node.properties into script install root for upgrade
       if( deployType.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_UPDATE) )
       {
         componentPropNodePath = String.format(scriptInstallRootPropertiesPath, s.substring(3), "cfg.node.properties");         
         storeUserData(s, componentPropNodePath, profile);
       }       
        
       // change back WAS install location to user input 
       profile.setOfferingUserData(Constants.LOCAL_WAS_INSTALL_ROOT, localWASInstallRoot, Constants.OFFERING_ID);

       // 2. ----------------------------       
       nodeInstallRoot = profile.getOfferingUserData(IMInstallRootKeyName, Constants.OFFERING_ID);  
     }

     // force set intall root to location/component to write cfg.properties 
     profile.setOfferingUserData(IMInstallRootKeyName, profile.getInstallLocation() + File.separator + s.substring(3), Constants.OFFERING_ID);

     // write cfg.properties into the script installer directory
     String componentPropPath = String.format(scriptInstallerPropertiesPath, s.substring(3), "cfg.properties");
     storeUserData(s, componentPropPath, profile);

     // write cfg.properties into script install root for upgrade
     if( deployType.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_UPDATE) )
     {
       if( Constants.DOCS_PROXY_ID.equalsIgnoreCase(s) )  
       {
           componentPropPath = String.format(scriptInstallRootPropertiesPathProxy, s.substring(3));         
       }
       else
       {
           componentPropPath = String.format(scriptInstallRootPropertiesPath, s.substring(3), "cfg.properties");
       }
       storeUserData(s, componentPropPath, profile);
     }
     if( nodeInstallRoot != null )    	 
     {
    	// change back install root to user input save it into the profile for next upgrade
    	profile.setOfferingUserData(IMInstallRootKeyName, nodeInstallRoot, Constants.OFFERING_ID);
     }
   }
 }
 
  /**
   * FIXME </br>url format </br>path format </bt>default value
   */
  public static void writeProperties(String path, IProfile profile, String offeringId, Map<String, String> keys, String component) throws Exception
  {
    File file = new File(path);
    if (!file.getParentFile().exists())
    {
      file.getParentFile().mkdirs();
    }
    OutputStream fos = new BufferedOutputStream(new FileOutputStream(file));
    StringBuffer properties = new StringBuffer();
    properties.append(nameMap.get(component).get("sectionName")).append("\n");

    Iterator<Entry<String, String>> iter = keys.entrySet().iterator();
    while (iter.hasNext())
    {
      Entry<String, String> entry = iter.next();
      String value = profile.getOfferingUserData(entry.getValue(), offeringId);
      
      if (value != null)
      {
        properties.append(entry.getKey()).append("=").append(value).append("\n");
      }
      else
      {
        properties.append(entry.getKey()).append("=").append("").append("\n");
      }
    }
    byte data[] = properties.toString().getBytes();
    try
    {
      fos.write(data, 0, data.length);
      logger.info("Properties file " + path);
      logger.info(properties.toString());
    }
    finally
    {
      if (fos != null)
      {
        fos.close();
        fos = null;
      }
    }
  }

  public static void storeUserData(String featureID, String path, IProfile profile) throws Exception
  {
    writeProperties(path, profile, Constants.OFFERING_ID, componentToPropMap.get(featureID), featureID);
  }

  public static void loadUserData(String featureID, String path, IProfile profile) throws IOException
  {
    if (featureID==null || path==null || profile==null)
      return;
    
    readProperties(path, profile, Constants.OFFERING_ID, componentToPropMap.get(featureID));
  }

  public static void readProperties(String path, IProfile profile, String offeringId, Map<String, String> keys) throws IOException
  {
    if (path==null || profile==null || offeringId==null || keys==null)
      return;
    
    Properties prop = new Properties();
    File file = new File(path);
    if (file!=null && !file.isFile())
      return;
    
    InputStream ios = new FileInputStream(file);
    try
    {
      prop.load(ios);
      Iterator<Entry<String, String>> iter = keys.entrySet().iterator();
      while (iter.hasNext())
      {
        Entry<String, String> entry = iter.next();
        String userData = prop.getProperty(entry.getKey());
        if (userData!=null)
        {
          int len = userData.trim().length();
          if (len > 0)
          {
            profile.setOfferingUserData(entry.getValue(), userData, offeringId);
          }
        }
      }
    }
    finally
    {
      if (ios != null)
      {
        ios.close();
        ios = null;
      }
    }
  }
  
  public static void readOneProperty2Profile(String path, IProfile profile, String propertyKey, String profileKey, String defalueProfileValue, String offeringId) throws IOException  
  {
    if (path == null || propertyKey == null)
      return;
    
    Properties prop = new Properties();
    File file = new File(path);
    if (file != null && !file.isFile())
      return;
    
    if (defalueProfileValue != null)
    {
      profile.setOfferingUserData(profileKey, defalueProfileValue, offeringId);
    }
    
    InputStream ios = new FileInputStream(file);

    try
    {
      prop.load(ios);
      String propertyValue = prop.getProperty(propertyKey);
      if (propertyValue == null)
        return;      
      profile.setOfferingUserData(profileKey, propertyValue, offeringId);      
    }
    finally
    {
      if (ios != null)
      {
        ios.close();
        ios = null;
      }
    }
  }  

  public static void replaceStringByStr(String filePath, String key, String src, String str) throws IOException
  {
    if (filePath == null || key==null || src == null || str == null)
      return;

    StringBuffer res = new StringBuffer();
    String line = null;
    
    File file = new File(filePath);
    if (file!=null && !file.isFile())
      return;
    
    try
    {     
      BufferedReader reader = new BufferedReader(new FileReader(file));
      while ((line = reader.readLine()) != null)
      {
        if (line.indexOf(key)!=-1 && line.indexOf(src)!=-1)                  
          line = line.replace(src, str);
        
        res.append(line + "\n");
      }
      reader.close();      
      
      File dist = new File(filePath);
      BufferedWriter writer = new BufferedWriter(new FileWriter(dist));
      writer.write(res.toString());
      writer.flush();
      writer.close();
    }
    catch (FileNotFoundException e)
    {
      e.printStackTrace();
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
  }
  
  /*
   * The parameter 'version' must be like 'x.y.z', for example: '2.0.0'.
   */
  public static boolean isVisible(ICustomPanelData data, String version)
  {
	  if (data == null)
		  return false;
	  
      if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_INSTALL))
    	  return true;     
      
      if (IMUtil.isDeployType(data.getAllJobs(), Constants.IM_DEPLOYMENT_TYPE_UPDATE))
      {               
          Version currVersion = Version.parseVersion(version);
          if (currVersion == null)
        	  return false;
          
          int major1 = currVersion.getMajor();
          int minor1 = currVersion.getMinor();
          int micro1 = currVersion.getMicro();
          
          IOffering iOffering = IMUtil.findOffering(data.getAllJobs(), Constants.OFFERING_ID);
          if (iOffering != null)
          {
            IOffering installedOffering = data.getAgent().findInstalledOffering(data.getProfile(), iOffering.getIdentity());
            if (installedOffering != null)
            {
              Version installedVersion = installedOffering.getVersion();
              int major2 = installedVersion.getMajor();
              int minor2 = installedVersion.getMinor();
              int micro2 = installedVersion.getMicro();              
              
              if (major1 > major2)
            	  return true;
              else if (major1 < major2)
            	  return false;
              else if (major1 == major2)
              {
            	if (minor1 > minor2)
            		return true;
            	else if (minor1 < minor2)
            		return false;
            	else if (minor1 == minor2)
            	{
            		if (micro1 > micro2)
            			return true;
            		else if (micro1 <= micro2)
            			return false; 
            	}
              }
            }
          }          
      }
	  
	  return false;	  
  }    
}
