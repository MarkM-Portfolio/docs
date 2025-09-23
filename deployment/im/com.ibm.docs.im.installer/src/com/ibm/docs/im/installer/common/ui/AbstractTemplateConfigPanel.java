/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2012.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.common.ui;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;

import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.agent.core.custompanel.api.TemplateCustomPanel;
import com.ibm.cic.common.core.api.utils.EncryptionUtils;

public abstract class AbstractTemplateConfigPanel extends TemplateCustomPanel
{  
  public static final String APPLICATION_SCOPE = IProfile.USER_DATA_PREFIX + "scope"; // NON-NLS-1

  public static final String CLUSTER_SCOPE = "Cluster"; // NON-NLS-1

  public static final String SERVER_SCOPE = "Server"; // NON-NLS-1
  
  public static final String DOCS_SELECTED = IProfile.USER_DATA_PREFIX + "docs_selected"; // NON-NLS-1
  
  public static final String VIEWER_SELECTED = IProfile.USER_DATA_PREFIX + "viewer_selected"; // NON-NLS-1
  
  public static final String SHARE_LOCAL = IProfile.USER_DATA_PREFIX + "share_local"; // NON-NLS-1
  
  public static final String INSTALL_COMMAND = IProfile.USER_DATA_PREFIX + "install_command"; // NON-NLS-1
  
  public static final String INSTALL = "install.bat"; // NON-NLS-1
  
  public static final String INSTALL_NODE = "install_node.bat"; // NON-NLS-1
  
  public static final String UNINSTALL_COMMAND = IProfile.USER_DATA_PREFIX + "uninstall_command"; // NON-NLS-1
  
  public static final String UNINSTALL = "uninstall.bat"; // NON-NLS-1
  
  public static final String UNINSTALL_NODE = "uninstall_node.bat"; // NON-NLS-1

  public static final String APPLICATION_SCOPE_NAME = IProfile.USER_DATA_PREFIX + "scope_name"; // NON-NLS-1

  public static final String APPLICATION_NODE_NAME = IProfile.USER_DATA_PREFIX + "node_name"; // NON-NLS-1

  public static final String WAS_ADMIN_ID = IProfile.USER_DATA_PREFIX + "was_admin_id"; // NON-NLS-1

  public static final String WAS_ADMIN_PWD = IProfile.USER_DATA_PREFIX + "was_admin_pwd"; // NON-NLS-1

  public static final String WAS_INSTALL_ROOT = IProfile.USER_DATA_PREFIX + "was_install_root"; // NON-NLS-1

  public static final String WAS_INSTALL_TYPE = IProfile.USER_DATA_PREFIX + "was_install_type"; // NON-NLS-1

  public static final String WAS_PROFILE_NAME = IProfile.USER_DATA_PREFIX + "was_profile_name"; // NON-NLS-1

  public static final String WAS_SOAP_PORT = IProfile.USER_DATA_PREFIX + "was_soap_port"; // NON-NLS-1

  public static final String VALIDATE_SOAP_CONNECTION = "validate_soap_connection"; // NON-NLS-1

  public static final String SERVER_WSADMIN_EXEC = IProfile.USER_DATA_PREFIX + "conversionWSADMIN"; // NON-NLS-1

  public static final String SERVER_START_EXEC = IProfile.USER_DATA_PREFIX + "conversionSTART"; // NON-NLS-1

  public static final String SERVER_STOP_EXEC = IProfile.USER_DATA_PREFIX + "conversionSTOP"; // NON-NLS-1

  public static final String START_SERVER_DESC = IProfile.USER_DATA_PREFIX + "startServerDesc"; // NON-NLS-1

  public static final String STOP_SERVER_DESC = IProfile.USER_DATA_PREFIX + "stopServerDesc"; // NON-NLS-1

  public static final String RESTART_SERVER_DESC = IProfile.USER_DATA_PREFIX + "restartServerDesc"; // NON-NLS-1
  
  public static final String INSTALLING_SERVER_DESC = IProfile.USER_DATA_PREFIX + "installServerDesc"; // NON-NLS-1
  
  public static final String UNINSTALLING_SERVER_DESC = IProfile.USER_DATA_PREFIX + "uninstallServerDesc"; // NON-NLS-1
  
  public static final String INSTALLING_PYTHON_DESC = IProfile.USER_DATA_PREFIX + "installPythonDesc"; // NON-NLS-1
  
  public static final String UNINSTALLING_PYTHON_DESC = IProfile.USER_DATA_PREFIX + "uninstallPythonDesc"; // NON-NLS-1

