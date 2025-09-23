CPP_FLAGS = /I"C:\Program Files\Java\jdk1.6.0_29\include" /I"C:\Program Files\Java\jdk1.6.0_29\include\win32" -c /MD -Zi /O2 /Oi /D "_WINDLL" /D "_UNICODE" /D "UNICODE" /GS

EXE_LINK_FLAGS = 
DLL_LINK_FLAGS = -DLL


LIBS = 	$(targetPlatform)/dllmain.obj \
				$(targetPlatform)/GlobalApp.obj \
				$(targetPlatform)/MetaFileLib.obj \
				$(targetPlatform)/stdafx.obj
				
all: clean init MetaFileLib.dll


dllmain.obj: dllmain.cpp
 cl $(CPP_FLAGS) dllmain.cpp -Fo$(targetPlatform)/dllmain.obj
 
GlobalApp.obj: GlobalApp.cpp
 cl $(CPP_FLAGS) GlobalApp.cpp -Fo$(targetPlatform)/GlobalApp.obj
 
MetaFileLib.obj: MetaFileLib.cpp
 cl $(CPP_FLAGS) MetaFileLib.cpp -Fo$(targetPlatform)/MetaFileLib.obj
 
stdafx.obj: stdafx.cpp
 cl $(CPP_FLAGS) stdafx.cpp -Fo$(targetPlatform)/stdafx.obj

MetaFileLib.dll: dllmain.obj GlobalApp.obj MetaFileLib.obj stdafx.obj
 link $(DLL_LINK_FLAGS) $(LIBS) -out:$(targetPlatform)/MetaFileLib$(suffix).dll

clean:
		@del /s $(targetPlatform)
init:
    @echo build for $(targetPlatform)
    @mkdir $(targetPlatform)