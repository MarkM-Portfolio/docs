/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.invoke;

import java.util.HashMap;
import java.util.Map;

import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.invoke.internal.Messages;


public class MsgMap
{
  
  //Install
  public static Map<String, String> PythonCommandDescMap = new HashMap<String, String>();
  //Uninstall
  public static Map<String, String> UninstallPythonCommandDescMap = new HashMap<String, String>();
  //Rollback
  public static Map<String, String> RollbackPythonCommandDescMap = new HashMap<String, String>();
  //Upgrade
  public static Map<String, String> UpgradePythonCommandDescMap = new HashMap<String, String>();

  //For install
  static
  {        
    //Docs
    PythonCommandDescMap.put("CollectClusterInfo", Messages.getString("Message_CollectClusterInfo"));
    PythonCommandDescMap.put("Message_CollectWebserverInfo", Messages.getString("Message_CollectClusterInfo"));
    PythonCommandDescMap.put("InitialWasData", Messages.getString("Message_InitialWasData"));
    PythonCommandDescMap.put("StopServer", Messages.getString("Message_StopServer"));
    PythonCommandDescMap.put("SyncNodes", Messages.getString("Message_SyncNodes"));
    PythonCommandDescMap.put("InstallSpellCheckBundle", Messages.getString("Message_InstallSpellCheckBundle"));
    PythonCommandDescMap.put("InstallSpreadsheetNodeJS", Messages.getString("Message_InstallSpreadsheetNodeJS"));
    PythonCommandDescMap.put("StartServerBase", Messages.getString("Message_StartServerBase"));
    PythonCommandDescMap.put("InstallConfigJson", Messages.getString("Message_InstallConfigJson"));
    PythonCommandDescMap.put("SetVariables", Messages.getString("Message_SetVariables"));
    PythonCommandDescMap.put("TuneJVM", Messages.getString("Message_TuneJVM"));
    PythonCommandDescMap.put("CreateJVMProperty", Messages.getString("Message_CreateJVMProperty"));
    PythonCommandDescMap.put("DisableSessionSecurity", Messages.getString("Message_DisableSessionSecurity"));
    PythonCommandDescMap.put("AddWorkManager", Messages.getString("Message_AddWorkManager"));
    PythonCommandDescMap.put("SetupJDBCJAAS", Messages.getString("Message_SetupJDBCJAAS"));
    PythonCommandDescMap.put("SetupJDBCProvider", Messages.getString("Message_SetupJDBCProvider"));
    
    PythonCommandDescMap.put("SetupDataSource", Messages.getString("Message_SetupDataSource"));
    PythonCommandDescMap.put("AddScheduler", Messages.getString("Message_AddScheduler"));
    PythonCommandDescMap.put("TuneTransactionConfig", Messages.getString("Message_TuneTransactionConfig"));
    PythonCommandDescMap.put("EnsureCompatibleSharedLib", Messages.getString("Message_EnsureCompatibleSharedLib"));
    PythonCommandDescMap.put("AddObjectCache", Messages.getString("Message_AddObjectCache"));
    PythonCommandDescMap.put("InstallEar", Messages.getString("Message_InstallEar"));
    PythonCommandDescMap.put("mapSecurityRole", Messages.getString("Message_mapSecurityRole"));
    PythonCommandDescMap.put("AddBus", Messages.getString("Message_AddBus"));
    PythonCommandDescMap.put("CreateFactory", Messages.getString("Message_CreateFactory"));
    
    PythonCommandDescMap.put("AddDestination", Messages.getString("Message_AddDestination"));
    PythonCommandDescMap.put("CreateTopic", Messages.getString("Message_CreateTopic"));
    PythonCommandDescMap.put("AddActivation", Messages.getString("Message_AddActivation"));
    PythonCommandDescMap.put("TuneLOG", Messages.getString("Message_TuneLOG"));
    PythonCommandDescMap.put("SetupDocsAdminJ2CAlias", Messages.getString("Message_SetupDocsAdminJ2CAlias"));
    PythonCommandDescMap.put("StopServerBase", Messages.getString("Message_StopServerBase"));
    
    PythonCommandDescMap.put("JobManagerAdapter", Messages.getString("Message_JobManagerAdapter"));
    PythonCommandDescMap.put("AddVersionInfo", Messages.getString("Message_AddVersionInfo"));
    PythonCommandDescMap.put("CreateUninstaller", Messages.getString("Message_CreateUninstaller"));
    PythonCommandDescMap.put("AddTag", Messages.getString("Message_AddTag"));
    PythonCommandDescMap.put("Map2WebServer", Messages.getString("Message_Map2WebServer"));
    PythonCommandDescMap.put("MapProxy2WebServer", Messages.getString("Message_Map2WebServer"));
    PythonCommandDescMap.put("StartServer", Messages.getString("Message_StartServer"));
    PythonCommandDescMap.put("StopNode", Messages.getString("Message_StopNode"));
    PythonCommandDescMap.put("InstallRTC4WebBundle", Messages.getString("Message_InstallRTC4WebBundle"));
    PythonCommandDescMap.put("StartNode", Messages.getString("Message_StartNode"));
    PythonCommandDescMap.put("StopServerBase", Messages.getString("Message_StopServerBase"));
    
    //Conversion
    PythonCommandDescMap.put("InstallStellent", Messages.getString("Message_InstallStellent"));
    PythonCommandDescMap.put("InstallOSGIBundle", Messages.getString("Message_InstallOSGIBundle"));
    PythonCommandDescMap.put("InstallNativeFiles", Messages.getString("Message_InstallNativeFiles"));
    
    //Viewer
    PythonCommandDescMap.put("SetupViewerAdminJ2CAlias", Messages.getString("Message_SetupViewerAdminJ2CAlias"));
    PythonCommandDescMap.put("AddImagePng", Messages.getString("Message_AddImagePng"));
    PythonCommandDescMap.put("RegisterNFS", Messages.getString("Message_RegisterNFS"));
    PythonCommandDescMap.put("CreateSharedLib", Messages.getString("Message_CreateSharedLib"));
    PythonCommandDescMap.put("AssociateSharedLib", Messages.getString("Message_AssociateSharedLib"));
    PythonCommandDescMap.put("AddTimerManager", Messages.getString("Message_AddTimerManager"));
    
    //Docs Proxy
    PythonCommandDescMap.put("InstallProxyFilter", Messages.getString("Message_InstallProxyFilter"));
    PythonCommandDescMap.put("CreateCompressAction", Messages.getString("Message_CreateCompressAction"));
    PythonCommandDescMap.put("CreateProxyTuning", Messages.getString("Message_CreateProxyTuning"));
    PythonCommandDescMap.put("CreateTrustedSecurity", Messages.getString("Message_CreateTrustedSecurity"));
    PythonCommandDescMap.put("CreateVirtualHosts", Messages.getString("Message_CreateVirtualHosts"));
    
    //Docs Ext
    PythonCommandDescMap.put("RegisterDocsInNews", Messages.getString("Message_RegisterDocsInNews"));
    PythonCommandDescMap.put("ReviseLotusConnectionsConfig", Messages.getString("Message_ReviseLotusConnectionsConfig"));
    PythonCommandDescMap.put("InstallFiletype", Messages.getString("Message_InstallFiletype"));
    PythonCommandDescMap.put("StopServerCluster", Messages.getString("Message_StopServerCluster"));
    
    PythonCommandDescMap.put("CheckICRole", Messages.getString("Message_CheckICRole"));
    PythonCommandDescMap.put("InstallPlugin", Messages.getString("Message_InstallPlugin"));
    PythonCommandDescMap.put("InstallDocsDaemon", Messages.getString("Message_InstallDocsDaemon"));
    PythonCommandDescMap.put("StartServerCluster", Messages.getString("Message_StartServerCluster"));
    
    //Viewer Ext
    PythonCommandDescMap.put("InstallViewerDaemon", Messages.getString("Message_InstallViewerDaemon"));
  }
  
