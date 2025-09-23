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

class TestTuneJVM(unittest.TestCase):

  def setUp(self):
    pass
    #curr_dir = sys.path[0]
    #os.chdir(curr_dir + "/../../")
    #print sys.path[0]

  def testTuneJVM(self):
    from viewer import tune_jvm
    ss = tune_jvm.TuneJVM()
    self.assertTrue(ss.precheck())
    #self.assertTrue(ss.do())
    self.assertTrue(ss.postcheck())
    self.assertTrue(ss.undo())

if __name__ == "__main__":
  unittest.main()
