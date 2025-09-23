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
sys.path.append('/LotusLive/Lib')
sys.path.append('/LotusLive/Lib/nfs')
sys.path.append('/LotusLive/Lib/gluster')
from registryLib_win import *
from zooKeeperLib_win import *
import mountLib

try:
  import json
except ImportError: 
  import simplejson as json


def executeCommand(command, obfuscate=None):
  log = 'Executing: '
  if obfuscate:
    log += command.replace(obfuscate, '***')
  else:
    log +=  command
  p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate()[0]
  if p.returncode:
    raise Exception('Error executing command: ' + output)
  print('Command successful.')
  
  return output
    
#---------------------------------------------------------------------------------------------
# Test a socket connection
#---------------------------------------------------------------------------------------------
def testSocket(ipAddress,port,zooKeeperClient):

  print('Testing socket connection %s:%s...' % (ipAddress,port))
  zooKeeperClient.updateActivationStatus('Testing connection to %s:%s' % (ipAddress,port))
  while(1):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
      s.connect((ipAddress, int(port)))
      zooKeeperClient.updateActivationStatus('Network path to %s:%s available' % (ipAddress,port))
      s.shutdown(2)
      return
    except:
      zooKeeperClient.updateActivationStatus('Network path to %s:%s unavailable.  Retrying in 30 seconds' % (ipAddress,port))

    time.sleep(30)

def modify_config_json(nasDocsHostname, nasDocsMountPoint, nasViewerHostname, nasViewerMountPoint):

  config_json_file = open( CONFIG_JSON)
  config_json =  json.load(config_json_file)
  config_json_file.close()

  config_json["shared-storages"]["docs"]["server"]   = nasDocsHostname
  config_json["shared-storages"]["docs"]["from"]     = nasDocsMountPoint
  config_json["shared-storages"]["viewer"]["server"] = nasViewerHostname
  config_json["shared-storages"]["viewer"]["from"]   = nasViewerMountPoint
  
  config_json_file = open(CONFIG_JSON, 'w')
  json.dump( config_json, config_json_file, indent=2 )
  config_json_file.close()

#---------------------------------------------------------------------------------------------
# Mount the file system
#---------------------------------------------------------------------------------------------
def mount(nasViewerHostname,nasViewerMountPoint):
  logging.info('Mount for multi-active viewernext %s:%s...' % (nasViewerHostname,nasViewerMountPoint))
  executeCommand("mount -o mtype=soft casesensitive=yes anon %s:%s %s" % (nasViewerHostname, nasViewerMountPoint, MOUNTDRIVE))

#---------------------------------------------------------------------------------------------
# Unmount the file system
#---------------------------------------------------------------------------------------------
def unmount():
  try:
    executeCommand("umount -f %s" % (MOUNTDRIVE))
  except:
    print('Error umounting share at %s, please investigate and try again' % (MOUNTDRIVE))
    
#---------------------------------------------------------------------------------------------
# Copy the whole ear package to nfs server
#---------------------------------------------------------------------------------------------
def copyResources():
  try:
    logging.info('Copying from %s to NFS server %s. It will take a few minutes...' % (RESOURCE_ROOT,SHARED_DIR))
    print('Copying from %s to NFS server %s. It will take a few minutes...' % (RESOURCE_ROOT,SHARED_DIR))
    if not os.path.exists(RESOURCE_ROOT):
      raise Exception('Viewer application package does not exist')
    copyFiles(RESOURCE_ROOT,SHARED_DIR)
    os.system("chmod 755 -R %s" % SHARED_DIR) 
    logging.info('Copied successfully.')
    print('Copied successfully.')
  except Exception as e:
    logging.error(e)
    print('Failed to copy ear package %s to NFS server %s' % (RESOURCE_ROOT,SHARED_DIR))
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
  except Exception as e:
      logging.error(e)	
  print('Shared web resource directory for Viewer %s. has been well created.' % (webresource))
  
#---------------------------------------------------------------------------------------------
# create a zipped file
#---------------------------------------------------------------------------------------------  
def zip_dir(dirname,zipfilename):
  filelist = []
  if os.path.isfile(dirname):
    filelist.append(dirname)
  else :
    for root, files in os.walk(dirname):
      for name in files:
        filelist.append(os.path.join(root, name))
         
  zf = zipfile.ZipFile(zipfilename, "w", zipfile.zlib.DEFLATED)
  for tar in filelist:
    arcname = tar[len(dirname):]
    zf.write(tar,arcname)
  zf.close()
 
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
# zip all files based upon static web resources 
#---------------------------------------------------------------------------------------------
def prepareWebResource():
  print('Preparing static web resources now. It will take a few minutes...')
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
  print('Prepared successfully.')	  	

