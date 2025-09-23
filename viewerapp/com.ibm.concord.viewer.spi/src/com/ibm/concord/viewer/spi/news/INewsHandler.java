package com.ibm.concord.viewer.spi.news;

import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;

public interface INewsHandler
{
  public enum EventType {
    IGNORE,PURGE_ALL, PURGE_VERSION, GENERATE_THUMBNAIL, UPLOAD_FILE, UPLOAD_DRAFT, UPDATE_DRAFT, CREATE_DRAFT, PUBLISH_DRAFT, RESTORE_ALL, PURGE_SANITY;
  }

  public IDocumentEntry getDocumentEntry() throws RepositoryAccessException;

  public void processNewsEvent() throws RepositoryAccessException;;
}
