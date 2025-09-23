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

execfile('./lib/wsadminlib.py')
execfile('./util/util.py')

def delete_compress_action(args):
  enableDebugMessages()
  
  node_name, server_name, pvh_name, pre_name, pca_name = args
  
  delete_compress(node_name, server_name, pvh_name, pre_name, pca_name)
  
  return None

if __name__ == "__main__":
  import sys
  """
    # required parameters
    # node_name, server_name, pvh_name, pre_name, pca_name
    #
    # node_name = 'localhostNode01'
    # server_name = 'proxy1' 
    # pvh_name = 'IBMDocs_ProxyVirtualHost_001'
    # pre_name = 'IBMDocs_ProxyRuleExpression_001'
    # pca_name = 'IBMDocs_HTTPResponseCompressionAction_001'
  """
  if len(sys.argv) != 5:
    sop("remove_compress_action:", "Errors for arguments number passed to TASK remove_compressaction.py")
    sys.exit(1)
  delete_compress_action(sys.argv)
