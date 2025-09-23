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

try:
  import json
except ImportError: 
  import simplejson as json

import logging
from common_jython import config_log

JSON_LIST_ENTRY_IDENTFER = {'components': 'id', 'adapters': 'id', 'providers': 'name'}
OVERWRITE_SCOPES = ['providers']
OVERWRITE_SWITCH_ON = [ False ]
JSON_OVERWRITE_ENTRY_IDENTFER = ["conversionLib/enabled", "session/max-users-per-session",
    "spreadSheet", "document", "presentation", "component/components", "build-info", "viewersnapshot/enabled"]
JSON_REPLACE_ENTRY_IDENTFER = ["host-config"]
PATH_HOLDER = []

def merge_json_files (from_json_file_path, to_json_file_path):
  from_json_file = open( from_json_file_path)
  _from_json =  json.load(from_json_file)
  from_json_file.close()

  to_json_file = open( to_json_file_path)
  _to_json =  json.load(to_json_file)
  to_json_file.close()

  config_log.config_path = to_json_file_path
  config_log.console_log = logging
  
  merge_json(_from_json, _to_json)

  to_json_file = open(to_json_file_path, 'w')
  json.dump( _to_json, to_json_file, indent=2 )

  
def merge_json (from_json, to_json):
  for from_item in from_json:
    PATH_HOLDER.append(from_item)

    if from_item in JSON_REPLACE_ENTRY_IDENTFER:
      to_json[from_item] = from_json[from_item]
      PATH_HOLDER.pop(-1)
      continue

    entry_path = '/'.join(PATH_HOLDER)
    if entry_path in JSON_OVERWRITE_ENTRY_IDENTFER:
      to_json[from_item] = from_json[from_item]
      PATH_HOLDER.pop(-1)
      continue
    
    if not from_item in to_json:
    
      config_log.log_new('/'.join(PATH_HOLDER), 
        json.dumps(from_json[from_item]) )

      to_json[from_item] = from_json[from_item]
    else:
      if from_item in OVERWRITE_SCOPES:
        OVERWRITE_SWITCH_ON[0] = True
      
      from_item_type = type(from_json[from_item]) 
      # dict type
      if from_item_type is dict:
        merge_json (from_json[from_item], to_json[from_item])
      # list type
      elif from_item_type is list:
        if from_item in JSON_LIST_ENTRY_IDENTFER:          
          entry_identifer = JSON_LIST_ENTRY_IDENTFER[from_item]
          new_list_entries = []
          for from_list_item in from_json[from_item]:
            found = False
            for to_list_item in to_json[from_item]:
              if from_list_item[entry_identifer] == to_list_item[entry_identifer]:
                found = True
                merge_json (from_list_item, to_list_item)
                break
            if not found:
              config_log.log_new('/'.join(PATH_HOLDER), 
                json.dumps(from_list_item) )

              new_list_entries.append(from_list_item)
          to_json[from_item].extend(new_list_entries)
      # key-value pair
      else:        
        if from_json[from_item] != to_json[from_item]:
          if OVERWRITE_SWITCH_ON[0]:
            config_log.log_overwrite('/'.join(PATH_HOLDER), 
              json.dumps(to_json[from_item]), 
              json.dumps(from_json[from_item]) )
            to_json[from_item] = from_json[from_item]
          else:            
            config_log.log_existed('/'.join(PATH_HOLDER), 
              json.dumps(to_json[from_item]), 
              json.dumps(from_json[from_item]) )

      if from_item in OVERWRITE_SCOPES:
        OVERWRITE_SWITCH_ON[0] = False
    PATH_HOLDER.pop(-1)
  
def write_status (status, path):
  to_json_file = open( path, 'w')
  json.dump( status, to_json_file, indent=2 )
  to_json_file.close()    

def copy_json_parts_file(keyset, sjson_file_path, djson_file_path):
  sjson_file = open( sjson_file_path)
  sjson =  json.load(sjson_file)
  sjson_file.close()

  djson_file = open( djson_file_path)
  djson =  json.load(djson_file)
  djson_file.close()
  
  copy_json_parts(keyset, sjson, djson)

  djson_file = open(djson_file_path, 'w')
  json.dump( djson, djson_file, indent=2 )

def copy_json_parts(keyset, sjson, djson):
  for ks in keyset:
    spart = sjson
    dpart = djson
    ks = ks.split('/')
    for i, k in enumerate(ks):      
      if k not in spart:
        break
      if k not in dpart:
        dpart[k] = spart[k]
        break
      elif i == len(ks)-1:
        dpart[k] = spart[k]
        break

      dpart = dpart[k]
      spart = spart[k]

