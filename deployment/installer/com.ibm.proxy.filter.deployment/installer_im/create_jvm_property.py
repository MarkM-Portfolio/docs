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

def create_jvm_prop(args):
  enableDebugMessages()
  
  node_names, server_names, pro_name, pro_value = args
  
  node_names = list(node_names.split(':'))
  server_names = list(server_names.split(':'))
  sop("create_jvm_prop:", node_names)
  sop("create_jvm_prop:", server_names)
  sop("create_jvm_prop:", pro_name)
  sop("create_jvm_prop:", pro_value)
  
  if len(node_names) == len(server_names):
    i = 0
    for node_name in node_names:
      sop("create_jvm_prop:", "Node:" + node_name + " Server:" + server_names[i] + " Key:" + pro_name + " Value:" + pro_value)
      createJvmProperty(node_name, server_names[i], pro_name, pro_value)
      save()
      i += 1
  else:
    sop("create_jvm_prop:", "The number of node name should match with the number of server name.")
    sys.exit(2)

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  node_names, server_names, pro_name, pro_value
  """
  if len(sys.argv) < 4:
    print ">>> Errors for arguments number passed to TASK create_jvm_property.py"
    sys.exit(1)
  create_jvm_prop(sys.argv)
