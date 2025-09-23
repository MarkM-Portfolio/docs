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


def set_websphere_security(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  length_arg = len(args)
  index = 1
  while index < length_arg:
    v_name = args[index-1]      
    v_value = args[index]    
    s_item_list = AdminConfig.list('Security')
    #set_value = AdminConfig.showAttribute(s_item_list,'appEnabled')    
    AdminConfig.modify(s_item_list,[[v_name,v_value]])    
    #set_value = AdminConfig.showAttribute(s_item_list,'appEnabled')    
    index=index+2    
  
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  length_arg=len(sys.argv)  
  if length_arg > 0: 
    res = divmod(length_arg,2)
    if res[1]!=0:  
      print "Exception: invalid arguments"
      sys.exit()
  set_websphere_security(sys.argv)
