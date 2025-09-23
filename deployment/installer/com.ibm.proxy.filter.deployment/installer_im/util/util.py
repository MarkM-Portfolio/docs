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

execfile('./lib/wsadminlib.py')

def remove_objects(object_type, object_name):
  objects = _splitlines(AdminConfig.list(object_type))
  if (objects == None) or (len(objects) == 0):
    sop("remove_objects:", "Did not find any object of type: " + object_type)
    return None
  
  removed = 0
  for obj in objects:
    name = AdminConfig.showAttribute(obj, 'name')
    if name == object_name:
      removed = 1
      AdminConfig.remove(obj)
      sop("remove_objects:", "Remove object: " + obj)
  
  if removed == 0:
    sop("remove_objects:", "The object: " + object_name + " of type: " + object_type + " does not exist")
  
  return None

def delete_compress(node_name, server_name, pvh_name, pre_name, pca_name):
  # Remove the proxy virtual host.
  proxy_virtual_hosts = _splitlines(AdminConfig.list("ProxyVirtualHost"))
  for proxy_virtual_host in proxy_virtual_hosts:
    enabled_rules = _splitlines(AdminConfig.showAttribute(proxy_virtual_host, "enabledProxyRuleExpressions"))
    for enabled_rule in enabled_rules:
      enabled_rule_name = getNameFromId(enabled_rule)
      if enabled_rule_name.find('[') == 0:
        enabled_rule_name = enabled_rule_name[1:len(enabled_rule_name)]
      if pre_name == enabled_rule_name:
        AdminConfig.remove(proxy_virtual_host)
        sop("delete_compress:", "Remove proxy virtual host: " + proxy_virtual_host)
  
  # Remove the proxy virtual host rule expression.
  remove_objects("ProxyRuleExpression", pre_name)
  sop("delete_compress:", "Remove proxy rule expression: " + pre_name)
  
  # Remove the proxy virtual host compress action.
  remove_objects("ProxyAction", pca_name)
  sop("delete_compress:", "Remove proxy compress action: " + pca_name)
  
  save()
  
  return None
