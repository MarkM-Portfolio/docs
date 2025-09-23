This document describes how to use the script to disable/enable the Docs servers in proxy server.

1. Login to Docs proxy server, switch to user 'root': su root. Go to directory: /opt/ll/scripts/docsrp.
2. Run the command to disable Docs servers, for example: 
       python manageServers.py -disable usdl1-acb0-docs1 usdl1-acb0-docs2
   Also can run the command to enable Docs servers, for example:
       python manageServers.py -enable usdl1-acb0-docs1 usdl1-acb0-docs2
   Also can disable/enable Docs servers in one command, for example:
       python manageServers.py -enable usdl1-acb0-docs1 -disable usdl1-acb0-docs2
(Note: usdl1-acb0-docs1, usdl1-acb0-docs2 are the short host name of Docs servers, you can run the command on Docs server 
to get the full host name: echo $HOSTNAME, output likes this: usdl1-acb0-docs1.docsdev.cn.ibm.com, the short host name is 
the first part of the full host name, like: usdl1-acb0-docs1)
