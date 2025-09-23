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


import os
import logging
import shutil
import sys
import platform
import subprocess
from stat import *

from common import command, CFG, ZipCompat

class InstallVcredist(command.Command):
    
    def __init__(self):
        pass

    def do(self):
        logging.info('Start to install Visual C++ 2013 Redistributable Package...') 
               
        if os.name == 'nt':
            exe_name = 'vcredist2013_x86.exe'
            
        else:
            logging.info('''For linux platform, don't install VC++ 2013 Redistributable Package.''')
            return True
        
        file_path =os.path.join(os.path.abspath(CFG.get_build_dir()),'installer',exe_name)
       
        #check if vc file exists
        if not os.path.exists(file_path):
            logging.error('Can not find %s , ignore this step.' % file_path)
            return False
       
        install_log = os.path.join(CFG.get_logs_dir(),'vcredist.log')
        logging.info('installation log is %s' % install_log)

        cmd = ' '.join([file_path,'/q','/norestart','/log',install_log]) # silent mode
        
        p = subprocess.Popen(cmd)
        p.wait()

        logging.info('Visual C++ 2010 Redistributable Package installation complete')
        return True
        
    def undo(self):

        logging.info('Start to uninstall Visual C++ 2010 Redistributable Package... ')
                
        logging.info('Keep this package after uninstallation in case other software needs it')
        return True

    def precheck(self):
        return True

    def postcheck(self):
        return True

    def readCfg(self, cfg=None):
        return True

    def __getOSBit(self):
        if os.name == 'nt' and sys.version_info[:2] < (2,7):
            machine_type = os.environ.get("PROCESSOR_ARCHITEW6432",
                    os.environ.get('PROCESSOR_ARCHITECTURE', ''))
        else:
            machine_type = platform.machine()

        machine2bits = {'AMD64': 'x64', 'x86_64': 'x64', 'i386': 'x86', 'x86': 'x86'}
        return machine2bits.get(machine_type, None)

            
        



        
        

