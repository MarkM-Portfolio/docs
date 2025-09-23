# -*- encoding: utf8 -*
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

from common import command, CFG, call_wsadmin
import logging as log
import socket

class AddScheduler(command.Command):

  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    pass

  def do(self):
    """install scheduler for HCL Docs Server"""
    log.info("Start to install scheduler for HCL Docs Server")

    if CFG.get_software_mode().lower() == 'sc' and CFG.get_housekeeping_owner_hostname().strip() != "":
      owner_short_hostname = CFG.get_housekeeping_owner_hostname().split(".")[0]
      local_short_hostname = socket.gethostname().split(".")[0]
      log.info("HouseKeeping scheduler for HCL Docs Server configuration is [owner: %s, local: %s]" % (owner_short_hostname, local_short_hostname))
      if owner_short_hostname != local_short_hostname:
        log.info("Skip to install scheduler for HCL Docs Server")
        return True

    # wasadmin command line arguments
    args = CFG.get_was_cmd_line()
    args.extend(["-f", "./docs/tasks/" + __name__.split(".")[1] + ".py"])
    args.extend([CFG.get_scope_full_name()])
    args.extend(["HouseKeeping"]) # TODO
    args.extend(["com/ibm/concord/house_keeping_scheduler"]) # TODO
    args.extend(["com/ibm/concord/datasource"]) # TODO
    args.extend(["CONCORDDB.HK"]) # TODO
    args.extend(["30"]) # TODO
    args.extend(["com/ibm/concord/workmanager"]) # TODO

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Install scheduler for HCL Docs Server completed")
    return True

  def undo(self):
    """uninstall scheduler for HCL Docs Server"""
    log.info("Start to uninstall scheduler for HCL Docs Server")

    # wasadmin command line arguments
    args = CFG.get_was_cmd_line()
    args.extend(["-f", "./docs/tasks/undo_" + __name__.split(".")[1] + ".py"])
    args.extend([CFG.get_scope_full_name()])
    args.extend(["HouseKeeping"]) # TODO

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Uninstall scheduler for HCL Docs Server completed")
    return True
