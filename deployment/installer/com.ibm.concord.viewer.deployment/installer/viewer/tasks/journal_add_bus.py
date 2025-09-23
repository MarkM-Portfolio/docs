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


def addBus(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    
    bus_name,scope_type,node_name,server_name = args
    
    bus = AdminConfig.getid('/SIBus:%s' % bus_name)

    if((len(bus) == 1) or (len(bus) == 0)):
        params =[
            '-bus', bus_name,
            '-busSecurity', 'false'
            ]
        AdminTask.createSIBus(params) 
    else:
        print 'The %s already exists.' % bus_name
        return

    if scope_type.lower() == "server" :
        for member in _splitlines(AdminTask.listSIBusMembers(["-bus", bus_name])):
            memberNode = AdminConfig.showAttribute(member, "node")
            memberServer = AdminConfig.showAttribute(member, "server")
            if((memberNode == node_name)  and (memberServer == server_name)):
                print "The bus member already exists."
                return
        params =[
            '-bus', bus_name,
            '-node', node_name,
            '-server',server_name
            ]
        AdminTask.addSIBusMember(params)
        #object_id = wsadminlib.getServerByNodeAndName(node_name,server_name)
        #wsadminlib.createSIBus('none', nodeName, serverName, SIBusName,SIBusName, object_id, 'false')        
    elif scope_type.lower() == "cluster" :
        for member in _splitlines(AdminTask.listSIBusMembers(["-bus", bus_name])):
            memberCluster = AdminConfig.showAttribute(member, "cluster")
            if(memberCluster == cluster_name):
                sop(m, "The bus member already exists.")
                return
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

def _splitlines(s):
    rv = [s]
    if '\r' in s:
        rv = s.split('\r\n')
    elif '\n' in s:
        rv = s.split('\n')
    if rv[-1] == '':
        rv = rv[:-1]
    print rv
    return rv
  

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
  

