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
CONV_EAR_UPDATE = "false"
CONV_VERSION_PATH = "./conversion-version.txt"

CONV_CONFIG_PATH = "C:/Program Files/IBM/WebSphere/AppServer/profiles/AppSrv01/config/cells/"+socket.gethostname().split(".")[0]+"Node01Cell/IBMDocs-config/conversion-config.json"
CONVERSION_APP_NAME = "IBMConversion"
CONV_EAR_PATH = "./com.ibm.symphony.conversion.service.rest.was.ear.ear"
WAS_INSTALL_ROOT = "C:/Program Files/IBM/WebSphere/AppServer"
WAS_SOAP_PORT_CONV = "8880"
WAS_SERVER_CONV_NAME = "server1"
WAS_SERVICE_NAME_PREFIX = "was."
WAS_SERVICE_CONV_NAME = WAS_SERVICE_NAME_PREFIX+WAS_SERVER_CONV_NAME
WAS_PROFILE_CONV_NAME = "AppSrv01"
ZK_CONVERSION_PATH = '/topology/docs_cr/servers'

NATIVE_SRC = "./native.zip"
NATIVE_DEST = "%s/IBMConversion"
CONVERSIONLIB_DIR_NAME = "conversionlib"
WMF2PNG_DIR_NAME = "wmf2png"
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
  version_json_file.close()
  
  config_json["build-info"] = version_json

  config_json_file = open(json_file, 'w')
  json.dump( config_json, config_json_file, indent=2 )
  config_json_file.close()
      
if __name__ == "__main__":
    wasDir = WAS_INSTALL_ROOT
    zkPath = ZK_CONVERSION_PATH
    _init_log()
    #Register IP information with ZooKeeper
    zooKeeperClient = ZooKeeperClient()
    zooKeeperClient.publishRegistrySettings('DocsConversion')
    registerWithZookeeper(zooKeeperClient,zkPath)

    #Read the registry settings
    registryParser = RegistryParser()
    drive_disk = registryParser.getSetting('DocsConversion', 'docscr_drive_disk')
    if drive_disk:
      NATIVE_DEST = NATIVE_DEST % (drive_disk)
    else:
      NATIVE_DEST = NATIVE_DEST % ("D:")
    adminUsername = registryParser.getSetting('MiddlewareWebSphere', 'admin_username')
    adminPassword = registryParser.getSetting('MiddlewareWebSphere', 'admin_password')
    # non_admin_name mean non Windows administrator, adminUserName means WAS admin user name
    non_admin_name = adminUsername
    non_admin_password = adminPassword
    setDefaultAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_PROFILE_CONV_NAME)    
    logging.info('Stopping Conversion server base.')
    stop_base(WAS_SERVER_CONV_NAME,adminUsername, adminPassword)
    logging.info('Starting Conversion server base.')
    start_base(WAS_SERVER_CONV_NAME,adminUsername, adminPassword)   
    logging.info("Updating Conversion ear package.")
    if CONV_EAR_UPDATE == 'true':
        updateEar(CONVERSION_APP_NAME,CONV_EAR_PATH,WAS_SOAP_PORT_CONV, adminUsername,adminPassword)
        logging.info('IBM Conversion patching completed')  
        logging.info('Restarting conversion service.')
        modify_config_json(CONV_CONFIG_PATH,CONV_VERSION_PATH)
    if NATIVE_UPDATE == 'true':
        upgrade_native()
    logging.info('Stopping Conversion server base.')
    stop_base(WAS_SERVER_CONV_NAME,adminUsername, adminPassword)
    time.sleep(15)
    startWASService(WAS_SERVICE_CONV_NAME)
