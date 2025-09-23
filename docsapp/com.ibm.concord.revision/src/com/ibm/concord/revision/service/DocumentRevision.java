/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.revision.service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.RevisionBean;
import com.ibm.concord.platform.dao.IRevisionDAO;
import com.ibm.concord.platform.draft.DraftAction;
import com.ibm.concord.platform.revision.IRevision;
import com.ibm.concord.platform.revision.IRevisionService;
import com.ibm.concord.platform.revision.RevisionContentDescriptor;
import com.ibm.concord.platform.revision.RevisionDescriptor;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.revision.exception.RevisionDataException;
import com.ibm.concord.revision.exception.RevisionStorageException;
import com.ibm.concord.revision.util.RevisionUtil;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.util.IStorageAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentRevision
{
  private static final Logger LOGGER = Logger.getLogger(DocumentRevision.class.getName());

  private IRevision currentRevision;

  private boolean bDirty = false; /* if there's any unpublished revision */

  private String docUri;

  private String repoId;

  private IRevisionDAO metadataAdapter;

  private DocumentRevisionStorageManager storageManager;

  // private DraftDescriptor draftDescriptor;
  private List<String> modifiers = new ArrayList<String>();

  private boolean bModifierInit = false;
  
  private boolean bInit = false;

  private boolean hasSession = false;

  public DocumentRevision(IDocumentEntry docEntry, UserBean user)
  {
    this(docEntry, user, null);
  }

  public DocumentRevision(IDocumentEntry docEntry, UserBean user, IRevisionService revisionService)
  {
    this.repoId = docEntry.getRepository();
    this.docUri = docEntry.getDocUri();
    // this.draftDescriptor = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(ConcordUtil.retrieveFileOwnerOrgId(docEntry),
    // docEntry.getDocUri());
    this.bDirty = false;
    RevisionComponent revisionComp = (RevisionComponent) Platform.getComponent(RevisionComponent.COMPONENT_ID);
    if (revisionService == null)
      revisionService = (IRevisionService) revisionComp.getService(IRevisionService.class);
    metadataAdapter = revisionService.getRevisionMetadataAdapter(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user));
    storageManager = new DocumentRevisionStorageManager(docEntry, user);
    //init();
  }

  public DocumentRevision(String customerId, String repoId, String docUri)
  {
    this(customerId, repoId, docUri, null);
  }

  public DocumentRevision(String customerId, String repoId, String docUri, IRevisionService revisionService)
  {
    this.repoId = repoId;
    this.docUri = docUri;
    // this.draftDescriptor = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(ConcordUtil.retrieveFileOwnerOrgId(docEntry),
    // docEntry.getDocUri());
    this.bDirty = false;
    RevisionComponent revisionComp = (RevisionComponent) Platform.getComponent(RevisionComponent.COMPONENT_ID);
    if (revisionService == null)
      revisionService = (IRevisionService) revisionComp.getService(IRevisionService.class);
    metadataAdapter = revisionService.getRevisionMetadataAdapter(customerId);
    storageManager = new DocumentRevisionStorageManager(customerId, repoId, docUri);
    //init();
  }

  private void init()
  {
    if (bInit)
      return;
    IRevision revision = metadataAdapter.getLastRevision(repoId, docUri);
    if (storageManager.hasLatestDelta())
      bDirty = true;
    else
      bDirty = false;
    if (revision == null)
    {
      LOGGER.fine("init: There's no revision for " + docUri + ", has unpublished message: " + bDirty);
    }
    else
    {
      currentRevision = revision;
      LOGGER.info("init: current revision for " + docUri + " is " + currentRevision.getRevisionNo() + ", has unpublished message: "
          + String.valueOf(bDirty));
    }
     
    bInit = true;
  }

  synchronized public IRevision getCurrentRevision()
  {
    if (!bInit)
      init();
    return currentRevision;
  }

  public boolean hasSession()
  {
    return hasSession;
  }  
  
  public List<IRevision> getRevisions(String customer, String repoId, String docUri, boolean includeMinor)
  {
    return metadataAdapter.getAllRevision(repoId, docUri, includeMinor);
  }

  synchronized public boolean handleAction(DraftDescriptor dd, DraftAction action, Object data)
  {
    LOGGER.entering(DocumentRevision.class.getName(), "handleAction", new Object[]{docUri, action});
    if (!bInit)
      init();
    
    boolean bSucc = false;
    try
    {
      switch (action)
        {
          case STARTEDIT :
          {
            IDocumentEntry docEntry = null;
            if ((data != null) && (data instanceof IDocumentEntry))
            {
              docEntry = (IDocumentEntry) data;
            }

            if ((this.currentRevision == null) || (!docEntry.getVersion().equals(currentRevision.getMajorRevisionNo() + "")))// for the
                                                                                                                             // legacy data
            {
              LOGGER.warning("No revision information when edit starts for " + docUri);
              if (docEntry != null)
              {
                createRevisionForLegacyData(docEntry, dd);
              }

            }
            if (bDirty)
            {
              LOGGER.warning("Some changes are not published for " + docUri + " when last session close, create a new revision.");
              createMinorRevision(dd, IRevision.REVISION_TYPE_ONLINE);
            }
            if (hasSession)
              LOGGER.warning("No close message recieved when last session close");
            hasSession = true;
            bSucc = true;
          }
            break;
          case CLOSE :
            if (bDirty)
            {
              createMinorRevision(dd, IRevision.REVISION_TYPE_ONLINE);
            }
            if (!hasSession)
              LOGGER.warning("No startedit message recieved when the session open");
            hasSession = false;
            bSucc = true;
            break;
          case RECEIVEMESSAGE :
            if (!hasSession)
              LOGGER.warning("No startedit message recieved when the session open");
            if (data != null && data instanceof UserBean)
            {
              this.addModifier((UserBean) data);
              bSucc = true;
            }
            break;
          case AUTOSAVE :
            if (!hasSession)
              LOGGER.warning("No startedit message recieved when the session open");
            if (data != null && data instanceof JSONArray)
            {
              LOGGER.fine("AppendDeltaMessages for " + docUri);
              storageManager.appendDeltaMessages((JSONArray) data);
              bDirty = true;
              bSucc = true;
            }
            else
              LOGGER.log(Level.WARNING, "Message list is needed for autosave");

            break;
          case PUBLISH :
            int version = 0;
            if (( data != null ) && (data instanceof IDocumentEntry))
            {
              IDocumentEntry docEntry = (IDocumentEntry) data;
              if (docEntry.getCreator()!=null)
                addModifier(docEntry.getCreator()[0]);
              if (docEntry.getModifier()!=null)
                addModifier(docEntry.getModifier()[0]);

              try
              {
                version = Integer.parseInt(docEntry.getVersion());
              }
              catch (NumberFormatException e)
              {
                
              }
            }  
            this.createMajorRevision(dd, IRevision.REVISION_TYPE_ONLINE, version);
            bSucc = true;
            break;
          case IMPORT :
            try
            {
              int importedVersion = 0;
              if ((data != null) && (data instanceof Map))
              {
                String baseVersion = ((Map<String, String>) data).get("version");
                if (((Map<String, String>) data).get("modifier") != null)
                  this.addModifier(((Map<String, String>) data).get("modifier"));
                importedVersion = (data == null) ? 0 : Integer.parseInt(baseVersion);
              }
              int currentMajorNo = this.currentRevision == null ? 0 : this.currentRevision.getMajorRevisionNo();
              if ((importedVersion == 0) && (this.currentRevision == null))
                this.createMajorRevision(dd, IRevision.REVISION_TYPE_NEW, importedVersion);
              else if (importedVersion == currentMajorNo){ 
                  if ((!currentRevision.isMajor() || !currentRevision.getType().equals(IRevision.REVISION_TYPE_RESTORE)))
                    // if current revision is a major restore revision, the import action is a duplicate request
                    this.createMinorRevision(dd, IRevision.REVISION_TYPE_RESTORE, importedVersion +"");
                  else
                  {
                    LOGGER.log(Level.FINE, "A duplicate IMPORT request sent for {0}@{1}, copy draft to media folder.", new Object[]{docUri, importedVersion});
                    this.copyRevisionData(dd, currentRevision.getMajorRevisionNo(), currentRevision.getMinorRevisionNo());
                  }
              }
              else if (importedVersion > currentMajorNo)
                this.createMajorRevision(dd, IRevision.REVISION_TYPE_UPLOAD, importedVersion);
              else
                LOGGER.log(Level.WARNING, "An old version {0}@{1} is imported, do nothing.", new Object[]{docUri, importedVersion});
              bSucc = true;
            }
            catch (NumberFormatException e)
            {
              LOGGER.log(Level.WARNING, "Document version is needed for import", e);
            }
            break;
          case DISCARD:
            if (bDirty)
            {
              createMinorRevision(dd, IRevision.REVISION_TYPE_ONLINE);
            }
            bSucc = true;
            break;
          case STORESECTION :
            if ((data != null) && (data instanceof IStorageAdapter))
            {
              
              bSucc = this.copySection(dd, (IStorageAdapter)data);              
            }
            break;
          case RESTORE :
            if (bDirty)
            {
              createMinorRevision(dd, IRevision.REVISION_TYPE_ONLINE);
            }
            if ((data != null) && (data instanceof Map))
            {
              int toVersion = Integer.parseInt((String)((Map)data).get("newVersion"));
              UserBean user = (UserBean)((Map)data).get("user");
              if (user != null)
                this.addModifier(user);
              createMajorRevision(null, IRevision.REVISION_TYPE_RESTORE, toVersion, (String)((Map)data).get("restoreVersion"));             
            }
            bSucc = true;
            break;
          case OFFLINE :
            // TODO
            bSucc = true;
            break;
          case SYNC :
            if (data != null)
              this.syncRevisions((IDocumentEntry[]) data);
            bSucc = true;
            break;
          case REVRESTORE:
            if ((data != null) && (data instanceof Map))
            {
              int currentMajorNo = this.currentRevision == null ? 0 : this.currentRevision.getMajorRevisionNo();
              String revNo = (String)((Map)data).get("restoreVersion");
              int[] revisionNo = RevisionUtil.getRevisionNo(revNo);    
              int major = revisionNo[0];
              int minor = revisionNo[1];
               
              if(major == currentMajorNo)
              {
                createMinorRevision(dd, IRevision.REVISION_TYPE_RESTORE, revNo);             
              }
              else
              {   
                LOGGER.warning("Restore from an older major revision is not support.");  
              }
            }
            else
            {
              LOGGER.warning("Parameters is missed when restore from revision.");
            }
            break;
          default:
            LOGGER.info("The action " + action + " is not supported");
        }
    }
    catch (RevisionStorageException e)
    {
      LOGGER.log(Level.WARNING, "Failed to handle action " + action, e);
    }
    catch (RevisionDataException e)
    {
      LOGGER.log(Level.WARNING, "Failed to handle action " + action, e);
    }
    catch (Exception e)
    {
      LOGGER.log(Level.WARNING, "Failed to handle action " + action, e);
    }
    LOGGER.exiting(DocumentRevision.class.getName(), "handleAction", bSucc);
    return bSucc;
  }

  private boolean copySection(DraftDescriptor dd, IStorageAdapter sectionFile) throws RevisionStorageException
  {
    String sectionPath = sectionFile.getPath();
    String draftRoot = dd.getURI();
    if (draftRoot.indexOf(storageManager.getRevisionRoot().getPath()) == 0)
    {
      // if the draft in revision folder, that means the STORESECTION event is fired by generateDraftForRevision
      return true;
    }
      
    if (sectionPath.indexOf(draftRoot) == 0) // just copy the attachment
    {
      String relativePath = sectionPath.substring(draftRoot.length());
      storageManager.copySection(sectionFile, relativePath);
    }
    else
    {
      LOGGER.log(Level.FINE, "Dont copy section " + sectionPath);
    }
    return true;
  }

  public List<String> getModifiers()
  {
    synchronized (modifiers)
    {
      if (bModifierInit == false)
      {
        try
        {
          modifiers = storageManager.getModifiers();
        }
        catch (RevisionStorageException e)
        {
          LOGGER.warning("Failed to read modifiers.json");
        }
      }
      
      return modifiers;
    }    
  }
  
