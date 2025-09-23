# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2014. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 

def get_all_node_hostnames():
  """return all the hostnames in the cell, may have duplicates"""
  host_names = []
  node_ids = _splitlines(AdminConfig.list('Node'))
  for node_id in node_ids:
    host_name = AdminConfig.showAttribute(node_id, 'hostName')
    host_names.append(host_name)
  print 'host_names:', host_names

def _splitlines(s):
  rv = [s]
  if '\r' in s:
    rv = s.split('\r\n')
  elif '\n' in s:
    rv = s.split('\n')
  if rv[-1] == '':
    rv = rv[:-1]
  return rv
  
# no paramater needed
if __name__ == '__main__':
  get_all_node_hostnames()