package com.ibm.concord.platform.util;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.channels.OverlappingFileLockException;
import java.util.Properties;

import com.ibm.concord.spi.util.NativeFileLocker;

public class FileLocker
{
  private static NativeFileLocker nativeLocker = new NativeFileLocker();

  int fd = 0;

  FileOutputStream lockFileOS = null;

  FileChannel lockFileChannel = null;

  FileLock lock = null;

  boolean lockable = false;

  private static boolean isWin = false;
  
  private File lockFile = null;

  static
  {
    Properties prop = System.getProperties();
    String os = prop.getProperty("os.name");
    if (os.startsWith("win") || os.startsWith("Win"))
    {
      isWin = true;
    }
  }
  
  public FileLocker(File lockFile)
  {
    this.lockFile = lockFile;
  }
  public boolean isLocked()
  {
    return lockable;
  }
  public boolean lock()
  {
    if (!isWin)
    {
      fd = nativeLocker.lock(lockFile.getAbsolutePath());
      if (fd != -1 && fd != -2)
      {
        lockable = true;
      }
      else
      {
        lockable = false;
      }
    }
    else
    {
      try
      {        
        lockFileOS = new FileOutputStream(lockFile);
        lockFileChannel = lockFileOS.getChannel();
        lock = lockFileChannel.tryLock();
        if (lock != null)
        {
          lockable = true;
        }
        else
        {
          lockable = false;
        }
      }
      catch (OverlappingFileLockException e)
      {
        lockable = false;
        release(lock, lockFileChannel, lockFileOS);
      }
      catch (IOException e)
      {
        lockable = false;
        release(lock, lockFileChannel, lockFileOS);
      }
    }
    return lockable;
  }

  private void release(FileLock lock, FileChannel lockFileChannel, FileOutputStream lockFileOS)
  {
    if (lock != null)
    {
      try
      {
        lock.release();
      }
      catch (IOException ioe)
      {
      }
    }

    if (lockFileChannel != null)
    {
      try
      {
        lockFileChannel.close();
      }
      catch (IOException ioe)
      {

      }
    }

    if (lockFileOS != null)
    {
      try
      {
        lockFileOS.close();
      }
      catch (IOException ioe)
      {
      }
    }
  }

  public void unlock()
  {
    if (isWin)
    {
      release(lock, lockFileChannel, lockFileOS);
    }
    else
    {
      nativeLocker.unlock(fd);
    }

  }
}
