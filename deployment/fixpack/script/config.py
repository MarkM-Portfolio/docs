import os, sys
import subprocess
import ConfigParser
import optparse
import platform
import logging
import socket
import string
try:
  import json
except ImportError:
  import simplejson as json
class Config:
  def get_input(self):
    """get input parameters"""
    default_path = ""
    if(platform.system() == "Windows"):
      default_path = r"C:\Program Files\IBM\WebSphere\AppServer\profiles\AppSrv01\bin\wsadmin.bat"
    else:
      default_path =  "/opt/IBM/WebSphere/AppServer/profiles/AppSrv01/bin/wsadmin.sh"
    usage = "usage: %prog [options] arg"
    parser = optparse.OptionParser(usage)
    parser.add_option("-u", "--user", dest="user", help="WAS administrator user name")
    parser.add_option("-p", "--password", dest="password", help="WAS administrator password")
    parser.add_option("-i", "--ignore_jobmanager",dest="ignore_jobmanager", default="false", help="Ignore update of Conversion binary files with Jobmanager.Alternative values are false and true, and it is false by defalt")
    parser.add_option("-f", "--wsadminpath", dest="wsadminpath", default=default_path,
  				help= r"path of wsadmin.bat or wsadmin.sh. By default, it is 'C:\Program Files\IBM\WebSphere\AppServer\profiles\AppSrv01\bin\wsadmin.bat' on Windows,  '/opt/IBM/WebSphere/AppServer/profiles/AppSrv01/bin/wsadmin.sh' on Linux")
    parser.add_option("-l", "--files_url", dest="files_url", help="The URL for HCL Connections Files application, for example, http://connections.yourdomain.com/files")
    parser.add_option("-a", "--j2c_alias", dest="j2c_alias", help="HCL Connections administrative user's J2C alias for viewer application, for example, connectionsAdmin")
    (options, args) = parser.parse_args()
    if(not options.user or options.user == ""):
      raise Exception("user is missing. Check your input argument or run '-h' to show help.")
    self.user = options.user
    if(not options.password or options.password == ""):
      raise Exception("password is missing. Check your input argument or run '-h' to show help.")
    self.password = options.password
    if(string.lower(options.ignore_jobmanager) == "true"):
      self.ignore_jobmanager = True
    elif(string.lower(options.ignore_jobmanager) == "false"):
      self.ignore_jobmanager = False
    else:
      raise Exception("Argument 'ignore_jobmanager' input error. Check your input argument or run '-h' to show help.")
    if(not os.path.exists(options.wsadminpath)):
      raise Exception(options.wsadminpath + " does not exsist. Check your input argument or run '-h' to show help.")
    self.wsadminpath = options.wsadminpath

    if(not options.files_url or options.files_url == ""):
      self.files_url = ""
      #logging.info("files_url is empty, if you have integrated with IBM Connection Files, you should manually add this parameter in viewer-config.json, else you can ignore this parameter.")
    else:
      self.files_url = options.files_url
    if(not options.j2c_alias or options.j2c_alias == ""):
      self.j2c_alias = ""
      #logging.info("j2c_alias is empty, if you have integrated with IBM Connection Files, you should manually add this parameter in viewer-config.json, else you can ignore this parameter.")
    else:
      self.j2c_alias = options.j2c_alias

  def call_wsadmin(self, args):
    """return was admin print"""
    ws_process = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    ws_out = ws_process.communicate()[0]
    ws_process.wait()
    if ws_out.find("Exception") > -1:
      raise Exception("Exception thrown while executing WebSphere command:" + ws_out)
    return ws_out

  def get_was_cmd_line(self):
     """set was command path, user, password"""
     args = []
     args.extend([self.wsadminpath])
     args.extend(["-lang", "jython"])
     args.extend(["-user", self.user])
     args.extend(["-password", self.password])
     return args

  def call_was_task(self, task_name, etc_args, return_was_out = False):
    """call was task, if return_was_out=true, return was sysout, if return_was_out=false, no return was sysout"""
    args = self.get_was_cmd_line()
    print "call_was_task: " + task_name
    args.extend(['-f', '../execwas.py', task_name] + etc_args)
    #logging.debug(args)
    was_out = self.call_wsadmin(args)
    logging.debug(was_out)
    if return_was_out:
      """parse was print and get the query information"""
      start_string = "<was-query-result>"
      end_string = "</was-query-result>"
      start_index = was_out.find(start_string) + len(start_string)
      end_index = was_out.find(end_string)
      result = was_out[start_index:end_index]
      return result

  def get_app_list(self):
    """return an array that contains names of all installed apps """
    return eval(self.call_was_task('print_app_list', [' '], True))

  def stop_cluster(self, cluster_name):
    """stop cluster"""
    logging.info("Stop cluster: " + cluster_name)
    self.call_was_task('stop_cluster',[cluster_name])

  def start_cluster(self, cluster_name):
    """start cluster"""
    logging.info("Start cluster: " + cluster_name)
    self.call_was_task('start_cluster',[cluster_name])

  def restart_cluster(self, cluster_name):
    """restart cluster"""
    self.stop_cluster(cluster_name)
    self.start_cluster(cluster_name)

  def get_target_list(self):
    """get jobmanager target list by conversion cluster name"""
    if not self.target_list:
      cluster_name = self.get_cr_cluster_name()
      self.target_list = eval(self.call_was_task('get_target_list', [cluster_name], True))
    return self.target_list

  def get_me_hostname(self):
    """get the hostname of the server"""
    me_hostname = socket.getfqdn()
    if not me_hostname or me_hostname == "":
      me_hostname = socket.gethostname()
    target_list = self.get_target_list()
    if me_hostname not in target_list:
      me_ip = socket.gethostbyname(me_hostname)
      for hn in target_list:
        if me_ip == socket.gethostbyname(hn):
          me_hostname = hn
          break
    return me_hostname

  def init_log(self, log_path):
    """initiate log setting"""
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(levelname)s %(message)s',
                        filename=log_path,
                        filemode='w')
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)

  def get_conversion_install_root(self):
    """get conversion install root on node"""
    return self.call_was_task('print_cell_variable', ['CONVERSION_INSTALL_ROOT'], True)

  def get_cr_cluster_name(self):
    """get conversion cluster name"""
    return self.get_cr_sanity_json()["cluster_name"]

  def get_cr_sanity_json(self):
    """get conversion.sanity json"""
    if not self.cr_sanity_json:
      self.cr_sanity_json = self.get_config_json(self.docs_config_dir, "conversion_sanity.json")
    return self.cr_sanity_json

  def get_docs_cluster_name(self):
    """get name of docs cluster """
    return self.get_docs_sanity_json()["cluster_name"]

  def get_docs_sanity_json(self):
    """get docs.sanity json"""
    if not self.docs_sanity_json:
      self.docs_sanity_json = self.get_config_json(self.docs_config_dir, "docs_sanity.json")
    return self.docs_sanity_json

  def get_sym_count(self):
    """get symphony count of conversion server """
    if(self.sym_count == 0):
      json_file_name = "conversion-config.json"
      cr_config_json = self.get_config_json(self.docs_config_dir, json_file_name)
      if cr_config_json:
        self.sym_count = cr_config_json["symphony"]["used-host-count"]*2
    return self.sym_count

  def get_config_json(self, dir_name, json_file_name):
    """get the config json object through config file name"""
    if not os.path.exists(json_file_name):
      self.call_was_task('extract_file', [dir_name, json_file_name, json_file_name])
    config_json = None
    if os.path.exists(json_file_name):
      json_file = open(json_file_name, 'r')
      config_json = json.load(json_file)
      json_file.close()
    return config_json

  def __init__(self):
    self.init_log("iFixInstall.log")
    self.ignore_jobmanager = False
    self.get_input()
    self.cr_sanity_json = None
    self.docs_sanity_json = None
    self.sym_count = 0
    self.target_list = None
    self.lc_config_dir = "LotusConnections-config"
    self.lc_config_file = "LotusConnections-config.xml"
    self.docs_config_dir = "IBMDocs-config"
    self.comps = {
      'IBMDocs': {'dir': 'DocsApp', 'json_file': 'concord-config.json'}, 
      'ViewerApp': {'dir': 'Viewer', 'json_file': 'viewer-config.json'}, 
      'IBMConversion': {'dir': 'DocsConversion', 'json_file': 'conversion-config.json'}
    }
    self.lc_config = {
      'docs': {'com.ibm.docs.types.ccm.edit': 'false','com.ibm.docs.types.files.edit': 'false'},
      'viewer': {'com.ibm.docs.types.ccm.view': 'false','com.ibm.docs.types.files.view': 'false'}
    }
    self.finish_status_node_file_name = os.path.join( os.getcwd(), 'DocsConversion', 'logs', '%s', 'node_finish_status.json')

CONFIG=Config()
