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

import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.docs.im.installer.common.internal.Messages;

public class Constants
{

  /*
   * illegal number value returned from UI
   */
  public static final int ILLEGAL_VALUE = -10000;

  /*****************************************************************************************************************/
  /*
   * Special Separate Characters
   */
  public static final String SEPARATE_CHARS = "::::";

  public static final String SEPARATE_SUB_CHARS = ":::";

  public static final String SEPARATE_SUB_SUB_CHARS = "::";
  
  public static final String SEPARATE_COMMA_CHARS = ",";

  /*****************************************************************************************************************/
  /*
   * Offering ID
   */
  public static final String OFFERING_ID = "com.ibm.docs.im.installer"; // NON-NLS-1

  /*****************************************************************************************************************/
  /*
   * versions
   */
  public static final String VERSION_105 = "1.0.5"; // NON-NLS-1

  public static final String VERSION_106 = "1.0.6"; // NON-NLS-1
  
  public static final String VERSION_107 = "1.0.7"; // NON-NLS-1
  

  /*****************************************************************************************************************/
  /*
   * Operation System Type
   */
  public static final String WINDOWS = "windows";

  public static final String LINUX = "linux";

  /*****************************************************************************************************************/
  /*
   * Websphere Application Server Type
   */
  public static final String DEPLOYMENT_MANAGER = "DEPLOYMENT_MANAGER"; // NON-NLS-1

  public static final String WEB_SERVER = "WEB_SERVER"; // NON-NLS-1

  public static final String APPLICATION_SERVER = "APPLICATION_SERVER"; // NON-NLS-1

  /*****************************************************************************************************************/
  /*
   * IBM Docs Component Cluster Names and Server Names
   */
  public static final String NONE_CLUSTER = "NoneCluster"; // NON-NLS-1
  public static final String CONV_CLUSTER = "IBMConversionCluster"; // NON-NLS-1

  public static final String DOCS_CLUSTER = "IBMDocsCluster"; // NON-NLS-1

  public static final String Viewer_CLUSTER = "IBMViewerCluster"; // NON-NLS-1

  public static final String DOCS_PROXY_CLUSTER = "IBMDocsProxyCluster"; // NON-NLS-1

  public static final String CONV_SERVER = "IBMConversionMember"; // NON-NLS-1

  public static final String DOCS_SERVER = "IBMDocsMember"; // NON-NLS-1

  public static final String Viewer_SERVER = "IBMViewerMember"; // NON-NLS-1

  public static final String DOCS_PROXY_SERVER = "IBMDocsProxyMember"; // NON-NLS-1

  /*****************************************************************************************************************/
  /*
   * IBM Connections Applications
   */
  public static final String IC_FILES = "Files"; // NON-NLS-1

  public static final String IC_COMMON = "Common"; // NON-NLS-1

  public static final String IC_NEWS = "News"; // NON-NLS-1

  /*****************************************************************************************************************/
  /*
   * IBM Docs Component Applications
   */
  public static final String IDOCS_CONVERSION_APP = "IBMConversion"; // NON-NLS-1

  public static final String IDOCS_DOCS_APP = "IBMDocs"; // NON-NLS-1

  public static final String IDOCS_VIEWER_APP = "ViewerApp"; // NON-NLS-1

  /*****************************************************************************************************************/
  /*
   * Websphere Application Server default values
   */
  public static final String DMGR_SOAP = "8879"; // NON-NLS-1

  /*****************************************************************************************************************/
  /*
   * Type of creating topology elements
   */
  public static final String TOPOLOGY_CLUSTER = "Cluster";

  public static final String TOPOLOGY__NODE = "Node";

  public static final String TOPOLOGY__SERVER = "Server";

  /*****************************************************************************************************************/
  /*
   * Status of Validate Checking
   */
  public static final String DEPLOYMENT_EVN_TYPE_CLUSTER = "Cluster";

  public static final String DEPLOYMENT_EVN_TYPE_FEDERATED = "Federated";

  public static final String DEPLOYMENT_EVN_TYPE_UNMANGED = "Stand-alone";

  /*****************************************************************************************************************/
  /*
   * type of IM deployment
   */
  public static final String IM_DEPLOYMENT_TYPE = "IM_DEPLOYMENT_TYPE";

  public static final String IM_DEPLOYMENT_TYPE_INSTALL = "INSTALL";

  public static final String IM_DEPLOYMENT_TYPE_UNINSTALL = "UNINSTALL";

  public static final String IM_DEPLOYMENT_TYPE_MODIFY = "MODIFY";

  public static final String IM_DEPLOYMENT_TYPE_UPDATE = "UPDATE";

  public static final String IM_DEPLOYMENT_TYPE_ROLLBACK = "ROLLBACK";

  /*****************************************************************************************************************/
  /*
   * type of nfs check scope
   */
  public static final String NFS_VALIDATE_CONVERSION = "convnfs";

  public static final String NFS_VALIDATE_DOCS = "docsnfs";

  public static final String NFS_VALIDATE_CONV_DOCS = "conv_docs_nfs";

  public static final String NFS_VALIDATE_NONE = "nonenfs";

  /*****************************************************************************************************************/
  /*
   * work dir for windows
   */
  public static final String WIN_WORK_DIR = "C:/tmp/docs-tmp";

