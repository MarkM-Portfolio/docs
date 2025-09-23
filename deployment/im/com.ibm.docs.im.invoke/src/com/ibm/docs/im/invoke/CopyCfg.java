/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2015.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */

package com.ibm.docs.im.invoke;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.channels.FileChannel;
import java.util.Arrays;

import org.eclipse.core.runtime.IProgressMonitor;

import com.ibm.cic.agent.core.api.IInvokeContext;
import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.docs.im.installer.common.util.Constants;

public class CopyCfg
{
  ILogger logger = IMLogger.getLogger(getClass().getCanonicalName());  
  
  
  private static void copyFileUsingFileChannels(File source, File dest)
			throws IOException {
		FileChannel inputChannel = null;
		FileChannel outputChannel = null;
		try {
			inputChannel = new FileInputStream(source).getChannel();
			outputChannel = new FileOutputStream(dest).getChannel();
			outputChannel.transferFrom(inputChannel, 0, inputChannel.size());
		} finally {
			inputChannel.close();
			outputChannel.close();
		}
	}
  
  private static void copyCfgInTheDirectory(File dirSrc, File dirDest) throws IOException
  {
    for(String s : Arrays.asList("cfg.properties", "cfg.node.properties")) {
    	File cfg = new File(dirSrc.getAbsolutePath()+ File.separator + s);
    	if( cfg.exists() ){   
			String toCfgPath = dirDest.getAbsolutePath() + File.separator + s;
			File target = new File(toCfgPath);
			if(target.exists())
			{
				target.delete();
			}
			copyFileUsingFileChannels(cfg, new File(toCfgPath));
    	}
    }
  }
  public void run(IInvokeContext context, String[] args, PrintWriter writer, IProgressMonitor monitor) throws Exception
  {
    IProfile profile = context.getProfile();    
    String installLocation = profile.getInstallLocation();    
    String generateCFGRoot = profile.getOfferingUserData(Constants.TEMP_CFG_PATH, Constants.OFFERING_ID);
    File cfgRoot = new File(generateCFGRoot);
    String cancelMarkerPath = installLocation + File.separator + "imcanceled";
    if( cfgRoot.isDirectory() )
    {
	    File[] dirs = cfgRoot.listFiles();
	    String targetDirPath = null;
	    for (File dir : dirs) {
	    	targetDirPath = installLocation + File.separator + dir.getName();
	    	File targetDirPathFile = new File(targetDirPath);
	    	if(dir.isDirectory() && targetDirPathFile.exists()){
	    		copyCfgInTheDirectory(dir, targetDirPathFile);
	    		File[] subDirs = dir.listFiles();
	    		for (File subDir : subDirs) {
	    			if(subDir.isDirectory()){    			
		    			targetDirPath = installLocation + File.separator + dir.getName() + File.separator + subDir.getName();
		    			copyCfgInTheDirectory(subDir, new File(targetDirPath));		    			
	    			}
	    		}    		
	    	}
	    }	    
    }
    // delete the cancel marker before start python scripts
    File m = new File(cancelMarkerPath);
    if( m.exists() )
    {
    	m.delete();
    }
    // reset the failed component record    
    profile.setUserData(Constants.FAILED_COMPONENT, "");
    
    monitor.worked(200);
  }
}
