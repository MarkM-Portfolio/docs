import sys
import getpass
import json
import os
import zipfile
import logging
import traceback
import socket
from xml.dom.minidom import parse, parseString
from xml.dom.minidom import Document
from config import CONFIG
import time

def update_product(dirName, json_file_name):
  """update product according to the dirName, and update the config json file"""
  #if config files already exist, delete first.
  print "checking config file existance..."
  if(os.path.exists(json_file_name)):
    os.remove(json_file_name)
  if(os.path.exists("conversion_sanity.json")):
    os.remove("conversion_sanity.json")
  if(os.path.exists("docs_sanity.json")):
    os.remove("docs_sanity.json")
  print "getting target build info..."
  target_buildinfo = get_target_buildinfo()
  if not target_buildinfo:
    #smartcloud env, ifix-version.json does not exist.
    logging.info("Start to update " + dirName + ".")
    try:
      update_apps()
    except:
      raise Exception(traceback.format_exc())
    logging.info(dirName + " update successfully.")
  else:
    last_config_json = CONFIG.get_config_json(CONFIG.docs_config_dir, json_file_name)
    new_config_json = CONFIG.get_config_json(CONFIG.docs_config_dir, json_file_name)
    if "ifix_version" not in target_buildinfo:
      #smartcloud env, ifix-version.json exists
      update_json(new_config_json, target_buildinfo)
      checkin_json(new_config_json, json_file_name)
      try:
        update_apps()
      except:
        checkin_json(last_config_json,  json_file_name)
        raise Exception(traceback.format_exc())
      restart(target_buildinfo)
      logging.info(dirName + " update successfully.")
    else:
      #onpremise env
      #The following supports a general case when no ifix applied previously or when ifix is more recent than last ifix applied.
      #More conditions may be added for specific patch and  ifix conditions, such as tests for a specific build_version.
      if ("ifix_version" in last_config_json["build-info"] and
        target_buildinfo['ifix_version'] == last_config_json["build-info"]['ifix_version']):
        logging.info(dirName + " is already up-to-date. Installation is skipped.")
      elif ("ifix_version" in last_config_json["build-info"] and
        target_buildinfo['ifix_version'] < last_config_json["build-info"]['ifix_version']):
      	logging.info("This iFix is not for your current " + dirName + " version. Please double check.")
      else:
        logging.info("Start to update " + dirName + ".")
        update_json(new_config_json, target_buildinfo)
        checkin_json(new_config_json, json_file_name)
        try:
          #set_lc_ccm_config()
          update_apps()
          restart(target_buildinfo)
        except:
          checkin_json(last_config_json,  json_file_name)
          raise Exception(traceback.format_exc())
        logging.info(dirName + " update successfully.")

def update_json(config_json, buildinfo):
  """update config_json(json object) with buildinfo(json object)"""
  if("build_timestamp" in buildinfo):
    config_json["build-info"]["build_timestamp"] = buildinfo["build_timestamp"]
  if("build_version" in buildinfo):
    config_json["build-info"]["build_version"] = buildinfo["build_version"]
  if("product_name" in buildinfo):
    config_json["build-info"]["product_name"] = buildinfo["product_name"]
    config_json["build-info"]["build_description"] = buildinfo["product_name"] + " " + config_json["build-info"]["build_version"]
  if("patch_base_build" in buildinfo):
    config_json["build-info"]["patch_base_build"] = buildinfo["patch_base_build"]
  if("ifix_version" in buildinfo):
    #OnPremise env
    config_json["build-info"]["ifix_version"] = buildinfo["ifix_version"]
    if os.path.basename(os.getcwd()) == "DocsApp":
      #DocsApp
      update_concord_config(config_json)
    elif os.path.basename(os.getcwd()) == "Viewer":
      #Viewer
      update_viewer_config(config_json)
    elif os.path.basename(os.getcwd()) == "DocsConversion":
      #DocsConversion
      update_conversion_config(config_json)
    else:
      pass
