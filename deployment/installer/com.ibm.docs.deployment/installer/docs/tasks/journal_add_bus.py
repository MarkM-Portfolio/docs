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



def addBus(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    
    bus_name,scope_type,node_name,server_name = args
    
    params =[
            '-bus', bus_name,
            '-busSecurity', 'false'
            ]
    
    AdminTask.createSIBus(params) 

    if scope_type.lower() == "server" :
        params =[
            '-bus', bus_name,
            '-node', node_name,
            '-server',server_name
            ]
        AdminTask.addSIBusMember(params)
        #object_id = wsadminlib.getServerByNodeAndName(node_name,server_name)
        #wsadminlib.createSIBus('none', nodeName, serverName, SIBusName,SIBusName, object_id, 'false')        
    elif scope_type.lower() == "cluster" :
        cluster_name = node_name
        store_path = server_name
        params =[
            '-bus', bus_name,
            '-cluster', cluster_name,
            '-fileStore',
            '-logDirectory',store_path,
            '-permanentStoreDirectory',store_path,
            '-temporaryStoreDirectory',store_path
            ]
        AdminTask.addSIBusMember(params) 
  
    wsadminlib.save()


if __name__ == "__main__":
    import sys
    """
        #  required parameters
        #  scopeType,nodeName,serverName
    """
    if len(sys.argv) < 3:
        print ">>> Errors for arguments number passed to TASK addBus"
        sys.exit()
    addBus(sys.argv)
  

