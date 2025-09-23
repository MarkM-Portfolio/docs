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

import os
import shutil
import logging
import sys

from commands import command
from icext.config import CONFIG as CFG

class ShowLicense(command.Command):

    def __init__(self):
        pass

    def readCfg(self, cfg=None):
        return True

    def do(self):
        logging.info("Start to show license...")

        license_path = os.path.join(CFG.get_build_dir(),'License','LI_en.txt')

        if not os.path.exists(license_path):
            logging.warn("Cannot find license from path: %s" % (license_path))
            return False

        license_file = open(license_path)

        line_per_page = 80
        current_page_index = 0

        license_lines = license_file.readlines()
        license_file.close()

        page_list = []

        div,mod = divmod(len(license_lines),line_per_page)
        if div == 0:
            div = 1
        for page_index in range(div):
            page_list.append(license_lines[(line_per_page * page_index):(line_per_page * (page_index + 1) - 1)])
        if mod != 0:
            page_list.append(license_lines[(line_per_page * page_index):len(license_lines)])

        while True:
            for line in page_list[current_page_index]:
                print line,

            prompt_message = '\nHere is the software license (%d/%d), do you read and accept it? (a)ccept,(r)eject, '\
                    % (current_page_index+1,len(page_list))
            if current_page_index == 0:
                prompt_message = prompt_message  + '(n)ext page...'
            elif current_page_index == len(page_list) - 1 :
                prompt_message = prompt_message  + '(p)revious page...'
            else:
                prompt_message = prompt_message  + '(n)ext page,(p)revious page...'

            print prompt_message

            response = sys.stdin.readline()[:-1]

            if response in ['', None]:
                response = 'n'

            tag = response[0].lower()

            if tag == 'a':
                logging.info('License accepted, continue installation.')
                return True
            elif tag == 'r':
                logging.info('License rejected, quit installation.')
                return False
            elif tag == 'n' and current_page_index < (len(page_list) - 1):
                current_page_index = current_page_index + 1
                continue
            elif tag == 'p' and current_page_index > 0:
                current_page_index = current_page_index - 1
                continue
            else:
                continue

        return True

    def undo(self):
        return True