def update_concord_config(config_json):
  """update concord config json file"""
  components = config_json["component"]["components"]
  for component in components:
    if component["id"] == "com.ibm.concord.document.services":
      providers = component["config"]["providers"]
      for provider in providers:
        if provider["name"] == "pres":
          provider["config"]["limits"]["max-size"] = "102400"
          provider["config"]["limits"]["actual-max-size"] = "102400"
        break
      break
  """
  if config_json["picture-cache-control"] and "enabled" not in config_json["picture-cache-control"]:
    config_json["picture-cache-control"]["enabled"] = "false"
  if "WhiteDomainList" not in config_json:
    config_json["WhiteDomainList"] = []
  if "ExternalCommentService" not in config_json:
    config_json["ExternalCommentService"] = {"enabled": "false", "apiConfig":{"MentionUsersUri":"/api/comment/{fileid}/getCommentUserList","MentionNotificationUri":"/api/mention"}}
  if "auto-checkin" not in config_json:
    config_json["auto-checkin"] = {"default-auto-checkin":"false"}
  components = config_json["component"]["components"]
  for i in range(len(components)):
    if components[i]["id"] == "com.ibm.concord.document.services":
      components[i]["config"]["mime-types"]["application/vnd.ms-excel.sheet.macroEnabled"] = "sheet"
      components[i]["config"]["mime-types"]["application/vnd.ms-excel.sheet.macroEnabled.12"] = "sheet"
      providers = components[i]["config"]["providers"]
      for j in range(len(providers)):
      	if providers[j]["name"] == "sheet":
      	  providers[j]["config"]["ACLEnabled"] = "true"
      	  providers[j]["config"]["limits"]["actual-max-size"] = "20480"
      	  providers[j]["config"]["limits"]["max-sheet-rows"] = "30000"
      	  providers[j]["config"]["mobile_limits"]["actual-max-size"] = "2048"
      	elif providers[j]["name"] == "text":
      	  providers[j]["config"]["DocTrackChange"] = "true"
      	  providers[j]["config"]["limits"]["max-size"] = "30720"
      	  providers[j]["config"]["limits"]["actual-max-size"] = "30720"
      	  providers[j]["config"]["mobile_limits"]["max-size"] = "30720"
      	  providers[j]["config"]["mobile_limits"]["actual-max-size"] = "30720"
      	elif providers[j]["name"] == "pres":
      	  providers[j]["config"]["limits"]["actual-max-size"] = "51200"
      	  providers[j]["config"]["mobile_limits"]["actual-max-size"] = "51200"
    elif components[i]["id"] == "com.ibm.docs.repository":
      adapters = components[i]["config"]["adapters"]
      for j in range(len(adapters)):
        if adapters[j]["id"] == "external.cmis" or adapters[j]["id"] == "external.rest":
          if "oauth2_authorize_endpoint" not in adapters[j]["config"]:
            adapters[j]["config"]["oauth2_authorize_endpoint"] = ""
          if "repository_name" not in adapters[j]["config"]:
            adapters[j]["config"]["repository_name"] = ""
    elif components[i]["id"] == "com.ibm.docs.directory":
      adapters = components[i]["config"]["adapters"]
      for j in range(len(adapters)):
        if adapters[j]["id"] == "external.cmis" or adapters[j]["id"] == "external.rest":
          if "oauth2_authorize_endpoint" not in adapters[j]["config"]:
            adapters[j]["config"]["oauth2_authorize_endpoint"] = ""
          if "current_user_profiles_url" not in adapters[j]["config"]:
            adapters[j]["config"]["current_user_profiles_url"] = ""
          if adapters[j]["id"] == "external.rest":
            adapters[j]["config"]["keys"]["org_name_key"] = "org_name"
            adapters[j]["config"]["keys"]["job_title_key"] = "job_title"
    elif components[i]["id"] == "com.ibm.concord.platform.journal":
      for adapter in  components[i]["config"]["adapters"]:
        if adapter["id"] == "lcfiles" and "enabled" not in adapter["config"]:
          adapter["config"]["enabled"] = "false"
  """
