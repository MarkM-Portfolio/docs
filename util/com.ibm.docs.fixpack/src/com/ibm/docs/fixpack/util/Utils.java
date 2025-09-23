/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2014, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.fixpack.util;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.nio.channels.FileChannel;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.jar.JarFile;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

import org.apache.commons.io.IOUtils;

import com.ibm.docs.fixpack.config.Constant;

public class Utils
{
  public static final Logger LOGGER = Logger.getLogger(Utils.class.getName());

  private static final int BUFFER = 2048;// buffer size

  /**
   * delete a file or directory(including all files in it)
   *
   * @param file
   */
  public static void delete(File file)
  {
    if (!file.exists())
      return;
    if (file.isDirectory())
    {
      for (File f : file.listFiles())
      {
        delete(f);
      }
    }
    file.delete();
  }

  /**
   * get a map to record all files
   *
   * @param file
   * @param length
   *          : the length of the absolute path string of file(including the suffix)
   * @return strings in map will not start with '/' or '\'
   */
  public static Map<String, File> getAllFilesMap(File file, int length)
  {
    Map<String, File> map = new HashMap<String, File>();
    File[] fileList = file.listFiles();
    if (fileList != null)
    {
      for (int i = 0; i < fileList.length; i++)
      {
        if (fileList[i].isFile())
        {
          String relativePath = fileList[i].getAbsolutePath().substring(length);
          map.put(relativePath, fileList[i]);
        }
        else
        {
          Map<String, File> subMap = getAllFilesMap(fileList[i], length);
          if (!subMap.isEmpty())
          {
            map.putAll(subMap);
          }
        }
      }
    }
    return map;
  }

  /**
   * get all files in a folder
   *
   * @param file
   * @return
   */
  public static List<File> getAllFiles(File file)
  {
    List<File> list = new ArrayList<File>();
    File[] fileList = file.listFiles();
    if (fileList != null && fileList.length > 0)
    {
      for (int i = 0; i < fileList.length; i++)
      {
        if (fileList[i].isDirectory())
        {
          List<File> subList = getAllFiles(fileList[i]);
          if (!subList.isEmpty())
          {
            list.addAll(subList);
          }
        }
        else
        {
          list.add(fileList[i]);
        }
      }
    }
    return list;

  }

  /**
   * get zip file(including zip, ear, jar) name of the directory
   *
   * @param file
   * @return
   */
  public static Set<String> getZipFiles(File file)
  {
    Set<String> set = new HashSet<String>();
    String[] fileNames = file.list();
    if (fileNames != null && fileNames.length > 0)
    {
      for (int i = 0; i < fileNames.length; i++)
      {
        if (fileNames[i].endsWith(".ear") || fileNames[i].endsWith(".zip") || fileNames[i].endsWith(".jar")||fileNames[i].endsWith(".tar.gz"))
        {
          set.add(fileNames[i]);
        }
      }

    }

    return set;
  }

  /**
   * copy files from sourceDir to destDir
   *
   * @param sourceDir
   * @param destDir
   * @throws IOException
   */
  public static void copyAllFiles(File sourceDir, File destDir) throws IOException
  {
    int length = sourceDir.getAbsolutePath().length();
    Map<String, File> sourceFiles = getAllFilesMap(sourceDir, length + 1);
    for (String fileName : sourceFiles.keySet())
    {
      copyFile(sourceFiles.get(fileName), new File(destDir, fileName));
    }

  }

  /**
   * copy file from source to dest
   * 
   * @param File source
   * @param File dest
   * @throws IOException
   */
  public static void copyFile(File source, File dest) throws IOException
  {
    LOGGER.log(Level.INFO, "copying file: " + source + " -> " + dest);
    if (dest.exists())
    {
      dest.delete();
    }

    FileChannel inputChannel = null;
    FileChannel outputChannel = null;
    try
    {
      // generate the parent directory if necessary
      dest.getParentFile().mkdirs();
      dest.createNewFile();
      inputChannel = new FileInputStream(source).getChannel();
      outputChannel = new FileOutputStream(dest).getChannel();
      outputChannel.transferFrom(inputChannel, 0, inputChannel.size());
    }
    finally
    {
      IOUtils.closeQuietly(inputChannel);
      IOUtils.closeQuietly(outputChannel);
    }
  }