#---------------------------------------------------------------------------------------------
# Update zookeeper node
#---------------------------------------------------------------------------------------------
def updateZookeeperNode():	
  print("The online version is %s" % ONLINE_VERSION)
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
      print("Create node %s on zookeeper and its value is %s" % (versionPath, ONLINE_VERSION))
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
        print("Flip failover case - no new version is online.")
        logging.info("Flip failover case - no new version is online.")

    if (offline is not None):
      logging.info("The offline version is %s" % offline)
      global OFFILE_VERSION
      OFFILE_VERSION = offline
  except Exception as e:
    logging.error(e)
    raise 
#---------------------------------------------------------------------------------------------
# Remove obsolete web resources from NFS server
#---------------------------------------------------------------------------------------------
def removeOfflineVersion(version):
  remove_info = 'Removing %s from webresource directory. It will take a few minutes...' % version
  print(remove_info)
  logging.info(remove_info)
  offline = r'%s/%s' % (SHARED_DIR,version)
  if os.path.exists(offline):
    shutil.rmtree(offline)
  print('Removed successfully.')
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
      print(version_info)
      logging.info(version_info)
      if not isVersionOnline4HK(version):
        removeOfflineVersion(version)
        count = count + 1
        hk_info = 'HK:The version %s stored on NFS server has been removed.' % version
        print(hk_info)
        logging.info(hk_info)    
  info = 'HouseKeeping successfully and removed %s version(s)!' % count
  print(info)
  logging.info(info)

#---------------------------------------------------------------------------------------------
# To know whether the version is used or not
#---------------------------------------------------------------------------------------------
def isVersionOnline4HK(version):
  entering = 'Try to know whether the version %s needs housekeeping...' % version
  print(entering)
  logging.info(entering)
  try:
    baseTN = registryParser.getBaseTopologyName()
    children = zooKeeperClient.getChildNodes('/%s/data/viewer/version' %(baseTN))
    if children is not None:
      for node in children:
        if (node == ''):
          continue
        data = zooKeeperClient.getData('/%s/data/viewer/version/%s' %(baseTN, node))
        data_info = 'The online version for side %s registered in zookeeper server is %s' % (node, data)
        print(data_info)
        logging.info(data_info)
        if(data == version):
          return True
    return False
  except Exception as e:
    logging.error(e)  	
    print('Ignore the error. Not housekeeping the version %s because of unknown exception happened.' % version)
    return True
#---------------------------------------------------------------------------------------------
# Is the current ViewerNext server in charge of the Multactive service?
#---------------------------------------------------------------------------------------------
def isMultiactiveOwner():
  try:
    hostname = zooKeeperClient.getHostname('/topology/viewernext/servers/1')
    if(hostname == "null" or hostname in [None,'']):
      logging.error("Could not get multiactive owner hostname from zookeeper, pls check the installation script.")
      return False
    owner_short_hostname = hostname.split(".")[0]
    local_short_hostname = socket.gethostname().split(".")[0]
    logging.info("Multiactive service for ViewerNext is [owner: %s, local: %s]" % (owner_short_hostname, local_short_hostname))
    if owner_short_hostname != local_short_hostname:
      logging.info("Skip to maintain Multiactive service for IBM ViewerNext Server [hostname: %s]" % (local_short_hostname))
      return False
  except Exception as e:
    logging.error(e)
    return False
  return True

#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------
#Set variables
websphereServiceName = 'IBMWAS85Service - was.serverViewerNextV'

#Create registry and ZooKeeper objects
registryParser = RegistryParser()
zooKeeperClient = ZooKeeperClient()

