# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************



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
      raise Exception(">>>>CONFIG ERROR for your HCL Docs server or cluster<<<<")

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
