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


def createWorkManager(args):
  # args are
  # scope, name, jndi, alart_threads, min_thread, max_threads, \
  #	thread_priority, otherAtts 
  # need insert provide_id before otherAtts
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  #print ">>>>>>>>", str(args)
  cell_name = AdminControl.getCell()
  # args[0] is 
  # for cluster target scope, /ServerCluster:clusteNmae/, 
  # for server target scope, /Node:myNode/Server:myServer/
  scope = "".join(["/Cell:", cell_name, args[0]])
  provider_id = AdminConfig.getid(scope + \
  	'WorkManagerProvider:WorkManagerProvider/')
  args.insert(7, provider_id)
  AdminResources.createWorkManagerAtScope(*args)
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  scope, wmName, wmJNDI, wmNumAlarmThreads, 
    #  wmMinThreads, wmMaxThreads, wmThreadPriority, wmProviderID, 
    #  optional attribute lists
    #  otherAttrsList
       ['Cell=lcapplianceCell01,Cluster=ConversionCluster', 
	'ConcordWorkManager2', 
	'com/ibm/concord/workmanager2', 
	'2', 
	'5', 
	'50', 
	'5', 
        'provider_id' ---> THIS IS NOT passed by arguments, tobe set in TASK
	'workTimeout=60000,workReqQSize=70,workReqQFullAction=1,isGrowable=true'
       ]
  """
  if len(sys.argv) < 8:
    print "Errors for arguments number passed to TASK add_workmanager"
    sys.exit()
  createWorkManager(sys.argv)
