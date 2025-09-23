/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.reposvr;

import java.io.File;
import java.io.InputStream;

import com.ibm.concord.spi.beans.MediaDescriptor;

public class TempfileDescriptor extends MediaDescriptor
{
  private String tempfilepath;

  public TempfileDescriptor(String title, String mime, InputStream stream, String tempfilepath)
  {
    super(title, mime, stream);
    this.tempfilepath = tempfilepath;
  }

  @Override
  public void dispose()
  {
    super.dispose();
    File tempfile = new File(tempfilepath);
    if (tempfile.exists())
      tempfile.delete();
  }
}