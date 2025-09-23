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

# -*- encoding: utf8 -*-

import logging as log

from commands.command import *
from ut.settings import *

#logging.basicConfig(level=logging.WARNING, format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',datefmt='%m-%d %H:%M',)

def install(cmd_list):
  roll_list, erro_list = exec_commands(cmd_list, False, False)

  if len(erro_list) == 0:
    logging.info("Installation completed successfully.")
    return

  logging.error("Error while executing command, now rollback previous changes...")

  # undo changes in reverse order, force all commands being executed, even if one fail
  roll_list.insert(0, cmd_list[0])
  roll_list2, erro_list2 = exec_commands(roll_list, True, True)

  if len(erro_list2) == 0:
    logging.info("Rollback successfully.")
  else:
    logging.error("Rollback failed for commands: " + str(erro_list2))

def self_check():
  install(ut_commands_00)
  if (ut_commands_00[0]["expected"] != ut_commands_00[0]["actual"]):
    raise Exception("ut_commands_00 sefl-check failed.", ut_commands_00[0]["expected"], ut_commands_00[0]["actual"])

  install(ut_commands_01)
  if (ut_commands_01[0]["expected"] != ut_commands_01[0]["actual"]):
    raise Exception("ut_commands_01 sefl-check failed.", ut_commands_01[0]["expected"], ut_commands_01[0]["actual"])

  install(ut_commands_02)
  if (ut_commands_02[0]["expected"] != ut_commands_02[0]["actual"]):
    raise Exception("ut_commands_02 sefl-check failed.", ut_commands_02[0]["expected"], ut_commands_02[0]["actual"])

  install(ut_commands_03)
  if (ut_commands_03[0]["expected"] != ut_commands_03[0]["actual"]):
    raise Exception("ut_commands_03 sefl-check failed.", ut_commands_03[0]["expected"], ut_commands_03[0]["actual"])

  install(ut_commands_04)
  if (ut_commands_04[0]["expected"] != ut_commands_04[0]["actual"]):
    raise Exception("ut_commands_04 sefl-check failed.", ut_commands_04[0]["expected"], ut_commands_04[0]["actual"])

  install(ut_commands_05)
  if (ut_commands_05[0]["expected"] != ut_commands_05[0]["actual"]):
    raise Exception("ut_commands_05 sefl-check failed.", ut_commands_05[0]["expected"], ut_commands_05[0]["actual"])

  install(ut_commands_06)
  if (ut_commands_06[0]["expected"] != ut_commands_06[0]["actual"]):
    raise Exception("ut_commands_06 sefl-check failed.", ut_commands_06[0]["expected"], ut_commands_06[0]["actual"])

  install(ut_commands_07)
  if (ut_commands_07[0]["expected"] != ut_commands_07[0]["actual"]):
    raise Exception("ut_commands_07 sefl-check failed.", ut_commands_07[0]["expected"], ut_commands_07[0]["actual"])

  install(ut_commands_08)
  if (ut_commands_08[0]["expected"] != ut_commands_08[0]["actual"]):
    raise Exception("ut_commands_08 sefl-check failed.", ut_commands_08[0]["expected"], ut_commands_08[0]["actual"])

  install(ut_commands_09)
  if (ut_commands_09[0]["expected"] != ut_commands_09[0]["actual"]):
    raise Exception("ut_commands_09 sefl-check failed.", ut_commands_09[0]["expected"], ut_commands_09[0]["actual"])

if __name__ == "__main__":
  log.info("************************************* UT Started *************************************")
  self_check()
  log.info("************************************* UT Finished *************************************")
  print "Conguratulation, All UT Passed Successfully."