  public static final String LINUX_WORK_DIR = "/opt/docs-tmp";

  /*****************************************************************************************************************/
  /*
   * nfs check log file names
   */
  public static final String NFS_LOG_NAME_CONV = "conv_nfs_check.log";

  public static final String NFS_LOG_NAME_DOCS = "docs_nfs_check.log";
  /*****************************************************************************************************************/
  /*
   * Component List
   */
  public static final String IBMNONE = "Select a Component";

  public static final String IBMCONVERSION = "IBMConversion";

  public static final String IBMDOCS = "IBMDocs";

  public static final String IBMVIEWER = "IBMViewer";

  public static final String IBMDOCSPROXY = "IBMDocsProxy";

  public static final String IBMDOCEXT = "IBMDocsExt";

  public static final String IBMVIEWEREXT = "IBMViewerExt";

  public static final String WEBSERVER = "Webserver";

  public static final String IBMCONNECTIONS = "IBMConnections";

  //Connections + CCM
  public static final String IBMCCM = "IBMCCM";

  //ICN
  public static final String IBMECM = "IBMECM";

  public static final String IBMLCST = "IBMLCST";

  //ICN+ST
  public static final String IBMST = "IBMST";
  
  //Connections+ICN
  public static final String IBMICECM = "IBMICECM";
  
  //Connections+CCM+ICN
  public static final String IBMICCCMECM = "IBMICCCMECM";
  
  //Third party integration
  public static final String IBMTPI = "IBMTPI";

  /*****************************************************************************************************************/
  /*
   * Feature id definitions
   */
  public static final String CONVERSION_ID = "IBMConversion";

  public static final String DOCS_ID = "IBMDocs";

  public static final String INTEGRATION_WITH_CONNECTIONS_ID = "IBMConnections";

  public static final String INTEGRATION_WITH_CCM_ID = "IBMCCM";

  public static final String INTEGRATION_WITH_ECM_ID = "IBMECM";

  public static final String VIEWER_ID = "IBMViewer";

  public static final String DOCS_PROXY_ID = "IBMDocsProxy";

  public static final String DOC_EXT_ID = "IBMDocsExt";

  public static final String VIEWER_EXT_ID = "IBMViewerExt";

  public static final String WEBSERVER_ID = "Webserver";

  public static final String INTEGRATION_WITH_LCST_ID = "IBMLCST";

  public static final String INTEGRATION_WITH_STANDALONE_ST_ID = "IBMST";
  
  public static final String INTEGRATION_WITH_IC_ECM_ID = "IBMICECM";
  
  public static final String INTEGRATION_WITH_IC_CCM_ECM_ID = "IBMICCCMECM";

  /*****************************************************************************************************************/
  /*
   * Connections Docs Component Local Installation Directory
   */
  public static final String CONV_LOCAL_DIR = "Conversion";

  public static final String DOCS_LOCAL_DIR = "Docs";

  public static final String VIEWER_LOCAL_DIR = "Viewer";

  public static final String DOCS_PROXY_LOCAL_DIR = "DocsProxy";
  
  public static final String DOCS_PROXY_SUB_DIR = "proxy";

  public static final String DOCS_EXT_LOCAL_DIR = "DocsExt";

  public static final String VIEWER_EXT_LOCAL_DIR = "ViewerExt";

  /*****************************************************************************************************************/
  /*
   * Connections Docs Component Local Installation Directory
   */
  public static final String CONV_SRC_DIR = "ConversionInstaller";

  public static final String DOCS_SRC_DIR = "DocsInstaller";

  public static final String VIEWER_SRC_DIR = "ViewerInstaller";

  public static final String DOCS_PROXY_SRC_DIR = "DocsProxyInstaller";

  public static final String DOCS_EXT_SRC_DIR = "DocsExtInstaller";

  public static final String VIEWER_EXT_SRC_DIR = "ViewerExtInstaller";
  
  public static final String COMP_INSTALL_DIR = "installer";

  /*****************************************************************************************************************/
  /*
   * Configuration properties file name
   */
  public static String CONFIG_PROPERTIES_FILE = "cfg.properties";

  public static String CONFIG_NODE_PROPERTIES_FILE = "cfg.node.properties";

  /*****************************************************************************************************************/
  /*
   * Status of Validate Checking
   */
  public static final String PANEL_STATUS_OK = "true";

  public static final String PANEL_STATUS_FAILED = "false";

  /*****************************************************************************************************************/
  /*
   * Status of Validate Checking
   */
  public static final String WSADMIN_RETURN_TRUE = "TRUE";

  public static final String WSADMIN_RETURN_FALSE = "FALSE";

  public static final String WSADMIN_RETURN_NONE = "NONE";

  /*****************************************************************************************************************/
  /*
   * None selection for list box widget
   */
  public static final String NONE_SELECTION = "Not Specified";

  /*****************************************************************************************************************/
  /**
   * Auth Type
   */
  public static final String AUTH_TYPE_TAM = "TAM";

  public static final String AUTH_TYPE_FORM = "FORM";

  public static final String AUTH_TYPE_SAML = "SAML";

  public static final String AUTH_TYPE_BASIC = "BASIC";

