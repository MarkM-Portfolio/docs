/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.convertor.metafile.common;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;


public class MetaFileUtil
{
  public static String getFileType(File metafile)
  {
    String ret = "others";
    MetaDataInputStream file = null;
    try
    {
      file = new MetaDataInputStream(new FileInputStream(metafile));
      int tag1 = file.readInt();

      if (tag1 == 0x9ac6cdd7)
      { // Placable WMF
        return "wmf";
      }
      else if (tag1 == 0x1)
      { // EMF
        file.skip(36L);
        int tag2 = file.readInt();
        if (tag2 == 0x464D4520)
        {
          return "emf";
        }
      }
      else
      { // standard meta file
        int headerSize = (tag1 & 0xffff0000) >>> 16;
        int fileType = tag1 & 0xffff;

        if (!(fileType == 1 && headerSize == 9))
        {
          return ret;
        }
        else
          return "wmf";
      }
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    finally
    {
      if( file != null)
        try
        {
          file.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
    }
    return ret;
  }
/*
  public static WinMetaFile loadMetaFile(String metafile)
  {
    String type = MetaFileUtil.getFileType(metafile);

    if (type.equals("wmf"))
    {
      return new WMFFile(metafile);
    }

    if (type.equals("emf"))
    {
      return new EMFFile(metafile);
    }

    return null;
  }
*/
}
