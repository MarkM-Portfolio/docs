/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of HCL                              */
/*                                                                   */
/* Copyright HCL Technologies Ltd. 2011, 2022                        */
/*                                                                   */
/* US Government Users Restricted Rights                             */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.im.installer.util;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.eclipse.core.runtime.FileLocator;
import org.eclipse.core.runtime.Path;
import org.eclipse.osgi.util.NLS;

import com.ibm.docs.im.installer.DocsPlugin;
import com.ibm.docs.im.installer.internal.Messages;

public class PythonCheck
{     
  private static final String PYTHON_CMD_NAME = "python -V";
  
  private static final int VERSION_BIT_1 = 3;
  private static final int VERSION_BIT_2 = 6;
 
  //private static final String ERROR_PYTHON_NOT_FOUND = "PYTHON001";
  //private static final String ERROR_PYTHON_LOWER_VERSION = "PYTHON002";
  
  private static final String PYTHON_VERSION_AT_LEAST = "3.6.x";
  
  private String python_version = null;

  public static boolean bPythonFound = true;
   
  public enum PythonInfo {
    NONE, VERSION, OSPATH, OK
  }; 

  public PythonCheck()
  {
    
  }

  /**
   * Obtain the error message after validating versions of pre-installed components.
   * 
   * @param theMap
   *          , the error map
   * @return the error message
   */
  public String getErrorMessages(PythonInfo error)
  {
    StringBuffer errorBuffer = new StringBuffer();
    if (error == PythonInfo.OSPATH)
    {
      errorBuffer.append(Messages.getString("Message_WASInfoPanel$python"));
    }
    else if (error == PythonInfo.VERSION && python_version!=null)
    {
      errorBuffer.append(NLS.bind(Messages.getString("Message_WASInfoPanel$pythonVer"), new Object[]{python_version, PYTHON_VERSION_AT_LEAST}));
    }else
    {
      errorBuffer.append(Messages.getString("Message_WASInfoPanel$pythonNone"));
    }
    
    return errorBuffer.toString();
  }

  /**
   * To validate all selected features to check whether the versions are satisfied the requirement.
   * 
   * @return version status
   */
  @SuppressWarnings("finally")
  public PythonInfo validate()
  {    
    List<String> params = new ArrayList<String>(Arrays.asList(PYTHON_CMD_NAME.split("\\s+")));
    ProcessBuilder pb = new ProcessBuilder(params);
    pb.redirectErrorStream(true);

    URL url = DocsPlugin.getDefault().getBundle().getResource("/");
    if (url == null)
      return null;

    String absPath = null;
    try
    {
      absPath = new Path(FileLocator.toFileURL(url).getPath()).toOSString();
    }
    catch (IOException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    

    pb.directory(new File(absPath));
    Process p = null;
    StringBuilder result = new StringBuilder();
    try
    {
      p = pb.start();      
    }
    catch (IOException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
      bPythonFound = false;
      result.append(e.getMessage());
    }
    finally
    {
    	if (p!=null)
        {
          final Scanner scanner = new Scanner(p.getInputStream());
          
          while(scanner.hasNextLine())
          {
            result.append(scanner.nextLine());
            //result.append(System.getProperty("line.separator"));
          }          
          scanner.close();
        }
        return parseResult(result.toString());
    }
  }  
  
  private PythonInfo parseResult(String msg)
  {
    if (msg==null || msg.trim().length()==0)
      return PythonInfo.NONE;
    
    Pattern pattern = Pattern.compile("(\\d+\\.)?(\\d+\\.)?(\\*|\\d+)$");
    Matcher matcher = pattern.matcher(msg);
    python_version = null; 
    while(matcher.find())
    {
      //String ret = matcher.group();
      int start = matcher.start();
      int end = matcher.end();
      //int ii = end;
      python_version = msg.substring(start, end);
      break;      
    }
    
    if (python_version!=null)
    {
      String[] rets = python_version.split("[.]");
      if ( Integer.valueOf(rets[0]) < VERSION_BIT_1
          || (Integer.valueOf(rets[0]) == VERSION_BIT_1 && Integer.valueOf(rets[1]) < VERSION_BIT_2))
      {        
        return PythonInfo.VERSION;
      }
      
    }else
    {      
      return PythonInfo.OSPATH;
    }
    
    
    
    return PythonInfo.OK;
  }
  
  public static boolean getPythonFound()
  {
	  return bPythonFound;
  }
  
  public static void setPythonFound(boolean bArg)
  {
	  bPythonFound = bArg;
  }
}
