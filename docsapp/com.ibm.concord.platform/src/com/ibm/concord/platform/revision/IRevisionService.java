/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.revision;

import java.util.List;

import com.ibm.concord.platform.dao.IRevisionDAO;
import com.ibm.concord.platform.listener.IDraftListener;
import com.ibm.concord.platform.listener.ISessionListener;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;

public interface IRevisionService
{  
  public String getRevisionHome();

  public IRevisionStorageAdapterFactory getRevisionStorageAdapterFactory();
  
  public IRevisionDAO getRevisionMetadataAdapter(String customerId);
  
  public ISessionListener getSessionListener();

  public IDraftListener getDraftListener();
  
  public List<IRevision> getRevisions(String customer, String repoId, String docUri, boolean includeMinor);
  
  public List<IRevision> getRevisions(String customer, String repoId, String docUri, boolean includeMinor, List<IDocumentEntry> versions);

  public List<String> getCurrentModifiers(UserBean user, IDocumentEntry docEntry);
  
  public RevisionContentDescriptor getRevisionContentDescriptor(UserBean user, IDocumentEntry docEntry, int majorNo, int minorNo) throws Exception;
  
  public boolean updateRevisionDataAccessed(UserBean user, IDocumentEntry docEntry, int majorNo, int minorNo);
  
  public boolean restoreRevision(UserBean user, IDocumentEntry docEntry, int majorNo, int minorNo) throws Exception;
}
