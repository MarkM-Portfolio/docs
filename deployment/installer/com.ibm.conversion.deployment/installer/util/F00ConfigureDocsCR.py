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

import os, subprocess, time, re, sys, base64, socket, fileinput
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
  print log
  p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate()[0]
  print output
  if p.returncode:
    raise Exception('Error executing command: ' + output)
  print 'Command successful.'
  
  return output
    
#---------------------------------------------------------------------------------------------
# Test a socket connection
#---------------------------------------------------------------------------------------------
def testSocket(ipAddress,port,zooKeeperClient):

  print 'Testing socket connection %s:%s...' % (ipAddress,port)
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

  config_json["shared_storage"]["docs"]["server"]   = nasDocsHostname
  config_json["shared_storage"]["docs"]["from"]     = nasDocsMountPoint
  config_json["shared_storage"]["viewer"]["server"] = nasViewerHostname
  config_json["shared_storage"]["viewer"]["from"]   = nasViewerMountPoint

  config_json_file = open(CONFIG_JSON, 'w')
  json.dump( config_json, config_json_file, indent=2 )
  config_json_file.close()

#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------
#Set variables
websphereServiceName = 'IBMWAS85Service - was.server1'

#Create registry and ZooKeeper objects
registryParser = RegistryParser()
zooKeeperClient = ZooKeeperClient()

CONFIG_JSON = r"$/IBMConversion/config/conversion-config.json"

#drive_disk = registryParser.getSetting('DocsConversion', 'docscr_drive_disk')
#if drive_disk:
#  CONFIG_JSON = CONFIG_JSON % (drive_disk)
#else:
#  CONFIG_JSON = CONFIG_JSON % ("D:")   
#Read the gluster settings
useGluster = "false"
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
        zooKeeperClient = ZooKeeperClient()
        nasDocsHostname = zooKeeperClient.getFrontEndInterface('/topology/nas/servers/1')
        zooKeeperClient.waitForServerActivation('/topology/nas/servers/1')
        nasDocsMountPoint = '/nfsexports/smartcloud/%s%s' % (nfsShareDocs, "/data")
      else:
        #If the share is in the form of <hostname>:<mount>, setup the share directly
        nasDocsHostname,nasDocsMountPoint = nfsShareDocs.split(':')
        nasDocsMountPoint = nasDocsMountPoint + "/data"
      
    print "nasDocsHostname=%s,nasDocsMountPoint=%s" %(nasDocsHostname,nasDocsMountPoint)
  
    if (registryParser.getSetting('AC','nas_viewer_share') is not None):
      #Mount the DataFS Share
      nfsShareViewer=registryParser.getSetting('AC','nas_viewer_share')
      if nfsShareViewer.count(':') == 0:
        #If the share is not in the form of <hostname>:<mount>, setup a pre-defined share again CF Linux VM
        zooKeeperClient = ZooKeeperClient()
        nasViewerHostname = zooKeeperClient.getFrontEndInterface('/topology/nas/servers/1')
        zooKeeperClient.waitForServerActivation('/topology/nas/servers/1')
        nasViewersMountPoint = '/nfsexports/smartcloud/%s' % (nfsShareViewer)
      else:
        #If the share is in the form of <hostname>:<mount>, setup the share directly
        nasViewerHostname,nasViewerMountPoint = nfsShareViewer.split(':')

    print "nasViewerHostname=%s,nasViewerMountPoint=%s" %(nasViewerHostname,nasViewerMountPoint)

  modify_config_json(nasDocsHostname,nasDocsMountPoint, nasViewerHostname,nasViewerMountPoint)
except:
  zooKeeperClient.updateActivationStatus('DocsCR siteflip function failed!')

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

zooKeeperClient.updateActivationStatus('DocsCR siteflip function succeeded!')
