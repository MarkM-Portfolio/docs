package com.ibm.symphony.conversion.converter.conversionlib;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.common.acf.ACFUtil;
import com.ibm.symphony.conversion.service.common.util.DraftDomFixer;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionConfig;
import com.ibm.trl.acf.api.ActiveContentProcessorException;
import com.ibm.docs.common.util.WASConfigHelper;


public class ConversionLibConverter
{
  static Logger log = Logger.getLogger(ConversionLibConverter.class.getName());

  private static final String WIN_EXEC_FILE_NAME = "OOXMLConvertor.exe";

  private static final String LIN_EXEC_FILE_NAME = "ooxmlconvertor";

  private static final String DATA_DIR = "data";

  private static final long INTERVAL_TIME = 100;
  
  private static boolean isWin = System.getProperty("os.name").toUpperCase().indexOf("WIN") != -1;

  public static ConversionResult convert(File sourceFile, File targetFolder, String sourceType, String targetType, long timeout,
      String configPath, Map<String, String> options)
  {
    ConversionResult result = new ConversionResult();
    String[] execParams = prepareExecParams(sourceFile, targetFolder, sourceType, targetType, configPath, result, options);
    if (execParams == null)
      return result;

    doConvert(result, execParams, timeout);
    if ("html".equals(targetType) && result.isSucceed())
    {
      FileInputStream old = null;
      FileOutputStream newFile = null;
      try
      {
        String oldHtmlFileName = targetFolder.getPath() + File.separator + "content.html";
        String newHtmlFileName = targetFolder.getPath() + File.separator + "acfcontent.html";
        File oldHtmlFile = new File(oldHtmlFileName);
        File newHtmlFile = new File(newHtmlFileName);
        if (oldHtmlFile.renameTo(newHtmlFile))
        {
          old = new FileInputStream(newHtmlFileName);
          newFile = new FileOutputStream(oldHtmlFileName);
          boolean acfresult = ACFUtil.process(old, newFile);
          old.close();
          newFile.close();
          if(log.isLoggable(Level.FINE))
          {
            log.info("ACFUtil process result:" + acfresult);
          }
          newHtmlFile.delete();
        }
        String width = null;
        String height = null;
        String imagesize = null;
        String poolsize = null;
        try{
        	JSONObject presentationConfig = ConversionConfig.getInstance().getSubConfig("presentation");
        	width = presentationConfig.get("image-down-size-width").toString();
        	height = presentationConfig.get("image-down-size-height").toString();
        	imagesize = presentationConfig.get("image-down-size").toString();
        	poolsize = presentationConfig.get("image-down-size-pool").toString();
        } catch (Exception e) {
        	log.log(Level.FINE, "Using default image down size Max width:800, Max height:600");
        }
        int dWidth = 800;
        int dHeight = 600;
        int dImageSize = 500;
        int dPoolSize = 10;
        if(width != null)
        	dWidth = Integer.parseInt(width);
        if(height != null)
        	dHeight = Integer.parseInt(height);
        if(imagesize != null)
        	dImageSize = Integer.parseInt(imagesize);
        if(poolsize != null)
        	dPoolSize = Integer.parseInt(poolsize);
        DraftDomFixer domfixer = new DraftDomFixer();
        domfixer.fixDomByPath(oldHtmlFileName, dWidth, dHeight, dImageSize, dPoolSize);
      }
      catch (FileNotFoundException e)
      {
        e.printStackTrace();
      }
      catch (ActiveContentProcessorException e)
      {
        e.printStackTrace();
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
      finally
      {
        try
        {
          if (old != null)
          {
            old.close();
          }
          if (newFile != null)
          {
            newFile.flush();
            newFile.close();
          }
        }
        catch (IOException ex)
        {
          ex.printStackTrace();
        }
      }
    }
    return result;
  }

  public static ConversionResult convert(File sourceFile, File targetFolder, String sourceType, String targetType, long timeout,
      String configPath)
  {
    return convert(sourceFile, targetFolder, sourceType, targetType, timeout, configPath, null);
  }

  private static String[] prepareExecParams(File sourceFile, File targetFolder, String sourceType, String targetType, String configPath,
      ConversionResult result, Map<String, String> options)
  {
    JSONObject conversionlibCfg = (JSONObject) ConversionConfig.getInstance().getConfig("conversionLib");
    String execPath = null, dataPath = null;
    if (conversionlibCfg != null)
    {
      String conversionlibPath = (String) conversionlibCfg.get("path");
      if (isWin)
        execPath = conversionlibPath + WIN_EXEC_FILE_NAME;
      else
        execPath = conversionlibPath + LIN_EXEC_FILE_NAME;
      dataPath = conversionlibPath + DATA_DIR;
    }
    else
    {
      log.log(Level.SEVERE, "Missing ConversionLib configurations!");
      return null;
    }

    Boolean bImportACL = null;
    // do not need to do limitation check for the file which is exported by IBM docs
    boolean bIgnoreLimit = false;
    String commTaskFilePath = null;
    if (options != null)
    {
      if (options.containsKey("isPublished") && Boolean.valueOf(options.get("isPublished").toString()) == true)
      {
        bIgnoreLimit = true;
      }
      if (options.containsKey("commenttaskranges"))
      {
        commTaskFilePath = (String) options.get("commenttaskranges");
      }
      if (options.containsKey("ACLRanges"))
      {
        bImportACL = Boolean.valueOf(options.get("ACLRanges").toString());
      }
    }

    List<String> cmdLst = new ArrayList<String>();
    cmdLst.add(execPath);
    if (isWin)
    {
      cmdLst.add("\"-InputFilename=" + sourceFile.getPath() + "\"");
      cmdLst.add("\"-DataPath=" + dataPath + "\"");
      cmdLst.add("\"-ConfigFile=" + configPath + "\"");
    }
    else
    {
      cmdLst.add("-InputFilename=" + sourceFile.getPath());
      cmdLst.add("-DataPath=" + dataPath);
      cmdLst.add("-ConfigFile=" + configPath);
    }
    cmdLst.add("-InputFileType=" + sourceType);
    cmdLst.add("-OutputFileType=" + targetType);
    if (bIgnoreLimit)
      cmdLst.add("-IgnoreLimit=true");

    if (bImportACL != null)
      cmdLst.add("-ImportACL=" + bImportACL.toString());

    if (commTaskFilePath != null)
    {
      if (isWin)
        cmdLst.add("\"-PreserveCommentTask=" + commTaskFilePath + "\"");
      else
        cmdLst.add("-PreserveCommentTask=" + commTaskFilePath );
    }

    if ("html".equals(sourceType) || "json".equals(sourceType))
    {
      if (isWin)
        cmdLst.add("\"-OutputFilename=" + targetFolder.getPath() + File.separator + "content." + targetType + "\"");        
      else
        cmdLst.add("-OutputFilename=" + targetFolder.getPath() + File.separator + "content." + targetType);
      cmdLst.add("-InputAsFile=false");
      cmdLst.add("-OutputAsZip=true");
    }
    else
    {
      if (isWin)
        cmdLst.add("\"-OutputFilename=" + targetFolder.getPath() + "\"");
      else
        cmdLst.add("-OutputFilename=" + targetFolder.getPath());
    }      
    String[] strTemplate = new String[cmdLst.size()];
    return cmdLst.toArray(strTemplate);
  }

  private static void doConvert(ConversionResult result, String[] execParams, long timeout)
  {
    final Runtime runtime = Runtime.getRuntime();
    Process process = null;
    ConversionLibShutdownHook stHook = null;
    boolean forceDestroy = false;
    try
    {
      if (isWin)
      {
        process = runtime.exec(execParams);
      }
      else
      {
        ProcessBuilder pb = new ProcessBuilder(execParams);
        Map<String, String> env = pb.environment();
        env.put("LD_LIBRARY_PATH", getFolder());
        env.put("GDFONTPATH", "/usr/share/fonts" + File.pathSeparator + getJavaFontsPath());
        env.put("DISPLAY", ":0.0");
        process = pb.start();
      }
      stHook = new ConversionLibShutdownHook(process);
      if(log.isLoggable(Level.FINE))
      {
        long threadID = Thread.currentThread().getId();
        StreamGobbler errorGobbler = new StreamGobbler(process.getErrorStream(), "Error", threadID);
        StreamGobbler outputGobbler = new StreamGobbler(process.getInputStream(), "Output", threadID);
        errorGobbler.start();
        outputGobbler.start();
      }

      boolean done = false;
      long totalWait = 0;
      while (!done)
      {
        try
        {
          Thread.sleep(INTERVAL_TIME);
          totalWait += INTERVAL_TIME;
          int status = process.exitValue();
          if (status == 0)
          {
            result.setSucceed(true);
            done = true;
          } else {
            //All the status code from CL has been minus 300 to ensure all of them are less than 256 for Linux issue, see Defect 57463
            //Since the code has been used on docs server, add it back to run as before.
            //The adding need to be removed when docs server is also changed.
            if(status >= 111 && status<=238)
              status += 300;

            if (status == 413)
            {
              setConvertWarning(result, ConversionConstants.ERROR_FILE_IS_TOO_LARGE, "ConversionLibConverter - File too large",
                  new ConversionException("ConversionLibConverter file too large exception"));
              done = true;
            }
            else if (status == 528)
            {
              setConvertWarning(result, ConversionConstants.ERROR_EMPTY_FILE_ERROR, "ConversionLibConverter - Empty Slide",
                  new ConversionException("ConversionLibConverter empty slide exception"));
              done = true;
            }
            else if ((status >= 530 && status <= 534) )
            {
              Map<String, Integer> params = new HashMap<String, Integer>();
              params.put("conv_err_code", status);
              setConvertWarning(result, ConversionConstants.ERROR_FILE_IS_TOO_LARGE, "ConversionLibConverter - is exceed with limitation check"+status,
                  new ConversionException("ConversionLibConverter Spreadsheet is exceed with limitation check with error code "+status));
              result.getWarnings().get(0).setParameters(params);
              done = true;
            }
            else if (status == 535 || status == 536)
            {
              Map<String, Integer> params = new HashMap<String, Integer>();
              params.put("conv_err_code", status);
              setConvertWarning(result, ConversionConstants.ERROR_FILE_IS_TOO_LARGE, "ConversionLibConverter - is exceed with limitation check" + status,
                  new ConversionException("ConversionLibConverter Document is exceed with limitation check with error code " + status));
              result.getWarnings().get(0).setParameters(params);
              done = true;
            }
            else if (status == 537 || status == 538)
            {
              Map<String, Integer> params = new HashMap<String, Integer>();
              params.put("conv_err_code", status);
              setConvertWarning(result, ConversionConstants.ERROR_FILE_IS_TOO_LARGE, "ConversionLibConverter - is exceed with limitation check" + status,
                  new ConversionException("ConversionLibConverter Presentation is exceed with limitation check with error code " + status));
              result.getWarnings().get(0).setParameters(params);
              done = true;
            }
            else if (status == 411)
            {
              setConvertWarning(result, ConversionConstants.ERROR_CONTAIN_SVM_FILE, "ConversionLibConverter - contain svm files",
                  new ConversionException("ConversionLibConverter contains svm "));
              done = true;
            }
            else if (status == 520)
            {
              setConvertWarning(result, ConversionConstants.ERROR_UNKNOWN, "ConversionLibConverter - invalid file format",
                  new ConversionException("ConversionLibConverter invalid file format exception"));
              done = true;
            }
            else
            {
              ConversionLogger.log(log, Level.WARNING, status , "ConversionLibConverter - Unknown exit value");
              setConvertWarning(result, ConversionConstants.ERROR_CONVERSION_LIB, "ConversionLibConverter - Unknown exit value",
                  new ConversionException("ConversionLibConverter unknown exception"));
              done = true;
            }
          }
        }
        catch (IllegalThreadStateException e)
        {
          if (totalWait > timeout)
          {
            setConvertWarning(result, ConversionConstants.ERROR_WORK_MANAGER_OVERTIME, "ConversionLibConverter - Conversion timeout(>"
                + timeout + "ms)", e);
            done = true;
            forceDestroy = true;
          }
        }
        catch (InterruptedException e)
        {
          setConvertWarning(result, ConversionConstants.ERROR_CONVERSION_LIB, "ConversionLibConverter - InterruptedException, run " + totalWait + "ms", e);
          forceDestroy = true;
          done = true;
        }
      }
    }
    catch (IOException e)
    {
      setConvertWarning(result, ConversionConstants.ERROR_CONVERSION_LIB, "ConversionLibConverter - IOException", e);
    }
    finally
    {
      //Defect 53597, if the OOXMLConverter is deadlocked, the error stream thread may hang in br.readline(), so the stream can not be closed normally. 
      //Close the process directly , then the stream can be release automatically since connection is broken.
      if(forceDestroy)
      {
        if(process != null)
          process.destroy();
      }
      else
        endProcess(process, stHook);
    }
  }

  private static void endProcess(Process process, ConversionLibShutdownHook stHook)
  {
    if (stHook != null)
    {
      stHook.cleanUp();
    }
    if (process != null)
    {
      process.destroy();
    }
  }

  private static void setConvertWarning(ConversionResult result, String errId, String message, Exception e)
  {
    ConversionLogger.log(log, Level.WARNING, 527, message, e);
    ConversionWarning ce = new ConversionWarning(errId, false, "", e.getMessage());
    result.addWarning(ce);
    result.setSucceed(false);
  }
  public static String getFolder() {
	JSONObject st = (JSONObject) ConversionConfig.getInstance().getConfig("conversionLib");
	if (st != null) {
		String ret = new File((String) st.get("path"), "data").toString() + File.separator;
		log.info("Folder: " + ret);
		if (isWin)
			return ret + "ix-8-5-3-win-x86-32" + File.separator + "redist";
		else
			return ret + "ix-8-5-3-linux-x86-64" + File.separator + "redist";
		} else {
			log.severe("Get folder error.");
			return null;
		}
	}

	public static String getJavaFontsPath() {
		String wasRoot = WASConfigHelper.getWasInstallRoot();
		if (wasRoot != null) {
			return new StringBuffer(wasRoot).append(File.separator).append("java").append(File.separator).append("jre")
					.append(File.separator).append("lib").append(File.separator).append("fonts").toString();
		} else {
			log.severe("Get was.install.root error.");
			return null;
		}
	}

}
