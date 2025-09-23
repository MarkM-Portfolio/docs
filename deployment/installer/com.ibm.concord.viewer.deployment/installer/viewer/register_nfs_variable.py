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
import platform
import subprocess

from commands import command

class RegisterNFS(command.Command):
    
    def __init__(self):
        pass

    def do(self):
        logging.info('Start to register NFS variable for Windows....') 
               
        if os.name != 'nt':
            logging.info('''For linux platform, skip this step.''')
            return True
        cmd0="REG ADD HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters.BAK /f"
        cmd1="REG ADD HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters /v FileInfoCacheLifetime /t REG_DWORD /d 0 /f"
        cmd2="REG ADD HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters /v FileNotFoundCacheLifetime /t REG_DWORD /d 0 /f"
        cmd3="REG ADD HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters /v DirectoryCacheLifetime /t REG_DWORD /d 0 /f"
        cmd4="REG COPY HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters.BAK /f"

        self.execute_reg_cmd(cmd0)
        self.execute_reg_cmd(cmd4)
        self.execute_reg_cmd(cmd1)
        self.execute_reg_cmd(cmd2)
        self.execute_reg_cmd(cmd3)
        logging.info('Register NFS variable for Windows completely..')
        return True
        
    def undo(self):
        logging.info('Start to remove nfs registry variable... ')
        if os.name != 'nt':
            logging.info('''For linux platform, skip this step.''')
            return True
        reg0="REG DELETE HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters /v FileInfoCacheLifetime /f"
        reg1="REG DELETE HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters /v FileNotFoundCacheLifetime /f"
        reg2="REG DELETE HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters /v DirectoryCacheLifetime /f"
        reg3="REG COPY HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters.BAK HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters /f"
        reg4="REG DELETE HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters.BAK /f"
        self.execute_reg_cmd(reg0)
        self.execute_reg_cmd(reg1)	
        self.execute_reg_cmd(reg2)
        self.execute_reg_cmd(reg3)
        self.execute_reg_cmd(reg4)		
        logging.info('Removed NFS variable from registry completely..')
        return True

    #Upgrade from 103 to 104,should do it.
    def do_upgrade(self):
        return self.do()
    
    def undo_upgrade(self):
        return True

    def execute_reg_cmd(self,cmd):
    	p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    	output = p.communicate()[0]
    	retval = p.returncode
    	#logging.info(retval)
    	if retval:
            raise Exception('RC %s while executing command "%s". ' % (retval,cmd))