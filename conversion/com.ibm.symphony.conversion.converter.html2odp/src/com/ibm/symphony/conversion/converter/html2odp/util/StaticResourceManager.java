package com.ibm.symphony.conversion.converter.html2odp.util;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;

public class StaticResourceManager
{
  private static final String CLASS = StaticResourceManager.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static final String IMAGE_HOLDER_IMG = "ImageHolder.png";

  public static boolean copyImageHolder(String destRoot)
  {
    BufferedOutputStream fout = null;
    BufferedInputStream fin = null;
    try
    {
      File targetFolder = new File(destRoot + File.separator + ODPConvertConstants.FILE_PICTURE_PREFIX);
      if (!targetFolder.exists())
        targetFolder.mkdirs();

      fout = new BufferedOutputStream(new FileOutputStream(targetFolder.getPath() + File.separator + IMAGE_HOLDER_IMG));
      fin = new BufferedInputStream(StaticResourceManager.class.getResourceAsStream(IMAGE_HOLDER_IMG));
      byte b[] = new byte[2048];

      int len;
      while ((len = fin.read(b)) != -1)
      {
        fout.write(b, 0, len);
      }
    }
    catch (FileNotFoundException e)
    {
      log.warning(e.getLocalizedMessage());
      return false;
    }
    catch (IOException e)
    {
      log.warning(e.getLocalizedMessage());
      return false;
    }
    finally
    {
      ODPMetaFile.closeResource(fin);
      ODPMetaFile.closeResource(fout);
    }
    return true;
  }

  public static InputStream getResourceFile(String fileName)
  {
    InputStream is = StaticResourceManager.class.getResourceAsStream(fileName);
    return is;
  }

}
