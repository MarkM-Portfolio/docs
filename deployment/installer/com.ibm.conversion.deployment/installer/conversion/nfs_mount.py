# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 


import os, sys, fileinput, subprocess
from common import command, CFG, call_wsadmin
import logging as log

LOCAL_DRIVER="Q:"

class NFSMount(command.Command):
  
  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    return True

  def do(self):
    log.info("Mount remote NAS/NFS devices...")
    # UMOUNT first to avoid duplicate mounts
    self.umount_it(LOCAL_DRIVER)
    
    # Something like //nfs.docsdev.cn.ibm.com/docsdev/ac/viewer/
    viewer_unc_path = CFG.getViewerSharedDataRoot()
    v_list = viewer_unc_path.strip("/").split("/")
    if (viewer_unc_path[:2] != '//') or (len(v_list) < 2):
      raise Exception("Error found for 'viewer_shared_storage_local_path' in your cfg.properties")
    mount_path = "%s:/%s" % (v_list[0], "/".join(v_list[1:]))
    self.mountFilesystem(mount_path, LOCAL_DRIVER)
    return True

  def undo(self):
    self.unmount_it(LOCAL_DRIVER)
    return True
  
  def execute_cmds(self, cmds, check_result=True):
    for cmd in cmds:
      p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      output = p.communicate()[0]
      print(output)
      retval = p.returncode
      if check_result and retval:
        print(("Exceptions while executing %s, retrying in 30s again...." % cmd))
        time.sleep(30)
        pp = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        ooput = pp.communicate()[0]
        print(ooput)
        rretval = pp.returncode
        if rretval:
          raise Exception('RC %s while executing command "%s". ' % (rretval,cmd))

  def mountFilesystem(self, remote_nfs_path, localMountPoint='Q:'):
    #Assume the uid/gid and other NFS configuration is done successfully
    cmds = ['mount -o mtype=soft timeout=50 casesensitive=yes anon %s %s' % (remote_nfs_path, localMountPoint)]
    self.execute_cmds(cmds)

  def umount_it(self, localMountPoint='Q:'):
    log.info("Unmount remote NAS/NFS devices...")
    #Assume the uid/gid and other NFS configuration is done successfully
    cmds = ['umount %s' % localMountPoint]
    self.execute_cmds(cmds, False)
