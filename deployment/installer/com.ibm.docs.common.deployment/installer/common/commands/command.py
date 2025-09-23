# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# HCL Docs Source Materials
#
# Copyright HCL Technologies Limited 2012, 2022
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

import os, sys
import logging
import traceback

from common import TASK_DIRECTORY, CFG

class Command:

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    pass

  def precheck(self):
    """precheck actions for this command"""
    return True

  def postcheck(self):
    """not every command need postcheck"""
    return True

  def do(self):
    """execute this command"""
    return True

  def undo(self):
    """rollback changes for this command"""
    return True

  def do_upgrade(self):
    """execute the upgrade command"""
    #raise Exception(self.__class__.__name__ + " do_upgrade() function is not implemented.")
    return True

  def undo_upgrade(self):
    """rollback update changes for this command"""
    #raise Exception(self.__class__.__name__ + " undo_upgrade() function is not implemented.")
    return True

  def call_task(self, task_name, args):
    from common import call_wsadmin
    from common import CFG

    args_1 = CFG.get_was_cmd_line()
    args_1.extend(["-f", TASK_DIRECTORY + task_name])
    args_1.extend(args)

    return call_wsadmin(args_1)


  def call_common_task(self, task_name, args):
    from common import call_wsadmin
    from common import CFG

    args_1 = CFG.get_was_cmd_line()
    args_1.extend(["-f", './common_jython/tasks/' + task_name])
    args_1.extend(args)

    return call_wsadmin(args_1)


# load command list from a module
# the module must define a "commands" list
def load_commands(module_name):
  __import__(module_name)
  cmd_list = getattr(sys.modules[module_name], "commands")
  return cmd_list

def filter_commands (cmd_list, filter_func):
  new_cmd_list = []
  for c in cmd_list:
    if filter_func(c):
      new_cmd_list.append(c)
  return new_cmd_list

# perform precheck of a command, throw exception if fails
def _precheck(cmd, cmd_instance):
  logging.debug(">>>>entering " + cmd["class"] + ".precheck")
  res = cmd_instance.precheck()
  if not res:
    raise Exception("Precheck failed for command: " + str(cmd))
  logging.debug("<<<<exiting " + cmd["class"] + ".precheck")

# perform postcheck of a command, throw exception if fails
def _postcheck(cmd, cmd_instance):
   logging.debug(">>>>entering " + cmd["class"] + ".postcheck")
   res = cmd_instance.postcheck()
   if not res:
     raise Exception("Execution failed for command: " + str(cmd))
   logging.debug("<<<<exiting " + cmd["class"] + ".postcheck")

# perform do of a command, throw exception if fails
def _do(cmd, cmd_instance):
   logging.debug(">>>>entering " + cmd["class"] + ".do")
   res = cmd_instance.do()
   if not res:
     raise Exception("Do failed for command: " + str(cmd))
   logging.debug("<<<<exiting " + cmd["class"] + ".do")

# perform undo of a command, throw exception if fails
def _undo(cmd, cmd_instance):
   logging.debug(">>>>entering " + cmd["class"] + ".undo")
   res = cmd_instance.undo()
   if not res:
     raise Exception("Undo failed for command: " + str(cmd))
   logging.debug("<<<<exiting " + cmd["class"] + ".undo")

# perform do_upgrade of a command, throw exception if fails
def _do_upgrade(cmd, cmd_instance):
   logging.debug(">>>>entering " + cmd["class"] + ".do_upgrade")
   res = cmd_instance.do_upgrade()
   if not res:
     raise Exception("Do upgrade failed for command: " + str(cmd))
   logging.debug("<<<<exiting " + cmd["class"] + ".do_upgrade")

# perform undo_upgrade of a command, throw exception if fails
def _undo_upgrade(cmd, cmd_instance):
   logging.debug(">>>>entering " + cmd["class"] + ".undo_upgrade")
   res = cmd_instance.undo_upgrade()
   if not res:
     raise Exception("Undo upgrade failed for command: " + str(cmd))
   logging.debug("<<<<exiting " + cmd["class"] + ".undo_upgrade")

