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


def getWorkManager(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  #print ">>>>>>>>", str(args)
  cell_name = AdminControl.getCell()
    
  scope = "".join(["/Cell:", cell_name, args[0]])
  wmName = args[1]
  
  provider_id = AdminConfig.getid(scope + \
        'WorkManagerProvider:WorkManagerProvider/')
  workmanagers = AdminConfig.list('WorkManagerInfo', provider_id).splitlines()
  
  for w in workmanagers:
    if AdminConfig.showAttribute(w, 'name') == wmName:
      attr = AdminConfig.show(w).splitlines()
      print "workmanager attributes: ", attr
      return 
   
  print "No workmanager found" 
  

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  scope, wmName
  """
  if len(sys.argv) < 2:
    print "Errors for arguments number passed to TASK add_workmanager"
    sys.exit()
  getWorkManager(sys.argv)
