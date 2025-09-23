/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */

package com.ibm.docs.im.installer.internal;

import java.util.MissingResourceException;
import java.util.ResourceBundle;
import org.eclipse.osgi.util.NLS;
import com.ibm.docs.im.installer.common.util.ProductNameMap;
import com.ibm.docs.im.installer.common.util.StringTemplate;

public class Messages
{
  private static final String BUNDLE_NAME = "com.ibm.docs.im.installer.internal.messages"; //$NON-NLS-1$

  private static final ResourceBundle RESOURCE_BUNDLE = ResourceBundle.getBundle(BUNDLE_NAME);

  static
  {
    NLS.initializeMessages(BUNDLE_NAME, Messages.class);
  }

  private Messages()
  {
  }

  public static String getString(String key)
  {
    try
    {
      String rawString = RESOURCE_BUNDLE.getString(key);
      StringTemplate stringTemplate = new StringTemplate(rawString);      
      return stringTemplate.substitute(ProductNameMap.get()); 
    }
    catch (MissingResourceException e)
    {
      return '!' + key + '!';
    }
  }

  /*
   * Panel Title Definition
   */
  public static String PanelName1;

  public static String PanelName2;

  public static String PanelName3;

  public static String PanelName;

  public static String PanelName$WASInfoPanel;

  public static String PanelName$NodeIdentificationPanel;

  public static String PanelName$RegistHostsPanel;

  /*
   * Strings Definition for Common
   */
  public static String Message_Validate$label;

  public static String Message_Validating$label;

  /*
   * Strings Definition on WAS Information Collection Panel
   */

  public static String Message_AdminNull$uuid;

  public static String Message_AdminNull$explanation;

  public static String Message_AdminNull$useraction;

  public static String Message_AdminNull$message;

  public static String Message_AdminPwdNull$uuid;

  public static String Message_AdminPwdNull$useraction;

  public static String Message_AdminPwdNull$explanation;

  public static String Message_AdminPwdNull$message;

  public static String Message_AdminPwdValFailed$uuid;

  public static String Message_AdminPwdValFailed$useraction;

  public static String Message_AdminPwdValFailed$explanation;

  public static String Message_AdminPwdValFailed$message;

  public static String Message_AdminPwdValFailed$message1;

  public static String Message_AdminPwdValFailed$message3;

  public static String Message_AdminPwdValFailed$message4;

  public static String Message_AdminPwdValFailed$message5;

  public static String Message_AdminPwdValFailed$message6;

  public static String Message_AdminPwdValFailed$message7;

  public static String Message_AdminPwdValFailed$message8;

  public static String Message_AdminPwdValFailed$message9;

  public static String Message_AdminPwdValFailed$message10;

  public static String Message_AdminPwdValFailed$message11;

  public static String Message_AdminPwdValFailed$message12;

  public static String Message_ProfileDirectoryNull$uuid;

  public static String Message_ProfileDirectoryNull$message;

  public static String Message_ProfileDirectoryNull$explanation;

  public static String Message_ProfileDirectoryNull$useraction;

  public static String Message_ProfileNameNull$uuid;

  public static String Message_ProfileNameNull$message;

  public static String Message_ProfileNameNull$explanation;

  public static String Message_ProfileNameNull$useraction;

  public static String Message_ProfileDirectoryNotExist$uuid;

  public static String Message_ProfileDirectoryNotExist$message;

  public static String Message_ProfileDirectoryNotExist$explanation;

  public static String Message_ProfileDirectoryNotExist$useraction;

  public static String Message_WsadminExecNotFound$uuid;

  public static String Message_WsadminExecNotFound$message;

  public static String Message_WsadminExecNotFound$explanation;

  public static String Message_WsadminExecNotFound$useraction;

  public static String Message_NoExecPermission4Wsadmin$uuid;

  public static String Message_NoExecPermission4Wsadmin$message;

  public static String Message_NoExecPermission4Wsadmin$explanation;

  public static String Message_NoExecPermission4Wsadmin$useraction;

  public static String Message_UnmanagedDeploymentEnviornment$isDmgr;

  public static String Message_WASInfoPanel_Top$label1;

  public static String Message_WASInfoPanel_Top$label2;

  public static String Message_WASInfoPanel_EnvType$label;

  public static String Message_WASInfoPanel_EnvType$radioBtnTip;

  public static String Message_WASInfoPanel_EnvType$cluster;

  public static String Message_WASInfoPanel_EnvType$clusterTip;

  public static String Message_WASInfoPanel_EnvType$federated;

  public static String Message_WASInfoPanel_EnvType$federatedTip;