  //For uninstall
  static
  {        
    //Docs
    UninstallPythonCommandDescMap.put("CollectClusterInfo", Messages.getString("Message_CollectClusterInfo"));
    UninstallPythonCommandDescMap.put("Message_CollectWebserverInfo", Messages.getString("Message_CollectClusterInfo"));
    UninstallPythonCommandDescMap.put("InitialWasData", Messages.getString("Message_InitialWasData"));
    UninstallPythonCommandDescMap.put("StopServer", Messages.getString("Message_StopServer"));
    UninstallPythonCommandDescMap.put("SyncNodes", Messages.getString("Message_SyncNodes"));
    UninstallPythonCommandDescMap.put("InstallSpellCheckBundle", Messages.getString("Message_Uninstall_InstallSpellCheckBundle"));
    UninstallPythonCommandDescMap.put("InstallSpreadsheetNodeJS", Messages.getString("Message_Uninstall_InstallSpreadsheetNodeJS"));
    UninstallPythonCommandDescMap.put("StartServerBase", Messages.getString("Message_StartServerBase"));
    UninstallPythonCommandDescMap.put("InstallConfigJson", Messages.getString("Message_Uninstall_InstallConfigJson"));
    UninstallPythonCommandDescMap.put("SetVariables", Messages.getString("Message_Uninstall_SetVariables"));
    UninstallPythonCommandDescMap.put("TuneJVM", Messages.getString("Message_Uninstall_TuneJVM"));
    UninstallPythonCommandDescMap.put("CreateJVMProperty", Messages.getString("Message_Uninstall_CreateJVMProperty"));
    UninstallPythonCommandDescMap.put("DisableSessionSecurity", Messages.getString("Message_Uninstall_DisableSessionSecurity"));
    UninstallPythonCommandDescMap.put("AddWorkManager", Messages.getString("Message_Uninstall_AddWorkManager"));
    UninstallPythonCommandDescMap.put("SetupJDBCJAAS", Messages.getString("Message_Uninstall_SetupJDBCJAAS"));
    UninstallPythonCommandDescMap.put("SetupJDBCProvider", Messages.getString("Message_Uninstall_SetupJDBCProvider"));
    
    UninstallPythonCommandDescMap.put("SetupDataSource", Messages.getString("Message_Uninstall_SetupDataSource"));
    UninstallPythonCommandDescMap.put("AddScheduler", Messages.getString("Message_Uninstall_AddScheduler"));
    UninstallPythonCommandDescMap.put("TuneTransactionConfig", Messages.getString("Message_Uninstall_TuneTransactionConfig"));
    UninstallPythonCommandDescMap.put("EnsureCompatibleSharedLib", Messages.getString("Message_EnsureCompatibleSharedLib"));
    UninstallPythonCommandDescMap.put("AddObjectCache", Messages.getString("Message_Uninstall_AddObjectCache"));
    UninstallPythonCommandDescMap.put("InstallEar", Messages.getString("Message_Uninstall_InstallEar"));
    UninstallPythonCommandDescMap.put("mapSecurityRole", Messages.getString("Message_Uninstall_mapSecurityRole"));
    UninstallPythonCommandDescMap.put("AddBus", Messages.getString("Message_Uninstall_AddBus"));
    UninstallPythonCommandDescMap.put("CreateFactory", Messages.getString("Message_Uninstall_CreateFactory"));
    
    UninstallPythonCommandDescMap.put("AddDestination", Messages.getString("Message_Uninstall_AddDestination"));
    UninstallPythonCommandDescMap.put("CreateTopic", Messages.getString("Message_Uninstall_CreateTopic"));
    UninstallPythonCommandDescMap.put("AddActivation", Messages.getString("Message_Uninstall_AddActivation"));
    UninstallPythonCommandDescMap.put("TuneLOG", Messages.getString("Message_Uninstall_TuneLOG"));
    UninstallPythonCommandDescMap.put("SetupDocsAdminJ2CAlias", Messages.getString("Message_Uninstall_SetupDocsAdminJ2CAlias"));
    UninstallPythonCommandDescMap.put("StopServerBase", Messages.getString("Message_StopServerBase"));
    
    UninstallPythonCommandDescMap.put("JobManagerAdapter", Messages.getString("Message_Uninstall_JobManagerAdapter"));
    UninstallPythonCommandDescMap.put("AddVersionInfo", Messages.getString("Message_Uninstall_AddVersionInfo"));
    UninstallPythonCommandDescMap.put("CreateUninstaller", Messages.getString("Message_Uninstall_CreateUninstaller"));
    UninstallPythonCommandDescMap.put("AddTag", Messages.getString("Message_Uninstall_AddTag"));
    UninstallPythonCommandDescMap.put("Map2WebServer", Messages.getString("Message_Uninstall_Map2WebServer"));
    UninstallPythonCommandDescMap.put("MapProxy2WebServer", Messages.getString("Message_Uninstall_MapProxy2WebServer"));
    UninstallPythonCommandDescMap.put("StartServer", Messages.getString("Message_StartServer"));
    UninstallPythonCommandDescMap.put("StopNode", Messages.getString("Message_StopNode"));
    UninstallPythonCommandDescMap.put("InstallRTC4WebBundle", Messages.getString("Message_Uninstall_InstallRTC4WebBundle"));
    UninstallPythonCommandDescMap.put("StartNode", Messages.getString("Message_StartNode"));
    UninstallPythonCommandDescMap.put("StopServerBase", Messages.getString("Message_StopServerBase"));
    
    //Conversion
    UninstallPythonCommandDescMap.put("InstallStellent", Messages.getString("Message_Uninstall_InstallStellent"));
    UninstallPythonCommandDescMap.put("InstallOSGIBundle", Messages.getString("Message_Uninstall_InstallOSGIBundle"));
    UninstallPythonCommandDescMap.put("InstallNativeFiles", Messages.getString("Message_Uninstall_InstallNativeFiles"));
    
    //Viewer
    UninstallPythonCommandDescMap.put("SetupViewerAdminJ2CAlias", Messages.getString("Message_Uninstall_SetupViewerAdminJ2CAlias"));
    UninstallPythonCommandDescMap.put("AddImagePng", Messages.getString("Message_Uninstall_AddImagePng"));
    UninstallPythonCommandDescMap.put("RegisterNFS", Messages.getString("Message_Uninstall_RegisterNFS"));
    UninstallPythonCommandDescMap.put("CreateSharedLib", Messages.getString("Message_Uninstall_CreateSharedLib"));
    UninstallPythonCommandDescMap.put("AssociateSharedLib", Messages.getString("Message_Uninstall_AssociateSharedLib"));
    UninstallPythonCommandDescMap.put("AddTimerManager", Messages.getString("Message_Uninstall_AddTimerManager"));
    
    //Docs Proxy
    UninstallPythonCommandDescMap.put("InstallProxyFilter", Messages.getString("Message_Uninstall_InstallProxyFilter"));
    UninstallPythonCommandDescMap.put("CreateCompressAction", Messages.getString("Message_Uninstall_CreateCompressAction"));
    UninstallPythonCommandDescMap.put("CreateProxyTuning", Messages.getString("Message_Uninstall_CreateProxyTuning"));
    UninstallPythonCommandDescMap.put("CreateTrustedSecurity", Messages.getString("Message_Uninstall_CreateTrustedSecurity"));
    UninstallPythonCommandDescMap.put("CreateVirtualHosts", Messages.getString("Message_Uninstall_CreateVirtualHosts"));
    
    //Docs Ext
    UninstallPythonCommandDescMap.put("RegisterDocsInNews", Messages.getString("Message_Uninstall_RegisterDocsInNews"));
    UninstallPythonCommandDescMap.put("ReviseLotusConnectionsConfig", Messages.getString("Message_Uninstall_ReviseLotusConnectionsConfig"));
    UninstallPythonCommandDescMap.put("InstallFiletype", Messages.getString("Message_Uninstall_InstallFiletype"));
    UninstallPythonCommandDescMap.put("StopServerCluster", Messages.getString("Message_StopServerCluster"));
    
    UninstallPythonCommandDescMap.put("CheckICRole", Messages.getString("Message_Uninstall_CheckICRole"));
    UninstallPythonCommandDescMap.put("InstallPlugin", Messages.getString("Message_Uninstall_InstallPlugin"));
    UninstallPythonCommandDescMap.put("InstallDocsDaemon", Messages.getString("Message_Uninstall_InstallDocsDaemon"));
    UninstallPythonCommandDescMap.put("StartServerCluster", Messages.getString("Message_StartServerCluster"));
    
    //Viewer Ext
    UninstallPythonCommandDescMap.put("InstallViewerDaemon", Messages.getString("Message_Uninstall_InstallViewerDaemon"));
  }

