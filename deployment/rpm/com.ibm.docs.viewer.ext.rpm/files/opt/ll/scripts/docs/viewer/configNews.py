# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# OCO Source Materials                                              
#                                                                   
# Copyright IBM Corp. 2012, 2014                                    
#                                                                   
# The source code for this program is not published or otherwise    
# divested of its trade secrets, irrespective of what has been      
# deposited with the U.S. Copyright Office.                         
#                                                                   
# ***************************************************************** 

import sys, getopt, os;

execfile('/opt/ll/scripts/ac/wsadminlib.py')

def create_shared_lib(spec):
    libraryName = spec['name']
    cellName = AdminControl.getCell()
    cell = AdminConfig.getid("/Cell:" + cellName + "/")
    eLibraries = AdminConfig.list("Library", cell)
    if spec['path'] != None:
        if eLibraries :
            eLibraries = eLibraries.splitlines()
            for eLib in eLibraries:
                libName = AdminConfig.showAttribute(eLib, "name")
                if( libName == libraryName and spec['path'] != None ):
                    print 'Removing existing library: ' + libName
                    AdminConfig.remove(eLib)
                    #AdminConfig.save()
        library = AdminConfig.create('Library', cell, [['name', spec['name']], ['classPath', spec['path']], ['isolatedClassLoader', 'false']])
        AdminConfig.save()
        print "Shared library [%s] created" % libraryName

    deployment = AdminConfig.getid("/Deployment:" + spec['deploymentName'] + "/")
    appDeploy = AdminConfig.showAttribute(deployment, 'deployedObject')
    classLoad1 = AdminConfig.showAttribute(appDeploy, 'classloader')
    eLibRefs = AdminConfig.list("LibraryRef", classLoad1)
    if eLibRefs :
        eLibRefs = eLibRefs.splitlines()
        for eLib in eLibRefs :
            eLibName = AdminConfig.showAttribute(eLib, "libraryName")
            if (eLibName == libraryName) :
                print "Existing library ref " + eLibName + " will be removed"
                AdminConfig.remove(eLib)
    AdminConfig.create('LibraryRef', classLoad1, [['libraryName', libraryName]])
    AdminConfig.save()
    print "Library reference created."

def registerEventHandler(config_file, handler):
    events = open(config_file, 'r')
    try:
        lines = events.readlines()
    except Exception, e:
        print e
        print 'Failed to read event config file.'
        return
        
    newLines = []
    if lines:
        for line in lines:
            if line.find('</postHandlers>') >= 0:
                for x in handler:
                    newLines.append(x + '\n')
            newLines.append(line)
    try:
        newConfig = open(config_file, 'w')
        newConfig.writelines(newLines)
        newConfig.close()
        print "Docs events registered."
    except Exception, e:
        print e
        print 'Failed to write event config file.'
    
# minidom does not work in jython
# http://bugs.jython.org/issue1401509
def registerEventHandler2(config_file, handler):
    from xml.dom.minidom import parse
    from xml.dom.minidom import Document
    
    doc = parse(config_file)
    root = doc.documentElement
    postHanlersElem = root.getElementsByTagName("postHandlers")[0]
    postHandlers = postHanlersElem.getElementsByTagName("postHandler")
    
    postHandler = doc.createElement("postHandler")
    postHandler.setAttribute("class", handler['class'])
    postHandler.setAttribute("enabled", "true")
    postHandler.setAttribute("invoke", "ASYNC")
    postHandler.setAttribute("name", handler['name'])
    
    subscriptions = doc.createElement("subscriptions")
    for sub in handler['subs']:
        subscription = doc.createElement("subscription")
        subscription.setAttribute("eventName", sub['eventName']) #"files.file.created")  
        subscription.setAttribute("source", sub['source']) #"FILES")  
        subscription.setAttribute("type", sub['type']) #"CREATE")  
        subscriptions.appendChild(subscription)
    
    postHandler.appendChild(subscriptions)
    postHanlersElem.appendChild(postHandler)
    
    file_object = open(self.news_event_config_filepath, 'w')
    file_object.write(self.to_pretty_xml(doc).decode("utf-8"))
    file_object.close()
    print 'Events registration finished.'

sl_specs = [
    {'name': 'LotusLive_Docs_Event_SPI', 'path': '${WAS_INSTALL_ROOT}/optionalLibraries/IBM/LotusLive/docs.daemon', 'deploymentName': 'News'},
]
            
for sl in sl_specs:
    create_shared_lib(sl)

viewer_handler = {
    'name': 'ViewerUploadHandler',
    'class': 'com.ibm.concord.viewer.lcfiles.daemon.ViewerUploadHandler',
    'subs': [
        { 'eventName': 'files.file.created', 'source': 'FILES', 'type': 'CREATE' },
        { 'eventName': 'files.file.updated', 'source': 'FILES', 'type': 'UPDATE' },
        { 'eventName': 'files.command.createthumbnail', 'source': 'FILES', 'type': 'COMMAND' },
        { 'eventName': 'files.file.deleted', 'source': 'FILES', 'type': 'DELETE' },
        { 'eventName': 'files.file.undeleted', 'source': 'FILES', 'type': 'RESTORE' }
    ]
}

docs_handlers = [
    '        <postHandler class="com.ibm.concord.viewer.lcfiles.daemon.ViewerUploadHandler" enabled="true" invoke="ASYNC" name="ViewerUploadHandler">',
    '            <subscriptions>',
    '                <subscription eventName="files.file.created" source="FILES" type="CREATE"/>',
    '                <subscription eventName="files.file.updated" source="FILES" type="UPDATE"/>',
    '                <subscription eventName="files.command.createthumbnail" source="FILES" type="COMMAND"/>',
    '                <subscription eventName="files.file.deleted" source="FILES" type="DELETE"/>',
    '                <subscription eventName="files.file.undeleted" source="FILES" type="RESTORE"/>',
    '            </subscriptions>',
    '        </postHandler>',
    '        <postHandler class="com.ibm.docs.lcfiles.daemon.handlers.DocsEventHandler" enabled="true" invoke="ASYNC" name="DocsEventHandler">',
    '            <subscriptions>',
    '                <subscription eventName="files.file.created" source="FILES" type="CREATE"/>',
    '                <subscription eventName="files.file.updated" source="FILES" type="UPDATE"/>',
    '                </subscriptions>',
    '        </postHandler>'
]


registerEventHandler('/opt/IBM/WebSphere/AppServer/profiles/Dmgr01/config/cells/ocs_cell/LotusConnections-config/events-config.xml', docs_handlers)

AdminConfig.save()