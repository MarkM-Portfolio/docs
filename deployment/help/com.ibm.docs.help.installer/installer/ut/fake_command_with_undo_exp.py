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

class FakeCommandWithUndoExp(command.Command):

  def readCfg(self, cfg=None):
    self.settings[0]["actual"] += "J1"

  def precheck(self):
    self.settings[0]["actual"] += "J2"
    return True

  def do(self):
    self.settings[0]["actual"] += "J3"
    return True

  def postcheck(self):
    self.settings[0]["actual"] += "J4"
    return True

  def undo(self):
    self.settings[0]["actual"] += "J5"
    raise Exception("Undo Exception")
    return True