  /**
   * compare two folders strictly including files in it, if one or more files differ, even if the file path differs, return false
   * 
   * @param oldFile
   * @param newFile
   * @return
   * @throws IOException
   */
  public static boolean isFolderEqual(File oldFile, File newFile) throws IOException
  {
    boolean flag = true;
    int length1 = oldFile.getAbsolutePath().length() + 1;
    int length2 = newFile.getAbsolutePath().length() + 1;

    Map<String, File> oldMap = getAllFilesMap(oldFile, length1);
    Map<String, File> newMap = getAllFilesMap(newFile, length2);
    if (oldMap.size() != newMap.size())
    {
      return false;
    }
    for (String child : oldMap.keySet())
    {
      if (newMap.containsKey(child))
      {
        File oldChildFile = oldMap.get(child);
        File newChildFile = newMap.get(child);
        boolean matchFlag = false;
        if (isJar(child))
        {
          matchFlag = isJarEqual(oldChildFile, newChildFile, true);
        }
        else
        {
          matchFlag = isFileEqual(oldChildFile, newChildFile);
        }

        if (matchFlag)
        {
          continue;
        }
        else
        {
          // file differ
          flag = false;
          LOGGER.log(Level.INFO, child + " has changes.");
          break;
        }
      }
      else
      {
        flag = false;
        LOGGER.log(Level.INFO, child + " only exists in old version");
        break;
      }
    }
    return flag;

  }

  /**
   * record content to file with appending mode
   *
   * @param content
   * @param file
   * @throws IOException
   */
  public static void recordToFile(String content, File file) throws IOException
  {

    FileWriter fw = null;
    PrintWriter pw = null;
    try
    {
      if (!file.exists())
      {
        file.getParentFile().mkdirs();
        file.createNewFile();
      }
      fw = new FileWriter(file, true); // append
      pw = new PrintWriter(fw);
      pw.println(content);
    }
    finally
    {
      IOUtils.closeQuietly(pw);
    }

  }

  /**
   * zip sourceFile to targetFile
   *
   * @param sourceFile
   *          : the folder to zip
   * @param targetFile
   *          : file that will be generated
   * @throws IOException
   */
  public static void zip(File sourceFile, File targetFile) throws IOException
  {
    if (!sourceFile.exists())
    {
      return;
    }
    if (targetFile.exists())
    {
      delete(targetFile);
    }
    targetFile.getParentFile().mkdirs();
    targetFile.createNewFile();
    LOGGER.log(Level.INFO, "zip file : " + sourceFile);
    FileOutputStream fos = null;
    ZipOutputStream out = null;
    byte data[] = new byte[BUFFER];
    try
    {
      fos = new FileOutputStream(targetFile);
      out = new ZipOutputStream(fos);
      List<File> files = getAllFiles(sourceFile);

      for (File file : files)
      {
        FileInputStream fis = null;
        BufferedInputStream bis = null;
        try
        {
          fis = new FileInputStream(file);
          bis = new BufferedInputStream(fis);
          ZipEntry entry = new ZipEntry(file.getAbsolutePath().substring(sourceFile.getAbsolutePath().length() + 1));
          out.putNextEntry(entry);
          int count;
          while ((count = bis.read(data, 0, BUFFER)) != -1)
          {
            out.write(data, 0, count);
          }
        }
        finally
        {
          out.closeEntry();
          IOUtils.closeQuietly(fis);
        }

      }
    }
    finally
    {
      IOUtils.closeQuietly(out);
    }
  }

  /**
   * unzip a file
   *
   * @param file
   *          need to unzip
   * @throws IOException
   */
  public static void unzip(File file) throws IOException
  {
    if (!file.exists())
    {
      throw new FileNotFoundException(file + " does not exist.");
    }
    if (file.isDirectory())
    {
      delete(file);
    }
    else
    {
      LOGGER.log(Level.INFO, "Unzipping - " + file);
      extractFolder(file);
    }
    LOGGER.log(Level.INFO, "Done Unzipping - " + file);

  }

