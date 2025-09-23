/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job.context;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.job.JobContext;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class ImportDraftFromRepositoryContext extends JobContext
{
  private static final Logger LOGGER = Logger.getLogger(ImportDraftFromRepositoryContext.class.getName());

  public String mediaURI;

  public String sourceMime;

  public String targetMime;

  public long modified;

  public UserBean requester;

  public IDocumentEntry docEntry;

  public DraftDescriptor draftDescriptor;

  public String password;

  public boolean forceSave;

  public boolean upgradeConvert;

  public boolean getSnapshot;
  
  public boolean overwrite;

  public ImportDraftFromRepositoryContext()
  {
    ;
  }

  protected String getJobIdString()
  {
    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
        .getService(IDocumentServiceProvider.class);
    String draftVersion = (String) docServiceProvider.getDocumentService(sourceMime).getConfig().get("draftFormatVersion");
    
    if(docEntry != null && docEntry.getVersionSeriesId() != null && docEntry.getVersionSeriesUri() != null)
    {// use media size as modified for document has series ID as the document ID/Modfied changes when check out	
      modified = docEntry.getMediaSize();
      mediaURI = docEntry.getVersionSeriesUri();
    }    

    return mediaURI + modified + sourceMime + targetMime + getSnapshot + draftVersion
        + ImportDraftFromRepositoryContext.class.getSimpleName();
  }

  public static boolean equals(String md5, IDocumentEntry docEntry, DraftDescriptor draftDesc, UserBean caller)
      throws DraftDataAccessException
  {
    /*
     * there is no md5, so skip the md5 check by simply return true.
     */
    if ("null".equals(md5) || md5 == null)
    {
      LOGGER.log(Level.INFO, "Conflict Check Ignored. MD5: {0} | User: {1}",
          new Object[] { md5 == null ? "Not Found" : md5, caller.getId() });
      return true;
    }

    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
        .getService(IDocumentServiceProvider.class);

    String md5_0 = md5;

    String md5_2 = null;
    ImportDraftFromRepositoryContext jc1 = new ImportDraftFromRepositoryContext();
    jc1.mediaURI = docEntry.getDocUri();
    jc1.modified = docEntry.getModified().getTimeInMillis();
    jc1.sourceMime = docEntry.getMimeType();
    jc1.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
    jc1.docEntry = docEntry;
    md5_2 = jc1.getJobId();

    if (!md5_0.equals(md5_2))
    {
      LOGGER.log(Level.WARNING, "Conflict Check Failed. MD5: {0} Repository: {1} | User: {2}",
          new Object[] { md5_0, md5_2, caller.getId() });
      return false;
    }

    JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDesc);

    String md5_1 = null;
    ImportDraftFromRepositoryContext jc2 = new ImportDraftFromRepositoryContext();
    String docUri = (String) draftMeta.get(DraftMetaEnum.DOC_ID.getMetaKey());
    long modified = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.LAST_MODIFIED.getMetaKey())).getCalendar().getTimeInMillis();
    String mime = (String) draftMeta.get(DraftMetaEnum.MIME.getMetaKey());
    jc2.mediaURI = docUri;
    jc2.modified = modified;
    jc2.sourceMime = mime;
    jc2.targetMime = docServiceProvider.getDocumentType(mime);
    jc2.docEntry = docEntry;
    md5_1 = jc2.getJobId();

    boolean check1 = md5_0.equals(md5_2);
    boolean check2 = md5_2.equals(md5_1);
    boolean check3 = md5_0.equals(md5_1);
    if (check1 && check2 && check3)
    {
      LOGGER.log(Level.INFO, "Conflict Check Passed. MD5: {0} Draft: {1} Repository: {2} | User: {3}", new Object[] { md5_0, md5_1, md5_2,
          caller.getId() });
      return true;
    }
    else
    {
      LOGGER.log(Level.WARNING, "Conflict Check Failed. MD5: {0} Draft: {1} Repository: {2} | User: {3}", new Object[] { md5_0, md5_1,
          md5_2, caller.getId() });
      return false;
    }
  }
}
