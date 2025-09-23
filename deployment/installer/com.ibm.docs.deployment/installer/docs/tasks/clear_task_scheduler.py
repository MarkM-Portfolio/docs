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


def clearScheduler(args):
  sched_name = args[0]
  
  sched_id = AdminConfig.getid("/SchedulerConfiguration:"+sched_name)
  if sched_id is None or sched_id.strip() == "":
    return 0
  sched_helper = AdminControl.queryNames('WebSphere:*,type=WASSchedulerCfgHelper')
  try:
    AdminControl.invoke(sched_helper,'dropTables','['+ sched_id +']', '[java.lang.String]')
    AdminControl.invoke(sched_helper,'createTables','['+ sched_id +']', '[java.lang.String]')
    AdminConfig.save()
      
    return 0
  except Exception, e:
    traceback.print_exc()
    return -1

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 1:
    print "Invalid arguments"
    sys.exit()
  if clearScheduler(sys.argv) == 0:
    print "successfully"
    sys.exit(0)
  else:
    print "failed"
    sys.exit(-1)
