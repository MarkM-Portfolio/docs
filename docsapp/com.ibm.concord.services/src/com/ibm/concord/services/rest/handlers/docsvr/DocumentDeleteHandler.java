/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.concord.platform.util.Constant;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.util.DraftCleaner;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.entitlement.IEntitlementService.EntitlementLevel;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONObject;

/**
 * Handler to handle the document uploading events being sent from IC servers.
 * 
 */
public class DocumentDeleteHandler implements PostHandler
{
  public static final Logger LOGGER = Logger.getLogger(DocumentDeleteHandler.class.getName());

  /**
   * 
   */
  public DocumentDeleteHandler()
  {
    
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.services.rest.PostHandler#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String method = request.getParameter("method");
    String repoId = pathMatcher.group(1);
    String uuid = pathMatcher.group(2);
    
    IEntitlementService service = (IEntitlementService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
        IEntitlementService.class);    
    EntitlementLevel entitlement = service.getEntitlementLevel(user);
    
    if(entitlement.equals(EntitlementLevel.NONE))
    {
      LOGGER.log(Level.FINE, "The user {0} is not entitled for remove draft during deleting repository", new Object[]{user.getId()});
      return;
    }    

    if(RepositoryConstants.REPO_TYPE_ECM.equalsIgnoreCase(repoId))
    {// deleted ECM/CCM documents or version
      LOGGER.log(Level.INFO, "The user {0} is requesting to remove draft/version {1} in repository {2} during deleting repository", new Object[]{user.getId(), uuid, repoId});
      IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
      IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
      if("version".equalsIgnoreCase(method))
      { // deleted a certain CCM document version or draft
        String versionId = Constant.REPO_ECM_URI_PREFIX + uuid;
        DocHistoryBean bean = docHisotryDAO.get(repoId, versionId, false);
        if(bean != null)
        {
          DraftCleaner cleaner = new DraftCleaner(bean);
          cleaner.run();
        }        
      }
      else
      { // deleted CCM document 
        LOGGER.log(Level.INFO, "The user {0} is requesting to remove document {1} in repository {2} during deleting repository", new Object[]{user.getId(), uuid, repoId});
        String versionSeriesId = Constant.REPO_ECM_VERSIONSERIES_PREFIX + uuid;
        ArrayList <DocHistoryBean> beans = docHisotryDAO.get(repoId, null, versionSeriesId);
        if(beans != null && beans.size() > 0)
        {
          Iterator <DocHistoryBean> iterator = beans.iterator();
          while (iterator.hasNext())
          {
            DocHistoryBean dhb = iterator.next();
            DraftCleaner cleaner = new DraftCleaner(dhb);
            cleaner.run();
          }
        } 
        else
        {
          RepositoryProviderRegistry registry = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
              .getService(RepositoryProviderRegistry.class);
          IRepositoryAdapter repoAdpt = registry.getRepository(repoId);          
          JSONObject config = repoAdpt.getConfig();
          if(config != null)
          {
            String objectStore = (String) config.get(Constant.KEY_CONFIG_OBJECT_STORE);
            if(objectStore != null)
            {
              String versionSeriesURI = versionSeriesId + Constant.REPO_ECM_URI_POSTFIX + objectStore;          
              DraftStorageManager draftStoreMgr = DraftStorageManager.getDraftStorageManager();
              DraftDescriptor draftDescriptor = draftStoreMgr.getDraftDescriptor(user.getCustomerId(), repoId, versionSeriesURI);
              DraftCleaner cleaner = new DraftCleaner(draftDescriptor, null, false);
              cleaner.run();              
            }
            else
            {
              LOGGER.log(Level.WARNING, "The objectStore is null when delete upload conversion draft for CCM!");              
            }
          }
          else
          {
            LOGGER.log(Level.WARNING, "The config is null when delete upload conversion draft for CCM!");            
          }
        }
      }
    }            
    return;
  }
}
