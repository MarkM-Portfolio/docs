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


import os,sys
import unittest

class TestInstallMonitor(unittest.TestCase):

  def setUp(self):
    curr_dir = sys.path[0]
    os.chdir(curr_dir + "/../../")

  def testInstallMonitor(self):
    from conversion import install_monitor
    im = install_monitor.InstallMonitor()

    self.assertTrue(im.precheck())
    self.assertTrue(im.do())
    self.assertTrue(im.postcheck())
    self.assertTrue(im.undo())
    self.assertTrue(im.do())
    self.assertTrue(im.postcheck())
    self.assertTrue(im.undo())

  
if __name__ == "__main__":
  unittest.main()


