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



def get_ic_proviesion_path():
  from util import wsadminlib
 
  wsadminlib.enableDebugMessages()
  
  ic_provision_path= wsadminlib.getCellVariable('CONNECTIONS_PROVISION_PATH')
  
  print 'CONNECTIONS_PROVISION_PATH:',ic_provision_path

if __name__ == "__main__":  
  get_ic_proviesion_path()
  
