package com.ibm.concord.platform.dao;

import com.ibm.concord.platform.bean.UserDocCacheBean;

public interface IUserDocCacheDAO
{
  /**
   * 
   * @param bean
   * @return
   */
  public boolean add(UserDocCacheBean bean);
  
  /**
   * 
   * @param bean
   * @return
   */
  public boolean update(UserDocCacheBean bean);
  
  /**
   * 
   * @param userId
   * @return
   */
  public boolean deleteUserCache(String userId);
  
  /**
   * 
   * @param docId
   * @return
   */
  public boolean deleteDocCache(String docId);
  
  /**
   * 
   * @param user_id
   * @param doc_id
   * @param cache_key
   * @return
   */
  public UserDocCacheBean getCacheValue(String user_id, String doc_id, String cache_key);
  
}
