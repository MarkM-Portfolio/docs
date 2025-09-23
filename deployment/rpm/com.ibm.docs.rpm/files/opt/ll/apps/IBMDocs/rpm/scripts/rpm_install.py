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


'The module executes HCL Docs RPM installation steps'

import os
import os.path
import logging
import time,sys,subprocess,socket,fileinput,re,zipfile
import shutil
from rpm_util.rpm_cfg import cfg as CFG
sys.path.append('/opt/ll/lib/websphere')
import serverLib
sys.path.append('/opt/ll/lib/nfs')
import mountLib
sys.path.append('/opt/ll/lib/apache/zookeeper')
sys.path.append('/opt/ll/lib/registry')
sys.path.append('/opt/ll/lib/gluster')
from zooKeeperLib import *
from registryLib import *
try:
    import glusterMount
except ImportError:
    pass

serviceUser='websphere'
serviceGroup='websphere'
PROFILE_SOAP_CLIENT_PROPS = "soap.client.props"
WAS_INSTALL_ROOT = "/opt/IBM/WebSphere/AppServer"

def _init_log():

    log_dir ='/opt/ll/logs/SC-Docs-Config'
    log_path = log_dir + os.sep + 'DocsInstall.log'

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

def prepare_was():
    'create profile,start was server'

    logging.info('Start to prepare WAS environment...')

    logging.info('Create WAS profile')
    serverLib.createProfile(
            CFG.get_was_username(),
            CFG.get_was_password(),
            CFG.get_was_servername(),
            CFG.get_was_profilename(),
            CFG.get_was_installroot()
            )

    # update soap timeout
    update_soap_client_props_timeout(CFG.get_was_installroot() + "/profiles/" + CFG.get_was_profilename() + "/properties/" + PROFILE_SOAP_CLIENT_PROPS, "com.ibm.SOAP.requestTimeout=.*", "com.ibm.SOAP.requestTimeout=600")

    logging.info('Start WAS server')
    serverLib.startServerByName(
            CFG.get_was_servername(),
            CFG.get_was_installroot()
            )

    logging.info('Register WAS as service')
    serverLib.createService(
            CFG.get_was_username(),
            CFG.get_was_password(),
            'was.server1',
            CFG.get_was_servername(),
            CFG.get_was_profilename(),
            CFG.get_was_installroot()
            )
    logging.info('Finish to prepare WAS environment...')

def generate_cfg_file():
    'Dynamically generate the cfg.properties file HCL Docs from ZooKeeper'

    logging.info('Dynamically generate the cfg.properties file...')
    cfg_file = open(CFG.get_cfg_name(),'r')
    rpm_cfg = open(CFG.get_rpm_cfg_name(),'w+')
    from ConfigParser import SafeConfigParser as SafeConfigParser
    config = SafeConfigParser()
    config.readfp(cfg_file)

    for (option,value) in CFG.get_cfg_options():
        config.set('Docs',option,value)

    config.write(rpm_cfg)
    cfg_file.close()
    rpm_cfg.close()

def launch_install():
    'After all prepartion, launch the standard installation'

    logging.info('After all prepartion, launch the standard installation...')
    logging.info('The complete install log of HCL Docs located at %s...' % CFG.get_docs_installroot())
    myCommand = ' '.join([
        'su -c "PYTHONPATH=$PYTHONPATH:$PWD python docs/install.py',
        "-configFile",
        CFG.get_rpm_cfg_name(),
        "-build",
        CFG.get_build_dir(),
        "-wasadminID",
        CFG.get_was_username(),
        "-wasadminPW",
        CFG.get_was_password(),
        "-dbadminID",
        CFG.get_db_username(),
        "-dbadminPW",
        CFG.get_db_password(),
        "-acceptLicense",
        '-silentlyInstall"',
        serviceUser
        ])

    proc = subprocess.Popen(myCommand, stdout=subprocess.PIPE, shell=True)


    for line in iter(proc.stdout.readline,''):
       print line

    retval = proc.wait()
    if retval:
        raise Exception('Failed while installing HCL Docs')

def set_folder_permissions(username,groupname,path,permission,recursive=False):

    recursive_tag = ''
    if recursive:
         recursive_tag = '-RL'
    cmds = [
            'chmod %s %s' % (permission,path) ,
            'chown %s %s:%s %s' % (recursive_tag,username,groupname,path)]

    for cmd in cmds:
        p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT);
        output = p.communicate()[0]
        #print output
        retval = p.returncode
        if retval:
            raise Exception('RC %s while updating folder permission (%s)' % (retval,cmd))

