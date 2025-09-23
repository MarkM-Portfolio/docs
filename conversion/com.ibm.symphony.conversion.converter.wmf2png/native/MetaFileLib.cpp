// MetaFileLib.cpp : 定义 DLL 应用程序的导出函数。
//

#include "stdafx.h"
#include "com_ibm_symphony_conversion_converter_win32_WinPlatformMetaConvertor.h"
int const MAX_PATH_LEN = 1024;
int   GetEncoderClsid(const   WCHAR*   format,   CLSID*   pClsid);

bool GDIConvert(WCHAR name[] , WCHAR target[], int width, int height, double percent)
{
	
	//read source file
	Image* img = Image::FromFile(name,TRUE);

	CLSID pngClsid;
	GetEncoderClsid(L"image/png", &pngClsid);
		
	//Save to png.
	Gdiplus::Status status;

	if( width < 0 || height < 0 || percent < 0.0)
	{
		status = img->Save(target, &pngClsid);
	}
	else
	{
		if( percent > 0.0)
		{
			width = static_cast<int>( img->GetWidth() * percent + 0.5);
			height = static_cast<int>(img->GetHeight() * percent + 0.5);
		}

		Bitmap* out = new Bitmap(width, height);

		Graphics* g = Graphics::FromImage(out);
		
		g->DrawImage(img, 0, 0, width, height);

		status = out->Save(target, &pngClsid);
		
		delete out;
		delete g;
	}

	delete img;

	return status == Gdiplus::Ok;
}

JNIEXPORT jboolean JNICALL Java_com_ibm_symphony_conversion_converter_win32_WinPlatformMetaConvertor_convert__Ljava_lang_String_2Ljava_lang_String_2II
  (JNIEnv * env, jobject jObj, jstring fileName, jstring targetFileName, jint width, jint height)
{
    WCHAR name[MAX_PATH_LEN];
	WCHAR target[MAX_PATH_LEN];

	// convert fileName to WCHAR
	UINT fLength = env->GetStringLength(fileName);
	if( fLength >= MAX_PATH_LEN) return false;

	const jchar* fileNameBuffer = env->GetStringChars( fileName, 0);
	
	memcpy(name, fileNameBuffer, fLength * sizeof(WCHAR));
	name[fLength] = 0;
	env->ReleaseStringChars(fileName, fileNameBuffer);

	//convert targetFolder to WCHAR
	fLength = env->GetStringLength(targetFileName);
	if( fLength >= MAX_PATH_LEN) return false;

	const jchar* targetFileNameBuffer = env->GetStringChars( targetFileName, 0);
	memcpy(target, targetFileNameBuffer, fLength * sizeof(WCHAR));
	target[fLength] = 0;
	env->ReleaseStringChars(targetFileName, targetFileNameBuffer);

	return GDIConvert( name, target, width, height, 0.0);
}

JNIEXPORT jboolean JNICALL Java_com_ibm_symphony_conversion_converter_win32_WinPlatformMetaConvertor_convert__Ljava_lang_String_2Ljava_lang_String_2D
  (JNIEnv * env, jobject jObj, jstring fileName, jstring targetFileName, jdouble percent)
{
	WCHAR name[MAX_PATH_LEN];
	WCHAR target[MAX_PATH_LEN];

	// convert fileName to WCHAR
	UINT fLength = env->GetStringLength(fileName);
	if( fLength >= MAX_PATH_LEN) return false;

	const jchar* fileNameBuffer = env->GetStringChars( fileName, 0);
	
	memcpy(name, fileNameBuffer, fLength * sizeof(WCHAR));
	name[fLength] = 0;
	env->ReleaseStringChars(fileName, fileNameBuffer);

	//convert targetFolder to WCHAR
	fLength = env->GetStringLength(targetFileName);
	if( fLength >= MAX_PATH_LEN) return false;

	const jchar* targetFileNameBuffer = env->GetStringChars( targetFileName, 0);
	memcpy(target, targetFileNameBuffer, fLength * sizeof(WCHAR));
	target[fLength] = 0;
	env->ReleaseStringChars(targetFileName, targetFileNameBuffer);

	return GDIConvert( name, target, 0, 0, percent);
}


int   GetEncoderClsid(const   WCHAR*   format,   CLSID*   pClsid)
{
      UINT     num   =   0;                     //   number   of   image   encoders
      UINT     size   =   0;                   //   size   of   the   image   encoder   array   in   bytes

      ImageCodecInfo*   pImageCodecInfo   =   NULL;

      GetImageEncodersSize(&num,   &size);
      if(size   ==   0)
            return   -1;     //   Failure

      pImageCodecInfo   =   (ImageCodecInfo*)(malloc(size));
      if(pImageCodecInfo   ==   NULL)
            return   -1;     //   Failure

      GetImageEncoders(num,   size,   pImageCodecInfo);

      for(UINT   j   =   0;   j   <   num;   ++j)
      {
            if(   wcscmp(pImageCodecInfo[j].MimeType,   format)   ==   0   )
            {
                  *pClsid   =   pImageCodecInfo[j].Clsid;
                  free(pImageCodecInfo);
                  return   j;     //   Success
            }        
      }

      free(pImageCodecInfo);
      return   -1;     //   Failure
} 