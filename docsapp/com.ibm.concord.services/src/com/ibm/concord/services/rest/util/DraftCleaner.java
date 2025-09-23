package com.ibm.concord.services.rest.util;

import java.io.File;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.util.DbCleaner;
import com.ibm.concord.session.DocumentSessionService;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.websphere.asynchbeans.Work;

public class DraftCleaner implements Runnable, Work
{
  private static final Logger LOG = Logger.getLogger(DraftCleaner.class.getName());
  private DraftDescriptor dd;
  private IDocumentEntry docEntry;
  private DocHistoryBean docHistoryBean;
  private boolean closeSession;
  
  private static final String RENAME_TAG = ".keep.";
  
  public DraftCleaner(final DraftDescriptor dd, final IDocumentEntry docEntry, boolean closeSession)
  {
    this.dd = dd;
    this.docEntry = docEntry;
    this.docHistoryBean = null;
    this.closeSession = closeSession;
  }
  
  public DraftCleaner(final DocHistoryBean dhb)
  {
    this.dd = DraftStorageManager.getDraftStorageManager(false).getDraftDescriptor(dhb.getOrgId(), dhb.getRepoId(), dhb.getDocUri());
    this.docHistoryBean = dhb;
    this.docEntry = null;
  }  
  
  public void run()
  {    
    String dirPath = this.dd.getInternalURI();
    boolean cleaned = false;
    
    try
    {
      if(closeSession)
      {
        SessionManager.getInstance().closeSession(docEntry); 
        DraftStorageManager.getDraftStorageManager().discardDraft(this.dd);  
        cleaned = true;
      }      
      else
      {
        boolean sessionLived = false;
        if(docHistoryBean != null)
        {
          try
          {         
            DocumentSessionService service = DocumentSessionService.getInstance();
            String srvNameInDB = service.getServingServer(docHistoryBean.getRepoId(), docHistoryBean.getDocUri()); 
            if(srvNameInDB != null)
            {
              sessionLived = true;
            }
          }
          catch(Exception e)
          {
            LOG.log(Level.WARNING, "Error to get the session served server: ", e);
          }
        }

        if(!sessionLived)
        {
          DraftStorageManager.getDraftStorageManager().discardDraft(this.dd);
          cleaned = true;
        }   
        else
        {
          LOG.log(Level.INFO, "The document is editing by Docs server when delete draft: ", this.dd.getDocId());
        }
      }           
    }
    catch (ConcordException e)
    {
      LOG.log(Level.WARNING, "Failed to clean draft " + this.dd + " due to discardDraft failed.", e);
    }  
        
    if(cleaned)
    {
      File keptFile = new File(dirPath + RENAME_TAG + UUID.randomUUID().toString());
      if (new File(dirPath).renameTo(keptFile))
      {
        FileUtil.cleanDirectory(keptFile);
        if (keptFile.delete())
        {
          if (LOG.isLoggable(Level.FINE))
          {
            LOG.log(Level.FINE, "Draft " + this.dd.getDocId() + " was cleaned by DraftCleaner. The path is " + dirPath);
          }
        }
        else
        {
          LOG.log(Level.WARNING, "Failed to perform DraftCleaner for draft " + this.dd + " due to delete failed. The path is " + dirPath);
        }
      }
      else
      {
        LOG.log(Level.WARNING, "Failed to perform DraftCleaner for " + this.dd + " due to rename failed. The path is " + dirPath);
      }  
      
      if(docEntry!=null)
      {
        DbCleaner.cleanDb(dd, docEntry);
      }
      else if(docHistoryBean != null)
      {
        DbCleaner.cleanDb(docHistoryBean);
      } 
    }     
  }

  public void release()
  {
    // TODO Auto-generated method stub    
  }
}
