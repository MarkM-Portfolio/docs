CPP_FLAGS = -c /MD -Zi /O2 /Oi /D "_WINDLL" /D "_UNICODE" /D "UNICODE" /GS

EXE_LINK_FLAGS = /INCREMENTAL:NO /NOLOGO

LIBS = 	$(targetPlatform)/SetLocalSecurity.obj \
				$(targetPlatform)/stdafx.obj

all: build

SetLocalSecurity.obj: SetLocalSecurity.cpp
 cl $(CPP_FLAGS) SetLocalSecurity.cpp -Fo$(targetPlatform)/SetLocalSecurity.obj

stdafx.obj: stdafx.cpp
 cl $(CPP_FLAGS) stdafx.cpp -Fo$(targetPlatform)/stdafx.obj

build: SetLocalSecurity.obj stdafx.obj
 link $(EXE_LINK_FLAGS) $(LIBS) -out:$(targetPlatform)/setrights.exe

