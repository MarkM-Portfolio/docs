# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2016. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 

import re, sys

SIGNER_FROM_PROT_STR = '[-keyStoreName %s -keyStoreScope %s -host %s -port %s -certificateAlias %s -sslConfigName %s -sslConfigScopeName %s ]'

LIST_SIGNER_CERTIFICATES = '[-keyStoreName %s -keyStoreScope %s ]'

DELETE_SIGNER_CERTIFICATES = '[-keyStoreName %s -keyStoreScope %s -certificateAlias %s ]'

def get_scope_name():
    """
    Get Scope Name 
    """
    scope_name = 'was.server1'
    scope_str = AdminTask.getManagementScope()
    matched = re.search(r'scopeName(\ )*([\w\(\)\:]*)', scope_str)
    if matched: 
        scope_name = matched.groups()[1]
        # print scope_name
    return scope_name

def get_scope_type():
    """
    Get Scope Type 
    """
    scope_type = 'node'
    scope_str = AdminTask.getManagementScope()
    matched = re.search(r'scopeType(\ )*([\w\(\)\:]*)', scope_str)
    if matched: 
        scope_type = matched.groups()[1]
        # print scope_type
    return scope_type

def add_signer_certificates(host, port):
    scope_name = get_scope_name()
    scope_type = get_scope_type()
    key_store_name = 'NodeDefaultTrustStore'
    if scope_type == 'cell':
        key_store_name = 'CellDefaultTrustStore'
    ssl_config_name = 'NodeDefaultSSLSettings'
    if scope_type == 'cell':
        ssl_config_name = 'CellDefaultSSLSettings'
    SignerFromPort = AdminTask.retrieveSignerFromPort(SIGNER_FROM_PROT_STR % (key_store_name, scope_name, host, port, host, ssl_config_name, scope_name))
    AdminTask.listSignerCertificates(LIST_SIGNER_CERTIFICATES % (key_store_name, scope_name))
    AdminConfig.save()
    print 'SignerFromPort : ' + SignerFromPort + ' Scope Name : ' + scope_name

def del_signer_certificates(host):
    scope_name = get_scope_name()
    key_store_name = 'NodeDefaultTrustStore'
    if scope_type == 'cell':
        key_store_name = 'CellDefaultTrustStore'
    SignerFromPort = AdminTask.deleteSignerCertificate(DELETE_SIGNER_CERTIFICATES % (key_store_name, scope_name, host))
    AdminTask.listSignerCertificates(LIST_SIGNER_CERTIFICATES % (key_store_name, scope_name))
    AdminConfig.save()
    print 'DeleteSigner : ' + SignerFromPort + ' Scope Name : ' + scope_name

if __name__ == '__main__':
    arglen = len(sys.argv)
    number_of_argument = 2
    if (arglen != number_of_argument):
        print "Please pass 2 arguments .."
        sys.exit(-1)
    host = sys.argv[0]
    port = sys.argv[1]
    add_signer_certificates(host, port)
    
