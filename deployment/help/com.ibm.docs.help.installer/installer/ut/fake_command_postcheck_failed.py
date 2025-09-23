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

from commands import command

class FakeCommandPostCheckFailed(command.Command):

  def readCfg(self, cfg=None):
    self.settings[0]["actual"] += "D1"

  def precheck(self):
    self.settings[0]["actual"] += "D2"
    return True

  def do(self):
    self.settings[0]["actual"] += "D3"
    return True

  def postcheck(self):
    self.settings[0]["actual"] += "D4"
    return False

  def undo(self):
    self.settings[0]["actual"] += "D5"
    return True
