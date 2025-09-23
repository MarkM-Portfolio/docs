# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2013. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 


def mapSecurityRole(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  app_name = str(args[0])
  AdminApp.edit(app_name, '[ -MapRolesToUsers [[ LLSymphonyUser AppDeploymentOption.Yes AppDeploymentOption.No "" "" AppDeploymentOption.No "" "" ]]]' ) 
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  app_name
  """
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK map_security_role"
    sys.exit()
 	
  mapSecurityRole(sys.argv)
  