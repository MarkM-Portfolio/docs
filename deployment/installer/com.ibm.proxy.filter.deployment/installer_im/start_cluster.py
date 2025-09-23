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

def start_cluster_action(args):
  enableDebugMessages()
  
  cluster_name = args[0]
  
  startCluster(cluster_name)
  
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
    sop("start cluster:", "Errors for arguments number passed to TASK start_cluster.py")
    sys.exit(1)
  start_cluster_action(sys.argv)