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

def _delete_it(typeName, virtualHostName):
  from util import wsadminlib

  cellname = wsadminlib.getCellName()
  settings_id = AdminConfig.getid("/Cell:"+cellName+"/VirtualHost:"+ virtualHostName +"/")
  properties = wsadminlib._splitlines( AdminConfig.list('MimeEntry', settings_id) )
  for p in properties:
      ptype = AdminConfig.showAttribute(p, "type")
      if ptype == typeName:
          AdminConfig.remove(p)
          break

def delete_image_png(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  # target_scope is 
  # for typeName, 
  # for virtualHostName,
  typeName, virtualHostName = args
  
  _delete_it(typeName,virtualHostName)

  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  typeName, virtualHostName
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK undo_add_image_png.py"
    sys.exit()
  delete_image_png(sys.argv)