//  public RevisionContentDescriptor getRevisionContentDescriptor(int majorNo, int minorNo) throws RevisionDataException, RevisionStorageException
//  {
//    IRevision revision = metadataAdapter.getRevision(repoId, docUri, RevisionUtil.getRevisionLabel(majorNo, minorNo));
//    if (revision == null)
//      throw new RevisionDataException(RevisionDataException.ERROR_REVISION_NOT_FOUND, "Cannot find revision " + docUri + "@" + RevisionUtil.getRevisionLabel(majorNo, minorNo) );
//    
//    RevisionDescriptor rd = storageManager.getRevisionDescriptor(majorNo, minorNo);
//    RevisionDescriptor baseRd = storageManager.getRevisionDescriptor(majorNo, 0);
//    
//    if (minorNo == 0)
//      return new RevisionContentDescriptor(rd, rd.getMediaURI(), 0, null);
//    else
//    {
//      String contentMediaFolder = storageManager.getContentMediaFolder(rd);
//      if (contentMediaFolder == null)// no media folder and no cache
//      {
//        LOGGER.log(Level.FINE, "getRevisionContentDescriptor: there is no cache for this revision: {0}", revision);
//        if (isNormalRevisionType(revision.getType()))
//        {
//          List<IRevision> minorRevisions = metadataAdapter.getAllMinorRevision(repoId, docUri, majorNo);        
//          // find base revision
//          // search the latest non-normal revision
//          for (IRevision minor : minorRevisions)
//          {
//            if (minor.getMinorRevisionNo() == minorNo)
//              break;
//            if (!isNormalRevisionType(minor.getType()))
//            {
//              RevisionDescriptor minorRd = storageManager.getRevisionDescriptor(minor.getMajorRevisionNo(), minor.getMinorRevisionNo());
//              baseRd = minorRd;
//            }
//          }
//          LOGGER.log(Level.FINE, "getRevisionContentDescriptor: the latest non-normal revision for {0} is {1}", new Object[]{ revision, baseRd.getMinorRevisionNo()});          
//          
//          // search in cache dir
//          RevisionDescriptor[] rds = storageManager.getRevisionsInCacheFolder(majorNo);
//          if (rds != null)
//          {
//            for (RevisionDescriptor cacheRd : rds)
//            {
//              int cacheMinorNo = cacheRd != null ? cacheRd.getMinorRevisionNo() : 0;
//              if (cacheMinorNo > minorNo )
//                continue;
//              if (baseRd.getMinorRevisionNo() < cacheMinorNo)
//              {
//                baseRd = cacheRd;
//              }
//            }
//            LOGGER.log(Level.FINE, "getRevisionContentDescriptor: the latest cached revision for {0} is {1}", new Object[]{ revision, baseRd.getMinorRevisionNo()});
//          }
//          
//          String baseMediaFolder = storageManager.getContentMediaFolder(baseRd);
//          
//          LOGGER.log(Level.FINE, "getRevisionContentDescriptor: the base content folder for {0} is {1}", new Object[]{ revision, baseMediaFolder});
//          
//          JSONArray delta = new JSONArray();
//          // return all the revisions between two revisions
//          for (IRevision minor : minorRevisions)          
//          {
//            if ((minor.getMinorRevisionNo() > baseRd.getMinorRevisionNo()) && (minor.getMinorRevisionNo() <= minorNo))
//            {
//              RevisionDescriptor minorRd = storageManager.getRevisionDescriptor(majorNo, minor.getMinorRevisionNo());
//              JSONObject obj = new JSONObject();
//              
//              obj.put("attachments", storageManager.getAttachmentFolders(minorRd));
//              obj.put("msg", storageManager.getMessages(minorRd));
//              delta.add(obj); 
//            }
//          }
//          
//          return new RevisionContentDescriptor(rd, baseMediaFolder, baseRd.getMinorRevisionNo(), delta);
//          
//        }
//        else
//        {
//          // for the other revision types, there should be media folder. 
//          // since there's no data for the revision, there must be some error
//          throw new RevisionDataException(RevisionDataException.ERROR_REVISION_NOT_FOUND, "Cannot find revision data " + docUri + "@" + RevisionUtil.getRevisionLabel(majorNo, minorNo) );
//          // TODO
//          // generate revision content descriptor for restored minor revision
//        }
//      }
//      else
//        return new RevisionContentDescriptor(rd, contentMediaFolder, minorNo, null);
//      
//    }
//  }
  
  
public RevisionContentDescriptor getRevisionContentDescriptor(int majorNo, int minorNo) throws RevisionDataException, RevisionStorageException
{
  IRevision revision = metadataAdapter.getRevision(repoId, docUri, RevisionUtil.getRevisionLabel(majorNo, minorNo));
  if (revision == null)
    throw new RevisionDataException(RevisionDataException.ERROR_REVISION_NOT_FOUND, "Cannot find revision " + docUri + "@" + RevisionUtil.getRevisionLabel(majorNo, minorNo) );
  
  RevisionDescriptor rd = storageManager.getRevisionDescriptor(majorNo, minorNo);
  RevisionDescriptor baseRd = storageManager.getRevisionDescriptor(majorNo, 0);
  
  if (minorNo == 0)
    return new RevisionContentDescriptor(rd, rd.getMediaURI(), 0, null);
  else
  {
    String contentMediaFolder = storageManager.getContentMediaFolder(rd);
    if (contentMediaFolder == null)// no media folder and no cache
    {
      LOGGER.log(Level.FINE, "getRevisionContentDescriptor: there is no cache for this revision: {0}", revision);
      List<IRevision> minorRevisions = metadataAdapter.getAllMinorRevision(repoId, docUri, majorNo);
      List<IRevision> contentRevChain = RevisionUtil.getContentMinorRevisionsChain(minorRevisions, minorNo);          
      
      // search in cache dir
      RevisionDescriptor[] rds = storageManager.getRevisionsInCacheFolder(majorNo);
      if (rds != null)
      {
        for (RevisionDescriptor cacheRd : rds)
        {
          int cacheMinorNo = cacheRd != null ? cacheRd.getMinorRevisionNo() : 0;
          if (cacheMinorNo > minorNo )
            continue;
          if (baseRd.getMinorRevisionNo() < cacheMinorNo && RevisionUtil.isRevisionInContentChain(contentRevChain, cacheMinorNo))
          {
            baseRd = cacheRd;
          }
        }
        LOGGER.log(Level.FINE, "getRevisionContentDescriptor: the latest cached revision for {0} is {1}", new Object[]{ revision, baseRd.getMinorRevisionNo()});
      }
      
      String baseMediaFolder = storageManager.getContentMediaFolder(baseRd);
      
      LOGGER.log(Level.FINE, "getRevisionContentDescriptor: the base content folder for {0} is {1}", new Object[]{ revision, baseMediaFolder});
      
      JSONArray delta = new JSONArray();
      // return all the revisions between two revisions
      for (IRevision minor : contentRevChain)
      {
        if( !IRevision.REVISION_TYPE_RESTORE.equalsIgnoreCase(minor.getType()) )
        {
          RevisionDescriptor minorRd = storageManager.getRevisionDescriptor(majorNo, minor.getMinorRevisionNo());
          JSONObject obj = new JSONObject();
          
          obj.put("attachments", storageManager.getAttachmentFolders(minorRd));
          obj.put("msg", storageManager.getMessages(minorRd));
          delta.add(obj); 
        }
      }
      
      return new RevisionContentDescriptor(rd, baseMediaFolder, baseRd.getMinorRevisionNo(), delta);       
    }
    else
      return new RevisionContentDescriptor(rd, contentMediaFolder, minorNo, null);
    
  }
}
  
  private void addModifier(UserBean user)
  {
    addModifier(user.getId());
  }
  
  private void addModifier(String userId)
  {
    synchronized (modifiers)
    {
      if (bModifierInit == false)
      {
        try
        {
          modifiers = storageManager.getModifiers();
        }
        catch (RevisionStorageException e)
        {
          LOGGER.warning("Failed to read modifiers.json");
        }
      }

      if (!modifiers.contains(userId))
      {
        modifiers.add(userId);
        try
        {
          LOGGER.fine("Add " + userId + " as a modifier of " + this.docUri);
          storageManager.addModifier(userId);
        }
        catch (RevisionStorageException e)
        {
          LOGGER.warning("Failed to add modifiers.json");
        }
      }
    }
  }
  
  private void addModifiers(List<?> modifiers)
  {
    for (Object modifier : modifiers)
      addModifier(modifier.toString());
  }

  private void clearModifier()
  {
    synchronized (modifiers)
    {
      modifiers.clear();
      try
      {
        storageManager.clearModifier();
      }
      catch (RevisionStorageException e)
      {
        LOGGER.warning("Failed to clear modifiers.json");
      }
    }
  }

  private IRevision createMajorRevision(DraftDescriptor dd, String type, int majorRevision)
      throws RevisionStorageException, RevisionDataException
  {
    return createMajorRevision(dd, type, majorRevision, null);
  }
  
  private synchronized IRevision createMajorRevision(DraftDescriptor dd, String type, int majorRevision, String reference)
      throws RevisionStorageException, RevisionDataException
  {
    if (type == null)
      type = IRevision.REVISION_TYPE_ONLINE;
    
    if (bDirty)
    {
      createMinorRevision(dd, IRevision.REVISION_TYPE_ONLINE);
    }

    LOGGER.log(Level.INFO, "Create major revision {0} for {1}", new Object[]{type, docUri});

    int currentMajorNo = (currentRevision == null) ? 0 : currentRevision.getMajorRevisionNo();

    int majorRevisionNo = majorRevision;
    if (majorRevisionNo <= currentMajorNo)
    {
      if (majorRevision < 1)
      {
        // need to generate majorRevisionNo automatically
        majorRevisionNo = currentMajorNo + 1;
      }
      else if (majorRevisionNo == currentMajorNo) 
      {
        if (!currentRevision.getType().equals(IRevision.REVISION_TYPE_RESTORE))
          LOGGER.info("The base content of " + docUri + "@" + currentMajorNo + " is overwritten.");
      }
      else
      {
        LOGGER.warning("The specified major revision number " + docUri + "@" + majorRevisionNo + " is incorrect. Current revision is "
            + currentMajorNo);
        return null;
      }
    }

    RevisionDescriptor rd = storageManager.getRevisionDescriptor(majorRevisionNo, 0);
    if (storageManager.createRevisionFolder(rd))
    {
      if ((dd != null) && (!type.equals(IRevision.REVISION_TYPE_LEGACY)))
        copyRevisionData(dd, majorRevision, 0);

      if (type.equals(IRevision.REVISION_TYPE_ONLINE)) // publish from Docs
      {
        List <IRevision> minorRevisions = metadataAdapter.getAllMinorRevision(repoId, docUri, currentMajorNo);
        if ((minorRevisions != null) && (!minorRevisions.isEmpty()))
        {
          for (IRevision minor : minorRevisions)
          {
            JSONArray modifiers = minor.getModifiers();
            addModifiers(modifiers);
          }
        }
      }
      
      IRevision revision = new RevisionBean(repoId, docUri, majorRevisionNo, 0, type, reference, AtomDate.valueOf(Calendar.getInstance())
          .getCalendar(), modifiers);
      LOGGER.log(Level.FINE, "Add metadata for revision " + revision);
      if (metadataAdapter.addRevision(revision))
      {
        currentRevision = revision;
        clearModifier();
        LOGGER.info("Create major revision " + revision + " successfully");
        return revision;
      }
      else
      {
        LOGGER.log(Level.WARNING, "Failed to add metadata for revision {0}.", new Object[] { revision});
        throw new RevisionDataException(RevisionDataException.ERROR_REVISION_FAILED_CREATE, "Failed to add metadata for revision " + revision.getRevisionNo());
      }

    }
    else
    {
      LOGGER.log(Level.WARNING, "Failed to create revision folder " + rd.getInternalURI());
      throw new RevisionStorageException("Failed to create revision folder " + rd.getInternalURI());
    }
  }

  private IRevision createMinorRevision(DraftDescriptor dd, String type) throws RevisionStorageException, RevisionDataException
  {
    return createMinorRevision(dd, type, null);
  }

  synchronized private IRevision createMinorRevision(DraftDescriptor dd, String type, String reference)
      throws RevisionStorageException, RevisionDataException
  {
    LOGGER.log(Level.INFO, "Create minor revision {0} for {1}", new Object[]{type, docUri});
    if ((!bDirty) && (isNormalRevisionType(type)))
    {
      LOGGER.info("No revision is created since there's no change ");
      return null;
    }

    int minorRevision = 1;
    int majorRevision = 1;
    if (currentRevision != null)
    {
      minorRevision = currentRevision.getMinorRevisionNo() + 1;
      majorRevision = currentRevision.getMajorRevisionNo();
    }

    RevisionDescriptor rd = storageManager.getRevisionDescriptor(majorRevision, minorRevision);
    if (!storageManager.createRevisionFolder(rd))
    {
      LOGGER.log(Level.WARNING, "Failed to create revision folder {0}. ", new Object[] { rd.getInternalURI() });
      throw new RevisionStorageException("Failed to create revision folder " + rd.getInternalURI());
    }

    if (isNormalRevisionType(type))
    {
      storageManager.moveLatestToRevisionFolder(rd);
    }
    else if(type.equals(IRevision.REVISION_TYPE_RESTORE))
    {
      int[] revisionNo = RevisionUtil.getRevisionNo(reference);    
      int major = revisionNo[0];
      if(majorRevision == major)
      {
        ;// do nothing
      }
      else
      {
        copyRevisionData(dd, majorRevision, minorRevision);
      }
    }
    else
    {
      copyRevisionData(dd, majorRevision, minorRevision);
    }

    IRevision revision = new RevisionBean(repoId, docUri, majorRevision, minorRevision, type, reference, AtomDate.valueOf(
        Calendar.getInstance()).getCalendar(), modifiers);
    LOGGER.log(Level.FINE, "Add metadata for revision {0}. ", new Object[]{revision});
    if (metadataAdapter.addRevision(revision))
    {
      currentRevision = revision;
      LOGGER.log(Level.FINE, "Add metadata for revision {0} successfully. ", new Object[]{revision});
      bDirty = false;
      clearModifier();
      LOGGER.info("Create minor revision " + revision + " successfully ");
      return revision;
    }
    else
    {
      LOGGER.log(Level.WARNING, "Failed to add metadata for revision {0}. ", new Object[]{revision});
      throw new RevisionDataException(RevisionDataException.ERROR_REVISION_FAILED_CREATE, "Failed to add metadata for revision " + revision);
    }
  }
  
  private void copyRevisionData(DraftDescriptor dd, int majorNo, int minorNo) throws RevisionStorageException
  {
    RevisionDescriptor rd = storageManager.getRevisionDescriptor(majorNo, minorNo);
    storageManager.copyDraftToRevisionFolder(dd.getURI(), rd);
  }

  
  private IRevision createRevisionForLegacyData(IDocumentEntry docEntry, DraftDescriptor dd) throws RevisionStorageException, RevisionDataException
  {    
    LOGGER.log(Level.FINE, "Create revision for legacy data " + docEntry.getDocId());
    int majorNo = 1;
    try
    {
      majorNo = Integer.parseInt(docEntry.getVersion());
    }
    catch (NumberFormatException e)
    {
      LOGGER.log(Level.WARNING, "Failed to parse version number of the document {0}.", new Object[] { docEntry.getVersion()});
    }
    
    if ((currentRevision != null) && (currentRevision.getMajorRevisionNo() >= majorNo))
    {
      LOGGER.warning("There's revision data for the draft, and the majro No is " + currentRevision.getMajorRevisionNo());
      return null;
    }

    RevisionDescriptor rd = storageManager.getRevisionDescriptor(majorNo, 0);
    IRevision revision = null;
    List<String> modifier = new ArrayList<String>();
    if (docEntry.getCreator()!=null)
      modifier.add(docEntry.getCreator()[0]);
    if (storageManager.createRevisionFolder(rd))
    {
      revision = new RevisionBean(repoId, docUri, majorNo, 0, IRevision.REVISION_TYPE_UPLOAD, null, docEntry.getModified(), modifier);
      LOGGER.log(Level.FINE, "Add major metadata for legacy revision " + revision);
      if (metadataAdapter.addRevision(revision))
      {
        currentRevision = revision;
        LOGGER.info("Create major revision for " + docUri + " successfully, revision number is " + revision.getRevisionNo());
      }
      else
      {
        LOGGER.log(Level.WARNING, "Failed to add metadata for revision {0}.", new Object[] { revision});
        throw new RevisionDataException(RevisionDataException.ERROR_REVISION_FAILED_CREATE, "Failed to add metadata for revision " + revision.getRevisionNo());
      }
  
      if (docEntry.getModifier()!=null)
        addModifier(docEntry.getModifier()[0]);
      
      revision = createMinorRevision(dd, IRevision.REVISION_TYPE_LEGACY);
    }
    return revision;
  }
  
  private synchronized void syncRevisions(final IDocumentEntry[] entries)
  {
    LOGGER.info("Synchronize versions for " + docUri);
    for (IDocumentEntry docEntry : entries)
    {
      String version = docEntry.getVersion();
      int majorNo = Integer.parseInt(version);
      IRevision revision = metadataAdapter.getRevision(repoId, docUri, RevisionUtil.getRevisionLabel(majorNo, 0));
      if (revision == null)
      {
        List<String> author = new ArrayList<String>();
        for (String modifier : docEntry.getModifier())
          author.add(modifier);
        revision = new RevisionBean(repoId, docUri, majorNo, 0, IRevision.REVISION_TYPE_UPLOAD, null,
            docEntry.getModified(), author);
        metadataAdapter.addRevision(revision);
      }
    }

  }

  private static boolean isNormalRevisionType(String type)
  {
    if (type.equals(IRevision.REVISION_TYPE_ONLINE))
      return true;
    else
      return false;
  }
}
