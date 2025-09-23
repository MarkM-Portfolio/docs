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
import random
import socket
import os
import sys
import time

register_host_args = '[-host %s -hostProps [ [username %s] [password %s]  [osType %s] [saveSecurity true] ]]'
unregister_host_args = '[-host %s]'
collection_args = '[-jobType collectFile -targetList [%s] -description collectFile -jobParams [ [source [%s]] [destination %s]  ]]'
distribute_args = '[-jobType distributeFile -targetList [%s] -description distributeFile -jobParams [ [destination [%s]] [source %s ] ] ]'
run_script_args = '[-jobType runCommand -targetList [%s] -description runCommand -jobParams [ [command %s] [workingDir [%s]] ]]'
remove_file_args = '-jobType removeFile -targetList [%s]  -jobParams [[location %s]]' 
delete_job_args = '[-jobToken %s]'
job_query_args = '[-jobToken %s]'
query_target_args = '-maxReturn 20 -query "targetName=%s"'

class JobManagerException(Exception):
  def __init__(self, value, job_token, targets, error_code):
    self.value = value
    self.job_token = job_token
    self.targets = targets
    self.error_code = error_code
  def __str__(self):
    return repr(self.value)

#[ [BXV7V609.cn.ibm.com SUCCEEDED] [bxv10v454.cn.ibm.com SUCCEEDED] ]
def parse_was_list(ls):
  result = []
  parse_stack = []
  for i in range(len(ls)):
    c = ls[i]
    if c == '[':
      parse_stack.append(i)
    if c == ']':
      start = parse_stack.pop()
      end = i
      part = ls[start+1:end]
      if not '[' in part and not ']' in part:
        result.append(ls[start+1:end].strip().split(' '))
  return result

def wait_job (jt, time_out=600):
  status = ""
  for i in xrange(time_out):    
    time.sleep(1)
    status = AdminTask.getJobTargetStatus(job_query_args % jt)
    status = parse_was_list(status)
    all_finished = 1
    for s in  status:
      if s[1].strip() not in ['SUCCEEDED', 'FAILED', 'REJECTED']:
        all_finished = 0
        break

    if all_finished:
      break    
    
  any_succeed = 0
  for s in status:
    if s[1] == 'SUCCEEDED':
      any_succeed = 1
  if not any_succeed:
    print "Job %s failed!" % jt
    return 0
  return 1

def prepare_one_target (t):
  if not t[1]:
    if AdminTask.queryTargets( query_target_args % t[0]).find('[size 1]') > -1:
      return 1
    else:
      return 0      
  try:
    AdminTask.unregisterHost(unregister_host_args % t[0])
  except:
    pass
  AdminTask.registerHost(register_host_args % tuple(t))
  return 1

def identify_localhost (host_list):
  me_hostname = socket.gethostname()
  me_ip = socket.gethostbyname(me_hostname)

  for hn in host_list:
    if me_ip == socket.gethostbyname(hn):
      me_hostname = hn
      break
  return me_hostname
  
# run script on remote machine
def run_script (targets, cmd_script, cmd_script_directory):
  job_token = AdminTask.submitJob ( run_script_args % ( ' '.join( targets ), cmd_script, cmd_script_directory)  )
  if not wait_job(job_token, 3600):
    raise JobManagerException("Run remote script failed.", job_token, targets, 'CRRSE3E')
  AdminTask.deleteJob( delete_job_args % (job_token) )    

def transfer_directory_to_dmgr (node_hosts, path_on_node, path_on_dmgr):
  job_token = AdminTask.submitJob(collection_args % (' '.join( node_hosts ), path_on_node + "/*", path_on_dmgr) )
  if not wait_job(job_token):
    raise JobManagerException("Transfer %s to dmgr failed." % path_on_node, job_token, node_hosts, 'CRRSE4E')
  AdminTask.deleteJob( delete_job_args % (job_token) )
  return job_token

def transfer_file_to_dmgr (node_hosts, path_on_node, path_on_dmgr):
  job_token = AdminTask.submitJob(collection_args % (' '.join( node_hosts ), path_on_node, path_on_dmgr) )
  if not wait_job(job_token):
    raise JobManagerException("Transfer %s to dmgr failed." % path_on_node, job_token, node_hosts, CRRSE5E)
  AdminTask.deleteJob( delete_job_args % (job_token) )
  return job_token

def distribute_to_nodes (node_list, path_on_dmgr, path_on_node):
  job_token = AdminTask.submitJob ( distribute_args % ( ' '.join( node_list ), path_on_node, path_on_dmgr) )
  if not wait_job(job_token):
    raise JobManagerException("Distribute %s to nodes failed." % path_on_dmgr, job_token, node_list, 'CRRSE6E')
  AdminTask.deleteJob( delete_job_args % (job_token) )

def remove_file_from_node (node_list, path_on_node):
  job_token = AdminTask.submitJob ( remove_file_args % ( ' '.join( node_list ), path_on_node) )
  if not wait_job(job_token):
    raise JobManagerException("Remove %s from nodes failed." % path_on_node, job_token, node_list, 'CRRSE7E')
  AdminTask.deleteJob( delete_job_args % (job_token) )
