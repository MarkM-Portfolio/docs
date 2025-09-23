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


def delete_jdbc(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  jdbc_name = args[0]

  wsadminlib.removeJdbcProvidersByName(jdbc_name)

  wsadminlib.save()

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 1:
    print "Exception: Invalid arguments"
    sys.exit()
  delete_jdbc(sys.argv)
