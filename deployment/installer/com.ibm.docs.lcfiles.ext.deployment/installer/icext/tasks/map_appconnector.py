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
import re

def map_it(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()


  result = AdminTask.getAuthDataEntry(['-alias', 'connectionsAdmin'])
  m = re.search("\[userId [^\]]+\]", result)
  if not m:
    return
  
  result = m.group(0).replace('[', '').replace(']', '')
  connectionsAdmin_user = result.split()[1]


  result = AdminApp.view("Files", ["-MapRolesToUsers"])
  result = result.split('\n')
  
  mapped_users = None
  check_on = 0
  for line in result:
    line = line.strip()
    if line == 'Role:  app-connector':
      check_on = 1
    if check_on == 1:
      if re.search("Mapped users", line):
        mapped_users = line.split(':')[1].strip()
        break

  if not mapped_users:
    mapped_users = []
  else:
    mapped_users = mapped_users.split('|')

  if args[0] == "map":
    if connectionsAdmin_user not in mapped_users:
      mapped_users.append(connectionsAdmin_user)
      AdminApp.edit("Files", ["-MapRolesToUsers", [["app-connector", "No", "No", '|'.join(mapped_users), ""]]] )
  else:
    if connectionsAdmin_user in mapped_users:
      mapped_users.remove(connectionsAdmin_user)
      AdminApp.edit("Files", ["-MapRolesToUsers", [["app-connector", "No", "No", '|'.join(mapped_users), ""]]] )


  wsadminlib.save()

  print "app-connector mapped successfully"

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  map/unmap
  """
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK map_appconnector.py"
    sys.exit()
  map_it(sys.argv)
