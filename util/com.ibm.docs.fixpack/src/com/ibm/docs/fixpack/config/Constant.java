/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.fixpack.config;

public class Constant
{
  public static final String TEMP = ".temp";// temporary name suffix of the file during unzipping

  public static final String WORK_PLACE = "/deployment/fixpack/workspace/";// patch work space

  public static final String FIXPACK_DIR = "/deployment/fixpack/";// directory of fixpack in deployment

  public static final String NATIVE_DIR = "/IBMConnectionsDocs-repo/native/";// relative path of native

  public static final String SetupDB_DIR = "/SetupDB/"; 

  public static final String DOCS_HELP = "IBMDocsHelp/ibmdocshelp.update.zip";
  
  public static final String DOCS_ECM_HELP = "IBMDocsECMHelp";
  
  public static final String DOCS_ECM_HELP_TARGET = "/deployment/help/com.ibm.docs.ecm.help";

  public static final String PATCH_CONFIG_FILE = "/deployment/fixpack/patch-config.json";

  public static final String DELETE_PROPS_FILE = "/META-INF/ibm-partialapp-delete.props";

  public static final String APP_XML_FILE = "META-INF/application.xml";// application.xml

  public static final String WEB_RESOURCE_EAR = "com.ibm.docs.web.resources.ear.ear";

  public static final String WEB_RESOURCE_EAR_DIR = "/docs-web.resources/com.ibm.docs.web.resources.ear/target/";

  public static final String VIEWER_EAR = "com.ibm.concord.viewer.ear.ear";

  public static final String DOCS_HELP_TARGET = "/deployment/help/target/ibmdocshelp.update.zip";

  public static final String OP_VIEWER_EAR_DIR = "/viewerapp/applications/com.ibm.concord.viewer.ear/OnPremise/target";

  public static final String SC_VIEWER_EAR_DIR = "/viewerapp/applications/com.ibm.concord.viewer.ear/SmartCloud/target";

  public static final String SPELLCHECK_EAR = "com.ibm.docs.spellcheck.ear.ear";

  public static final String STELLENT_ZIP = "org.oracle.oiexport.win32_x64.zip";

  public static final String NATIVE_ZIP = "native.zip";

  public static final String SYMPHONY_ZIP = "OOo_.*";
  
  public static final String CONVERSION_LIB_VERSION_FILE = "conversionlib/currentBuildLabel.txt";

  public static final String IFIX_VERSION_FILE = "ifix-version.json";

  public static final String REMOTE_INSTALLER = "docs_remote_installer";

  public static final String REMOTE_STARTER_PSL = "remote_starter.ps1";
  
  public static final String REMOTE_STARTER_SH = "remote_starter.sh";

  public static final String ONPREMISE = "OnPremise";

  public static final String SMARTCLOUD = "SmartCloud";

  public static final String SC_DOCS_PATCH = "SC-Docs-Patch";

  public static final String SC_VIEWER_PACTH = "SC-Viewer-Patch";

  public static final String SC_CR_PACTH = "SC-DocsConversion-Patch";

  public static final String SC_RP_PACTH = "SC-DocsProxy-Patch";
  
  public static final String ManageZkNodes_PY = "/deployment/rpm/com.ibm.docs.dmz.rpm/files/opt/ll/scripts/docsrp/manageZkNodes.py";

}
