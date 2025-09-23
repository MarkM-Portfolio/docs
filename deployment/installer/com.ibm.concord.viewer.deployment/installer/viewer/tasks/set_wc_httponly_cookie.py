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


def addWebContainer(args):
    from util import wsadminlib
 
    wsadminlib.enableDebugMessages()
    scope, scope_name, target_scope, proName, proValue = args    
    if scope.lower() == "server":
      cell_name = AdminControl.getCell()
      scope_full = "".join(["/Cell:", cell_name, target_scope])
      scope_id = AdminConfig.getid(scope_full)
      webcontainer_id = AdminConfig.list('WebContainer', scope_id)
      wsadminlib.setCustomPropertyOnObject(webcontainer_id, proName, proValue)
    elif scope.lower() == "cluster":
      for (server_id, nodename, server_name) in wsadminlib.getServerIDsForClusters([scope_name]):
        print "all servers in cluster: " + server_id
        webcontainer_id = AdminConfig.list('WebContainer', server_id)
        wsadminlib.setCustomPropertyOnObject(webcontainer_id, proName, proValue)
    else:
      raise Exception(">>>>CONFIG ERROR for your Viewer server or cluster<<<<")  
 
    wsadminlib.save()
    
    #wsadminlib.setWebContainerCustomProperty(nodename, servername, propname, propvalue)


if __name__ == "__main__":
    import sys
    """
        #  required parameters
        #  scopeType,nodeName,serverName,propname,propvalue
    """
    if len(sys.argv) < 5:
        print ">>> Errors for arguments number passed to TASK set_wc_httponly_cookie.py"
        sys.exit()
    addWebContainer(sys.argv)
