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

class TestSetEnv(unittest.TestCase):

  def setUp(self):
    curr_dir = sys.path[0]
    os.chdir(curr_dir + "/../../")

  def testSetEnv(self):
    from conversion import set_env
    ss = set_env.SetEnv()
    self.assertTrue(ss.precheck())
    self.assertTrue(ss.do())
    self.assertTrue(ss.postcheck())
    self.assertTrue(ss.undo())

if __name__ == "__main__":
  unittest.main()


