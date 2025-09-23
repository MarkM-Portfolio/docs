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

'The module executes IBM ViewerNext RPM installation steps'

import re, socket, sys, os, subprocess, shutil, stat, logging, fileinput, imp
import time, errno, zipfile, base64
from xml.dom import minidom

sys.path.append('/opt/ll/lib/websphere')
import serverLib
sys.path.append('/opt/ll/lib/nfs')
import mountLib
sys.path.append('/opt/ll/lib/apache/zookeeper')
sys.path.append('/opt/ll/lib/registry')
sys.path.append('/opt/ll/lib/gluster')
from zooKeeperLib import *
from registryLib import *
import platform
try:
    import glusterMount
except ImportError:
    pass

#Conversion
CONVERSION_CFG_FILE = "/opt/ll/apps/ViewerNext/rpm/Conversion/installer/cfg.properties"
CONVERSION_CFG_NODE_FILE = "/opt/ll/apps/ViewerNext/rpm/Conversion/installer/cfg.node.properties"
CONVERSION_CFG_SAMPLE_FILE = "/opt/ll/apps/ViewerNext/rpm/Conversion/installer/cfg.properties.sample"
CONVERSION_CONFIG_JSON = "/opt/ll/apps/ViewerNext/rpm/Conversion/config/conversion-config.json"

# Viewer
VIEWER_CFG_FILE = "/opt/ll/apps/ViewerNext/rpm/Viewer/installer/cfg.properties"
VIEWER_CONFIG_JSON = "/opt/ll/apps/ViewerNext/rpm/Viewer/config/viewer-config-premise-template.json"

#Directory services
CONFIG_SRC_ROOT = "/opt/ll/apps/ViewerNext/rpm/Viewer/config"
DIRECTORY_SERVICES_XML = "directory.services.xml"

# deployment destination
WAS_INSTALL_ROOT = "/opt/IBM/WebSphere/AppServer"
CONVERSION_INSTALL_ROOT ="/opt/IBM/IBMConversion"
VIEWER_INSTALL_ROOT = "/opt/IBM/IBMViewer"

#SCH_TASK_SCRIPT = "C:/ViewerNext/Conversion/config/sym_monitor_win/start_task.bat"
WAS_SOAP_PORT_VIEWER = "8880"
WAS_SOAP_PORT_CONV = "8881"
WAS_SERVER_VIEWER_NAME = "serverViewerNextV"
WAS_SERVER_CONV_NAME = "serverViewerNextC"
WAS_SERVICE_NAME_PREFIX = "was."
WAS_SERVICE_VIEWER_NAME = WAS_SERVICE_NAME_PREFIX + WAS_SERVER_VIEWER_NAME
WAS_SERVICE_CONV_NAME = WAS_SERVICE_NAME_PREFIX + WAS_SERVER_CONV_NAME
WAS_PROFILE_VIEWER_NAME = "AppSrv1"
WAS_PROFILE_CONV_NAME = "AppSrv2"
WAS_NODE_VIEWER_NAME = "ocs_app_node1_" + socket.gethostname().split(".")[0]
WAS_NODE_CONV_NAME = "ocs_app_node2_" + socket.gethostname().split(".")[0]

PROFILE_SOAP_CLIENT_PROPS = "soap.client.props"
ZK_VIEWERNEXT_PATH = '/topology/viewernext/servers'


#WAS_SERVICE_SCRIPT = "c:/ViewerNext/Viewer/installer/util/runWebSphereAs.bat"

CONV_INSTALL_PATH='/opt/ll/apps/ViewerNext/rpm/Conversion/installer'
VIEWER_INSTALL_PATH='/opt/ll/apps/ViewerNext/rpm/Viewer/installer'

VIEWER_SHAREDLIB_NAME = "VIEWER_SHAREDLIB_FLOCK"
VIEWER_SHAREDLIB_PATH = VIEWER_INSTALL_ROOT + "/sharedlib"
VIEWER_INSTALLER_PATH_SHAREDLIB = VIEWER_INSTALL_PATH + "/../sharedlib"

VIEWER_LOCAL_MOUNT_POINT= '/mnt/nas/viewer'
CONV_LOCAL_MOUNT_POINT= '/mnt/nas/conversion'

serviceUser='websphere'
serviceGroup='websphere'