# read command specific config from command list definition file
def _readCfg(cmd, cmd_instance):
  logging.debug(">>>>entering " + cmd["class"] + ".readCfg")
  if "cfg" in cmd and cmd["cfg"]:
    cmd_instance.readCfg(cmd["cfg"])
  else:
    cmd_instance.readCfg()
  logging.debug("<<<<exiting " + cmd["class"] + ".readCfg")

# reverse:
#   False, execute the command in order to perform do operation
#   True, execute the command in reverse order to perform undo operation
# force:
#   False, exit executing others if one fails
#   True, continue executing others if one fails
# upgrade:
#   False, execute the install command
#   True, execute the upgrade command
# return:
#   (roll_cmds, erro_cmds)
#   roll_cmds, command list that should rollback if failed
#   erro_cmds, command list that failed to execute
def exec_commands(cmd_list, reverse=False, force=False, mapwebserver=False,upgrade=False):
# def exec_commands(cmd_list, reverse=False, force=False, upgrade=False):
  roll_cmds = []
  erro_cmds = []
  order_list = []
  order_list.extend(cmd_list)
  if reverse:
    order_list.reverse()

  for cmd in order_list:
    if "isEnabled" in cmd and cmd['isEnabled'] == False and cmd['class'] != 'docs.install_app.Map2WebServer':
      continue
    if cmd['class'] == 'docs.install_app.Map2WebServer' and mapwebserver == False:
      continue
#    if cmd.has_key("isEnabled") and cmd['isEnabled'] == False:
#      continue
    if 'isEnabledFunc' in cmd and not cmd['isEnabledFunc']():
      continue
    module_name = ".".join(cmd["class"].rsplit(".")[:-1])
    class_name = cmd["class"].rsplit(".")[-1]
    cmd_instance = None
    try:
      cancel_marker_path = os.path.join(CFG.get_install_root(), '../', 'imcanceled' )
      if os.path.isfile( cancel_marker_path ):
        os.remove(cancel_marker_path)
        raise Exception('User canceled from IM')
      # instantiate command instance
      __import__(module_name)
      cmd_instance = getattr(sys.modules[module_name], class_name)()
      logging.info('-->IM:' + class_name)
      cmd_instance.settings = cmd_list
      cmd_instance.cmd = cmd

      # read command specific config from command list definition file
      _readCfg(cmd, cmd_instance)

      if not reverse:
        # precheck
        _precheck(cmd, cmd_instance)
        # do
        if upgrade:
          _do_upgrade(cmd, cmd_instance)
        else:
          _do(cmd, cmd_instance)
        roll_cmds.append(cmd_instance)
        # postcheck
        _postcheck(cmd, cmd_instance)
      else:
        # postcheck
        _postcheck(cmd, cmd_instance)
        # undo
        if upgrade:
          _undo_upgrade(cmd, cmd_instance)
        else:
          _undo(cmd, cmd_instance)
        roll_cmds.append(cmd_instance)
        # precheck
        _precheck(cmd, cmd_instance)
    except Exception as e:
      logging.info( "Exception: " + str(e))
      erro_cmds.append(cmd)
      if "isAtomCmd" in cmd and cmd["isAtomCmd"] == False:
      	if cmd_instance:
          roll_cmds.append(cmd_instance)
      if not force:
        break

  return (roll_cmds, erro_cmds)

def rollback_commands(cmds, force=False, upgrade=False):
  erro_cmds = []

  while len(cmds) != 0:
    cmd = None
    try:
      cmd_instance = cmds.pop()
      logging.info('-->IM:Rollback ' + cmd_instance.cmd["class"].rsplit(".")[-1])
      cmd = cmd_instance.cmd
      # postcheck
      _postcheck(cmd, cmd_instance)
      # undo
      if upgrade:
        _undo_upgrade(cmd, cmd_instance)
      else:
        _undo(cmd, cmd_instance)
      # precheck
      _precheck(cmd, cmd_instance)
    except Exception as e:
      logging.exception(e)
      if cmd:
        erro_cmds.append(cmd)
      if not force:
        break

  return erro_cmds
