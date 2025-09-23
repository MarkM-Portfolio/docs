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

import logging
import re
import shutil
import os

from common import CFG
from util import symphony_limit_cfg_template

'''
    After installing Symphony, dynamically create limit_cfg.ini by conversion-config.json,
    then put it into soffice.exe's folder
'''

class AddSymphonyLimitConfig(object):        

    def __init__(self):
        
        conversion_config_path = os.path.join(CFG.get_build_dir(),'config','conversion-config.json')
        conversion_config_content = open(conversion_config_path,'r').readlines()

        document_max_page_pattern = re.compile(r'\s*"max-page-count"\s*:\s*(\d+)\s*,?')
        spreadSheet_max_row_pattern = re.compile(r'\s*"max-sheet-rows"\s*:\s*(\d+)\s*,?')
        presentation_max_page_pattern = re.compile(r'\s*"max-pages"\s*:\s*(\d+)\s*,?')
        
        for line in conversion_config_content:
            result = re.match(document_max_page_pattern,line)
            if result:
                document_max_page = result.group(1)
                continue
            result =  re.match(spreadSheet_max_row_pattern,line)
            if result:
                spreadSheet_max_row = result.group(1)
                continue
            result =  re.match(presentation_max_page_pattern,line)
            if result:
                presentation_max_page = result.group(1)
                continue
        template_map = \
                {
                        'document_max_page' : document_max_page,
                        'spreadSheet_max_row' : spreadSheet_max_row,
                        'presentation_max_page' : presentation_max_page
                }
        limit_cfg_content = symphony_limit_cfg_template.LIMIT_CFG_TEMPLATE % template_map
        
        configPath = os.path.join(CFG.get_install_root(),'config')
        if not os.path.exists(configPath):
          os.makedirs(configPath)
        self.temp_config_path = os.path.join(configPath,'limit_cfg.ini')
        open(self.temp_config_path,'w').write(limit_cfg_content)

    def __del__(self):
        if os.path.exists(self.temp_config_path) :
            os.remove(self.temp_config_path)

    def do(self,instance_path):
        if not os.path.exists(self.temp_config_path) :
            logging.warn('Cannot find limit_cfg.ini copy, skip this step.')
            return 
        if os.name == 'nt':
            soffice_path = os.path.join(instance_path,'IBM_Lotus_Symphony_2','program')
        else:
            soffice_path = os.path.join(instance_path,'ibm_lotus_symphony2','program')
        
        shutil.copy(self.temp_config_path,soffice_path)


        
    
        



 
        
