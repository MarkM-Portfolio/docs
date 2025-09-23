package com.ibm.concord.viewer.services.fileUtil;

import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.services.fileUtil.WinFileLocker;

/*
 * Wrapper class for native file locker, now it supports Linux in all cases. For Windows native lock need 
 * shared library, it may introduce extra complexity in on-prem Websphere cell environment, so currently 
 * only viewernext single node case is supported.    
 */
public class NativeFileLocker
{
  private static final Logger LOG = Logger.getLogger(Platform.class.getName());
  
  private FileLocker flocker = null;  // for Linux
  private WinFileLocker w_flocker = null;
  
  private static Boolean isWin = new Boolean((System.getProperty("os.name").toUpperCase().indexOf("WIN") >= 0));
  
  public NativeFileLocker ()
  {
    if (Platform.useNativeLock()) {
      if (isWin) {
        w_flocker = new WinFileLocker();         
      } else {
        flocker = new FileLocker();
      }
    }

    if (flocker == null && w_flocker == null) {
      LOG.severe("Native locker is not created.");
    }
  }
  
  public int lock(String filename) 
  {
    int ret = -1;
    if (isWin && w_flocker != null) {
      ret = w_flocker.lock(filename);
    } else if (flocker != null) {
      ret = flocker.lock(filename);
    }
    
    return ret;
  }
  
  public int unlock(int fd)
  {
    int ret = -1;
    if (isWin && w_flocker != null) {
      ret = w_flocker.unlock(fd);
    } else if (flocker != null) {
      ret = flocker.unlock(fd);
    }

    return ret;
  }
}
