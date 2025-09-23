package com.ibm.concord.viewer.services.fileUtil;

import java.util.logging.Level;
import java.util.logging.Logger;

public class FileLockLoader {
    private static final Logger LOG = Logger.getLogger(WASConfigHelper.class.getName());

	static {
      boolean isamd64 = false;
      if (System.getProperty("os.arch").indexOf("64") != -1) {
        isamd64 = true;
      }
      
      try {
        String viewer_root = WASConfigHelper.getCellVariable("VIEWER_INSTALL_ROOT");
        
        LOG.info("VIEWER_INSTALL_ROOT=" + viewer_root);
        
        if (viewer_root != null) {
          viewer_root = viewer_root.replace('\\', '/');
          if (!viewer_root.endsWith("/"))
            viewer_root = viewer_root + '/';
        }
        
        String arch_str = "32bit";
        String jnidllname = viewer_root + "sharedlib/FileUtil32.dll";
        if (isamd64) {
          jnidllname = viewer_root + "sharedlib/FileUtil64.dll";
          arch_str = "64bit";
        }
 
  		try {
  		  LOG.info("native lock file path to load =" + jnidllname);
  		  System.load(jnidllname);
  	      LOG.info("Detected Windows " + arch_str + ", and loaded Windows native library.");
  		} catch (java.lang.UnsatisfiedLinkError e) {
  		  LOG.log(Level.SEVERE, "Error happened when loading the shared library.", e);
  		}
	  } catch (Throwable t) {
	    LOG.log(Level.SEVERE, "Error happened when loading the shared library.", t);
	  }
	}
	
	public boolean check() {
		WinFileLocker locker = new WinFileLocker();
	  locker.unlock(-1);
	  return true;
	}
}