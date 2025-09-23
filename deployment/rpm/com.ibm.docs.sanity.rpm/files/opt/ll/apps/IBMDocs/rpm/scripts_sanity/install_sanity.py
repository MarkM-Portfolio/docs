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

'The module install sanity ear'
import os
import os.path
import logging
import subprocess
import sys
import socket

def _init_log():  

  log_dir ='/opt/ll/logs/SC-Docs-Config'
  log_path = log_dir + os.sep + 'SanityInstall.log'
  
  if not os.path.exists(log_dir):
    os.makedirs(log_dir)

  logging.basicConfig(level=logging.DEBUG,
                      format='%(asctime)s %(levelname)s %(message)s',
                      filename=log_path,
                      filemode='w')

  console = logging.StreamHandler()
  console.setLevel(logging.INFO)
  formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)

def get_was_nodename():
  hostname = socket.gethostname().split('.')[0]
  was_nodename = 'ocs_app_node_%s' % hostname
  return  was_nodename

def call_wsadmin(args):
  #print args
  ws_log = open("wsadmin.log", "w")
  ws_process = subprocess.Popen(args, \
    stdout=ws_log, stderr=ws_log, shell=True)
  ws_process.wait()
  ws_log.close()
  ws_log = open("wsadmin.log", "r")
  ws_out = ws_log.read()
  ws_log.close()
  
  if ws_out.find("Exception") > -1:  
    logging.error("Exception thrown while executing WebSphere command:" + ws_out)
    return (False, ws_out)
  logging.debug("Websphere admin execution result:" + ws_out)
  return (True, ws_out)

def set_permissions(username,groupname,path,recursive=False):
    
    recursive_tag = ''
    if recursive:
         recursive_tag = '-RL'
    cmds = [
            'chmod -R 755 %s' % path,
            'chown %s %s:%s %s' % (recursive_tag,username,groupname,path)]
    

    for cmd in cmds:
        p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT);
        output = p.communicate()[0]
        #print output
        retval = p.returncode
        if retval:
            raise Exception('RC %s while updating folder permission (%s)' % (retval,cmd))

def install_sanity():
  sys.path.append('/opt/ll/lib/registry')
  from registryLib import RegistryParser

  ear_path = os.path.abspath('../com.ibm.docs.sanity.ear')
  registryParser = RegistryParser()
  was_username = registryParser.getSetting('MiddlewareWebSphere','admin_username')
  was_password = registryParser.getSetting('MiddlewareWebSphere','admin_password')
  
  set_permissions('websphere','websphere','/opt/ll/apps/IBMDocs',True)
  #args = ['sudo -u websphere /opt/IBM/WebSphere/AppServer/bin/wsadmin.sh']
  args = ['su -c "/opt/IBM/WebSphere/AppServer/bin/wsadmin.sh']
  args.extend(['-lang','jython'])
  args.extend(['-port','8880'])
  args.extend(['-user',was_username])
  args.extend(['-password',was_password])
  args.extend(['-f',os.path.abspath('./deploy_ear.py')])
  args.extend([ear_path])
  args.extend(['IBMDocsSanity'])
  args.extend(['server']) #scope name
  args.extend(['server1']) # server anme
  args.extend([get_was_nodename()])
  args.extend(['"','websphere'])
  print args
  succ, ws_out = call_wsadmin(' '.join(args))
  if not succ:
    logging.info('Install Sanity EAR application failed')
    return False
  logging.info("Install Sanity EAR application completed")
  return True



if __name__ == '__main__' :

  _init_log()

  install_sanity()