def set_permissions(username,groupname,path,recursive=False):
    set_folder_permissions(username,groupname,path,755,recursive)

def gluster_config():
    'config Gluster NFS client to communicate with Conversion'

    logging.info('Config Gluster NFS to mount NFS server')

    docsShare = '/mnt/nas/docs'

    try:
        #Create the local mount point directory
        if not os.path.exists(docsShare):
            os.makedirs(docsShare,0755)
        if not os.path.exists('/opt/ll/runtime'):
            os.makedirs('/opt/ll/runtime',0755)
        os.system('chmod 755 %s' % (docsShare))

        if zooKeeperClient.isActiveSide():
            glusterMount.configureMountDeployment(docsShare, "docs")
        else:
            glusterMount.configureMountDeployment(docsShare, "docs_test")
    except:
        pass

    mountLib.linkFilesystem('/opt/ll/runtime/data', docsShare)
    os.system('chmod 755 /opt/ll/runtime')
    set_folder_permissions(serviceUser,serviceGroup,'/opt/ll/runtime/data',700)

def nfs_config(docs_nas_share):
    'config NFS client to communicate with Conversion'

    logging.info('Config NFS to mount NFS server')

    if not os.path.exists('/opt/ll/runtime') :
        os.makedirs('/opt/ll/runtime',0755)

    #Mount the NAS
    if docs_nas_share: #For NAS device mount point
        #mountLib.setupFSTabWithNFSShare(docs_nas_share.strip(), '/mnt/nas')
        mountLib.setupFSTab(docs_nas_share)
    else: # For Linux NFS server mount point
        mountLib.setupFSTab('docs')
    mountLib.mountFilesystem()
    mountLib.linkFilesystem('/opt/ll/runtime/data')

    os.system('chmod 755 /opt/ll/runtime')
    #os.system('chown -h %s:%s /opt/ll/runtime/data' % (serviceUser,serviceGroup))
    #set_folder_permissions(serviceUser,serviceGroup,'/opt/ll/runtime',700)
    set_folder_permissions(serviceUser,serviceGroup,'/opt/ll/runtime/data',700)

def registerWithZookeeper(zooKeeperClient,zkPath):

   logging.info('Publishing server information with ZooKeeper...')
   try:
      zooKeeperClient.createEphemeralNodes(zkPath, 'SEQUENTIAL')
   except:
      print 'Error while attempting to publish server details with ZooKeeper'
      raise
   logging.info('Server published on ZooKeeper')


def activateServer(zooKeeperClient,zkPath):

   logging.info('Activating server in ZooKeeper...')
   try:
      zooKeeperClient.activateServer(zkPath)
   except:
      print 'Error while attempting to activate server in ZooKeeper'
      raise
   logging.info('Server activated in ZooKeeper')


def token_config():
    'For CF, need get new token from ZooKeeper, then config it into concord-config.json'

    CONFIG_JSON_SRC_NAME = '../config/concord-config-premise-template.json'
    CF_JSON_SRC_NAME = '../config/concord-config-sc-template.json'
    #token_pattern = r"\s*\"token\"\s*:\s*\"(.*)\"\s*"
    lc_token_pattern = r"\s*\"s2s_token\"\s*:\s*\"(dummy.local)\"\s*"
    conversion_token_pattern = r"\s*\"s2s_token\"\s*:\s*\"(fallseason2011)\"\s*"

    if os.path.exists(CF_JSON_SRC_NAME) :
        os.remove(CONFIG_JSON_SRC_NAME)
        shutil.copyfile(CF_JSON_SRC_NAME,CONFIG_JSON_SRC_NAME)

    token = CFG.get_s2s_token()
    for line in fileinput.input(CONFIG_JSON_SRC_NAME, inplace=1):

        if re.match(lc_token_pattern, line):
            dir = re.match(lc_token_pattern, line).group(1)
            line = re.sub(dir, token, line)
        if re.match(conversion_token_pattern, line):
            dir = re.match(conversion_token_pattern, line).group(1)
            line = re.sub(dir, token, line)
        '''
        if re.match(token_pattern, line):

            dir = re.match(token_pattern, line).group(1)
            line = re.sub(dir, token, line)
        '''
        sys.stdout.write(line)


