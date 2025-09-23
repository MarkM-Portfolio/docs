/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.io;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class FileUtil
{
  static final int PAGE_SIZE = 4096;
  public static File writeFile(String path,InputStream in)
  {
    File tmp = new File(path);
    FileOutputStream os = null;
    if (!tmp.exists())
      try
      {
        tmp.createNewFile();
        os = new FileOutputStream(tmp);
        byte[] buf = new byte[PAGE_SIZE];
        int r = 0;
        // let npe happen if one of the streams is null
        while ((r = in.read(buf, 0, PAGE_SIZE)) > -1)
        {
          os.write(buf, 0, r);
        }
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
      finally
      {
        try
        {
          os.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
        // free the references
        in = null;
        os = null;
      }
    return tmp;
  }
  
  public static long getSize(InputStream in)
  {
	long length = 0;
    try
    {
      byte[] buf = new byte[PAGE_SIZE];
      int r = 0;
      
      // let npe happen if one of the streams is null
      while ((r = in.read(buf, 0, PAGE_SIZE)) > -1)
      {
        length += r; 
      }
      return length;
    }
    catch (IOException e)
    {
      e.printStackTrace();
      return length;
    }
    finally
    {
      // free the references
      try
      {
        in.close();
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
      in = null;
    }
  }
}
