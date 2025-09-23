/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2012.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */

package com.ibm.docs.im.installer.common.internal;

import java.util.MissingResourceException;
import java.util.ResourceBundle;
import org.eclipse.osgi.util.NLS;

import com.ibm.docs.im.installer.common.util.ProductNameMap;
import com.ibm.docs.im.installer.common.util.StringTemplate;
public class Messages extends NLS
{
  private static final String BUNDLE_NAME = "com.ibm.docs.im.installer.common.internal.messages"; //$NON-NLS-1$  
  
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

  public static String Message_ProfileDirectoryNull$uuid;

  public static String Message_ProfileDirectoryNull$useraction;

  public static String Message_ProfileDirectoryNull$explanation;

  public static String Message_ProfileDirectoryNull$message;

  public static String Message_ProfileNameNull$uuid;

  public static String Message_ProfileNameNull$useraction;

  public static String Message_ProfileNameNull$explanation;

  public static String Message_ProfileNameNull$message;

  public static String Message_WsadminExecNotFound$uuid;

  public static String Message_WsadminExecNotFound$useraction;

  public static String Message_WsadminExecNotFound$explanation;

  public static String Message_WsadminExecNotFound$message;

  public static String Message_NoExecPermission4Wsadmin$uuid;

  public static String Message_NoExecPermission4Wsadmin$useraction;

  public static String Message_NoExecPermission4Wsadmin$explanation;

  public static String Message_NoExecPermission4Wsadmin$message;

  public static String Message_ProfileDirectoryNotExist$uuid;

  public static String Message_ProfileDirectoryNotExist$useraction;

  public static String Message_ProfileDirectoryNotExist$explanation;

  public static String Message_ProfileDirectoryNotExist$message;

  public static String Message_SOAPPortNull$uuid;

  public static String Message_SOAPPortNull$useraction;

  public static String Message_SOAPPortNull$explanation;

  public static String Message_SOAPPortNull$message;

  public static String Message_InvalidSOAPPort$uuid;

  public static String Message_InvalidSOAPPort$useraction;

  public static String Message_InvalidSOAPPort$explanation;

  public static String Message_InvalidSOAPPort$message;

  public static String Message_NodeNameNull$uuid;

  public static String Message_NodeNameNull$useraction;

  public static String Message_NodeNameNull$explanation;

  public static String Message_NodeNameNull$message;

  public static String Message_ServerNameNull$uuid;

  public static String Message_ServerNameNull$useraction;

  public static String Message_ServerNameNull$explanation;

  public static String Message_ServerNameNull$message;

  public static String Message_DmgrServerInstanceNameNull$uuid;

  public static String Message_DmgrServerInstanceNameNull$useraction;

  public static String Message_DmgrServerInstanceNameNull$explanation;

  public static String Message_DmgrServerInstanceNameNull$message;

  public static String Message_AdminNull$uuid;

  public static String Message_AdminNull$useraction;

  public static String Message_AdminNull$explanation;

  public static String Message_AdminNull$message;
  
  public static String Message_CreateFileFailed$uuid;

  public static String Message_CreateFileFailed$useraction;

  public static String Message_CreateFileFailed$explanation;
  
  public static String Message_CreateFileFailed$message;

  public static String Message_WriteFileFailed$uuid;

  public static String Message_WriteFileFailed$useraction;

  public static String Message_WriteFileFailed$explanation;
  
  public static String Message_WriteFileFailed$message;
  
  public static String Message_SharedDataDirectoryExist$uuid;

  public static String Message_SharedDataDirectoryExist$useraction;

  public static String Message_SharedDataDirectoryExist$explanation;

  public static String Message_SharedDataDirectoryExist$message;
  
  public static String Message_MountCommandNotInstalled$uuid;

  public static String Message_MountCommandNotInstalled$useraction;

  public static String Message_MountCommandNotInstalled$explanation;

  public static String Message_MountCommandNotInstalled$message;
  
  public static String Message_MountCommandFailed$uuid;

  public static String Message_MountCommandFailed$useraction;

  public static String Message_MountCommandFailed$explanation;

  public static String Message_MountCommandFailed$message;
  
  public static String Message_AdminPwdValFailed$uuid;

  public static String Message_AdminPwdValFailed$useraction;

  public static String Message_AdminPwdValFailed$explanation;

  public static String Message_AdminPwdValFailed$message;
  
  public static String Message_AdminClusterValidateFailed$uuid;

  public static String Message_AdminClusterValidateFailed$useraction;

  public static String Message_AdminClusterValidateFailed$explanation;

  public static String Message_AdminClusterValidateFailed$message;
  
  public static String Message_AdminTaskFailed$uuid;

  public static String Message_AdminTaskFailed$useraction;

  public static String Message_AdminTaskFailed$explanation;

  public static String Message_AdminTaskFailed$message;
  
  public static String Message_ProductName;
  
  public static String Message_ComponentNameConversion;
  public static String Message_ComponentNameEditor;
  public static String Message_ComponentNameEditorExt;
  public static String Message_ComponentNameEditorProxy;
  public static String Message_ComponentNameViewer;
  public static String Message_ComponentNameViewerExt;

  public static String Message_HardwareServerNameConversion;
  public static String Message_HardwareServerNameEditor;
  public static String Message_HardwareServerNameProxy;
  public static String Message_HardwareServerNameViewer;
}
