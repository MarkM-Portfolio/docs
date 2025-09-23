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
from common.commands.jobmanager_remote import RemoteJobManager
from .jobmanager_local import LocalJobManager
from common import command, CFG

class JobManagerAdapter(command.Command):
  
  def __init__(self):
    servers, clusters = CFG.prepare_scope()
    if servers or CFG.get_non_job_mgr_mode().lower()=='true':
      self.worker = LocalJobManager()
    else:
      self.worker = RemoteJobManager()
      
  def do(self): 
    return self.worker.do()

  def undo(self):
    return self.worker.undo()
  
  def do_upgrade(self):
    return self.worker.do_upgrade()

  def undo_upgrade(self):
    return self.worker.undo_upgrade()