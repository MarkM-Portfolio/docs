Build Guide

1. Requirement

OS: 	Windows 7 x64( x86 don't provide nmake for 64bits build )
SDK: 	.Net Framework 4.0.( This is required for C++ Compiler in Microsoft Windows SDK v7.1 ) http://www.microsoft.com/download/en/details.aspx?id=17851
		Microsoft Windows SDK v7.1. http://www.microsoft.com/download/en/details.aspx?id=8279

2. Build 32 bits lib

launch "Windows SDK 7.1 Command Prompt"
input command:
setenv /x86 /release
nmake targetPlatform=x86

3. Build 64 bits lib

launch "Windows SDK 7.1 Command Prompt"
input command:
setenv /x64 /release
nmake targetPlatform=x64 suffix=64

tips: The "Microsoft Visaul C++ 2010 x86/x64 Redistrabution" is required at runtime to launch the jni lib.