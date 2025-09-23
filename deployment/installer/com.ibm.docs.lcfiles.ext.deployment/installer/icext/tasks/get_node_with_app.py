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

# Get the node name list with ic installation
    


def get_node_with_app(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  
  #nodes1 = AdminApplication.getAppDeployedNodes("Files")
  #print "AdminApplication.getAppDeployedNodes for Files: "
  #print nodes1
  
  appName = args[0]
  nodelist = [] 
 
  # Check the required parameters
  if (appName != ""):
    # Retrieve application deployment configuration object
    deployment = AdminConfig.getid("/Deployment:"+appName+"/" )    
    # Check if deployment target exists
    if (len(deployment) != 0):                
      targets = AdminConfig.showAttribute(deployment, "deploymentTargets")
      targets = AdminUtilities.convertToList(targets)                
      for dt in targets:
        # Application deployed on cluster
        if (dt.find("ClusteredTarget") > 0):
          clusterName = AdminConfig.showAttribute(dt, "name")          
          # Get all cluster members
          members = AdminConfig.getid("/ServerCluster:"+clusterName+"/ClusterMember:/")
          members = AdminUtilities.convertToList(members)          
          # Find each cluster member node
          for member in members:
            nodeName = AdminConfig.showAttribute(member, "nodeName")
            if (nodelist.count(nodeName) <= 0):
              #AdminUtilities.infoNotice("Application deployed on node: " + nodeName)
              nodelist.append(nodeName)
            #endIf   
          #endFor
        # Application deployed on server      
        elif (dt.find("ServerTarget") > 0):
          serverName = AdminConfig.showAttribute(dt, "name")          
          nodeName = AdminConfig.showAttribute(dt, "nodeName")          
          if ( serverName.find("webserver")==-1 and nodelist.count(nodeName) <= 0):
            #AdminUtilities.infoNotice("Application deployed on node: " + nodeName)
            nodelist.append(nodeName)
          #endIf
        #endIf   
      #endFor 
    #endIf    
  #endif appName
  for node in nodelist:
    print  "nodename: " + node 
   
  #searchApps = []
  #searchApps.extend(args)
  #cell_name = wsadminlib.getCellName()
  #installedApps = wsadminlib.listApplications()  
  #nodes = wsadminlib.listNodes()
  #for node in nodes:
    #servers = wsadminlib._splitlines(AdminConfig.list('Server', node))
    #for server in servers:
    #  serverName = AdminConfig.showAttribute(server, 'name')      
    #installedApps4Node = "".join(["WebSphere:cell=",cell_name,",node=",node,",server=",serverName])
  #  installedApps4Node = "".join(["WebSphere:cell=",cell_name,",node=",node])    
  #  installedApps = wsadminlib._splitlines(AdminApp.list(installedApps4Node))   
  #  print "installedApps: "
  #  print installedApps
  #  for sApp in searchApps:
  #    if sApp in installedApps:
  #      print "nodename: " + node
 
if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  
  """  
  if len(sys.argv) != 1:
    print 'Invalid parameters for application, pass at least one parameter'
    sys.exit(-1)
  get_node_with_app(sys.argv)
