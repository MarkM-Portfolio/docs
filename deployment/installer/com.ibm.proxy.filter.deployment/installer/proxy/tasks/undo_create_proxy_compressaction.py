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

def remove_objects(object_type, object_name):
  objects = wsadminlib._splitlines(AdminConfig.list(object_type))
  if (objects == None) or (len(objects) == 0):
    wsadminlib.sop("remove_objects:", "Did not find any object of type: " + object_type)
    return None
  
  removed = 0
  for obj in objects:
    name = AdminConfig.showAttribute(obj, 'name')
    if name == object_name:
      removed = 1
      AdminConfig.remove(obj)
      wsadminlib.sop("remove_objects:", "Remove object: " + obj)
  
  if removed == 0:
    wsadminlib.sop("remove_objects:", "The object: " + object_name + " of type: " + object_type + " does not exist")
  
  return None

def delete_compress_action(args):
  wsadminlib.enableDebugMessages()
  
  pre_name, pca_name = args
  
  # Remove the proxy virtual host.
  proxy_virtual_hosts = wsadminlib._splitlines(AdminConfig.list("ProxyVirtualHost"))
  for proxy_virtual_host in proxy_virtual_hosts:
    enabled_rules = wsadminlib._splitlines(AdminConfig.showAttribute(proxy_virtual_host, "enabledProxyRuleExpressions"))
    for enabled_rule in enabled_rules:
      enabled_rule_name = wsadminlib.getNameFromId(enabled_rule)
      if enabled_rule_name.find('[') == 0:
        enabled_rule_name = enabled_rule_name[1:len(enabled_rule_name)]
      wsadminlib.sop("delete_compress_action:", "Enabled rule expression name: " + enabled_rule_name)
      if pre_name == enabled_rule_name:
        AdminConfig.remove(proxy_virtual_host)
        wsadminlib.sop("delete_compress_action:", "Remove proxy virtual host: " + proxy_virtual_host)
  
  # Remove the proxy virtual host rule expression.
  remove_objects("ProxyRuleExpression", pre_name)
  
  # Remove the proxy virtual host compress action.
  remove_objects("ProxyAction", pca_name)
  
  wsadminlib.save()
  
  return None

if __name__ == "__main__":
  import sys
  
  if len(sys.argv) < 2:
    wsadminlib.sop("delete_compress_action:", "Errors for arguments number passed to TASK undo_create_proxy_compressaction.py")
    sys.exit()
  
  delete_compress_action(sys.argv)
