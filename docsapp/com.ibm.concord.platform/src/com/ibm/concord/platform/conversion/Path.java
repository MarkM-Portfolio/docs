/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.conversion;

import java.io.File;

public class Path
{
  private static final boolean WIN = File.separatorChar == '\\';
  private static final char SEPARATOR = '/';
  
  private String path;
  private String prefix;
  
  public Path(String prefix, String filePath)
  {
    this.prefix = prefix;
    this.path = filePath;
  }
  
  public String resolveToRelativePath()
  {
    if(WIN)
    {
      if(prefix.indexOf('\\') == -1)
      {
        if(path.indexOf('\\') != -1)
        {
          path = path.replace('\\', SEPARATOR);
        
        }
        if(prefix.endsWith("/"))
        {
          path = path.substring(prefix.length() - 1, path.length());
        }
        else
        {
          path = path.substring(prefix.length(), path.length());
        }
      }
      else
      {
        if(path.indexOf('\\') == -1)
        {
          path = path.replace(SEPARATOR, '\\');
        
        }
        if(prefix.endsWith("\\"))
        {
          path = path.substring(prefix.length() - 1, path.length());
        }
        else
        {
          path = path.substring(prefix.length(), path.length());
        }
      }
    }
    else
    {
      if(prefix.endsWith("/"))
      {
        path = path.substring(prefix.length() - 1, path.length());
      }
      else
      {
        path = path.substring(prefix.length(), path.length());
      }
    }
    return path;
  }
  
  public String resolveToAbsolutePath()
  {
    if(WIN)
    {
      if(prefix.indexOf('\\') == -1)
      {
        if(path.indexOf('\\') != -1)
        {
          path = path.replace('\\', SEPARATOR);
        }
        prefix = trim(prefix);
      }
      else
      {
        if(path.indexOf('\\') == -1)
        {
          path = path.replace(SEPARATOR, '\\');
        }
        prefix = trim(prefix);
      }
    }
    else
    {
      if(path.indexOf('/') == -1)
      {
        path = path.replace('\\', '/');
      }
      prefix = trim(prefix);
    }
    path = prefix + path;
    return path;
  }
  
  public static String trim(String str)
  {
    if(WIN)
    {
      if(str.endsWith("/") || str.endsWith("\\"))
      {
        str = str.substring(0, str.length() - 1);
      } 
    }
    else
    {
      if(str.endsWith("/"))
      {
        str = str.substring(0, str.length() - 1);
      }
    }
    return str;
  }
}