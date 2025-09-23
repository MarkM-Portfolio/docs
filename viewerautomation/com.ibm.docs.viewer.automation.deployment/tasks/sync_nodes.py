# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

# -*- encoding: utf8 -*-

def sync_it():
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  if not wsadminlib.isND():
    return

  wsadminlib.syncall()

if __name__ == "__main__":
  import sys
  sync_it()