  /**
   * Housekeeping setting
   */
  public static final String COMBO_OPTION_HOURLY = "Hourly";

  public static final String COMBO_OPTION_DAILY = "Daily";

  public static final String COMBO_OPTION_WEEKLY = "Weekly";

  public static final String COMBO_OPTION_MONTHLY = "Monthly";

  /*****************************************************************************************************************/
  /*
   * Area of Defining User Data IDs for COLLECT_WAS_INFORMATION_PANEL
   */
  public static final String WASADMIN = "user.wasadminUserData";

  public static final String PASSWORD_OF_WASADMIN = "user.pwdOfWasadminUserData";

  public static final String LOCAL_WAS_INSTALL_ROOT = "user.wasInstallRootUserData";

  public static final String DEPLOYMENT_ENV_TYPE = "user.envTypeUserData";

  public static final String COLLECT_WAS_INFORMATION_PANEL = "user.collectWasInfoPanel";

  public static final String COMPONENT_LIST = "user.componentList";

  public static final String DEPLOY_TYPE = "user.deploytype";

  public static final String OFFERING_VERSION = "user.offering.version";

  public static final String SOAP_PORT = "user.soapPort";
  
  public static final String SAME_CELL_WITH_IC = "user.sameCellWithIC";

  public static final String NODE_HOST_LIST = "user.nodesHostsServers";
  
  public static final String EMPTY_VALUE = "user.emptyValue";
  
  public static final String IC_ADMIN_J2C_ALIAS = "user.icAdminJ2cAlias";

  /*****************************************************************************************************************/

  /*
   * Area of Defining User Data IDs for NODES_IDENTIFICATION_PANEL
   */
  public static final String MAP_MODE = "user.mapModeUserData";

  public static final String SELECT_ALL_MODE = "user.selectAllNodeUserData";

  public static final String WIN_NODE_LIST = "user.winNodeListUserData";

  public static final String LINUX_NODE_LIST = "user.linuxNodeListUserData";
  
  public static final String WEBSERVER_NODE_LIST = "user.webserverNodeListUserData";

  public static final String CONV_ADD = "user.addConvUserData";

  public static final String CONV_REMOVE = "user.removeConvUserData";

  public static final String CONV_NODES = "user.convNodesUserData";

  public static final String DOCS_ADD = "user.addDocsUserData";

  public static final String DOCS_REMOVE = "user.removeDocsUserData";

  public static final String DOCS_NODES = "user.docsNodesUserData";

  public static final String VIEWER_ADD = "user.addViewerUserData";

  public static final String VIEWER_REMOVE = "user.removeViewerUserData";

  public static final String VIEWER_NODES = "user.viewerNodesUserData";

  public static final String DOCS_PROXY_ADD = "user.addProxyUserData";

  public static final String DOCS_PROXY_REMOVE = "user.removeProxyUserData";

  public static final String DOCS_PROXY_NODES = "user.proxyNodesUserData";

  public static final String DOCS_PROXY_NAME = "user.proxyClusterNameUserData";

  public static final String IHS_ADD = "user.addIHSUserData";

  public static final String IHS_REMOVE = "user.removeIHSUserData";

  public static final String IHS_NODES = "user.ihsNodesUserData";
  
  public static final String IHS_SERVER_NAME = "user.ihsServerNameUserData";

  public static final String LOCAL_HOST_NAME = "user.localHostUserData";

  public static final String CELL_NAME = "user.cellNameUserData";

  public static final String IC_FILES_CLUSTER = "user.icFilesClusterUserData";

  public static final String IC_NEWS_CLUSTER = "user.icNewsClusterUserData";

  public static final String IC_COMMON_CLUSTER_INFO = "user.icCommonClusterInfoUserData";

  public static final String IC_FILES_CLUSTER_INFO = "user.icFilesClusterInfoUserData";

  public static final String IC_NEWS_CLUSTER_INFO = "user.icNewsClusterInfoUserData";

  public static final String IC_COMMON_CLUSTER = "user.icCommonClusterUserData";
  
  public static final String CONVERSION_URL = "user.convUrlUserData";

  public static final String DOCS_URL = "user.docsUrlUserData";

  public static final String VIEWER_URL = "user.viewerUrlUserData";

  public static final String IC_FILES_URL = "user.icFilesUrlUserData";

  public static final String IC_CONNECTIONS_URL = "user.icConnUrlUserData";

  public static final String NODE_IDENTIFICATION_PANEL = "user.nodeIdentificationPanelUserData";
  public static final String IHS_URL = "user.ihsUrlUserData";

  /*****************************************************************************************************************/
  /*
   * Area of Defining User Data IDs for ENROL_HOSTS_PANEL
   */
  public static final String TARGET_HOST_ADMIN_PWD = "user.targetAdminPWDOfSrv";

  public static final String CONV_HOST_ADMIN_PWD = "user.convAdminPWDOfSrv";

  public static final String DOCS_HOST_ADMIN_PWD = "user.docsAdminPWDOfSrv";

  public static final String IHS_HOST_ADMIN_PWD = "user.ihsAdminPWDOfSrv";

  public static final String LOCAL_HOST_ADMIN_PWD = "user.localAdminPWDOfSrv";

  public static final String ENROLL_HOST_PANEL = "user.enrollHostPanelUserData";
  
