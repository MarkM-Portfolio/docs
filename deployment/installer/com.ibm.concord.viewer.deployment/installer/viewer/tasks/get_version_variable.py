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



def getVersion():
  from util import wsadminlib
 
  wsadminlib.enableDebugMessages()
  
  version_info = {
    'DOCS_VERSION' : '',
    'CONVERSION_VERSION' : '',
    'VIEWER_VERSION' : ''
  }
  
  for (key, value) in version_info.items():
    version_info[key] = wsadminlib.getCellVariable(key)
  
  print 'all_version_info:',version_info

if __name__ == "__main__":  
  getVersion()
  
