# *****************************************************************
#
# HCL Confidential
#
# HCL Docs Source Materials
#
# Copyright HCL Technologies Limited 2012, 2022
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

# -*- encoding: utf8 -*-

def map2webserver(args):
  from util import wsadminlib, jython_common
  wsadminlib.enableDebugMessages()

  ear_name, app_name = args

  try:
    jython_common.mapModulesToWebServer(ear_name, app_name)
    wsadminlib.save()
  except:
    print "Exception thrown while automatically configuring WebServer for "+ app_name+" EAR application, please refer to the guide and configure it manually after installation..."

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, app_name, 
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK install_ear"
    sys.exit()
  map2webserver(sys.argv)
