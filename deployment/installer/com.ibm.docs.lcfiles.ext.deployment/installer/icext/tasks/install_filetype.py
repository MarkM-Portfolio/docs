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

def install_filetype(args):
  #************************************************************
  #please keep the commented parts
  #************************************************************  
  import wsadminlib
  
  remote_ibmdocs_xml_filepath = os.path.join(wsadminlib.getWasProfileRoot(serviceNodeNameFiles), 'config', args[0])
  remote_ibmdocs_xml_filepath = remote_ibmdocs_xml_filepath.replace('\\','/')    
  FilesObjectTypeService.importType(remote_ibmdocs_xml_filepath)
    
  print "Import ibmdocs.xml successfully"    

if __name__ == "__main__":
  import sys 
  """
    #  required parameters
    #  path_of_ibmdocs.xml
  """ 
  #************************************************************
  #please keep the commented parts
  #************************************************************
  
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK install_filetype.py"
    sys.exit()
  
  batchMode = "1"
  lengtharg = len(sys.argv)
  args = []
  args.append(sys.argv[0])
    
  serviceNodeNameFiles = None
  if lengtharg > 1:
    serviceNodeNameFiles = sys.argv[1]
       
  execfile("filesAdmin.py")
  install_filetype(args)