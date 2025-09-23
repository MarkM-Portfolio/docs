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

from common_jython.utils.jython_script_helper import *

def do(argv):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  job_manager_targets = eval(argv[0])

  verified_targets = []
  for t in job_manager_targets:
    if t[4]:
      continue
    if prepare_one_target(t[:-1]):
      verified_targets.append(t)

  print "start hosts list"
  if verified_targets:  
    print '\n'.join([ t[0] for t in verified_targets ])
  print "end hosts list"

  print "job target setting task complete successfully!"

if __name__ == "__main__":
  import sys
  do(sys.argv)
