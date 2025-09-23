#!/usr/bin/python

# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

import os, subprocess, time, re, sys, base64, socket, fileinput, shutil, threading, zipfile, logging
sys.path.append('/opt/ll/lib/registry')
sys.path.append('/opt/ll/lib/apache/zookeeper')
sys.path.append('/opt/ll/lib/nfs')
sys.path.append('/opt/ll/lib/gluster')
from registryLib import *
from zooKeeperLib import *
try:
  import json
except ImportError: 
  import simplejson as json
import mountLib
try:
  import glusterMount
except ImportError:
  pass
os.umask(00022)   
#---------------------------------------------------------------------------------------------
# Check if the data volume is accessable
#---------------------------------------------------------------------------------------------
def mkDirOnNFS(webresource):
  if not os.path.exists(webresource):
    os.mkdir(webresource)
  if not os.path.exists(webresource):
    expstr = "Error happens when creating viewer web resource %s " %(webresource) + ":, please check if mount point exists."
    raise Exception(expstr)
  print 'Shared web resource directory for Viewer %s has been created.' % (webresource)
#---------------------------------------------------------------------------------------------
# unzip a zipped file
#---------------------------------------------------------------------------------------------   
def unzip_file(zipfilename, unziptodir):
  if not os.path.exists(unziptodir):
    os.mkdir(unziptodir)
    os.system("chmod 777 -R %s" % unziptodir)
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
# Update zookeeper node
#---------------------------------------------------------------------------------------------
def updateZookeeperNode():	
  print "The online version is %s" % ONLINE_VERSION
  if (ONLINE_VERSION in [None,'']):
    logging.error("Severe error - the version to be onlined is empty.")
    return
  offline = None
  try:
    baseTN = registryParser.getBaseTopologyName()
    side = registryParser.getTopologyName()
    versionPath = '/%s/data/viewer/version/%s' %(baseTN, side)
    sideValue = zooKeeperClient.getData(versionPath)
    if sideValue in [None,'','null']:
      print "Create node %s on zookeeper and its value is %s" % (versionPath, ONLINE_VERSION)
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
        if offlineFlag:
          offline = sideValue
        else:
          logging.info("The obsolete version %s is still using by anther side." % sideValue)               	  	
      else:
        print "Flip failover case - no new version is online."
        logging.info("Flip failover case - no new version is online.")

    if offline:
      logging.info("The offline version is %s" % offline)
      global OFFILE_VERSION
      OFFILE_VERSION = offline
  except Exception,e:
    logging.error(e)
    raise 
#---------------------------------------------------------------------------------------------
# Remove obsolete web resources from NFS server
#---------------------------------------------------------------------------------------------
def removeOfflineVersion(version):
  remove_info = 'Removing %s from webresource directory. It will take a few minutes...' % version
  print remove_info
  logging.info(remove_info)
  offline = r'%s/%s' % (SHARED_DIR,version)
  if os.path.exists(offline):
    shutil.rmtree(offline)
  print 'Removed successfully.'
#---------------------------------------------------------------------------------------------
# Remove obsolete web resources from NFS server for patch
#---------------------------------------------------------------------------------------------
def houseKeeping():
  count = 0	
  for f in os.listdir(SHARED_DIR):
    sourceF = os.path.join(SHARED_DIR, f)
    if os.path.isdir(sourceF):
      version = os.path.basename(sourceF)
      version_info = 'The version stored on NFS server is %s' % version
      print version_info
      logging.info(version_info)
      if not isVersionOnline(version):
        removeOfflineVersion(version)
        count = count + 1
        hk_info = 'HK:The version %s stored on NFS server has been removed.' % version
        print hk_info
        logging.info(hk_info)    
  info = 'HouseKeeping successfully and removed %s version(s)!' % count
  print info
  logging.info(info)
#---------------------------------------------------------------------------------------------
# To know whether the version is used or not
#---------------------------------------------------------------------------------------------
def isVersionOnline(version):
  entering = 'Try to know whether the version %s needs housekeeping...' % version
  print entering
  logging.info(entering)
  try:
    baseTN = registryParser.getBaseTopologyName()
    children = zooKeeperClient.getChildNodes('/%s/data/viewer/version' %(baseTN))
    if children:
      for node in children:
        if (node == ''):
          continue
        data = zooKeeperClient.getData('/%s/data/viewer/version/%s' %(baseTN, node))
        data_info = 'The online version for side %s registered in zookeeper server is %s' % (node, data)
        print data_info
        logging.info(data_info)
        if(data == version):
          return True
    return False
  except Exception,e:
    logging.error(e)  	
    print 'Ignore the error. Do not do housekeeping for the version %s because of unknown exception happened.' % version
    return True
