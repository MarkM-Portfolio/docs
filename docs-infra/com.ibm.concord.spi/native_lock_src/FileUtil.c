#include <jni.h>
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include "com_ibm_concord_spi_util_NativeFileLocker.h"

JNIEXPORT jint JNICALL Java_com_ibm_concord_spi_util_NativeFileLocker_lock
  (JNIEnv *env, jobject thiz,jstring filename)
{
	int fd;
	const char* fn=(*env)->GetStringUTFChars(env,filename,NULL);
//	extern int errno;
	fd=open(fn,O_WRONLY|O_CREAT,0644);
	if(fd!=-1)
	{
		printf("Open file successfully.\n");
		if(flock(fd,LOCK_EX|LOCK_NB)==0)
		{
			printf("file was locked successfully.\n");
		}
		else
		{
			printf("file was locked by others already.\n");
			close(fd);
			fd= -2;
		}
	}
	else
	{
		printf("Open file failed.\n");
		fd= -1;
	}
	(*env)->ReleaseStringUTFChars(env,filename,fn);
	printf("JNI Opened file %d.\n",fd);
	return fd;
}

/*
 * Class:     com_ibm_concord_viewer_fileUtil_FileLocker
 * Method:    unlock
 * Signature: (I)I
 */
JNIEXPORT jint JNICALL Java_com_ibm_concord_spi_util_NativeFileLocker_unlock
(JNIEnv *env, jobject thiz,jint fd)
{
	printf("JNI Closed file %d.\n",fd);
	if(flock(fd,LOCK_UN)==0)
	{
	    printf("The file was unlocked.\n");
	    close(fd);
	    return 1;
	}
	else
	{
	    printf("The file was still locked.\n");
	    close(fd);
	    return -1;
	}
}