def _init_log():
  log_dir ='/opt/ll/logs/SC-ViewerNext-Config'
  log_path = log_dir + os.sep + 'ViewerNextInstall.log'

  if not os.path.exists(log_dir):
    os.makedirs(log_dir)

  logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s %(message)s', filename=log_path, filemode='w')

  console = logging.StreamHandler()
  console.setLevel(logging.INFO)
  formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)
#---------------------------------------------------------------------------------------------
# modify conversion configuration file
#---------------------------------------------------------------------------------------------
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
#---------------------------------------------------------------------------------------------
# modify viewer configuration file
#---------------------------------------------------------------------------------------------
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

#---------------------------------------------------------------------------------------------
# set java8 runtime environment for WAS
#---------------------------------------------------------------------------------------------
def set_was_java8():
  manage_sdk_path = os.path.join(WAS_INSTALL_ROOT,"bin/managesdk.sh")
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
# set foler permissions
#---------------------------------------------------------------------------------------------
def set_folder_permissions(username,groupname,path,permission,recursive=False):
  recursive_tag = ''
  if recursive:
    recursive_tag = '-RL'
  cmds = ['chmod %s %s' % (permission,path), 'chown %s %s:%s %s' % (recursive_tag,username,groupname,path)]

  for cmd in cmds:
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT);
    output = p.communicate()[0]
    #print output
    retval = p.returncode
    if retval:
      raise Exception('RC %s while updating folder permission (%s)' % (retval,cmd))

#---------------------------------------------------------------------------------------------
# set file permission
#---------------------------------------------------------------------------------------------
def set_file_permission(path, permission):
  cmd = ['chmod %s %s' % (permission,path)]
  p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT);
  output = p.communicate()[0]
  #print output
  retval = p.returncode
  if retval:
    raise Exception('RC %s while updating folder permission (%s)' % (retval,cmd))

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
# get nfs share
#---------------------------------------------------------------------------------------------
def get_nfs_share(zooKeeperClient, sharename):
  l_nasHostname = zooKeeperClient.getFrontEndInterface('/topology/nas/servers/1')
  zooKeeperClient.waitForServerActivation('/topology/nas/servers/1')
  l_nasMountPoint = '/nfsexports/smartcloud/%s' % (sharename)
  return (l_nasHostname, l_nasMountPoint)

#---------------------------------------------------------------------------------------------
# config NFS client to communicate with Docs & AC
#---------------------------------------------------------------------------------------------
def nfs_config(nfs_uid, nfs_gid):
  logging.info('Config NFS to mount NFS server for Viewer and Conversion')
  # get nfs config for Covnersion
  if zooKeeperClient.isActiveSide():
    docs_nas_share = registryParser.getSetting('Docs', 'docs_nas_share')
  else:
    docs_nas_share = registryParser.getSetting('Docs', 'docs_nas_share_test')

  if docs_nas_share:
    docs_nas_share = docs_nas_share.strip()
    (nasHostname, nasMountPoint) = docs_nas_share.split(":")
    nasMountPoint = nasMountPoint + "/data"
  else:
    (nasHostname, nasMountPoint) = get_nfs_share(zooKeeperClient, "docs");
    nasMountPoint = nasMountPoint + "/data"
  # mount conversion
  mount_conversion(nfs_uid, nfs_gid, nasHostname, nasMountPoint)

  # get nfs config for Viewer
  if zooKeeperClient.isActiveSide():
    nas_viewer_share = registryParser.getSetting('AC', 'nas_viewer_share')
  else:
    nas_viewer_share = registryParser.getSetting('AC', 'nas_viewer_test_share')

  if nas_viewer_share:
    nas_viewer_share = nas_viewer_share.strip()
    (nasHostname4Viewer, nasMountPoint4Viewer) = nas_viewer_share.split(":")
  else:
    if nasHostname: # save the time of get nasHost from ZK if it is done from Docs side above
    	nasMountPoint4Viewer = '/nfsexports/smartcloud/%s' % "acViewer"
    	nasHostname4Viewer = nasHostname
    else:
      (nasHostname4Viewer, nasMountPoint4Viewer) = get_nfs_share(zooKeeperClient, "acViewer");
  # mount viewer
  mount_viewer(nasHostname4Viewer,nasMountPoint4Viewer)

