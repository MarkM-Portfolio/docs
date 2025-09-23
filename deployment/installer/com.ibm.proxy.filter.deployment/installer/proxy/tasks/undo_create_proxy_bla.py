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

def _remove_bla(bla_name, asset_name):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  blas = AdminTask.listBLAs('[-blaID "WebSphere:blaname=%s"]' %(bla_name)) 
  if len(blas) > 0:
    #AdminTask.stopBLA('[-blaID "WebSphere:blaname=%s"]' %(bla_name))
    AdminTask.deleteCompUnit('[-blaID "WebSphere:blaname=%s" -cuID WebSphere:cuname=%s ]' %(bla_name, asset_name))
    AdminTask.deleteBLA('[-blaID "WebSphere:blaname=%s" ]' %(bla_name))
    AdminTask.deleteAsset('[-assetID WebSphere:assetname=%s ]' %(asset_name))
    wsadminlib.save()

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 2:
    print("Errors for arguments number passed to TASK undo_create_proxy_bla.py")
    sys.exit()
  bla_name, asset_name = sys.argv
  _remove_bla(bla_name, asset_name)