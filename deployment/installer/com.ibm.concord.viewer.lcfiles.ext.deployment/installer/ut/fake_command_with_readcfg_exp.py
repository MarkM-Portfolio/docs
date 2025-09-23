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
from commands import command

class FakeCommandWithReadCfgExp(command.Command):

  def readCfg(self, cfg=None):
    self.settings[0]["actual"] += "F1"
    raise Exception("ReadCfg Exception")

  def precheck(self):
    self.settings[0]["actual"] += "F2"
    return True

  def do(self):
    self.settings[0]["actual"] += "F3"
    return True

  def postcheck(self):
    self.settings[0]["actual"] += "F4"
    return True

  def undo(self):
    self.settings[0]["actual"] += "F5"
    return True
