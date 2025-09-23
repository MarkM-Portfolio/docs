import sys, shutil, subprocess, os, os.path, string, time

if __name__ == "__main__":
  #arg list: run_jscover.py only_instrument_reg report_dir test_list_json_url
  
  if len(sys.argv) < 4:
  	print """Run JSCover server and JavaScript unit cases to generate test report and test coverage report.

Arguments: only_instrument_reg report_dir test_list_json_url 

  only_instrument_reg: This parameter will be passed to JSCover server -only-instrument-reg parameter. It should be Java style regular expressions.
    JSCover server will instrument the JavaScript file whose URL matches the regular expression on the fly. \
An example could be "(?!.*(nls).*)wseditor/js/.*", excluding the quotes. Which matches JavaScript files under the URL /wseditor/js/*, but excludes the NLS files.
  
  report_dir: Put unit case running log(as "test_run.log") and coverage report under this directory.
  
  test_list_json_url: A URL that points to a JSON file. The file must have an array listing all target test runners.
"""
  	sys.exit(-1)
  	
  DOCUMENT_ROOT = "../WebContent/js"
  JSCOVER_SERVER_ROOT = 8080
  INSTRUMENT_REG = sys.argv[1]
  REPORT_DIR = sys.argv[2]
  TEST_LIST_JSON_URL = sys.argv[3]
  
  # first clean report directory
  print "Cleaning report directory %s" % REPORT_DIR
  
  shutil.rmtree(REPORT_DIR, True)
  try:
  	os.makedirs(REPORT_DIR)
  except:
  	# ignore the error
  	pass;
  
  
  # run command 
  # java -cp utils\js.jar -jar utils\JSCover-all.jar -ws --port=8080 --document-root=..\com.ibm.concord.war\WebContent\js
  # -only-instrument-reg=(?!.*(nls).*)wseditor/js/.* --report-dir=jscover-report/

  ret = 0;
  if os.name == "nt":
  	print "Starting JSCover server"
  	
  	jscoverP = subprocess.Popen(["java.exe", "-cp", "utils\\js.jar", "-jar", "utils\\JSCover-all.jar", "-ws", "--port=8080", "--document-root=" + DOCUMENT_ROOT, "--only-instrument-reg=" + INSTRUMENT_REG, "--report-dir=" + REPORT_DIR])
  	time.sleep(5);
  	
	print "Running cases, check log at %s" % os.path.join(REPORT_DIR, "test_run.log")
  	with open(os.path.join(REPORT_DIR, "test_run.log"), "w") as f:
  		ret = subprocess.call(["utils\\phantomjs-2.1.1-windows\\bin\\phantomjs.exe", "--load-images=false", "js\jasmine_runner.js", TEST_LIST_JSON_URL], stdout=f, stderr=subprocess.STDOUT)
  	
  	print "All done, shutting down JSCover server, ret code: %d" %(ret)
  	jscoverP.terminate()
  else:
  	print "Starting JSCover server"
  	
  	INSTRUMENT_REG = string.replace(INSTRUMENT_REG, "\\!", "!")
  	jscoverP = subprocess.Popen(["java", "-cp", "utils/js.jar", "-jar", "utils/JSCover-all.jar", "-ws", "--port=8080", "--document-root=" + DOCUMENT_ROOT, "--only-instrument-reg=" + INSTRUMENT_REG, "--report-dir=" + REPORT_DIR])
  	time.sleep(5);
  	
	print "Running cases, check log at %s" % os.path.join(REPORT_DIR, "test_run.log") 
	subprocess.call(["chmod", "+x", "utils/phantomjs-2.1.1-linux-x86_64/bin/phantomjs"])
  	with open(os.path.join(REPORT_DIR, "test_run.log"), "w") as f:
  		ret = subprocess.call(["utils/phantomjs-2.1.1-linux-x86_64/bin/phantomjs", "--load-images=false", "./js/jasmine_runner.js", TEST_LIST_JSON_URL], stdout=f, stderr=subprocess.STDOUT)
  	
  	print "All done, shutting down JSCover server, ret code: %d" %(ret)
  	jscoverP.terminate() 
  	
sys.exit(ret)
