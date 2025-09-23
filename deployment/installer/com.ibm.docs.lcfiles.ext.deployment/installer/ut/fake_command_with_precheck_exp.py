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

from common import command

class FakeCommandWithPreCheckExp(command.Command):

  def readCfg(self, cfg=None):
    self.settings[0]["actual"] += "G1"

  def precheck(self):
    self.settings[0]["actual"] += "G2"
    raise Exception("PreCheck Exception")
    return True

  def do(self):
    self.settings[0]["actual"] += "G3"
    return True

  def postcheck(self):
    self.settings[0]["actual"] += "G4"
    return True

  def undo(self):
    self.settings[0]["actual"] += "G5"
    return True