  /**
   * extract a zip file, the file generated has the same name with the zip file, the original zip file will be deleted
   *
   * @param file
   * @throws IOException
   */
  @SuppressWarnings("unchecked")
  private static void extractFolder(File file) throws IOException
  {

    // contains no content
    if (isEmptyFile(file))
    {
      return;
    }
    String fileName = file.getAbsolutePath();
    // the name of the temporary directory that contains files unzipped
    String newPath = fileName + Constant.TEMP;
    ZipFile zipFile = null;
    try
    {
      zipFile = new ZipFile(file);
      new File(newPath).mkdirs();
      Enumeration<ZipEntry> zipFileEntries = (Enumeration<ZipEntry>) zipFile.entries();
      while (zipFileEntries.hasMoreElements())
      {
        ZipEntry entry = zipFileEntries.nextElement();
        String entryName = entry.getName();
        File destFile = new File(newPath, entryName);
        if (entry.isDirectory())
        {
          destFile.mkdirs();
        }
        else
        {
          writeToFile(zipFile.getInputStream(entry), destFile);
          // these files will not be extracted
          if (isNotUnzipped(entryName))
          {
            continue;
          }
          if (isZipFile(entryName))
          {
            // find a ear or war file, try to extract recursively
            extractFolder(destFile);
          }
        }
      }
    }
    finally
    {
      if (zipFile != null)
      {
        zipFile.close();
      }
    }

    if (file.delete())
    {
      File tempFile = new File(newPath);
      if (!tempFile.renameTo(new File(fileName)))
      {
        throw new IOException(fileName + Constant.TEMP + " rename failure");
      }
    }
    else
    {
      throw new IOException(file + " delete failure");
    }

  }

  /**
   * files do not need to unzip
   *
   * @param entryName
   * @return
   */
  public static boolean isNotUnzipped(String entryName)
  {
    return entryName.endsWith(Constant.SPELLCHECK_EAR) || entryName.endsWith(Constant.STELLENT_ZIP)
        || entryName.endsWith(Constant.NATIVE_ZIP) || entryName.matches(Constant.SYMPHONY_ZIP);
  }

  /**
   * write inputstream into file, if file exists, delete the file first, then create an empty one
   *
   * @param is
   * @param destFile
   * @throws IOException
   */
  public static void writeToFile(InputStream is, File destFile) throws IOException
  {
    // delete existed file
    if (destFile.exists())
    {
      destFile.delete();
    }
    BufferedInputStream bis = null;
    FileOutputStream fos = null;
    try
    {
      File destinationParent = destFile.getParentFile();
      destinationParent.mkdirs();
      destFile.createNewFile();

      bis = new BufferedInputStream(is);
      int currentByte;
      byte data[] = new byte[BUFFER];
      fos = new FileOutputStream(destFile);
      while ((currentByte = bis.read(data, 0, BUFFER)) != -1)
      {
        fos.write(data, 0, currentByte);
      }

    }
    finally
    {
      IOUtils.closeQuietly(fos);
      IOUtils.closeQuietly(bis);
    }
  }

  /**
   *
   * @param file1
   * @param file2
   * @param ignoreVersion
   *          true: ignore the version false: not ignore version
   * @return
   * @throws IOException
   */
  public static boolean isJarEqual(File file1, File file2, boolean ignoreVersion) throws IOException
  {
    boolean flag = true;
    JarFile jarFile1 = null;
    JarFile jarFile2 = null;
    try
    {
      jarFile1 = new JarFile(file1);
      jarFile2 = new JarFile(file2);
      List<String> list1 = getEntryNames(jarFile1);
      List<String> list2 = getEntryNames(jarFile2);
      if (list1.size() != list2.size())
      {
        flag = false;
      }
      else
      {
        for (int i = 0; i < list1.size(); i++)
        {
          String entry1 = list1.get(i);
          String entry2 = list2.get(i);
          if (entry1.endsWith("MANIFEST.MF") && entry2.endsWith("MANIFEST.MF"))
          {
            if (ignoreVersion)
            {
              continue;
            }
            else
            {
              ;
            }
          }
          if (streamsEqual(jarFile1.getInputStream(jarFile1.getEntry(entry1)), jarFile2.getInputStream(jarFile2.getEntry(entry2))))
          {
            continue;
          }
          else
          {
            LOGGER.log(Level.INFO, entry1 + " has changes.");
            flag = false;
            break;
          }

        }
      }

    }
    finally
    {
      if (jarFile1 != null)
      {
        jarFile1.close();
      }
      if (jarFile2 != null)
      {
        jarFile2.close();
      }
    }
    return flag;
  }