  public static final String SUDO_ENABLED = "user.SUDO_ENABLED";

  /*****************************************************************************************************************/
  /*
   * Area of Defining User Data IDs for CONVERSION_PANEL , DATABASE_PANEL, SAMETIME_PANEL, DOCS_PANEL
   */
  public static final String CONV_STORAGE_TYPE_NFS = "NFS";

  public static final String CONV_STORAGE_TYPE_LOCAL = "Local";

  public static final String CONV_STORAGE_TYPE_CIFS = "CIFS";

  public static final String SOFTWARE_MODE = "user.softwareModeKey";

  public static final String CONV_DEPLOY_TYPE_ONPREMISE = "Premise";

  public static final String CONV_DEPLOY_TYPE_SMARTCLOUD = "SmartCloud";

  public static final String COMBO_OPTION_YES = "Yes";

  public static final String COMBO_OPTION_NO = "No";

  public static final String DB_PRODUCT_NAME_DB2 = "DB2";

  public static final String DB_PRODUCT_NAME_ORACLE = "Oracle";
  
  public static final String DB_PRODUCT_NAME_SQLSERVER = "Sqlserver";
  
  public static final String REPO_CMIS = "CMIS";

  public static final String REPO_REST = "REST";
  
  public static final String AUTH_OAUTH2 = "oauth2";

  public static final String AUTH_J2C = "j2c_alias";
  
  public static final String AUTH_S2S = "s2s_token";

  public static final String AUTH_COOKIE = "cookies";
  

  public static final String ST_CONNECTIONS_CM = "Connections_CM";

  public static final String ST_STANDALONE_CM = "Standalone_CM";

  public static final String DOCS_AUTHORIZATION_FORM = "FORM";

  public static final String DOCS_AUTHORIZATION_TAM = "TAM";

  public static final String DOCS_AUTHORIZATION_SAML = "SAML";

  public static final String COMBO_OPTION_TRUE = "True";

  public static final String COMBO_OPTION_FALSE = "False";

  public static final String DB_PANEL = "user.dbPanelUserData";

  /*****************************************************************************************************************/
  /*
   * Area of Defining User Data IDs for VIEWER_SERVER_CLUSTER_PANEL
   */
  public static final String VIEWER_DATA_PREFIX = "viewer.";

  public static final String VIEWER_INSTALLATION_LOCATION = "user.viewer.installLocation";

  public static final String VIEWER_SHARED_DIRECTORY = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "sharedDirectory";

  public static final String VIEWER_EDITOR_INSTALLED = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "editorInstalled";

  public static final String VIEWER_CONVERSION_SERVICE_PATH = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "conversionSrvPath";

  public static final String VIEWER_CACHE_CONTROL_SETTING = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "cacheControl";

  public static final String VIEWER_PRINT_SETTING = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "printSetting";

  public static final String VIEWER_AUTHENTICATION_TYPE = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "authType";

  public static final String VIEWER_AUTHENTICATION_SERVER_HOST_OF_DOCS = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX
      + "authServerHostOfDocs";

  public static final String VIEWER_MULTITENANCY_ENABLEMENT = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "multitenancy";

  public static final String VIEWER_ENABLE_UPLOAD_CONVERSION = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "uploadConvEnablement";

  public static final String VIEWER_HOUSEKEEPING_FREQUENCY = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "HKFrequency";

  public static final String VIEWER_CLEANING_lATEST_VERSION_OF_DOCUMENT_CACHE = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX
      + "cleanLstVerOfDocCache";

  public static final String VIEWER_TRIGGERING_LATEST_VERSION_CLEANING = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX
      + "lstVerCleaningTrigger";

  public static final String VIEWER_SCOPE = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "scope";

  public static final String VIEWER_SCOPE_NAME = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "scope_name";

  public static final String VIEWER_NODE_NAME = IProfile.USER_DATA_PREFIX + VIEWER_DATA_PREFIX + "node_name";

  public static final String VIEWER_SAME_CELL_AS_CONVERSION = "viewer.isSameCellAsConversion";

  /*****************************************************************************************************************/
  /*
   * Area of Defining User Data IDs for SERVER_EXTENSION_PANEL
   */
  public static final String VIEWER_EXT_DATA_PREFIX = "viewer.ext.";

  public static final String DOCS_EXT_DATA_PREFIX = "docs.ext.";

  public static final String DOCS_EXT_IC_INSTALLATION_PATH = IProfile.USER_DATA_PREFIX + DOCS_EXT_DATA_PREFIX + "ICInstallationPath";

  public static final String DOCS_EXT_SHARED_PATH = IProfile.USER_DATA_PREFIX + DOCS_EXT_DATA_PREFIX + "daemonSharedPath";

  public static final String DOCS_EXT_IGNORE_EVENT = IProfile.USER_DATA_PREFIX + DOCS_EXT_DATA_PREFIX + "ignoreEvent";

  public static final String DOCS_EXT_AUTH_TYPE = IProfile.USER_DATA_PREFIX + DOCS_EXT_DATA_PREFIX + "authType";

  public static final String DOCS_EXT_J2C_ALIAS = IProfile.USER_DATA_PREFIX + DOCS_EXT_DATA_PREFIX + "j2cAlias";

