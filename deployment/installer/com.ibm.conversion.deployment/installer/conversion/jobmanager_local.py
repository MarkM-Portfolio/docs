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
import conversion.install_node
import conversion.uninstall_node
import conversion.upgrade_node

from common import command, CFG, TASK_DIRECTORY, call_wsadmin

class LocalJobManager(command.Command):

  def __init__(self):
    pass

  def do(self):
    conversion.install_node.install()    
    return True

  def undo(self):
    conversion.uninstall_node.uninstall()
    return True

  def do_upgrade(self):
    conversion.upgrade_node.upgrade()
    return True

  def undo_upgrade(self):
    return True