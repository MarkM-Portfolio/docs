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
  
def add_virtual_hosts(args):
  hostname,http_port,https_port = args[0:3]
  cell = AdminControl.getCell()
  default_hosts_id = AdminConfig.getid( '/Cell:%s/VirtualHost:default_host/' % cell)
  aliasis = AdminConfig.list('HostAlias', default_hosts_id)
  add_http = 1
  add_https = 1
  for alias in _splitlines(aliasis):
    item_host = AdminConfig.showAttribute(alias,"hostname")
    item_port = AdminConfig.showAttribute(alias,"port")
    if item_host == hostname or item_host == '*':
      if http_port == item_port:
        add_http = 0
        print 'Virtual port:[[hostname "%s"] [port "%s"]] already exist'% (item_host,item_port)
      if https_port == item_port:
        add_https = 0
        print 'Virtual port:[[hostname "%s"] [port "%s"]] already exist'% (item_host,item_port)
      if not add_http and not add_https:
      	break
  if add_http:
    print 'Add virtual port:[[hostname "%s"] [port "%s"]]'% (hostname,http_port)
    AdminConfig.create('HostAlias', default_hosts_id, '[[hostname "%s"] [port "%s"]]' % (hostname,http_port))
  if add_https:
    print 'Add virtual port:[[hostname "%s"] [port "%s"]]'% (hostname,https_port)
    AdminConfig.create('HostAlias', default_hosts_id, '[[hostname "%s"] [port "%s"]]' % (hostname,https_port))
  if add_http or add_https:
    wsadminlib.save()
  
  

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 3:
    wsadminlib.sop("create_virtual_hosts:", "Errors for arguments number passed to TASK create_virtual_hosts.py")
    sys.exit()
  add_virtual_hosts(sys.argv)
  
