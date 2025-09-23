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

import os, sys, getpass


def read_was_credential():
  sys.stdout.write("\nPlease enter the WebSphere Proxy Server credentials.\n\n")
  sys.stdout.write("WAS Administrative Username: ")
  name = sys.stdin.readline()[:-1]

  pw = getpass.getpass("WAS Administrator Password: ")
  return (name, pw)

def read_db_credential():
    sys.stdout.write('\nPlease enter the DB credentials.\n\n')
    sys.stdout.write('DB Instance User Name: ')
    name = sys.stdin.readline()[:-1]

    pw = getpass.getpass('DB Instance User Password: ')
    return (name, pw)
