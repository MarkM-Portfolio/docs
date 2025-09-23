import re, socket, sys, os, subprocess, shutil, stat, logging, fileinput, imp, threading, zipfile
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
CONV_VERSION_PATH = "./conversion-version.txt"
VIEWER_VERSION_PATH = "./viewer-version.txt"

VIEWER_CONFIG_PATH = "C:/Program Files/IBM/WebSphere/AppServer/profiles/AppSrv1/config/cells/"+socket.gethostname().split(".")[0]+"Node01Cell/IBMDocs-config/viewer-config.json"
VIEWER_APP_NAME = "ViewerApp"
VIEWER_EAR_PATH = "./com.ibm.concord.viewer.ear.ear"
CONV_CONFIG_PATH = "C:/Program Files/IBM/WebSphere/AppServer/profiles/AppSrv2/config/cells/"+socket.gethostname().split(".")[0]+"Node02Cell/IBMDocs-config/conversion-config.json"
CONVERSION_APP_NAME = "IBMConversion"
CONV_EAR_PATH = "./com.ibm.symphony.conversion.service.rest.was.ear.ear"
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

MOUNTDRIVE = "K:"
VIEWER_EAR_FILE = "./com.ibm.concord.viewer.ear.ear"
SHARED_DIR = r"%s/webresource" % (MOUNTDRIVE)
VIEWER_WAR_FILE = "./viewTmp/com.ibm.concord.viewer.war.war"
RESOURCE_ROOT = "./viewTmp/warTmp/static"
VIEWER_TMP = "./viewTmp"
VIEWER_WAR_TMP = "./viewTmp/warTmp"
ONLINE_VERSION = None
OFFILE_VERSION = None

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

#---------------------------------------------------------------------------------------------
# execute commands such as mount, umount, etc.
#---------------------------------------------------------------------------------------------
def executeCommand(command, obfuscate=None):
  log = 'Executing: '
  if obfuscate:
    log += command.replace(obfuscate, '***')
  else:
    log +=  command
  print log
  p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate()[0]
  print output
  if p.returncode:
    raise Exception('Error executing command: ' + output)
  print 'Command successful.'
  
  return output
#---------------------------------------------------------------------------------------------
# Mount the file system
#---------------------------------------------------------------------------------------------
def mount(nasViewerHostname,nasViewerMountPoint):
  logging.info('Mount for rundesk ViewerNext patch - %s:%s' % (nasViewerHostname,nasViewerMountPoint))  
  executeCommand("mount -o mtype=soft casesensitive=yes anon %s:%s %s" % (nasViewerHostname, nasViewerMountPoint, MOUNTDRIVE))

#---------------------------------------------------------------------------------------------
# Unmount the file system
#---------------------------------------------------------------------------------------------
def unmount():
  try:
    logging.info('Umount drive %s for rundesk ViewerNext patch.' %(MOUNTDRIVE))
    executeCommand("umount -f %s" % (MOUNTDRIVE))
  except:
    logging.info('Error umounting share at %s, please investigate and try again' % (MOUNTDRIVE))
    
#---------------------------------------------------------------------------------------------
# Copy the whole ear package to nfs server
#---------------------------------------------------------------------------------------------
def copyResources():
  try:
    logging.info('Copying from %s to NFS server %s. It will take a few minutes...' % (RESOURCE_ROOT,SHARED_DIR))
    if not os.path.exists(RESOURCE_ROOT):
      raise Exception('Viewer application package does not exist.')
    copyFiles(RESOURCE_ROOT,SHARED_DIR)
    logging.info('Copied successfully.')
  except Exception,e:
    logging.error(e)
    logging.info('Failed to copy ear package %s to NFS server %s' % (RESOURCE_ROOT,SHARED_DIR))
    raise

#---------------------------------------------------------------------------------------------
# Copy files from source directory to target directory
#---------------------------------------------------------------------------------------------
def copyFiles(sourceDir, targetDir):
  for f in os.listdir(sourceDir):
    sourceF = os.path.join(sourceDir, f)
    targetF = os.path.join(targetDir, f)
    if os.path.isfile(sourceF):
      if not os.path.exists(targetDir):
        os.makedirs(targetDir)
      if not os.path.exists(targetF) or (os.path.exists(targetF) and (os.path.getsize(targetF) != os.path.getsize(sourceF))):
        open(targetF, "wb").write(open(sourceF, "rb").read())
    if os.path.isdir(sourceF):
      copyFiles(sourceF, targetF)

#---------------------------------------------------------------------------------------------
# Check if the data volume is accessable
#---------------------------------------------------------------------------------------------
def mkDirOnNFS(webresource):
  expstr = "Error happens when creating viewer web resource %s " %(webresource) + ":, please check if disk exists."
  try:
    if not os.path.exists(webresource):
      os.mkdir(webresource)
    if not os.path.exists(webresource):
      raise Exception(expstr)
  except Exception,e:
      logging.error(e)	
  logging.info('Shared web resource directory for Viewer %s. has been well created.' % (webresource))
 
