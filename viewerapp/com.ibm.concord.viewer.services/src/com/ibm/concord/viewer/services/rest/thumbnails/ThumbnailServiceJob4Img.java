/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.viewer.services.rest.thumbnails;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.websphere.asynchbeans.Work;
import com.ibm.websphere.asynchbeans.WorkException;

public class ThumbnailServiceJob4Img implements Work
{
  private static final Logger logger = Logger.getLogger(ThumbnailServiceJob4Img.class.getName());

  private IDocumentEntry docEntry;

  private UserBean user;

  // FIXME: copy cookies between threads, because they are thread local
  // should be deprecated when new S2S arrived
  private URLConfig config;

  public ThumbnailServiceJob4Img(UserBean user, IDocumentEntry docEntry)
  {
    this.docEntry = docEntry;
    this.user = user;
    this.config = URLConfig.toInstance();
  }

  @Override
  public void run()
  {
    logger.entering(ThumbnailServiceJob4Img.class.getName(), "run", new Object[] { user.getId(), docEntry.getDocUri() });

    /*
     * Copy cookies from WAS thread into Concord Job thread.
     */
    if (config != null)
    {
      URLConfig.fromInstance(config);
    }

    try
    {
      ThumbnailService4Img thumbs = new ThumbnailService4Img(user, docEntry);
      thumbs.exec();
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Exception:" + e.getMessage());
    }
    finally
    {
      synchronized (docEntry)
      {
        docEntry.notifyAll();
      }
    }
    logger.entering(ThumbnailServiceJob4Img.class.getName(), "run");
  }

  @Override
  public void release()
  {
    // TODO Auto-generated method stub
  }

  public void schedule()
  {
    logger.entering(ThumbnailServiceJob4Img.class.getName(), "schedule", new Object[] { user.getId(), docEntry.getDocUri() });
    try
    {
      Platform.getUploadWorkManager().startWork(this);
    }
    catch (WorkException e)
    {
      logger.log(Level.SEVERE, "Failed to start thumbnail conversion work for Document Id:" + docEntry.getDocId(), e);
    }
    logger.exiting(ThumbnailServiceJob4Img.class.getName(), "schedule");
  }
}
