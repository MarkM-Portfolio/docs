package com.ibm.concord.viewer.services.servlet;

import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.viewer.services.event.conversion.UploadConversionService;
import com.ibm.concord.viewer.services.rest.thumbnails.ThumbnailService;
import com.ibm.concord.viewer.services.rest.thumbnails.ThumbnailService4Doc;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;

public class ECMNewsHandler4Doc extends ECMNewsHandler
{

  public ECMNewsHandler4Doc(HttpServletRequest request, EventType type, String docId)
  {
    super(request, type, docId);
  }

  @Override
  protected void thumbnailService(UserBean user, IDocumentEntry docEntry)
  {
    ThumbnailService thums = new ThumbnailService4Doc(user, docEntry);
    thums.exec();
  }

  @Override
  public void conversionService(UserBean user, IDocumentEntry docEntry)
  {
    UploadConversionService jms = new UploadConversionService(user, docEntry);
    jms.exec();
  }  
}