def update_viewer_config(config_json):
  config_json["HtmlViewerConfig"]["text-limits"]["max-page-count"] = "600"
  config_json["HtmlViewerConfig"]["pres-limits"]["actual-max-size"] = "102400"
  components = config_json["component"]["components"]
  for component in components:
    if component["id"] == "com.ibm.concord.viewer.document.services":
      providers = component["config"]["providers"]
      for provider in providers:
      	if provider["name"] == "pres":
      	  provider["config"]["limits"]["max-size"] = "102400"
      	  break
      break
  """
  config_json["PDFViewerConfig"] = {"PDFJs_view_mode" : "true","PDFJs_range_disabled" : "true","PDFJs_agent_list" : {"Safari" : "(5.1)","Chrome" : "(39|40|6\\d)"}}
  config_json["file_size_threshold"]["application/vnd.openxmlformats-officedocument.spreadsheetml.template"] = "0"
  config_json["file_size_threshold"]["application/vnd.openxmlformats-officedocument.presentationml.template"] = "0"
  config_json["file_size_threshold"]["application/vnd.openxmlformats-officedocument.wordprocessingml.template"] = "0"
  config_json["file_size_threshold"]["application/vnd.oasis.opendocument.spreadsheet-template"] = "0"
  config_json["file_size_threshold"]["application/vnd.oasis.opendocument.presentation-template"] = "0"
  config_json["file_size_threshold"]["application/vnd.oasis.opendocument.text-template"] = "0"
  config_json["file_size_threshold"]["application/vnd.ms-excel.sheet.macroenabled.12"] = "0"
  config_json["file_size_threshold"]["application/rtf"] = "0"
  config_json["file_size_threshold"]["text/plain"] = "0"
  if config_json["http-params"]:
    config_json["http-params"]["gzip"] = "true"
    config_json["http-params"]["exclude"] = "pdf|jpg|jpeg|png|gif"
  if config_json["House_Keeping"] and "disk_threshold_of_cache" not in config_json["House_Keeping"]:
    config_json["House_Keeping"]["disk_threshold_of_cache"] = "0.4"
  if config_json["docs_integration"] and "j2cAlias" in config_json["docs_integration"] and "j2c_alias" not in config_json["docs_integration"]:
    config_json["docs_integration"]["j2c_alias"] = config_json["docs_integration"]["j2cAlias"]
  if "WhiteDomainList" not in config_json:
    config_json["WhiteDomainList"] = []
  if "HtmlViewerConfig" in config_json:
    if "text-limits" in config_json["HtmlViewerConfig"]:
      config_json["HtmlViewerConfig"]["text-limits"]["max-size"] = "30720"
      config_json["HtmlViewerConfig"]["text-limits"]["actual-max-size"] = "30720"
      config_json["HtmlViewerConfig"]["text-limits"]["max-txt-size"] = "768"
      config_json["HtmlViewerConfig"]["text-limits"]["max-rtf-size"] = "10240"
    if "sheet-limits" in config_json["HtmlViewerConfig"]:
      config_json["HtmlViewerConfig"]["sheet-limits"]["max-sheet-rows"] = "30000"
      config_json["HtmlViewerConfig"]["sheet-limits"]["cell-max-num"] = "1000000"
      config_json["HtmlViewerConfig"]["sheet-limits"]["formula-cell-max-num"] = "100000"
    if "Watermark" not in config_json["HtmlViewerConfig"]:
      config_json["HtmlViewerConfig"]["Watermark"] = {"enabled": "false","text_watermark":{"text":"CONFIDENTIAL","font":"Arial","size":"72","color":"#D2D2D2","diagonal": "true"}}
  components = config_json["component"]["components"]
  for i in range(len(components)):
    if components[i]["id"] == "com.ibm.concord.viewer.platform.repository":
      adapters = components[i]["config"]["adapters"]
      for k in range(len(adapters)):
      	if adapters[k]["id"] == "lcfiles" and CONFIG.files_url != "" and CONFIG.j2c_alias != "" :
      	  adapters[k]["class"] = "com.ibm.concord.viewer.lc3.repository.LCFilesCMISRepository"
      	  if "server_url" not in adapters[k]["config"]:
      	    adapters[k]["config"]["server_url"] = CONFIG.files_url;
      	  if "s2s_method" not in adapters[k]["config"]:
      	    adapters[k]["config"]["s2s_method"] =  "j2c_alias"
      	  if "j2c_alias" not in adapters[k]["config"]:
      	    adapters[k]["config"]["j2c_alias"] =  CONFIG.j2c_alias
      	elif adapters[k]["id"] == "external.cmis" or adapters[k]["id"] == "external.rest":
          if "oauth2_authorize_endpoint" not in adapters[k]["config"]:
            adapters[k]["config"]["oauth2_authorize_endpoint"] = ""
    elif components[i]["id"] == "com.ibm.concord.viewer.document.services":
      components[i]["config"]["mime-types"]["application/vnd.openxmlformats-officedocument.spreadsheetml.template"] = "sheet"
      components[i]["config"]["mime-types"]["application/vnd.openxmlformats-officedocument.presentationml.template"] = "pres"
      components[i]["config"]["mime-types"]["application/vnd.openxmlformats-officedocument.wordprocessingml.template"] = "text"
      components[i]["config"]["mime-types"]["application/vnd.oasis.opendocument.spreadsheet-template"] = "sheet"
      components[i]["config"]["mime-types"]["application/vnd.oasis.opendocument.presentation-template"] = "pres"
      components[i]["config"]["mime-types"]["application/vnd.oasis.opendocument.text-template"] = "text"
      components[i]["config"]["mime-types"]["application/vnd.ms-excel.sheet.macroenabled.12"] = "sheet"
      components[i]["config"]["mime-types"]["application/rtf"] = "text"
      components[i]["config"]["mime-types"]["text/plain"] = "text"
    elif components[i]["id"] == "com.ibm.concord.viewer.platform.conversion":
      if "j2cAlias" in components[i]["config"]["conversionService"] and "j2c_alias" not in components[i]["config"]["conversionService"]:
        components[i]["config"]["conversionService"]["j2c_alias"] =  components[i]["config"]["conversionService"]["j2cAlias"];
    elif components[i]["id"] == "com.ibm.concord.viewer.platform.directory":
      adapters = components[i]["config"]["adapters"]
      for k in range(len(adapters)):
      	if adapters[k]["id"] == "external.cmis" or adapters[k]["id"] == "external.rest":
      	  if "oauth2_authorize_endpoint" not in adapters[k]["config"]:
      	    adapters[k]["config"]["oauth2_authorize_endpoint"] = ""
    elif components[i]["id"] == "com.ibm.concord.viewer.platform.journal" and "enabled" not in components[i]["config"]["adapter"]["config"]:
      components[i]["config"]["adapter"]["config"]["enabled"] = "false"
  """

