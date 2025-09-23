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

def _create_bla(jar_path, bla_name, asset_name, scope_name):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  AdminTask.importAsset('[-storageType FULL -source %s -AssetOptions [[%s %s "" "IBM Docs Proxy filter" "" "" "" .*\.dll=755#.*\.so=755#.*\.a=755#.*\.sl=755 true]]]' %\
  (jar_path, asset_name, asset_name)) 
  AdminTask.createEmptyBLA('[-name "%s" -description "This application is used to deployed IBM Docs Proxy Filter." ]' %(bla_name)) 
  AdminTask.addCompUnit('[-blaID "WebSphere:blaname=%s" -cuSourceID WebSphere:assetname=%s -CUOptions [["WebSphere:blaname=%s" WebSphere:assetname=%s %s "" 1 true DEFAULT]] -MapTargets [[default WebSphere:%s]]]' %\
  (bla_name, asset_name, bla_name, asset_name, asset_name, scope_name))
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 4:
    print("Errors for arguments number passed to TASK create_proxy_bla.py")
    sys.exit()
  jar_path, bla_name, asset_name, scope_name = sys.argv
  _create_bla(jar_path, bla_name, asset_name, scope_name)