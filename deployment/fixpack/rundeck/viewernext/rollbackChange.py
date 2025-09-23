import re, socket, sys, os, subprocess, shutil, stat, logging, fileinput, imp
import time, errno
from xml.dom import minidom
from datetime import datetime
from zipfile import ZipFile, ZipInfo
sys.path.append('/LotusLive/Lib/') #zookeeper and registryLib
sys.path.append('/LotusLive/Lib/nfs') 
from registryLib_win import *
from zooKeeperLib_win import *
import mountLib

try:
  import json
except ImportError: 
  import simplejson as json
  
#---------------------------------------------------------------------------------------------
# These configuration should changed before you run the patch command.
#---------------------------------------------------------------------------------------------
NATIVE_UPDATE = "false"
VIEWER_EAR_UPDATE = "true"
CONV_EAR_UPDATE = "true"
CONV_VERSION_PATH = "C:/ViewerNext/Conversion/installer/version.txt"
VIEWER_VERSION_PATH = "C:/ViewerNext/Viewer/installer/version.txt"

VIEWER_CONFIG_PATH = "C:/Program Files/IBM/WebSphere/AppServer/profiles/AppSrv1/config/cells/"+socket.gethostname().split(".")[0]+"Node01Cell/IBMDocs-config/viewer-config.json"
VIEWER_APP_NAME = "ViewerApp"
VIEWER_EAR_PATH = "C:/ViewerNext/Viewer/com.ibm.concord.viewer.ear.ear"
CONV_CONFIG_PATH = "C:/Program Files/IBM/WebSphere/AppServer/profiles/AppSrv2/config/cells/"+socket.gethostname().split(".")[0]+"Node02Cell/IBMDocs-config/conversion-config.json"
CONVERSION_APP_NAME = "IBMConversion"
CONV_EAR_PATH = "C:/ViewerNext/Conversion/com.ibm.symphony.conversion.service.rest.was.ear.ear"
WAS_INSTALL_ROOT = "C:/Program Files/IBM/WebSphere/AppServer"
WAS_SOAP_PORT_VIEWER = "8880"
WAS_SOAP_PORT_CONV = "8881"
WAS_SERVER_VIEWER_NAME = "serverViewerNextV"
WAS_SERVER_CONV_NAME = "serverViewerNextC"
WAS_SERVICE_NAME_PREFIX = "was."
WAS_SERVICE_VIEWER_NAME = WAS_SERVICE_NAME_PREFIX+WAS_SERVER_VIEWER_NAME
WAS_SERVICE_CONV_NAME = WAS_SERVICE_NAME_PREFIX+WAS_SERVER_CONV_NAME
WAS_PROFILE_VIEWER_NAME = "AppSrv1"
WAS_PROFILE_CONV_NAME = "AppSrv2"
ZK_VIEWERNEXT_PATH = '/topology/viewernext/servers'

NATIVE_SRC = "C:/ViewerNext/Conversion/native.zip"
NATIVE_DEST = "%s/IBMConversion"
CONVERSIONLIB_DIR_NAME = "conversionlib"
WMF2PNG_DIR_NAME = "wmf2png"

ONLINE_VERSION = None

class ZipCompat(ZipFile):
    def __init__(self, *args, **kwargs):
        ZipFile.__init__(self, *args, **kwargs)

    def extract(self, member, path=None, pwd=None):
        if not isinstance(member, ZipInfo):
            member = self.getinfo(member)
        if path is None:
            path = os.getcwd()
        return self._extract_member(member, path)

    def extractall(self, path=None, members=None, pwd=None):
        if members is None:
            members = self.namelist()
        for zipinfo in members:
            self.extract(zipinfo, path)

    def _extract_member(self, member, targetpath):
        if (targetpath[-1:] in (os.path.sep, os.path.altsep)
            and len(os.path.splitdrive(targetpath)[1]) > 1):
            targetpath = targetpath[:-1]
        if member.filename[0] == '/':
            targetpath = os.path.join(targetpath, member.filename[1:])
        else:
            targetpath = os.path.join(targetpath, member.filename)
        targetpath = os.path.normpath(targetpath)
        upperdirs = os.path.dirname(targetpath)
        if upperdirs and not os.path.exists(upperdirs):
            os.makedirs(upperdirs)
        if member.filename[-1] == '/':
            if not os.path.isdir(targetpath):
                os.mkdir(targetpath)
            return targetpath
        target = file(targetpath, "wb")
        try:
            target.write(self.read(member.filename))
        finally:
            target.close()
        return targetpath
  