def update_conversion_config(config_json):
  config_json["spreadSheet"]["max-sheet-rows"] = 30000
  config_json["spreadSheet"]["cell-max-num"] = 1000000
  config_json["spreadSheet"]["formula-cell-max-num"] = 100000
  config_json["document"]["max-page-count"] = 600
  config_json["presentation"]["max-pages"] = 300

def checkin_json(config_json, json_file_name):
  """checkin json_file_name with json object config_json"""
  json_file = open(json_file_name, 'w')
  json.dump(config_json, json_file, indent=2 )
  json_file.close()
  CONFIG.call_was_task('checkin_file', [CONFIG.docs_config_dir, json_file_name])

def update_apps():
  """update apps in present work directory"""
  for filename in os.listdir('./'):
    if(filename.endswith(".ear") or filename.endswith(".ear.zip")):
      appname = get_app_name(filename)
      if appname != "IBMDocsSanity":
        CONFIG.call_was_task('update_app',[appname, filename])

def restart(target_buildinfo):
  if os.path.basename(os.getcwd()) == "DocsApp" and not os.path.exists("com.ibm.concord.ear.ear.zip"):
    # if com.ibm.concord.ear.ear.zip exists, docs app has restarted during ear update,
    # so no need to restart docs again, else we need to restart docs to reload concord-config.json
    if "ifix_version" in target_buildinfo:
      # onpremise env
      CONFIG.restart_cluster(CONFIG.get_docs_cluster_name())
    else:
      CONFIG.call_was_task("restartApplication",['IBMDocs'])
  elif os.path.basename(os.getcwd()) == "DocsConversion":
    if os.path.exists("docs_remote_installer.zip"):
      if CONFIG.ignore_jobmanager:
        logging.info("You choose to ignore Jobmanager, after run applypatch.py, please continue the steps in Patch Guide.")
      else:
        update_conversion_binary()
    elif not os.path.exists("com.ibm.symphony.conversion.service.rest.was.ear.ear.zip"):
      if "ifix_version" in target_buildinfo:
        # onpremise env
        CONFIG.restart_cluster(CONFIG.get_cr_cluster_name())
      else:
        CONFIG.call_was_task("restartApplication",['IBMConversion'])
    else:
      pass
  else:
    # ViewerApp has been started already, no need to restart again
    pass

