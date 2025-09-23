
set CLASSPATH=D:\Viewerblds\Project_WebViewer\com.ibm.concord.viewer.war\buildtools\util\shrinksafe\js.jar;D:\Viewerblds\Project_WebViewer\com.ibm.concord.viewer.war\buildtools\util\shrinksafe\shrinksafe.jar;D:\Viewerblds\Project_WebViewer\com.ibm.concord.viewer.war\buildtools\util\closureCompiler\compiler.jar;%CLASSPATH%
rem set NODE_PATH=d:\Viewerblds\Project_WebViewer\com.ibm.concord.viewer.war\buildtools\util\node_modules
set NODE_PATH=d:\Viewerblds\Project_WebViewer\com.ibm.concord.viewer.war\buildtools

node ../../dojo/dojo.js load=build action=clean,release mini=true profile=viewer layerOptimize=uglify releaseDir=./out/ cssOptimize=comments optimize=uglify selectorEngine=acme copyTests=false uglifyjs=../../../buildtools/uglifyjs/UglifyJS-1.3.5/bin/uglifyjs