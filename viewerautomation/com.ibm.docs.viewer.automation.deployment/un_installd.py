import os, sys, stat
import shutil
import logging
import datetime
import pdb

def _init_log():
  #cfg = config.Config()
  log_dir = "."
  if not os.path.exists(log_dir):
    os.makedirs(log_dir)
  logging.basicConfig(level=logging.DEBUG,
                      format='%(asctime)s %(levelname)s %(message)s',
                      filename=log_dir + os.sep + 'proxy_install.log',
                      filemode='w')

  console = logging.StreamHandler()
  console.setLevel(logging.INFO)
  formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)

def install_ear():
  return True
  logging.infor("Installing the application")
  ear_path = build_dir + "/" + "com.ibm.docs.viewer.automation.ear.ear"
  
  args = []
  args.extend([ear_path])
  args.extend([app_name])
  args.extend([scope])
  
  if scope.lower() == "cluster":
    args.extend([scope_name])
    args.extend([scope_name])
  elif scope.lower() == "server":
    args.extend([scope_name])
    args.extend([node_name])
  else:
    logging.info("Invalid scope")
    return False;
    
  succ, ws_out = call_task("install_ear.py", args)
  return succ
  
def uninstall_ear():
  logging.info("Uninstalling the application")
  succ, ws_out = call_task("uninstall_ear.py", [app_name])
  return succ
  
def start_app():
  logging.info("Starting the application.")
  args = []
  args.extend([app_name])
  
  succ, ws_out = call_task("start_app.py", args)
  return succ
  
def map2webserver():
  if str(map_webserver).lower == "true":
    logging.info("Implement the mapping to server.")
  else:
    logging.info("Ignore mapping to web server.")
  return

def get_data_dir():
  args = []
  args.extend(["VIEWER_SHARED_DATA_ROOT"])
  
  succ, ws_out = call_task("get_websphere_variable.py", args)
  #pdb.set_trace()
  if not succ:
    return False
  else:    
    value = None
    for line in ws_out.split('\n'):
      if line.find('value is:') > -1:
        value = line.strip(' \r\n\t').replace('value is:','')
        break
      elif line.find('no value found') > -1:
      	value = None
      	break
    return value

def call_task(task_name, args):
  from util.common import call_wsadmin
  
  args_1 = []
  args_1.extend([get_wsadmin_script()])
  args_1.extend(["-lang", "jython"])
  args_1.extend(["-port", str(soap_port)])
  args_1.extend(["-user", user_name ])
  args_1.extend(["-password", password ])
  args_1.extend(["-f", "./tasks/" + task_name])
  args_1.extend(args)
  
  return call_wsadmin(args_1)
  
def get_wsadmin_script():
  was_admin = ""
  if os.name == "nt":
    was_admin = was_insall_path + "/bin/wsadmin.bat"
  else:
    was_admin = was_insall_path + "/bin/wsadmin.sh"
  return was_admin
  
def copy_config_file(src, dest):
  #remove the existing file
  if(os.path.exists(dest)):
    logging.info("Removing the existing " + dest)
    os.remove(dest)
  
  shutil.copyfile(src, dest)

def install():
  r = uninstall_ear()
  if not r:
    logging.info("Failed to un-install the application.")
    sys.exit(-1)
  
  data_dir = get_data_dir()
  if data_dir:
    p = data_dir + "/FileViewer/config/proxy.json"
    logging.info("Removing the configuration file " + p)
    os.remove(p)
  
if __name__ == "__main__":
  if len(sys.argv) < 10:
    print 'Invalid arguments'
  
  build_dir = sys.argv[1].strip()
  was_insall_path = sys.argv[2].strip()
  user_name = sys.argv[3].strip()
  password = sys.argv[4].strip()
  scope = sys.argv[5].strip()
  scope_name = sys.argv[6].strip()
  node_name = sys.argv[7].strip()
  soap_port = sys.argv[8].strip()
  map_webserver = sys.argv[9].strip()
  
  app_name = "ViewerAutomationSrv"
  
  _init_log()
  #pdb.set_trace()
  install()