def nonroot_config():
    'set security permissions of folder'

    logging.info('Non-root installation need set security permissions of folder')

    if not os.path.exists(CFG.get_docs_installroot()) :
        os.makedirs(CFG.get_docs_installroot(),0755)

    if not os.path.exists(CFG.get_shared_datadir()) :
        os.makedirs(CFG.get_shared_datadir(),0700)

    set_permissions(serviceUser,serviceGroup,'..',True)
    set_permissions(serviceUser,serviceGroup,CFG.get_build_dir(),True)
    set_permissions(serviceUser,serviceGroup,CFG.get_docs_installroot(),True)
    set_permissions(serviceUser,serviceGroup,CFG.get_was_installroot(),True)
    set_folder_permissions(serviceUser,serviceGroup,CFG.get_shared_datadir(),700)

def export_target_tree():
    'DMZ need docs server target tree info by zookeeper'

    logging.info('export WAS target tree infomation to zookeeper...')

    was_script = 'rpm_util/target_tree.py'
    target_tree = '/tmp/targetTree.xml'

    cmd = '%s/bin/wsadmin.sh -lang jython -username %s -password %s -f %s' % \
            (CFG.get_was_installroot(),CFG.get_was_username(),CFG.get_was_password(),was_script)

    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT);
    output = p.communicate()[0]
    print output
    retval = p.returncode
    if retval:
        raise Exception('RC %s while export target tree by wsadmin (%s)' % (retval,cmd))

    zk_path = '/data/docs/target_trees'
    zooKeeperClient = ZooKeeperClient()

    #zooKeeperClient.createNode(zkPath,None)
    zooKeeperClient.createEphemeralNodes(zk_path,'SEQUENTIAL')
    node_path = zooKeeperClient.findEphemeralNode(zk_path)

    zooKeeperClient.encodeFileToNode(target_tree,node_path)

def ldap_config():
    'Config LDAP info for Docs'

    logging.info('Config LDAP info by LC xml file')

    hostname = socket.gethostname().split('.')[0]
    config_folder = 'LotusConnections-config'
    ldap_xml = '%s/directory.services.xml' % config_folder
    config_path = '/opt/IBM/WebSphere/AppServer/profiles/AppSrv01/config/cells/%sNode01Cell/%s' % (hostname,config_folder)

    ldap_pattern = r".*ldap://(hostname):389.*"

    ids_ip = CFG.get_ids_ip()


    for line in fileinput.input(ldap_xml, inplace=1):
        if re.match(ldap_pattern, line):

            dir = re.match(ldap_pattern, line).group(1)
            line = re.sub(dir, ids_ip, line)

        sys.stdout.write(line)

    if os.path.exists(config_path) :
         shutil.rmtree(config_path)
    shutil.copytree(config_folder,config_path)

def journal_config(journal_server_url):
    'Config journal for Docs'

    logging.info('Configure journal scripts')

    docs_journal_name = 'journal_main.sh'
    docs_journal_path = os.path.abspath(os.path.join(CFG.get_build_dir(),'installer','journal',docs_journal_name))
    docs_journal_target = os.path.abspath(os.path.join(CFG.get_docs_installroot(),'journal',docs_journal_name))
    common_journal_path = '/opt/ll/scripts/journal/'
    script_path = '/etc/cron.d/docs_journal.scripts'

    try:
        docs_journal_target_folder = os.path.abspath(os.path.join(CFG.get_docs_installroot(), 'journal'))
        logging.info('Docs Journal target folder is %s' % docs_journal_target_folder)
        if not os.path.exists(docs_journal_target_folder):
          logging.info('Docs Journal target folder : %s is not exists' % docs_journal_target_folder)
          os.makedirs(docs_journal_target_folder, 0755)
          set_permissions(serviceUser, serviceGroup, docs_journal_target_folder)
        shutil.copy(docs_journal_path, docs_journal_target)
        set_permissions(serviceUser, serviceGroup, docs_journal_target)

        journal_cmd = '*/10 * * * * %s %s %s %s %s \n' % (serviceUser,docs_journal_target,os.path.abspath(os.path.join(CFG.get_docs_installroot(),'journal')) + '/',journal_server_url,common_journal_path)
        cron_file = open(script_path,'w')
        cron_file.writelines([journal_cmd])
        cron_file.close()
        crontab_cmds = [
            'chown root %s' % script_path,
            'chmod 644 %s' % script_path,
            '/etc/init.d/crond restart'
            ]

        for cmd in crontab_cmds:
            p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT);
            output = p.communicate()[0]
            #print output
            retval = p.returncode
            if retval:
                raise Exception('RC %s while configure journal for Docs (%s)' % (retval,cmd))

    except Exception,e:
        logging.error(e)
        raise Exception('failed to configure journal for Docs')

def ever_installed():

    uninstall_log = '/opt/ll/logs/SC-Docs-Config/DocsUninstall.log'
    return os.path.exists(uninstall_log)

