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

def get_cell_name(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  cellname = wsadminlib.getCellName()
  print("cellname: " + cellname)

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  
  """
  get_cell_name(sys.argv)
