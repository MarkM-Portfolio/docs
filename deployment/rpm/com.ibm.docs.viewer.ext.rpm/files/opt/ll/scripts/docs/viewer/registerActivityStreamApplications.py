import time

execfile("/opt/ll/scripts/ac/wsadminlib.py")
    
#make certain that News is running before loading newsAdmin.py
newsIsRunning = False
while newsIsRunning == False:
	newsIsRunning = isApplicationRunning('News')
	time.sleep(10)

batchMode = 1
execfile("newsAdmin.py")

appsDomain = "apps." + sys.argv[0]

#IBM Docs:
docs_id = "IBMDocs" 
docs_url = "https://" + appsDomain + "/docs"
docs_icon = ""
docs_display = "Docs"

NewsActivityStreamService.registerApplication(docs_id, docs_display, docs_url, docs_url, docs_icon, docs_icon, docs_display, "true")
NewsActivityStreamService.updateApplicationRegistrationForEmailDigest(docs_id, "true", "INDIVIDUAL", "false")