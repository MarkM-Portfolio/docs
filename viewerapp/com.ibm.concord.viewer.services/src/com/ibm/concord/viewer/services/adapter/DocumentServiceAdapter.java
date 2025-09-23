/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.adapter;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.UUID;
import java.util.logging.Logger;
import com.ibm.lconn.files.spi.remote.DocumentService;

/**
 * 
 * @author Yin Dali
 * This class is used to adapt the different versions of EJB jar. In 3.6 version, document service
 * doesn't have the method logDocumentDownload, however in 3.6.1 it does have.
 *
 */

public class DocumentServiceAdapter
{
  private static final Logger LOG = Logger.getLogger(DocumentServiceAdapter.class.getName());
  
  private DocumentService docSrv;
  
  public DocumentServiceAdapter(DocumentService srv)
  {
    docSrv = srv;
  }
  
  @SuppressWarnings({ "unchecked", "rawtypes" })
  public void addJournalLog(UUID docid)
  {
    try
    {
      Class enumClass = Class.forName("com.ibm.lconn.files.spi.remote.DownloadType");
      Method method = docSrv.getClass().getMethod("logDocumentDownload", UUID.class, enumClass);
      Object arglists[] = new Object[2];
      arglists[0] = docid;
      arglists[1] = Enum.valueOf(enumClass, "VIEW");
      method.invoke(docSrv, arglists);
      
      LOG.fine("logDocumentDownload invoked");
    }
    catch (ClassNotFoundException e1)
    {
      LOG.warning("The class DocumentService doesn't exists when invoking the method logDocumentDownload");
    }
    catch (IllegalAccessException e)
    {
      LOG.warning("Exception when access method logDocumentDownload.");
    }
    catch (IllegalArgumentException e)
    {
      LOG.warning("The parameter of logDocumentDownload is invalid");
    }
    catch (InvocationTargetException e)
    {
      LOG.warning("Exception when invoking the method logDocumentDownload");
    }
    catch (SecurityException e)
    {
      LOG.warning("SecurityException thrown when invoking the method logDocumentDownload");
    }
    catch (NoSuchMethodException e)
    {
      LOG.warning("NoSuchMethodException thrown when invoking the method logDocumentDownload");
    }
  }

}
