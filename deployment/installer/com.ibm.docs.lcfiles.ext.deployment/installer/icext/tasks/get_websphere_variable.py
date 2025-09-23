# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2014. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 



def get_it(args):
  from util import wsadminlib
 
  wsadminlib.enableDebugMessages()
  key = args[0]
  
  value = wsadminlib.getCellVariable(key)
  
  if value:
    print 'value is:' + value
  else:
    print 'no value found'

if __name__ == "__main__":  
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  get_it(sys.argv)
  
