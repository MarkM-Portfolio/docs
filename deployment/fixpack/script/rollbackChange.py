import re, socket, sys, os, subprocess, shutil, stat, logging, fileinput, imp
import time, errno
from datetime import datetime
try:
  import json
except ImportError: 
  import simplejson as json
  
#---------------------------------------------------------------------------------------------
# These configuration should be changed before you run the patch command.
#---------------------------------------------------------------------------------------------
DOCS_EAR_UPDATE = "true"
DOCS_WEB_RESOURCE_UPDATE = "true"
WAS_INSTALL_ROOT = "/opt/IBM/WebSphere/AppServer"
WAS_SOAP_PORT = "8880"
WAS_PROFILE_NAME = "AppSrv01"
DOCS_CELL_NAME = socket.gethostname().split(".")[0] + "Node01Cell"
DOCS_NODE_NAME = "ocs_app_node_" + socket.gethostname().split(".")[0]
DOCS_SERVER_NAME = "server1"
DOCS_CONFIG_PATH = "/opt/IBM/WebSphere/AppServer/profiles/AppSrv01/config/cells/" + DOCS_CELL_NAME + "/IBMDocs-config/concord-config.json"
DOCS_APP_NAME = "IBMDocs"
DOCS_EAR_PATH = "/opt/IBM/IBMDocs/product/com.ibm.concord.ear.ear"
DOCS_WEB_RESOURCE_APP_NAME ="IBMDocsWebResources"
DOCS_WEB_RESOURCE_EAR_PATH = "/opt/IBM/IBMDocs/product/com.ibm.docs.web.resources.ear.ear"
DOCS_VERSION_PATH = "/opt/IBM/IBMDocs/installer/version.txt"
       
#---------------------------------------------------------------------------------------------
# Update app with ear path
#---------------------------------------------------------------------------------------------
def updateEar(appName, earPath ,port ,user ,password):
  cmd = get_was_cmd_line(port,user,password)
  #subcmd = 'AdminApp update %s app {-operation update -contents %s};AdminConfig save' % (appName,earPath)
  subcmd = "AdminApp.update('%s','app',['-operation', 'update', '-contents', '%s']);AdminConfig.save()" % (appName,earPath)
  cmd.extend(['-c',subcmd])
  logging.debug(cmd)
  p = subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  ws_out = p.communicate()[0]
  p.wait()
  if ws_out.find("Exception") > -1:   
    raise Exception ("Exception thrown while updating application %s: %s"%(appName, ws_out))  
      
def setDefaultAppSrvProfile(wasDir, profileName):
  logging.info('Setting default profile to %s' % (profileName))
  cmd = [ '%s/bin/manageprofiles.sh' % wasDir,'-setDefaultName', '-profileName', profileName ]
  logging.debug(cmd)
  p = subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  ws_out = p.communicate()[0]
  p.wait()
  if ws_out.find("Exception") > -1:
    raise Exception("Exception thrown while settting default WebSphere profile: %s" % ws_out)

def get_was_cmd_line(port, user, password):
  args = []
  args.extend([get_wsadmin_script()])
  args.extend(["-lang", "jython"])
  args.extend(["-port", port])
  args.extend(["-user", user])
  args.extend(["-password", password])
  return args
    
def get_wsadmin_script():
  was_admin = ""
  if os.name == "nt":
    was_admin = WAS_INSTALL_ROOT + "/bin/wsadmin.bat"
  else:
    was_admin = WAS_INSTALL_ROOT + "/bin/wsadmin.sh"
  return was_admin

def restartApplication(appName, port, user, password):
  cmd = get_was_cmd_line(port,user,password)
  subcmd = "appManager=AdminControl.queryNames('cell=%s,node=%s,type=ApplicationManager,process=%s,*');"%(DOCS_CELL_NAME,DOCS_NODE_NAME,DOCS_SERVER_NAME) + "AdminControl.invoke(appManager, 'stopApplication', '%s');"%(appName) + "AdminControl.invoke(appManager, 'startApplication', '%s')"%(appName)
  cmd.extend(['-c',subcmd])
  logging.debug(cmd)
  p = subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  ws_out = p.communicate()[0]
  p.wait()
  if ws_out.find("Exception") > -1:
    raise Exception("Exception thrown while restart application %s: %s"%(appName, ws_out))     

def _init_log():
  #cfg = config.Config()
  logging.basicConfig(level=logging.DEBUG,\
	format='%(asctime)s %(levelname)s %(message)s',\
	filename='./rollback_%s.log' % (datetime.now().strftime("%Y-%m-%d")),\
	filemode='w')

  console = logging.StreamHandler()
  console.setLevel(logging.INFO)
  formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)

def modify_config_json(json_file, version_file):

  config_json_file = open( json_file)
  config_json =  json.load(config_json_file)
  config_json_file.close()

  version_json_file = open( version_file)
  version_json =  json.load(version_json_file)
  version_json_file.close()
  
  config_json["build-info"] = version_json

  config_json_file = open(json_file, 'w')
  json.dump( config_json, config_json_file, indent=2 )
  config_json_file.close()
          
if __name__ == "__main__":
  wasDir = WAS_INSTALL_ROOT
  _init_log()
   
  if (len(sys.argv) < 3):
    logging.info('Insufficient arguments specified.')
    sys.exit(1)
  # endif

  adminUsername = sys.argv[1]
  adminPassword = sys.argv[2]
  
  try:
    setDefaultAppSrvProfile(wasDir, WAS_PROFILE_NAME)  
    if DOCS_WEB_RESOURCE_UPDATE == 'true':
      logging.info("Starting to update IBMDocsWebResources ear package.")
      updateEar(DOCS_WEB_RESOURCE_APP_NAME, DOCS_WEB_RESOURCE_EAR_PATH, WAS_SOAP_PORT, adminUsername, adminPassword)
      logging.info('Update IBMDocsWebResources ear completed.')
      modify_config_json(DOCS_CONFIG_PATH, DOCS_VERSION_PATH) 
    if DOCS_EAR_UPDATE == 'true':
      logging.info("Starting to update IBMDocs ear package.")
      updateEar(DOCS_APP_NAME, DOCS_EAR_PATH, WAS_SOAP_PORT, adminUsername, adminPassword)
      logging.info('Update IBMDocs ear completed.')
    else:
      logging.info('Restarting IBMDocs App...')
      restartApplication(DOCS_APP_NAME, WAS_SOAP_PORT, adminUsername, adminPassword)
    logging.info('Rollback Docs completed.')
    print 'SUCCESS!'
  except Exception, e:
    logging.info(e)    	        	
    