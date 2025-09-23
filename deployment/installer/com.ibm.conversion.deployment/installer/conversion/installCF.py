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

# Unique Identifier = L-MSCR-7BCD3
import re, socket, sys, os, subprocess, shutil, stat, logging, fileinput,zipfile
import time
import platform
from xml.dom import minidom
sys.path.append('/LotusLive/Lib/') #zookeeper and registryLib
sys.path.append('/LotusLive/Lib/nfs')
from registryLib_win import *
from zooKeeperLib_win import *
import mountLib
from util import serverLib_win as serverLib

# HARDCODE PARTS for Cloud factory Windows OVF templates
SETRIGHTS_EXE_FILE = "c:/installer/setrights.exe"
CFG_FILE = "c:/installer/cfg.properties"
CFG_SAMPLE_FILE = "c:/installer/cfg.properties.sample"
CONFIG_JSON = "C:/config/conversion-config.json"
OVF_Config_XML = 'c:/LotusLive/Env/ovf-env.xml'
SCH_TASK_SCRIPT = "C:/config/sym_monitor_win/start_task.bat"
WAS_INSTALL_ROOT = r'/Program Files/IBM/WebSphere/AppServer'
CONVERSION_INSTALL_ROOT = "%s/IBMConversion" #Driver disk name to be replaced by DPUI settings
WAS_SOAP_PORT = "8880"
WAS_SERVER_NAME = "server1"
WAS_NODE_NAME = "ocs_app_node_" + socket.gethostname().split(".")[0]
ZK_CONVERSION_PATH = '/topology/docs_cr/servers'
NAS_ROOT_DIR = "" #A HARDCODE system path in Cloud Factory NFS Server for NFS4, but won't be necessary for NFS3
NAS_DOCS_SUB_DIR = "/docs"
NAS_DOCS_SUB_DATA_DIR = "/data"
NAS_VIEWER_SUB_DATA_DIR = "/ac/viewer"
WIN_HEAP_TYPE = "REG_EXPAND_SZ"
WINDOWS_HEAP_SIZE = "4096"
WAS_SERVICE_SCRIPT = "c:/installer/util/runWebSphereAs.bat"
WIN_PATCHS = [
  "C:/installer/Windows6.1-KB2761774-x64.msu"
]


#---------------------------------------------------------------------------------------------
# Usage statement
#---------------------------------------------------------------------------------------------
def usage():

   print(('Incorrect %s usage for\n' % (sys.argv[0])))
   print('  Description:  Use this script to configure IBM Conversion \n')
   print(('  Usage: %s\n' % (sys.argv[0])))

   sys.exit(1)

'''
def getOSAdminInfo():
   env = minidom.parse(OVF_Config_XML)
   properties = {}
   for property in env.getElementsByTagName('Property'):
      properties[property.getAttribute('oe:key')] = property.getAttribute('oe:value')
   admin_id = properties['ConfigPWD_ROOT.username.1'].strip()
   admin_pw = properties['ConfigPWD_ROOT.password.1'].strip()
   if admin_id and admin_pw:
      return (str(admin_id), str(admin_pw))
   else:
      print 'Error when fetching Windows 2008 Administrator username and password'
      raise
'''

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

#---------------------------------------------------------------------------------------------
# Create the WAS AppSrv profile
#---------------------------------------------------------------------------------------------
def createAndStartAppSrvProfile(wasDir, adminUsername, adminPassword):
#def createAndStartAppSrvProfile(osUserName, osUserPassword, wasDir, adminUsername, adminPassword):

   try:
      serverLib.createProfile(adminUsername,adminPassword,'server1','AppSrv01',wasDir)
      #serverLib.createServiceAndStartWithOSUser(osUserName, osUserPassword, adminUsername, adminPassword, 'was.server1', 'server1', 'AppSrv01', wasDir)
      serverLib.createServiceAndStart(adminUsername, adminPassword, 'was.server1', 'server1', 'AppSrv01', wasDir)
   except:
      print('Error:  Unable to create AppSvr profile')
      raise
   print('AppSvr is running...continuing install')

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

