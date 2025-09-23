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

def undo_tuneTransactionConfig(args):
  from util import wsadminlib

  wsadminlib.enableDebugMessages()

  scope_name,node_name,server_name,setting = args
  service_name = 'TransactionService'

  if scope_name.lower() == 'server':
    server_id = wsadminlib.getServerId(node_name, server_name)
    transaction_id = AdminConfig.list(service_name, server_id)
    AdminConfig.modify(transaction_id, [setting])
  elif scope_name.lower() == 'cluster':
    server_list = wsadminlib.getServerIDsForClusters([node_name])#cluster_name
    for server_id, server_node_name, server_name in server_list:
      transaction_id = AdminConfig.list(service_name, server_id)
      AdminConfig.modify(transaction_id, [setting])
  else:
    raise Exception('invalid scope type when tuneTransactionConfig')

  

  wsadminlib.save()
if __name__ == "__main__":
  import sys

  if len(sys.argv) < 4:
    print '>>> Errors for aruguments number passed to TASK TuneTransactionConfig'
    sys.exit()

  undo_tuneTransactionConfig(sys.argv)


