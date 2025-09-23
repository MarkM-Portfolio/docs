/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.wmf2png.wmf;

import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;

public class WMFCommandID implements CommandID
{
  int func;
  long size;
  
  public int getFunc()
  {
    return func;
  }
  public long getSize()
  {
    return size;
  }
  @Override
  public boolean equals(Object o)
  {
    if( o instanceof WMFCommandID )
    {
      WMFCommandID cmd = (WMFCommandID)o;
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
