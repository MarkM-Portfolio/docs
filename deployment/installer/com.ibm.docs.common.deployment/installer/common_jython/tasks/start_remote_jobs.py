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

from common_jython.utils.jython_script_helper import *
import shutil

directory_name_on_nodes = 'ibmdocs_%s'
directory_name_on_dmgr = 'ibmdocs'
lin_install_script = '[sh remote_starter.sh -zip docs_remote_installer.zip -action %s -wasadminID %s -wasadminPW %s -time %s -installroot %s]'
win_install_script = '[powershell -executionpolicy RemoteSigned -File remote_starter.ps1 -zip docs_remote_installer.zip -action %s -wasadminID %s -wasadminPW %s -time %s -installroot %s]'
win_remove_temp_script = '[rmdir %s /s /q]'
lin_remove_temp_script = '[rm -rf %s]'

retrieve_job_msg_script = '[-jobToken %s -target %s -maxReturn 50]'



def fetch_logs (target_list, install_root, install_root_on_node, to_host):
  job_token = transfer_directory_to_dmgr(target_list, '/'.join( [install_root_on_node, 'logs'] ) , directory_name_on_dmgr)
  for node in target_list:
    try:
      shutil.rmtree(os.path.join(install_root, 'logs', node))
    except:
      pass
    path_on_dmgr = '/'.join( [job_token, node, directory_name_on_dmgr, '*'] )
    job_status = distribute_to_nodes([to_host], path_on_dmgr, os.path.join(install_root, 'logs/', node))


def remote_install_a_version (argv, install_type):
  from util import wsadminlib
  target_list = eval(argv[1])
  path_on_me, install_root, install_root_on_node, wasadmin_id, wasadmin_passwd, timestamp, product, os_type, me_hostname = argv[2:]
  path_on_nodes  = os.path.join(install_root_on_node, directory_name_on_nodes % timestamp)
  path_on_nodes = path_on_nodes.replace('\\', '/')

  job_token = transfer_directory_to_dmgr([me_hostname], path_on_me, directory_name_on_dmgr)  
  path_on_dmgr = '/'.join( [job_token, me_hostname, directory_name_on_dmgr, '*'] )
  job_status = distribute_to_nodes(target_list, path_on_dmgr, path_on_nodes)
  
  install_script = win_install_script
  remove_temp_script = win_remove_temp_script
  if os_type == 'linux':
    install_script = lin_install_script
    remove_temp_script = lin_remove_temp_script
    
  run_script(target_list, install_script % (install_type, wasadmin_id, wasadmin_passwd, timestamp, install_root_on_node.replace(' ', '__docsspace__')), path_on_nodes)

  fetch_logs(target_list, install_root, install_root_on_node, me_hostname)

  # clear temp files
  run_script(target_list, remove_temp_script % (directory_name_on_nodes % timestamp), install_root_on_node)

  print "jobmanager task complete successfully!"

def retrive_job_failure_msg (job_excptions):
  raw_msg = ''
  for t in job_excptions.targets:
    all_msgs = AdminTask.getJobTargetHistory(retrieve_job_msg_script % (job_excptions.job_token, t))
    if all_msgs.find('status FAILED') > -1:
      raw_msg = all_msgs
      
    fail_msg = [ i for i in all_msgs.split('\n') if i.find('status FAILED') > -1 ]
    if fail_msg:
      s = fail_msg[0].find('message [')
      if s > -1:
        s += 9
      e = fail_msg[0].find(']', s)
      if e > -1:
        raw_msg = fail_msg[0][s:e]
    if raw_msg:
      break
  return job_excptions.error_code + ':' +raw_msg
  
def do(argv):
  remote_install_a_version(argv, 'install')

def do_upgrade(argv):
  remote_install_a_version(argv, 'upgrade')

def undo(argv):
  from util import wsadminlib
  cluster_name = argv[1]
  install_root = argv[2]
  install_root_on_node = argv[3]
  product = argv[7]
  me_hostname = argv[8]
  clusterMembers = wsadminlib.listServersInCluster(cluster_name)
  node_list = [ AdminConfig.showAttribute( clusterMember, "nodeName" ) 
                 for clusterMember in clusterMembers ]
  target_list = [ wsadminlib.getNodeHostname(node_name) for node_name in node_list ]
  
  os_type = wsadminlib.getNodePlatformOS(node_list[0]) # assuming that all the nodes having the same os type
  uninstall_script = 'uninstall_node.bat'
  if os_type == 'linux':
    uninstall_script = 'sh uninstall_node.sh'
  
  uninstall_script_directory = os.path.join(install_root_on_node, 'installer')
  uninstall_script_directory = uninstall_script_directory.replace('\\', '/')
  uninstall_script = '[%s -wasadminID %s -wasadminPW %s -time %s]' % (uninstall_script, argv[4], argv[5], argv[6])

  run_script(target_list, uninstall_script, uninstall_script_directory)
   
  fetch_logs(target_list, install_root, install_root_on_node, me_hostname)

  print "start hosts list"
  print '\n'.join(target_list)
  print "end hosts list"

  print "jobmanager task complete successfully!"


if __name__ == "__main__":
  import sys
  try:
    locals()[sys.argv[0]](sys.argv)
  except JobManagerException, job_excptions:
    print 'return value start'
    print retrive_job_failure_msg(job_excptions)
    print 'return value end'
    