def set_lc_ccm_config():
  # DocsApp and OnPremise env
  if os.path.basename(os.getcwd()) == "DocsApp":
    update_lc_config('docs')
  # Viewer and OnPremise env
  elif os.path.basename(os.getcwd()) == "Viewer":
    update_lc_config('viewer')
  else:
    pass

def update_lc_config(serviceName):
  """update LotusConnections-config.xml"""
  if os.path.exists(CONFIG.lc_config_file):
    os.remove(CONFIG.lc_config_file)
  timestamp = str( int(time.time()) )
  local_file = CONFIG.lc_config_file + "." + timestamp
  CONFIG.call_was_task("extract_file",[CONFIG.lc_config_dir, CONFIG.lc_config_file, local_file])
  doc = parse(local_file)
  root = doc.documentElement
  isUpdated = False
  keys = CONFIG.lc_config.get(serviceName).keys()
  prop_tag = root.getElementsByTagName("properties")
  if prop_tag:
    props = prop_tag[0].getElementsByTagName("genericProperty")
    if props:
      for prop in props:
        if prop.getAttribute('name') in keys :
          isUpdated = True
          logging.debug(prop.getAttribute('name') + " has updated already.")
          break
  if isUpdated:
    return
  references = root.getElementsByTagName("sloc:serviceReference")
  if not references:
    return
  if serviceName == 'viewer':
    communities_settting = {'href': '', 'ssl_href':'', 'ssl_enabled': 'false', 'bootstrapHost': '', 'bootstrapPort': '', 'interService':''}
    for reference in references:
      if reference.getAttribute('serviceName') == "communities":
        communities_settting['ssl_enabled'] = reference.getAttribute('ssl_enabled')
        communities_settting['bootstrapHost'] = reference.getAttribute('bootstrapHost')
        communities_settting['bootstrapPort'] = reference.getAttribute('bootstrapPort')

        staicEle = reference.getElementsByTagName('sloc:href')[0].getElementsByTagName('sloc:static')[0]
        communities_settting['href'] = staicEle.getAttribute('href')
        communities_settting['ssl_href'] = staicEle.getAttribute('ssl_href')
        break
    for reference in references:
      if reference.getAttribute('serviceName') == 'viewer':
        CONFIG.lc_config['viewer']['com.ibm.docs.types.ccm.view'] = reference.getAttribute('enabled')
        if reference.getAttribute('enabled') == 'false':
      	  reference.setAttribute('enabled', 'true')
          reference.setAttribute('ssl_enabled', communities_settting['ssl_enabled'])
          reference.setAttribute('bootstrapHost', communities_settting['bootstrapHost'])
          reference.setAttribute('bootstrapPort', communities_settting['bootstrapPort'])

          staicEle = reference.getElementsByTagName('sloc:href')[0].getElementsByTagName('sloc:static')[0]
          if staicEle:
            staicEle.setAttribute('href', communities_settting['href'])
            staicEle.setAttribute('ssl_href', communities_settting['ssl_href'])
        break
  if serviceName == 'docs':
    for reference in references:
      if reference.getAttribute('serviceName') == 'docs':
        CONFIG.lc_config['docs']['com.ibm.docs.types.ccm.edit'] = reference.getAttribute('enabled')
        break

  if not prop_tag:
    prop_tag = [doc.createElement("properties")]
    root.appendChild(prop_tag[0])

  props = prop_tag[0].getElementsByTagName("genericProperty")

  for k,v in CONFIG.lc_config.get(serviceName).items():
    element = doc.createElement("genericProperty")
    element.setAttribute("name", k)
    element.appendChild(doc.createTextNode(v))
    for prop in props:
      if prop.getAttribute('name') == k:
        prop_tag[0].removeChild(prop)
    prop_tag[0].appendChild(element)

  file_object = file(CONFIG.lc_config_file, 'w')
  content = '\n'.join([line for line in doc.toprettyxml(indent=' '*2).split('\n') if line.strip()])
  file_object.write(content.encode('utf-8'))
  file_object.close()
  CONFIG.call_was_task('checkin_file', [CONFIG.lc_config_dir, CONFIG.lc_config_file])

