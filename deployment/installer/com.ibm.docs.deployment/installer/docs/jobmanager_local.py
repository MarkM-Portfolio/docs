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

import os, sys, fileinput, subprocess, getpass, shutil
import logging, tempfile, zipfile
import docs.install_node
import docs.uninstall_node
import docs.upgrade_node

from common import command, CFG, TASK_DIRECTORY, call_wsadmin

class LocalJobManager(command.Command):

  def __init__(self):
    pass

  def do(self):
    docs.install_node.install()
    return True

  def undo(self):
    docs.uninstall_node.uninstall()
    return True

  def do_upgrade(self):
    docs.upgrade_node.upgrade()
    return True

  def undo_upgrade(self):
    return True