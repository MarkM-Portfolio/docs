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

def stop_cluster_action(args):
  enableDebugMessages()
  
  cluster_name = args[0]
  
  stopCluster(cluster_name)
  
  return None

if __name__ == "__main__":
  import sys
  """
    # required parameters
    # cluster_name
    #
    # node_name = 'docs_proxy_cluster'
  """
  if len(sys.argv) != 1:
    sop("stop cluster:", "Errors for arguments number passed to TASK stop_cluster.py")
    sys.exit(1)
  stop_cluster_action(sys.argv)