# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

def _splitlines(s):
  rv = [s]
  if '\r' in s:
    rv = s.split('\r\n')
  elif '\n' in s:
    rv = s.split('\n')
  if rv[-1] == '':
    rv = rv[:-1]
  return rv

def startMigrationTool(args):
  try:
    mbean=AdminControl.queryNames("com.ibm.concord.platform.mbean:type=Migration,*")
    mbean = _splitlines(mbean)[0]
    AdminControl.invoke(mbean,"start")
    # make sure migration tool can be enabled after HCL Docs restart
    AdminControl.invoke(mbean,"enableAfterRestart", "true")
    return 0
  except Exception, e:
    traceback.print_exc()
    return -1

if __name__ == "__main__":
  import sys
  if startMigrationTool(sys.argv) == 0:
    print "Migration tool start successfully"
    sys.exit(0)
  else:
    print "Migration tool start failed"
    sys.exit(-1)
