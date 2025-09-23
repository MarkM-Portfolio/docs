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

echo Prepare python27 environment...
start /wait vcredist_x86.exe /q /norestart

set old_path=%path%
set path="./Python";%path%

set PYTHONPATH=%PYTHONPATH%;%CD%
python icext/uninstall.py -configFile "%cfgFile%" -build "%buildDir%" %*
set path=%old_path%
'''

GUNINSTALL_LNX=\
'''#!/bin/sh

export PYTHONPATH=$PYTHONPATH:$PWD
python3 icext/uninstall.py -configFile "${cfgFile}" -build "${buildDir}" "$@"
'''


