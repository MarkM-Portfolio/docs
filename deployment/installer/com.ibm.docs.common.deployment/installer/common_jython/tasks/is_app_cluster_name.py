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
import os

def get(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()  
  cluster_name = args[0]
  result = []
  if wsadminlib.getServerClusterByName(cluster_name):
    result.append("True")
  else:
    result.append("False")

  print "is_app_cluster_name =",result 
  print "is app cluster name successfully!"

if __name__ == "__main__":  
  import sys
  """
    #  cluster name parameters     
  """ 
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK is_app_cluster_name"
    sys.exit()
  get(sys.argv)