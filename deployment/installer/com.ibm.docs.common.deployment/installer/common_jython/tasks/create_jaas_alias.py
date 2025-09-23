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

def createJAAS(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  user_id, user_pw, jaas_alias, alias_desc = args


  #--------------------------------------------------------------
  #Creating a J2C authentication entry 
  #--------------------------------------------------------------
  wsadminlib.createJAAS(jaas_alias, user_id, user_pw, alias_desc)

  wsadminlib.save()

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 4:
    print "Exeception: Invalid arguments"
    sys.exit()
  createJAAS(sys.argv)
