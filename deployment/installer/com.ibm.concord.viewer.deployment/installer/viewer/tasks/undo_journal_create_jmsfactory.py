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


def removeFactory(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    
    factory_name,scope_type,node_name,server_name = args

    if scope_type.lower() == "server" :
        cluster_name = 'none'
    elif scope_type.lower() == "cluster" :
        cluster_name = node_name
        object_id = wsadminlib.getClusterId(cluster_name)
    else:
        #should check
        pass
    
    wsadminlib.deleteSIBJMSConnectionFactory(
            factory_name,
            cluster_name,
            server_name
            )

    wsadminlib.save()


if __name__ == "__main__":
    import sys
    """
        #  required parameters
        #  factory_name,scopeType,nodeName,serverName
    """
    if len(sys.argv) < 4:
        print ">>> Errors for arguments number passed to TASK undo_createFactory"
        sys.exit()
    removeFactory(sys.argv)
  



