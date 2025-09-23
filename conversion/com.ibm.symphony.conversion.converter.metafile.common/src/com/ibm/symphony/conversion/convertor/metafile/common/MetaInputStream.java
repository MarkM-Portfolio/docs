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
import java.io.InputStream;

public abstract class MetaInputStream extends MetaDataInputStream
{
  protected ICommandFactory commandFactory;

  public MetaInputStream(InputStream in, ICommandFactory commandFactory)
  {
    super(in);
    this.commandFactory = commandFactory;
  }

  public abstract MetaHeader readHeader() throws IOException;

  protected abstract CommandID readCommandID() throws IOException;

  public Command readCommand() throws IOException
  {
    CommandID id = readCommandID();
    if (id == null)
      return null;

    Command cmd = commandFactory.getCommand(id);
    if (cmd != null)
      cmd = cmd.read(this, id);
    return cmd;
  }
}
