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
import logging as log
from operator import eq
from commands import command
from util.common import call_wsadmin, parse_ws_map
from viewer.config import CONFIG as CFG
from util.upgrade_change_log import was_log

OC_NAME_VWDOCENTRY = 'ViewerDocEntryCache'
OC_JNDI_NAME_VWDOCENTRY = 'com/ibm/concord/viewer/cache/docentry'

OC_NAME_VWDOCENTITLE = 'ViewerDocsEntitleCache'
OC_JNDI_NAME_VWDOCENTITLE = 'com/ibm/concord/viewer/cache/docsentitle'

object_object_entries=[[[OC_NAME_VWDOCENTRY],[OC_JNDI_NAME_VWDOCENTRY]],\
	[[OC_NAME_VWDOCENTITLE],[OC_JNDI_NAME_VWDOCENTITLE]]]

class AddObjectCache(command.Command):

  def __init__(self):
    self.scope = CFG.get_scope_type()
    self.scope_name = CFG.get_scope_name()
    self.target_scope = CFG.get_scope_full_name()
    self.added = False

  def readCfg(self, cfg=None):
    """read and setup config parameters from global util/conf.py and setting.py """

  def do(self):
    return self._add_object_cache()

  def undo(self):
    return self._remove_object_cache()

  def do_upgrade(self):
    log.info("Start to upgrade ObjectCache...")

    non_upgrade_jndi_list = self._check_exists_object_cache()
    
    if len(non_upgrade_jndi_list)== len(object_object_entries):
      was_log.log("#WAS ObjectCache Upgrade Un-necessary")
    else:
      cargs=[]
      for ocentry in object_object_entries:
        if ocentry[1] not in non_upgrade_jndi_list:
          cargs.extend(ocentry[0])
          cargs.extend(ocentry[1])

      succ = self._impl_add_object_cache(cargs)
      if not succ:
        log.info("Failed to add ObjectCache")
        self.added=True
        return False
      else:
        was_log.log("#WAS ObjectCache Upgrade")
        
    return True

  def undo_upgrade(self):
    if self.added:
      return self._remove_object_cache()

    return True
    
  def _check_exists_object_cache(self):
    log.info("Start to check ObjectCache existence for Viewer Server")

    args0 = []
    args0.extend([self.target_scope])
    for ocentry in object_object_entries:
      args0.extend(ocentry[1])

    #succ, ws_out = self.call_task("get_objectcache.py", [CFG.get_scope_full_name(), self.name])
    succ, ws_out = self.call_task("get_objectcache.py", args0)

    if not succ:
      log.info("Found no ObjectCache.")
      return

    found_jndi_list = []
    for line in ws_out.split('\n'):
      if line.find('ObjectCache is existing') > -1:
        found_jndi_list = self._parse_ret_object_case_info(ws_out)
        break
    
    log.info("Check ObjectCache existence for Viewer Server completed")
        
    return found_jndi_list;	  

  def _add_object_cache(self):
    log.info("Start to create ObjectCache for Viewer Server")

    existing_jndi_list = self._check_exists_object_cache()
    
    if (len(existing_jndi_list)== len(object_object_entries)) :
      log.info("No need to add new cache objects")
    else:
      args=[]	
      for ocentry in object_object_entries:
        if ocentry[1] not in existing_jndi_list:
          args.extend(ocentry[0])
          args.extend(ocentry[1])
      succ = self._impl_add_object_cache(args)
      if not succ:
        log.info("Failed to add ObjectCache")
        return False
        
    log.info("Create ObjectCache for Viewer Server completed")

    return True

  def _remove_object_cache(self):
    log.info("Start to delete ObjectCache for Viewer Server")


    del_jndi_list = self._check_exists_object_cache()

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./viewer/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    #args.extend([self.scope])
    #args.extend([self.scope_name])
    args.extend([self.target_scope])

    for ocentry in object_object_entries:
        if ocentry[1] in del_jndi_list:
          args.extend(ocentry[0])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Delete ObjectCache for Viewer Server completed")
    return True

  def _impl_add_object_cache(self,cargs):

    log. info("Start to add ObjectCache for Viewer Server")
    
    args = CFG.get_was_cmd_line()
    #args.extend(["-f",  "./viewer/tasks/" + "add_object_cache.py"])
    args.extend(["-f",  "./viewer/tasks/" + __name__.split(".")[1]+ ".py"])
    args.extend([self.target_scope])
    args.extend(cargs)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Add ObjectCache for Viewer Server completed")

    self.added = True

    return True

  def _parse_ret_object_case_info(self,oc_prt):
    oc_jndi_list = []
    for line in oc_prt.split('\n'):
      if line.find('ObjectCache is existing') > -1:
        attrs = None
        attrs = eval(line.strip(' \r\n\t').replace('ObjectCache is existing: ',''))
        if attrs:
      	  #compare settings
          curr_settings = None
          curr_settings = parse_ws_map(attrs)
          for ocentry in object_object_entries:
            jndi_key = 'jndiName'
            #name_key = 'name'
            if jndi_key in curr_settings:
              c_jndi_value = curr_settings[jndi_key]
              #c_name_value = curr_settings[name_key]
              oc_jndi = ocentry[1][0]
              #oc_name = ocentry[0][0]
              if eq(c_jndi_value,oc_jndi):
                oc_jndi_list.append(ocentry[1])
                #if cmp(c_name_value,oc_name)==0:
                #  oc_name_list.append(ocentry[0])
                #else:#if cmp(c_name_value,oc_old_name)==0:
                #  oc_name_list.append(object_object_entries_old[index][0])
                break
            #endif
          #end while
        #endif attrs
      #endif line
    return oc_jndi_list
