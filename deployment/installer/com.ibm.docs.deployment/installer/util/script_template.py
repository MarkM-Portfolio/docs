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


GUNINSTALL_W32=\
'''@echo off
set PYTHONPATH=%PYTHONPATH%;%CD%
python docs/uninstall.py -configFile "%cfgFile%" -build "%buildDir%" %*
'''

GUNINSTALL_LNX=\
'''#!/bin/sh
export PYTHONPATH=$PYTHONPATH:$PWD
python3 docs/uninstall.py -configFile "${cfgFile}" -build "${buildDir}" "$@"
'''


