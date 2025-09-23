@rem set NODE_HOME=C:\Users\IBM_ADMIN\Downloads\node
@rem set PATH=%NODE_HOME%;%PATH%
@rem Something like this will be required for cygwin... node is not 100% confirmed working at this point
@rem node ../../dojo/dojo.js load=build %*
@echo off
if "%JAVA7_HOME%"=="" (set JAVA7_HOME = %BUILD_ROOT%\Java7)

%JAVA7_HOME%\bin\java -Xms256m -Xmx1024m -jar "%~dp0../closureCompiler/compiler.jar" --language_in ECMASCRIPT5 --warning_level QUIET --compilation_level SIMPLE_OPTIMIZATIONS %*

@rem java -classpath ../shrinksafe/js.jar;../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main build.js %*

@rem java -Xms256m -Xmx256m -classpath ../shrinksafe/js.jar;../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main  build.js %*