#---------------------------------------------------------------------------------------------
# unzip a zipped file
#---------------------------------------------------------------------------------------------   
def unzip_file(zipfilename, unziptodir):
  if not os.path.exists(unziptodir):
    os.mkdir(unziptodir)
  zfobj = zipfile.ZipFile(zipfilename)
  for name in zfobj.namelist():
    name = name.replace('\\','/')        
    if name.endswith('/'):
      os.mkdir(os.path.join(unziptodir, name))
    else:            
      ext_filename = os.path.join(unziptodir, name)
      ext_dir= os.path.dirname(ext_filename)
      if not os.path.exists(ext_dir):
        os.mkdir(ext_dir)
        os.system("chmod 777 -R %s" % ext_dir)
      outfile = open(ext_filename, 'wb')
      outfile.write(zfobj.read(name))
      outfile.close()

#---------------------------------------------------------------------------------------------
# zip all files based upon static web resources 
#---------------------------------------------------------------------------------------------
def prepareWebResource():
  logging.info('Preparing static web resources now. It will take a few minutes...')
  if os.path.exists(VIEWER_TMP):
    shutil.rmtree(VIEWER_TMP)
  unzip_file(VIEWER_EAR_FILE ,VIEWER_TMP)
  unzip_file(VIEWER_WAR_FILE ,VIEWER_WAR_TMP)
  for f in os.listdir(RESOURCE_ROOT):
    sourceF = os.path.join(RESOURCE_ROOT, f)
    if os.path.isdir(sourceF):
      global ONLINE_VERSION 
      ONLINE_VERSION = os.path.basename(sourceF)
      logging.info('The build version to be onlined is %s' % ONLINE_VERSION)
      break
  logging.info('Prepared successfully.') 	

#---------------------------------------------------------------------------------------------
# Update zookeeper node
#---------------------------------------------------------------------------------------------
def updateZookeeperNode():	
  logging.info("The online version is %s" % ONLINE_VERSION)
  if (ONLINE_VERSION in [None,'']):
    logging.error("Severe error - the version to be onlined is empty.")
    return
  offline = None
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
        children = zooKeeperClient.getChildNodes('/%s/data/viewer/version' %(baseTN))
        offlineFlag = True
        for node in children:
          #Filter itself and empty side name
          if(node == side or node == ''):
            continue
          else:
            data = zooKeeperClient.getData('/%s/data/viewer/version/%s' %(baseTN, node))
            if(data == sideValue):
              offlineFlag = False
              break
        if(offlineFlag):
          offline = sideValue
        else:
          logging.info("The obsolete version %s is still using by anther side." % sideValue)               	  	
      else:
        logging.info("Flip failover case - no new version is online.")

    if (offline is not None):
      logging.info("The offline version is %s" % offline)
      global OFFILE_VERSION
      OFFILE_VERSION = offline
  except Exception,e:
    logging.error(e)
    raise 
#---------------------------------------------------------------------------------------------
# Remove obsolete web resources from NFS server
#---------------------------------------------------------------------------------------------
def removeOfflineVersion():
  logging.info('Removing %s from webresource directory. It will take a few minutes...' % OFFILE_VERSION)
  offline = r'%s/%s' % (SHARED_DIR,OFFILE_VERSION)
  if os.path.exists(offline):
    shutil.rmtree(offline)
  logging.info('Removed successfully.')

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
       if(isMultiactiveOwner() and registryParser.getSetting('AC','nas_viewer_share') is not None):
          try:
             #Mount the DataFS Share
             nfsShareViewer=registryParser.getSetting('AC','nas_viewer_share')
             if nfsShareViewer.count(':') == 0:
               #If the share is not in the form of <hostname>:<mount>, setup a pre-defined share again CF Linux VM
               nasViewerHostname = zooKeeperClient.getFrontEndInterface('/topology/nas/servers/1')
               zooKeeperClient.waitForServerActivation('/topology/nas/servers/1')
               nasViewersMountPoint = '/nfsexports/smartcloud/%s' % (nfsShareViewer)
             else:
                #If the share is in the form of <hostname>:<mount>, setup the share directly
                nasViewerHostname,nasViewerMountPoint = nfsShareViewer.split(':')
             logging.info("nasViewerHostname=%s,nasViewerMountPoint=%s" %(nasViewerHostname,nasViewerMountPoint))           
             mountThread = threading.Thread(target=mount, name='mounting acViewer NFS server', args=(nasViewerHostname,nasViewerMountPoint))
             mountThread.start()
             time.sleep(.5) # make sure the thread has been started
             mountThread.join()
             # create the given workspace for multi-active ViewerNext on acViewer NFS server
             mkDirOnNFS(SHARED_DIR)
             # prepared all web resources from local selected ViewerNext server
             prepareWebResource()
             # copy zipped web resources files into NFS temp directory
             copyThread = threading.Thread(target=copyResources, name='Copying ear package to acViewer NFS server')
             copyThread.start()
             time.sleep(.5)
             copyThread.join()
             # update the zookeeper node value in time
             updateZookeeperNode()
             # remove offline web resource
             logging.info("Completed successfully to support ViewerNext MA in this server for rundesk patch.")
          except Exception, e:
             logging.info("Exception happened when operating webresource on NFS server - %s" % e)
             sys.exit(1)
          finally:
             # umount drive k:
             unmount()
       else:
          logging.info("No need to support ViewerNext MA in this server for rundesk patch.")
