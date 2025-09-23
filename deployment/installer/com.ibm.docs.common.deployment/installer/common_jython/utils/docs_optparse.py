# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# HCL Docs Source Materials
#
# Copyright HCL Technologies Limited 2014, 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

import sys

class Option:
  def __init__(self, key, need_value, default, metavar, help_content):
    self.key = key
    self.need_value = need_value
    self.default = default
    self.value = default
    self.metavar = metavar
    self.help_content = help_content

class DocsOptionParser:
  """
  Simple usage example:
  from common_jython.utils.docs_optparse import DocsOptionParser
  optparser = DocsOptionParser()
  optparser.add_option("-configFile", True, "./cfg.properties", "<file>", "Specifies the configuration file");
  optparser.add_option("-acceptLicense", False, "false", "", "Specifies that license is accepted automatically");
  options = optparser.parse_args()
  cfg_path = options["-configFile"]
  accept_license = options["-acceptLicense"]
  """

  def __init__(self):
    self.options = []

  def add_option(self, key, need_value, default, metavar, help_content):
    """
    Add a command-line option
    key: the option, e.g. "-configFile"
    need_value: if the option needs a value, for "-configFile" is True and "-acceptLicense" is Flase
    default: the default value for the option if absent in the command-line
    metavar: the meta for the option value in the help info, e.g. "<file>" for "-configFile"
    help_content: the help content for the option
    """
    option = Option(key, need_value, default, metavar, help_content)
    self.options.append(option)

  def add_options(self, new_options):
    for opt in new_options:
      self.options.append(opt)

  def parse_args(self):
    """
    Parse the command-line options found in 'args' (default: sys.argv[1:]).
    Any errors result in printing the usage message and calling sys.exit().
    On success returns a dictionary result with all your option keys and values.
    """
    result = {}
    for option in self.options:
      result[option.key] = option.value

    args = sys.argv[1:]
    count = len(args)
    if "-h" in args:
      self.usage()
      sys.exit()

    for i in range(count):
      arg = args[i]
      if arg[0] != "-":
        continue

      arg_valid = False
      for option in self.options:
        if arg == option.key:
          arg_valid = True
          break;

      if not arg_valid:
      	self.usage()
        sys.exit()

      if not option.need_value:
      	result[arg] = "true"
        continue

      if i + 1 == count or args[i + 1] == "" or args[i + 1] == "-":
        self.missingValue(arg)
        sys.exit()
      result[arg] = args[i + 1]

    return result

  def usage(self):
    print "Options:"
    for option in self.options:
      help = ""
      current_line = "  " + option.key + " " + option.metavar
      if len(current_line) >= 24:
        help = help + current_line + "\n"
        current_line = " " * 24
      else:
        current_line = current_line + " " * (24 - len(current_line))

      for word in option.help_content.split(" "):
        if len(current_line + word + " ") >= 80:
          help = help + current_line + "\n"
          current_line = " " * 24 + word + " "
        else:
          current_line = current_line + word + " "

      help = help + current_line

      print help

  def missingValue(self, key):
    print "The value for %s does not exist. Check the value for errors and try again." % key
    self.usage()


# all the possible options for docs
opt_help = Option("-h", False, "", "", "Show this help message and exit.")
opt_config_file = Option("-configFile", True, "./cfg.properties", "<file>",
    "Specifies the configuration file. cfg.properties in current directory is used if none specified.");
opt_node_config_file = Option("-configFile", True, "./cfg.node.properties", "<file>",
    "Specifies the configuration file. cfg.node.properties in current directory is used if none specified.");
opt_build = Option("-build", True, "../", "<directory>",
    "Specifies the location of the product binaries. The folder that contains current folder is used if none specified.");
opt_was_admin_id = Option("-wasadminID", True, "", "<name>",
    "Specifies the user name of the WebSphere Application Server administrator. Prompted during installation if none specified.");
opt_was_admin_pw = Option("-wasadminPW", True, "", "<pwd>",
    "Specifies the password of the WebSphere Application Server administrator. Prompted during installation if none specified.");
opt_db_admin_id = Option("-dbadminID", True, "", "<name>",
    "Specifies the user name of the database instance. Prompted during installation if none specified.");
opt_db_admin_pw = Option("-dbadminPW", True, "", "<pwd>",
    "Specifies the password of the database instance. Prompted during installation if none specified.");
opt_accept_license = Option("-acceptLicense", False, "false", "",
    "Specifies that license is accepted automatically. Prompted during installation if not specified.");
opt_silently_install = Option("-silentlyInstall", False, "false", "",
    "Specifies that the installation is running in a silent mode. All issues will display during the installation, but will not block it.");
opt_map_webserver = Option("-mapWebserver", False, "false", "",
    "Set it to be true only if there's one IBM HTTP Server in front of Viewer Cluster.");
