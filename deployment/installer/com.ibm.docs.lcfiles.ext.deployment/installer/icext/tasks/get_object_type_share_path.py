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

ot_share_path_var = "CONNECTIONS_CUSTOMIZATION_PATH"
    ot_share_path_var = "".join([ot_share_path_var,": "])    
    ot_share_paths = []
    ot_share_paths = self._parse_info(ot_share_path_var,ws_out)
    
    #if ws_out.find("successfully") < 0:
    if len(ot_share_paths) == 0:
      raise Exception("Import ibmdocs.xml failed")
    
    ot_share_path = os.path.join(ot_share_paths[0],"objecttypes")
    ot_share_path = ot_share_path.replace("\\","/")    
    
    if os.path.exists(ot_share_path):
      shutil.copy(des_share_dir_for_ibmdocs_xml,ot_share_path)
    else:
      raise Exception("Import ibmdocs.xml failed")
      
def get_object_type_share_path(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  
  varMap = wsadminlib.getVariableMap()  
  ot_attrs = []
  #print CONNECTIONS_CUSTOMIZATION_PATH
  ot_attrs.extend([['symbolicName', 'CONNECTIONS_CUSTOMIZATION_PATH']])
  ot_attrs.extend([['value', 'expect_value']])  
  
  myList = wsadminlib.getObjectsOfType('VariableSubstitutionEntry', varMap)  
  for item in myList:
    # assume that the item is wanted    
    name_value = wsadminlib.getObjectAttribute( item, ot_attrs[0][0] )    
    #print value
    if name_value == ot_attrs[0][1]:
      #print item
      v_value = wsadminlib.getObjectAttribute( item, ot_attrs[1][0] )
      #print v_value
      print "CONNECTIONS_CUSTOMIZATION_PATH: " + v_value
      break

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  
  """  
  get_object_type_share_path(sys.argv)
