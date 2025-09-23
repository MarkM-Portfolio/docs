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

class FakeCommandWithPostCheckExp(command.Command):

  def readCfg(self, cfg=None):
    self.settings[0]["actual"] += "I1"

  def precheck(self):
    self.settings[0]["actual"] += "I2"
    return True

  def do(self):
    self.settings[0]["actual"] += "I3"
    return True

  def postcheck(self):
    self.settings[0]["actual"] += "I4"
    raise Exception("PostCheck Exception")
    return True

  def undo(self):
    self.settings[0]["actual"] += "I5"
    return True
