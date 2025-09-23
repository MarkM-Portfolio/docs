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

CONVERSION_APP_NAME = "IBMConversionSanity"
CONV_SANITY_EAR_PATH = "./com.ibm.docs.sanity.ear"
WAS_INSTALL_ROOT = "C:/Program Files/IBM/WebSphere/AppServer"
WAS_SOAP_SANITY_CONV = "8880"
ZK_CONVERSION_PATH = '/topology/docs_cr/servers'

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

    adminUsername = registryParser.getSetting('MiddlewareWebSphere', 'admin_username')
    adminPassword = registryParser.getSetting('MiddlewareWebSphere', 'admin_password')
    # non_admin_name mean non Windows administrator, adminUserName means WAS admin user name
    non_admin_name = adminUsername
    non_admin_password = adminPassword   

    logging.info("Updating Conversion Sanity ear package.")
    updateEar(CONVERSION_APP_NAME,CONV_SANITY_EAR_PATH,WAS_SOAP_SANITY_CONV, adminUsername,adminPassword)
    logging.info('IBM Conversion Sanity patching completed')