  public static final String OFFERING_ID = "com.ibm.docs.conversion"; // NON-NLS-1
  
  public static final String CONV_DOCS_SHARED_DATA_ROOT = IProfile.USER_DATA_PREFIX + "conversion_shared_data_root"; // NON-NLS-1

  public static final String CONV_DOCS_SHARED_DATA_SERVER = IProfile.USER_DATA_PREFIX + "conversion_shared_data_server"; // NON-NLS-1

  public static final String CONV_DOCS_SHARED_DATA_ROOT_REMOTE = IProfile.USER_DATA_PREFIX + "conversion_shared_data_root_remote"; // NON-NLS-1

  public static final String CONVERSION_SHARED_DATA_ROOT_REMOTE_VIEWER = IProfile.USER_DATA_PREFIX + "conversion_shared_data_root_remote_viewer"; // NON-NLS-1

  public static final String VIEWER_SHARED_DATA_NAME = IProfile.USER_DATA_PREFIX + "viewer_shared_data_name"; // NON-NLS-1
  
  public static final String VALIDATE_SHARED_DATA = "validate_shared_data"; // NON-NLS-1
  
  public static final String SYMPHONY_INSTANCES = IProfile.USER_DATA_PREFIX + "sym_count"; // NON-NLS-1

  public static final String SYMPHONY_STARTING_PORT = IProfile.USER_DATA_PREFIX + "sym_start_port"; // NON-NLS-1
  
  public static final String INSTALL_TYPE = IProfile.USER_DATA_PREFIX + "install_type"; // NON-NLS-1
  
  public static final String SELECTED = "SELECTED"; // NON-NLS-1

  public static final String NOT_SELECTED = "NOT_SELECTED"; // NON-NLS-1
  
  public static final String VIEWER_AND_DOCS_INSTALL = "viewerAndDocs";

  public static final String DOCS_ONLY_INSTALL = "docsOnly";

  public static final String VIEWER_ONLY_INSTALL = "viewerOnly";

  public static final String STANDALONE_INSTALL = "standalone"; // NON-NLS-1

  public static final String FEDERATED_INSTALL = "federated"; // NON-NLS-1

  public static final String CLUSTER_INSTALL = "cluster"; // NON-NLS-1

  public AbstractTemplateConfigPanel(String panelName)
  {
    super(panelName);
  }

  public IStatus performFinish(IProgressMonitor monitor)
  {
    IProfile profile = getCustomPanelData().getProfile();

    /*
     * TODO: Here is not the best place to clear the saved credentials, need to find the best place later.
     */
    if (profile != null)
    {
      profile.removeUserData(WAS_ADMIN_ID);
      profile.removeUserData(WAS_ADMIN_PWD);

      profile.setOfferingUserData(WAS_ADMIN_ID, "", OFFERING_ID); // NON-NLS-1
      profile.setOfferingUserData(WAS_ADMIN_PWD, EncryptionUtils.encrypt(""), OFFERING_ID); // NON-NLS-1
    }

    return Status.OK_STATUS;
  }

  public static void createBlankLabel(Composite parent, String s, int numLabels)
  {
    for (int i = 0; i < numLabels; i++)
      new Label(parent, SWT.NONE).setText(s);
  }

  public static void createBlankLabel(Composite parent, String s)
  {
    createBlankLabel(parent, s, 1);
  }

  
  
  public IStatus performCancel(IProgressMonitor monitor)
  {
    IProfile profile = getCustomPanelData().getProfile();

    /*
     * TODO: Here is not the best place to clear the saved credentials, need to find the best place later.
     */
    if (profile != null)
    {
      profile.removeUserData(WAS_ADMIN_ID);
      profile.removeUserData(WAS_ADMIN_PWD);

      profile.setOfferingUserData(WAS_ADMIN_ID, "", OFFERING_ID); // NON-NLS-1
      profile.setOfferingUserData(WAS_ADMIN_PWD, EncryptionUtils.encrypt(""), OFFERING_ID); // NON-NLS-1
    }

    return Status.OK_STATUS;
  }

  /*protected IAgent getAgent()
  {
    //IAdaptable adaptable = this.getInitializationData();
    //return (IAgent) adaptable.getAdapter(IAgent.class);
  }

  protected FormToolkit getFormToolkit()
  {
    //IAdaptable adaptable = this.getInitializationData();
    //IAgentUI agentUI = (IAgentUI) adaptable.getAdapter(IAgentUI.class);
    //return agentUI.getFormToolkit();
  }*/
}