def set_lc_files_config(appname):
  """set files config"""
  if appname == "IBMDocs":
    CONFIG.lc_config['docs']['com.ibm.docs.types.files.edit'] = 'true'
  elif appname == "ViewerApp":
    CONFIG.lc_config['viewer']['com.ibm.docs.types.files.view'] = 'true'
  else:
    pass

def get_target_buildinfo():
  """get the buildinfo json object through ifix-version.json"""
  target_buildinfo = None
  if(os.path.exists('ifix-version.json')):
    version_file = open('ifix-version.json')
    target_buildinfo = json.load(version_file)
    version_file.close()
  return target_buildinfo

def get_app_name(filename):
  """get app name by reading application.xml in the zip file"""
  zf = zipfile.ZipFile(filename, "r")
  appxml = zf.read("META-INF/application.xml")
  zf.close()
  start_string = "<display-name>"
  end_string = "</display-name>"
  start_index = appxml.find(start_string) + len(start_string)
  end_index = appxml.find(end_string)
  appname = appxml[start_index:end_index]
  return appname

def check_finish_status ():
  """read the finish status json file in host's log directory"""
  logging.info("Checking remote installation jobs status ...")
  isSuccessful = True
  status_map = {0:'succeed', -1:'failed'}
  for host in CONFIG.get_target_list():
    if not os.path.isfile(CONFIG.finish_status_node_file_name % host):
      logging.info("Cannot get job status of node %s." % host)
      isSuccessful = False
      continue
    finish_status_file = open(CONFIG.finish_status_node_file_name % host)
    status_json = json.load(finish_status_file)
    status = status_json.get('status', -1)
    if status == -1:
      isSuccessful = False
    action = status_json.get('action', 'unknown')
    logging.info("%s on node %s %s" % (action, host, status_map[status]))
    finish_status_file.close()
  return isSuccessful

def escapes_for_was (input):
  input = str(input)
  input = input.replace("'", r"\'")
  input = input.replace('"', r'\"')
  return input

def update_conversion_binary():
  """update convrsion binary files"""
  cluster_name = CONFIG.get_cr_cluster_name()
  CONFIG.stop_cluster(cluster_name)
  target_list = CONFIG.get_target_list()
  me_hostname = CONFIG.get_me_hostname()
  sym_count = CONFIG.get_sym_count()
  result = CONFIG.call_was_task('remote_install_a_version',[me_hostname, escapes_for_was(str(target_list)), str(sym_count), cluster_name],True)
  if(result.find("jobmanager task complete successfully!") > -1 and check_finish_status()):
    logging.info("All Conversion nodes update successfully.")
  else:
    raise Exception(result)
  CONFIG.start_cluster(cluster_name)

def update():
  """update product one by one """
  print "It might take a long time to update all applications. Please be patient and wait until the updating is complete."
  applist = []
  for k,v in CONFIG.comps.items():
    if(os.path.exists(v['dir'])):
      os.chdir(v['dir'])
      print "updating: [" + v['dir'] + ']'
      try:
        if(len(applist) == 0):
          applist = CONFIG.get_app_list()

        if(k in applist):
          print "processing app: [" + k + "]"
          set_lc_files_config(k)
          update_product(v['dir'], v['json_file'])
      except Exception, e:
        logging.info(v['dir'] + " update failed!")
        logging.debug(e)
      finally:
        os.chdir('../')
    else:
      pass
  print "Installation complete. Refer to iFixInstall.log for details."
if __name__ == "__main__":
  try:
    update()
  except Exception, e:
    logging.info(e)
