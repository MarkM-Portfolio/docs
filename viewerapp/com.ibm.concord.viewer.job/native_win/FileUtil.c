#include <jni.h>
#include <stdio.h>
#include <stdlib.h>

#include "windows.h"
#include <assert.h>
#include <io.h>
#include <FCNTL.H>

//#define DEBUG 0

#include "com_ibm_concord_viewer_services_fileUtil_WinFileLocker.h"

JNIEXPORT jint JNICALL Java_com_ibm_concord_viewer_services_fileUtil_WinFileLocker_lock
  (JNIEnv *env, jobject thiz, jstring filename)
{
	HANDLE hFile;
	DWORD dwBytesRead = 0;
	OVERLAPPED offset =	{0, 0, 0, 0, NULL};
	
	const char *fname = (*env)->GetStringUTFChars(env, filename, NULL);
	
	// Open the existing file.
	hFile = CreateFile( fname,			  //
						GENERIC_READ,			      // open for reading
						0,						          // do not share
						NULL,					          // no security
						OPEN_ALWAYS,			      // existing file only
						FILE_ATTRIBUTE_NORMAL,  // normal file
						NULL);					        // no attr. template
						
  (*env)->ReleaseStringUTFChars(env, filename, fname);

	if (hFile == INVALID_HANDLE_VALUE)
	{
    printf("Can't open/create file, last error code is %d.\n", GetLastError());

		return -2;
	}

//	BYTE buff[4096];	
//	bool bread = ReadFile(hFile, buff, sizeof(buff), &dwBytesRead, NULL);
//	if (dwBytesRead == 0)
//	{
//		cerr<<"can't read file or are locked"<<endl;
//		return false;
//	}

	if (LockFileEx( hFile, LOCKFILE_EXCLUSIVE_LOCK | LOCKFILE_FAIL_IMMEDIATELY,
		0, dwBytesRead, 0, &offset))
	{		
#ifdef DEBUG
    printf("File locked successfully.\n");
#endif
	}
	else
	{
    printf("File not locked with last error code %d.\n", GetLastError());
		CloseHandle(hFile);

		return -1;
	}
	
	return (jint)hFile;
}


/*
 * Class:     com_ibm_concord_viewer_fileUtil_FileLocker
 * Method:    unlock
 * Signature: (I)I
 */
JNIEXPORT jint JNICALL Java_com_ibm_concord_viewer_services_fileUtil_WinFileLocker_unlock
(JNIEnv *env, jobject thiz, jint fd)
{
	HANDLE hFile = (HANDLE)fd;
	DWORD dwBytesRead = 0;
	OVERLAPPED offset =	{0, 0, 0, 0, NULL};
	BOOL rc = 0;
	
	if (fd == -1 || fd == -2 || hFile == INVALID_HANDLE_VALUE) {       // invalid handle
		return -1;
  }

	rc = UnlockFileEx(hFile, 0, dwBytesRead, 0, &offset); // This always returns False...why 
#ifdef DEBUG
    printf("return value from UnlockFileEx %d.\n", rc);
#endif
	CloseHandle(hFile);
	if (rc==0) {
		printf("Unlock file failed with error code %d.\n", GetLastError());
		return -1;
	}
	
  return 1;
}

//int main(int argc, char* argv[])
//{	
//	char    *filename = "two.txt";
//	lockFile( filename );	
//	return 0;
//}