  public static final String DOCS_EXT_IC_VERSION = IProfile.USER_DATA_PREFIX + DOCS_EXT_DATA_PREFIX + "ICVersion";
  
  public static final String DOCS_EXT_IC_CCM_ENABLED = IProfile.USER_DATA_PREFIX + DOCS_EXT_DATA_PREFIX + "ICCCMEnable";
  

  public static final String VIEWER_EXT_IGNORE_EVENT = IProfile.USER_DATA_PREFIX + VIEWER_EXT_DATA_PREFIX + "ignoreEvent";

  public static final String VIEWER_EXT_AUTH_TYPE = IProfile.USER_DATA_PREFIX + VIEWER_EXT_DATA_PREFIX + "authType";

  public static final String VIEWER_EXT_J2C_ALIAS = IProfile.USER_DATA_PREFIX + VIEWER_EXT_DATA_PREFIX + "j2cAlias";

  public static final String DOCS_EXT_INSTALLED = "docs.ext.installed";

  public static final String VIEWER_EXT_INSTALLED = "viewer.ext.installed";

  public static final String DOCS_EXT_INSTALL_ROOT = IProfile.USER_DATA_PREFIX + DOCS_EXT_DATA_PREFIX + "installRoot";

  public static final String VIEWER_EXT_INSTALL_ROOT = IProfile.USER_DATA_PREFIX + VIEWER_EXT_DATA_PREFIX + "installRoot";

  public static final String FILES_SCOPE = IProfile.USER_DATA_PREFIX + "files.scope";

  /*****************************************************************************************************************/
  /*
   * Area of Defining User Data IDs for ECM_INTEGRATION_PANEL
   */
  public static final String ECM_INTEGRATION_DATA_PREFIX = "ecm.";

  public static final String ECM_FNCMIS_URL = IProfile.USER_DATA_PREFIX + ECM_INTEGRATION_DATA_PREFIX + "fncmisURL";

  public static final String ECM_FNCS_URL = IProfile.USER_DATA_PREFIX + ECM_INTEGRATION_DATA_PREFIX + "fncsURL";

  public static final String ECM_J2C_ALIAS = IProfile.USER_DATA_PREFIX + ECM_INTEGRATION_DATA_PREFIX + "J2CAlias";

  public static final String ECM_COMMUNITIES_URL = IProfile.USER_DATA_PREFIX + ECM_INTEGRATION_DATA_PREFIX + "communitiesURL";

  public static final String ECM_NAVIGATOR_URL = IProfile.USER_DATA_PREFIX + ECM_INTEGRATION_DATA_PREFIX + "navigatorURL";

  public static final String CCM_INSTALLED = "ccm_installed";
  
  public static final String ECM_INSTALLED = "ecm_installed";

  /*****************************************************************************************************************/
  /*
   * Area of Defining User Data IDs for RESTART_SETTINGS_PANEL
   */
  public static final String RESTART_WEB_SERVERS = IProfile.USER_DATA_PREFIX + "restartWebServers"; //$NON-NLS-1$  

  public static final String RESTART_CONNECTIONS = IProfile.USER_DATA_PREFIX + "restartConnections"; //$NON-NLS-1$  

  /*****************************************************************************************************************/
  public static final String SERVER_PROFILE_PATH = IProfile.USER_DATA_PREFIX + "serverProfilePath"; // NON-NLS-1

  public static final String SERVER_SOAP_PORT = IProfile.USER_DATA_PREFIX + "serverSOAPPort"; // NON-NLS-1

  public static final String SERVER_NODE_NAME = IProfile.USER_DATA_PREFIX + "serverNodeName"; // NON-NLS-1

  public static final String SERVER_INSTANCE_NAME = IProfile.USER_DATA_PREFIX + "serverName"; // NON-NLS-1

  public static final String DMGR_INSTANCE_NAME = IProfile.USER_DATA_PREFIX + "dmgrServerName"; // NON-NLS-1

  public static final String APPLICATION_SCOPE = IProfile.USER_DATA_PREFIX + "applicationScope"; // NON-NLS-1

  public static final String SERVER_ADMIN = IProfile.USER_DATA_PREFIX + "serverAdmin"; // NON-NLS-1

  /*****************************************************************************************************************/
  // DatabasePanel
  public static final String DB_USER_NAME = IProfile.USER_DATA_PREFIX + "dbUserName"; // NON-NLS-1

  public static final String DB_PASSWORD = IProfile.USER_DATA_PREFIX + "dbUserPassword"; // NON-NLS-1

  public static final String DB_SERVER_HOST_URL = IProfile.USER_DATA_PREFIX + "dbServerHostUrl"; // NON-NLS-1

  public static final String DB_PRODUCT_NAME = IProfile.USER_DATA_PREFIX + "dbProductName"; // NON-NLS-1

  public static final String DB_DOCS_DATABASE = IProfile.USER_DATA_PREFIX + "dbDocsDatabaseName"; // NON-NLS-1

  public static final String DB_JDBC_PATH = IProfile.USER_DATA_PREFIX + "dbJdbcPath"; // NON-NLS-1

  public static final String DB_SERVER_PORT = IProfile.USER_DATA_PREFIX + "dbServerPort"; // NON-NLS-1