  /**
   * compare symphony
   *
   * @param file1
   * @param file2
   * @return
   */
  private static boolean isSymphonyEqual(File file1, File file2)
  {
    return file1.getName().equals(file2.getName());
  }

  /**
   * compare two zip files
   *
   * @param file1
   * @param file2
   * @return
   * @throws IOException
   */
  public static boolean isZipEqual(File file1, File file2) throws IOException
  {
    boolean flag = true;
    if (file1.getName().matches(Constant.SYMPHONY_ZIP) && file2.getName().matches(Constant.SYMPHONY_ZIP))
    {
      flag = isSymphonyEqual(file1, file2);
    }
    else
    {
      ZipFile zipFile1 = null;
      ZipFile zipFile2 = null;
      try
      {
        zipFile1 = new ZipFile(file1);
        zipFile2 = new ZipFile(file2);
        List<String> list1 = getEntryNames(zipFile1);
        List<String> list2 = getEntryNames(zipFile2);
        if (list1.size() != list2.size())
        {
          flag = false;
        }
        else
        {
          for (int i = 0; i < list1.size(); i++)
          {
            String entry1 = list1.get(i);
            String entry2 = list2.get(i);
            if (entry1.endsWith(Constant.CONVERSION_LIB_VERSION_FILE)
                || streamsEqual(zipFile1.getInputStream(zipFile1.getEntry(entry1)), zipFile2.getInputStream(zipFile2.getEntry(entry2))))
            {
              continue;
            }
            else
            {
              LOGGER.log(Level.INFO, entry1 + " has changes.");
              flag = false;
              break;
            }

          }
        }

      }
      finally
      {
        if (zipFile1 != null)
        {
          zipFile1.close();
        }
        if (zipFile2 != null)
        {
          zipFile2.close();
        }
      }
    }
    return flag;
  }

  /**
   * compare all files in two folders but ignore the difference in file paths, this method is for com.ibm.docs.web.resources.ear.ear and
   * com.ibm.concord.viewer.ear.ear
   *
   * @param file1
   * @param file2
   * @return
   * @throws IOException
   */
  public static boolean isWebEarEqual(File file1, File file2) throws IOException
  {
    boolean flag = true;
    List<File> fileList1 = getAllFiles(file1);
    List<File> fileList2 = getAllFiles(file2);
    if (fileList1.size() != fileList2.size())
    {
      LOGGER.log(Level.INFO, file1.getName() + ": the size of files in the two versions are different.One is " + fileList1.size()
          + ", the other is " + fileList2.size());
      flag = false;
    }
    else
    {
      Collections.sort(fileList1);
      Collections.sort(fileList2);
      for (int i = 0; i < fileList1.size(); i++)
      {
        File oldChildFile = fileList1.get(i);
        File newChildFile = fileList2.get(i);
        boolean matchFlag = false;
        if (isJar(oldChildFile.getName()))
        {
          matchFlag = isJarEqual(oldChildFile, newChildFile, true);
        }
        else
        {
          // ignore js build report and MANIFEST.MF
          if (oldChildFile.getName().endsWith("build-report.txt") && newChildFile.getName().endsWith("build-report.txt")
              || oldChildFile.getName().endsWith("MANIFEST.MF") && newChildFile.getName().endsWith("MANIFEST.MF"))
            matchFlag = true;
          else
            matchFlag = isFileEqual(oldChildFile, newChildFile);
        }

        if (matchFlag)
        {
          continue;
        }
        else
        {
          // file differ
          LOGGER.log(Level.INFO, oldChildFile + " has changes.");
          flag = false;
          break;
        }
      }
    }
    return flag;
  }

