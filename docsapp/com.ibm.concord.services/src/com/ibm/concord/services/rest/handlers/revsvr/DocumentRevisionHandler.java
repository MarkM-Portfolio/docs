/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.revsvr;

import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.revision.IRevision;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.revision.service.RevisionService;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentRevisionHandler implements GetHandler
{
  public static final Logger LOGGER = Logger.getLogger(DocumentRevisionHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }

    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOGGER.log(Level.WARNING, "Could not find the entry of document {0} while getting revisions.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in getting revisions.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e2)
    {
      LOGGER.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in getting revisions.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    String sIncludeMinor = request.getParameter("includeMinors");
    boolean bIncludeMinor = sIncludeMinor == null ? true : Boolean.parseBoolean(sIncludeMinor);

    String sCount = request.getParameter("count");
    int count = sCount == null ? 0 : Integer.parseInt(sCount);

    IComponent repoComp = Platform.getComponent(RepositoryComponent.COMPONENT_ID);
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) repoComp.getService(RepositoryProviderRegistry.class);
    IRepositoryAdapter repositoryAdapter = service.getRepository(repoId);

    IDocumentEntry[] versions = repositoryAdapter.getVersions(user, docEntry);
    List<IDocumentEntry> versionList = null;
    if (versions != null)
    {
      versionList = Arrays.asList(versions);
      Collections.sort(versionList, new Comparator<IDocumentEntry>()
      {

        public int compare(IDocumentEntry entry1, IDocumentEntry entry2)
        {
          int version1 = Integer.parseInt(entry1.getVersion());
          int version2 = Integer.parseInt(entry2.getVersion());
          return version1 - version2;
        }

      });
    }

    List<IRevision> revisions = RevisionService.getInstance().getRevisions(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user), repoId, uri,
        bIncludeMinor, versionList);

    JSONArray jRevisionArray = new JSONArray();
    int total = revisions.size();
    if ((count == 0) || (count > revisions.size()))
      count = total;

    for (int i = 1; i <= count; i++)
    {
      IRevision revision = revisions.get(total - i);
      jRevisionArray.add(revision.toJson());
    }

    JSONObject jsonObj = new JSONObject();
    jsonObj.put("revCount", count);
    jsonObj.put("revisionList", jRevisionArray);

    DocumentSession docSess = SessionManager.getInstance().getSession(repoId, docEntry.getDocUri());
    DraftDescriptor dd = null;
    if (docSess != null) // if the document is being edited, return current modifiers
    {
      // dd = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(ConcordUtil.retrieveFileOwnerOrgId(docEntry),
      // docEntry.getRepository(), docEntry.getDocUri());
      //
      // JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(dd);
      // AtomDate modified = null;
      // if (draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey()) != null)
      // {
      // modified = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey()));
      // }

      jsonObj.put("currentTime", AtomDate.valueOf(Calendar.getInstance()).getValue());

      List<String> latestModifier = RevisionService.getInstance().getCurrentModifiers(user, docEntry);
      JSONArray jModifiers = new JSONArray();
      jModifiers.addAll(latestModifier);
      jsonObj.put("currentModifiers", jModifiers);
    }

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);

    jsonObj.serialize(response.getWriter(), true);

  }

}
