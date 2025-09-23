/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr;

import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.section.DraftSection;
import com.ibm.concord.draft.section.SectionDescriptor;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public class UpdateStringPoolHandler implements GetHandler, PostHandler, PutHandler
{
  private static final Logger LOG = Logger.getLogger(UpdateStringPoolHandler.class.getName());

  private static final String EDIT_REGEX = "(https?)://([^/]+)/[^/]+/app/(doc)/([^/]+)/([^/]+)/([^/]+)/(.+)";

  private static final Pattern EDIT_PATTERN = Pattern.compile(EDIT_REGEX);

  private static final String SP_FILE_NAME = "stringPool";

  private static final Pattern SP_ListTextStyle_Patt = Pattern.compile("\\|!\\|text:style-name::[^\\|!\\|]*");

  private static final Pattern SP_ListFontName_patt = Pattern.compile("\\|-\\|style:font-name::[^\\|!\\|]*");

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    // get document bean
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while getting attachments.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in getting attachments.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in getting attachments.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.log(Level.WARNING, "{0} did not have edit permission on document {1} while getting attachments.", new Object[] { user.getId(),
          uri });
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    JSONObject json = new JSONObject();
    // json.put("attachments", AttachmentsUtil.getDraftAttachmentList(user,docEntry));
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    json.serialize(response.getWriter(), true);
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while posting attachments.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in posting attachments.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in posting attachments.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.log(Level.WARNING, "{0} did not have edit permission on document {1} while posting attachments.", new Object[] { user.getId(),
          uri });
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    copyStringPool(request, response, user, docEntry);
    return;
    // String method = request.getParameter("method");
    // LOG.log(Level.WARNING, "Did not support this method {0}.", method);
    // response.sendError(HttpServletResponse.SC_BAD_REQUEST);
  }

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doPost(request, response);
  }

  private void copyStringPool(HttpServletRequest request, HttpServletResponse response, UserBean caller, IDocumentEntry toDoc)
      throws Exception
  {
    JSONObject json = JSONObject.parse(request.getReader());
    String mediaUri = (String) json.get("s_href");
    Matcher matcher = EDIT_PATTERN.matcher(mediaUri);
    Matcher result = matcher.matches() ? matcher : null;
    if (result == null)
    {
      LOG.log(Level.WARNING, "Invalid media uri {0}.", mediaUri);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    String keyString = (String) json.get("content");

    String srcRepoId = result.group(4);
    String srcUri = result.group(5);

    // check authorization of source document
    IDocumentEntry fromDoc = null;
    try
    {
      fromDoc = DocumentEntryUtil.getEntry(caller, srcRepoId, srcUri, true);
      if (fromDoc == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while copying attachment.", srcUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + srcUri + " in copying attachment.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + srcUri + " in copying attachment.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.EDIT.hasPermission(fromDoc.getPermission()))
    {
      LOG.log(Level.WARNING, "{0} did not have edit permission on document {1} while copying attachment.", new Object[] { caller.getId(),
          srcUri });
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    String newUri = SP_FILE_NAME;
    boolean copyData = true;
    if (!toDoc.getDocUri().equalsIgnoreCase(fromDoc.getDocUri()) && keyString != null && keyString.length() > 0)
    {
      String[] keysArr = keyString.split(";");
      String[][] keys = new String[keysArr.length][2];
      for (int i = 0; i < keysArr.length; i++)
      {
        keys[i] = keysArr[i].split(":");
      }

      copyData = copyDraftStringPool(caller, toDoc, fromDoc, newUri, keys);
      if (!copyData)
      {
        LOG.log(Level.WARNING, "Failed to copy stringPool data from doc {0} to doc {1}.",
            new Object[] { fromDoc.getDocUri(), toDoc.getDocUri() });
        response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        return;
      }
    }

    response.setStatus(HttpServletResponse.SC_OK);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    json.serialize(response.getWriter(), true);
  }

  private boolean copyDraftStringPool(UserBean caller, IDocumentEntry toDoc, IDocumentEntry fromDoc, String path, String[][] keys)
  {

    DraftDescriptor fromDocDesc = DocumentServiceUtil.getDraftDescriptor(caller, fromDoc);
    MediaDescriptor fromDocMD;
    try
    {
      fromDocMD = DocumentServiceUtil.getSubFile(fromDocDesc, path, true);

      InputStream fromIS = fromDocMD.getStream();
      if (fromIS == null)
        return false;

      JSONObject fromJSON = JSONObject.parse(fromIS);
      fromDocMD.dispose();

      DraftDescriptor toDocDesc = DocumentServiceUtil.getDraftDescriptor(caller, toDoc);
      MediaDescriptor toDocMD = null;
      JSONObject toJSON = new JSONObject();
      try
      {
        toDocMD = DocumentServiceUtil.getSubFile(toDocDesc, path, true);
        InputStream toIS = toDocMD.getStream();
        if (toIS != null)
          toJSON = JSONObject.parse(toIS);
        toDocMD.dispose();
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, e.getMessage(), e);
      }

      int count = 0;
      for (int i = 0; i < keys.length; i++)
      {
        String oldKey = keys[i][0];
        String newKey = keys[i][1];
        if (fromJSON.containsKey("LST_" + oldKey))
        {
          String key = "LST_" + oldKey;
          String value = (String) fromJSON.get("LST_" + oldKey);

          Matcher matcher = SP_ListTextStyle_Patt.matcher(value);
          while (matcher.find())
          {
            String t1 = matcher.group();
            String SST_Name = t1.substring(20);
            String SST_key = "SST_" + SST_Name;

            if (fromJSON.containsKey(SST_key))
              toJSON.put(SST_key, fromJSON.get(SST_key));
          }

          matcher = SP_ListFontName_patt.matcher(value);
          while (matcher.find())
          {
            String t2 = matcher.group();
            String SFF_Name = t2.substring(20);
            String SFF_key = "SFF_" + SFF_Name;

            if (fromJSON.containsKey(SFF_key))
              toJSON.put(SFF_key, fromJSON.get(SFF_key));
          }

          if (!oldKey.equals(newKey))
          {
            key = "LST_" + newKey;
            value = value.replace("|!|LEVEL::0|-|style:name::" + oldKey + "|!|", "|!|LEVEL::0|-|style:name::" + newKey + "|!|");
          }
          toJSON.put(key, value);
          count++;
        }
      }

      if (count > 0)
      {
        SectionDescriptor sectionDesp = new SectionDescriptor(toDocDesc, new DraftSection(path));
        DraftStorageManager.getDraftStorageManager().storeSectionAsJSONObject(sectionDesp, toJSON);
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "IOException during copy from document " + fromDoc.getDocUri() + " to document " + toDoc.getDocUri() + "", e);
      return false;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception during copy from document " + fromDoc.getDocUri() + " to document " + toDoc.getDocUri() + "", e);
      return false;
    }

    return true;
  }

  public static void main(String[] args) throws Exception
  {
    Pattern patt1 = Pattern.compile("\\|!\\|text:style-name::[^\\|!\\|]*");
    Pattern patt2 = Pattern.compile("\\|-\\|style:font-name::[^\\|!\\|]*");
    String testA = "ELEMENT::text:list-style|!|LEVEL::0|-|style:name::WW8Num14|!|text:consecutive-numbering::true|!|ELEMENT::text:list-level-style-bullet|!|LEVEL::1|-|style:num-suffix::.|!|text:bullet-char::?|!|text:level::1|!|text:style-name::WW8Num13z0|!|ELEMENT::style:list-level-properties|!|LEVEL::2|-|text:list-level-position-and-space-mode::label-alignment|!|ELEMENT::style:list-level-label-alignment|!|LEVEL::3|-|fo:margin-left::0.5in|!|fo:text-indent::-0.25in|!|text:label-followed-by::listtab|!|text:list-tab-stop-position::0.5in|!|ELEMENT::style:text-properties|!|LEVEL::2|-|style:font-name::Symbol|!|ELEMENT::text:list-level-style-number|!|LEVEL::1|-|style:num-format::1|!|style:num-suffix::.|!|text:level::2|!|ELEMENT::style:list-level-properties|!|LEVEL::2|-|text:list-level-position-and-space-mode::label-alignment|!|ELEMENT::style:list-level-label-alignment|!|LEVEL::3|-|fo:margin-left::0.5835in|!|fo:text-indent::-0.2917in|!|text:label-followed-by::listtab|!|text:list-tab-stop-position::0.5835in|!|ELEMENT::text:list-level-style-number|!|LEVEL::1|-|style:num-format::1|!|style:num-suffix::.|!|text:level::3|!|ELEMENT::style:list-level-properties|!|LEVEL::2|-|text:list-level-position-and-space-mode::label-alignment|!|ELEMENT::style:list-level-label-alignment|!|LEVEL::3|-|fo:margin-left::0.8752in|!|fo:text-indent::-0.2917in|!|text:label-followed-by::listtab|!|text:list-tab-stop-position::0.8752in|!|ELEMENT::text:list-level-style-number|!|LEVEL::1|-|style:num-format::1|!|style:num-suffix::.|!|text:level::4|!|ELEMENT::style:list-level-properties|!|LEVEL::2|-|text:list-level-position-and-space-mode::label-alignment|!|ELEMENT::style:list-level-label-alignment|!|LEVEL::3|-|fo:margin-left::1.1665in|!|fo:text-indent::-0.2917in|!|text:label-followed-by::listtab|!|text:list-tab-stop-position::1.1665in|!|ELEMENT::text:list-level-style-number|!|LEVEL::1|-|style:num-format::1|!|style:num-suffix::.|!|text:level::5|!|ELEMENT::style:list-level-properties|!|LEVEL::2|-|text:list-level-position-and-space-mode::label-alignment|!|ELEMENT::style:list-level-label-alignment|!|LEVEL::3|-|fo:margin-left::1.4583in|!|fo:text-indent::-0.2917in|!|text:label-followed-by::listtab|!|text:list-tab-stop-position::1.4583in|!|ELEMENT::text:list-level-style-number|!|LEVEL::1|-|style:num-format::1|!|style:num-suffix::.|!|text:level::6|!|ELEMENT::style:list-level-properties|!|LEVEL::2|-|text:list-level-position-and-space-mode::label-alignment|!|ELEMENT::style:list-level-label-alignment|!|LEVEL::3|-|fo:margin-left::1.75in|!|fo:text-indent::-0.2917in|!|text:label-followed-by::listtab|!|text:list-tab-stop-position::1.75in|!|ELEMENT::text:list-level-style-number|!|LEVEL::1|-|style:num-format::1|!|style:num-suffix::.|!|text:level::7|!|ELEMENT::style:list-level-properties|!|LEVEL::2|-|text:list-level-position-and-space-mode::label-alignment|!|ELEMENT::style:list-level-label-alignment|!|LEVEL::3|-|fo:margin-left::2.0417in|!|fo:text-indent::-0.2917in|!|text:label-followed-by::listtab|!|text:list-tab-stop-position::2.0417in|!|ELEMENT::text:list-level-style-number|!|LEVEL::1|-|style:num-format::1|!|style:num-suffix::.|!|text:level::8|!|ELEMENT::style:list-level-properties|!|LEVEL::2|-|text:list-level-position-and-space-mode::label-alignment|!|ELEMENT::style:list-level-label-alignment|!|LEVEL::3|-|fo:margin-left::2.3335in|!|fo:text-indent::-0.2917in|!|text:label-followed-by::listtab|!|text:list-tab-stop-position::2.3335in|!|ELEMENT::text:list-level-style-number|!|LEVEL::1|-|style:num-format::1|!|style:num-suffix::.|!|text:level::9|!|ELEMENT::style:list-level-properties|!|LEVEL::2|-|text:list-level-position-and-space-mode::label-alignment|!|ELEMENT::style:list-level-label-alignment|!|LEVEL::3|-|fo:margin-left::2.6252in|!|fo:text-indent::-0.2917in|!|text:label-followed-by::listtab|!|text:list-tab-stop-position::2.6252in|!|ELEMENT::text:list-level-style-number|!|LEVEL::1|-|style:num-format::1|!|style:num-suffix::.|!|text:level::10|!|ELEMENT::style:list-level-properties|!|LEVEL::2|-|text:list-level-position-and-space-mode::label-alignment|!|ELEMENT::style:list-level-label-alignment|!|LEVEL::3|-|fo:margin-left::2.9165in|!|fo:text-indent::-0.2917in|!|text:label-followed-by::listtab|!|text:list-tab-stop-position::2.9165in|!|";

    Matcher matcher = patt1.matcher(testA);
    while (matcher.find())
    {
      String t1 = matcher.group();
      if (t1 != null && t1.length() > 20)
      {
        String SST_Name = t1.substring(20);
        String SST_key = "SST_" + SST_Name;
        System.out.println(SST_Name);

      }
    }

    matcher = patt2.matcher(testA);
    while (matcher.find())
    {
      String t1 = matcher.group();
      if (t1 != null && t1.length() > 20)
      {
        String SST_Name = t1.substring(20);
        String SST_key = "SST_" + SST_Name;
        System.out.println(SST_Name);

      }
    }

  }

}
