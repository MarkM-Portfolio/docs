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



def deleteBus(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    
    bus_name = args[0]    
    wsadminlib.deleteBus(bus_name)  
    wsadminlib.save()

if __name__ == "__main__":
    import sys
    """
        #  required parameters
        #  busName
    """
    if len(sys.argv) < 1:
        print ">>> Errors for arguments number passed to TASK deleteBus"
        sys.exit()
   
    deleteBus(sys.argv)
  





deleteBus
