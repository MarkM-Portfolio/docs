package com.ibm.concord.platform.util;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocActivityDAO;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.dao.IDocReferenceDAO;
import com.ibm.concord.platform.dao.IDocTaskDAO;
import com.ibm.concord.platform.dao.IDocumentEditorsDAO;
import com.ibm.concord.platform.dao.IUserDocCacheDAO;
import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.framework.IComponent;

public class DbCleaner
{
  static public void cleanDb(final DocHistoryBean dhb)
  {
    IDocumentEntry newDocEntry = new AbstractDocumentEntry()
    {
      public String getDocId()
      {
        return dhb.getDocId();
      }
      public String getDocUri()
      {
        return dhb.getDocUri();
      }
      public String getRepository()
      {
        return dhb.getRepoId();
      }
      public boolean isPublished()
      {
        return true;
      }
    };
    
    cleanDb(newDocEntry);
  }
  
  static public void cleanDb(final DraftDescriptor dd, final IDocumentEntry docEntry)
  {
    IDocumentEntry newDocEntry = new AbstractDocumentEntry()
    {
      public String getDocId()
      {
        return docEntry.getDocId();
      }
      public String getDocUri()
      {
        return dd.getDocId();
      }
      public String getRepository()
      {
        return docEntry.getRepository();
      }
      public boolean isPublished()
      {
        return true;
      }
    };
    
    cleanDb(newDocEntry);
  }
  
  static private void cleanDb(final IDocumentEntry newDocEntry)
  {
    IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
    IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
    IDocumentEditorsDAO docEditorsDAO = (IDocumentEditorsDAO) daoComp.getService(IDocumentEditorsDAO.class);
    IDocActivityDAO docActivitiesDAO = (IDocActivityDAO) daoComp.getService(IDocActivityDAO.class);
    IDocReferenceDAO docReferenceDAO = (IDocReferenceDAO) daoComp.getService(IDocReferenceDAO.class);
    IUserDocCacheDAO docCacheDAO = (IUserDocCacheDAO)daoComp.getService(IUserDocCacheDAO.class);
    IDocTaskDAO taskDAO = (IDocTaskDAO)daoComp.getService(IDocTaskDAO.class);
    docEditorsDAO.removeAllEditors(newDocEntry);
    docHisotryDAO.delete(newDocEntry.getRepository(), newDocEntry.getDocUri());
    docActivitiesDAO.deleteByRepoAndUri(newDocEntry.getRepository(), newDocEntry.getDocUri());
    docReferenceDAO.deleteByChildDocument(newDocEntry.getRepository(), newDocEntry.getDocUri());
    docReferenceDAO.deleteByParentDocument(newDocEntry.getRepository(), newDocEntry.getDocUri());
    docCacheDAO.deleteDocCache(newDocEntry.getDocId());
    taskDAO.deleteByDocID(newDocEntry.getRepository(), newDocEntry.getDocUri());
  }
}
