# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

import re, socket, sys, os, subprocess, shutil, stat, logging, fileinput, imp
import time, errno, zipfile, base64
from xml.dom import minidom

sys.path.append('/LotusLive/Lib/') #zookeeper and registryLib
sys.path.append('/LotusLive/Lib/nfs')
sys.path.append('/LotusLive/Lib/gluster') #glusterMount
from registryLib_win import *
from zooKeeperLib_win import *

import mountLib
import platform
try:
  import glusterMount
except ImportError:
  pass

# HARDCODE PARTS for Cloud factory Windows OVF templates
SETRIGHTS_EXE_FILE = "c:/ViewerNext/Conversion/installer/setrights.exe"

#Conversion
CONVERSION_CFG_FILE = "c:/ViewerNext/Conversion/installer/cfg.properties"
CONVERSION_CFG_NODE_FILE = "c:/ViewerNext/Conversion/installer/cfg.node.properties"
CONVERSION_CFG_SAMPLE_FILE = "c:/ViewerNext/Conversion/installer/cfg.properties.sample"
CONVERSION_CONFIG_JSON = "C:/ViewerNext/Conversion/config/conversion-config.json"

# Viewer
VIEWER_CFG_FILE = "C:/ViewerNext/Viewer/installer/cfg.properties"
VIEWER_CONFIG_JSON = "C:/ViewerNext/Viewer/config/viewer-config-premise-template.json"
VIEWER_INSTALL_ROOT = "C:/Viewer"

#Directory services
CONFIG_SRC_ROOT = "C:/ViewerNext/Viewer/config"
DIRECTORY_SERVICES_XML = "directory.services.xml"

#OVF_Config_XML = 'c:/LotusLive/Env/ovf-env.xml'
SCH_TASK_SCRIPT = "C:/ViewerNext/Conversion/config/sym_monitor_win/start_task.bat"
WAS_INSTALL_ROOT = r'/Program Files/IBM/WebSphere/AppServer'
CONVERSION_INSTALL_ROOT = "%s/IBMConversion" #Driver disk name to be replaced by DPUI settings
WAS_SOAP_PORT_VIEWER = "8880"
WAS_SOAP_PORT_CONV = "8881"
WAS_SERVER_VIEWER_NAME = "serverViewerNextV"
WAS_SERVER_CONV_NAME = "serverViewerNextC"
WAS_SERVICE_NAME_PREFIX = "was."
WAS_SERVICE_VIEWER_NAME = WAS_SERVICE_NAME_PREFIX+WAS_SERVER_VIEWER_NAME
WAS_SERVICE_CONV_NAME = WAS_SERVICE_NAME_PREFIX+WAS_SERVER_CONV_NAME
WAS_PROFILE_VIEWER_NAME = "AppSrv1"
WAS_PROFILE_CONV_NAME = "AppSrv2"
WAS_NODE_VIEWER_NAME = "ocs_app_node1_" + socket.gethostname().split(".")[0]
WAS_NODE_CONV_NAME = "ocs_app_node2_" + socket.gethostname().split(".")[0]

PROFILE_SOAP_CLIENT_PROPS = "soap.client.props"

ZK_VIEWERNEXT_PATH = '/topology/viewernext/servers'

WIN_HEAP_TYPE = "REG_EXPAND_SZ"
WINDOWS_HEAP_SIZE = "4096"

WIN_PAGINGFILES_TYPE = "REG_MULTI_SZ"

WAS_SERVICE_SCRIPT = "c:/ViewerNext/Viewer/installer/util/runWebSphereAs.bat"

CONV_INSTALL_PATH='C:/ViewerNext/Conversion/installer'

VIEWER_INSTALL_PATH='C:/ViewerNext/Viewer/installer'

VIEWER_SHAREDLIB_NAME = "VIEWER_SHAREDLIB_FLOCK"
VIEWER_SHAREDLIB_PATH = VIEWER_INSTALL_ROOT + "/sharedlib"
VIEWER_INSTALLER_PATH_SHAREDLIB = VIEWER_INSTALL_PATH + "/../sharedlib"

VIEWER_SHARED_DATA_ROOT_NFS_NAME = "VIEWER_LOCAL_DATA_ROOT"
VIEWER_SHARED_DATA_ROOT_NFS_VAL = "v:"

DOCS_SHARED_DATA_ROOT_NFS_VAL="w:"

# Below global variables for nfs, still needs get their values from DPUI setting
nasHostname = "nas-docs.ibm.com"
nasMountPoint = "/opt/IBM/IBMDocs/data/shared"
r_docs_shared_dir = DOCS_SHARED_DATA_ROOT_NFS_VAL
nasHostname4Viewer = "nas-docs.ibm.com"
nasMountPoint4Viewer = "/opt/IBM/Viewer/data/shared"
r_viewer_shared_dir = VIEWER_SHARED_DATA_ROOT_NFS_VAL

#---------------------------------------------------------------------------------------------
# Usage statement
#---------------------------------------------------------------------------------------------
def usage():

   print('Incorrect %s usage for\n' % (sys.argv[0]))
   print('  Description:  Use this script to configure IBM ViewerNext \n')
   print('  Usage: %s\n' % (sys.argv[0]))

   sys.exit(1)

def updateSymphonyMonitorTask(username, password):
  monitor_pattern = r"\s*schtasks.exe\s*/create\s*/F\s*/TN\s*(\"sym_monitor\").*"
  kill_pattern = r"\s*schtasks.exe\s*/create\s*/F\s*/TN\s*(\"kill_timeout\").*"
  monitor_cmd = "\"sym_monitor\" /RU %s /RP %s /NP" % (username, password)
  kill_cmd = "\"kill_timeout\" /RU %s /RP %s /NP" % (username, password)
  for line in fileinput.input(SCH_TASK_SCRIPT, inplace=1):
    if re.match(monitor_pattern, line):
       token_old1 = re.match(monitor_pattern, line).group(1)
       line = re.sub(token_old1, monitor_cmd, line)
    elif re.match(kill_pattern, line):
       token_old2 = re.match(kill_pattern, line).group(1)
       line = re.sub(token_old2, kill_cmd, line)
    sys.stdout.write(line)


def addSysPath(path):
  if not os.path.exists(path): return -1
  path = os.path.abspath(path)
  if sys.platform == 'win32':
    path = path.lower()
  # check path
  for x in sys.path:
    x = os.path.abspath(x)
    if sys.platform == 'win32':
      x = x.lower()
  sys.path.insert(0, path)
  return 1

def removeSysPath(path):
  if not os.path.exists(path): return -1
  path = os.path.abspath(path)
  if sys.platform == 'win32':
    path = path.lower()
  # check path
  for x in sys.path:
    x = os.path.abspath(x)
    if sys.platform == 'win32':
      x = x.lower()
  if path in sys.path:
    sys.path.remove(path)
  return 1
#---------------------------------------------------------------------------------------------
# Create the WAS AppSrv profile
#---------------------------------------------------------------------------------------------
def createAndStartAppSrvProfile(wasDir, adminUsername, adminPassword, serverName, profileName, nodeName):
   try:
      createProfile(adminUsername, adminPassword, serverName, profileName, nodeName, wasDir)
      update_soap_client_props_timeout(WAS_INSTALL_ROOT + "/profiles/" + profileName + "/properties/" + PROFILE_SOAP_CLIENT_PROPS, "com.ibm.SOAP.requestTimeout=.*", "com.ibm.SOAP.requestTimeout=1000")
      createServiceAndStart(adminUsername, adminPassword, 'was.' + serverName, serverName, profileName, wasDir)
   except:
      print('Error:  Unable to create AppSvr profile')
      raise
   print('AppSvr is running...continuing install')

