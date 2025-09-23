/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.convertor.metafile.common;

import java.io.IOException;


public abstract class Command
{
  protected CommandID id;
  
  public CommandID getCommandID()
  {
    return id;
  }
  
  protected abstract Command read(MetaInputStream in, CommandID id) throws IOException;
  
  public abstract void execute(MetaRenderer renderer);

  public String toString()
  {
    if( id != null )
      return id.toString();
    else
      return "Incorrect Command";
  }
}
