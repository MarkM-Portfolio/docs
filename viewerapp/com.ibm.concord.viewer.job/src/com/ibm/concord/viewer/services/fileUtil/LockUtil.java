package com.ibm.concord.viewer.services.fileUtil;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.channels.OverlappingFileLockException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

public class LockUtil
{
  private static FileLocker nativeLocker = new FileLocker();

  public static Logger logger = Logger.getLogger(LockUtil.class.getName());

  int fd = 0;

  FileOutputStream lockFileOS = null;

  FileChannel lockFileChannel = null;

  FileLock lock = null;

  boolean lockable = false;

  private static boolean isWin = false;

  static
  {
    Properties prop = System.getProperties();
    String os = prop.getProperty("os.name");
    if (os.startsWith("win") || os.startsWith("Win"))
    {
      isWin = true;
    }
  }

  public boolean isLocked()
  {
    return lockable;
  }

  public boolean lock(String fileName)
  {
    logger.entering(LockUtil.class.getName(), "lock", fileName);
    if (!isWin)
    {
      fd = nativeLocker.lock(fileName);
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
        File lockFile = new File(fileName);
        lockFileOS = new FileOutputStream(lockFile);
        lockFileChannel = lockFileOS.getChannel();
        lock = lockFileChannel.tryLock();
        if (lock != null)
        {
          logger.log(Level.FINE, "Linux - Get a valid lock on file path: {0}.", lockFile);
          lockable = true;
        }
        else
        {
          logger.log(Level.FINE, "Linux - Failed to get a valid lock on file path: {0}", lockFile);
          lockable = false;
        }
      }
      catch (OverlappingFileLockException e)
      {
        logger.log(Level.FINE, "Linux - Failed to get a valid lock due to conflict. " + e.getLocalizedMessage());
        lockable = false;
        release(lock, lockFileChannel, lockFileOS);
      }
      catch (IOException e)
      {
        logger.log(Level.FINE, "Linux - Failed to get a valid lock due to IO exception. " + e.getLocalizedMessage());
        lockable = false;
        release(lock, lockFileChannel, lockFileOS);
      }
    }
    logger.exiting(LockUtil.class.getName(), "lock", lockable);
    return lockable;

  }

  private void release(FileLock lock, FileChannel lockFileChannel, FileOutputStream lockFileOS)
  {
    logger.entering(LockUtil.class.getName(), "release", lockFileChannel);
    if (lock != null)
    {
      try
      {
        lock.release();
      }
      catch (IOException ioe)
      {
        logger.log(Level.FINE, "Failed to release file lock due to IO exception. " + ioe.getLocalizedMessage());
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
        logger.log(Level.FINE, "Failed to close file channel due to IO exception. " + ioe.getLocalizedMessage());
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
        logger.log(Level.FINE, "Failed to close file outputStream due to IO exception. " + ioe.getLocalizedMessage());
      }
    }
    logger.exiting(LockUtil.class.getName(), "release");
  }

  public void unlock()
  {
    logger.entering(LockUtil.class.getName(), "unlock", lockFileChannel);
    if (isWin)
    {
      release(lock, lockFileChannel, lockFileOS);
    }
    else
    {
      nativeLocker.unlock(fd);
    }
    logger.exiting(LockUtil.class.getName(), "unlock");
  }
}
