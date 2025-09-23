package com.ibm.rcp.spellcheck.webapp.framework;

import java.io.File;
import java.io.FileFilter;

public class SCFileFilter implements FileFilter
{

  @Override
  public boolean accept(File pathname)
  {
    if(pathname.getName().startsWith("com.ibm.docs.spellcheck"))
    {
      return true;
    }
    return false;
  }

  
}
