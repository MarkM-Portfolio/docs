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

class FakeCommandWithDoExp(command.Command):

  def readCfg(self, cfg=None):
    self.settings[0]["actual"] += "H1"

  def precheck(self):
    self.settings[0]["actual"] += "H2"
    return True

  def do(self):
    self.settings[0]["actual"] += "H3"
    raise Exception("Do Exception")
    return True

  def postcheck(self):
    self.settings[0]["actual"] += "H4"
    return True

  def undo(self):
    self.settings[0]["actual"] += "H5"
    return True