def upgrade_native():
  logging.info("Start to upgrade native files...")
  logging.info("Stopping the OOXMLConverter processes...")
  if os.name == "nt":
    subprocess.call(["taskkill.exe", "/f", "/im", "OOXMLConvertor.exe"])
    time.sleep(10)   
  logging.info("Removing the old native files...");
  if os.path.exists(os.path.join(NATIVE_DEST, CONVERSIONLIB_DIR_NAME)):
    try:
      shutil.rmtree(os.path.join(NATIVE_DEST, CONVERSIONLIB_DIR_NAME), True)
    except Exception, e:
      pass
  if os.path.exists(os.path.join(NATIVE_DEST, WMF2PNG_DIR_NAME)):
    try:
      shutil.rmtree(os.path.join(NATIVE_DEST, WMF2PNG_DIR_NAME), True)
    except Exception, e:
      pass  
  if os.path.exists(NATIVE_SRC):
    zip_file = ZipCompat(NATIVE_SRC)
    zip_file.extractall(NATIVE_DEST)
  logging.info("Native files are upgraded successfully")
  return True
#---------------------------------------------------------------------------------------------
# Stop server with servername username password.
#---------------------------------------------------------------------------------------------
def stop_base(scopename,username,password):
  args = []
  args.extend([get_stop_server_cmd()])
  args.extend([scopename])
  args.extend(["-username", username ])
  args.extend(["-password", password ])
  
  ws_process = subprocess.Popen(args, stdin=subprocess.PIPE, \
    stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  ws_process.wait()
  ws_out = ws_process.stdout.read()
  ws_err = ws_process.stderr.read()
  if ws_out.find("Exception") > -1 or ws_err.find("Exception") > -1:  
    logging.error("Failed to the server." + \
    	"Detailed error info is"\
    	+ ws_out)
    return False
  
  logging.info("Wait 10 seconds for WAS related process to exit completed.")
  time.sleep(10)
    
  return True
  
#---------------------------------------------------------------------------------------------
# Start server with servername username password.
#---------------------------------------------------------------------------------------------
def start_base(scopename,username,password):
  args = []
  args.extend([get_start_server_cmd()])
  args.extend([scopename])
  args.extend(["-username", username ])
  args.extend(["-password", password ])
    
  ws_process = subprocess.Popen(args, stdin=subprocess.PIPE, \
    stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  ws_process.wait()
  ws_out = ws_process.stdout.read()
  ws_err = ws_process.stderr.read()
  if ws_out.find("Exception") > -1 or ws_err.find("Exception") > -1:  
    logging.error("Failed to start the server." + \
    	"Detailed error info is"\
    	+ ws_out)
    return False
    
  logging.info("Wait 10 seconds for WAS process to be in STARTED status.")
  time.sleep(10)
  return True
  
def get_stop_server_cmd():
  cmd = ""
  if os.name == "nt":
    cmd = WAS_INSTALL_ROOT + os.sep + "bin" + os.sep + "stopServer.bat"
  else:
    cmd = WAS_INSTALL_ROOT + os.sep + "bin" + os.sep + "stopServer.sh"
    
  return cmd

def get_start_server_cmd():
  cmd = ""
  if os.name == "nt":
    cmd = WAS_INSTALL_ROOT + os.sep + "bin" + os.sep + "startServer.bat"
  else:
    cmd = WAS_INSTALL_ROOT + os.sep + "bin" + os.sep + "startServer.sh"
    
  return cmd



#---------------------------------------------------------------------------------------------
# Start a server via Windows Service
#---------------------------------------------------------------------------------------------
def startWASService(serviceName, installDir=WAS_INSTALL_ROOT):
   cmd = ' "%s/bin/wasservice.exe" -start %s' % (installDir, serviceName)
   print cmd
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while starting server %s' % (retval, serviceName))
      
#---------------------------------------------------------------------------------------------
# Push IP information to ZooKeeper
#---------------------------------------------------------------------------------------------
def registerWithZookeeper(zooKeeperClient,zkPath):
   print 'Publishing server information with ZooKeeper...'
   try:
      zooKeeperClient.createEphemeralNodes(zkPath, 'SEQUENTIAL')
   except:
      print 'Error while attempting to publish server details with ZooKeeper'
      raise
   print 'Server published on ZooKeeper'
   
#---------------------------------------------------------------------------------------------
# Update app with ear path
#---------------------------------------------------------------------------------------------
def updateEar(appName, earPath ,port ,user ,password):
   cmd = get_was_cmd_line(port,user,password)
   #subcmd = 'AdminApp update %s app {-operation update -contents %s};AdminConfig save' % (appName,earPath)
   subcmd = "AdminApp.update('%s','app',['-operation', 'update', '-contents', '%s']);AdminConfig.save()" % (appName,earPath)
   cmd.extend(['-c',subcmd])
   print cmd
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while stopping server %s' % (retval, serviceName))
      
#---------------------------------------------------------------------------------------------
# Stop a server by Windows Service
#---------------------------------------------------------------------------------------------
def stopWASService(serviceName, installDir=WAS_INSTALL_ROOT):
   cmd = ' "%s/bin/wasservice.exe" -stop %s' % (installDir, serviceName)
   print cmd
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while stopping server %s' % (retval, serviceName))
      
def setDefaultAppSrvProfile(wasDir, adminUsername, adminPassword, profileName):
   hostname = socket.gethostname().split('.')[0]
   adminUsername = adminUsername.encode('ascii','ignore')
   print 'Setting default profile to %s' % (profileName)
   try:
      cmd = [ '"%s/bin/manageprofiles.bat"' % wasDir,
              '-setDefaultName', '-profileName', profileName ]
      #print cmd
      p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      for line in p.stdout.readlines():
         print line.strip('\n')
      retval = p.wait()
      if retval:
         raise Exception('RC %s while settting default WebSphere profile' % (retval))
   except:
      print 'Error:  Failed to set default profile'
      raise Exception("Exception: %s %s" % (sys.exc_type, sys.exc_value))

def get_was_cmd_line(port,user,password):
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
   
def _init_log():
  #cfg = config.Config()
  logging.basicConfig(level=logging.DEBUG,\
	format='%(asctime)s %(levelname)s %(message)s',\
	filename='./Patching_%s.log' % (datetime.now().strftime("%Y-%m-%d")),\
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
  global ONLINE_VERSION
  ONLINE_VERSION = version_json["build_timestamp"]
  version_json_file.close()
  
  config_json["build-info"] = version_json

  config_json_file = open(json_file, 'w')
  json.dump( config_json, config_json_file, indent=2 )
  config_json_file.close()
  
#---------------------------------------------------------------------------------------------
# Is the current ViewerNext server in charge of the Multactive service?
#---------------------------------------------------------------------------------------------
def isMultiactiveOwner():
  try:
    hostname = zooKeeperClient.getHostname('/topology/viewernext/servers/1')
    if(hostname == "null" or hostname in [None,'']):
      logging.info("Could not get multiactive owner hostname from zookeeper, pls check the installation script.")
      return False
    owner_short_hostname = hostname.split(".")[0]
    local_short_hostname = socket.gethostname().split(".")[0]
    logging.info("Multiactive service for ViewerNext is [owner: %s, local: %s]" % (owner_short_hostname, local_short_hostname))
    if owner_short_hostname != local_short_hostname:
      logging.info("Skip to maintain Multiactive service for IBM ViewerNext Server [hostname: %s]" % (local_short_hostname))
      return False
  except Exception,e:
    logging.info(e)
    return False      
  return True

#---------------------------------------------------------------------------------------------
# Update zookeeper node
#---------------------------------------------------------------------------------------------
def updateZookeeperNode():	
  logging.info("The rollback version is %s" % ONLINE_VERSION)
  if (ONLINE_VERSION in [None,'']):
    logging.error("Severe error - the version to be rollbacked is empty.")
    return
  try:
    baseTN = registryParser.getBaseTopologyName()
    side = registryParser.getTopologyName()
    versionPath = '/%s/data/viewer/version/%s' %(baseTN, side)
    sideValue = zooKeeperClient.getData(versionPath)
    if (sideValue == "null" or sideValue in [None,'']):
      logging.info("Create node %s on zookeeper and its value is %s" % (versionPath, ONLINE_VERSION))   
      zooKeeperClient.createNode(versionPath, ONLINE_VERSION)
      return
    else:
      logging.info("Old %s Viewer version is %s" % (side, sideValue))
      if(sideValue != ONLINE_VERSION):
        zooKeeperClient.setData(versionPath, ONLINE_VERSION)
        logging.info("New %s Viewer version is %s" % (side, ONLINE_VERSION))        	  	
      else:
        logging.info("Rollback failover case - no new version is online.")
  except Exception,e:
    logging.error(e)
    raise

if __name__ == "__main__":
    wasDir = WAS_INSTALL_ROOT
    zkPath = ZK_VIEWERNEXT_PATH
    _init_log()
    #Register IP information with ZooKeeper
    zooKeeperClient = ZooKeeperClient()
    zooKeeperClient.publishRegistrySettings('ViewerNext')
    registerWithZookeeper(zooKeeperClient,zkPath)

    #Read the registry settings
    registryParser = RegistryParser()
    drive_disk = registryParser.getSetting('ViewerNext', 'docscr_drive_disk')
    if drive_disk:
      NATIVE_DEST = NATIVE_DEST % (drive_disk)
    else:
      NATIVE_DEST = NATIVE_DEST % ("C:")
    adminUsername = registryParser.getSetting('MiddlewareWebSphere', 'admin_username')
    adminPassword = registryParser.getSetting('MiddlewareWebSphere', 'admin_password')
    # non_admin_name mean non Windows administrator, adminUserName means WAS admin user name
    non_admin_name = adminUsername
    non_admin_password = adminPassword
    ########################################################################
    if CONV_EAR_UPDATE == 'true':
       setDefaultAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_PROFILE_CONV_NAME)    
       logging.info('Stopping Conversion server base.')
       stop_base(WAS_SERVER_CONV_NAME,adminUsername, adminPassword)
       logging.info('Starting Conversion server base.')
       start_base(WAS_SERVER_CONV_NAME,adminUsername, adminPassword)   
       logging.info("Updating Conversion ear package.")
       updateEar(CONVERSION_APP_NAME,CONV_EAR_PATH,WAS_SOAP_PORT_CONV, adminUsername,adminPassword)
       if NATIVE_UPDATE == 'true':
          upgrade_native()
       logging.info('IBM Conversion patching completed')  
       logging.info('Restarting conversion service.')
       modify_config_json(CONV_CONFIG_PATH,CONV_VERSION_PATH)
       logging.info('Stopping Conversion server base.')
       stop_base(WAS_SERVER_CONV_NAME,adminUsername, adminPassword)
       time.sleep(15)
       startWASService(WAS_SERVICE_CONV_NAME)
    ###########################################################################################  
    if VIEWER_EAR_UPDATE == "true":   
       setDefaultAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_PROFILE_VIEWER_NAME)
       logging.info('Stopping Viewer server base.')
       stop_base(WAS_SERVER_VIEWER_NAME,adminUsername, adminPassword)
       logging.info('Starting Viewer server base.')
       start_base(WAS_SERVER_VIEWER_NAME,adminUsername, adminPassword)   
       logging.info("Updating ViewerApp ear package.")
       updateEar(VIEWER_APP_NAME,VIEWER_EAR_PATH,WAS_SOAP_PORT_VIEWER,adminUsername,adminPassword)
       logging.info('IBM Viewer patching completed')
       logging.info('Restarting viewer service.')
       modify_config_json(VIEWER_CONFIG_PATH,VIEWER_VERSION_PATH)
       logging.info('Stopping Viewer server base.')
       stop_base(WAS_SERVER_VIEWER_NAME,adminUsername, adminPassword)
       time.sleep(15)
       startWASService(WAS_SERVICE_VIEWER_NAME)
       if isMultiactiveOwner():
          updateZookeeperNode()

