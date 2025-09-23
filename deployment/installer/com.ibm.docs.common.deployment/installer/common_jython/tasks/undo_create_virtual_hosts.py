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

from util import wsadminlib

def _splitlines(s):
  rv = [s]
  if '\r' in s:
    rv = s.split('\r\n')
  elif '\n' in s:
    rv = s.split('\n')
  if rv[-1] == '':
    rv = rv[:-1]
  return rv
  
def remove_virtual_hosts(args):
  hostname,http_port,https_port = args[0:3]
  cell = AdminControl.getCell()
  default_hosts_id = AdminConfig.getid( '/Cell:%s/VirtualHost:default_host/' % cell)
  aliasis = AdminConfig.list('HostAlias', default_hosts_id)
  remove_http = 0
  remove_https = 0
  for alias in _splitlines(aliasis):
    item_host = AdminConfig.showAttribute(alias,"hostname")
    item_port = AdminConfig.showAttribute(alias,"port")
    if item_host == hostname:
      if http_port == item_port:
        remove_http = 1
        AdminConfig.remove(alias)
        print 'Remove virtual port:[[hostname "%s"] [port "%s"]]'% (item_host,item_port)
      elif https_port == item_port:
        remove_https = 1
        AdminConfig.remove(alias)
        print 'Remove virtual port:[[hostname "%s"] [port "%s"]]'% (item_host,item_port)
      if remove_http and remove_https:
      	break

  if remove_http or remove_https:
    wsadminlib.save()
  

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 3:
    wsadminlib.sop("undo_create_virtual_hosts:", "Errors for arguments number passed to TASK undo_create_virtual_hosts.py")
    sys.exit()
  remove_virtual_hosts(sys.argv)
  