#---------------------------------------------------------------------------------------------
# Is the current ViewerNext server in charge of the Multactive service?
#---------------------------------------------------------------------------------------------
def isMultiactiveOwner():
  try:
    hostname = zooKeeperClient.getHostname('/topology/viewernext/servers/1')
    if(hostname in [None, '', 'null']):
      logging.error("Could not get multiactive owner hostname from zookeeper, pls check the installation script.")
      return False
    owner_short_hostname = hostname.split(".")[0]
    local_short_hostname = socket.gethostname().split(".")[0]
    logging.info("Multiactive service for ViewerNext is [owner: %s, local: %s]" % (owner_short_hostname, local_short_hostname))
    if owner_short_hostname != local_short_hostname:
      logging.info("Skip to maintain Multiactive service for IBM ViewerNext Server [hostname: %s]" % (local_short_hostname))
      return False
  except Exception,e:
    logging.error(e)
    return False
  return True
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
# mount nfs for Conversion application
#---------------------------------------------------------------------------------------------
def mount_conversion(nfs_uid, nfs_gid, nasHostname, nasMountPoint):
  if not os.path.exists('/opt/ll/runtime'):
    os.makedirs('/opt/ll/runtime',0755)
   
  mountLib.setupFSTab('%s:%s' % (nasHostname,nasMountPoint), CONV_LOCAL_MOUNT_POINT)
  update_fstab_for_docs_share()
  mountLib.unmountFilesystem(CONV_LOCAL_MOUNT_POINT)
  mountLib.mountFilesystem(CONV_LOCAL_MOUNT_POINT)
  mountLib.linkFilesystem('/opt/ll/runtime/data')
  os.system('chmod 755 /opt/ll/runtime')
  set_folder_permissions(nfs_uid,nfs_gid,'/opt/ll/runtime/data',700)
#---------------------------------------------------------------------------------------------
# mount nfs for Viewer application
#---------------------------------------------------------------------------------------------
def mount_viewer(nasHostname, nasMountPoint):
  mountLib.setupFSTab('%s:%s' % (nasHostname,nasMountPoint), VIEWER_LOCAL_MOUNT_POINT)
  mountLib.unmountFilesystem(VIEWER_LOCAL_MOUNT_POINT)
  mountLib.mountFilesystem(VIEWER_LOCAL_MOUNT_POINT)

#---------------------------------------------------------------------------------------------
# Update mount option with acdirmin because viewer query snapshot readable.tag have at least 30s delay due to the default value of acdirmin
#---------------------------------------------------------------------------------------------
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
  logging.info('Config Gluster NFS to mount NFS server for Viewer and Conversion')
  vip = registryParser.getSetting('MiddlewareStorage','gluster_vip')
  nasHostname = vip.split("/")[0]
  if zooKeeperClient.isActiveSide():
    nasDocsMountPoint = "/docs/data"
    nasViewerMountPoint = "/acViewer"
  else:
    nasDocsMountPoint = "/docs_test/data"
    nasViewerMountPoint = "/acViewer_test"
  # mount conversion
  mount_conversion(nfs_uid, nfs_gid, nasHostname, nasDocsMountPoint)    
  # mount viewer
  mount_viewer(nasHostname,nasViewerMountPoint)
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
    (nasHostname, nasDocsMountPoint) = docs_nas_share.strip().split(":")
    nasDocsMountPoint = nasDocsMountPoint + "/data"
  else:
    (nasHostname, nasDocsMountPoint) = get_nfs_share(zooKeeperClient, "docs");
    nasDocsMountPoint = nasDocsMountPoint + "/data" 
  # mount conversion
  mount_conversion(nfs_uid, nfs_gid, nasHostname, nasDocsMountPoint)
  # get nfs config for Viewer
  if zooKeeperClient.isActiveSide():
    nas_viewer_share = registryParser.getSetting('AC', 'nas_viewer_share')
  else:
    nas_viewer_share = registryParser.getSetting('AC', 'nas_viewer_test_share')
  if nas_viewer_share:
    (nasViewerHostname, nasViewerMountPoint) = nas_viewer_share.strip().split(":")
  else:
    if nasHostname: # save the time of get nasHost from ZK if it is done from Docs side above
    	nasViewerMountPoint = '/nfsexports/smartcloud/acViewer'
    	nasViewerHostname = nasHostname
    else:
      (nasViewerHostname, nasViewerMountPoint) = get_nfs_share(zooKeeperClient, "acViewer");
  # mount viewer
  mount_viewer(nasViewerHostname,nasViewerMountPoint) 
