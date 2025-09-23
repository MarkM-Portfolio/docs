# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2015. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 
import re

def mapSecurityRole(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  app_name, role_name, user_name = args
  
  result = AdminApp.view(app_name, ["-MapRolesToUsers"])
  result = result.split('\n')
  
  mapped_users = None
  check_on = 0
  for line in result:
    line = line.strip()
    if line == ''.join(['Role:  ',role_name]):
      check_on = 1
    if check_on == 1:
      if re.search("Mapped users", line):
        mapped_users = line.split(':')[1].strip()
        break

  if not mapped_users:
    mapped_users = []
  else:
    mapped_users = mapped_users.split('|')
  
  print "mapped_users: "
  print mapped_users
    
  if user_name not in mapped_users:
      mapped_users.append(user_name)
  
  users = '|'.join(mapped_users)
  
  print "users:"
  print users
  
  wsadminlib.setCustomSecurityRolesandMap(app_name, role_name, users)
    
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  app_name, role_name, user_name
  """
  if len(sys.argv) < 3:
    print ">>> Errors for arguments number passed to TASK map_security_role"
    sys.exit()
  mapSecurityRole(sys.argv)
  