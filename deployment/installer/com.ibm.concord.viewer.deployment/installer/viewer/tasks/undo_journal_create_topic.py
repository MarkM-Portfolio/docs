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


def removeTopic(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    
    topic_name,scope_type,node_name,server_name = args

    if scope_type.lower() == "server" :        
        object_id = wsadminlib.getServerByNodeAndName(node_name,server_name)
    elif scope_type.lower() == "cluster" :
        cluster_name = node_name
        object_id = wsadminlib.getClusterId(cluster_name)
    else:
        #should check error
        pass
   
    wsadminlib.deleteSIBJMSTopic(topic_name,object_id)
    
    wsadminlib.save()


if __name__ == "__main__":
    import sys
    """
        #  required parameters
    """
    if len(sys.argv) < 4:
        print ">>> Errors for arguments number passed to TASK undo_addTopic"
        sys.exit()
    removeTopic(sys.argv)
  







