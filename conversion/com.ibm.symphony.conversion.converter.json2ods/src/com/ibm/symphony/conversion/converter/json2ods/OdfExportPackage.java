/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.zip.CRC32;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.odftoolkit.odfdom.pkg.OdfPackageDocument;
import org.odftoolkit.odfdom.pkg.OdfPackage.OdfFile;
import org.odftoolkit.odfdom.pkg.manifest.OdfFileEntry;

public class OdfExportPackage
{
  private ZipOutputStream odfdraftStream = null;

  private List<String> addedFiles = new ArrayList<String>();

  public OdfExportPackage(String odfdraftPath)
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

  public void MergePackage(OdfSpreadsheetDocument spreadsheetDoc)
  {
    try
    {
      Method mflush = spreadsheetDoc.getClass().getSuperclass().getDeclaredMethod("flushDescendantDOMsToPkg", OdfPackageDocument.class);
      mflush.setAccessible(true);
      mflush.invoke(spreadsheetDoc, spreadsheetDoc);
      OdfPackage draftpackage = spreadsheetDoc.getPackage();
      Field fnamelist = draftpackage.getClass().getDeclaredField("mPackagePathSet");
      fnamelist.setAccessible(true);
      Set<String> mPackagePathSet = (Set<String>) fnamelist.get(draftpackage);
      long modTime = (new java.util.Date()).getTime();
      // remove mediatype path and use it as first
      mPackagePathSet.remove(OdfFile.MEDIA_TYPE.getPath());
      Iterator<String> it = mPackagePathSet.iterator();
      String key = null;
      boolean isFirstFile = true;
      // ODF requires the "./mimetype" file to be at first in the package
      while (it.hasNext() || isFirstFile)
      {
        if (isFirstFile)
        {
          key = OdfFile.MEDIA_TYPE.getPath();
          isFirstFile = false;
        }
        else
        {
          key = it.next();
        }
        if (!addedFiles.contains(key))
        {
          byte[] data = draftpackage.getBytes(key);
          storeFile(key, data);
        }
      }
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

  }
}
