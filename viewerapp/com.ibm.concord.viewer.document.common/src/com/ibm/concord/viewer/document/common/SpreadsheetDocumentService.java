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

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.job.IConversionJob;

public class SpreadsheetDocumentService extends AbstractDocumentService
{
  private static final String CLASS_NAME = SpreadsheetDocumentService.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS_NAME);

  public static final String ODS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet";

  private static final String GIF_MIMETYPE = "application/gif";

  private static final String JSON_MIMETYPE = "application/json";

  public void forwardViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    request.getRequestDispatcher("/WEB-INF/pages/view.jsp").forward(request, response);
  }

  @Override
  protected String getMimeType()
  {
    // TODO Auto-generated method stub
    return ODS_MIMETYPE;
  }

  private String getJsonTargetMimeType()
  {
    // TODO Auto-generated method stub
    return JSON_MIMETYPE;
  }

  protected String getTargetMimeType()
  {
    // TODO Auto-generated method stub
    return GIF_MIMETYPE;
  }

  @Override
  protected String getExtension()
  {
    // TODO Auto-generated method stub
    return "ods";
  }

  // TODO: Only to use SpreadsheetDocumentServiceHelper for HTML viewer,call super() for image viewer.
  public IDocumentEntry importDocument(UserBean caller, String userAgent, String mode, IDocumentEntry entry, IConversionJob job)
      throws Exception
  {
    LOG.entering(CLASS_NAME, "importDocument", new Object[] { entry.getDocUri() });
    if (JobUtil.isHTMLJob(job))
    {
      SpreadsheetDocumentServiceHelper documentServiceHelper = new SpreadsheetDocumentServiceHelper(caller, userAgent, mode, entry,
          conversionService, this.getJsonTargetMimeType(), job);
      // documentServiceHelper.setUserAgent(userAgent);
      // documentServiceHelper.setMode(mode);
      documentServiceHelper.exec();
    }
    else
    {
      super.importDocument(caller, userAgent, mode, entry, job);
    }
    LOG.exiting(CLASS_NAME, "importDocument", new Object[] { entry.getDocUri() });
    return entry;
  }
}