  /**
   * get zip entry names in alphabetic order
   *
   * @param zipFile
   * @return
   */
  private static List<String> getEntryNames(ZipFile zipFile)
  {
    List<String> list = new ArrayList<String>();
    @SuppressWarnings("unchecked")
    Enumeration<ZipEntry> zipEntries = (Enumeration<ZipEntry>) zipFile.entries();
    while (zipEntries.hasMoreElements())
    {
      ZipEntry entry = zipEntries.nextElement();
      if (!entry.isDirectory())
        list.add(entry.getName());
    }
    Collections.sort(list);
    return list;
  }

  /**
   * determine a file is zip file or not by its name
   *
   * @param fileName
   * @return
   */
  private static boolean isZipFile(String fileName)
  {
    return fileName.endsWith(".zip") || fileName.endsWith(".ear") || fileName.endsWith(".war");
  }

  /**
   * compare two files
   *
   * @param file1
   * @param file2
   * @return
   * @throws IOException
   */
  public static boolean isFileEqual(File file1, File file2) throws IOException
  {

    boolean flag = false;
    InputStream stream1 = null;
    InputStream stream2 = null;
    try
    {
      stream1 = new BufferedInputStream(new FileInputStream(file1));
      stream2 = new BufferedInputStream(new FileInputStream(file2));
      flag = streamsEqual(stream1, stream2);
    }
    finally
    {
      IOUtils.closeQuietly(stream1);
      IOUtils.closeQuietly(stream2);
    }
    return flag;

  }

  /**
   * compare two streams
   *
   * @param stream1
   * @param stream2
   * @return
   * @throws IOException
   */
  private static boolean streamsEqual(InputStream stream1, InputStream stream2) throws IOException
  {
    byte[] buf1 = new byte[BUFFER];
    byte[] buf2 = new byte[BUFFER];
    boolean done1 = false;
    boolean done2 = false;

    try
    {
      while (!done1)
      {
        int off1 = 0;
        int off2 = 0;

        while (off1 < buf1.length)
        {
          int count = stream1.read(buf1, off1, buf1.length - off1);
          if (count < 0)
          {
            done1 = true;
            break;
          }
          off1 += count;
        }
        while (off2 < buf2.length)
        {
          int count = stream2.read(buf2, off2, buf2.length - off2);
          if (count < 0)
          {
            done2 = true;
            break;
          }
          off2 += count;
        }
        if (off1 != off2 || done1 != done2)
          return false;
        for (int i = 0; i < off1; i++)
        {
          if (buf1[i] != buf2[i])
            return false;
        }
      }
      return true;
    }
    finally
    {
      IOUtils.closeQuietly(stream1);
      IOUtils.closeQuietly(stream2);
    }
  }

  /**
   * file is jar or not
   *
   * @param child
   * @return
   */
  public static boolean isJar(String child)
  {
    return child.endsWith(".jar");
  }

  /**
   * a directory is empty or not
   *
   * @param file
   * @return
   */
  public static boolean isEmptyDir(File file)
  {
    return file.isDirectory() && file.list().length == 0;
  }

  /**
   * a file is empty or not
   *
   * @param file
   * @return
   */
  private static boolean isEmptyFile(File file)
  {
    return file.isFile() && file.length() == 0;
  }

  /**
   * create md5 file for zipFile
   *
   * @param zipFile
   */
  public static void createMD5(File zipFile)
  {
    String command = "md5sum " + zipFile.getAbsolutePath() + " > " + zipFile.getAbsolutePath() + ".md5";
    try
    {
      executeCommand(command);
    }
    catch (Exception e)
    {
      LOGGER.log(Level.INFO, "Exception in create md5 file, you can create manually or run build again.");
    }

  }

  /**
   * execute shell command
   *
   * @param command
   * @throws IOException
   * @throws InterruptedException
   */
  private static void executeCommand(String command) throws IOException, InterruptedException
  {
    LOGGER.log(Level.INFO, "execute shell command : " + command);
    String[] commands = { "sh", "-c", command };

    Process process = Runtime.getRuntime().exec(commands);
    int exitValue = process.waitFor();
    if (0 != exitValue)
    {
      LOGGER.log(Level.INFO, "call shell failed, error code is : " + exitValue);
    }

  }
}