  public static final String DB_IS_DOCS_UPGRADED = "is_docs_upgraded"; // NON-NLS-1

  /*****************************************************************************************************************/
  // WebChatPanel
  public static final String WC_INSTALL_CHOICE = IProfile.USER_DATA_PREFIX + "wcInstallChoice"; // NON-NLS-1

  public static final String WC_INSTALL_TYPE = IProfile.USER_DATA_PREFIX + "wcInstallType"; // NON-NLS-1

  public static final String WC_SERVER_DOMAIN = IProfile.USER_DATA_PREFIX + "wcServerDomain"; // NON-NLS-1

  public static final String WC_CONN_CONFIG_LOCATION = IProfile.USER_DATA_PREFIX + "wcConnConfigLocation"; // NON-NLS-1

  public static final String WC_CONN_ATTEMPTS = IProfile.USER_DATA_PREFIX + "wcConnAttempts"; // NON-NLS-1

  public static final String WC_CONN_ATTEMPTS_TIME = IProfile.USER_DATA_PREFIX + "wcConnAttemptsTime"; // NON-NLS-1

  public static final String WC_ST_SERVER_URL = IProfile.USER_DATA_PREFIX + "wcSTServerUrl"; // NON-NLS-1

  public static final String WC_SSL_SERVER_URL = IProfile.USER_DATA_PREFIX + "wcSSLServerUrl"; // NON-NLS-1

  public static final String WC_USE_INITIAL_NAME = IProfile.USER_DATA_PREFIX + "wcUseInitialName"; // NON-NLS-1

  public static final String WC_INSTALL_TYPE_CM = IProfile.USER_DATA_PREFIX + "wcInstallTypeCM"; // NON-NLS-1

  public static final String WC_INSTALL_TYPE_ST = IProfile.USER_DATA_PREFIX + "wcInstallTypeST"; // NON-NLS-1

  /*****************************************************************************************************************/
  // ConversionPanel
  public static final String CONV_INSTALL_LOCATION = IProfile.USER_DATA_PREFIX + "connInstallLocation"; // NON-NLS-1

  public static final String CONV_CPU_NUMBER = IProfile.USER_DATA_PREFIX + "connCPUNumber"; // NON-NLS-1

  public static final String CONV_START_PORT = IProfile.USER_DATA_PREFIX + "connStartPort"; // NON-NLS-1

  public static final String CONV_SCOPE = IProfile.USER_DATA_PREFIX + "convScopeKey"; //$NON-NLS-1$  

  public static final String CONV_SCOPE_NAME = IProfile.USER_DATA_PREFIX + "convScopeNameKey"; //$NON-NLS-1$  

  public static final String CONV_NODE_NAME = IProfile.USER_DATA_PREFIX + "convNodeNameKey"; //$NON-NLS-1$  

  public static final String CONV_WEBSERVER_NAME = IProfile.USER_DATA_PREFIX + "convWebserverNameKey"; //$NON-NLS-1$  

  /*****************************************************************************************************************/
  // Proxy

  public static final String PROXY_INSTALL_LOCATION = IProfile.USER_DATA_PREFIX + "proxyInstallLocation"; // NON-NLS-1

  /*****************************************************************************************************************/
  // DocsPanel
  public static final String DOCS_INSTALL_LOCATION = IProfile.USER_DATA_PREFIX + "docsInstallLocation"; // NON-NLS-1

  public static final String DOCS_CONN_FILES_URL = IProfile.USER_DATA_PREFIX + "connFilesURL"; // NON-NLS-1

  public static final String DOCS_CONNECTION_URL = IProfile.USER_DATA_PREFIX + "connectionsURL"; // NON-NLS-1

  public static final String DOCS_CONV_SERVICE_URL = IProfile.USER_DATA_PREFIX + "convServiceURL"; // NON-NLS-1

  public static final String DOCS_CONN_ADMIN = IProfile.USER_DATA_PREFIX + "connsAdmin"; // NON-NLS-1

  public static final String DOCS_TAM_HOST = IProfile.USER_DATA_PREFIX + "tamHost"; // NON-NLS-1

  public static final String DOCS_AUTHORIZATION = IProfile.USER_DATA_PREFIX + "authorization"; // NON-NLS-1

  public static final String DOCS_MULTITENANCY = IProfile.USER_DATA_PREFIX + "multitenancy"; // NON-NLS-1

  public static final String DOCS_NODEJS = IProfile.USER_DATA_PREFIX + "nodeJS"; // NON-NLS-1

  public static final String DOCS_SCOPE = IProfile.USER_DATA_PREFIX + "docsScopeKey"; //$NON-NLS-1$  

  public static final String DOCS_SCOPE_NAME = IProfile.USER_DATA_PREFIX + "docsScopeNameKey"; //$NON-NLS-1$  

  public static final String DOCS_NODE_NAME = IProfile.USER_DATA_PREFIX + "docsNodeNameKey"; //$NON-NLS-1$  

  public static final String DOCS_WEBSERVER_NAME = IProfile.USER_DATA_PREFIX + "docsWebserverNameKey"; //$NON-NLS-1$
  
  public static final String NON_JOB_MGR_NAME = IProfile.USER_DATA_PREFIX + "nonJobMgrKey"; //$NON-NLS-1$
  
