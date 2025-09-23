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
from common import command, CFG, call_wsadmin

class CheckICRole(command.Command):
    '''
    This command will check if IC applications has the valid role/user map.
    '''

    def __init__(self):
        pass

    def readCfg(self,cfg=None):
        pass

    def do(self):
        log.info('Start to check if HCL Connections has valid role/user map...')

        #apps = ['Files','Activities','Communities',]
        apps = ['Files','Communities']
        roles = set(['admin','widget-admin','search-admin'])

        args = CFG.get_was_cmd_line()
        args.extend(['-f','./icext/tasks/' + __name__.split('.')[1] + '.py'])
        args.extend(apps)

        succ,output = call_wsadmin(args)

        if not succ:
            log.warn('Failed to check role/user map, please manually verify')
            return True

        role_tag = 'Role:'
        user_tag = 'Mapped users:'
        uuid = 'ee82b619-0900-4a10-9f5a-00b91377a6bf'

        for app in apps:
            check_succ = True
            app_tag = ''.join([app,'(',uuid,')'])
            app_result = output.split(app_tag)[1]

            if app_result == '':
                check_succ = False
                log.warn('Cannot find application "%s", please manually check applications ' % app)
                continue

            wait_role = set(roles)
            if app == 'Communities':
                wait_role.remove('widget-admin')
            lines = app_result.splitlines()
            role_map = [ x for x in lines if x.startswith(role_tag) or x.startswith(user_tag)]

            for i in range(0,len(role_map),2):
                pure_role = role_map[i].replace(role_tag,'').strip()
                if pure_role not in wait_role:
                    continue
                wait_role.remove(pure_role)
                pure_users = role_map[i+1].replace(user_tag,'').strip()
                if pure_users == '':
                    check_succ = False
                    log.warn('Application "%s" role "%s" has no users, please manually check users' % (app,pure_role))

            if len(wait_role) > 0:
                check_succ = False
                log.warn('Application "%s" cannot find role "%s" ,please manually check roles' % (app,','.join(wait_role)))

            if check_succ:
                log.info('Application "%s" role/user maps are valid.' % app)

        log.info('Complete to check if HCL Connections has valid role/user map')
        return True

    def undo(self):
        log.info('No uninstall actions for role/user map')
        return True
