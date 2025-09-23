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


def clearSecurityRoleMap(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  app_name, role_name = args
  AdminApp.edit(app_name, '[ -MapRolesToUsers [[ '+ role_name +' AppDeploymentOption.No AppDeploymentOption.No "" "" AppDeploymentOption.No "" "" ]]]' )
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  app_name, role_name, user_name
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK undo_map_security_role"
    sys.exit()
  clearSecurityRoleMap(sys.argv)
  