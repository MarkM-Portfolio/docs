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


def addDestination(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    
    destination_name,bus_name,scope_type,node_name, server_name = args

    if scope_type.lower() == "server" :
        cluster_name = 'none'
    elif scope_type.lower() == "cluster" :
        cluster_name = node_name
    else:
        #should check
        pass
    
    wsadminlib.createSIBTopic(
            cluster_name,
            node_name,
            server_name,
            destination_name,
            bus_name
            )
   
    wsadminlib.save()


if __name__ == "__main__":
    import sys
    """
        #  required parameters
        #  scopeType,nodeName,serverName
    """
    if len(sys.argv) < 5:
        print ">>> Errors for arguments number passed to TASK addDestination"
        sys.exit()
    addDestination(sys.argv)
  



