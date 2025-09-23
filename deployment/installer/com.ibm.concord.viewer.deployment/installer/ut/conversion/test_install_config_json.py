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

import os,sys
import unittest

class TestInstallConfigJson(unittest.TestCase):

  def setUp(self):
    curr_dir = sys.path[0]
    os.chdir(curr_dir + "/../../")

  def testInstallConfigJson(self): 
    from conversion import install_config_json
    icj = install_config_json.InstallConfigJson()
    self.assertTrue(icj.precheck())
    self.assertTrue(icj.do())
    self.assertTrue(icj.undo())
    self.assertTrue(icj.postcheck())
    self.assertTrue(icj.do())
    self.assertTrue(icj.undo())
    self.assertTrue(icj.postcheck())


if __name__ == "__main__":
  unittest.main()


