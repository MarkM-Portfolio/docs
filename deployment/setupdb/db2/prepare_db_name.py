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

import re
import os.path
import os
import fileinput
import sys
import logging

file_ext = [
	'sql',
	'bat',
	'sh'
	]

re_pattern = '.*\s(CONCORD|concord)[\s|@]+.*'

def prepare_log():

  logging.basicConfig(level=logging.DEBUG,
                      format='%(asctime)s %(levelname)s %(message)s',
                      filename='prepare_db_name.log',
                      filemode='w')
  console = logging.StreamHandler()
  console.setLevel(logging.INFO)
  formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)

def replace_name(file_path, name):
  for line in fileinput.input(file_path, inplace=1):
    
    if re.match(re_pattern, line):
      logging.info(file_path)
      log_info = ' '.join(['change from', line.rstrip('\n').strip()])
      for concord_name in re.match(re_pattern, line).groups():
        line = re.sub(concord_name, name, line)
      logging.info(' '.join([log_info, 'to', line.rstrip('\n').strip()]))
    sys.stdout.write(line)
   
def prepare_db_name(name):
  current_folder = os.path.dirname(os.path.abspath(__file__))
  logging.info('db scripts folder path: ' + current_folder)
  for (dir_path,dir_names,file_names)in os.walk(current_folder):
    file_list = (os.path.join(dir_path,file_name) for file_name in file_names if file_name.split('.')[-1] in file_ext)
    for file_path in file_list:
      replace_name(file_path, name)

if __name__ == '__main__':
  if len(sys.argv) < 2:
    print '''
    Usage:
      python prepare_db_name.py [db_name]
    Note:
      The default database name is CONCORD,
      run this command before creating db if you want to set another name.  
          '''
  else:
    prepare_log()
    logging.info('start to change db name')
    prepare_db_name(sys.argv[1])
    logging.info('finish to change db name, run scripts of creating database now.')
  
	    
	    
	    
	    
    
    

    

	