#---------------------------------------------------------------------------------------------
# mount nfs for Conversion application
#---------------------------------------------------------------------------------------------
def mount_conversion(nfs_uid, nfs_gid, nasHostname, nasMountPoint):
  if not os.path.exists('/opt/ll/runtime'):
    os.makedirs('/opt/ll/runtime',0o755)
  mountLib.setupFSTab('%s:%s' % (nasHostname,nasMountPoint), CONV_LOCAL_MOUNT_POINT)
  # Update mount option with acdirmin because viewer query snapshot readable.tag have at least 30s delay due to the default value of acdirmin
  update_fstab_for_docs_share()
  mountLib.mountFilesystem(CONV_LOCAL_MOUNT_POINT)
  mountLib.linkFilesystem('/opt/ll/runtime/data')
  os.system('chmod 755 /opt/ll/runtime')
  set_folder_permissions(nfs_uid,nfs_gid,'/opt/ll/runtime/data',700)

#---------------------------------------------------------------------------------------------
# mount nfs for Viewer application
#---------------------------------------------------------------------------------------------
def mount_viewer(nasHostname, nasMountPoint):
  mountLib.setupFSTab('%s:%s' % (nasHostname,nasMountPoint), VIEWER_LOCAL_MOUNT_POINT)
  mountLib.mountFilesystem(VIEWER_LOCAL_MOUNT_POINT)

def update_fstab_for_docs_share():
  #Remove any existing entries with the input local mount point
  logging.info( 'Updating mount options in /etc/fstab for docs share' )
  updatedFSTab = ''
  f = open('/etc/fstab','r')
  contents = f.read()
  f.close()
  for line in contents.splitlines():
    m = re.search(r'(.+?)\t' + CONV_LOCAL_MOUNT_POINT + r'\t(.+?)\t(.+?)\t(.+?)',line)
    if m :
      logging.info( 'Found existing entry for mount point' + CONV_LOCAL_MOUNT_POINT )
      mountOptions = m.group(3);
      newLine = re.sub(mountOptions, mountOptions + ',acdirmin=1', line);
      updatedFSTab += newLine + '\n'
      logging.info( 'Update existing entry for mount point %s against share "%s" with new mount option acdirmin=1' % (CONV_LOCAL_MOUNT_POINT, m.group(1)) )
    else:
      updatedFSTab += line + '\n'

  #Write the fstab entry for the mount point
  f = open('/etc/fstab','w')
  f.write(updatedFSTab)
  f.close()
#---------------------------------------------------------------------------------------------
# mount conversion and viewer when gluster is enabled as NFS storage
#---------------------------------------------------------------------------------------------
def gluster_nfs_config(nfs_uid, nfs_gid):
  'config Gluster NFS client to communicate with Docs & AC'
  logging.info('Config Gluster NFS to mount NFS server for Viewer and Conversion')
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
  # mount conversion
  mount_conversion(nfs_uid, nfs_gid, nasHostname, nasMountPoint)
  # mount viewer
  mount_viewer(nasHostname4Viewer,nasMountPoint4Viewer)

#---------------------------------------------------------------------------------------------
# generate conversion cfg property
#---------------------------------------------------------------------------------------------
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
  cp.set("Conversion", "docs_shared_storage_local_path", CONV_LOCAL_MOUNT_POINT)
  #cp.set("Conversion", "docs_shared_storage_remote_server", nasHostname)
  #cp.set("Conversion", "docs_shared_storage_remote_path", nasMountPoint)
  #Viewer server shared storage.
  cp.set("Conversion", "viewer_shared_storage_type", mountType)
  cp.set("Conversion", "viewer_shared_storage_local_path", VIEWER_LOCAL_MOUNT_POINT)
  #cp.set("Conversion", "viewer_shared_storage_remote_server", nasHostname4Viewer)
  #cp.set("Conversion", "viewer_shared_storage_remote_path", nasMountPoint4Viewer)
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

#---------------------------------------------------------------------------------------------
# generate Viewer cfg property
#---------------------------------------------------------------------------------------------
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
  cp.set("Viewer", "docs_shared_data_dir", CONV_LOCAL_MOUNT_POINT)
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