def launch_install(adminUsername, adminPassword):
    'After all prepartion, launch the standard installation'

    myCommand = ' '.join([
        'python conversion/install.py',
        "-build",
        "C:\\",
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


def gen_cfg_property(admin, password, nasHostname, nasMountPoint, docs_shared_dir, nasHostname4Viewer, nasMountPoint4Viewer, viewer_shared_dir, symphony_number, viewer_url):
  cfg = open(CFG_SAMPLE_FILE)
  from configparser import SafeConfigParser
  cp = SafeConfigParser()
  cp.readfp(cfg)
  rdir = CONVERSION_INSTALL_ROOT
  cp.set("Conversion", "conversion_install_root", rdir )
  #Docs server shared storage.
  cp.set("Conversion", "docs_shared_storage_remote_server", nasHostname)
  cp.set("Conversion", "docs_shared_storage_local_path", docs_shared_dir)
  cp.set("Conversion", "docs_shared_storage_remote_path", nasMountPoint)
  #Viewer server shared storage.
  cp.set("Conversion", "viewer_shared_storage_remote_server", nasHostname4Viewer)
  cp.set("Conversion", "viewer_shared_storage_local_path", viewer_shared_dir)
  cp.set("Conversion", "viewer_shared_storage_remote_path", nasMountPoint4Viewer)
  cp.set("Conversion", "was_install_root", WAS_INSTALL_ROOT + "/profiles/AppSrv01")
  cp.set("Conversion", "was_soap_port", WAS_SOAP_PORT)
  cp.set("Conversion", "scope", "server")
  cp.set("Conversion", "scope_name", WAS_SERVER_NAME)
  cp.set("Conversion", "node_name", WAS_NODE_NAME)
  cp.set("Conversion", "sym_count", symphony_number)
  cp.set("Conversion", "sym_start_port", "8100")
  cp.set("Conversion", "software_mode",'sc')
  cp.set("Conversion", "viewer_url", viewer_url)

  new_cfg = open(CFG_FILE, "w")
  cp.write(new_cfg)
  new_cfg.close()
  cfg.close()
  print("Successfully generated the cfg.properties")

def modify_config_json(token, stellent_number):
  json_file = CONFIG_JSON
  token_pattern = r"\s*\"token\"\s*:\s*\"(.+)\" *,?"
  pool_size_pattern = r"\s*\"poolSize\"\s*:\s*(\d+)\s*,?"
  for line in fileinput.input(json_file, inplace=1):
    if re.match(token_pattern, line):
       token_old = re.match(token_pattern, line).group(1)
       line = re.sub(token_old, token, line)
    elif re.match(pool_size_pattern, line):
       pool_size_old = re.match(pool_size_pattern, line).group(1)
       line = re.sub(pool_size_old, stellent_number, line)
    sys.stdout.write(line)
  print("Successfully modify the config file")

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
    print(("The orginal WINDOWS_HEAP_SIZE is %s" % (old_non_inter_value)))
    reg_windows_value = re.sub(pre_shared_sec + old_non_inter_value, pre_shared_sec + WINDOWS_HEAP_SIZE, reg_windows_value)
    print(("New SharedSection: %s" % (reg_windows_value)))
  else:
    print("ERROR: Desktop heap on Windows is not tuned due to original wrong parameter")
    print(("The value is %s" % (reg_windows_value)))

  ADD_REG = "REG ADD \"HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\SubSystems\" /v Windows /t %s /d \"%s\" /f" % (WIN_HEAP_TYPE, reg_windows_value)
  #print ADD_REG
  p = subprocess.Popen(ADD_REG, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate()[0]
  #print output
  retval = p.returncode
  if retval:
    raise Exception('RC %s while executing command "%s". ' % (retval,ADD_REG))

'''
def set_os_user_rights_assigments(username):
  CMD_TCBRRIVILEGE = SETRIGHTS_EXE_FILE + " " + username + " +r SeTcbPrivilege"
  p = subprocess.Popen(CMD_TCBRRIVILEGE, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate()[0]
  #print output
  retval = p.returncode
  if retval:
    print output
    raise Exception('RC %s while executing command "%s". ' % (retval, CMD_TCBRRIVILEGE))
  print 'Changing privilege +r SeTcbPrivilege for account %s successful.' % username

  CMD_SERVICELOGONRIGHT = SETRIGHTS_EXE_FILE + " " + username + " +r SeServiceLogonRight"
  p = subprocess.Popen(CMD_SERVICELOGONRIGHT, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate()[0]
  #print output
  retval = p.returncode
  if retval:
    print output
    raise Exception('RC %s while executing command "%s". ' % (retval, CMD_SERVICELOGONRIGHT))
  print 'Changing privilege +r SeServiceLogonRight for account %s successful.' % username

'''

def get_nfs_share(zooKeeperClient, sharename):
  nasHostname = zooKeeperClient.getFrontEndInterface('/topology/nas/servers/1')
  zooKeeperClient.waitForServerActivation('/topology/nas/servers/1')
  nasMountPoint = '/nfsexports/smartcloud/%s' % (sharename)

  return (nasHostname, nasMountPoint)

def run_cmd(cmd_list,success_code = None):

  for cmd in cmd_list:
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    output = p.communicate()[0]
    print(output)
    retval = p.returncode
    if retval and retval != success_code:
      raise Exception('RC %s while executing command "%s". ' % (retval,cmd))

  return output

#---------------------------------------------------------------------------------------------
#  The function is a fix. If WAS service is launched as  Windows admin/istrator and Operation team
#  changes the original password of administrator, the WAS service cannot be stared when OS reboot,
#  so we created an non-admin user to launch WAS service, and set his password never expires.
#---------------------------------------------------------------------------------------------
def set_was_serive_user(was_install_root,non_admin_name,non_admin_password):
  script_path = os.path.abspath(WAS_SERVICE_SCRIPT)
  cmd_list = [
      '%s "%s" %s %s' % (script_path,was_install_root,non_admin_name,non_admin_password),
      'WMIC USERACCOUNT WHERE Name="%s" SET PasswordExpires=FALSE' % non_admin_name,
      '%s %s  +r SeTcbPrivilege' % (SETRIGHTS_EXE_FILE,non_admin_name),
      '%s %s  +r SeServiceLogonRight' % (SETRIGHTS_EXE_FILE,non_admin_name),
      ]

  run_cmd(cmd_list)
#---------------------------------------------------------------------------------------------
#  The function for applying following Windows OS patchs (registered in WIN_PATCHS):
#  KB2761774;
#---------------------------------------------------------------------------------------------
def apply_windows_patchs():
  cmd_list = []
  for patch in WIN_PATCHS:
    cmd_list.append("wusa.exe %s /quiet /norestart" % patch)
  run_cmd(cmd_list,3010)
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
#collect logs from source_dirs(one directory or more), build a zip file named  zip_file_name in target_dir
#---------------------------------------------------------------------------------------------
def collect_zip_log(zip_file_name,target_dir,*source_dirs):
  # new zip file
  f = None
  try:
    if(os.path.isdir(target_dir)):
      f = zipfile.ZipFile(os.path.join(target_dir,zip_file_name),'w',zipfile.ZIP_DEFLATED)
      print(('new zip file %s in directory %s' % (zip_file_name, target_dir)))
    else:
      raise Exception(target_dir + ' does not exist or is not a directory')
    if(len(source_dirs) == 0):
      print('no source directories defined')
    else:
      #add logs to zip
      for source_dir in source_dirs:
        if(os.path.isdir(source_dir)):
          print(('find logs in %s' % (source_dir)))
          for parent,dirnames,filenames in os.walk(source_dir):
            for filename in filenames:
              full_filename = os.path.join(parent,filename)
              print(('%s is zipped.' % (full_filename)))
              f.write(full_filename,filename)
        else:
          print(('%s does not exist or is not a directory' % (source_dir)))
          continue
  except Exception as e:
    print('Exception during collecting log files')
    print(e)
  finally:
    if f != None:
      f.close()
#---------------------------------------------------------------------------------------------
#set java8 runtime environment for WAS
#---------------------------------------------------------------------------------------------
def set_was_java8():
  manage_sdk_path = os.path.join(WAS_INSTALL_ROOT,"bin/managesdk.bat")
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
# Main
#---------------------------------------------------------------------------------------------
if __name__ == "__main__":
    wasDir = WAS_INSTALL_ROOT
    zkPath = ZK_CONVERSION_PATH

    #There is a PMR about pdjrtecfg not working when the WAS jre is added to the classpath. An external jre must be used in the meantime.
    #https://www-304.ibm.com/support/entdocview.wss?uid=swg1IV00477
    #path = os.getenv('PATH')
    #if not path:
    #   print 'Error: Unable to add external Java to PATH variable.'
    #   raise Exception('Unable to retrieve current PATH variable')
    #os.putenv('PATH', '/Program Files/IBM/Java60/jre/bin:%s' % (path))

    #Register IP information with ZooKeeper
    zooKeeperClient = ZooKeeperClient()
    zooKeeperClient.publishRegistrySettings('DocsConversion')
    registerWithZookeeper(zooKeeperClient,zkPath)
    print("Successfully registered to zooKeeper")

    #Read the registry settings
    registryParser = RegistryParser()

    drive_disk = registryParser.getSetting('DocsConversion', 'docscr_drive_disk')
    if drive_disk:
      CONVERSION_INSTALL_ROOT = CONVERSION_INSTALL_ROOT % (drive_disk)
    else:
      CONVERSION_INSTALL_ROOT = CONVERSION_INSTALL_ROOT % ("D:")
    try:
      adminUsername = registryParser.getSetting('MiddlewareWebSphere', 'admin_username')
      adminPassword = registryParser.getSetting('MiddlewareWebSphere', 'admin_password')
      # MiddlewareNFS is removed from DPUI tab, this is a quick workaround for fix
      nasHostname = None #registryParser.getSetting('MiddlewareNFS', 'nas_server_hostname')
      nasMountPoint = None #registryParser.getSetting('MiddlewareNFS', 'nas_server_mount_point')
      #NAS Mount Point like  nfs1.lotuslivedaily.swg.usma.ibm.com:/smartcloud/acViewer

      # non_admin_name mean non Windows administrator, adminUserName means WAS admin user name
      non_admin_name = adminUsername
      non_admin_password = adminPassword

      #Read Docs Multiactive settings
      bDocsMultiActive = registryParser.getSetting('Docs','is_docs_multiactive')

      if zooKeeperClient.isActiveSide():
        docs_nas_share = registryParser.getSetting('Docs', 'docs_nas_share')
      else:
        docs_nas_share = registryParser.getSetting('Docs', 'docs_nas_share_test')
      #(nasHostname, nasMountPoint) = get_nfs_share(docs_nas_share)

      sym_instance_num = registryParser.getSetting('DocsConversion', 'symphony_instance_number')
      ste_instance_num = registryParser.getSetting('DocsConversion', 'stellent_instance_number')
      #ooxmlconverter_instance_num = registryParser.getSetting('DocsConversion', 'ooxmlconverter_instance_number')
      #nfs_uid = registryParser.getSetting('DocsConversion', 'nfs_dir_uid')
      #nfs_gid = registryParser.getSetting('DocsConversion', 'nfs_dir_gid')
      websphere_ids = registryParser.getSetting('MiddlewareUsers', 'websphere_ids')
      if websphere_ids:
        (nfs_uid, nfs_gid) = websphere_ids.strip().split(':')
      else:
        raise Exception("MiddlewareUsers Tab in mis-configured, please check and redeploy.")

      # 0. Get pre-config file ready, JSON and cfg.properties
      token = zooKeeperClient.getSettingByComponent('BSSCore', 's2s_token')
      if token:
        #modify_config_json(token.strip(), str(ste_instance_num), str(ooxmlconverter_instance_num )) # zk bug: must remove trailing \r get from ZK client
        modify_config_json(token.strip(), str(ste_instance_num)) # zk bug: must remove trailing \r get from ZK client
      #os_userid, os_password = getOSAdminInfo()
      updateSymphonyMonitorTask(non_admin_name, non_admin_password)

      #set_os_user_rights_assigments(os_userid)

      if docs_nas_share:
        docs_nas_share = docs_nas_share.strip()
        (nasHostname, nasMountPoint) = docs_nas_share.split(":")
        nasMountPoint = nasMountPoint + "/data"
        #docs_shared_dir = "".join(["//", docs_nas_share.replace(":", ""), "/data"])
        #docs_mount_dir = docs_nas_share
      else:
        (nasHostname, nasMountPoint) = get_nfs_share(zooKeeperClient, "docs");
        nasMountPoint = nasMountPoint + "/data"
        #docs_shared_dir = "//%s%s%s%s" % (nasHostname, NAS_ROOT_DIR, nasMountPoint, "/data")
        #docs_mount_dir = "%s:%s%s" % (nasHostname, NAS_ROOT_DIR, nasMountPoint)
      docs_shared_dir = "w:"

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
        else:
          (nasHostname4Viewer, nasMountPoint4Viewer) = get_nfs_share(zooKeeperClient, "acViewer");
        #viewer_shared_dir = "//%s%s%s" % (nasHostname, NAS_ROOT_DIR, nasMountPoint)
      viewer_shared_dir = "v:"

      viewer_url = ''.join(['http://',zooKeeperClient.getBackEndVIP('/topology/viewernext/vip'),':9080/viewer'])

      gen_cfg_property(adminUsername, adminPassword, nasHostname, nasMountPoint, docs_shared_dir, nasHostname4Viewer, nasMountPoint4Viewer, viewer_shared_dir, str(sym_instance_num), viewer_url)

      # 1. Mount NAS
      # need to depends on Docs now to make sure the NFS directory permission ALL SET correctly
      #print "Waiting for HCL Docs server ready"
      #zooKeeperClient.waitForServerActivation('/topology/docs/servers/1')
      #zooKeeperClient.updateActivationStatus('Mounting to remote NAS device')
      # TODO interface.xml for uid and gid
      mountLib.setup_nfs_client(str(nfs_uid), str(nfs_gid))
      #mountLib.mountFilesystem(str(nfs_uid), str(nfs_gid), docs_mount_dir, "Z:") #Docs mount point is now managed by Docs server itself during app start and stop phrase.
      #mountLib.mountFilesystem(str(nfs_uid), str(nfs_gid), viewerMountPoint, "Q:")#acViewer
      zooKeeperClient.updateActivationStatus('Mounting to remote NAS device completed')

      # setup nfs parameters
      setup_nfs_parameters()
      zooKeeperClient.updateActivationStatus('setup nfs parameters completed')
      # 2. Create and start WAS AppSrv profile service
      zooKeeperClient.updateActivationStatus('Creating WebSphere Application Server profile')
      set_was_java8()
      createAndStartAppSrvProfile(wasDir, adminUsername, adminPassword)
      #createAndStartAppSrvProfile(os_userid, os_password, wasDir, adminUsername, adminPassword)


      # 2.1
      create_os_user(non_admin_name,non_admin_password)
      set_user_logon_batchjob(non_admin_name)

      # Install IBM Conversion package starts
      print('Starting IBM Conversion package installation')
      zooKeeperClient.updateActivationStatus('IBM Conversion installation started')

      # NO UNINSTALL REQUIRED FOR Cloud factory installation
      #logging.info("Validation successfully, creating uninstaller...")
      #_create_uninstaller()
      print("Start installation...")
      launch_install(non_admin_name,non_admin_password)
      print('IBM Conversion installation completed')
      zooKeeperClient.updateActivationStatus('IBM Conversion installation completed')

      # Change Windows desktop heap size
      original_heap_size = get_windows_heap_size()
      add_windows_heap_size(original_heap_size.strip()) # fix the %SystemRoot% preceeding spaces via strip()
      print("Successfully change the windows desktop heap size")
      # Set WAS Service launched as non-administrator user 'wasadmin'
      set_was_serive_user('C:\\' + WAS_INSTALL_ROOT,non_admin_name,non_admin_password)
      set_user_access_dir(CONVERSION_INSTALL_ROOT,non_admin_name)
      serverLib.stopServerByName(WAS_SERVER_NAME, adminUsername, adminPassword)
      time.sleep(15)
      serverLib.startWASService('was.server1')

      if mountLib.is_2008():
        apply_windows_patchs()

      # Activate the server in ZooKeeper
      activateServer(zooKeeperClient, zkPath)
      zooKeeperClient.updateActivationStatus('IBM Conversion server Activated via Zookeeper')
    except Exception as e:
      zooKeeperClient.updateActivationStatus('IBM Conversion installation failed','failed')
      print(("failed to execute the installCF.py " + e.message))
      sys.exit(1)
    finally:
      zip_file_name = 'docsconversion.zip'
      target_dir = 'c:/lotuslive/log'
      conversion_log_dir = CONVERSION_INSTALL_ROOT + '/logs'
      was_log_dir = WAS_INSTALL_ROOT + '/profiles/AppSrv01/logs/server1'
      collect_zip_log(zip_file_name,target_dir,conversion_log_dir,was_log_dir)
