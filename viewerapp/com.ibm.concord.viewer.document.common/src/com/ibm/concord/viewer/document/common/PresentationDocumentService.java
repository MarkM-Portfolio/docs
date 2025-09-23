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
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.job.IConversionJob;

public class PresentationDocumentService extends AbstractDocumentService
{
  private static final String CLASS = PresentationDocumentService.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  private static final String ODP_MIMETYPE = "application/vnd.oasis.opendocument.presentation";

  private static final String GIF_MIMETYPE = "application/gif";

  private static final String HTML_MIMETYPE = "text/html";
  
  private static final String JSON_MIMETYPE = "application/json";

  public String export(UserBean caller, IDocumentEntry docEntry, String targetMimeType, String toDir, Map<String, Object> options,
      ICacheDescriptor draftDesc) throws Exception
  {
    return null;
  }

  public void forwardViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    // slide show will be redirected to slideShow.jsp, where also need to support relative url
    String mode = request.getParameter("mode");
    boolean isSlideShow = false;
    if (mode != null)
    {
      String[] modes = mode.split(":");
      if (modes != null)
      {
        for (String m : modes)
        {
          if (m.equals("slideshow"))
          {
            isSlideShow = true;
            break;
          }
        }
      }
    }
    if (isSlideShow)
    {
      request.getRequestDispatcher("/jsp/slideShow.jsp").forward(request, response);
    }
    else
    {
      super.forwardViewPage(caller, docEntry, request, response);
    }
  }

  @Override
  protected String getMimeType()
  {
    return ODP_MIMETYPE;
  }

  
  private String getJsonTargetMimeType()
  {
    return JSON_MIMETYPE;
  }

  protected String getHtmlTargetMimeType()
  {
    return HTML_MIMETYPE;
  }

  @Override
  protected String getTargetMimeType()
  {
    return GIF_MIMETYPE;
  }

  @Override
  protected String getExtension()
  {
    return "odp";
  }

  public IDocumentEntry importDocument(UserBean caller, String userAgent, String mode, IDocumentEntry entry, IConversionJob job)
      throws Exception
  {
    LOG.entering(CLASS, "importDocument", new Object[] { entry.getDocUri() });
    if (JobUtil.isHTMLJob(job))
    {
      PresDocumentServiceHelper documentServiceHelper = new PresDocumentServiceHelper(caller, userAgent, mode, entry, conversionService,
          this.getJsonTargetMimeType(), job);
      // documentServiceHelper.setUserAgent(userAgent);
      // documentServiceHelper.setMode(mode);
      documentServiceHelper.exec();
    }
    else
    {
      super.importDocument(caller, userAgent, mode, entry, job);
    }
    LOG.exiting(CLASS, "importDocument", new Object[] { entry.getDocUri() });
    return entry;
  }
}