#---------------------------------------------------------------------------------------------
# Create the WAS AppSrv profile
#---------------------------------------------------------------------------------------------
def startAppSrvProfile(wasDir, adminUsername, adminPassword, serverName, profileName, nodeName):
  try:
    update_soap_client_props_timeout(WAS_INSTALL_ROOT + "/profiles/" + profileName + "/properties/" + PROFILE_SOAP_CLIENT_PROPS, "com.ibm.SOAP.requestTimeout=.*", "com.ibm.SOAP.requestTimeout=1000")
    logging.info('Start WAS server')
    serverLib.startServerByName(serverName, wasDir)
    logging.info('Register WAS %s as service' % (serverName))
    serverLib.createService(adminUsername, adminPassword, 'was.' + serverName, serverName, profileName, wasDir)
    logging.info('Finish to prepare the WAS environment!')
  except:
    logging.info('Error:  Unable to start profile %s ' % (profileName))
    raise
  logging.info('AppSvr is running...continuing install')

#---------------------------------------------------------------------------------------------
# Create a server profile
#---------------------------------------------------------------------------------------------
def createProfile(adminUsername, adminPassword, serverName, profileName, nodeName, installDir):
  adminUsername = adminUsername.encode('ascii','ignore')

  logging.info('Creating profile for server %s' % (serverName))
  try:
    cmd = [ '%s/bin/manageprofiles.sh' % installDir, '-create',
            '-templatePath', '%s/profileTemplates/default' % installDir,
            '-profileName', profileName,
            '-nodeName', nodeName,
            '-serverName', serverName,
            '-enableAdminSecurity', 'true',
            '-omitAction', 'defaultAppDeployAndConfig',
            '-adminUserName', adminUsername, '-adminPassword', adminPassword ]

    p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    for line in p.stdout.readlines():
      print(line.strip('\n'))
    retval = p.wait()
    if retval:
      raise Exception('RC %s while creating WebSphere profile' % (retval))
    #Configure the SOAP login properties
    serverLib.configureSOAPCreds(adminUsername, adminPassword, profileName, installDir)
  except:
    logging.info('Error:  Failed to create profile')
    raise Exception("Exception: %s %s" % (sys.exc_info()[0], sys.exc_info()[1]))

def updateProfilePermissions(installDir):
  logging.info('Updating profile permissions')
  try:
    # Update permissions of installation dir
    cmd = 'chown -R %s:%s %s' % (serviceUser, serviceGroup, installDir)
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT);
    retval = p.wait()
    if retval:
      raise Exception('RC %s while updating profiles folder permission' % (retval))
  except:
    logging.info('Error:  Failed to update profile permissions')
    raise Exception("Exception: %s %s" % (sys.exc_info()[0], sys.exc_info()[1]))

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

#---------------------------------------------------------------------------------------------
# Set nonroot configuration
#---------------------------------------------------------------------------------------------
def nonroot_config():
  'set security permissions of folder'
  logging.info('Non-root installation need set security permissions of folder')
  if not os.path.exists(VIEWER_INSTALL_ROOT):
    os.makedirs(VIEWER_INSTALL_ROOT,0o755)
  if not os.path.exists(CONVERSION_INSTALL_ROOT):
    os.makedirs(CONVERSION_INSTALL_ROOT,0o755)
  if not os.path.exists(CONVERSION_INSTALL_ROOT + '/logs'):
    os.makedirs(CONVERSION_INSTALL_ROOT + '/logs', 0o755)

  conv_shared_datadir= '/opt/ll/runtime/data/data'
  if not os.path.exists(conv_shared_datadir):
    os.makedirs(conv_shared_datadir,0o700)

  wsclog = open(CONV_INSTALL_PATH + '/wsadmin.log', 'w+')
  wsclog.close()
  wsvlog = open(VIEWER_INSTALL_PATH + '/wsadmin.log', 'w+')
  wsvlog.close()

  set_permissions(serviceUser, serviceGroup, '..', True)
  set_permissions(serviceUser, serviceGroup, '../', True)
  set_permissions(serviceUser, serviceGroup, '/opt/ll/apps', True)
  set_permissions(serviceUser, serviceGroup, VIEWER_INSTALL_ROOT, True)
  set_permissions(serviceUser, serviceGroup, CONVERSION_INSTALL_ROOT, True)
  set_permissions(serviceUser, serviceGroup, WAS_INSTALL_ROOT, True)
  set_permissions(serviceUser, serviceGroup, VIEWER_INSTALL_PATH, True)
  set_permissions(serviceUser, serviceGroup, CONV_INSTALL_PATH, True)
  set_folder_permissions(serviceUser, serviceGroup, conv_shared_datadir, 700)

