/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository.files;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Set;

import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaOptions;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.common.util.FormatUtil;

public class URLGenerater
{
  public static class QCS
  {

    public static String generateDocumentMediaURL(String serverUrl, String apiContextRoot, String repId, String docId, boolean logDownload)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/document/");
      sb.append(docId);
      sb.append("/media");
      if (!logDownload)
      {
        sb.append("?logDownload=false");
        sb.append("&fastDownload=false");       
      }
      else
      {
        sb.append("?fastDownload=false");
      }
      sb.append("&errorPage=false");        
      return sb.toString();
    }

    public static String generateUploadEntryAsReplaceURL(String serverUrl, String apiContextRoot, String repId, String docId,
        String versionSummary, boolean overwrite, long lastModified)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/document/");
      sb.append(docId);
      sb.append("/entry");
      if (overwrite)
      {
        sb.append("?createVersion=false&updatedVia=docs.auto&baseTimestamp=");
        sb.append(lastModified);
      }
      else
      {
        sb.append("?createVersion=true");
      }
      sb.append("&replace=true");
      if (versionSummary != null)
      {
        sb.append("&changeSummary=");
        try
        {
          versionSummary = URLEncoder.encode(versionSummary, "UTF-8");
        }
        catch (UnsupportedEncodingException ignored)
        {

        }
        sb.append(versionSummary);
      }
      return sb.toString();
    }

    public static String generateUploadMediaAsCreateURL(String serverUrl, String apiContextRoot, String repId, String libType,
        Boolean isExternal, Boolean propagate, MediaOptions options)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      if (Constants.LIB_TYPE_COMMUNITY.equalsIgnoreCase(libType))
      {
        sb.append("/library/");
        sb.append(repId);
      }
      else
      {
        sb.append("/userlibrary/");
        sb.append(repId);
      }
      sb.append("/feed?objectTypeId=00000000-00000-0000-0001-00000000000000");
      if (isExternal != null)
      {
        sb.append("&isExternal=");
        sb.append(Boolean.toString(isExternal));
      }
      if (propagate != null)
      {
        sb.append("&propagate=");
        sb.append(Boolean.toString(propagate));
      }
      if (options != null)
      {
        String contextType = options.getContextType();
        String contextValue = options.getContextValue();
        if (contextType != null && contextValue != null)
        {
          if ("pinnedfiles".equals(contextType) || "pinnedfolders".equals(contextType))
          {
            boolean value = Boolean.parseBoolean(contextValue);
            if (value)
            {
              sb.append("&favorite=true");
            }
          }
          else if ("sync".equals(contextType))
          {
            boolean value = Boolean.parseBoolean(contextValue);
            if (value)
            {
              sb.append("&sync=true");
            }
          }
          else if ("folder".equals(contextType))
          {
            sb.append("&addToCollection=");
            sb.append(contextValue);
            String fVisiblity = options.getFolderVisibility();
            if (fVisiblity != null)
            {
              sb.append("&visibility=");
              sb.append(fVisiblity);
            }
          }
        }
      }

      return sb.toString();
    }

    public static String generateDocumentEntryURL(String serverUrl, String apiContextRoot, String repId, String docId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/document/");
      sb.append(docId);
      sb.append("/entry?acls=true");
      return sb.toString();
    }

    public static String generateDocumentLockURL(String serverUrl, String apiContextRoot, String repId, String docId, boolean isLock)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/document/");
      sb.append(docId);
      sb.append("/lock");
      if (isLock)
      {
        sb.append("?type=hard");
      }
      return sb.toString();
    }

    public static String generateShareFeedURL(String serverUrl, String apiContextRoot)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/shares/feed");
      return sb.toString();
    }

    /**
     * This API is only available for personal files, not available for communities files.
     * 
     * @param serverUrl
     * @param apiContextRoot
     * @param libraryId
     * @param docId
     * @return
     */
    public static String generateDocumentPermissionFeedURL(String serverUrl, String apiContextRoot, String libraryId, String docId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/library/");
      sb.append(libraryId);
      sb.append("/document/");
      sb.append(docId);
      sb.append("/permissions/feed");
      sb.append("?format=json&pageSize=200");
      return sb.toString();
    }

    public static String generateDocumentVersionFeedURL(String serverUrl, String apiContextRoot, String repId, String docId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/document/");
      sb.append(docId);
      sb.append("/feed");
      sb.append("?category=version");
      return sb.toString();
    }

    public static String generateDocumentFeedURL(String serverUrl, String apiContextRoot, String repId, String docId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/document/");
      sb.append(docId);
      sb.append("/feed");
      return sb.toString();
    }

    public static String convert2PermissionString(Set<Permission> permissions)
    {
      StringBuffer permissionString = new StringBuffer();

      if (Permission.EDIT.hasPermission(permissions))
      {
        permissionString.append("Edit");
        return permissionString.toString();
      }

      if (Permission.VIEW.hasPermission(permissions))
      {
        permissionString.append("View");
        return permissionString.toString();
      }

      return permissionString.toString();
    }

    public static String generateSeedListURL(String serverUrl, String seedlistContextRoot, String timestamp, int pageSize)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(seedlistContextRoot);
      sb.append("?Timestamp=");
      sb.append(timestamp);
      sb.append("&Range=");
      sb.append(pageSize);
      return sb.toString();
    }

    public static String generateOwnedDocumentsFeedURL(String serverUrl, String apiContextRoot, String userId, int pageSize, int pageNumber)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/userlibrary/");
      sb.append(userId);
      sb.append("/feed?sK=modified&sO=dsc");
      sb.append("&pageSize=");
      sb.append(pageSize);
      sb.append("&page=");
      sb.append(pageNumber);
      sb.append("&acls=true");
      sb.append("&fileType=");
      sb.append(FormatUtil.ALL_EXTS);
      return sb.toString();
    }

    public static String generatePermissiveDocumentsFeedURL(String serverUrl, String apiContextRoot, String userId, int pageSize,
        int pageNumber)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/documents/shared/feed?sK=modified&sO=dsc&sC=document&direction=inbound");
      sb.append("&pageSize=");
      sb.append(pageSize);
      sb.append("&page=");
      sb.append(pageNumber);
      sb.append("&acls=true");
      /*
       * Below statements are commented out since the above feed api does not support extension based filtering. Waiting for Files codes
       * check in......
       */
      // sb.append("&fileType=");
      // sb.append(FormatUtil.ALL_EXTS.substring(0, FormatUtil.ALL_EXTS.length() - 1));
      return sb.toString();
    }

    public static String generateCommunityLibraryFeedURL(String serverUrl, String apiContextRoot, String communityUuid)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/communitylibrary/");
      sb.append(communityUuid);
      sb.append("/feed");
      return sb.toString();
    }

    public static String generateBidiPreferencesURL(String serverUrl)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append("/opensocial/basic/rest/people/@me/@self?fields=userSettings.textDirection&fields=userSettings.bidiEnabled");
      return sb.toString();
    }
  }

  public static class CMIS
  {
    public static String generateUploadMediaAsCreateURL(String serverUrl, String apiContextRoot, String repId, String repType)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      if (Constants.LIB_TYPE_COMMUNITY.equalsIgnoreCase(repType))
      {
        sb.append("/repository/co%21");
      }
      else
      {
        sb.append("/repository/p%21");
      }
      sb.append(repId);
      sb.append("/folderc/snx%3Afiles");
      return sb.toString();
    }

    public static String generateDocumentEntryURL(String serverUrl, String apiContextRoot, String repId, String docId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      if (Constants.LIB_TYPE_COMMUNITY.equalsIgnoreCase(null))
      {
        sb.append("/repository/co%21");
      }
      else
      {
        sb.append("/repository/p%21");
      }
      sb.append(repId);
      sb.append("/object/snx%3Afile%21");
      sb.append(docId);
      sb.append("?includeACL=true");
      return sb.toString();
    }

    public static String generateDocumentMediaURL(String serverUrl, String apiContextRoot, String repId, String docId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      if (Constants.LIB_TYPE_COMMUNITY.equalsIgnoreCase(null))
      {
        sb.append("/repository/co%21");
      }
      else
      {
        sb.append("/repository/p%21");
      }
      sb.append(repId);
      sb.append("/object/snx%3Afile%21");
      sb.append(docId);
      sb.append("/stream/");
      sb.append(docId); // This is a hack. In LC_Files, stream id is the same as the doc id. In CMIS, this precondition may not be true.
      // sb.append("/");
      // sb.append(docLabel);
      return sb.toString();
    }

    public static String generateUploadMediaAsReplaceURL(String serverUrl, String apiContextRoot, String repId, String docId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      if (Constants.LIB_TYPE_COMMUNITY.equalsIgnoreCase(null))
      {
        sb.append("/repository/co%21");
      }
      else
      {
        sb.append("/repository/p%21");
      }
      sb.append(repId);
      sb.append("/object/snx%3Afile%21");
      sb.append(docId);
      sb.append("/stream/");
      sb.append(docId); // This is a hack. In LC_Files, stream id is the same as the doc id. In CMIS, this precondition may not be true.
      // sb.append("/");
      // sb.append(docLabel);
      return sb.toString();
    }

    /**
     * 
     * @param serverUrl
     * @param apiContextRoot
     * @param folderType
     *          specifies the library type, for personal files, it should be "personalFiles", for community files, it should be
     *          "communityFiles".
     * @param folderUri
     *          specifies the folder URI, for personal files, it should be {user id}, for community files, it should be
     *          {widgetId}!{communityId} or {libraryId}.
     * @param encodedTitle
     *          specifies the encoded file name
     * @return
     */
    public static String generateDocumentEntryURLFromLabel(String serverUrl, String apiContextRoot, String folderType, String folderUri,
        String encodedTitle)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      if (Constants.LIB_TYPE_COMMUNITY.equalsIgnoreCase(folderType))
      {
        if (folderUri.contains("!"))
        {
          sb.append("/repository/co%21");
        }
        else
        {
          sb.delete(sb.length() - "/cmis".length(), sb.length());
          sb.append("/api");
          sb.append("/library/");
          sb.append(folderUri);
          sb.append("/document/");
          sb.append(encodedTitle);
          sb.append("/entry");
          sb.append("?identifier=label");
          return sb.toString();
        }
      }
      else
      {
        sb.append("/repository/p%21");
      }
      sb.append(folderUri);
      sb.append("/objectp?p=/files/");
      sb.append(encodedTitle);
      return sb.toString();
    }

  }

  public static String[] tokens(String docUri)
  {
    int index = docUri.indexOf(IDocumentEntry.DOC_URI_SEP);
    String libId = null;
    String docId = null;
    if (index != -1)
    {
      libId = docUri.substring(0, index);
      docId = docUri.substring(index + 1);
    }
    else
    {
      libId = null;
      docId = docUri;
    }
    return new String[] { libId, docId };
  }
}
