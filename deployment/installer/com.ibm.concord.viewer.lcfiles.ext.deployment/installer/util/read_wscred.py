# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

# -*- encoding: utf8 -*-
import os, sys, getpass


def read_was_credential():
  sys.stdout.write("\nPlease enter the WebSphere Application Server credentials.\n\n")
  sys.stdout.write("WAS Administrative Username: ")
  name = sys.stdin.readline()[:-1]

  pw = getpass.getpass("WAS Administrator Password: ")
  return (name, pw)


