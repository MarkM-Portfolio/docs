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


def removeDestination(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    
    destination_name,bus_name = args
    
    params = [
            "-bus", bus_name,
            "-name", destination_name
            ]
    AdminTask.deleteSIBDestination(params) 
   
    wsadminlib.save()


if __name__ == "__main__":
    import sys
    """
        #  required parameters
    """
    if len(sys.argv) < 2:
        print ">>> Errors for arguments number passed to TASK removeDestination"
        sys.exit()
    removeDestination(sys.argv)
  




