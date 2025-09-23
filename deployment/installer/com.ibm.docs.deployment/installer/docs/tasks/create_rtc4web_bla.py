# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 

def _create_bla(jar_path, bla_name, asset_name, dest_asset_file, scope_name):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()  
  
  #assetRet = AdminTask.importAsset('[-storageType FULL -source %s -AssetOptions [[%s %s "" "IBM Docs RTC4Web" "" "" "" .*\.dll=755#.*\.so=755#.*\.a=755#.*\.sl=755 true]]]' %\
  #(jar_path, asset_name, asset_name)) 
  assetRet = AdminTask.importAsset('[-storageType FULL -source %s -AssetOptions [[%s %s "" "IBM Docs RTC4Web" "%s" "" "" .*\.dll=755#.*\.so=755#.*\.a=755#.*\.sl=755 true]]]' %\
  (jar_path, asset_name, asset_name,dest_asset_file))
  blaRet = AdminTask.createEmptyBLA('[-name "%s" -description "This application is used to deployed IBM Docs." ]' %(bla_name)) 
  compRet = AdminTask.addCompUnit('[-blaID "WebSphere:blaname=%s" -cuSourceID WebSphere:assetname=%s -CUOptions [["WebSphere:blaname=%s" WebSphere:assetname=%s %s "" 1 true DEFAULT]] -MapTargets [[default WebSphere:%s]]]' %\
  (bla_name, asset_name, bla_name, asset_name, asset_name, scope_name))  
  wsadminlib.save()
    
  if assetRet and blaRet and compRet:
    print "RTC4Web Bla created successfully"

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 4:
    print "Errors for arguments number passed to TASK create_rtc4web_bla.py"
    sys.exit()
  jar_path, bla_name, asset_name, dest_asset_file, scope_name = sys.argv
  _create_bla(jar_path, bla_name, asset_name, dest_asset_file, scope_name)