  //For rollback
  static
  {        
    //Docs
    RollbackPythonCommandDescMap.put("CollectClusterInfo", Messages.getString("Message_CollectClusterInfo"));
    RollbackPythonCommandDescMap.put("Message_CollectWebserverInfo", Messages.getString("Message_CollectClusterInfo"));
    RollbackPythonCommandDescMap.put("InitialWasData", Messages.getString("Message_InitialWasData"));
    RollbackPythonCommandDescMap.put("StopServer", Messages.getString("Message_StopServer"));
    RollbackPythonCommandDescMap.put("SyncNodes", Messages.getString("Message_SyncNodes"));
    RollbackPythonCommandDescMap.put("InstallSpellCheckBundle", Messages.getString("Message_Rollback_InstallSpellCheckBundle"));
    RollbackPythonCommandDescMap.put("InstallSpreadsheetNodeJS", Messages.getString("Message_Rollback_InstallSpreadsheetNodeJS"));
    RollbackPythonCommandDescMap.put("StartServerBase", Messages.getString("Message_StartServerBase"));
    RollbackPythonCommandDescMap.put("InstallConfigJson", Messages.getString("Message_Rollback_InstallConfigJson"));
    RollbackPythonCommandDescMap.put("SetVariables", Messages.getString("Message_Rollback_SetVariables"));
    RollbackPythonCommandDescMap.put("TuneJVM", Messages.getString("Message_Rollback_TuneJVM"));
    RollbackPythonCommandDescMap.put("CreateJVMProperty", Messages.getString("Message_Rollback_CreateJVMProperty"));
    RollbackPythonCommandDescMap.put("DisableSessionSecurity", Messages.getString("Message_Rollback_DisableSessionSecurity"));
    RollbackPythonCommandDescMap.put("AddWorkManager", Messages.getString("Message_Rollback_AddWorkManager"));
    RollbackPythonCommandDescMap.put("SetupJDBCJAAS", Messages.getString("Message_Rollback_SetupJDBCJAAS"));
    RollbackPythonCommandDescMap.put("SetupJDBCProvider", Messages.getString("Message_Rollback_SetupJDBCProvider"));
    
    RollbackPythonCommandDescMap.put("SetupDataSource", Messages.getString("Message_Rollback_SetupDataSource"));
    RollbackPythonCommandDescMap.put("AddScheduler", Messages.getString("Message_Rollback_AddScheduler"));
    RollbackPythonCommandDescMap.put("TuneTransactionConfig", Messages.getString("Message_Rollback_TuneTransactionConfig"));
    RollbackPythonCommandDescMap.put("EnsureCompatibleSharedLib", Messages.getString("Message_EnsureCompatibleSharedLib"));
    RollbackPythonCommandDescMap.put("AddObjectCache", Messages.getString("Message_Rollback_AddObjectCache"));
    RollbackPythonCommandDescMap.put("InstallEar", Messages.getString("Message_Rollback_InstallEar"));
    RollbackPythonCommandDescMap.put("mapSecurityRole", Messages.getString("Message_Rollback_mapSecurityRole"));
    RollbackPythonCommandDescMap.put("AddBus", Messages.getString("Message_Rollback_AddBus"));
    RollbackPythonCommandDescMap.put("CreateFactory", Messages.getString("Message_Rollback_CreateFactory"));
    
    RollbackPythonCommandDescMap.put("AddDestination", Messages.getString("Message_Rollback_AddDestination"));
    RollbackPythonCommandDescMap.put("CreateTopic", Messages.getString("Message_Rollback_CreateTopic"));
    RollbackPythonCommandDescMap.put("AddActivation", Messages.getString("Message_Rollback_AddActivation"));
    RollbackPythonCommandDescMap.put("TuneLOG", Messages.getString("Message_Rollback_TuneLOG"));
    RollbackPythonCommandDescMap.put("SetupDocsAdminJ2CAlias", Messages.getString("Message_Rollback_SetupDocsAdminJ2CAlias"));
    RollbackPythonCommandDescMap.put("StopServerBase", Messages.getString("Message_StopServerBase"));
    
    RollbackPythonCommandDescMap.put("JobManagerAdapter", Messages.getString("Message_Rollback_JobManagerAdapter"));
    RollbackPythonCommandDescMap.put("AddVersionInfo", Messages.getString("Message_Rollback_AddVersionInfo"));
    RollbackPythonCommandDescMap.put("CreateUninstaller", Messages.getString("Message_Rollback_CreateUninstaller"));
    RollbackPythonCommandDescMap.put("AddTag", Messages.getString("Message_Rollback_AddTag"));
    RollbackPythonCommandDescMap.put("Map2WebServer", Messages.getString("Message_Rollback_Map2WebServer"));
    RollbackPythonCommandDescMap.put("MapProxy2WebServer", Messages.getString("Message_Rollback_MapProxy2WebServer"));
    RollbackPythonCommandDescMap.put("StartServer", Messages.getString("Message_StartServer"));
    RollbackPythonCommandDescMap.put("StopNode", Messages.getString("Message_StopNode"));
    RollbackPythonCommandDescMap.put("InstallRTC4WebBundle", Messages.getString("Message_Rollback_InstallRTC4WebBundle"));
    RollbackPythonCommandDescMap.put("StartNode", Messages.getString("Message_StartNode"));
    RollbackPythonCommandDescMap.put("StopServerBase", Messages.getString("Message_StopServerBase"));
    
    //Conversion
    RollbackPythonCommandDescMap.put("InstallStellent", Messages.getString("Message_Rollback_InstallStellent"));
    RollbackPythonCommandDescMap.put("InstallOSGIBundle", Messages.getString("Message_Rollback_InstallOSGIBundle"));
    RollbackPythonCommandDescMap.put("InstallNativeFiles", Messages.getString("Message_Rollback_InstallNativeFiles"));
    
    //Viewer
    RollbackPythonCommandDescMap.put("SetupViewerAdminJ2CAlias", Messages.getString("Message_Rollback_SetupViewerAdminJ2CAlias"));
    RollbackPythonCommandDescMap.put("AddImagePng", Messages.getString("Message_Rollback_AddImagePng"));
    RollbackPythonCommandDescMap.put("RegisterNFS", Messages.getString("Message_Rollback_RegisterNFS"));
    RollbackPythonCommandDescMap.put("CreateSharedLib", Messages.getString("Message_Rollback_CreateSharedLib"));
    RollbackPythonCommandDescMap.put("AssociateSharedLib", Messages.getString("Message_Rollback_AssociateSharedLib"));
    RollbackPythonCommandDescMap.put("AddTimerManager", Messages.getString("Message_Rollback_AddTimerManager"));
    
    //Docs Proxy
    RollbackPythonCommandDescMap.put("InstallProxyFilter", Messages.getString("Message_Rollback_InstallProxyFilter"));
    RollbackPythonCommandDescMap.put("CreateCompressAction", Messages.getString("Message_Rollback_CreateCompressAction"));
    RollbackPythonCommandDescMap.put("CreateProxyTuning", Messages.getString("Message_Rollback_CreateProxyTuning"));
    RollbackPythonCommandDescMap.put("CreateTrustedSecurity", Messages.getString("Message_Rollback_CreateTrustedSecurity"));
    RollbackPythonCommandDescMap.put("CreateVirtualHosts", Messages.getString("Message_Rollback_CreateVirtualHosts"));
    
    //Docs Ext
    RollbackPythonCommandDescMap.put("RegisterDocsInNews", Messages.getString("Message_Rollback_RegisterDocsInNews"));
    RollbackPythonCommandDescMap.put("ReviseLotusConnectionsConfig", Messages.getString("Message_Rollback_ReviseLotusConnectionsConfig"));
    RollbackPythonCommandDescMap.put("InstallFiletype", Messages.getString("Message_Rollback_InstallFiletype"));
    RollbackPythonCommandDescMap.put("StopServerCluster", Messages.getString("Message_StopServerCluster"));
    
    RollbackPythonCommandDescMap.put("CheckICRole", Messages.getString("Message_Rollback_CheckICRole"));
    RollbackPythonCommandDescMap.put("InstallPlugin", Messages.getString("Message_Rollback_InstallPlugin"));
    RollbackPythonCommandDescMap.put("InstallDocsDaemon", Messages.getString("Message_Rollback_InstallDocsDaemon"));
    RollbackPythonCommandDescMap.put("StartServerCluster", Messages.getString("Message_StartServerCluster"));
    
    //Viewer Ext
    RollbackPythonCommandDescMap.put("InstallViewerDaemon", Messages.getString("Message_Rollback_InstallViewerDaemon"));
  }
  
