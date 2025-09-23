import os
import time

win_remove_temp_script = '[rmdir %s /s /q]'
lin_remove_temp_script = '[rm -rf %s]'

directory_name_on_nodes = 'validate_docs_%s'
directory_name_on_dmgr = 'validate_docs'

conversion_install_script = '[powershell -executionpolicy RemoteSigned -File remote_starter.ps1 -zip docs_remote_installer.zip -action %s -wasadminID %s -wasadminPW %s -time %s -installroot %s]'
docs_lin_install_script = '[sh remote_starter.sh -zip docs_remote_installer.zip -action %s -wasadminID %s -wasadminPW %s -time %s -installroot %s]'
docs_win_install_script = '[cmd.exe -executionpolicy RemoteSigned -File remote_validator.bat ]'

collection_args = '[-jobType collectFile -targetList [%s] -description collectFile -jobParams [ [source [%s]] [destination %s]  ]]'
distribute_args = '[-jobType distributeFile -targetList [%s] -description distributeFile -jobParams [ [destination [%s]] [source %s ] ] ]'
run_script_args = '[-jobType runCommand -targetList [%s] -description runCommand -jobParams [ [command %s] [workingDir [%s]] ]]'
delete_job_args = '[-jobToken %s]'
job_query_args = '[-jobToken %s]'

#@1,working dir
#@2,nfs server ip/hostname for docs
#@3,nfs server exported share point for docs
#@4,nfs server ip/hostname for viewer
#@5,nfs server exported share point for viewer
#@6,mount dirver for docs
#@7,mount dirver for viewer

conv_nfs_validate_win = '[remote_validator_nfs_conv.bat %s %s %s %s %s %s %s ]'
#conv_nfs_validate_win = 'remote_validator_nfs_conv.bat %s %s %s %s %s %s %s'
docs_nfs_validate_linux = '[sh remote_validator_nfs_docs.sh %s %s %s %s ]'

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
  
def wait_job (jt, time_out=240):
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

class JobManagerException(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)
    
# run script on remote machine
def run_script (targets, cmd_script, cmd_script_directory):
  print run_script_args % ( ' '.join( targets ), cmd_script, cmd_script_directory)
  job_token = AdminTask.submitJob ( run_script_args % ( ' '.join( targets ), cmd_script, cmd_script_directory)  )
  if not wait_job(job_token, 360):
    raise JobManagerException("Run script %s failed." % cmd_script)
  AdminTask.deleteJob( delete_job_args % (job_token) )

def distribute_to_nodes (node_list, path_on_dmgr, path_on_node):
  print distribute_args % ( ' '.join( node_list ), path_on_node, path_on_dmgr)
  job_token = AdminTask.submitJob ( distribute_args % ( ' '.join( node_list ), path_on_node, path_on_dmgr) )
  if not wait_job(job_token):
    raise JobManagerException("Distribute %s to nodes failed." % path_on_dmgr)
  AdminTask.deleteJob( delete_job_args % (job_token) )
  
def transfer_directory_to_dmgr (node_hosts, path_on_node, path_on_dmgr):
  print collection_args % (' '.join( node_hosts ), path_on_node + "/*", path_on_dmgr)
  job_token = AdminTask.submitJob(collection_args % (' '.join( node_hosts ), path_on_node + "/*", path_on_dmgr) )
  if not wait_job(job_token):
    raise JobManagerException("Transfer %s to dmgr failed." % path_on_node)
  AdminTask.deleteJob( delete_job_args % (job_token) )
  return job_token

def transfer_file_to_dmgr (node_hosts, path_on_node, path_on_dmgr):
  print collection_args % (' '.join( node_hosts ), path_on_node + "/*", path_on_dmgr)
  job_token = AdminTask.submitJob(collection_args % (' '.join( node_hosts ), path_on_node, path_on_dmgr) )
  if not wait_job(job_token):
    raise JobManagerException("Transfer %s to dmgr failed." % path_on_node)
  AdminTask.deleteJob( delete_job_args % (job_token) )
  return job_token
  
def fetch_logs (target_list, install_root, path_on_node, to_host, logfile):
  job_token = transfer_directory_to_dmgr(target_list, path_on_node , directory_name_on_dmgr)
  for node in target_list:
    try:
      #shutil.rmtree(os.path.join(install_root, 'logs', node))
      os.remove(os.path.join(install_root, 'logs', node, logfile))
    except:
      pass
    path_on_dmgr = '/'.join( [job_token, node, directory_name_on_dmgr, '*'] )
    job_status = distribute_to_nodes([to_host], path_on_dmgr, os.path.join(install_root, 'logs/', node))

