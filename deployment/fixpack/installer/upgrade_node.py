import os.path
import sys
import shutil
import logging
import json
from config import CONFIG
from upgrade_node_sym import UpgradeSymphony
from upgrade_node_stellent import UpgradeStellent
from upgrade_node_native import UpgradeNativeFiles
finish_status = {'status': -1, 'action': 'Upgrade'}
VCREDIST2013_X86_EXE = "vcredist2013_x86.exe"  
def upgrade():
  result = 1
  try:
    installer_dir = os.path.join(CONFIG.install_root, "installer")
    vcredist2013_x86_dest = os.path.join(installer_dir, VCREDIST2013_X86_EXE)
    if os.path.exists(VCREDIST2013_X86_EXE) and os.path.exists(installer_dir) and not os.path.exists(vcredist2013_x86_dest):
      shutil.move(VCREDIST2013_X86_EXE, vcredist2013_x86_dest)
    if UpgradeSymphony.do_upgrade() and UpgradeStellent.do_upgrade() and UpgradeNativeFiles.do_upgrade():
      finish_status['status'] = 0
      result = 0
      if os.path.exists(CONFIG.backup_dir):
        logging.info("Romove backup directory...")
        shutil.rmtree(CONFIG.backup_dir)
      logging.info("Upgrade successfully")
    else:
      UpgradeSymphony.undo_upgrade()
      UpgradeStellent.undo_upgrade()
      UpgradeNativeFiles.undo_upgrade()
  except Exception, e:
    logging.info(e)
  finally:
    write_status(finish_status, CONFIG.finish_status_file_name)
    sys.exit(result)
def write_status (status, path):
  to_json_file = open( path, 'w')
  json.dump( status, to_json_file, indent=2 )
  to_json_file.close()
if __name__ == "__main__":
  upgrade()