  public static final String EXTERNAL_S2S_METHOD = IProfile.USER_DATA_PREFIX + "external_s2s_method"; //$NON-NLS-1$

  public static final String EXTERNAL_CUSTOMER_ID = IProfile.USER_DATA_PREFIX + "external_customer_id"; //$NON-NLS-1$

  public static final String EXTERNAL_OAUTH_ENDPOINT = IProfile.USER_DATA_PREFIX + "external_oauth_endpoint"; //$NON-NLS-1$

  public static final String EXTERNAL_J2C_ALIAS = IProfile.USER_DATA_PREFIX + "external_j2c_alias"; //$NON-NLS-1$

  public static final String EXTERNAL_S2S_TOKEN = IProfile.USER_DATA_PREFIX + "external_s2s_token"; //$NON-NLS-1$

  public static final String EXTERNAL_AS_USER_KEY = IProfile.USER_DATA_PREFIX + "external_as_user_key"; //$NON-NLS-1$

  public static final String EXTERNAL_CMIS_ATOM_PUB = IProfile.USER_DATA_PREFIX + "external_cmis_atom_pub"; //$NON-NLS-1$

  public static final String EXTERNAL_OBJECT_STORE = IProfile.USER_DATA_PREFIX + "external_object_store"; //$NON-NLS-1$

  public static final String DOCS_CALL_BACK_URL = IProfile.USER_DATA_PREFIX + "docs_call_back_url"; //$NON-NLS-1$
  
  public static final String VIEWER_CALL_BACK_URL = IProfile.USER_DATA_PREFIX + "viewer_call_back_url"; //$NON-NLS-1$
  
  public static final String EXTERNAL_PROFILES_URL = IProfile.USER_DATA_PREFIX + "external_profiles_url"; //$NON-NLS-1$

  public static final String EXTERNAL_REPOSITORY_HOME = IProfile.USER_DATA_PREFIX + "external_repository_home"; //$NON-NLS-1$

  public static final String EXTERNAL_META_URL = IProfile.USER_DATA_PREFIX + "external_meta_url"; //$NON-NLS-1$

  public static final String EXTERNAL_GET_CONTENT_URL = IProfile.USER_DATA_PREFIX + "external_get_content_url"; //$NON-NLS-1$

  public static final String EXTERNAL_SET_CONTENT_URL = IProfile.USER_DATA_PREFIX + "external_set_content_url"; //$NON-NLS-1$
  
  public static final String EXTERNAL_TOKEN_KEY = IProfile.USER_DATA_PREFIX + "external_token_key"; //$NON-NLS-1$
  
  public static final String EXTERNAL_REPOSITORY_TYPE = "external_repository_type"; //$NON-NLS-1$

  /*****************************************************************************************************************/
  // SharedStoragePanel
  public static final String SD_DOCS_TYPE = IProfile.USER_DATA_PREFIX + "docsStorageType"; // NON-NLS-1

  public static final String SD_DOCS_SHARED_REMOTE_SERVER = IProfile.USER_DATA_PREFIX + "docsSharedRemoteServer"; // NON-NLS-1

  public static final String SD_DOCS_SHARED_REMOTE_PATH = IProfile.USER_DATA_PREFIX + "docsSharedRemotePath"; // NON-NLS-1

  public static final String SD_DOCS_SERVER_DATA_LOC = IProfile.USER_DATA_PREFIX + "docsServerDataLocation"; // NON-NLS-1

  public static final String SD_DOCS_SHARED_LOCAL_PATH = IProfile.USER_DATA_PREFIX + "docsSharedLocalPath"; // NON-NLS-1

  public static final String SD_VIEWER_TYPE = IProfile.USER_DATA_PREFIX + "viewerStorageType"; // NON-NLS-1

  public static final String SD_VIEWER_SHARED_REMOTE_SERVER = IProfile.USER_DATA_PREFIX + "viewerSharedRemoteServer"; // NON-NLS-1

  public static final String SD_VIEWER_SHARED_REMOTE_PATH = IProfile.USER_DATA_PREFIX + "viewerSharedRemotePath"; // NON-NLS-1

  public static final String SD_VIEWER_SERVER_DATA_LOC = IProfile.USER_DATA_PREFIX + "viewerServerDataLocation"; // NON-NLS-1

  public static final String SD_VIEWER_FULLY_HOSTNAME = IProfile.USER_DATA_PREFIX + "viewerFullyHostName"; // NON-NLS-1

  public static final String SD_VIEWER_SHARED_LOCAL_PATH = IProfile.USER_DATA_PREFIX + "viewerSharedLocalPath"; // NON-NLS-1

  public static final String SD_UPLOAD_FILES_PATH = IProfile.USER_DATA_PREFIX + "uploadFilesPath"; // NON-NLS-1

  public static final String SD_CONV_INSTALLED = "conv_installed"; //$NON-NLS-1$  

  public static final String SD_DOCS_INSTALLED = "docs_installed"; //$NON-NLS-1$  

  public static final String SD_VIEWER_INSTALLED = "viewer_installed"; //$NON-NLS-1$  
  
  public static final String SD_IS_ICN = "is_icn"; //$NON-NLS-1$

  public static final String SD_SAME_IC_CESS = "same_ic_cell"; //$NON-NLS-1$
  