def remote_validate_nfs_check_conv (argv):  
  if len(argv) < 9:
    print "Invalid parameters for Conversion nfs check..."
  else:  
    #target host list, hostname1:hostname2
    target_list = argv[0].split(':')
    #nfs host ip, docs nfs server ip/hostname:viewer nfs server ip/hostname
    nfs_server_info = argv[1].split(':')
    #nfs exported points, docs:/nfs/docs_data;viewer:/nfs/viewer_data
    nfs_share_points = argv[2].split(':')
    #local driver for docs
    local_driver_docs = argv[3]
    #local driver for viewer
    local_driver_viewer = argv[4]
    #node path for node working dir
    dir_on_nodes = argv[5]
    #timetamp
    timestamp = argv[6]    
    #local host name
    me_hostname = argv[7]
    #local work directory for remote log
    local_path = argv[8]
    
    path_on_nodes  = os.path.join(dir_on_nodes, timestamp)
    path_on_nodes = path_on_nodes.replace('\\', '/')

    job_token = transfer_directory_to_dmgr([me_hostname], '/'.join([local_path,'jobscript']), directory_name_on_dmgr)
  
    path_on_dmgr = '/'.join( [job_token, me_hostname, directory_name_on_dmgr, '*'] )
    job_status = distribute_to_nodes(target_list, path_on_dmgr, path_on_nodes)
          
    run_script(target_list, conv_nfs_validate_win % (path_on_nodes, nfs_server_info[0], nfs_share_points[0], nfs_server_info[1],nfs_share_points[1], local_driver_docs, local_driver_viewer),path_on_nodes )

    fetch_logs(target_list, local_path, '/'.join([path_on_nodes,'logs']), me_hostname,'conv_nfs_check.log')

    # clear temp files
    run_script(target_list, win_remove_temp_script % (timestamp), dir_on_nodes)
    
    #print "jobmanager task for Conversion nfs check complete successfully!"
    
def remote_validate_nfs_check_docs (argv):  
  if len(argv) < 8:
    print "Invalid parameters for Docs nfs check..."
  else:
    #target host list, hostname1:hostname2
    target_list = argv[0].split(':')
    #nfs host ip, docs nfs server ip/hostname
    nfs_server_info = argv[1]
    #nfs exported points, docs:/nfs/docs_data
    nfs_share_point_docs = argv[2]    
    #timetamp
    timestamp = argv[3]
    #local host name
    me_hostname = argv[4]
    #local work directory for remote log
    local_path = argv[5]
    #work dir on node
    dir_on_nodes = argv[6]
    #local point for docs
    local_driver_docs = argv[7]
    
    path_on_nodes  = os.path.join(dir_on_nodes, timestamp)
    path_on_nodes = path_on_nodes.replace('\\', '/')

    job_token = transfer_directory_to_dmgr([me_hostname], '/'.join([local_path,'jobscript']), directory_name_on_dmgr)
  
    path_on_dmgr = '/'.join( [job_token, me_hostname, directory_name_on_dmgr, '*'] )
    job_status = distribute_to_nodes(target_list, path_on_dmgr, path_on_nodes)
          
    run_script(target_list, docs_nfs_validate_linux % (path_on_nodes, nfs_server_info,nfs_share_point_docs,local_driver_docs),path_on_nodes )

    fetch_logs(target_list, local_path, '/'.join([path_on_nodes,'logs']), me_hostname,'docs_nfs_check.log')

    # clear temp files
    run_script(target_list, lin_remove_temp_script % (timestamp), dir_on_nodes)

    #print "jobmanager task for Docs nfs check complete successfully!"

def remote_validate_nfs_check_conv_docs(argv):
  #conv_hostname1/ip1:hostname2/ip2;docs_hostname1/ip1:hostname2/ip2;nfs-server-hostname-4-docs:viewer;nfs-docs-dir:nfs-viewer-dir;docs-driver;viewer-driver;
  #dir-on-nodes-conv;timestamp;me-hostname;local-work-dir;dir-on-nodes-docs;docs-local-point
  all_parameters = argv[1].split(';')
  if len(all_parameters) < 12:
     print "Invalid parameters for Conversion and Docs nfs check..."
  else:
    print "all_parameters: "
    print all_parameters
    conv_parameters = []
    conv_parameters.append(all_parameters[0])
    print conv_parameters
    conv_parameters.extend(all_parameters[2:10])
    print conv_parameters
    remote_validate_nfs_check_conv(conv_parameters)
    
    docs_parameters = []
    docs_parameters.append(all_parameters[1])
    print "docs_parameters: "
    print docs_parameters
    nfs_server = all_parameters[2].split(':')
    nfs_share_points = all_parameters[3].split(':')
    docs_parameters.append(nfs_server[0])
    docs_parameters.append(nfs_share_points[0])
    print docs_parameters
    docs_parameters.extend(all_parameters[7:12])
    print docs_parameters
    remote_validate_nfs_check_docs(docs_parameters)

if __name__ == "__main__":  
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  type = sys.argv[0]
  if type.lower() == 'convnfs':
    #parameter format
    #hostname1/ip1:hostname2/ip2;nfs-server-hostname-4-docs:viewer;nfs-docs-dir:nfs-viewer-dir;docs-driver;viewer-driver;
    #work-dir-on-nodes;timestamp;me-hostname;local-work-dir
    parameters = sys.argv[1].split(';')
    remote_validate_nfs_check_conv(parameters)
    print "jobmanager task for Conversion nfs check complete successfully!"
  elif type.lower() == 'docsnfs':
    #parameter format
    #hostname1/ip1:hostname2/ip2;nfs-server-hostname-4-docs;nfs-docs-dir;docs-driver;
    #timestamp;me-hostname;local-work-dir;docs-local-point
    parameters = sys.argv[1].split(';')
    remote_validate_nfs_check_docs(parameters)
    print "jobmanager task for Docs nfs check complete successfully!"
  elif type.lower() == 'conv_docs_nfs':
    remote_validate_nfs_check_conv_docs(sys.argv)
    print "jobmanager task for Conversion and Docs nfs check complete successfully!"
  else:
    print "Action::::None"
  