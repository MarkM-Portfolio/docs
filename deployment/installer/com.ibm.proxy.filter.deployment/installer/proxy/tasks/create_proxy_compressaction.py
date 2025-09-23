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

def parse_rule_expression(pc_expression):
  rule_expression = ""
  if pc_expression != None:
    pc_expression = pc_expression.replace('"', "'")
    expressions_array = pc_expression.split(';')
    rule_expression = " OR ".join(expressions_array)
  else:
    wsadminlib.sop("parse_rule_expression:", "Input parameter pc_expression is None")

  wsadminlib.sop("parse_rule_expression:", "The proxy rule expression is: " + rule_expression)
 
  return rule_expression

def get_proxy_pvhc_object(pvhc_id, scope_id):
  m = "get_proxy_pvhc_object:"  
  pvhc_object = ""
  wsadminlib.sop(m,"Entry. scope_id=%s" % (scope_id))
  pvhc_ids = AdminConfig.getid("/ProxyVirtualHostConfig:/")
  wsadminlib.sop(m,"pvhc_ids=%s" % (pvhc_ids))
  pvhc_array = wsadminlib._splitlines(pvhc_ids)
  for pvhc_temp in pvhc_array:
    if pvhc_temp.find(pvhc_id) >= 0:
      pvhc_object = pvhc_temp
      break
  wsadminlib.sop(m,"pvhc_object=%s" % (pvhc_object))
  if wsadminlib.emptyString(pvhc_object):
    proxy_id = AdminConfig.getid(scope_id)
    wsadminlib.sop(m,"proxy_id=%s" % (proxy_id))
    pvhc_object = AdminConfig.create("ProxyVirtualHostConfig", proxy_id, [])
    wsadminlib.sop(m,"Created new ProxyVirtualHostConfig object. pvhc_object=%s" % (pvhc_object))
  else:
    wsadminlib.sop(m,"Referenced existing ProxyVirtualHostConfig object. pvhc_object=%s" % (pvhc_object))
  wsadminlib.sop(m,"Exit. Returning pvhc_object=%s" % ( pvhc_object ))
  return pvhc_object
  
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

def create_compress_action(args):
  wsadminlib.enableDebugMessages()
  if args[0]=="server":
    scope_name, node_name, server_name, pre_name, pca_name, pc_expression, pc_types = args
  else:
    scope_name, cluster_name, pre_name, pca_name, pc_expression, pc_types = args 
  
  # Get the proxy virtual host config id.
  if scope_name == "server":
    pvhc_id = "/nodes/%s/servers/%s" % (node_name, server_name)
    scope_id = "/Node:%s/Server:%s/" % (node_name, server_name)
  else:
    pvhc_id = "/clusters/%s" % (cluster_name)
    scope_id = "/ServerCluster:%s/" % (cluster_name)
  pvhc_object = get_proxy_pvhc_object(pvhc_id, scope_id)
  
  wsadminlib.sop("create_compress_action:", "Proxy virtual host config: " + pvhc_object)
  
  # Check if the specified proxy compress action exist or not.
  proxy_compress_action = wsadminlib.getObjectByName("ProxyAction", pca_name)
  if proxy_compress_action != None:
    remove_objects("ProxyAction", pca_name)
    wsadminlib.sop("create_compress_action:", "The proxy compression action %s already exists, remove it" % pca_name)
  # Create proxy virtual host compress action
  action = {}
  action["type"] = "HTTPResponseCompressionAction"
  action["name"] = pca_name
  action["contentTypes"] = pc_types
  proxy_action = wsadminlib.createProxyVirtualHostAction(pvhc_object, action)
  wsadminlib.sop("create_compress_action:", "Create proxy compress action: " + proxy_action)
  
  # Check if the specified proxy rule expression exist or not.
  proxy_rule_expression = wsadminlib.getObjectByName("ProxyRuleExpression", pre_name)
  if proxy_rule_expression != None:
    remove_objects("ProxyRuleExpression", pre_name)
    wsadminlib.sop("create_compress_action:", "The proxy rule expression %s already exists, remove it" % pre_name)
  # Create proxy virtual host rule expression.
  rule_expression = parse_rule_expression(pc_expression)
  rule_object = wsadminlib.createProxyVirtualHostRuleExpression(pvhc_object, pre_name, rule_expression, [proxy_action])
  wsadminlib.sop("create_compress_action:", "Create proxy rule expression: " + rule_object)
  
  # Check if the specified proxy virtual host exist or not.
  proxy_virtual_hosts = wsadminlib._splitlines(AdminConfig.list("ProxyVirtualHost"))
  for proxy_virtual_host in proxy_virtual_hosts:
    enabled_rules = wsadminlib._splitlines(AdminConfig.showAttribute(proxy_virtual_host, "enabledProxyRuleExpressions"))
    for enabled_rule in enabled_rules:
      enabled_rule_name = wsadminlib.getNameFromId(enabled_rule)
      if enabled_rule_name.find('[') == 0:
        enabled_rule_name = enabled_rule_name[1:len(enabled_rule_name)]
      wsadminlib.sop("create_compress_action:", "Enabled rule expression name: " + enabled_rule_name)
      if pre_name == enabled_rule_name:
        AdminConfig.remove(proxy_virtual_host)
        wsadminlib.sop("create_compress_action:", "The proxy virtual host %s with rule expression %s already exists, remove it" % (proxy_virtual_host, pre_name))
  
  # Create proxy virtual host.
  pvh_object = wsadminlib.createProxyVirtualHostObject(pvhc_object, "*", "*", [rule_object])
  wsadminlib.sop("create_compress_action:", "Create proxy virtual host: " + pvh_object)
  
  # Enable the proxy virtual host.
  wsadminlib.setObjectAttributes(pvhc_object, enabledProxyVirtualHosts = pvh_object)
  
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  if (sys.argv[0]=="server" and len(sys.argv) < 7) or (sys.argv[0]=="cluster" and len(sys.argv) < 6):
    wsadminlib.sop("create_compress_action:", "Errors for arguments number passed to TASK create_proxy_compressaction.py")
    sys.exit()

  create_compress_action(sys.argv)
