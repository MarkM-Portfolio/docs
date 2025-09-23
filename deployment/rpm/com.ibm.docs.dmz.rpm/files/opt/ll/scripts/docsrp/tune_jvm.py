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



def tuneJVM(args):
  import wsadminlib
 
  wsadminlib.enableDebugMessages()

  nodeName, serverName = args[0:2]
  settings = args[2:]

  for setting in settings :
    propertyName,value = setting.split("=",1)
    wsadminlib.setJvmProperty(nodeName,serverName,propertyName,value)
  
  wsadminlib.save()


if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  nodeName,serverName,propertyName=value 
  """
  if len(sys.argv) < 3:
    print ">>> Errors for arguments number passed to TASK tuneJVM"
    sys.exit()
  tuneJVM(sys.argv)
  
