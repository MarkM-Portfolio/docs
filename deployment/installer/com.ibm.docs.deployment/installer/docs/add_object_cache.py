# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************
import logging as log
import operator
from common import command, CFG, was_log, call_wsadmin, parse_ws_map

OC_NAME_DOCENTRY = 'ConcordDocEntryCache'
OC_JNDI_NAME_DOCENTRY = 'com/ibm/concord/cache/docentry'

OC_NAME_ACCESSCONTROL = 'Access Control Objects'
OC_JNDI_NAME_ACCESSCONTROL = 'services/cache/accesscontrol'

OC_NAME_RTSESSION = 'RealTimeSession Objects'
OC_JNDI_NAME_RTSESSION = 'services/cache/rtc4web'

OC_NAME_RTC4WEB = 'Rtc4web Update cache'
OC_JNDI_NAME_RTC4WEB = 'services/cache/rtc4web_update'

OC_NAME_CONCORDEDITORS = 'ConcordEditorsCache'
OC_JNDI_NAME_CONCORDEDITORS = 'com/ibm/concord/cache/editors'

object_object_entries=[[[OC_NAME_DOCENTRY],[OC_JNDI_NAME_DOCENTRY]],\
	[[OC_NAME_ACCESSCONTROL],[OC_JNDI_NAME_ACCESSCONTROL]],\
	[[OC_NAME_RTSESSION],[OC_JNDI_NAME_RTSESSION]],\
	[[OC_NAME_RTC4WEB],[OC_JNDI_NAME_RTC4WEB]],\
	[[OC_NAME_CONCORDEDITORS],[OC_JNDI_NAME_CONCORDEDITORS]]]

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

    args = []
    args.extend([self.target_scope])
    for ocentry in object_object_entries:
      args.extend(ocentry[1])
    #succ, ws_out = self.call_task("get_objectcache.py", [CFG.get_scope_full_name(), self.name])
    succ, ws_out = self.call_task("get_objectcache.py", args)

    if not succ:
      log.info("Failed to read ObjectCache information")
      return False
     #Example of attribute set
     #ObjectCache is existing:  ['[cacheSize 2000]', '[defaultPriority 1]', \
     #'[disableDependencyId false]', '[diskCacheCleanupFrequency 0]', \
     #'[diskCacheEntrySizeInMB 0]', '[diskCachePerformanceLevel BALANCED]', \
     #'[diskCacheSizeInEntries 0]', '[diskCacheSizeInGB 0]', '[enableCacheReplication false]', \
     #'[enableDiskOffload false]', '[flushToDiskOnStop false]', '[hashSize 1024]', \
     #'[jndiName services/cache/accesscontrol]', '[memoryCacheSizeInMB 0]', '[name "Access Control Objects"]', \
     #'[provider CacheProvider(cells/BXV7V610Cell01/clusters/DocsCluster|resources-pme502.xml#CacheProvider_1055745612404)]', \
     #'[pushFrequency 1]', '[replicationType NONE]', '[useListenerContext false]']

    #cus_upgrade_list = [[0 for col in range(3)] for row in range(5)]
    non_upgrade_jndi_list = []
    for line in ws_out.split('\n'):
      if line.find('No ObjectCache found') > -1:
        log.info("No ObjectCache found")
        if self._add_object_cache():
      	  was_log.log("#WAS ObjectCache Upgrade")
      	  return True
        else:
          log.info("Failed to add ObjectCache")
          self.added = True
          return False
      elif line.find('ObjectCache is existing') > -1:
        non_upgrade_jndi_list = self._parse_ret_object_case_info(ws_out)
        break

    if len(non_upgrade_jndi_list)== len(object_object_entries):
      was_log.log("#WAS ObjectCache Upgrade Un-necessary")
    else:
      cargs=[]
      for ocentry in object_object_entries:
        if ocentry[1] not in non_upgrade_jndi_list:
          cargs.extend(ocentry[0])
        cargs.extend(ocentry[1])

      return self._cus_upgrade_object_cache(cargs)

    return True

  def undo_upgrade(self):
    if self.added:
      return self._remove_object_cache()

    return True

  def _add_object_cache(self):
    log.info("Start to create ObjectCache for HCL Docs Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/" + __name__.split(".")[1]+ ".py"])
    #args.extend([self.scope])
    #args.extend([self.scope_name])
    args.extend([self.target_scope])

    for ocentry in object_object_entries:
    	args.extend(ocentry[0])
    	args.extend(ocentry[1])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Create ObjectCache for HCL Docs Server completed")

    self.added = True

    return True

  def _remove_object_cache(self):
    log.info("Start to delete ObjectCache for HCL Docs Server")

    args0 = []
    args0.extend([self.target_scope])
    for ocentry in object_object_entries:
    	args0.extend(ocentry[1])

    #succ, ws_out = self.call_task("get_objectcache.py", [CFG.get_scope_full_name(), self.name])
    succ, ws_out = self.call_task("get_objectcache.py", args0)

    if not succ:
      log.info("No ObjectCache to Remove")
      return False

    del_jndi_list = []
    for line in ws_out.split('\n'):
      if line.find('ObjectCache is existing') > -1:
        del_jndi_list = self._parse_ret_object_case_info(ws_out)
        break

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    #args.extend([self.scope])
    #args.extend([self.scope_name])
    args.extend([self.target_scope])

    for ocentry in object_object_entries:
        if ocentry[1] in del_jndi_list:
          args.extend(ocentry[0])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Delete ObjectCache for HCL Docs Server completed")
    return True

  def _cus_upgrade_object_cache(self,cargs):

    args = CFG.get_was_cmd_line()
    #args.extend(["-f",  "./docs/tasks/" + "add_object_cache.py"])
    args.extend(["-f",  "./docs/tasks/" + __name__.split(".")[1]+ ".py"])
    args.extend([self.target_scope])
    args.extend(cargs)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Create ObjectCache for HCL Docs Server completed when custimized upgrade")

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
              if operator.eq(c_jndi_value,oc_jndi):
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