  public static final String SD_VIEWER_SAME_IC_NODE = "viewer_same_ic_node"; //$NON-NLS-1$
  
  public static final String SD_IS_105_UPGRADED = "is_105_upgraded"; //$NON-NLS-1$  

  public static final String PROXY_SCOPE_NAME = IProfile.USER_DATA_PREFIX + "proxyScopeNameKey"; //$NON-NLS-1$  

  public static final String KEY_FOR_EMPTY_VALUE = IProfile.USER_DATA_PREFIX + "keyForEmptyValue"; //$NON-NLS-1$  

  public static final String DOCS_CONTEXT_ROOT = IProfile.USER_DATA_PREFIX + "docsContextRootKey"; //$NON-NLS-1$  
  
  public static final String SD_DOCS_SERVER_DATA_LOC_ON_VIEWER = IProfile.USER_DATA_PREFIX + "docsServerDataLocationOnViewer"; // NON-NLS-1  

  // constant strings definition for invoke
  public final static String LINE_SEPARATOR = System.getProperty("line.separator"); //$NON-NLS-1$  
  
  public final static String WARNING_STRINGS = IProfile.USER_DATA_PREFIX + "warning_strings";

  public final static String PYTHON_PROCESS_FAILED = IProfile.USER_DATA_PREFIX + "python_process_failed"; //$NON-NLS-1$  

  public final static String LOG_FILE_TO_MONITOR = IProfile.USER_DATA_PREFIX + "log_file_to_monitor"; //$NON-NLS-1$
  
  public final static String FAILED_COMPONENT = IProfile.USER_DATA_PREFIX + "failed_component"; //$NON-NLS-1$


  public final static String CALL_FROM = IProfile.USER_DATA_PREFIX + "call_from"; //$NON-NLS-1$  

  public final static String IM_LOG_PREFIX = "-->IM:"; //$NON-NLS-1$  

  public final static String IM_WARNING_LOG_PREFIX = "-->IM:WARNING:";

  public static final String LIST_SEPRATOR = ";"; // NON-NLS-1

  /********* script path ********************/
  public static final String PYTHON_SCRIPT_PATH = "user.scriptPath"; //$NON-NLS-1$  

  /*****************************************************************************************************************/
  /*
   * KEY in CFG for Transformation, '\\' <==> '/' Java Properties handle '\\' specially
   */
  public static final String PROP_KEY_CONV_INSTALL_ROOT = "conversion_install_root"; //$NON-NLS-1$  
  
  public static final String PROP_KEY_CONVERSION_SHARED_DATA_ROOT_REMOTE = "conversion_shared_data_root_remote"; //$NON-NLS-1$
  
  public static final String PROP_KEY_DOCS_SHARED_STORAGE_REMOTE_PATH = "docs_shared_storage_remote_path"; //$NON-NLS-1$
  
  public static final String PROP_KEY_VIEWER_SHARED_STORAGE_REMOTE_PATH = "viewer_shared_storage_remote_path"; //$NON-NLS-1$
  
  public static final String PROP_KEY_CONVERSION_SHARED_DATA_ROOT_REMOTE_VIEWER = "conversion_shared_data_root_remote_viewer"; //$NON-NLS-1$
  
  public static final String PROP_KEY_VIEWER_SHARED_STORAGE_LOCAL_PATH = "viewer_shared_storage_local_path";
  
  public static final String PROP_KEY_VIEWER_SHARED_DATA_NAME = "viewer_shared_data_name";
  
  public static final String PROP_KEY_DOCS_SHARED_STORAGE_LOCAL_PATH = "docs_shared_storage_local_path";
  
  public static final String PROP_KEY_CONVERSION_SHARED_DATA_ROOT = "conversion_shared_data_root";

  public static final String PROP_KEY_DOCS_INSTALL_ROOT = "docs_install_root"; //$NON-NLS-1$  

  public static final String PROP_KEY_VIEWER_INSTALL_ROOT = "viewer_install_root"; //$NON-NLS-1$ 

  public static final String PROP_KEY_VIEWER_FILES_PATH = "files_path";

  public static final String PROP_KEY_EXT_IC_EXT_PATH = "ic_extension_path";
  
  public static final String PROP_KEY_EXT_DEAMON_PATH = "deamon_shared_path";
  
  public static final String PROP_KEY_EXT_INSTALL_ROOT = "ext_install_root";
  
  public static final String PROP_KEY_WAS_INSTALL_ROOT = "was_install_root";

  public static final String PROP_KEY_WAS_PROXY_INSTALL_ROOT = "was_proxy_profile_root";

  public static final String PROP_KEY_DB_JDBC_DRIVER_PATH = "db_jdbc_driver_path";
  
  public static final String PROP_KEY_ENABLE_UPLOAD_CONVERSION = "enable_upload_conversion";
  
  public static final String PROP_KEY_IGNORE_EVENT = "ignore_event";
  
  

  
  
  /****************************************************************************
   *Configuration Generation Panel
   *
   */
   public static final String TEMP_CFG_PATH = "user.tempCFGPath";
   
   public static final String ALL_CLUSTER_NAMES = "user.alClusterNames";
   
   public static final String UPGRADE_RECORDS_NAME = "/upgrade.records.new.";
  
}
