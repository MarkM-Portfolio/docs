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
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.RevisionBean;
import com.ibm.concord.platform.dao.IRevisionDAO;
import com.ibm.concord.platform.draft.DraftAction;
import com.ibm.concord.platform.draft.DraftActionEvent;
import com.ibm.concord.platform.listener.IDraftListener;
import com.ibm.concord.platform.listener.ISessionListener;
import com.ibm.concord.platform.revision.IRevision;
import com.ibm.concord.platform.revision.IRevisionMetaAdapterFactory;
import com.ibm.concord.platform.revision.IRevisionService;
import com.ibm.concord.platform.revision.IRevisionStorageAdapterFactory;
import com.ibm.concord.platform.revision.RevisionContentDescriptor;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.revision.exception.RevisionStorageException;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.directory.beans.UserBean;

public class RevisionService implements IRevisionService
{

  private static final Logger LOGGER = Logger.getLogger(RevisionService.class.getName());

  private IRevisionStorageAdapterFactory storageAdapterFactory;

  private IRevisionMetaAdapterFactory metadataAdapterFactory;

  private String revisionHome;

  private HashMap<String, DocumentRevision> revisions = new HashMap<String, DocumentRevision>();

  private ISessionListener sessionListener;

  private IDraftListener draftListener;

  private RevisionComponent component;

  private boolean bEnabled = false;

  final protected static IRevisionService service = new RevisionService();

  protected RevisionService()
  {
    component = (RevisionComponent) Platform.getComponent(RevisionComponent.COMPONENT_ID);
    if (component != null)
    {
      bEnabled = component.isEanbled();
      storageAdapterFactory = component.getStorageAdapterFactory();
      metadataAdapterFactory = component.getMetadataAdapter();
      revisionHome = component.getRevisionHome();
      if (bEnabled)
      {
        sessionListener = new RevisionSessionListener(this);
        draftListener = new RevisionDraftListener(this);
      }
    }
  }

  public static IRevisionService getInstance()
  {
    return (service == null) ? new RevisionService() : service;
  }

  @Override
  public String getRevisionHome()
  {
    return revisionHome;
  }

  @Override
  public IRevisionStorageAdapterFactory getRevisionStorageAdapterFactory()
  {
    return storageAdapterFactory;
  }

  @Override
  public IRevisionDAO getRevisionMetadataAdapter(String customerId)
  {
    return metadataAdapterFactory.getRevisionMetadataAdapter(customerId);
  }

  private DocumentRevision getRevisionManager(String customerId, String repoId, String docUri)
  {
    DocumentRevision revision = getRevisionManagerFromCache(repoId, docUri);
    if (revision == null)
    {
      synchronized (revisions)
      {
        revision = getRevisionManagerFromCache(repoId, docUri);
        if (revision == null)
        {
          revision = new DocumentRevision(customerId, repoId, docUri);
          revisions.put(getKey(repoId, docUri), revision);
        }
      }
    }
    return revision;
  }

  private DocumentRevision getRevisionManagerFromCache(String repoId, String docUri)
  {
    String key = getKey(repoId, docUri);
    synchronized (revisions)
    {
      DocumentRevision revision = revisions.get(key);
      return revision;
    }
  }

  private void removeDocumentRevision(String repoId, String docUri)
  {
    removeDocumentRevision(getKey(repoId, docUri));
  }

  private void removeDocumentRevision(String key)
  {
    synchronized (revisions)
    {
      revisions.remove(key);
    }
  }

  private String getKey(String repoId, String docUri)
  {
    return repoId + "/" + docUri;
  }

  @Override
  public IDraftListener getDraftListener()
  {
    return this.draftListener;
  }

  @Override
  public ISessionListener getSessionListener()
  {
    return this.sessionListener;
  }

  public boolean handleAction(DraftDescriptor dd, DraftAction action, Object data)
  {
    DocumentRevision manager = this.getRevisionManager(dd.getCustomId(), dd.getRepository(), dd.getDocId());
    boolean bSucc = manager.handleAction(dd, action, data);
    if (!manager.hasSession())
      this.removeDocumentRevision(dd.getRepository(), dd.getDocId());
    else
      // make sure the manager is not removed from cache
      this.getRevisionManager(dd.getCustomId(), dd.getRepository(), dd.getDocId());
    return bSucc;
  }

  public List<IRevision> getRevisions(String customer, String repoId, String docUri, boolean includeMinor)
  {
    return getRevisions(customer, repoId, docUri, includeMinor, null);
  }