#---------------------------------------------------------------------------------------------
# get nfs share
#---------------------------------------------------------------------------------------------
def get_nfs_share(zooKeeperClient, sharename):
  nasHostname = zooKeeperClient.getFrontEndInterface('/topology/nas/servers/1')
  zooKeeperClient.waitForServerActivation('/topology/nas/servers/1')
  nasMountPoint = '/nfsexports/smartcloud/%s' % (sharename)
  return (nasHostname, nasMountPoint)
#---------------------------------------------------------------------------------------------
# zip all files based upon static web resource
#---------------------------------------------------------------------------------------------  
def handleWebResource():
  # create the given workspace for multi-active ViewerNext on acViewer NFS server	
  mkDirOnNFS(SHARED_DIR)	
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
      logging.info('The build version to be online is %s' % ONLINE_VERSION)
      versionOnNfs = os.path.join(SHARED_DIR, ONLINE_VERSION)
      if os.path.exists(versionOnNfs):
      	logging.info('The patched version was already available on NFS server! please check manually.')
      else:
        logging.info('Start moving web resources to NFS server...')
        shutil.move(sourceF, SHARED_DIR)
        logging.info('Moved successfully.')
      break
  logging.info('Prepared successfully.')
#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------
#Create registry and ZooKeeper objects
registryParser = RegistryParser()
zooKeeperClient = ZooKeeperClient()
#Set variables
VIEWER_LOCAL_MOUNT_POINT = "/mnt/nas/viewer"
CONV_LOCAL_MOUNT_POINT = "/mnt/nas/conversion"
VIEWER_EAR_FILE = "/opt/ll/apps/ViewerNext/rpm/Viewer/com.ibm.concord.viewer.ear.ear"
SHARED_DIR = r"%s/webresource" % (VIEWER_LOCAL_MOUNT_POINT)
VIEWER_WAR_FILE = "/opt/ll/apps/ViewerNext/rpm/viewerTmp/com.ibm.concord.viewer.war.war"
RESOURCE_ROOT = "/opt/ll/apps/ViewerNext/rpm/viewerTmp/warTmp/static"
VIEWER_TMP = "/opt/ll/apps/ViewerNext/rpm/viewerTmp"
VIEWER_WAR_TMP = "/opt/ll/apps/ViewerNext/rpm/viewerTmp/warTmp"
ONLINE_VERSION = None
OFFILE_VERSION = None
#Read the gluster settings
useGluster = "false"
try:
  useGluster = registryParser.getSetting('MiddlewareStorage','enable_gluster')
except:
  useGluster = "false"
try:
  websphere_ids = registryParser.getSetting('MiddlewareUsers', 'websphere_ids')
  if websphere_ids:
    (nfs_uid, nfs_gid) = websphere_ids.strip().split(':')
  else:
    raise Exception("MiddlewareUsers Tab in mis-configured, please check and redeploy.")  
  if useGluster == "true":
      gluster_nfs_config(nfs_uid, nfs_gid)
  else:
    nfs_config(nfs_uid, nfs_gid)
  if isMultiactiveOwner():
    # prepared all web resources from local selected ViewerNext server
    handleWebResource()
    # update the zookeeper node value in time
    updateZookeeperNode()
    # remove offline web resource
    if OFFILE_VERSION:
      removeOfflineVersion(OFFILE_VERSION)
    houseKeeping()
except Exception,e:
  print e
  logging.error(e)
  zooKeeperClient.updateActivationStatus('ViewerNext siteflip function failed!')
  sys.exit(1)
