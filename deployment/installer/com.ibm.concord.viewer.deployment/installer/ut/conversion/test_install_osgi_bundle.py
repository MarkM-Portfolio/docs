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

class TestInstallOSGIBundle(unittest.TestCase):

  def setUp(self):
    curr_dir = sys.path[0]
    os.chdir(curr_dir + "/../../")


  def testInstallSymphony(self):
    from conversion import install_osgi_bundle
    iob = install_osgi_bundle.InstallOSGIBundle()

    self.assertTrue(iob.precheck())
    self.assertTrue(iob.do())
    self.assertTrue(iob.postcheck())
    self.assertTrue(iob.undo())
    self.assertTrue(iob.do())
    self.assertTrue(iob.postcheck())
    self.assertTrue(iob.undo())


if __name__ == "__main__":
  unittest.main()


