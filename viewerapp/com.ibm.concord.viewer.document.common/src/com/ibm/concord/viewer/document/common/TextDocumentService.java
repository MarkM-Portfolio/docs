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

import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.job.IConversionJob;

public class TextDocumentService extends AbstractDocumentService
{
  private static final String CLASS = TextDocumentService.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  private static final String ODT_MIMETYPE = "application/vnd.oasis.opendocument.text";

  private static final String GIF_MIMETYPE = "application/gif";

  private static final String HTML_MIMETYPE = "text/html";
  
  private static final String JSON_MIMETYPE = "application/json";

  @Override
  protected String getMimeType()
  {
    // TODO Auto-generated method stub
    return ODT_MIMETYPE;
  }

  @Override
  protected String getTargetMimeType()
  {
    // TODO Auto-generated method stub
    return GIF_MIMETYPE;
  }

  @Override
  protected String getExtension()
  {
    // TODO Auto-generated method stub
    return "odt";
  }
  
  private String getJsonTargetMimeType()
  {
    return JSON_MIMETYPE;
  }

  protected String getHtmlTargetMimeType()
  {
    return HTML_MIMETYPE;
  }

  public IDocumentEntry importDocument(UserBean caller, String userAgent, String mode, IDocumentEntry entry, IConversionJob job)
      throws Exception
  {
    LOG.entering(CLASS, "importTextDocument", new Object[] { entry.getDocUri() });
    if (JobUtil.isHTMLJob(job))
    {
      TextDocumentServiceHelper documentServiceHelper = new TextDocumentServiceHelper(caller, userAgent, mode, entry,
    		  conversionService, this.getJsonTargetMimeType(), job);
      //documentServiceHelper.setUserAgent(userAgent);
      documentServiceHelper.exec();
    }
    else
    {
      super.importDocument(caller, userAgent, mode, entry, job);
    }
    LOG.exiting(CLASS, "importTextDocument", new Object[] { entry.getDocUri() });
    return entry;
  }
}