def setDefaultAppSrvProfile(wasDir, adminUsername, adminPassword, profileName):
   hostname = socket.gethostname().split('.')[0]
   adminUsername = adminUsername.encode('ascii','ignore')
   print('Setting default profile to %s' % (profileName))
   try:
      cmd = [ '"%s/bin/manageprofiles.bat"' % wasDir,
              '-setDefaultName', '-profileName', profileName ]
      #print cmd
      p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      for line in p.stdout.readlines():
         print(line.strip('\n'))
      retval = p.wait()
      if retval:
         raise Exception('RC %s while settting default WebSphere profile' % (retval))
   except:
      print('Error:  Failed to set default profile')
      raise Exception("Exception: %s %s" % (sys.exc_info()[0], sys.exc_info()[1]))

def createProfile(adminUsername, adminPassword, serverName, profileName, nodeName, installDir):
   adminUsername = adminUsername.encode('ascii','ignore')

   print('Creating profile for server %s' % (serverName))
   try:
      cmd = [ '"%s/bin/manageprofiles.bat"' % installDir, '-create',
              '-templatePath', '"%s/profileTemplates/default"' % installDir,
              '-profileName', profileName,
              '-nodeName', nodeName,
              '-serverName', serverName,
              '-enableAdminSecurity', 'true',
              '-adminUserName', adminUsername, '-adminPassword', adminPassword ]

      #print cmd
      p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      for line in p.stdout.readlines():
         print(line.strip('\n'))
      retval = p.wait()
      if retval:
         raise Exception('RC %s while creating WebSphere profile' % (retval))
   except:
      print('Error:  Failed to create profile')
      raise Exception("Exception: %s %s" % (sys.exc_info()[0], sys.exc_info()[1]))


#---------------------------------------------------------------------------------------------
# Start a server by name via WAS BAT script
#---------------------------------------------------------------------------------------------
def startServerByNameAndProfile(serverName, profileName, installDir=WAS_INSTALL_ROOT):
   cmd = '"%s/bin/startServer.bat" %s -profileName %s' % (installDir, serverName, profileName)
   print(cmd)
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print(line.strip('\n'))
      retval = p.wait()
   if retval:
      raise Exception('RC %s while starting server %s' % (retval,serverName))

def stopServerByNameAndProfile(serverName, profileName, adminName, adminPassword, installDir=WAS_INSTALL_ROOT):
   cmd = '"%s/bin/stopServer.bat" %s -profileName %s -username %s -password %s' % (installDir, serverName, profileName, adminName, adminPassword)
   print(cmd)
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print(line.strip('\n'))
      retval = p.wait()
   if retval:
      raise Exception('RC %s while starting server %s' % (retval,serverName))

#---------------------------------------------------------------------------------------------
# Create a Windows service and start it
#---------------------------------------------------------------------------------------------
def createServiceAndStart(adminUsername, adminPassword, serviceName, serverName, profileName, installDir):

   #Use the wasservice.exe command to create the service
   cmd = ' "%s/bin/wasservice.exe" -add %s -serverName %s \
        -profilePath "%s/profiles/%s" -startType automatic \
        -stopArgs "-username %s -password %s" \
        -startArgs "-username %s -password %s" ' % (installDir,
            serviceName, serverName, installDir, profileName,
            adminUsername, adminPassword, adminUsername, adminPassword)
   #print cmd
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print(line.strip('\n'))
      retval = p.wait()
   if retval:
      raise Exception('RC %s while creating WebSphere service %s' % (retval, serviceName))
   startWASService(serviceName, installDir)

#---------------------------------------------------------------------------------------------
# Start a server via Windows Service
#---------------------------------------------------------------------------------------------
def startWASService(serviceName, installDir=WAS_INSTALL_ROOT):
   cmd = ' "%s/bin/wasservice.exe" -start %s' % (installDir, serviceName)
   print(cmd)
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print(line.strip('\n'))
      retval = p.wait()
   if retval:
      raise Exception('RC %s while starting server %s' % (retval, serviceName))


#---------------------------------------------------------------------------------------------
# Stop a server by Windows Service
#---------------------------------------------------------------------------------------------
def stopWASService(serviceName, installDir=WAS_INSTALL_ROOT):
   cmd = ' "%s/bin/wasservice.exe" -stop %s' % (installDir, serviceName)
   print(cmd)
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print(line.strip('\n'))
      retval = p.wait()
   if retval:
      raise Exception('RC %s while stopping server %s' % (retval, serviceName))
#---------------------------------------------------------------------------------------------
# Push IP information to ZooKeeper
#---------------------------------------------------------------------------------------------
def registerWithZookeeper(zooKeeperClient,zkPath):
   print('Publishing server information with ZooKeeper...')
   try:
      zooKeeperClient.createEphemeralNodes(zkPath, 'SEQUENTIAL')
   except:
      print('Error while attempting to publish server details with ZooKeeper')
      raise
   print('Server published on ZooKeeper')

#---------------------------------------------------------------------------------------------
# Activate the server
#---------------------------------------------------------------------------------------------
def activateServer(zooKeeperClient,zkPath):
   print('Activating server in ZooKeeper...')
   try:
      zooKeeperClient.activateServer(zkPath)
   except:
      print('Error while attempting to activate server in ZooKeeper')
      raise
   print('Server activated in ZooKeeper')

def preinstallConversion():
   addSysPath(CONV_INSTALL_PATH)
   import util
   imp.reload(util)
   removeSysPath(CONV_INSTALL_PATH)

def launchInstallConversion(adminUsername, adminPassword):
  addSysPath(CONV_INSTALL_PATH)
  set_conversion_was_var("VIEWER_LOCAL", viewer_shared_dir, adminUsername, adminPassword )

  myCommand = ' '.join([
        'python conversion/install.py',
        "-build",
        "C:\\ViewerNext\\Conversion",
        "-wasadminID",
        adminUsername,
        "-wasadminPW",
        adminPassword,
        "-acceptLicense",
        "-silentlyInstall"
        ])
  proc = subprocess.Popen(myCommand, stdout=subprocess.PIPE, shell=True)

  for line in iter(proc.stdout.readline,''):
    print(line)

  retval = proc.wait()
  if retval:
    raise Exception('Failed while installing HCL Docs Conversion')

  removeSysPath(CONV_INSTALL_PATH)

def preinstallViewer(adminUsername, adminPassword):
  addSysPath(VIEWER_INSTALL_PATH)
  import util
  imp.reload(util)
  from viewer.config import CONFIG as CFG
  from viewer import config
  from viewer import prepare_install
  print("Preparing viewer installation")
  config.GWAS_ADMIN_ID = adminUsername
  config.GWAS_ADMIN_PW = adminPassword
  config.GACCEPT_LICENSE = 'true'
  config.GSILENTLY_INSTALL = 'true'

  pi = prepare_install.PrepareInstall()
  logging.info("Validating installation prerequisite...")
  if not pi.do():
    logging.error("Failed to validate the installation prerequisite. Check log file for more detail.")
  removeSysPath(VIEWER_INSTALL_PATH)

def installViewer(adminUsername, adminPassword, viewer_shared_dir):
  addSysPath(VIEWER_INSTALL_PATH)
  from commands import command
  create_sharedlib_and_classloader(VIEWER_SHAREDLIB_PATH)
  install_directory_service()
  set_viewer_was_var('VIEWER_LOCAL_DATA_NAME', "VIEWER_LOCAL")
  set_viewer_was_var('VIEWER_LOCAL_DATA_ROOT', viewer_shared_dir)
  myCommand = ' '.join([
        'python viewer/install.py',
        VIEWER_CFG_FILE,
        "C:/ViewerNext/Viewer/",
        adminUsername,
        adminPassword,
        "true",
        "false"
        ])
  proc = subprocess.Popen(myCommand, stdout=subprocess.PIPE, shell=True)
  for line in iter(proc.stdout.readline,''):
    print(line)
  retval = proc.wait()
  if retval:
    raise Exception('Viewer installation failed, check log file for more detail.')
  else:
    set_viewer_was_var('VIEWER_SHARED_DATA_ROOT', VIEWER_SHARED_DATA_ROOT_NFS_VAL )
    print("Viewer installation Completed Successfully.")
  removeSysPath(VIEWER_INSTALL_PATH)

