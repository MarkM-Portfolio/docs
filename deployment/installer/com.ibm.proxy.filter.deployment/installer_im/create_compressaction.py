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
execfile('./util/util.py')

def parse_rule_expression(pc_expression):
  rule_expression = ""
  if pc_expression != None:
    pc_expression = pc_expression.replace('"', "'")
    expressions_array = pc_expression.split(';')
    rule_expression = " OR ".join(expressions_array)
  else:
    sop("parse_rule_expression:", "Input parameter pc_expression is None")
  
  sop("parse_rule_expression:", "The proxy rule expression is: " + rule_expression)
  
  return rule_expression

def create_compress_action(args):
  enableDebugMessages()
  
  node_name, server_name, pvh_name, pre_name, pca_name, pc_expression, pc_types = args
  
  delete_compress(node_name, server_name, pvh_name, pre_name, pca_name)
  
  # Get the proxy virtual host config id.
  pvhc_object = ""
  pvhc_objects = getProxyVirtualHostConfig(node_name, server_name)
  pvhc_object_lines = _splitlines(pvhc_objects)
  for pvhc_object_line in pvhc_object_lines:
    if pvhc_object_line.find(server_name) >= 0:
      pvhc_object = pvhc_object_line
      break
  sop("create_compress_action:", "Proxy virtual host config: " + pvhc_object)
  
  # Create proxy virtual host compress action
  action = {}
  action["type"] = "HTTPResponseCompressionAction"
  action["name"] = pca_name
  action["contentTypes"] = pc_types
  proxy_action = createProxyVirtualHostAction(pvhc_object, action)
  sop("create_compress_action:", "Create proxy compress action: " + proxy_action)
  
  # Create proxy virtual host rule expression.
  rule_expression = parse_rule_expression(pc_expression)
  rule_object = createProxyVirtualHostRuleExpression(pvhc_object, pre_name, rule_expression, [proxy_action])
  sop("create_compress_action:", "Create proxy rule expression: " + rule_object)
  
  # Create proxy virtual host and enable it.
  pvh_object = createProxyVirtualHostObject(pvhc_object, "*", "*", [rule_object])
  sop("create_compress_action:", "Create proxy virtual host: " + pvh_object)
  setObjectAttributes(pvhc_object, enabledProxyVirtualHosts = pvh_object)
  
  # Apply all the above changes.
  save()

if __name__ == "__main__":
  import sys
  """
    # required parameters 
    # node_name, server_name, pvh_name, pre_name, pca_name, pc_expression, pc_types
    # 
    # node_name = 'localhostNode01'
    # server_name = 'proxy1'
    # pvh_name = 'IBMDocs_ProxyVirtualHost_001'
    # pre_name = 'IBMDocs_ProxyRuleExpression_001'
    # pca_name = 'IBMDocs_HTTPResponseCompressionAction_001'
    # pc_expression = '/docs/app/*;/docs/api/*;/docs/spellcheck/*'
    # pc_types = 'text/css;text/html;text/plain;text/x-json;application/json;application/x-javascript;application/x-json'
  """
  if len(sys.argv) != 7:
    sop("create_compress_action:", "Errors for arguments number passed to TASK create_compressaction.py")
    sys.exit(1)
  
  pc_expression = ""
  expressions_array = sys.argv[5].split(';')
  for expression in expressions_array:
    pc_expression = pc_expression + "URI=\"" + expression + "\";"
  sys.argv[5] = pc_expression
  
  create_compress_action(sys.argv)
