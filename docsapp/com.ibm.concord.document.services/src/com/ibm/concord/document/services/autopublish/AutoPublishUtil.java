package com.ibm.concord.document.services.autopublish;

import com.ibm.concord.config.AutoPublishConfig;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.RepositoryConstants;

public class AutoPublishUtil
{
  static private boolean featureEnabled = AutoPublishConfig.getFeatureEnabled();
  
  static private boolean globalEnabled = AutoPublishConfig.getAutoPublish();

  static private long newVersionInterval = AutoPublishConfig.getMaxAutoPublishInterval();

  private static boolean getAutoPublish(IDocumentEntry docEntry)
  {
    IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
    IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
    DocHistoryBean docHistoryBean = docHisotryDAO.get(docEntry.getRepository(), docEntry.getDocUri());
    if(docHistoryBean!= null)
    {
      return docHistoryBean.getAutoPublish();    
    }
    
    String communityId = docEntry.getCommunityId();
    boolean bEmptyCommunityId = (communityId == null || communityId.length() == 0);
    // ECM repository with empty community it, it is icn
    if (RepositoryConstants.REPO_TYPE_ECM.equalsIgnoreCase(docEntry.getRepository()) && bEmptyCommunityId)
    {
      return AutoPublishConfig.getAutoCheckIn();
    }
    else
    {
      return AutoPublishConfig.getAutoPublish();
    }
    
  }

  public static void setAutoPublish(IDocumentEntry docEntry, boolean publish)
  {
    IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
    IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
    DocHistoryBean docHistoryBean = docHisotryDAO.get(docEntry.getRepository(), docEntry.getDocUri());
    if(docHistoryBean!= null)
    {
      docHistoryBean.setAutoPublish(publish);
      docHisotryDAO.updateAutoPublish(docHistoryBean);  
    }
  }
  
  public static boolean isGlobalAutoPublish()
  {
    return globalEnabled;
  }

  public static boolean isAutoPublish(IDocumentEntry docEntry)
  {
    return AutoPublishUtil.getAutoPublish(docEntry);
  }
  
  public static boolean isFeatureEnabled()
  {
    return featureEnabled;
  }

  public static long getNewVersionInterval()
  {
    return newVersionInterval;
  }
}
