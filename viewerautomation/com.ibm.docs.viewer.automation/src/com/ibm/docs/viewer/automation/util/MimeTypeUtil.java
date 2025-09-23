package com.ibm.docs.viewer.automation.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.activation.MimetypesFileTypeMap;

public class MimeTypeUtil
{
  public static final MimetypesFileTypeMap MIME_TYPE_MAP = new MimetypesFileTypeMap();

  private static final Logger logger = Logger.getLogger(MimeTypeUtil.class.getName());

  static
  {
    try
    {
      InputStream is = MimeTypeUtil.class.getResourceAsStream("mime.types"); //$NON-NLS-1$
      BufferedReader reader = null;
      if (is != null)
      {
        try
        {
          reader = new BufferedReader(new InputStreamReader(is));
          String line;
          while ((line = reader.readLine()) != null)
          {
            int hashPos = line.indexOf('#');
            if (hashPos != -1)
            {
              line = line.substring(0, hashPos);
            }
            if (line.trim().length() > 0)
              MIME_TYPE_MAP.addMimeTypes(line);
          }
        }
        finally
        {
          if (reader != null)
          {
            reader.close();
          }
        }
      }
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
    }
  }
}
