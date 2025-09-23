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



def removeActivation(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    
    activation_name,scope_type,node_name,server_name = args

    if scope_type.lower() == "server" :
        cluster_name = 'none'
    elif scope_type.lower() == "cluster" :
        cluster_name = node_name
    else:
        #should check error
        pass
   
    wsadminlib.deleteSIBJMSActivationSpec(activation_name,cluster_name,server_name)
   
    wsadminlib.save()


if __name__ == "__main__":
    import sys
    """
        #  required parameters
    """
    if len(sys.argv) < 4:
        print ">>> Errors for arguments number passed to TASK undo_addActivation"
        sys.exit()
    removeActivation(sys.argv)
  