def gen_conversion_cfg_property(admin, password, viewer_shared_dir, symphony_number, viewer_url):
  addSysPath(CONV_INSTALL_PATH)
  cfg = open(CONVERSION_CFG_SAMPLE_FILE)
  from configparser import SafeConfigParser
  cp = SafeConfigParser()
  cp.readfp(cfg)
  rdir = CONVERSION_INSTALL_ROOT
  cp.set("Conversion", "conversion_install_root", rdir )
  mountType = "nfs"
  if useGluster == "true":
    mountType = "gluster"
  #Docs server shared storage.
  cp.set("Conversion", "docs_shared_storage_type", mountType)
  cp.set("Conversion", "docs_shared_storage_local_path", DOCS_SHARED_DATA_ROOT_NFS_VAL)
  cp.set("Conversion", "docs_shared_storage_remote_server", nasHostname)
  cp.set("Conversion", "docs_shared_storage_remote_path", nasMountPoint)
  #Viewer server shared storage.
  cp.set("Conversion", "viewer_shared_storage_type", mountType)
  cp.set("Conversion", "viewer_shared_storage_local_path", VIEWER_SHARED_DATA_ROOT_NFS_VAL)
  cp.set("Conversion", "viewer_shared_storage_remote_server", nasHostname4Viewer)
  cp.set("Conversion", "viewer_shared_storage_remote_path", nasMountPoint4Viewer)
  cp.set("Conversion", "was_install_root", WAS_INSTALL_ROOT)
  cp.set("Conversion", "was_soap_port", WAS_SOAP_PORT_CONV)
  cp.set("Conversion", "scope", "server")
  cp.set("Conversion", "scope_name", WAS_SERVER_CONV_NAME)
  cp.set("Conversion", "node_name", WAS_NODE_CONV_NAME)
  cp.set("Conversion", "sym_count", symphony_number)
  cp.set("Conversion", "sym_start_port", "8100")
  cp.set("Conversion", "software_mode",'sc')
  cp.set("Conversion", "viewer_url", viewer_url)

  new_cfg = open(CONVERSION_CFG_FILE, "w")
  cp.write(new_cfg)
  new_cfg.close()
  new_cfg_node = open(CONVERSION_CFG_NODE_FILE, "w")
  cp.write(new_cfg_node)
  new_cfg_node.close()
  cfg.close()
  removeSysPath(CONV_INSTALL_PATH)

def gen_viewer_cfg_property(viewer_shared_dir, conversion_url, docs_be_url):
  addSysPath(VIEWER_INSTALL_PATH)
  cfg = open(VIEWER_CFG_FILE)
  from configparser import SafeConfigParser
  cp = SafeConfigParser()
  cp.readfp(cfg)
  cp.set("Viewer", "viewer_install_root", VIEWER_INSTALL_ROOT )
  #Viewer server shared storage.
  cp.set("Viewer", "shared_data_dir", viewer_shared_dir)
  cp.set("Viewer", "was_install_root", WAS_INSTALL_ROOT)
  cp.set("Viewer", "was_soap_port", WAS_SOAP_PORT_VIEWER)
  cp.set("Viewer", "conversion_url", conversion_url)
  cp.set("Viewer", "editor_installed", "Yes")
  cp.set("Viewer", "docs_shared_data_dir", DOCS_SHARED_DATA_ROOT_NFS_VAL)
  # docs_url still need get from zookeeper
  cp.set("Viewer", "docs_url", docs_be_url)
  cp.set("Viewer", "scope", "server")
  cp.set("Viewer", "scope_name", WAS_SERVER_VIEWER_NAME)
  cp.set("Viewer", "node_name", WAS_NODE_VIEWER_NAME)
  cp.set("Viewer", "browser_cache", "No")
  cp.set("Viewer", "enable_print", "No")
  cp.set("Viewer", "auth_type", "FORM")
  cp.set("Viewer", "auth_host", "https://localhost")
  cp.set("Viewer", "multi_tenancy", "false")
  cp.set("Viewer", "convert_on_upload", "Yes")
  cp.set("Viewer", "housekeeping_frequency", "hourly")
  cp.set("Viewer", "housekeeping_size_threshold_of_rendition_cache", "0.8")
  cp.set("Viewer", "housekeeping_age_threshold_of_rendition_latest_version", "30")
  try:
    viewer_toscana_url = registryParser.getSetting('ViewerNext', 'viewer_toscana_url')
    viewer_toscana_oauth_url = registryParser.getSetting('ViewerNext', 'viewer_toscana_oauth_url')
    if viewer_toscana_url and viewer_toscana_url != '':
        cp.set("Viewer", "toscana_file_server", viewer_toscana_url)
    if viewer_toscana_oauth_url and viewer_toscana_oauth_url != '':
        cp.set("Viewer", "toscana_oauth_endpoint", viewer_toscana_oauth_url)
    local_host_domain = zooKeeperClient.getSettingByComponent('MiddlewareTAM', 'virtual_hosts_junction_domain')
    if local_host_domain and local_host_domain != '':
        cp.set("Viewer", "local_host_domain", ''.join(['https://apps.',local_host_domain]))
  except Exception as e:
    logging.error('Exception during update viewer-config.json by third party %s' % e)

  new_cfg = open(VIEWER_CFG_FILE, "w")
  cp.write(new_cfg)
  new_cfg.close()
  cfg.close()
  removeSysPath(VIEWER_INSTALL_PATH)

def update_soap_client_props_timeout(profile_props_fname, str_from, str_to):
    # pattern is in the file, so perform replace operation.
    with open(profile_props_fname) as f:
        out_fname = profile_props_fname + ".tmp"
        out = open(out_fname, "w")
        pat = re.compile(str_from)
        for line in f:
            out.write(re.sub(pat, str_to, line))
        out.close()
        f.close()
        bak_fname = profile_props_fname + ".bak"
        if os.path.exists(bak_fname):
            os.remove(bak_fname)
        os.rename(profile_props_fname, bak_fname)
        os.rename(out_fname, profile_props_fname)

def modify_conversion_config_json(token, stellent_number, sym_number):
  json_file = CONVERSION_CONFIG_JSON
  token_pattern = r"\s*\"token\"\s*:\s*\"(.+)\" *,?"
  pool_size_pattern = r"\s*\"poolSize\"\s*:\s*(\d+)\s*,?"
  convlib_maxinst_pattern = r"\s*\"maxInstanceNum\"\s*:\s*(\d+)\s*,?"
  for line in fileinput.input(json_file, inplace=1):
    if re.match(token_pattern, line):
       token_old = re.match(token_pattern, line).group(1)
       line = re.sub(token_old, token, line)
    elif re.match(pool_size_pattern, line):
       pool_size_old = re.match(pool_size_pattern, line).group(1)
       line = re.sub(pool_size_old, stellent_number, line)
    elif re.match(convlib_maxinst_pattern, line):
       cl_maxinst_old = re.match(convlib_maxinst_pattern, line).group(1)
       line = re.sub(cl_maxinst_old, sym_number, line)
    sys.stdout.write(line)

