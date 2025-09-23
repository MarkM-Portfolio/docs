/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.svm2png.svm;

import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;

public class SVMCommandID implements CommandID
{
  int func;
  long size;
  int version;
  
  public int getFunc()
  {
    return func;
  }
  public long getSize()
  {
    return size;
  }
  public int getVersion()
  {
    return version;
  }
  @Override
  public boolean equals(Object o)
  {
    if( o instanceof SVMCommandID )
    {
      SVMCommandID cmd = (SVMCommandID)o;
      return func == cmd.func;
    }
    else
      return false;
  }
  @Override
  public int hashCode()
  {
    return func;
  } 
  public String toString()
  {
    return "Command " + Integer.toHexString(func);
  }
}
