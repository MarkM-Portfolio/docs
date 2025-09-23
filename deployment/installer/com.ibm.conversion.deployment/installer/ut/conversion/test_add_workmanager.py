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

class TestAddWorkManager(unittest.TestCase):

  def setUp(self):
    curr_dir = sys.path[0]
    pack_root = os.path.abspath(curr_dir + "/../../")
    sys.path.append(pack_root)
    #os.chdir(curr_dir + "/../../")
    print "##################"
    print sys.path

  def testAddWorkManager(self):
    print os.getcwd()

    from conversion import add_workmanager
    awm = add_workmanager.AddWorkManager()
    cfg = {}
    cfg['alarm_threads'] = '2'
    cfg['min_threads'] = '5'
    cfg['max_threads'] = '50'
    cfg['thread_prio'] = '5'
    cfg['workTimeout'] = '60000'
    cfg['workReqQSize'] = '70'
    cfg['workReqQFullAction'] = '0'
    cfg['isGrowable'] = 'true'

    awm.readCfg(cfg)
    self.assertTrue(awm.precheck())
    awm.do()
    self.assertTrue(awm.undo())
    self.assertTrue(awm.do())
    self.assertTrue(awm.undo())
    self.assertTrue(awm.postcheck())


if __name__ == "__main__":
  unittest.main()