def modify_viewer_config_json(token, files_url, bss_url, domain):
  json_file = VIEWER_CONFIG_JSON
  token_pattern = r"\s*\"token\"\s*:\s*\"(.+)\" *,?"
  lc_token_pattern = r"\s*\"s2s_token\"\s*:\s*\"(.+)\" *,?"
  files_path_pattern = r"\s*\"server_url\"\s*:\s*\"(.+)\" *,?"
  bss_url_pattern=r"\s*\"bss_be_url\"\s*:\s*\"(.+)\" *,?"
  domain_pattern=r"\s*\"virtual_hosts_junction_domain\"\s*:\s*\"(.+)\" *,?"
  for line in fileinput.input(json_file, inplace=1):
    if re.match(token_pattern, line):
       token_old = re.match(token_pattern, line).group(1)
       line = re.sub(token_old, token, line)
    if re.match(lc_token_pattern, line):
       token_old = re.match(lc_token_pattern, line).group(1)
       line = re.sub(token_old, token, line)
    if re.match(files_path_pattern, line):
       url_old = re.match(files_path_pattern, line).group(1)
       line = re.sub(url_old, files_url, line)
    if re.match(bss_url_pattern, line):
       bss_old = re.match(bss_url_pattern, line).group(1)
       line = re.sub(bss_old, bss_url, line)
    if re.match(domain_pattern, line):
       domain_old = re.match(domain_pattern, line).group(1)
       line = re.sub(domain_old, domain, line)
    sys.stdout.write(line)

