execfile('../wsadminlib.py')
import shutil

collection_args = '[-jobType collectFile -targetList [%s] -description collectFile -jobParams [ [source [%s]] [destination %s]  ]]'
distribute_args = '[-jobType distributeFile -targetList [%s] -description distributeFile -jobParams [ [destination [%s]] [source %s ] ] ]'
run_script_args = '[-jobType runCommand -targetList [%s] -description runCommand -jobParams [ [command %s] [workingDir [%s]] ]]'
remove_file_args = '-jobType removeFile -targetList [%s]  -jobParams [[location %s]]' 
delete_job_args = '[-jobToken %s]'
job_query_args = '[-jobToken %s]'
query_target_args = '-maxReturn 20 -query "targetName=%s"'

directory_name_on_nodes = 'ibmdocs_fixpack'
directory_name_on_dmgr = 'ibmdocs'
win_conversion_install_script = '[powershell -executionpolicy RemoteSigned -File remote_starter.ps1 -zip docs_remote_installer.zip -installroot %s -symcount %d]'
lin_conversion_install_script = '[sh remote_starter.sh -zip docs_remote_installer.zip -installroot %s -symcount %d]'
win_remove_temp_script = '[rmdir %s /s /q]'
lin_remove_temp_script = '[rm -rf %s]'
retrieve_job_msg_script = '[-jobToken %s -target %s -maxReturn 50]'   

def update_app(argv):
  """Update an application with a new zipfile"""
  appname = argv[0]
  filename = argv[1]
  if filename.endswith(".ear.zip"):
    AdminApp.update(appname,            
                   'partialapp',             
                   # options:
                   ['-operation', 'update', 
                     '-contents', filename,
                     ],
                    )
  if filename.endswith(".ear"):
    AdminApp.update(appname,            
                    'app',              
                    # options:
                    ['-operation', 'update', 
                     '-contents', filename,
                     ],
                    )
  save()
  
def print_app_list(argv):
  print "<was-query-result>%s</was-query-result>" % listApplications()
     
def print_cell_variable(argv):
  print "<was-query-result>%s</was-query-result>" % getCellVariable(argv[0])

def restartApplication(appname):
    """restart the named application on all its servers"""
    cellname = getCellName()
    servers = listServersOfType('APPLICATION_SERVER')
    for (nodename,servername) in servers:
        # Get the application manager MBean
        appManager = AdminControl.queryNames('cell=%s,node=%s,type=ApplicationManager,process=%s,*' %(cellname,nodename,servername))
        # stop it
        AdminControl.invoke(appManager, 'stopApplication', appname)
        # start it
        AdminControl.invoke(appManager, 'startApplication', appname)  
  
def _splitlines(s):
  rv = [s]
  if '\r' in s:
    rv = s.split('\r\n')
  elif '\n' in s:
    rv = s.split('\n')
  if rv[-1] == '':
    rv = rv[:-1]
  return rv
  
def extract_file(argv):
  dir_name = argv[0]
  remote_file_name = argv[1]
  local_file_name = argv[2]
  cellname = getCellName()
  remote_file_path = "cells/%s/%s/%s" % (cellname, dir_name, remote_file_name)
  if AdminConfig.existsDocument(remote_file_path):
    AdminConfig.extract(remote_file_path, local_file_name)
  
def checkin_file(argv):
  dir_name = argv[0]
  file_name = argv[1]
  cellname = getCellName()
  remote_file_path = "cells/%s/%s/%s" % (cellname, dir_name, file_name)
  local_file_name = file_name
  if AdminConfig.existsDocument(remote_file_path):
    AdminConfig.deleteDocument(remote_file_path)  
  AdminConfig.createDocument(remote_file_path, local_file_name )
  syncall() 

def stop_cluster(argv):
  if isND():
    clustername = argv[0]
    stopCluster(clustername)
    save()

def start_cluster(argv):
  if isND():
    clustername = argv[0]
    startCluster(clustername)
    save()

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
    raise JobManagerException("Transfer %s to dmgr failed." % path_on_node, job_token, node_hosts, 'CRRSE5E')
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


def fetch_logs (target_list, install_root, install_root_on_node, to_host):
  job_token = transfer_directory_to_dmgr(target_list, '/'.join( [install_root_on_node, 'logs'] ) , directory_name_on_dmgr)
  for node in target_list:
    try:
      shutil.rmtree(os.path.join(install_root, 'logs', node))
    except:
      pass
    path_on_dmgr = '/'.join( [job_token, node, directory_name_on_dmgr, '*'] )
    job_status = distribute_to_nodes([to_host], path_on_dmgr, os.path.join(install_root, 'logs/', node))

def remote_install_a_version (argv):
  path_on_me = os.getcwd()
  install_root = os.getcwd()
  install_root_on_node = getCellVariable("CONVERSION_INSTALL_ROOT")  
  me_hostname = argv[0]
  target_list = eval(argv[1])
  sym_count = int(argv[2])
  cluster_name = argv[3]
  path_on_nodes  = os.path.join(install_root_on_node, directory_name_on_nodes)
  path_on_nodes = path_on_nodes.replace('\\', '/')
  conversion_install_script = win_conversion_install_script
  remove_temp_script = win_remove_temp_script
  os_type = get_os_type(cluster_name)
  if os_type == 'linux':
    conversion_install_script = lin_conversion_install_script
    remove_temp_script = lin_remove_temp_script
  try:
    job_token = transfer_directory_to_dmgr([me_hostname], path_on_me, directory_name_on_dmgr)  
    path_on_dmgr = '/'.join( [job_token, me_hostname, directory_name_on_dmgr, '*'] )
    job_status = distribute_to_nodes(target_list, path_on_dmgr, path_on_nodes)
     
    run_script(target_list, conversion_install_script % (install_root_on_node.replace(' ', '__docsspace__'), sym_count), path_on_nodes)
    fetch_logs(target_list, install_root, install_root_on_node, me_hostname)
    # clear temp files
    run_script(target_list, remove_temp_script % (directory_name_on_nodes), install_root_on_node)
    print "jobmanager task complete successfully!"
  except JobManagerException, job_excptions:
    print retrive_job_failure_msg(job_excptions) 

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

def get_os_type(cluster_name):
  clusterMembers = listServersInCluster(cluster_name)
  node_list = [ AdminConfig.showAttribute( clusterMember, "nodeName" ) 
                 for clusterMember in clusterMembers ]  
  os_type = getNodePlatformOS(node_list[0]) # assuming that all the nodes having the same os type
  return os_type

def get_target_list(argv):
  cluster_name = argv[0]
  clusterMembers = listServersInCluster(cluster_name)
  hosts = []
  for clusterMember in clusterMembers:
    node_name = AdminConfig.showAttribute(clusterMember, "nodeName" )
    node_host_name = getNodeHostname(node_name)
    hosts.append(node_host_name)
  print "<was-query-result>%s</was-query-result>" % hosts
if __name__ == "__main__":
  import sys
  locals()[sys.argv[0]](sys.argv[1:])


