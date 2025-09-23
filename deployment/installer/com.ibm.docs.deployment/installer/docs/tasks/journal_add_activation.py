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



def addActivation(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    
    activation_name,jndi_name,destination_type,destination_jndi_name,\
            bus_name,subscription_name,client_identifier,scope_type,node_name, server_name = args

    if scope_type.lower() == "server" :        
        object_id = wsadminlib.getServerByNodeAndName(node_name,server_name)
    elif scope_type.lower() == "cluster" :
        cluster_name = node_name
        object_id = wsadminlib.getClusterId(cluster_name)
    else:
        #should check
        pass
   
    params = [
            "-name", activation_name,
            "-jndiName", jndi_name, 
            "-busName", bus_name, 
            "-destinationJndiName",destination_jndi_name, 
            "-destinationType", destination_type,
            "-clientId",client_identifier,
            "-subscriptionName",subscription_name
            ]
   
    AdminTask.createSIBJMSActivationSpec(object_id, params)
   
    wsadminlib.save()


if __name__ == "__main__":
    import sys
    """
        #  required parameters
    """
    if len(sys.argv) < 10:
        print ">>> Errors for arguments number passed to TASK addActivation"
        sys.exit()
    addActivation(sys.argv)
  





