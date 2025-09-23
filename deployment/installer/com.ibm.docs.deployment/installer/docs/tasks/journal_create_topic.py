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



def createTopic(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    
    topic_name,jndi_name,destination_name,bus_name,scope_type,node_name,server_name = args

    if scope_type.lower() == "server" :
        object_id = wsadminlib.getServerByNodeAndName(node_name,server_name)
    elif scope_type.lower() == "cluster" :
        cluster_name = node_name
        object_id = wsadminlib.getClusterId(cluster_name)
    else:
        #should check
        pass

    params = [
            "-name", topic_name, 
            "-jndiName", jndi_name, 
            "-busName", bus_name,
            "-topicSpace", destination_name
            ]
    AdminTask.createSIBJMSTopic(object_id, params)
   
    wsadminlib.save()


if __name__ == "__main__":
    import sys
    """
        #  required parameters
        #  topic_name,jndi_name,destination_name,bus_name,scopeType,nodeName,serverName
    """
    if len(sys.argv) < 7:
        print ">>> Errors for arguments number passed to TASK createTopic"
        sys.exit()
    createTopic(sys.argv)
  




