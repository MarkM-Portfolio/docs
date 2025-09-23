import os, stat
import shutil
import logging
import tarfile
import subprocess
import time
from config import CONFIG
from util import ZipCompat

OOo_Prefix = "OOo_"
W32_Key = "W32x86"
CRONTABME_FILENAME = "crontabme"
CRONTABBAK_FILENAME = "crontab_bak"
MONITOR_DEST = "sym_monitor"
SCHTASK_FILENAME = "start_task.bat"
END_SCHTASK_FILENAME = "end_task.bat"
KILL_SYM_SH = "./kill_sym.sh"
class UpgradeSymphony():
  
  def __init__(self):
    self.root = os.path.join(CONFIG.install_root,'symphony')
    self.build = CONFIG.build_root
    self.count = int(CONFIG.sym_count)
    logging.info("Symphony count is " + str(self.count))
    self.monitor_dest = os.path.join(self.root, MONITOR_DEST)
    self.backup_dir = os.path.join(CONFIG.backup_dir, 'symphony')
    self.binary_w32 = None
    self.binary_lnx = None
    for f in os.listdir(self.build):
      if f.find(OOo_Prefix) > -1:
        if f.find(W32_Key) > -1:
          self.binary_w32 = self.build + os.sep + f
          logging.debug("Symphony binary for windows located: " + self.binary_w32)
        else:
          self.binary_lnx = self.build + os.sep + f
          logging.debug("Symphony binary for linux located: " + self.binary_lnx)
    
  def _lnx(self, inst_path):
    sym_tar = tarfile.open(self.binary_lnx,"r:gz")
    for tarinfo in sym_tar:
      sym_tar.extract(tarinfo,inst_path)
    sym_tar.close()

    # delete OOo* directory, and move sub directory to uppler level
    # inst1/
    #   OOo_2.0.0_xxx_unxlngi6_install/
    #     openoffice.org/
    #     ibm_lotus_symphony2/
    OOo_dir = inst_path + os.sep + os.listdir(inst_path)[0]
    for sub_dir in os.listdir(OOo_dir):
      shutil.move(OOo_dir + os.sep + sub_dir, inst_path + os.sep + sub_dir)
    shutil.rmtree(OOo_dir)  
  
  def _w32(self, inst_path):
    zip_file = ZipCompat(self.binary_w32)
    zip_file.extractall(inst_path)
    
    # delete OOo* directory, and move sub directory to uppler level
    # inst1/
    #   OOo_2.0.0_xxx_W32x86_install/
    #     IBM Lotus Symphony 2/
    OOo_dir = inst_path + "/" + os.listdir(inst_path)[0]
    for sub_dir in os.listdir(OOo_dir):
      shutil.move(OOo_dir + os.sep + sub_dir, inst_path + os.sep + sub_dir.replace(" ", "_"))
    shutil.rmtree(OOo_dir)
 
  def config_sym_warning_log(self,instance_path):
    if os.name == 'nt':
      soffice_path = os.path.join(instance_path,'IBM_Lotus_Symphony_2','program')
      soffice_backup_path = os.path.join(self.backup_dir,'inst0','IBM_Lotus_Symphony_2','program')
    else:
      soffice_path = os.path.join(instance_path,'ibm_lotus_symphony2','program')
      soffice_backup_path = os.path.join(self.backup_dir,'inst0','ibm_lotus_symphony2','program')
    if os.path.exists(os.path.join(soffice_backup_path, 'limit_cfg.ini')):
      shutil.copy(os.path.join(soffice_backup_path, 'limit_cfg.ini'), soffice_path)
    if os.path.exists(os.path.join(soffice_backup_path, 'wl4docx.txt')):
      shutil.copy(os.path.join(soffice_backup_path, 'wl4docx.txt'), soffice_path)
    if os.path.exists(os.path.join(soffice_backup_path, 'wl4pptx.txt')):
      shutil.copy(os.path.join(soffice_backup_path, 'wl4pptx.txt'), soffice_path)
    if os.path.exists(os.path.join(soffice_backup_path, 'wl4xlsx.txt')):
      shutil.copy(os.path.join(soffice_backup_path, 'wl4xlsx.txt'), soffice_path)    
  
  def ins_bin(self):   
    for i in range(self.count):
      inst_i = self.root + os.sep + "inst" + str(i)
      logging.info("Installing symphony binaries for instance " + str(i) + " in " + inst_i)
      os.makedirs(inst_i)
      if os.name == "nt":
        self._w32(inst_i)
      else:
        self._lnx(inst_i)
      self.config_sym_warning_log(inst_i)   

  def kill_sym(self):
    logging.info("Stopping all the soffice processes")          
    if os.name == "nt":
      subprocess.call(["taskkill", "/f", "/im", "soffice.bin", "/t"])        
      logging.debug("Waiting 10s after killing soffice.exe to remove DLL successfully")
    else:
      os.chmod(KILL_SYM_SH, stat.S_IRWXU|stat.S_IRWXG)
      subprocess.call([KILL_SYM_SH])
    time.sleep(10)
    logging.info("All the soffice processes stopped")

  def do_upgrade(self):
    if self.binary_w32 and os.name == "nt" or self.binary_lnx and os.name != "nt" :
      self.upgrade()
    else:
      logging.info('No need to upgrade symphony')
    return True
  
  def upgrade(self):
    logging.info('Start to upgrade symphony, uninstall and reinstall it...')        
    # remove the old binaries
    if os.path.exists(self.backup_dir):
      shutil.rmtree(self.backup_dir, True) 
    # create a new folder
    os.makedirs(self.backup_dir)
    # end and delete task scheduler
    if os.name == 'nt':
      self.end_delete_task()   
    else:
      self.linux_undo()
    # kill all soffice.exe
    self.kill_sym()    
    # backup the old sym folder
    for i in range(self.count):
      inst_i = self.root + os.sep + "inst" + str(i)
      if(os.path.exists(inst_i)):
        shutil.move(inst_i, self.backup_dir)       	          
    # install symphony
    self.ins_bin()   
    #run start_task.bat
    if os.name == 'nt':  
      self.start_run_task()
    else:
      crontabme_path = os.path.join(self.monitor_dest, CRONTABME_FILENAME)
      if os.path.exists(crontabme_path):
        subprocess.call(["crontab", crontabme_path])    
    logging.info('Finish to upgrade symphony')
  
  def start_run_task(self):
    start_sctask_path = os.path.join(self.monitor_dest, SCHTASK_FILENAME)
    logging.info("run start_task.bat from " + start_sctask_path)
    # start_sctask_path
    if os.path.exists(start_sctask_path):
      subprocess.call([start_sctask_path])
    
  def end_delete_task(self):
    end_sctask_path = os.path.join(self.monitor_dest, END_SCHTASK_FILENAME)
    logging.info("run end_task.bat from " + end_sctask_path)
    # end_sctask_path
    if os.path.exists(end_sctask_path):
      subprocess.call([end_sctask_path])
  
  def linux_undo(self):
    logging.info("Removing monitor tools from cron table")
    crontab_bak_path = os.path.join(self.monitor_dest, CRONTABBAK_FILENAME)
    crontabme_path = os.path.join(self.monitor_dest, CRONTABME_FILENAME)
    #get current crontab list
    crontab_list = self.get_crontab_list()
    crontab_bak_file = open(crontab_bak_path, "w")
    crontabme_file = open(crontabme_path, "w")
    for line in crontab_list:
      crontabme_file.write(line + "\n")
      if self.monitor_dest not in line:
        crontab_bak_file.write(line + "\n")    
    crontab_bak_file.close()
    crontabme_file.close()
    if os.path.exists(crontab_bak_path):
      subprocess.call(["crontab", crontab_bak_path])  
  
  def get_crontab_list(self):
    cmd = ["crontab","-l"]
    p = subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    out = p.communicate()[0]
    lines = self._splitlines(out)
    return lines
  
  def _splitlines(self,s):
    rv = [s]
    if '\r' in s:
      rv = s.split('\r\n')
    elif '\n' in s:
      rv = s.split('\n')
    if rv[-1] == '':
      rv = rv[:-1]
    return rv 
          
  def undo_upgrade(self):
    logging.info('Start to undo upgrade symphony...')  
    
    # stop and delete task scheduler
    if os.name == 'nt':
      self.end_delete_task()
    
    # kill all soffice.exe
    self.kill_sym()
        
    # remove the latest content in sym folder
    # backup the old sym folder
    if os.path.exists(self.root):
      for f in os.listdir(self.root):
        if f.startswith("inst"):
      	  shutil.rmtree(self.root + os.sep + f)  
         
    # copy old content from backup folder to current folder
    if os.path.exists(self.backup_dir):
      for f in os.listdir(self.backup_dir):
        shutil.copytree(self.backup_dir + os.sep + f, self.root)
    if os.name == 'nt':    
      self.start_run_task()
            
    logging.info('Finish to undo upgrade symphony and task scheduler...')
UpgradeSymphony = UpgradeSymphony()