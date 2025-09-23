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
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;


public class PDFDocumentService extends AbstractDocumentService
{
  private static final String CLASS = PDFDocumentService.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);  
  
  private static final String PDF_MIMETYPE = "application/pdf";

  private static final String GIF_MIMETYPE = "application/gif";

  @Override
  protected String getMimeType()
  {
    return PDF_MIMETYPE;
  }

  @Override
  protected String getTargetMimeType()
  {
    return GIF_MIMETYPE;
  }

  @Override
  protected String getExtension()
  {
    return "pdf";
  }
}