def set_permissions(username, groupname, path, recursive=False):
  set_folder_permissions(username, groupname, path, 755, recursive)

#---------------------------------------------------------------------------------------------
# Set default application profile
#---------------------------------------------------------------------------------------------
def setDefaultAppSrvProfile(wasDir, adminUsername, adminPassword, profileName):
  hostname = socket.gethostname().split('.')[0]
  adminUsername = adminUsername.encode('ascii','ignore')
  logging.info('Setting default profile to %s' % (profileName))
  try:
    cmd = [ '"%s/bin/manageprofiles.sh"' % wasDir,
            '-setDefaultName', '-profileName', profileName ]
    #print cmd
    p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    for line in p.stdout.readlines():
      print(line.strip('\n'))
    retval = p.wait()
    if retval:
      raise Exception('RC %s while settting default WebSphere profile' % (retval))
  except:
    logging.info('Error:  Failed to set default profile')
    raise Exception("Exception: %s %s" % (sys.exc_info()[0], sys.exc_info()[1]))

#---------------------------------------------------------------------------------------------
# Stop websphere server
#---------------------------------------------------------------------------------------------
def stopServerByNameAndProfile(serverName, profileName, adminName, adminPassword, installDir=WAS_INSTALL_ROOT):
  cmd = '"%s/bin/stopServer.sh" %s -profileName %s -username %s -password %s' % (installDir, serverName, profileName, adminName, adminPassword)
  print(cmd)
  p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  for line in p.stdout.readlines():
    print(line.strip('\n'))
    retval = p.wait()
  if retval:
    raise Exception('RC %s while starting server %s' % (retval,serverName))

def preinstallConversion():
  addSysPath(CONV_INSTALL_PATH)
  import util
  imp.reload(util)
  removeSysPath(CONV_INSTALL_PATH)

