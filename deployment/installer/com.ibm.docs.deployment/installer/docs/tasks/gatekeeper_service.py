# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2015. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 

def startGateKeeperService(args):
  try:
    mbean=AdminControl.queryNames("com.ibm.concord.platform.mbean:type=EntitlementsMgr,*")
    result = AdminControl.invoke(mbean.split('\n')[0],"doService", args[0])
    if result.lower() == "true": 
      return 0
    else:
      return -1  
  except Exception, e:
    print e
    return -1

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 1:
    print ">>> You must specify the location of gatekeeper.json as parameter"
    sys.exit()
  if startGateKeeperService(sys.argv) == 0:
    print ">>> GateKeeper services are completed successfully."
    sys.exit(0)
  else:
    print ">>> Failed to execute GateKeeper services. Try to check SystemOut.log for detailed information."
    sys.exit(-1)