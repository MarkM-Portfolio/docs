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

import os, sys, fileinput, shutil, zipfile
from commands import command
from util.common import call_wsadmin, ZipCompat
from icext.config import CONFIG as CFG
import logging as log

LC35_OSGIExt_Name = "Concord_LC35_OSGIExtension.zip"
OSGI_BLD_NAME_PRE = "com.ibm.concord.lcfiles.extension.provision_"

EXT_EAR_PRE_NAME = "com.ibm.concord.lcfiles.ext_"
EAR_RENAME = "com.ibm.concord.lcfiles.ext.ear"
JYTHON_MAP2WEB = "map2webserver.py"

class InstallPlugin(command.Command):
  """This command will install DocsExt.ear and start it"""

  def __init__(self):
    self.ext_bld_dir = CFG.get_build_dir()
    self.osgi_dir = CFG.get_icext_jar_location()
    self.scope = CFG.get_scope_type()
    self.scope_name = CFG.get_scope_name()
    self.node_name = CFG.get_node_name()

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Install Plugin for HCL DocsExt Server Started")

    if CFG.get_icext_mode() == "IS_EAR":
      self.ear_do()
    elif CFG.get_icext_mode() == "IS_JAR":
      self.osgi_do()
    else:
      raise Exception("Pls check your Lotus connection versions, no correct version found")

    log.info("Install Plugin for HCL DocsExt Server completed")
    return True

  def undo(self):
    log.info("Start to uninstall Plugin for HCL Docs Server")

    if CFG.get_icext_mode() == "IS_EAR":
      self.ear_undo()
    elif CFG.get_icext_mode() == "IS_JAR":
      self.osgi_undo()
    else:
      raise Exception("Pls check your Lotus connection versions, no correct version found")

    log.info("Uninstall Plugin for HCL Docs Server completed")
    return True

  def remove_bdl(self):
    bld_num=0
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(OSGI_BLD_NAME_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        os.remove(full_bdl)
        bld_num += 1
    if bld_num > 0:
      log.info("%s OSGI bundles removed from DocsExt  server %s" % \
        ( str(bld_num), self.osgi_dir))
    else:
      log.warning("NO OSGI bundle found from directory %s" % self.osgi_dir)

  def install_bdl(self):
    bdl_zip = ""
    for f in os.listdir(self.ext_bld_dir):
      if f.find(LC35_OSGIExt_Name) > -1:
        bdl_zip = self.ext_bld_dir + "/" + f
        break
    if not bdl_zip:
      raise Exception("%sxxx not found from DocsExt build dir %s" %\
        (LC35_OSGIExt_Name, self.ext_bld_dir))

    bdl_zip_file = ZipCompat(bdl_zip)
    bdl_zip_file.extractall(self.osgi_dir)

  def osgi_do(self):
    log.info("Install OSGI bundle for HCL DocsExt Server Started")
    self.remove_bdl()
    self.install_bdl()

    log.info("Install OSGI bundle for HCL DocsExt Server completed")

  def osgi_undo(self):
    log.info("Start to uninstall OSGI bundle for HCL Docs Server")

    self.remove_bdl()

    log.info("Uninstall OSGI bundle for HCL Docs Server completed")

  def rename_ear(self):
    bld_ear_name = ""
    for ear_file in os.listdir(self.ext_bld_dir):
      if ear_file.find(EXT_EAR_PRE_NAME) > -1:
        bld_ear_name = ear_file
    if not bld_ear_name:
      raise Exception("Didn't find Extension EAR in %s" % self.ext_bld_dir)
    src = self.ext_bld_dir+ "/" + bld_ear_name
    dest = self.ext_bld_dir+ "/" + EAR_RENAME
    shutil.copy(src, dest)
    return dest

  def config_ear(self):
    bld_ear_name = ""
    for ear_file in os.listdir(self.ext_bld_dir):
      if ear_file.find(EXT_EAR_PRE_NAME) > -1:
        bld_ear_name = ear_file
    if not bld_ear_name:
      raise Exception("Didn't find DOCSEXT EAR in %s" % self.ext_bld_dir)

    src = self.ext_bld_dir + bld_ear_name
    temp_unzip_dir = self.ext_bld_dir + "temp"
    os.mkdir(temp_unzip_dir)
    #bdl_zip_file = ZipCompat(bld_ear_name)
    bdl_zip_file = ZipCompat(src)
    bdl_zip_file.extractall(temp_unzip_dir)

    old_war_name=""
    temp_war_name = temp_unzip_dir + "/war.temp"
    for esf in os.listdir(temp_unzip_dir):
      if esf[-4:] == ".war":# file extension is ".war"
        old_war_name = os.path.join(temp_unzip_dir, esf)
    if old_war_name == "":
      raise Exception("WAR not found in Extension package")

    self._make_new_war(old_war_name, temp_war_name)
    #os.remove(old_war_name)
    shutil.move(temp_war_name, old_war_name)
    self._make_new_ear(temp_unzip_dir)
    return os.path.join(self.ext_bld_dir, EAR_RENAME)

  def _make_new_ear(self, src):
    zip = zipfile.ZipFile(os.path.join(self.ext_bld_dir, EAR_RENAME),  \
	'w', zipfile.ZIP_DEFLATED)
    rootlen = len(src) + 1
    #for i in os.listdir(src):
    #p = os.path.join(src, i)
    #if os.path.isdir(p):
    for base, dirs, files in os.walk(src):
      for file in files:
        fn = os.path.join(base, file)
        zip.write(fn, fn[rootlen:])
        #zip.write(fn)
    #  else:
    #    zip.write(p)
    zip.close()
    shutil.rmtree(src)

  def _make_new_ear_recur(self, path, archive):
    paths = os.listdir(path)
    for p in paths:
        p = os.path.join(path, p) # Make the path relative
        if os.path.isdir(p): # Recursive case
            self._make_new_ear(p, archive)
        else:
            archive.write(p) # Write the file to the zipfile
    #archive.close()

  def _make_new_war(self, src, dest):
    zin = zipfile.ZipFile(src, 'r')
    zout = zipfile.ZipFile(dest, 'w')

    for item in zin.infolist():
      buffer = zin.read(item.filename)
      if (item.filename.find("global.js") > -1):
        #print ">>>>>>", item.filename
        newb = self._make_global_js(buffer)
        #print ">>>>", buffer
        #print newb
        zout.writestr(item, newb)
      else:
        zout.writestr(item, buffer)

    zout.close()
    zin.close()

  def _make_global_js(self, js_src):
    js_src_list = []
    for j in js_src.split("\n"):
      if ((j.strip().find("glb_concord_url_wnd_open =") > -1) and \
                CFG.get_context_root_proxy()):
        j = "".join(["glb_concord_url_wnd_open =\"", CFG.get_context_root_proxy(), "\";"])
      elif ( (j.strip().find("glb_concord_url =") > -1) and \
                CFG.get_context_root()):
        j = "".join(["glb_concord_url =\"", CFG.get_context_root(), "\";"])
      elif ( (j.strip().find("EntitlementCheck =") > -1) and
                CFG.get_entitlement()):
        j = "".join(["EntitlementCheck =", CFG.get_entitlement().lower(), ";"])
      js_src_list.append(j)
    return "\n".join(js_src_list)

  def prepare_scope(self):
    servers = []
    clusters = []
    if self.scope.lower() == "cluster":
      clusters.append(self.scope_name)
    else:
      server={}
      server["nodename"] = self.node_name
      server["servername"] = self.scope_name
      servers.append(server)

    return (servers, clusters)

  def ear_do(self):
    log.info("Start to install EAR for HCL DocsExt Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./icext/tasks/" + __name__.split(".")[1]+ ".py"])

    if ( CFG.get_context_root() or \
		CFG.get_context_root_proxy() or \
		CFG.get_entitlement() ):
      cvt_ear_name = self.config_ear()
    else:
      cvt_ear_name = self.rename_ear()

    args.extend([cvt_ear_name])
    args.extend([CFG.get_app_name()])

    args.extend([self.scope]) # server or cluster

    servers, clusters = self.prepare_scope()
    if clusters:#dupliate argument to keep consisten with servers
      args.extend([clusters[0]])
      args.extend([clusters[0]])
    if servers:
      args.extend([servers[0]["servername"]])
      args.extend([servers[0]["nodename"]])

    #log.info(args)

    if not call_wsadmin(args):
      return False
    log.info("Install EAR for HCL DocsExt Server completed")

  def ear_undo(self):
    log.info("Start to uninstall EAR for HCL DocsExt Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./icext/tasks/undo_" + __name__.split(".")[1]+ ".py"])

    args.extend([CFG.get_app_name()]) #IBMConversion
    #log.info(args)

    if not call_wsadmin(args):
      return False
    log.info("Uninstall EAR for HCL DocsExt Server completed")

class Map2WebServer(command.Command):

  def __init__(self):
    #self.config = config.Config()
    self.ext_bld_dir = CFG.get_build_dir()
    self.ear_path = self.ext_bld_dir+ "/" + EAR_RENAME

  def readCfg(self, cfg=None):
    return True

  def do(self):
    log.info("Map DocExt EAR application to WebServer...")

    if CFG.get_icext_mode() == "IS_JAR":
      log.info("HCL Connections 3.5+ detected, skip mapping WebServer step for bundle installation")
      return True

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./icext/tasks/" + JYTHON_MAP2WEB])

    args.extend([self.ear_path])
    args.extend([CFG.get_app_name()])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("Map DocsExt EAR application to WebServer completed")
    return True

  def undo(self):
    log.info("NO UNDO required for Map EAR app to WebServer...")
    return True
