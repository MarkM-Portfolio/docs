/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.io;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import org.apache.commons.io.IOUtils;

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
   * @param override    override the target file if true
   * @throws Exception
   */
  public static void unzip(InputStream source, String target) throws IOException
  {
    unzip(source, target, true);
  }
  
  /**
   * unzip a source zip file to a target directory
   * @param source      input stream
   * @param target      target folder for unzipped file
   * @param override    override the target file if true
   * @throws Exception
   */
  public static void unzip(InputStream source, String target, boolean override) throws IOException
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
        if( f.exists() && !override)
          continue;
        
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
  
  public static byte[] compress(byte bytes[]) throws IOException
  {
    Deflater compresser = null;
    ByteArrayOutputStream baos = null;
    try
    {
      compresser = new Deflater(Deflater.BEST_COMPRESSION, true);
      compresser.setInput(bytes);
      compresser.finish();
      byte[] buffer = new byte[4096];
      int length = 0;
      baos = new ByteArrayOutputStream(bytes.length);
      while (!compresser.finished())
      {
        length = compresser.deflate(buffer);
        baos.write(buffer, 0, length);
      }
    }
    finally
    {
      if(compresser != null)
      {
        compresser.end();
      }
    }
    byte compressed[] = baos.toByteArray();
    IOUtils.closeQuietly(baos);
    return compressed;
  }
  
  public static void compress(byte bytes[], File target) throws IOException
  {
    byte[] output = compress(bytes);
    FileOutputStream fos = null;
    try
    {
      fos = new FileOutputStream(target);
      fos.write(output);
    }
    catch(IOException e)
    {
      throw e;
    }
    finally
    {
      IOUtils.closeQuietly(fos);       
    }
  }
  
  public static byte[] decompress(byte[] input) throws DataFormatException
  {
    Inflater decompresser = new Inflater(true);
    decompresser.setInput(input);
    ByteArrayOutputStream baos = new ByteArrayOutputStream(input.length);
    byte[] buffer = new byte[4096];
    int length = 0;
    try
    {
      while(!decompresser.finished())
      {
        try
        {
          length = decompresser.inflate(buffer);
          baos.write(buffer, 0, length);
        }
        catch (DataFormatException e)
        {
          throw e;
        }
      }
    }
    finally
    {
      decompresser.end();
    }
    byte[] output = baos.toByteArray();
    IOUtils.closeQuietly(baos);
    return output;
  }
  
  public static byte[] decompress(File source) throws IOException, DataFormatException
  {
    FileInputStream fis = null;
    try
    {
      fis = new FileInputStream(source);
      byte[] input = IOUtils.toByteArray(fis);
      return decompress(input);
    }
    catch(IOException e)
    {
      throw e;
    }
    finally
    {
      IOUtils.closeQuietly(fis);
    }
  }
  
  public static byte[] decompress(InputStream is) throws IOException, DataFormatException
  {
    try
    {
      byte[] input = IOUtils.toByteArray(is);
      return decompress(input);
    }
    catch(IOException e)
    {
      throw e;
    }
    finally
    {
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