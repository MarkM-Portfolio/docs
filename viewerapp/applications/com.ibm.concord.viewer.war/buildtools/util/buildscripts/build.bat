set NODE_HOME=%~dp0..\..\nodejs
@rem set PATH=%NODE_HOME%;%PATH%
set NODE_PATH=%~dp0..\..\
set CLASSPATH=%~dp0../shrinksafe/js.jar;%~dp0../shrinksafe/shrinksafe.jar;%~dp0../closureCompiler/compiler.jar;%CLASSPATH%

@rem Something like this will be required for cygwin... node is not 100% confirmed working at this point
%NODE_HOME%\node ../../dojo/dojo.js load=build %*

@rem java -Xms1024m -Xmx1024m  -cp "%~dp0../shrinksafe/js.jar";"%~dp0../closureCompiler/compiler.jar";"%~dp0../shrinksafe/shrinksafe.jar" org.mozilla.javascript.tools.shell.Main  "%~dp0../../dojo/dojo.js" baseUrl="%~dp0../../dojo" load=build %*

@rem java -classpath ../shrinksafe/js.jar;../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main build.js %*

@rem java -Xms256m -Xmx256m -classpath ../shrinksafe/js.jar;../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main  build.js %*