opt_docs_install_root = Option("-installRoot", True, "", "<directory>",
    "Specifies the path to install root of IBMDocs. Required for the upgrade to start.");
opt_icext_install_root = Option("-installRoot", True, "", "<directory>",
    "(Required) Specifies the location of the current installation of the HCL Docs component. " + \
    "If related component does not have an installation root, specifies the parent folder for cfg.properties.");
opt_timestamp = Option("-time", True, "", "<name>", "Time stamp for the (un)installation");
opt_retry = Option("-retry", False, "false", "", "Retry");
opt_im = Option("-im", False, "false", "", "IM");

def get_docs_cmd_options():
  try:
    parser = DocsOptionParser()
    parser.add_options([opt_help])

    default_install_opts = [opt_build, opt_was_admin_id, opt_was_admin_pw, opt_accept_license, opt_timestamp, opt_im]
    default_upgrade_opts = default_install_opts
    default_uninstall_opts = [opt_build, opt_was_admin_id, opt_was_admin_pw, opt_timestamp, opt_im]

    {"docs/install.py":lambda:parser.add_options(default_install_opts + [opt_config_file, opt_db_admin_id, opt_db_admin_pw, opt_silently_install, opt_retry, opt_map_webserver]),
     "docs/install_node.py":lambda:parser.add_options(default_install_opts + [opt_node_config_file, opt_db_admin_id, opt_db_admin_pw, opt_silently_install]),
     "docs/uninstall.py":lambda:parser.add_options(default_uninstall_opts + [opt_config_file]),
     "docs/uninstall_node.py":lambda:parser.add_options(default_uninstall_opts + [opt_node_config_file]),
     "docs/upgrade.py":lambda:parser.add_options(default_upgrade_opts + [opt_docs_install_root, opt_db_admin_id, opt_db_admin_pw, opt_silently_install, opt_retry]),
     "docs/upgrade_node.py":lambda:parser.add_options(default_upgrade_opts + [opt_docs_install_root, opt_db_admin_id, opt_db_admin_pw, opt_silently_install]),
     "icext/install.py":lambda:parser.add_options(default_install_opts + [opt_config_file, opt_silently_install]),
     "icext/uninstall.py":lambda:parser.add_options(default_uninstall_opts + [opt_config_file]),
     "icext/upgrade.py":lambda:parser.add_options(default_upgrade_opts + [opt_icext_install_root, opt_silently_install]),
     "proxy/install.py":lambda:parser.add_options(default_install_opts + [opt_config_file]),
     "proxy/update_webserver.py":lambda:parser.add_options(default_install_opts + [opt_config_file]),
     "proxy/uninstall.py":lambda:parser.add_options(default_uninstall_opts + [opt_config_file]),
     "proxy/upgrade.py":lambda:parser.add_options(default_upgrade_opts + [opt_docs_install_root]),
     "conversion/install.py":lambda:parser.add_options(default_install_opts + [opt_config_file, opt_silently_install, opt_retry, opt_map_webserver]),
     "conversion/install_node.py":lambda:parser.add_options(default_install_opts + [opt_node_config_file, opt_silently_install]),
     "conversion/uninstall.py":lambda:parser.add_options(default_uninstall_opts + [opt_config_file]),
     "conversion/uninstall_node.py":lambda:parser.add_options(default_uninstall_opts + [opt_node_config_file]),
     "conversion/upgrade.py":lambda:parser.add_options(default_upgrade_opts + [opt_docs_install_root, opt_silently_install, opt_retry]),
     "conversion/upgrade_node.py":lambda:parser.add_options(default_upgrade_opts + [opt_docs_install_root, opt_silently_install])
    }[sys.argv[0]]()

    result = parser.parse_args()

    try:
      if (sys.argv[0]).index("upgrade") > 0:
        result["-installRoot"] = result["-installRoot"].replace('__docsspace__', ' ')
        install_root = result["-installRoot"]
        if install_root == "":
          print "Upgrade cannot start until you add the parameter -installRoot {directory}"
          sys.exit()
        result["-configFile"] = install_root + "/cfg.properties"
        if sys.argv[0] == "proxy/upgrade.py" and install_root != ".":
          result["-configFile"] = install_root + "/proxy/cfg.properties"
        try:
          if (sys.argv[0]).index("upgrade_node") > 0:
            result["-configFile"] = install_root + "/cfg.node.properties"
        except ValueError:
          pass
    except ValueError:
      pass

    if result.get('-time') == "":
      del result['-time']
    return result

  # for the python scripts not listed, e.g. conversion/installCF.py
  except KeyError:
    return {"-configFile":"./cfg.properties", "-build":"../", "-im":"false"}

# a dictionary with all your commond line option keys and values, e.g. OPTIONS["-configFile"]
OPTIONS = get_docs_cmd_options()
OPTIONS['command'] = sys.argv[0]