  public List<IRevision> getRevisions(String customer, String repoId, String docUri, boolean includeMinor, List<IDocumentEntry> versions)
  {
    IRevisionDAO metaAdapter = getRevisionMetadataAdapter(customer);
    List<IRevision> revisions = null;
    revisions = metaAdapter.getAllRevision(repoId, docUri, includeMinor);

    if (revisions == null)
      revisions = new ArrayList<IRevision>();

    if (versions != null) // sync versions
    {
      int index = 0;
      for (IDocumentEntry docEntry : versions)
      {
        int version = docEntry.getVersion() == null ? 1 : Integer.parseInt(docEntry.getVersion());
        int total = revisions.size();
        boolean bFound = false;
        for (; index < total; index++)
        {
          IRevision revision = revisions.get(index);
          if (version == revision.getMajorRevisionNo())
          {
            bFound = true;
            break;
          }
          else if (version < revision.getMajorRevisionNo())
            break;
        }

        if (!bFound) // this version doesn't exist in the revision list, insert the fake revision
        {
          List<String> author = new ArrayList<String>();
          if (docEntry.getCreator() != null)
            author.add(docEntry.getCreator()[0]);
          if (docEntry.getModifier() != null)
          {
            if (!author.contains(docEntry.getModifier()[0]))
              author.add(docEntry.getModifier()[0]);
          }
          IRevision revision = new RevisionBean(repoId, docUri, version, 0, IRevision.REVISION_TYPE_UPLOAD, null, docEntry.getModified(),
              author);
          revisions.add(index, revision);
        }
        index++;
      }
    }

    return revisions;
  }

  public List<String> getCurrentModifiers(UserBean user, IDocumentEntry docEntry)
  {
    DocumentRevision manager = this.getRevisionManager(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user), docEntry.getRepository(),
        docEntry.getDocId());
    List<String> modifiers = manager.getModifiers();
    if (!manager.hasSession())
      this.removeDocumentRevision(docEntry.getRepository(), docEntry.getDocId());
    return modifiers;
  }

  public RevisionContentDescriptor getRevisionContentDescriptor(UserBean user, IDocumentEntry docEntry, int majorNo, int minorNo)
      throws Exception
  {
    DocumentRevision manager = this.getRevisionManager(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user), docEntry.getRepository(),
        docEntry.getDocId());
    RevisionContentDescriptor content = manager.getRevisionContentDescriptor(majorNo, minorNo);
    if (!manager.hasSession())
      this.removeDocumentRevision(docEntry.getRepository(), docEntry.getDocId());
    return content;
  }

  public boolean updateRevisionDataAccessed(UserBean user, IDocumentEntry docEntry, int majorNo, int minorNo)
  {
    DocumentRevisionStorageManager storageManager = new DocumentRevisionStorageManager(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user),
        docEntry.getRepository(), docEntry.getDocId());
    try
    {
      storageManager.updateLastAccess(majorNo, minorNo);
      return true;
    }
    catch (RevisionStorageException e)
    {
      LOGGER.log(Level.WARNING, "Failed to update lastVisit.txt for {0}@{1}.{2}", new Object[] { docEntry.getDocId(), majorNo, minorNo });
      return false;
    }
  }

  public boolean restoreRevision(UserBean user, IDocumentEntry docEntry, int major, int minor) throws Exception
  {
    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
        .getService(IDocumentServiceProvider.class);
    IDocumentService docService = docServiceProvider.getDocumentService(docEntry.getMimeType());
        
    DraftDescriptor draft = docService.generateDraftForRevision(user, docEntry, major, minor);

    return draft != null;
  }

  // ///////////////////// Listeners ///////////////////////////////
  class RevisionSessionListener implements ISessionListener
  {

    private RevisionService service;

    public RevisionSessionListener(RevisionService revisionService)
    {
      this.service = revisionService;
    }

    @Override
    public void sessionOpened(IDocumentEntry docEntry, DraftDescriptor dd)
    {
      this.service.handleAction(dd, DraftAction.STARTEDIT, docEntry);
    }

    @Override
    public void sessionClosed(IDocumentEntry docEntry, DraftDescriptor dd, UserBean user, boolean inWork, boolean discard)
    {
      service.handleAction(dd, DraftAction.CLOSE, null);
    }

    @Override
    public void messageReceived(DraftDescriptor dd, UserBean user)
    {
      service.handleAction(dd, DraftAction.RECEIVEMESSAGE, user);
    }

    @Override
    public void userJoined(IDocumentEntry docEntry, UserBean user)
    {
      // do nothing

    }

    @Override
    public void userLeave(IDocumentEntry docEntry, UserBean user)
    {
      // do nothing

    }

  }

  class RevisionDraftListener implements IDraftListener
  {
    private RevisionService service;

    public RevisionDraftListener(RevisionService revisionService)
    {
      this.service = revisionService;
    }

    @Override
    public void actionDone(DraftActionEvent event)
    {
      DraftDescriptor dd = event.getDraftDescriptor();
      if (dd == null)
      {
        LOGGER.warning("actionDone: no draft descriptor provided for action " + event.getAction());
      }
      else
      {
        service.handleAction(event.getDraftDescriptor(), event.getAction(), event.getData());
      }
    }
  }

}
