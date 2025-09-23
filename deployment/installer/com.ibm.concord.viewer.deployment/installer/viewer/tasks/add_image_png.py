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

def add_image_png(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  # target_scope is 
  # for typeName, 
  # for typeValue,
  # for virtualHostName
  typeName, typeValue, virtualHostName = args
  wsadminlib.setMimeType(virtualHostName, typeValue, typeName)

  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  mime_type,extensions, virtual_host_name
  """
  if len(sys.argv) < 3:
    print ">>> Errors for arguments number passed to TASK add_image_png.py"
    sys.exit()
  add_image_png(sys.argv)