def get_windows_heap_size():
  QUERY_REG = "REG QUERY \"HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\SubSystems\" /v Windows"
  p = subprocess.Popen(QUERY_REG, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate()[0]
  #  	'\r\nHKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Session Manager\\Su
  #	bSystems\r\n    Windows    REG_EXPAND_SZ    %SystemRoot%\\system32\\csrss.exe Ob
  #	jectDirectory=\\Windows SharedSection=1024,20480,768 Windows=On SubSystemType=Wi
  #	ndows ServerDll=basesrv,1 ServerDll=winsrv:UserServerDllInitialization,3 ServerD
  #	ll=winsrv:ConServerDllInitialization,2 ServerDll=sxssrv,4 ProfileControl=Off Max
  #	RequestThreads=16\r\n\r\n'
  #print output
  retval = p.returncode
  if retval:
    raise Exception('RC %s while executing command "%s". ' % (retval,QUERY_REG))
  return output.strip().split(WIN_HEAP_TYPE)[1]

def add_windows_heap_size(reg_windows_value):
  SHARED_SEC_PAT = ".*(SharedSection=\d+,\d+,)(\d+).*"
  if re.match(SHARED_SEC_PAT, reg_windows_value):
    pat_re = re.match(SHARED_SEC_PAT, reg_windows_value)
    pre_shared_sec = pat_re.group(1)
    old_non_inter_value = pat_re.group(2)
    print("The orginal WINDOWS_HEAP_SIZE is " + old_non_inter_value)
    reg_windows_value = re.sub(pre_shared_sec + old_non_inter_value, pre_shared_sec + WINDOWS_HEAP_SIZE, reg_windows_value)
    print("New SharedSection: " + reg_windows_value)
  else:
    print("ERROR: Desktop heap on Windows is not tuned due to original wrong parameter")
    print("The value is " + reg_windows_value)

  ADD_REG = "REG ADD \"HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\SubSystems\" /v Windows /t %s /d \"%s\" /f" % (WIN_HEAP_TYPE, reg_windows_value)
  #print ADD_REG
  p = subprocess.Popen(ADD_REG, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate()[0]
  #print output
  retval = p.returncode
  if retval:
    raise Exception('RC %s while executing command "%s". ' % (retval,ADD_REG))

def run_cmd(cmd_list):

  for cmd in cmd_list:
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    output = p.communicate()[0]
    print(output)
    retval = p.returncode
    if retval:
      raise Exception('RC %s while executing command "%s". ' % (retval,cmd))

  return output

#---------------------------------------------------------------------------------------------
#  The function is a fix. If WAS service is launched as  Windows admin/istrator and Operation team
#  changes the original password of administrator, the WAS service cannot be stared when OS reboot,
#  so we created an non-admin user to launch WAS service, and set his password never expires.
#---------------------------------------------------------------------------------------------
def set_was_service_user(was_install_root,was_service_name,non_admin_name,non_admin_password):
  script_path = os.path.abspath(WAS_SERVICE_SCRIPT)
  cmd_list = [
      '%s "%s" %s %s %s' % (script_path,was_install_root,was_service_name,non_admin_name,non_admin_password),
      'WMIC USERACCOUNT WHERE Name="%s" SET PasswordExpires=FALSE' % non_admin_name,
      '%s %s  +r SeTcbPrivilege' % (SETRIGHTS_EXE_FILE,non_admin_name),
      '%s %s  +r SeServiceLogonRight' % (SETRIGHTS_EXE_FILE,non_admin_name),
      ]

  run_cmd(cmd_list)
#---------------------------------------------------------------------------------------------
# The same purpose as SetWASServiceUser()
#---------------------------------------------------------------------------------------------
def create_os_user(user_name,user_password):
  cmd_list = [
      'net user'
      ]

  output = run_cmd(cmd_list)

  if output.find(user_name) > -1:
    cmd_list = ['net user %s %s' % (user_name,user_password)]
    run_cmd(cmd_list)
    return

  user_properties = '/fullname:"HCL Docs wasadmin" /comment:"Owner = Matthew J Babaian (babaian@us.ibm.com)"'
  cmd_list = [
      'net user %s %s /add %s ' % (user_name,user_password,user_properties)
      ]

  run_cmd(cmd_list)

#---------------------------------------------------------------------------------------------
# The same purpose as SetWASServiceUser()
#---------------------------------------------------------------------------------------------
def set_user_logon_batchjob(user_name):
  cmd_list = [
      SETRIGHTS_EXE_FILE + " " + user_name + " +r SeBatchLogonRight"
      ]

  run_cmd(cmd_list)

#---------------------------------------------------------------------------------------------
# Change the retry number and timeout value of nfs client
#---------------------------------------------------------------------------------------------

def setup_nfs_parameters():
    cmds = []
    cmds.append("nfsadmin client config retry=10 timeout=60")
    cmds.append("nfsadmin client stop")
    cmds.append("nfsadmin client start")
    mountLib.execute_cmds(cmds)

#---------------------------------------------------------------------------------------------
# The same purpose as SetWASServiceUser()
#---------------------------------------------------------------------------------------------
def set_user_access_dir(dir_path,user_name):
  abs_path = os.path.abspath(dir_path)
  cmd_list = [
      'icacls "%s" /t /c /grant %s:(OI)(CI)f' % (abs_path,user_name)
      ]
  run_cmd(cmd_list)

#---------------------------------------------------------------------------------------------
# Journal configration
#---------------------------------------------------------------------------------------------
def journal_config(journal_server_url):
    'Config journal for ViewerNext'

    logging.info('Configure journal scripts')

    viewernext_journal_name = 'journal_main.sh'
    viewernext_journal_path = os.path.abspath(os.path.join(CFG.get_build_dir(),'installer','journal',viewernext_journal_name))
    viewernext_journal_target = os.path.abspath(os.path.join(CFG.get_docs_installroot(),'journal',viewernext_journal_name))
    common_journal_path = '/opt/ll/scripts/journal/'
    script_path = '/etc/cron.d/docs_journal.scripts'

    try:
        shutil.copy(docs_journal_path,viewernext_journal_target)
        set_permissions(serviceUser,serviceGroup,viewernext_journal_target)
        journal_cmd = '*/10 * * * * %s %s %s %s %s \n' % (serviceUser,viewernext_journal_target,os.path.abspath(os.path.join(CFG.get_viewernext_installroot(),'journal')) + '/',journal_server_url,common_journal_path)
        cron_file = open(script_path,'w')
        cron_file.writelines([journal_cmd])
        cron_file.close()
        crontab_cmds = [
            'chown root %s' % script_path,
            'chmod 644 %s' % script_path,
            '/etc/init.d/crond reload'
            ]

        for cmd in crontab_cmds:
            p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT);
            output = p.communicate()[0]
            #print output
            retval = p.returncode
            if retval:
                raise Exception('RC %s while configure journal for ViewerNext (%s)' % (retval,cmd))

    except Exception as e:
        logging.error(e)
        raise Exception('failed to configure journal for ViewerNext')


#---------------------------------------------------------------------------------------------
# Check if the data volume is accessable
#---------------------------------------------------------------------------------------------
def check_datavolume(drive):
	testdir = drive + ":/tempfolder"
	expstr = "Error happens when accessing the data volume " + drive + ":, please check if diskpart executed successfully."
	try:
	  if os.path.exists(testdir):
	    os.rmdir(testdir);
	  os.mkdir(testdir);
	  if os.path.exists(testdir):
	    os.rmdir(testdir)
	  else:
	    raise Exception(expstr)
	except OSError as exception:
	  if exception.errno != errno.EEXIST:
	    raise Exception(expstr)

	print('Checked data volume %s, result is ok.' % (drive))
	return 1

#---------------------------------------------------------------------------------------------
# Check if the data volume is accessable
#---------------------------------------------------------------------------------------------
def mkdir_vw(dpath):
	expstr = "Error happens when creating viewer data dir " + dpath + ":, please check if disk exists."
        try:
          if not os.path.exists(dpath):
            os.mkdir(dpath);
          if not os.path.exists(dpath):
            raise Exception(expstr)
        except OSError as exception:
          if exception.errno != errno.EEXIST:
            raise Exception(expstr)

        print('Created data directory for viewer %s.' % (dpath))
        return 1

#---------------------------------------------------------------------------------------------
# Query current pagingfiles setting
#---------------------------------------------------------------------------------------------
def get_pagingfiles_str():
  QUERY_REG = "REG QUERY \"HKLM\System\CurrentControlSet\Control\Session Manager\Memory Management\" /v pagingfiles"
  p = subprocess.Popen(QUERY_REG, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate()[0]
  #print output
  retval = p.returncode
  if retval:
    raise Exception('RC %s while executing command "%s". ' % (retval,QUERY_REG))
  return output.strip().split(WIN_PAGINGFILES_TYPE)[1]

#---------------------------------------------------------------------------------------------
# Method to log and execute a command line expression and throw an exception if the command fails. Accepts an obfuscate parameter to hide part of the command in the logging
#---------------------------------------------------------------------------------------------
def executeCommand(command, obfuscate=None):
  log = 'Executing: '
  if obfuscate:
    log += command.replace(obfuscate, '***')
  else:
    log +=  command
  print(log)
  p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate()[0]
  if p.returncode:
    raise Exception('Error executing command: ' + output)
  print('Command successful.')

  return output

#---------------------------------------------------------------------------------------------
# Configures the page file
#---------------------------------------------------------------------------------------------
def configurePageFile(drive):
  #Place the page file on D:
  pagefilestr = '"' + drive + ":\pagefile.sys 0 0" + '"'
  cmdstr = r'reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v PagingFiles /t ' + WIN_PAGINGFILES_TYPE + r' /d '+ pagefilestr +r' /f'
  executeCommand(cmdstr)

#---------------------------------------------------------------------------------------------
# Check if paging file setting is valid and correct it if necessary
#---------------------------------------------------------------------------------------------
def check_pagingfiles_setting():
  try:
    original_heap_size = get_pagingfiles_str()
    pagedrive = original_heap_size.strip().split(":")[0]
    if (pagedrive != '?'):
      if not os.path.isdir(pagedrive + ":"):
        share_drv = os.getenv('SHARED_DRV', 'H')
        configurePageFile(share_drv)
        logging.info("Updated pagingfiles setting to shared drive")
  except Exception as e:
    print("unable to get current pagingfiles setting")

  return True


#---------------------------------------------------------------------------------------------
# create shared library for viewernext
#---------------------------------------------------------------------------------------------
def create_sharedlib_and_classloader(lib_path):
  print("Start to create SharedLib and classloader for viewernext")

  verse_lib_filepath_for_shared_lib = lib_path

  # match the multiple space
  p = re.compile("[ \t\n\r\f\v]+")
  results = p.findall(verse_lib_filepath_for_shared_lib)
  if len(results) != 0:
    print("there are spaces in " + verse_lib_filepath_for_shared_lib)
    verse_lib_filepath_for_shared_lib = "\"" + verse_lib_filepath_for_shared_lib + "\""

  from viewer.config import CONFIG
  from util.common import call_wsadmin

  # wasadmin command line arguments
  args = CONFIG.get_was_cmd_line()
  args.extend(["-f",  "./viewer/tasks/create_shared_lib.py"])
  args.extend([VIEWER_SHAREDLIB_NAME])
  args.extend([verse_lib_filepath_for_shared_lib])
  args.extend([verse_lib_filepath_for_shared_lib])

  succ, ws_out = call_wsadmin(args)
  if ws_out.find("successfully") < 0:
    raise Exception("Create shared library failed")

  # create the classloader and associate sharedlib with it
  args = CONFIG.get_was_cmd_line()
  args.extend(["-f",  "./viewer/tasks/create_clzloader.py"])
  args.extend([WAS_NODE_VIEWER_NAME])
  args.extend([WAS_SERVER_VIEWER_NAME])
  args.extend([VIEWER_SHAREDLIB_NAME])

  succ, ws_out = call_wsadmin(args)
  if ws_out.find("successfully") < 0:
    raise Exception("Create shared library failed")

  # copy the shared library files to viewer install directory
  os.makedirs(VIEWER_SHAREDLIB_PATH)
  for f in os.listdir(VIEWER_INSTALLER_PATH_SHAREDLIB):
    f_path = VIEWER_INSTALLER_PATH_SHAREDLIB + os.sep + f
    f_path_dest = VIEWER_SHAREDLIB_PATH + os.sep + f
    if os.path.isfile(f_path):
      shutil.copy2(f_path, f_path_dest)

  print("Create SharedLib and Classloader for viewer verse completed")

  return True

#---------------------------------------------------------------------------------------------
# Setup Gluster NFS shares for viewernext
#---------------------------------------------------------------------------------------------
def get_gluster_ac_nfs_shares(nfs_uid, nfs_gid):
  global nasHostname, nasMountPoint, r_docs_shared_dir
  global nasHostname4Viewer, nasMountPoint4Viewer, r_viewer_shared_dir

  logging.info("setting up Windows gluster nfs client ...")
  mountLib.setup_nfs_client(str(nfs_uid), str(nfs_gid))
  # setup nfs parameters and restart nfs client service
  setup_nfs_parameters()
  vip = registryParser.getSetting('MiddlewareStorage','gluster_vip')
  vip = vip.split("/")[0]
  nasHostname = vip
  nasHostname4Viewer = vip
  if zooKeeperClient.isActiveSide():
    nasMountPoint = "/docs/data"
    nasMountPoint4Viewer = "/acViewer"
  else:
    nasMountPoint = "/docs_test/data"
    nasMountPoint4Viewer = "/acViewer_test"
  r_docs_shared_dir = DOCS_SHARED_DATA_ROOT_NFS_VAL
  r_viewer_shared_dir = "v:"

  return True
#---------------------------------------------------------------------------------------------
# Setup NFS shares for viewernext
#---------------------------------------------------------------------------------------------
def get_ac_nfs_shares(nfs_uid, nfs_gid):
  global nasHostname, nasMountPoint, r_docs_shared_dir
  global nasHostname4Viewer, nasMountPoint4Viewer, r_viewer_shared_dir

  logging.info("setting up Windows nfs client ...")
  mountLib.setup_nfs_client(str(nfs_uid), str(nfs_gid))
  # setup nfs parameters and restart nfs client service
  setup_nfs_parameters()

  #get docs nfs share
  if zooKeeperClient.isActiveSide():
    docs_nas_share = registryParser.getSetting('Docs', 'docs_nas_share')
  else:
    docs_nas_share = registryParser.getSetting('Docs', 'docs_nas_share_test')

  if docs_nas_share:
    docs_nas_share = docs_nas_share.strip()
    (nasHostname, nasMountPoint) = docs_nas_share.split(":")
    nasMountPoint = nasMountPoint + "/data"
    #docs_shared_dir = "".join(["//", docs_nas_share.replace(":", ""), "/data"])
    #docs_mount_dir = docs_nas_share
  else:
    (nasHostname, nasMountPoint) = get_nfs_share(zooKeeperClient, "docs");
    nasMountPoint = nasMountPoint + "/data"
  r_docs_shared_dir = DOCS_SHARED_DATA_ROOT_NFS_VAL

  #get viewer nfs share
  if zooKeeperClient.isActiveSide():
    nas_viewer_share = registryParser.getSetting('AC', 'nas_viewer_share')
  else:
    nas_viewer_share = registryParser.getSetting('AC', 'nas_viewer_test_share')

  if nas_viewer_share:
    nas_viewer_share = nas_viewer_share.strip()
    (nasHostname4Viewer, nasMountPoint4Viewer) = nas_viewer_share.split(":")
    #viewer_shared_dir = "".join(["//", viewerMountPoint.replace(":", "")])
  else:
    if nasHostname: # save the time of get nasHost from ZK if it is done from Docs side above
    	nasMountPoint4Viewer = '/nfsexports/smartcloud/%s' % "acViewer"
    	nasHostname4Viewer = nasHostname
    else:
      (nasHostname4Viewer, nasMountPoint4Viewer) = get_nfs_share(zooKeeperClient, "acViewer");
    #viewer_shared_dir = "//%s%s%s" % (nasHostname, NAS_ROOT_DIR, nasMountPoint)

  r_viewer_shared_dir = "v:"
  return True

def setup_ac_nfs_shares_viewer():
  mountType = "nfs"
  if useGluster == "true":
    mountType = "gluster"
  docs_shared_json = "{\r\n	      \"type\": \"%s\",\r\n	    	\"server\": \"%s\",\r\n	    	\"from\": \"%s\",\r\n	    	\"to\": \"%s\",\r\n	    	\"retry\": \"-1\",\r\n	    	\"timeo\": \"-1\",\r\n                \"lock\": \"false\"\r\n	    }" % (mountType, nasHostname, nasMountPoint, r_docs_shared_dir)
  viewer_shared_json = "{\r\n	      \"type\": \"%s\",\r\n	    	\"server\": \"%s\",\r\n	    	\"from\": \"%s\",\r\n	    	\"to\": \"%s\",\r\n	    	\"retry\": \"-1\",\r\n	    	\"timeo\": \"-1\"\r\n	    }" % (mountType, nasHostname4Viewer, nasMountPoint4Viewer, r_viewer_shared_dir)

  from viewer.config import CONFIG
  cell_name = CONFIG.get_cell_name()
  installed_viewer_cfg_json_file = WAS_INSTALL_ROOT + "/profiles/" + WAS_PROFILE_VIEWER_NAME + "/config/cells/" + cell_name + "/IBMDocs-config/viewer-config.json"

  print('To update shared storage settings in viewer-config.json')
  print('docs_shared = ' + docs_shared_json)
  print('viewer_shared = ' + viewer_shared_json)

  viewer_config_json_file = open(installed_viewer_cfg_json_file)
  viewer_config_json_string = viewer_config_json_file.read()
  viewer_config_json_file.close()

  viewer_config_json_string = viewer_config_json_string.replace("\"#DOCS2NFS#\"", docs_shared_json)
  viewer_config_json_string = viewer_config_json_string.replace("\"#VIEWER2NFS#\"", viewer_shared_json)

  config_json_subst_file = open(installed_viewer_cfg_json_file, "w")
  config_json_subst_file.write(viewer_config_json_string)
  config_json_subst_file.close()

  print("update nfs storage parameters completed")

  return True

def get_nfs_share(zooKeeperClient, sharename):
  l_nasHostname = zooKeeperClient.getFrontEndInterface('/topology/nas/servers/1')
  zooKeeperClient.waitForServerActivation('/topology/nas/servers/1')
  l_nasMountPoint = '/nfsexports/smartcloud/%s' % (sharename)

  return (l_nasHostname, l_nasMountPoint)

#---------------------------------------------------------------------------------------------
# Install directory.services.xml
#---------------------------------------------------------------------------------------------
def install_directory_service():
  print("Start to install configuration files required by directory services")

  ldap_port=zooKeeperClient.getSettingByComponent('MiddlewareIDS','ldap_non_ssl_port')
  ldap_ip=zooKeeperClient.getBackEndVIP('/topology/ids/rovip')

  ldap_url = 'ldap://'+ldap_ip+':'+ldap_port
  print('ldap_url is %s' % (ldap_url))

  ldap_credentials = None
  try:
    ldap_credentials = zooKeeperClient.getSettingByComponent('MiddlewareIDS','publicgroup_reader_password')
  except:
    pass

  if ldap_credentials:
    ldap_credentials = base64.b64encode(ldap_credentials)
    print('base64 encoded ldap_credentials is %s' % (ldap_credentials))

  ldap_xml= CONFIG_SRC_ROOT+ '/'+ DIRECTORY_SERVICES_XML
  print('ldap_xml is %s' % (ldap_xml))

  for line in fileinput.input(ldap_xml, inplace=1):
    line = re.sub('ldap://hostname:port', ldap_url, line)
    if ldap_credentials:
      line = re.sub('Base64 Encoded Secret', ldap_credentials, line)
      line = re.sub('<property name="java.naming.security.authentication">none</property>', '<!-- <property name="java.naming.security.authentication">none</property> -->', line)
      line = re.sub('<!-- LDAP authentication', '', line)
      line = re.sub('LDAP authentication -->', '', line)
    sys.stdout.write(line)

  from viewer.config import CONFIG
  from util.common import call_wsadmin

  args = CONFIG.get_was_cmd_line()
  args.extend(["-f",  "./viewer/tasks/install_directory_services_config.py"])
  args.extend([CONFIG_SRC_ROOT])

  succ, ws_out = call_wsadmin(args)
  if not succ:
    raise Exception('Failed to install configuration file.')
  else:
    print("Install configuration files for directory service completed")

#---------------------------------------------------------------------------------------------
# set Viewer WAS environment variable
#---------------------------------------------------------------------------------------------
def set_viewer_was_var(key, value):
  print("Start to set viewer was environment variable for %s" % key)

  from viewer.config import CONFIG
  from util.common import call_wsadmin

  args = CONFIG.get_was_cmd_line()
  args.extend(["-f",  "./viewer/tasks/set_websphere_variable.py"])
  args.extend([key])
  args.extend([value])

  succ, ws_out = call_wsadmin(args)
  if not succ:
    raise Exception('Failed to set Viewer WAS environment var for %s.' % key)
  else:
    print("Set Viewer WAS environment var for %s. completed" % key)

#---------------------------------------------------------------------------------------------
# set Conversion WAS environment variable
#---------------------------------------------------------------------------------------------
def set_conversion_was_var(key, value, adminUsername, adminPassword):
  print("Start to set conversion was environment variable for %s" % key)

  from common import CFG, config, call_wsadmin

  config.GWAS_ADMIN_ID = adminUsername
  config.GWAS_ADMIN_PW = adminPassword
  config.GACCEPT_LICENSE = 'true'
  config.GSILENTLY_INSTALL = 'true'

  args = CFG.get_was_cmd_line()
  args.extend(["-f",  "./conversion/tasks/set_websphere_variable.py"])
  args.extend([key])
  args.extend([value])

  succ, ws_out = call_wsadmin(args)
  if not succ:
    raise Exception('Failed to set conversion WAS environment var for %s.' % key)
  else:
    print("Set conversion WAS environment var for %s. completed" % key)

def copy_vn_flip_script():
  dest_path = "C:/LotusLive/Scripts"
  source_path = "C:/ViewerNext/Viewer/installer/util/F00ConfigureViewerNext.py"

  from viewer.config import CONFIG
  cell_name = CONFIG.get_cell_name()
  installed_viewer_cfg_json_file = "C:" + WAS_INSTALL_ROOT + "/profiles/" + WAS_PROFILE_VIEWER_NAME + "/config/cells/" + cell_name + "/IBMDocs-config/viewer-config.json"

  fr = open(source_path, "r")
  lines = fr.readlines()
  fr.close()
  if not os.path.exists(dest_path):
    logging.info("%s directory not exists, something error happened" % dest_path)
    os.makedirs(dest_path)
  fw = open(dest_path + "/F00ConfigureViewerNext.py", "w")
  for line in lines:
    fw.write(line.replace('$VIEWER_CONFIG_PATH',installed_viewer_cfg_json_file))
  fw.close()

#---------------------------------------------------------------------------------------------
#collect logs from source_dirs(one directory or more), build a zip file named  zip_file_name in target_dir
#---------------------------------------------------------------------------------------------
def collect_zip_log(zip_file_name,target_dir,*source_dirs):
  # new zip file
  f = None
  try:
    if(os.path.isdir(target_dir)):
      f = zipfile.ZipFile(os.path.join(target_dir,zip_file_name),'w',zipfile.ZIP_DEFLATED)
      print('new zip file %s in directory %s' % (zip_file_name, target_dir))
    else:
      raise Exception(target_dir + ' does not exist or is not a directory')
    if(len(source_dirs) == 0):
      print('no source directories defined')
    else:
      #add logs to zip
      for source_dir in source_dirs:
        if(os.path.isdir(source_dir)):
          print('find logs in %s' % (source_dir))
          for parent,dirnames,filenames in os.walk(source_dir):
            for filename in filenames:
              full_filename = os.path.join(parent,filename)
              print('%s is zipped.' % (full_filename))
              f.write(full_filename,full_filename)
        elif (os.path.isfile(source_dir)):
          print('find log file %s' % (source_dir))
          f.write(source_dir, source_dir)
        else:
          print('%s does not exist' % (source_dir))
          continue
  except Exception as e:
    print('Exception during collecting log files')
    print(e)
  finally:
    if f != None:
      f.close()

def getACNodePort(appname):
  from util.getPortFromZnode import getPortByComponent
  port = getPortByComponent(appname)
  if type(port) != int:
    port = int(port)
  return port
#---------------------------------------------------------------------------------------------
#set java8 runtime environment for WAS
#---------------------------------------------------------------------------------------------
def set_was_java8():
  manage_sdk_path = os.path.join('C:'+ WAS_INSTALL_ROOT,"bin/managesdk.bat")
  if os.path.exists(manage_sdk_path):
    command1 = [manage_sdk_path,"-listAvailable"]
    process = subprocess.Popen(command1, stdout=subprocess.PIPE )
    stdout = process.communicate()[0]
    process.wait()
    command2 = [manage_sdk_path,"-setCommandDefault","-sdkName","1.8_64"]
    command3 = [manage_sdk_path,"-setNewProfileDefault","-sdkName","1.8_64"]
    if("1.8_64" in stdout):
      logging.info('Set WAS runtime environment to Java8')
      process = subprocess.Popen(command2)
      process.wait()
      process = subprocess.Popen(command3)
      process.wait()

#---------------------------------------------------------------------------------------------
# Kill symphony once after install process, for pipeline
#---------------------------------------------------------------------------------------------
def kill_sym():
  logging.info("Stopping all the soffice processes")
  if os.name == "nt":
    subprocess.call(["taskkill.exe", "/f", "/im", "soffice.bin"])

  logging.info("Waiting 10s after killing soffice.exe to remove DLL successfully")
  time.sleep(10)
  logging.info("All the soffice processes stopped")
#---------------------------------------------------------------------------------------------
# Fixed OCS ticket 219873
#---------------------------------------------------------------------------------------------
def disable_viewer_tls_algorithms():
  from viewer.config import CONFIG
  from util.common import call_wsadmin

  print("Create custom security property com.ibm.websphere.tls.disabledAlgorithms for viewer start...")
  args = CONFIG.get_was_cmd_line()
  args.extend(["-f",  "./viewer/tls_disabledAlgorithms.py"])
  args.extend([WAS_SERVER_VIEWER_NAME])
  args.extend([WAS_NODE_VIEWER_NAME])

  succ, ws_out = call_wsadmin(args)
  if not succ:
    print("Failed to create com.ibm.websphere.tls.disabledAlgorithms for viewer.")
  else:
    print("Create custom security property com.ibm.websphere.tls.disabledAlgorithms for viewer complete...")

def disable_conversion_tls_algorithms(adminUsername, adminPassword):
  addSysPath(CONV_INSTALL_PATH)
  from common import CFG, config, call_wsadmin

  config.GWAS_ADMIN_ID = adminUsername
  config.GWAS_ADMIN_PW = adminPassword
  config.GACCEPT_LICENSE = 'true'
  config.GSILENTLY_INSTALL = 'true'

  print("Create custom security property com.ibm.websphere.tls.disabledAlgorithms for conversion start...")
  args = CFG.get_was_cmd_line()
  args.extend(["-f",  "C:/ViewerNext/Conversion/installer/conversion/tls_disabledAlgorithms.py"])
  args.extend([WAS_SERVER_CONV_NAME])
  args.extend([WAS_NODE_CONV_NAME])

  succ, ws_out = call_wsadmin(args)
  if not succ:
    print("Failed to create com.ibm.websphere.tls.disabledAlgorithms for conversion.")
  else:
    print("Create custom security property com.ibm.websphere.tls.disabledAlgorithms for conversion complete...")
  removeSysPath(CONV_INSTALL_PATH)

#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------
if __name__ == "__main__":
    wasDir = WAS_INSTALL_ROOT
    zkPath = ZK_VIEWERNEXT_PATH

    check_pagingfiles_setting()

    #Register IP information with ZooKeeper
    zooKeeperClient = ZooKeeperClient()
    zooKeeperClient.publishRegistrySettings('ViewerNext')
    registerWithZookeeper(zooKeeperClient,zkPath)

    #Read the registry settings
    registryParser = RegistryParser()
    #Read the gluster settings
    useGluster = "false"
    try:
      useGluster = registryParser.getSetting('MiddlewareStorage','enable_gluster')
    except:
      useGluster = "false"

    #Read Docs Multiactive settings
    bDocsMultiActive = registryParser.getSetting('Docs','is_docs_multiactive')

    drive_disk = registryParser.getSetting('ViewerNext', 'docscr_drive_disk')
    if drive_disk:
      CONVERSION_INSTALL_ROOT = CONVERSION_INSTALL_ROOT % (drive_disk)
    else:
      CONVERSION_INSTALL_ROOT = CONVERSION_INSTALL_ROOT % ("C:")

    try:
	    adminUsername = registryParser.getSetting('MiddlewareWebSphere', 'admin_username')
	    adminPassword = registryParser.getSetting('MiddlewareWebSphere', 'admin_password')
	    # MiddlewareNFS is removed from DPUI tab, this is a quick workaround for fix
	    #NAS Mount Point like  nfs1.lotuslivedaily.swg.usma.ibm.com:/smartcloud/acViewer

	    # non_admin_name mean non Windows administrator, adminUserName means WAS admin user name
	    non_admin_name = adminUsername
	    non_admin_password = adminPassword

	    websphere_ids = registryParser.getSetting('MiddlewareUsers', 'websphere_ids')
	    if websphere_ids:
	    	(nfs_uid, nfs_gid) = websphere_ids.strip().split(':')
	    else:
	    	raise Exception("MiddlewareUsers Tab in mis-configured, please check and redeploy.")

	    sym_instance_num = registryParser.getSetting('ViewerNext', 'symphony_instance_number')
	    ste_instance_num = registryParser.getSetting('ViewerNext', 'stellent_instance_number')

	    # 0. Get pre-config file ready, JSON and cfg.properties
	    token = zooKeeperClient.getSettingByComponent('BSSCore', 's2s_token')
	    # get Files port from acnode, default to 9088 (JVM splitted port)
	    filesport = getACNodePort('Files')
	    if filesport <= 10:
	      filesport = 9088

	    if bDocsMultiActive == "true":
	    	fileshost = registryParser.getVSRHostByServiceName('ac')
	    	bsshost = registryParser.getVSRHostByServiceName('bsscore')
	    	# <Environment>Engage-TFIM-9090   eg. MA1Engage-TFIM-9090 is the virtual server which points only to the dmgr
	    	journal_server_host = registryParser.getVSRHostByServiceName('tfim')
	    else:
	    	fileshost = zooKeeperClient.getBackEndVIP('/topology/ac/vip')
	    	bsshost = zooKeeperClient.getBackEndVIP('/topology/bsscore/vip')
	    	journal_server_host = zooKeeperClient.getBackEndInterface('/topology/tfim/servers/dmgr')

	    files_url = ''.join(['http://',fileshost,':',str(filesport),'/files'])
	    bss_url = ''.join(['http://',bsshost,':8181/bss'])
	    journal_server_url = 'http://%s:9090' % journal_server_host

	    domain = zooKeeperClient.getSettingByComponent('MiddlewareTAM','virtual_hosts_junction_domain')
	    if token:
	      modify_conversion_config_json(token.strip(), str(ste_instance_num), str(sym_instance_num)) # zk bug: must remove trailing \r get from ZK client
	      modify_viewer_config_json(token.strip(), files_url, bss_url, domain)
	    #os_userid, os_password = getOSAdminInfo()
	    updateSymphonyMonitorTask(non_admin_name, non_admin_password)

	    if useGluster == "true":
	      get_gluster_ac_nfs_shares(nfs_uid, nfs_gid)
	    else:
	      get_ac_nfs_shares(nfs_uid, nfs_gid)

	    share_drv = os.getenv('SHARED_DRV', 'H')
	    check_datavolume(share_drv)
	    viewer_shared_dir = share_drv + ":/shared"

	    ## WORKAROUND for S49
	    #VIEWER_SHARED_DATA_ROOT_NFS_VAL = share_drv + ":/vwshared"
	    #r_viewer_shared_dir = VIEWER_SHARED_DATA_ROOT_NFS_VAL
	    #mkdir_vw(VIEWER_SHARED_DATA_ROOT_NFS_VAL)

	    viewer_url = 'http://localhost:9080/viewer'
	    gen_conversion_cfg_property(adminUsername, adminPassword, viewer_shared_dir, str(sym_instance_num), viewer_url)

	    conversion_url = 'http://localhost:9081/conversion'
	    docs_be_url = ''.join(['http://',zooKeeperClient.getBackEndVIP('/topology/docs/vip'),':9080/docs'])
	    gen_viewer_cfg_property(viewer_shared_dir, conversion_url, docs_be_url)

	    # 1. Mount NAS
	    # 2. Create and start WAS AppSrv profile service
	    set_was_java8()
	    zooKeeperClient.updateActivationStatus('Creating WebSphere Application Server profile1')
	    createAndStartAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_SERVER_VIEWER_NAME, WAS_PROFILE_VIEWER_NAME, WAS_NODE_VIEWER_NAME)
	    zooKeeperClient.updateActivationStatus('Creating WebSphere Application Server profile2')
	    createAndStartAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_SERVER_CONV_NAME, WAS_PROFILE_CONV_NAME, WAS_NODE_CONV_NAME)
	    # 2.1
	    create_os_user(non_admin_name,non_admin_password)
	    set_user_logon_batchjob(non_admin_name)

	    # Install IBM ViewerNext package starts
	    print('Starting IBM ViewerNext package installation')
	    zooKeeperClient.updateActivationStatus('IBM ViewerNext installation started...')
	    # Install Conversion
	    setDefaultAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_PROFILE_CONV_NAME)
	    os.chdir('C:/ViewerNext/Conversion/installer')

	    zooKeeperClient.updateActivationStatus('IBM Conversion installation started...')
	    preinstallConversion()

	    # NO UNINSTALL REQUIRED FOR Cloud factory installation
	    logging.info("Start Conversion installation...")
	    launchInstallConversion(adminUsername, adminPassword)
	    logging.info('IBM Conversion installation completed')

	    zooKeeperClient.updateActivationStatus('IBM Conversion installation completed')

	    disable_conversion_tls_algorithms(adminUsername, adminPassword)

	    # Install Viewer
	    setDefaultAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_PROFILE_VIEWER_NAME)
	    os.chdir('C:/ViewerNext/Viewer/installer')

	    zooKeeperClient.updateActivationStatus('IBM Viewer installation started...')
	    preinstallViewer(adminUsername, adminPassword)

	    logging.info("Start Viewer installation...")
	    installViewer(adminUsername, adminPassword, viewer_shared_dir)
	    copy_vn_flip_script()
	    setup_ac_nfs_shares_viewer()
	    logging.info('IBM Viewer installation completed')
	    zooKeeperClient.updateActivationStatus('IBM Viewer installation completed')

	    disable_viewer_tls_algorithms()

	    # Change Windows desktop heap size
	    original_heap_size = get_windows_heap_size()
	    add_windows_heap_size(original_heap_size.strip()) # fix the %SystemRoot% preceeding spaces via strip()

	    # Set WAS Service launched as non-administrator user 'wasadmin'
	    set_was_service_user('C:\\' + WAS_INSTALL_ROOT, WAS_SERVICE_VIEWER_NAME, non_admin_name,non_admin_password)
	    set_was_service_user('C:\\' + WAS_INSTALL_ROOT, WAS_SERVICE_CONV_NAME, non_admin_name,non_admin_password)

	    set_user_access_dir(CONVERSION_INSTALL_ROOT,non_admin_name)
	    stopServerByNameAndProfile(WAS_SERVER_CONV_NAME, WAS_PROFILE_CONV_NAME, adminUsername, adminPassword)

	    set_user_access_dir(VIEWER_INSTALL_ROOT,non_admin_name)
	    stopServerByNameAndProfile(WAS_SERVER_VIEWER_NAME, WAS_PROFILE_VIEWER_NAME, adminUsername, adminPassword)

	    kill_sym()

	    zooKeeperClient.updateActivationStatus('IBM ViewerNext installation completed')

	    time.sleep(15)
	    startWASService(WAS_SERVICE_CONV_NAME)
	    time.sleep(15)
	    startWASService(WAS_SERVICE_VIEWER_NAME)

	    # Activate the server in ZooKeeper
	    activateServer(zooKeeperClient, zkPath)
	    zooKeeperClient.updateActivationStatus('IBM ViewerNext server Activated via Zookeeper')
    except Exception as e:
	    zooKeeperClient.updateActivationStatus('IBM ViewerNext installation failed','failed')
	    logging.error(e)
	    sys.exit(1)
    finally:
      zip_file_name = 'viewernext.zip'
      target_dir = 'c:/lotuslive/log'
      conversion_log_dir = CONVERSION_INSTALL_ROOT + '/logs'
      viewer_log_dir = VIEWER_INSTALL_ROOT + '/logs'
      viewer_was_log_dir = 'C:'+WAS_INSTALL_ROOT + '/profiles/AppSrv1/logs/' + WAS_SERVER_VIEWER_NAME
      conv_was_log_dir = 'C:'+WAS_INSTALL_ROOT + '/profiles/AppSrv2/logs/' + WAS_SERVER_CONV_NAME
      dpstxt = 'C:/dps.txt'
      collect_zip_log(zip_file_name,target_dir,conversion_log_dir,conv_was_log_dir, viewer_was_log_dir, dpstxt, VIEWER_CFG_FILE, CONVERSION_CFG_FILE, viewer_log_dir)