#---------------------------------------------------------------------------------------------
# Start a was service
#---------------------------------------------------------------------------------------------
def startWASService(serviceName):
  logging.info('Starting %s service...' % (serviceName))
  try:
    p = subprocess.Popen('service %s start' % (serviceName), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(p.communicate()[0])
    if p.returncode:
      raise Exception('RC %s while starting service %s' % (p.returncode,serviceName))
  except:
    logging.info('Error:  TFIM configuration failed. Unable to start service %s' % (serviceName))
    raise
#---------------------------------------------------------------------------------------------
# Trigger to install Conversion application
#---------------------------------------------------------------------------------------------
def launchInstallConversion(adminUsername, adminPassword, viewer_shared_dir):
  addSysPath(CONV_INSTALL_PATH)
  set_conversion_was_var("VIEWER_LOCAL", viewer_shared_dir, adminUsername, adminPassword )

  myCommand = ' '.join([
        'su -c "PYTHONPATH=$PWD:$PYTHONPATH python3 conversion/install.py',
        "-build",
        "/opt/ll/apps/ViewerNext/rpm/Conversion",
        "-wasadminID",
        adminUsername,
        "-wasadminPW",
        adminPassword,
        "-acceptLicense",
        '-silentlyInstall"',
        serviceUser
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
#---------------------------------------------------------------------------------------------
# create shared library for viewernext
#---------------------------------------------------------------------------------------------
def create_sharedlib_and_classloader(lib_path):
  logging.info("Start to create SharedLib and classloader for viewernext")
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

  logging.info("Create SharedLib and Classloader for viewer verse completed")
  return True

#---------------------------------------------------------------------------------------------
# Trigger to install Viewer
#---------------------------------------------------------------------------------------------
def installViewer(adminUsername, adminPassword, viewer_shared_dir):
  addSysPath(VIEWER_INSTALL_PATH)
  from commands import command
  create_sharedlib_and_classloader(VIEWER_SHAREDLIB_PATH)
  install_directory_service()
  set_viewer_was_var('VIEWER_LOCAL_DATA_NAME', "VIEWER_LOCAL")
  set_viewer_was_var('VIEWER_LOCAL_DATA_ROOT', viewer_shared_dir)
  myCommand = ' '.join([
        'su -c "PYTHONPATH=$PWD:$PYTHONPATH python viewer/install.py',
        VIEWER_CFG_FILE,
        "/opt/ll/apps/ViewerNext/rpm/Viewer/",
        adminUsername,
        adminPassword,
        "true",
        'false"',
        serviceUser
        ])
  proc = subprocess.Popen(myCommand, stdout=subprocess.PIPE, shell=True)
  for line in iter(proc.stdout.readline,''):
    print(line)
  retval = proc.wait()
  if retval:
    raise Exception('Viewer installation failed, check log file for more detail.')
  else:
    set_viewer_was_var('VIEWER_SHARED_DATA_ROOT', VIEWER_LOCAL_MOUNT_POINT)
    logging.info("Viewer installation Completed Successfully.")
  removeSysPath(VIEWER_INSTALL_PATH)
#---------------------------------------------------------------------------------------------
# Install directory.services.xml
#---------------------------------------------------------------------------------------------
def install_directory_service():
  logging.info("Start to install configuration files required by directory services")

  ldap_port=zooKeeperClient.getSettingByComponent('MiddlewareIDS','ldap_non_ssl_port')
  ldap_ip=zooKeeperClient.getBackEndVIP('/topology/ids/rovip')

  ldap_url = 'ldap://'+ldap_ip+':'+ldap_port
  logging.info('ldap_url is %s' % (ldap_url))

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
    logging.info("Install configuration files for directory service completed")

def copy_vn_flip_script():
  dest_path = "C:/LotusLive/Scripts" #TODO
  source_path = "/opt/ll/apps/ViewerNext/rpm/Viewer/installer/util/F00ConfigureViewerNext.py"

  from viewer.config import CONFIG
  cell_name = CONFIG.get_cell_name()
  installed_viewer_cfg_json_file = WAS_INSTALL_ROOT + "/profiles/" + WAS_PROFILE_VIEWER_NAME + "/config/cells/" + cell_name + "/IBMDocs-config/viewer-config.json"

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
# set Viewer WAS environment variable
#---------------------------------------------------------------------------------------------
def set_viewer_was_var(key, value):
  logging.info("Start to set viewer was environment variable for %s" % key)
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
    logging.info("Set Viewer WAS environment var for %s. completed" % key)

def getACNodePort(appname):
  addSysPath(VIEWER_INSTALL_PATH)
  import util
  imp.reload(util)
  from util.getPortFromZnodeLinux import getPortByComponent
  port = getPortByComponent(appname)
  removeSysPath(VIEWER_INSTALL_PATH)
  if type(port) != int:
    port = int(port)
  return port

#---------------------------------------------------------------------------------------------
# set Conversion WAS environment variable
#---------------------------------------------------------------------------------------------
def set_conversion_was_var(key, value, adminUsername, adminPassword):
  logging.info("Start to set conversion was environment variable for %s" % key)
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
    logging.info("Set conversion WAS environment var for %s. completed" % key)

def setup_DataDisk():
  addSysPath(VIEWER_INSTALL_PATH)
  logging.info('Create partition & mount to local disk for viewer start...')
  myCommand = ' '.join(['su -c "PYTHONPATH=$PWD:$PYTHONPATH python viewer/setupDataDisk.py"'])
  proc = subprocess.Popen(myCommand, stdout=subprocess.PIPE, shell=True)
  for line in iter(proc.stdout.readline,''):
    print(line)
  retval = proc.wait()
  if retval:
    raise Exception('Failed to mount to local disk for viewer')
  else:
    logging.info('Create partition & mount to local disk for viewer complete...')
  removeSysPath(VIEWER_INSTALL_PATH)

#---------------------------------------------------------------------------------------------
# Fixed OCS ticket 219873
#---------------------------------------------------------------------------------------------
def disable_viewer_tls_algorithms():
  from viewer.config import CONFIG
  from util.common import call_wsadmin

  logging.info("Create custom security property com.ibm.websphere.tls.disabledAlgorithms for viewer start...")
  args = CONFIG.get_was_cmd_line()
  args.extend(["-f",  "./viewer/tls_disabledAlgorithms.py"])
  args.extend([WAS_SERVER_VIEWER_NAME])
  args.extend([WAS_NODE_VIEWER_NAME])

  succ, ws_out = call_wsadmin(args)
  if not succ:
    logging.info("Failed to create com.ibm.websphere.tls.disabledAlgorithms for viewer.")
  else:
    logging.info("Create custom security property com.ibm.websphere.tls.disabledAlgorithms for viewer complete...")


def disable_conversion_tls_algorithms(adminUsername, adminPassword):
  addSysPath(CONV_INSTALL_PATH)
  from common import CFG, config, call_wsadmin

  config.GWAS_ADMIN_ID = adminUsername
  config.GWAS_ADMIN_PW = adminPassword
  config.GACCEPT_LICENSE = 'true'
  config.GSILENTLY_INSTALL = 'true'

  logging.info("Create custom security property com.ibm.websphere.tls.disabledAlgorithms for conversion start...")
  args = CFG.get_was_cmd_line()
  args.extend(["-f",  "/opt/ll/apps/ViewerNext/rpm/Conversion/installer/tls_disabledAlgorithms.py"])
  args.extend([WAS_SERVER_CONV_NAME])
  args.extend([WAS_NODE_CONV_NAME])

  succ, ws_out = call_wsadmin(args)
  if not succ:
    logging.info("Failed to create com.ibm.websphere.tls.disabledAlgorithms for conversion.")
  else:
    logging.info("Create custom security property com.ibm.websphere.tls.disabledAlgorithms for conversion complete...")
  removeSysPath(CONV_INSTALL_PATH)

#---------------------------------------------------------------------------------------------
# Activate the server
#---------------------------------------------------------------------------------------------
def activateServer(zooKeeperClient, zkPath):
  print('Activating server in ZooKeeper...')
  try:
     zooKeeperClient.activateServer(zkPath)
  except:
    logging.info('Error while attempting to activate server in ZooKeeper')
    raise
  logging.info('Server activated in ZooKeeper')

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
#collect logs from source_dirs(one directory or more), build a zip file named  zip_file_name in target_dir
#---------------------------------------------------------------------------------------------
def collect_zip_log(zip_file_name, target_dir, *source_dirs):
  # new zip file
  f = None
  try:
    if(os.path.isdir(target_dir)):
      f = zipfile.ZipFile(os.path.join(target_dir, zip_file_name), 'w', zipfile.ZIP_DEFLATED)
      logging.info('new zip file ' + zip_file_name + ' in directory ' + target_dir)
    else:
      raise Exception(target_dir + ' does not exist or is not a directory')
    if(len(source_dirs) == 0):
      logging.info('no source directories defined')
    else:
      #add logs to zip
      for source_dir in source_dirs:
        if(os.path.isdir(source_dir)):
          logging.info('find logs in ' + source_dir)
          for parent, dirnames, filenames in os.walk(source_dir):
            for filename in filenames:
              full_filename = os.path.join(parent, filename)
              logging.info(full_filename + ' is zipped.')
              f.write(full_filename,filename)
        else:
          logging.info(source_dir + ' does not exist or is not a directory')
          continue
  except Exception as e:
    logging.info('Exception during collecting log files')
    logging.error(e)
  finally:
    if f != None:
      f.close()

#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------
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
  #Read the gluster settings
  useGluster = "false"
  try:
    useGluster = registryParser.getSetting('MiddlewareStorage','enable_gluster')
  except:
    useGluster = "false"

  #Read Docs Multiactive settings
  bDocsMultiActive = registryParser.getSetting('Docs','is_docs_multiactive')

  try:
    adminUsername = registryParser.getSetting('MiddlewareWebSphere', 'admin_username')
    adminPassword = registryParser.getSetting('MiddlewareWebSphere', 'admin_password')
    # MiddlewareNFS is removed from DPUI tab, this is a quick workaround for fix
    # NAS Mount Point like  nfs1.lotuslivedaily.swg.usma.ibm.com:/smartcloud/acViewer
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

    # shared local storage for Verse cache
    viewer_shared_dir = "/disks/shared"
    if registryParser.getSetting('MiddlewareZooKeeper','data_center_type') == 'softlayer':
      zooKeeperClient.updateActivationStatus('Mount to local disk start...')
      set_file_permission("./createPartition.sh", 700);
      setup_DataDisk()
      zooKeeperClient.updateActivationStatus('Mount to local disk complete...')
    else:
      viewer_shared_dir = "/shared"
      if not os.path.exists(viewer_shared_dir):
        os.makedirs(viewer_shared_dir, 0o700)
    set_folder_permissions(serviceUser, serviceUser, viewer_shared_dir, 700)

    # shared NFS storage for Viewer & Conversion
    if useGluster == "true":
      gluster_nfs_config(nfs_uid, nfs_gid)
    else:
      nfs_config(nfs_uid, nfs_gid)

    viewer_url = 'http://localhost:9080/viewer'
    gen_conversion_cfg_property(adminUsername, adminPassword, viewer_shared_dir, str(sym_instance_num), viewer_url)

    conversion_url = 'http://localhost:9081/conversion'
    docs_be_url = ''.join(['http://',zooKeeperClient.getBackEndVIP('/topology/docs/vip'),':9080/docs'])
    gen_viewer_cfg_property(viewer_shared_dir, conversion_url, docs_be_url)

    # 1. Mount NAS
    # 2. Create and start WAS AppSrv profile service
    set_was_java8()
    zooKeeperClient.updateActivationStatus('Creating WebSphere Application Server profile1')
    createProfile(adminUsername, adminPassword, WAS_SERVER_VIEWER_NAME, WAS_PROFILE_VIEWER_NAME, WAS_NODE_VIEWER_NAME, wasDir)
    zooKeeperClient.updateActivationStatus('Creating WebSphere Application Server profile2')
    createProfile(adminUsername, adminPassword, WAS_SERVER_CONV_NAME, WAS_PROFILE_CONV_NAME, WAS_NODE_CONV_NAME, wasDir)
    updateProfilePermissions(wasDir)

    startAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_SERVER_VIEWER_NAME, WAS_PROFILE_VIEWER_NAME, WAS_NODE_VIEWER_NAME)
    #Need to set default AppSrv2 profile before starting it
    setDefaultAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_PROFILE_CONV_NAME)
    startAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_SERVER_CONV_NAME, WAS_PROFILE_CONV_NAME, WAS_NODE_CONV_NAME)

    zooKeeperClient.updateActivationStatus('Prepare non-root environment...')
    nonroot_config()
    # Install IBM ViewerNext package starts
    logging.info('Starting IBM ViewerNext package installation')
    zooKeeperClient.updateActivationStatus('IBM ViewerNext installation started...')
    # Install Conversion
    setDefaultAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_PROFILE_CONV_NAME)
    os.chdir(CONV_INSTALL_PATH)

    zooKeeperClient.updateActivationStatus('IBM Conversion installation started...')
    preinstallConversion()

    # NO UNINSTALL REQUIRED FOR Cloud factory installation
    logging.info("Start Conversion installation...")
    launchInstallConversion(adminUsername, adminPassword, viewer_shared_dir)
    logging.info('IBM Conversion installation completed')
    zooKeeperClient.updateActivationStatus('IBM Conversion installation completed')

    disable_conversion_tls_algorithms(adminUsername, adminPassword)
    # Install Viewer
    setDefaultAppSrvProfile(wasDir, adminUsername, adminPassword, WAS_PROFILE_VIEWER_NAME)
    os.chdir(VIEWER_INSTALL_PATH)

    zooKeeperClient.updateActivationStatus('IBM Viewer installation started...')
    preinstallViewer(adminUsername, adminPassword)
    logging.info("Start Viewer installation...")
    installViewer(adminUsername, adminPassword, viewer_shared_dir)
    #copy_vn_flip_script()
    # Does not need to update viewer-config.json for nfs mount via original method setup_ac_nfs_shares_viewer()
    logging.info('IBM Viewer installation completed')
    zooKeeperClient.updateActivationStatus('IBM Viewer installation completed')
    disable_viewer_tls_algorithms()

    stopServerByNameAndProfile(WAS_SERVER_CONV_NAME, WAS_PROFILE_CONV_NAME, adminUsername, adminPassword)
    stopServerByNameAndProfile(WAS_SERVER_VIEWER_NAME, WAS_PROFILE_VIEWER_NAME, adminUsername, adminPassword)

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
    target_dir = '/opt/ll/logs/SC-ViewerNext-Config'
    conversion_log_dir = CONVERSION_INSTALL_ROOT + '/logs'
    viewer_log_dir = VIEWER_INSTALL_ROOT + '/logs'
    viewer_was_log_dir = WAS_INSTALL_ROOT + '/profiles/AppSrv1/logs/' + WAS_SERVER_VIEWER_NAME
    conv_was_log_dir = WAS_INSTALL_ROOT + '/profiles/AppSrv2/logs/' + WAS_SERVER_CONV_NAME
    collect_zip_log(zip_file_name, target_dir, conversion_log_dir, conv_was_log_dir, viewer_was_log_dir, VIEWER_CFG_FILE, CONVERSION_CFG_FILE, viewer_log_dir)