  public static String Message_WASInfoPanel_EnvType$standalone;

  public static String Message_WASInfoPanel_EnvType$standaloneTip;

  public static String Message_WASInfoPanel_WASInstallRootBrowser$Label;

  public static String Message_WASInfoPanel_Validate$label;

  public static String Message_WASInfoPanel_Validating$label;

  public static String Message_WASInfoPanel_Validating$msg;

  public static String Message_WASInfoPanel_Validate$Tips;

  public static String Message_WASInfoPanel_ValidationSuccessful$msg;

  /*
   * Strings Definition on Nodes Identification Panel
   */
  public static String Message_NodeIdentificationPanel_Top$label;

  public static String Message_NodeIdentificationPanel_WinNodes$Label;

  public static String Message_NodeIdentificationPanel_LnxNodes$Label;

  public static String Message_NodeIdentificationPanel_WebNodes$Label;

  public static String Message_NodeIdentificationPanel_AddBtn$Label;

  public static String Message_NodeIdentificationPanel_RemoveBtn$Label;

  public static String Message_NodeIdentificationPanel_NodesSelectAll$Label;

  public static String Message_NodeIdentificationPanel_ConvAdd$btnTip;

  public static String Message_NodeIdentificationPanel_ConvRemove$btnTip;

  public static String Message_NodeIdentificationPanel_Conv$label;
  
  public static String Message_NodeIdentificationPanel_Nodes$lable;
  
  public static String Message_NodeIdentificationPanel_ServeNames$lable;  
  
  public static String Message_NodeIdentificationPanel_ClusterName$lable;

  public static String Message_NodeIdentificationPanel_Conv$listTip;

  public static String Message_NodeIdentificationPanel_DocsAdd$btnTip;

  public static String Message_NodeIdentificationPanel_DocsRemove$btnTip;

  public static String Message_NodeIdentificationPanel_Docs$label;

  public static String Message_NodeIdentificationPanel_Docs$listTip;

  public static String Message_NodeIdentificationPanel_ViewerAdd$btnTip;

  public static String Message_NodeIdentificationPanel_ViewerRemove$btnTip;

  public static String Message_NodeIdentificationPanel_Viewer$label;

  public static String Message_NodeIdentificationPanel_Viewer$listTip;

  public static String Message_NodeIdentificationPanel_ProxyAdd$btnTip;

  public static String Message_NodeIdentificationPanel_ProxyRemove$btnTip;

  public static String Message_NodeIdentificationPanel_Proxy$label;

  public static String Message_NodeIdentificationPanel_Proxy$listTip;

  public static String Message_NodeIdentificationPanel_IHSAdd$btnTip;

  public static String Message_NodeIdentificationPanel_IHSRemove$btnTip;

  public static String Message_NodeIdentificationPanel_IHS$label;

  public static String Message_NodeIdentificationPanel_IHS$listTip;

  public static String Message_NodeIdentificationPanel_ValidationSuccessful$msg;

  public static String Message_NodeIdentificationPanel_Validate$Tips;

  public static String Message_NodeIdentificationPanel_Validating$msg;

  public static String Message_NodeIdentificationPanel_NodeListEmpty$uuid;

  public static String Message_NodeIdentificationPanel_NodeListEmpty$message;

  public static String Message_NodeIdentificationPanel_NodeListEmpty$explanation;

  public static String Message_NodeIdentificationPanel_NodeListEmpty$useraction;
  public static String Message_NodeIdentificationPanel_IHSSrc1$Label;
  public static String Message_NodeIdentificationPanel_IHSSrc2$Label;
  public static String Message_NodeIdentificationPanel_IHSHint$Label;

  /*
   * Strings Definition on Enrol Hosts Panel
   */
  public static String Message_EnrollHostsPanel_Top$msg;

  public static String Message_EnrollHostsPanel_ConvEnvType$cluster;

  public static String Message_EnrollHostsPanel_DocsEnvType$cluster;

  public static String Message_EnrollHostsPanel_IHSEnvType$server;

  public static String Message_EnrollHostsPanel_ConvEnvType$server;

  public static String Message_EnrollHostsPanel_Username$tip;

  public static String Message_EnrollHostsPanel_Password$tip;

  public static String Message_EnrollHostsPanel_ApplyAll$tip;
  
  public static String Message_NodeIdentificationPanel_ValidationSuccessful$msg3;
  
  public static String Message_NodeIdentificationPanel_ValidationSuccessful$msg4;
  
  public static String Message_NodeIdentificationPanel_ValidationSuccessful$msg5;

  public static String Message_WASInfoPanel_Validate$noteLabel;
}
