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



def createFactory(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    
    factory_name,jndi_name,bus_name,scope_type,node_name,server_name = args

    if scope_type.lower() == "server" :
        cluster_name = 'none'
        object_id = wsadminlib.getServerByNodeAndName(node_name,server_name)

    if scope_type.lower() == "cluster" :
        cluster_name = node_name
        object_id = wsadminlib.getClusterId(cluster_name)
    
    wsadminlib.createSIBJMSConnectionFactory(
            cluster_name,
            server_name,
            factory_name,
            jndi_name,
            '',
            'topic',
            bus_name,
            '',
            object_id,
            ''
            )

    wsadminlib.save()


if __name__ == "__main__":
    import sys
    """
        #  required parameters
        #  factory_name,jndi_name,bus_name,scopeType,nodeName,serverName
    """
    if len(sys.argv) < 6:
        print ">>> Errors for arguments number passed to TASK createFactory"
        sys.exit()
    createFactory(sys.argv)
  


