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

def getTransactionConfig(args):
  from util import wsadminlib

  wsadminlib.enableDebugMessages()

  scope_name,node_name,server_name = args
  service_name = 'TransactionService'
                  
  return_value = {}
  if scope_name.lower() == 'server':
    server_id = wsadminlib.getServerId(node_name, server_name)
    transaction_id = AdminConfig.list(service_name, server_id)
    settings = AdminConfig.show(transaction_id).splitlines()
    settings.extend (["[node_name %s]"% (node_name)])
    return_value[server_name] = settings
  elif scope_name.lower() == 'cluster':
    server_list = wsadminlib.getServerIDsForClusters([node_name])#cluster_name
    for server_id, server_node_name, server_name in server_list:
      transaction_id = AdminConfig.list(service_name, server_id)
      settings = AdminConfig.show(transaction_id).splitlines()
      settings.extend(["[node_name %s]"% (node_name)])
      return_value[server_name] = settings
  else:
    raise Exception('invalid scope type when getTransactionConfig')

  print "Transaction service settings:", return_value

if __name__ == "__main__":
  import sys

  if len(sys.argv) < 3:
    print '>>> Errors for aruguments number passed to TASK TuneTransactionConfig'
    sys.exit()

  getTransactionConfig(sys.argv)

