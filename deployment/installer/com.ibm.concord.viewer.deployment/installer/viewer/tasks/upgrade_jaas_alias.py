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

def upgradeJAAS(args):
  # Only DB2 upgrade supported so far
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  user_id, user_pw, jaas_alias, alias_desc = args

  #--------------------------------------------------------------
  #Upgrade an exixting J2C authentication entry 
  #--------------------------------------------------------------
  attrs = []
  attrs.extend(['-alias', jaas_alias])
  attrs.extend(['-user', user_id])
  attrs.extend(['-password', user_pw])
  attrs.extend(['-description', alias_desc])
  AdminTask.modifyAuthDataEntry(attrs)

  wsadminlib.save()

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 4:
    print "Exeception: Invalid arguments"
    sys.exit()
  upgradeJAAS(sys.argv)
