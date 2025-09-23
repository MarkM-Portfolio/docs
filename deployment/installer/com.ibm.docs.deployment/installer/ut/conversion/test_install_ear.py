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

class TestInstallEar(unittest.TestCase):

  def setUp(self):
    curr_dir = sys.path[0]
    os.chdir(curr_dir + "/../../")

  def testInstallEar(self):
    from conversion import install_ear
    ss = install_ear.InstallEar()
    self.assertTrue(ss.precheck())
    #self.assertTrue(ss.do())
    self.assertTrue(ss.postcheck())
    self.assertTrue(ss.undo())

if __name__ == "__main__":
  unittest.main()


