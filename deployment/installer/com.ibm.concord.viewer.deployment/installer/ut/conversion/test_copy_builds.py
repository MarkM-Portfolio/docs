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

class TestCopyBuilds(unittest.TestCase):

  def setUp(self):
    curr_dir = sys.path[0]
    os.chdir(curr_dir + "/../../")


  def testCopyBuilds(self):
    from conversion import copy_builds
    ism = copy_builds.CopyBuilds()

    self.assertTrue(ism.precheck())
    self.assertTrue(ism.do())
    self.assertTrue(ism.postcheck())
    self.assertTrue(ism.undo())


if __name__ == "__main__":
  unittest.main()


