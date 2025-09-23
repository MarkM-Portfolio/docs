/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.dao;

import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class DataAccessComponentImpl extends Component
{
  public static final String COMPONENT_ID = "com.ibm.concord.platform.dao";

  // private IDocSessionDAO docSessionDAO;
  private IUserPreferenceDAO userPrefDAO;

  private IDocumentEditorsDAO docEditorsDAO;

  private IDocActivityDAO docActDAO;

  private IDocReferenceDAO docRefDAO;  

  private IDocHistoryDAO docHistoryDAO;

  private IDocumentSessionDAO docSessionDAO;

  private IUserDocCacheDAO userDocCacheDAO;

  private IDocRecentsDAO docRecentsDAO;

  private IDocTaskDAO docTaskDAO;

  private IDocAssociationDAO docAssociationDAO;

  private IDocTaskHistoryDAO docTaskHistoryDAO;

  private IDocMessageDAO docMessageDAO;

  private IRevisionDAO docRevisionDAO;
  
  protected void init(JSONObject config) throws InitializationException
  {
    try
    {
      Class<?> clazz = Class.forName("com.ibm.concord.dao.db2.UserPreferenceDAOImpl");
      userPrefDAO = (IUserPreferenceDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.DocumentEditorsDAOImpl");
      docEditorsDAO = (IDocumentEditorsDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.DocActivityDAOImpl");
      docActDAO = (IDocActivityDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.DocReferenceDAOImpl");
      docRefDAO = (IDocReferenceDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.DocHistoryDAOImpl");
      docHistoryDAO = (IDocHistoryDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.DocumentSessionDAOImpl");
      docSessionDAO = (IDocumentSessionDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.UserDocCacheDAOImpl");
      userDocCacheDAO = (IUserDocCacheDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.DocRecentsDAOImpl");
      docRecentsDAO = (IDocRecentsDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.DocTaskDAOImpl");
      docTaskDAO = (IDocTaskDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.DocAssociationDAOImpl");
      docAssociationDAO = (IDocAssociationDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.DocTaskHistoryDAOImpl");
      docTaskHistoryDAO = (IDocTaskHistoryDAO) clazz.newInstance();

      clazz = Class.forName("com.ibm.concord.dao.db2.DocMessageDAOImpl");
      docMessageDAO = (IDocMessageDAO) clazz.newInstance();
      
      clazz = Class.forName("com.ibm.concord.dao.db2.DocRevisionDAOImpl");
      docRevisionDAO = (IRevisionDAO) clazz.newInstance();
    }
    catch (ClassNotFoundException e)
    {
      e.printStackTrace();
    }
    catch (IllegalAccessException e)
    {
      e.printStackTrace();
    }
    catch (InstantiationException e)
    {
      e.printStackTrace();
    }
  }

  public Object getService(Class<?> clazz)
  {
    if (clazz == IUserPreferenceDAO.class)
    {
      return userPrefDAO;
    }
    else if (clazz == IDocumentEditorsDAO.class)
    {
      return docEditorsDAO;
    }
    else if (clazz == IDocActivityDAO.class)
    {
      return docActDAO;
    }
    else if (clazz == IDocReferenceDAO.class)
    {
      return docRefDAO;
    }
    else if (clazz == IDocHistoryDAO.class)
    {
      return docHistoryDAO;
    }
    else if (clazz == IDocumentSessionDAO.class)
    {
      return docSessionDAO;
    }
    else if (clazz == IUserDocCacheDAO.class)
    {
      return userDocCacheDAO;
    }
    else if (clazz == IDocRecentsDAO.class)
    {
      return docRecentsDAO;
    }
    else if (clazz == IDocTaskDAO.class)
    {
      return docTaskDAO;
    }
    else if (clazz == IDocAssociationDAO.class)
    {
      return docAssociationDAO;
    }
    else if (clazz == IDocTaskHistoryDAO.class)
    {
      return docTaskHistoryDAO;
    }
    else if (clazz == IDocMessageDAO.class)
    {
      return docMessageDAO;
    }
    else if (clazz == IRevisionDAO.class)
    {
      return docRevisionDAO;
    }
    return super.getService(clazz);
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    return  getService(clazz);
  }
}