#---------------------------------------------------------------------------------------------
#collect logs from source_dirs(one directory or more), build a zip file named  zip_file_name in target_dir
#---------------------------------------------------------------------------------------------
def collect_zip_log(zip_file_name,target_dir,*source_dirs):
    # new zip file
    f = None
    try:
        if(os.path.isdir(target_dir)):
            f = zipfile.ZipFile(os.path.join(target_dir,zip_file_name),'w',zipfile.ZIP_DEFLATED)
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
                    for parent,dirnames,filenames in os.walk(source_dir):
                        for filename in filenames:
                            full_filename = os.path.join(parent,filename)
                            logging.info(full_filename + ' is zipped.')
                            f.write(full_filename,filename)
                else:
                    logging.info(source_dir + ' does not exist or is not a directory')
                    continue
    except Exception, e:
        logging.info('Exception during collecting log files')
        logging.error(e)
    finally:
        if f != None:
            f.close()
#---------------------------------------------------------------------------------------------
# Add Https Certificates into Websphere...
#---------------------------------------------------------------------------------------------
def add_https_certificates():
    """
        Add Https Certificates into Websphere...
    """

    logging.info('Signer certificates start...')

    cert_script = 'rpm_util/https_certificates.py'
    total_cmd_str = '%s/bin/wsadmin.sh -lang jython -username %s -password %s -f %s %s %s'
    if sys.platform.lower() == 'win32':
        total_cmd_str = '%s/bin/wsadmin.bat -lang jython -username %s -password %s -f %s %s %s'
    # print total_cmd_str
    totalcmd = total_cmd_str % (CFG.get_was_installroot(), CFG.get_was_username(), CFG.get_was_password(), cert_script, 'api.box.com', '443')
    # print totalcmd
    try:
        p = subprocess.Popen(totalcmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
        retval = p.communicate()[0]
        # print '---------', retval
        if 'Exception' in retval:
            logging.info('RC %s while add https certificates by wsadmin (%s)' % (retval, totalcmd))
    except Exception, e:
        logging.error('Error --> %s Signer Certificates Of Windows By Commond : (%s)' % (retval, totalcmd))
    finally:
        logging.info('Signer certificates complete...')
#---------------------------------------------------------------------------------------------
# Fixed OCS ticket 219888
#---------------------------------------------------------------------------------------------
def restrictCiphers():
    logging.info('Remove medium strength ciphers 3DES start...')
    resCiphers_script = 'rpm_util/restrict_ciphers.py'
    total_cmd_str = '%s/bin/wsadmin.sh -lang jython -username %s -password %s -f %s %s %s'
    if sys.platform.lower() == 'win32':
        total_cmd_str = '%s/bin/wsadmin.bat -lang jython -username %s -password %s -f %s %s %s'
    # print total_cmd_str
    totalcmd = total_cmd_str % (CFG.get_was_installroot(), CFG.get_was_username(), CFG.get_was_password(), resCiphers_script, CFG.get_was_servername(), CFG.get_was_nodename())
    # print totalcmd
    try:
        p = subprocess.Popen(totalcmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
        retval = p.communicate()[0]
        # print '---------', retval
        if 'Exception' in retval:
            logging.info('RC %s while restricting ciphers by wsadmin (%s)' % (retval, totalcmd))
    except Exception, e:
        logging.error('Error --> %s Remove medium strength ciphers 3DES By Commond : (%s)' % (retval, totalcmd))
    finally:
        logging.info('Remove medium strength ciphers 3DES complete...')
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
# Start a was service
#---------------------------------------------------------------------------------------------
def startWASService(serviceName):

   print 'Starting %s service...' % (serviceName)
   try:
      p = subprocess.Popen('service %s start' % (serviceName), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      print p.communicate()[0]
      if p.returncode:
         raise Exception('RC %s while starting service %s' % (p.returncode,serviceName))
   except:
      print 'Error:  TFIM configuration failed. Unable to start service %s' % (serviceName)
      raise


#---------------------------------------------------------------------------------------------
# Stop a was service
#---------------------------------------------------------------------------------------------
def stopWASService(serviceName):

   print 'Stopping %s service...' % (serviceName)
   try:
      p = subprocess.Popen('service %s stop' % (serviceName), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      print p.communicate()[0]
      if p.returncode:
         print 'Warning: RC %s while stop service %s.  Ignoring since the WebSphere service status implementation is often inaccurate...' % (p.returncode,serviceName)
   except:
      print 'Error:  TFIM configuration failed. Unable to stop service %s' % (serviceName)
      raise

#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------
if __name__ == '__main__' :

    _init_log()
    try:
        if ever_installed():
            logging.info('Docs App ever installed on this server, so just update the core Docs App components.')
            cfg_path = '/tmp/rpm_cfg.properties'
            if os.path.exists(cfg_path):
                shutil.copy(cfg_path, '.')
            else:
                generate_cfg_file()
                token_config()
                nonroot_config()
                launch_install()
                sys.exit(0)
        else:
            logging.info('Docs App never installed on this server, so launch a fresh new deployment.')

        zkPath = '/topology/docs/servers'
        zooKeeperClient = ZooKeeperClient()
        zooKeeperClient.publishRegistrySettings('Docs')
        registerWithZookeeper(zooKeeperClient,zkPath)
        registryParser = RegistryParser()

        useGluster = "false"
        try:
            useGluster = registryParser.getSetting('MiddlewareStorage','enable_gluster')
        except:
            useGluster = "false"

        #Read Docs Multiactive settings
        bDocsMultiActive = registryParser.getSetting('Docs','is_docs_multiactive')
        logging.info('is Docs multiactive %s' % (bDocsMultiActive))

        if zooKeeperClient.isActiveSide():
            docs_nas_share = registryParser.getSetting('Docs', 'docs_nas_share')
        else:
            docs_nas_share = registryParser.getSetting('Docs', 'docs_nas_share_test')
        try:
            zooKeeperClient.updateActivationStatus('Prepare WAS environment,create profile,register service...')

            set_was_java8()
            prepare_was()

            zooKeeperClient.updateActivationStatus('Prepare NFS client...')
            if useGluster == "true":
                gluster_config()
            else:
                nfs_config(docs_nas_share)

            zooKeeperClient.updateActivationStatus('Prepare s2s token...')
            token_config()

            zooKeeperClient.updateActivationStatus('Configure LDAP for Docs App')
            ldap_config()

            if (bDocsMultiActive == "true"):
              zooKeeperClient.waitForServerActivation('/topology/docs_db2/servers/1')
            else:
              zooKeeperClient.waitForServerActivation('/topology/acdb2/servers/1')

            zooKeeperClient.updateActivationStatus('Prepare Docs installation cfg.properties...')
            generate_cfg_file()

            zooKeeperClient.updateActivationStatus('Prepare non-root environment...')
            nonroot_config()

            zooKeeperClient.updateActivationStatus('Launch installation...')
            launch_install()

            zooKeeperClient.updateActivationStatus('Config Docs journal client...')
            # <Environment>Engage-TFIM-9090   eg. MA1Engage-TFIM-9090 is the virtual server which points only to the dmgr
            if bDocsMultiActive == "true":
              journal_server_url = 'http://%s:9090' % registryParser.getVSRHostByServiceName('tfim')
            else:
              journal_server_url = 'http://%s:9090' % zooKeeperClient.getBackEndInterface('/topology/tfim/servers/dmgr')
            journal_config(journal_server_url)

            zooKeeperClient.updateActivationStatus('Export target tree info to DMZ by Zookeeper...')
            export_target_tree()

            zooKeeperClient.updateActivationStatus('Add Https Certificates into Websphere...')
            add_https_certificates()

            restrictCiphers()
        except:
            zooKeeperClient.updateActivationStatus('HCL Docs installation failed','failed')
            raise

        stopWASService("was.server1")
        startWASService("was.server1")

        routingPolicy = registryParser.getSetting('Docs', 'docsrp_routing_policy')
        logging.info('Docs routing policy is %s' % (routingPolicy))
        if (bDocsMultiActive == "true" or routingPolicy == "dynamic"):
          baseTopologyName = registryParser.getBaseTopologyName()
          topologyName = registryParser.getTopologyName()
          hostname = socket.gethostname().split('.')[0]
          phasePath = '/' + baseTopologyName + '/data/docs/data/' + topologyName + '/members/' + hostname + "/phase"
          zooKeeperClient.setData(phasePath, 'redeploy')
          print 'Set server %s phase to redeploy successfully' % (hostname)

        activateServer(zooKeeperClient,zkPath)
        zooKeeperClient.updateActivationStatus('HCL Docs server Activated...')
    except Exception, e:
        logging.error(e)
        sys.exit(1)
    finally:
        zip_file_name = 'docsapp.zip'
        target_dir = '/opt/ll/logs/SC-Docs-Config'
        docs_log_dir = CFG.get_docs_installroot() + '/logs'
        was_log_dir = CFG.get_was_installroot() + '/profiles/AppSrv01/logs/server1'
        collect_zip_log(zip_file_name,target_dir,docs_log_dir,was_log_dir)
