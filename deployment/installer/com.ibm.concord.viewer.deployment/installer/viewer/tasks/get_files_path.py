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
  
  files_content_dir= wsadminlib.getCellVariable('FILES_CONTENT_DIR')
  
  print 'FILES_CONTENT_DIR:',files_content_dir

if __name__ == "__main__":  
  getVersion()
  