CONFIG_JSON = r"$VIEWER_CONFIG_PATH"
MOUNTDRIVE = "K:"
VIEWER_EAR_FILE = "C:\\ViewerNext\\Viewer\\com.ibm.concord.viewer.ear.ear"
SHARED_DIR = r"%s/webresource" % (MOUNTDRIVE)
VIEWER_WAR_FILE = "C:\\ViewerNext\\viewTmp\\com.ibm.concord.viewer.war.war"
RESOURCE_ROOT = "C:\\ViewerNext\\viewTmp\\warTmp\\static"
VIEWER_TMP = "C:\\ViewerNext\\viewTmp"
VIEWER_WAR_TMP = "C:\\ViewerNext\\viewTmp\\warTmp"
ONLINE_VERSION = None
OFFILE_VERSION = None
#Read the gluster settings
useGluster = "false"
isMAOwner = False
try:
  useGluster = registryParser.getSetting('MiddlewareStorage','enable_gluster')
except:
  useGluster = "false"

# Fix conversion-config.json file, so the java mount command in EAR will get the correct NAS server/volume
try:
  if useGluster == "true":
    vip = registryParser.getSetting('MiddlewareStorage','gluster_vip')
    vip = vip.split("/")[0]
    nasDocsHostname = vip
    nasViewerHostname = vip
    nasDocsMountPoint = "/docs/data"
    nasViewerMountPoint = "/acViewer"
  else:
    if (registryParser.getSetting('Docs','docs_nas_share') is not None):
      nfsShareDocs=registryParser.getSetting('Docs','docs_nas_share')
      if nfsShareDocs.count(':') == 0:
        #If the share is not in the form of <hostname>:<mount>, setup a pre-defined share again CF Linux VM
        nasDocsHostname = zooKeeperClient.getFrontEndInterface('/topology/nas/servers/1')
        zooKeeperClient.waitForServerActivation('/topology/nas/servers/1')
        nasDocsMountPoint = '/nfsexports/smartcloud/%s%s' % (nfsShareDocs, "/data")
      else:
        #If the share is in the form of <hostname>:<mount>, setup the share directly
        nasDocsHostname,nasDocsMountPoint = nfsShareDocs.split(':')
        nasDocsMountPoint = nasDocsMountPoint + "/data"
      print("nasDocsHostname=%s,nasDocsMountPoint=%s" %(nasDocsHostname,nasDocsMountPoint)) 
    if (registryParser.getSetting('AC','nas_viewer_share') is not None):
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
      print("nasViewerHostname=%s,nasViewerMountPoint=%s" %(nasViewerHostname,nasViewerMountPoint)) 
  modify_config_json(nasDocsHostname,nasDocsMountPoint, nasViewerHostname,nasViewerMountPoint)
  isMAOwner = isMultiactiveOwner()
  if isMAOwner:
    #try: # for test usage, we will not unmount so as to validate
    #  unmountThread = threading.Thread(target=unmount, name='umounting acViewer NFS server')
    #  unmountThread.start()
    #  time.sleep(.5) # make sure the thread has been started
    #  unmountThread.join()
    #except:
    #  pass

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
    if (OFFILE_VERSION is not None):
      removeOfflineVersion(OFFILE_VERSION)
    houseKeeping()
except:
  zooKeeperClient.updateActivationStatus('ViewerNext siteflip function failed!')
finally:
  if isMAOwner:
    # umount drive k:
    unmount()

#Check if WAS is running, need to Restart it to make sure NAS mount is using correct JSON
need_to_start_was = False
queryOutput = executeCommand(r'sc query "%s"' % (websphereServiceName))

if queryOutput.lower().count('running'):
  zooKeeperClient.updateActivationStatus('WAS service running status detected, now stop it!')
  #Stop the WebSphere service
  try:
    executeCommand(r'sc stop "%s"' % (websphereServiceName))
    need_to_start_was = True  # need to start WAS before program exits
  except:
    pass
if need_to_start_was: # means WAS service is stopped by this script, so need to start it now.
  for i in range(10):
    queryOutput = executeCommand(r'sc query "%s"' % (websphereServiceName))
    if queryOutput.lower().count('stopped'):
      break
    else:
      time.sleep(30)
      queryOutput = executeCommand(r'sc query "%s"' % (websphereServiceName))

  zooKeeperClient.updateActivationStatus('WAS service stopped status detected, start it now.')    
  try:
    #Start the WebSphere service
    executeCommand(r'sc start "%s"' % (websphereServiceName))
  except:
    pass
          
  #Ensure the network paths are available
  testSocket('localhost','9080',zooKeeperClient)
  zooKeeperClient.updateActivationStatus('WAS service has been started successfully!')

zooKeeperClient.updateActivationStatus('Viewer siteflip function succeeded!')
