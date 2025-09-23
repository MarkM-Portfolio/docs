# -*- encoding: utf8 -*-
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


'The module executes HCL Docs RPM uninstallation steps'


import os
import os.path
import logging
import time,sys,subprocess,socket,fileinput,re
import shutil
from rpm_util.rpm_cfg import cfg as CFG
sys.path.append('/opt/ll/lib/websphere')
import serverLib
sys.path.append('/opt/ll/lib/nfs')
import mountLib
sys.path.append('/opt/ll/lib/apache/zookeeper')
sys.path.append('/opt/ll/lib/registry')
from zooKeeperLib import *
from registryLib import *


serviceUser='websphere'
serviceGroup='websphere'

def _init_log():

    log_dir ='/opt/ll/logs/SC-Docs-Config'
    log_path = log_dir + os.sep + 'DocsUninstall.log'

    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    logging.basicConfig(level=logging.DEBUG,
                      format='%(asctime)s %(levelname)s %(message)s',
                      filename=log_path,
                      filemode='w')

    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)

def backup_cfg():
    cfg_path = '/opt/IBM/IBMDocs/rpm_cfg.properties'
    if os.path.exists(cfg_path):
        shutil.copy(cfg_path,'/tmp/rpm_cfg.properties')

def launch_uninstall():

    logging.info('Uninstall HCL Docs...')

    logging.info('The complete uninstall log of HCL Docs located at %s...' % CFG.get_docs_installroot())

    '''
    cmd2 = ' '.join([
        #'sudo -u %s %s python docs/install.py ' % (serviceUser,'PYTHONPATH=$PYTHONPATH:$PWD'),
        'su -c "%s python docs/install.py ' % ('PYTHONPATH=$PYTHONPATH:$PWD'),
        CFG.get_rpm_cfg_name(),
        CFG.get_build_dir(),
        CFG.get_was_username(),
        CFG.get_was_password(),
        CFG.get_db_username(),
        CFG.get_db_password(),
        #CFG.get_license_accept()
        CFG.get_license_accept(),'"',serviceUser
       ])
    logging.info(cmd2)
    retval = os.system(cmd2)

    if retval:
        raise Exception('Failed while uninstalling HCL Docs')
    '''
    cmd1 = ' '.join([
        #'sudo -u %s %s python docs/uninstall.py ' % (serviceUser,'PYTHONPATH=$PYTHONPATH:$PWD'),
        'su -c  "%s python docs/uninstall.py ' % ('PYTHONPATH=$PYTHONPATH:$PWD'),
        "-configFile",
        CFG.get_rpm_cfg_name(),
        "-build",
        CFG.get_build_dir(),
        "-wasadminID",
        CFG.get_was_username(),
        "-wasadminPW",
        #CFG.get_was_password()
        CFG.get_was_password(),'"',serviceUser])
    logging.info(cmd1)
    proc = subprocess.Popen(cmd1, stdout=subprocess.PIPE, shell=True)

    for line in iter(proc.stdout.readline,''):
       print line

if __name__ == '__main__' :

    _init_log()
    backup_cfg()
    launch_uninstall()
