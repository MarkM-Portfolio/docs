/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public class OdfdraftPackage
{
  private ZipOutputStream odfdraftStream = null;

  private List<String> addedFiles = new ArrayList<String>();

  public OdfdraftPackage(String odfdraftPath)
  {
    try
    {
      this.odfdraftStream = new ZipOutputStream(new FileOutputStream(odfdraftPath));
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  public OutputStream createNewEntry(String name)
  {
    try
    {
      addedFiles.add(name);
      ZipEntry contentEntry = new ZipEntry(name);
      contentEntry.setMethod(ZipEntry.DEFLATED);
      odfdraftStream.putNextEntry(contentEntry);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    return odfdraftStream;
  }

  public void Save()
  {
    try
    {
      odfdraftStream.close();
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  public void storeFile(String name, byte[] input)
  {
    try
    {
      if (input != null)
      {
        OutputStream outputstream = createNewEntry(name);
        copyStream(new ByteArrayInputStream(input), outputstream);
      }
      // outputstream.write(input,0,input.length);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  public void MergePackage(File sourceFile)
  {
    try
    {
      ZipInputStream zin;
      zin = new ZipInputStream(new FileInputStream(sourceFile));

      ZipEntry entry = zin.getNextEntry();
      while (entry != null)
      {
        String name = entry.getName();
        if (!addedFiles.contains(name))
        {
          // Add ZIP entry to output stream.
          odfdraftStream.putNextEntry(new ZipEntry(name));
          copyStream(zin, odfdraftStream);
        }
        entry = zin.getNextEntry();
      }
      // Close the streams
      zin.close();
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  // Transfer bytes from the ZIP file to the output file
  private void copyStream(InputStream in, OutputStream out)
  {
    try
    {
      byte[] buf = new byte[512 * 1024];
      int len;
      while ((len = in.read(buf)) > 0)
      {
        out.write(buf, 0, len);
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  private void copyStream_debug(InputStream in, OutputStream out)
  {
    try
    {
      // ------------------------------ for debug ------------
      String header = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
      // String header = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n";
      byte[] byteheader = header.getBytes();
      byte[] headerbuf = new byte[byteheader.length];
      int firstlen = in.read(headerbuf);
      if (firstlen < headerbuf.length)
      {
        if (firstlen > 0)
          out.write(headerbuf, 0, firstlen);
        return;
      }
      else
      {
        if (Arrays.equals(byteheader, headerbuf))
        {
          out.write(headerbuf, 0, firstlen - 1);
        }
        else
        {
          out.write(headerbuf, 0, firstlen);
        }
      }
      // -------------------------------------
      byte[] buf = new byte[512 * 1024];
      int len;
      while ((len = in.read(buf)) > 0)
      {
        out.write(buf, 0, len);
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }
}
