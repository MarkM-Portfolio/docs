/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class ZipUtil
{
  
  /**
   * zip a source file or directory to a target zip file
   * @param source      path to file or directory
   * @param target      target zip file name
   * @throws Exception
   */
  public static void zip(String source,String target) throws Exception
  {
    File sourceFile = new File(source);
    File targetFile = new File(target);
    ZipOutputStream zos = null;
    try
    {
      zos = new ZipOutputStream(new FileOutputStream(targetFile));
      if(sourceFile.isDirectory() && targetFile.isFile())
      {
        zip("", sourceFile, zos);
      }
      else if(sourceFile.isFile() && targetFile.isFile())
      {
        ZipEntry entry = new ZipEntry(sourceFile.getName());
        zos.putNextEntry(entry);
        writeToZip(zos, sourceFile);
      }
    }
    finally
    {
      if(zos != null)
      {
        zos.close();
      }
    }
  }

  public static void zip(String[] source,String target) throws Exception
  {
    ZipOutputStream out = new ZipOutputStream(new FileOutputStream(target));
    zip(source, out, "");
    out.close();
  }

  /**
   * unzip a source zip file to a target directory
   * @param source      input stream
   * @param target      target folder for unzipped file
   * @throws Exception
   */
  public static void unzip(InputStream source, String target) throws IOException
  {
    ZipInputStream in = new ZipInputStream(source);
    ZipEntry e;
    while ((e = in.getNextEntry() )!= null)
    {
      if (e.isDirectory())
      {
        String name = e.getName();
        // remove separator
        name = name.substring(0,name.length()-1);
        File f=new File(target + File.separator + name);
        f.mkdirs();
      }
      else {
        String folderPath = e.getName();
        int idx = folderPath.lastIndexOf("/");
        if (idx > 0)
        {
          folderPath = folderPath.substring(0, idx);
          File folder = new File(target + File.separator + folderPath);
          folder.mkdirs();
        }
        
        File f = new File(target + File.separator + e.getName());
        f.createNewFile();
        FileOutputStream out=new FileOutputStream(f);
        int numRead = -1;
        byte[] data = new byte[8192];
        while ((numRead = in.read(data)) > 0)
        {
          out.write(data, 0, numRead);
        }
        out.close();
      }
    }
    in.close();    
  }
  
  /**
   * unzip a source zip file to a target directory
   * @param source      path to zipped file
   * @param target      target folder for unzipped file
   * @throws Exception
   */
  public static void unzip(String source,String target) throws Exception
  {
    unzip(new FileInputStream(source), target);
  }
 
  private static void zip(String[] source,ZipOutputStream target, String base) throws Exception
  {
    for(int i = 0; i < source.length; i++)
    {
      File file = new File(source[i]);
      if(file.isDirectory())
      {
        String entryName = base + file.getName() + "/";
        ZipEntry entry = new ZipEntry(entryName);
        target.putNextEntry(entry);
        zip(entryName, file, target);
      }
      else
      {
        ZipEntry entry = new ZipEntry(base + file.getName());
        target.putNextEntry(entry);
        writeToZip(target, file);
      }
    }
  }
  
  private static void zip(String parentEntry, File parentFile, ZipOutputStream zos) throws IOException
  {
    File files[] = parentFile.listFiles();
    for(int i = 0; i < files.length; i++)
    {
      if(files[i].isDirectory())
      {
        ZipEntry entry = new ZipEntry(parentEntry + files[i].getName() + "/");
        zos.putNextEntry(entry);
        zip(entry.getName(), files[i], zos);
      }
      else
      {
        ZipEntry entry = new ZipEntry(parentEntry + files[i].getName());
        zos.putNextEntry(entry);
        writeToZip(zos, files[i]);
      }
    }
  }
  
  private static void writeToZip(ZipOutputStream zos, File file)
  {
    FileInputStream fis = null;
    try
    {
      fis = new FileInputStream(file);
      int numRead = -1;
      byte[] data = new byte[8192];
      while ((numRead = fis.read(data)) > 0)
      {
        zos.write(data, 0, numRead);
      }
    }
    catch(IOException e)
    {
      e.printStackTrace();
    }
    finally
    {
      if(fis != null)
      {
        try
        {
          fis.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
  }
}