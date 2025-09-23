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

class FakeCommandDoFailed(command.Command):

  def readCfg(self, cfg=None):
    self.settings[0]["actual"] += "C1"

  def precheck(self):
    self.settings[0]["actual"] += "C2"
    return True

  def do(self):
    self.settings[0]["actual"] += "C3"
    return False

  def postcheck(self):
    self.settings[0]["actual"] += "C4"
    return True

  def undo(self):
    self.settings[0]["actual"] += "C5"
    return True
