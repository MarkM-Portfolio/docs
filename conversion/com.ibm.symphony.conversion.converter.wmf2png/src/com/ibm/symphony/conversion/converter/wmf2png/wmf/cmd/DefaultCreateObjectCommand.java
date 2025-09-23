/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.wmf2png.wmf.cmd;

import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFCommandID;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class DefaultCreateObjectCommand extends CreateObject
{
  @Override
  public void onSelectObject(WMFRenderer renderer)
  {
    //do nothing;
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    WMFCommandID cmdID = (WMFCommandID) id;
    if( cmdID.getSize() > 3 )
    {
      in.skip( (cmdID.getSize() - 3) << 1);
    }
    this.id = cmdID;
    return this;
  }

}
