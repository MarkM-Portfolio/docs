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


import re

def check_ic_role(args):
    from util import wsadminlib
    wsadminlib.enableDebugMessages()

    apps = []
    apps.extend(args)
    all_apps = wsadminlib.listApplications()

    result = ''

    uuid = 'ee82b619-0900-4a10-9f5a-00b91377a6bf'

    for app in apps:
        app_tag = ''.join([app,'(',uuid,')'])
        app_result = ''
        if app in all_apps:
            role_view = AdminApp.view(app,'-MapRolesToUsers')
            app_result = role_view

        app_result = ''.join([app_tag,app_result,app_tag]) 
        result += app_result

    print result
    return      

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 1:
        print 'Invalid parameters for application, pass at least one parameter'
        sys.exit(-1)
    check_ic_role(sys.argv)


