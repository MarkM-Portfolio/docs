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

class TestStopServer(unittest.TestCase):

  def setUp(self):
    curr_dir = sys.path[0]
    os.chdir(curr_dir + "/../../")

  def testStopServer(self):
    from common import stop_server
    ss = stop_server.StopServer()
    self.assertTrue(ss.precheck())
    self.assertTrue(ss.do())
    self.assertTrue(ss.postcheck())
    self.assertTrue(ss.undo())

if __name__ == "__main__":
  unittest.main()


