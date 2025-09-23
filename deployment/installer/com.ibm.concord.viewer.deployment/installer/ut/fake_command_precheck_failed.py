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

class FakeCommandPreCheckFailed(command.Command):

  def readCfg(self, cfg=None):
    self.settings[0]["actual"] += "B1"

  def precheck(self):
    self.settings[0]["actual"] += "B2"
    return False

  def do(self):
    self.settings[0]["actual"] += "B3"
    return True

  def postcheck(self):
    self.settings[0]["actual"] += "B4"
    return True

  def undo(self):
    self.settings[0]["actual"] += "B5"
    return True
