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

import java.util.ArrayList;

import com.ibm.concord.platform.bean.DocHistoryBean;

public interface IDocHistoryDAO
{
  static final int INITIAL_STATUS = 1;

  static final int CLEANED_CACHE_STATUS = 2;

  public boolean add(DocHistoryBean dhb);

  public boolean delete(String repoId, String docUri);

  public boolean delete(String repoId, String docId, boolean isDocUri);

  public boolean delete(String repoId, String libraryId, String versionSeriesId);

  public DocHistoryBean get(String repoId, String docUri);

  public DocHistoryBean get(String repoId, String docId, boolean isDocUri);

  public ArrayList<DocHistoryBean> get(String repoId, String libraryId, String versionSeriesId);

  public boolean update(DocHistoryBean dhb);

  public boolean updateAutoPublish(DocHistoryBean dhb);

  public boolean updateAutoPublishAt(DocHistoryBean dhb);

  public boolean updateDraftLastVisit(DocHistoryBean dhb);

  public boolean updateSnapshotLastVisit(DocHistoryBean dhb);

  public boolean update4Upload(DocHistoryBean dhb);

  public boolean updateWithCacheStatus(DocHistoryBean dhb);
}