  //For upgrade
  static
  {        
    //Docs
    UpgradePythonCommandDescMap.put("CollectClusterInfo", Messages.getString("Message_CollectClusterInfo"));
    UpgradePythonCommandDescMap.put("Message_CollectWebserverInfo", Messages.getString("Message_CollectClusterInfo"));
    UpgradePythonCommandDescMap.put("InitialWasData", Messages.getString("Message_InitialWasData"));
    UpgradePythonCommandDescMap.put("StopServer", Messages.getString("Message_StopServer"));
    UpgradePythonCommandDescMap.put("SyncNodes", Messages.getString("Message_SyncNodes"));
    UpgradePythonCommandDescMap.put("InstallSpellCheckBundle", Messages.getString("Message_Upgrade_InstallSpellCheckBundle"));
    UpgradePythonCommandDescMap.put("InstallSpreadsheetNodeJS", Messages.getString("Message_Upgrade_InstallSpreadsheetNodeJS"));
    UpgradePythonCommandDescMap.put("StartServerBase", Messages.getString("Message_StartServerBase"));
    UpgradePythonCommandDescMap.put("InstallConfigJson", Messages.getString("Message_Upgrade_InstallConfigJson"));
    UpgradePythonCommandDescMap.put("SetVariables", Messages.getString("Message_Upgrade_SetVariables"));
    UpgradePythonCommandDescMap.put("TuneJVM", Messages.getString("Message_Upgrade_TuneJVM"));
    UpgradePythonCommandDescMap.put("CreateJVMProperty", Messages.getString("Message_Upgrade_CreateJVMProperty"));
    UpgradePythonCommandDescMap.put("DisableSessionSecurity", Messages.getString("Message_Upgrade_DisableSessionSecurity"));
    UpgradePythonCommandDescMap.put("AddWorkManager", Messages.getString("Message_Upgrade_AddWorkManager"));
    UpgradePythonCommandDescMap.put("SetupJDBCJAAS", Messages.getString("Message_Upgrade_SetupJDBCJAAS"));
    UpgradePythonCommandDescMap.put("SetupJDBCProvider", Messages.getString("Message_Upgrade_SetupJDBCProvider"));
    
    UpgradePythonCommandDescMap.put("SetupDataSource", Messages.getString("Message_Upgrade_SetupDataSource"));
    UpgradePythonCommandDescMap.put("AddScheduler", Messages.getString("Message_Upgrade_AddScheduler"));
    UpgradePythonCommandDescMap.put("TuneTransactionConfig", Messages.getString("Message_Upgrade_TuneTransactionConfig"));
    UpgradePythonCommandDescMap.put("EnsureCompatibleSharedLib", Messages.getString("Message_EnsureCompatibleSharedLib"));
    UpgradePythonCommandDescMap.put("AddObjectCache", Messages.getString("Message_Upgrade_AddObjectCache"));
    UpgradePythonCommandDescMap.put("InstallEar", Messages.getString("Message_Upgrade_InstallEar"));
    UpgradePythonCommandDescMap.put("mapSecurityRole", Messages.getString("Message_Upgrade_mapSecurityRole"));
    UpgradePythonCommandDescMap.put("AddBus", Messages.getString("Message_Upgrade_AddBus"));
    UpgradePythonCommandDescMap.put("CreateFactory", Messages.getString("Message_Upgrade_CreateFactory"));
    
    UpgradePythonCommandDescMap.put("AddDestination", Messages.getString("Message_Upgrade_AddDestination"));
    UpgradePythonCommandDescMap.put("CreateTopic", Messages.getString("Message_Upgrade_CreateTopic"));
    UpgradePythonCommandDescMap.put("AddActivation", Messages.getString("Message_Upgrade_AddActivation"));
    UpgradePythonCommandDescMap.put("TuneLOG", Messages.getString("Message_Upgrade_TuneLOG"));
    UpgradePythonCommandDescMap.put("SetupDocsAdminJ2CAlias", Messages.getString("Message_Upgrade_SetupDocsAdminJ2CAlias"));
    UpgradePythonCommandDescMap.put("StopServerBase", Messages.getString("Message_StopServerBase"));
    
    UpgradePythonCommandDescMap.put("JobManagerAdapter", Messages.getString("Message_Upgrade_JobManagerAdapter"));
    UpgradePythonCommandDescMap.put("AddVersionInfo", Messages.getString("Message_Upgrade_AddVersionInfo"));
    UpgradePythonCommandDescMap.put("CreateUninstaller", Messages.getString("Message_Upgrade_CreateUninstaller"));
    UpgradePythonCommandDescMap.put("AddTag", Messages.getString("Message_Upgrade_AddTag"));
    UpgradePythonCommandDescMap.put("Map2WebServer", Messages.getString("Message_Upgrade_Map2WebServer"));
    UpgradePythonCommandDescMap.put("MapProxy2WebServer", Messages.getString("Message_Upgrade_MapProxy2WebServer"));
    UpgradePythonCommandDescMap.put("StartServer", Messages.getString("Message_StartServer"));
    UpgradePythonCommandDescMap.put("StopNode", Messages.getString("Message_StopNode"));
    UpgradePythonCommandDescMap.put("InstallRTC4WebBundle", Messages.getString("Message_Upgrade_InstallRTC4WebBundle"));
    UpgradePythonCommandDescMap.put("StartNode", Messages.getString("Message_StartNode"));
    UpgradePythonCommandDescMap.put("StopServerBase", Messages.getString("Message_StopServerBase"));
    
    //Conversion
    UpgradePythonCommandDescMap.put("InstallStellent", Messages.getString("Message_Upgrade_InstallStellent"));
    UpgradePythonCommandDescMap.put("InstallOSGIBundle", Messages.getString("Message_Upgrade_InstallOSGIBundle"));
    UpgradePythonCommandDescMap.put("InstallNativeFiles", Messages.getString("Message_Upgrade_InstallNativeFiles"));
    
    //Viewer
    UpgradePythonCommandDescMap.put("SetupViewerAdminJ2CAlias", Messages.getString("Message_Upgrade_SetupViewerAdminJ2CAlias"));
    UpgradePythonCommandDescMap.put("AddImagePng", Messages.getString("Message_Upgrade_AddImagePng"));
    UpgradePythonCommandDescMap.put("RegisterNFS", Messages.getString("Message_Upgrade_RegisterNFS"));
    UpgradePythonCommandDescMap.put("CreateSharedLib", Messages.getString("Message_Upgrade_CreateSharedLib"));
    UpgradePythonCommandDescMap.put("AssociateSharedLib", Messages.getString("Message_Upgrade_AssociateSharedLib"));
    UpgradePythonCommandDescMap.put("AddTimerManager", Messages.getString("Message_Upgrade_AddTimerManager"));
    
    //Docs Proxy
    UpgradePythonCommandDescMap.put("InstallProxyFilter", Messages.getString("Message_Upgrade_InstallProxyFilter"));
    UpgradePythonCommandDescMap.put("CreateCompressAction", Messages.getString("Message_Upgrade_CreateCompressAction"));
    UpgradePythonCommandDescMap.put("CreateProxyTuning", Messages.getString("Message_Upgrade_CreateProxyTuning"));
    UpgradePythonCommandDescMap.put("CreateTrustedSecurity", Messages.getString("Message_Upgrade_CreateTrustedSecurity"));
    UpgradePythonCommandDescMap.put("CreateVirtualHosts", Messages.getString("Message_Upgrade_CreateVirtualHosts"));
    
    //Docs Ext
    UpgradePythonCommandDescMap.put("RegisterDocsInNews", Messages.getString("Message_Upgrade_RegisterDocsInNews"));
    UpgradePythonCommandDescMap.put("ReviseLotusConnectionsConfig", Messages.getString("Message_Upgrade_ReviseLotusConnectionsConfig"));
    UpgradePythonCommandDescMap.put("InstallFiletype", Messages.getString("Message_Upgrade_InstallFiletype"));
    UpgradePythonCommandDescMap.put("StopServerCluster", Messages.getString("Message_StopServerCluster"));
    
    UpgradePythonCommandDescMap.put("CheckICRole", Messages.getString("Message_Upgrade_CheckICRole"));
    UpgradePythonCommandDescMap.put("InstallPlugin", Messages.getString("Message_Upgrade_InstallPlugin"));
    UpgradePythonCommandDescMap.put("InstallDocsDaemon", Messages.getString("Message_Upgrade_InstallDocsDaemon"));
    UpgradePythonCommandDescMap.put("StartServerCluster", Messages.getString("Message_StartServerCluster"));
    
    //Viewer Ext
    UpgradePythonCommandDescMap.put("InstallViewerDaemon", Messages.getString("Message_Upgrade_InstallViewerDaemon"));
  }
  
  private MsgMap()
  {
  }
  
  public static String getCMDMsg(String cmd, String deployType, String callFrom)
  {
    if (cmd==null || deployType==null)
      return null;
    
    String msg = null; 
    if (callFrom.equalsIgnoreCase("uninstall"))
    {
      msg = UninstallPythonCommandDescMap.get(cmd);
    }
    else
    {
      if (deployType.endsWith(Constants.IM_DEPLOYMENT_TYPE_INSTALL))
        msg = PythonCommandDescMap.get(cmd);
      else if (deployType.endsWith(Constants.IM_DEPLOYMENT_TYPE_UPDATE))
        msg = UpgradePythonCommandDescMap.get(cmd);
      else if (deployType.endsWith(Constants.IM_DEPLOYMENT_TYPE_ROLLBACK))
        msg = RollbackPythonCommandDescMap.get(cmd);
      else
        msg = PythonCommandDescMap.get(cmd);
    }

    if (msg!=null)
      return msg;
    else      
      return "";
  }
  
}
