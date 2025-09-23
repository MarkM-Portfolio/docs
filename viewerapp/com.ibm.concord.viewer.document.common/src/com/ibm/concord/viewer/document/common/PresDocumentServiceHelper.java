/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.document.common;

import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.conversion.IConversionService;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.job.IConversionJob;

/**
 * @author sfeiguo@cn.ibm.com
 * 
 */
public class PresDocumentServiceHelper extends SpreadsheetDocumentServiceHelper
{
  private String targetMimeType = "text/html";

  public PresDocumentServiceHelper(UserBean caller, String userAgent, String mode, IDocumentEntry entry,
      IConversionService conversionService, String targetMimeType, IConversionJob job)
  {
    super(caller, userAgent, mode, entry, conversionService, targetMimeType, job);
    LOG = Logger.getLogger(TextDocumentServiceHelper.class.getName());
  }

  protected String getTargetMimeType()
  {
    return this.targetMimeType;
  }

}
