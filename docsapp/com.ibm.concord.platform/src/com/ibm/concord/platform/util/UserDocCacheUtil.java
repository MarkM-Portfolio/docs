package com.ibm.concord.platform.util;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.UserDocCacheBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IUserDocCacheDAO;

public class UserDocCacheUtil
{
  public static String getCache(String userId, String docId, String cacheKey)
  {
    IUserDocCacheDAO dao = (IUserDocCacheDAO)Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IUserDocCacheDAO.class);
    UserDocCacheBean bean = dao.getCacheValue(userId, docId, cacheKey);
    
    return bean == null ? "" : bean.getCacheValue();
  }
}
