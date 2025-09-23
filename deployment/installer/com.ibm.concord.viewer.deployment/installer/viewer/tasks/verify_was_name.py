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

def verify_was_name(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()

    #arg3:clustername or nodename; arg4:servername
    scopeType,arg3,arg4 = args[0:3]
  
    result_false = "verify_was_name_result:false"
    result_true = "verify_was_name_result:true"

    if scopeType.lower() == "server" :
        nodeID = wsadminlib.getNodeId(arg3)
       
        if nodeID in [None,'']:
            print result_false
        else:
            serverID = wsadminlib.getServerByNodeAndName(arg3,arg4)
            if serverID in [None,'']:
                print result_false
            else:
                print result_true
 
    if scopeType.lower() == "cluster" :
        clusterID = wsadminlib.getServerClusterByName(arg3)
        if clusterID is None:
            print result_false
        else:
            print result_true

    wsadminlib.save()


if __name__ == "__main__":
    import sys
    """
    #  required parameters
    #  scopeType,nodeName,serverName
     """
    if len(sys.argv) < 3:
        print ">>> Errors for arguments number passed to TASK verify_was_name"
        sys.exit()
    verify_was_name(sys.argv)


