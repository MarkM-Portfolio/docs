/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lc3.util;

import java.util.Set;

import com.ibm.concord.viewer.lc3.Constants;
import com.ibm.concord.viewer.spi.beans.Permission;

public class URLGenerater
{
  public static class QCS
  {
    public static String generateDocumentMediaURL(String serverUrl, String apiContextRoot, String repId, String docId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/document/");
      sb.append(docId);
      sb.append("/media");
      sb.append("?fastDownload=false");
      sb.append("&logDownload=false");
      sb.append("&errorPage=false");
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

    public static String generateUploadMediaAsReplaceURL(String serverUrl, String apiContextRoot, String repId, String docId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/userlibrary/");
      sb.append(repId);
      sb.append("/document/");
      sb.append(docId);
      sb.append("/media");
      sb.append("?createVersion=true&replace=true");
      return sb.toString();
    }

    public static String generateUploadMediaAsCreateURL(String serverUrl, String apiContextRoot, String repId, String libType)
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
      sb.append("/feed");
      return sb.toString();
    }

    public static String generateDocumentEntryURL(String serverUrl, String apiContextRoot, String repId, String docId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      // FIXME: Commented out following codes temporarily, because it's not correct to use url "/userlibrary/{userid}" to access communities
      // files.
      // Should use url "/library/{libraryid}" to access communities and personal files, will fix it when support to upload file into
      // communities files.
      // if (repId != null)
      // {
      // sb.append("/userlibrary/");
      // sb.append(repId);
      // }
      sb.append("/document/");
      sb.append(docId);
      sb.append("/entry?acls=true");
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
      // FIXME: Commented out following codes temporarily, because it's not correct to use url "/userlibrary/{userid}" to access communities
      // files.
      // Should use url "/library/{libraryid}" to access communities and personal files, will fix it when support to upload file into
      // communities files.
      // sb.append("/userlibrary/");
      // sb.append(repId);
      sb.append("/document/");
      sb.append(docId);
      sb.append("/feed");
      sb.append("?category=version");
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
  }

  public static class CMIS
  {
    public static String generateUploadMediaAsCreateURL(String serverUrl, String apiContextRoot, String repId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/repository/p%21");
      sb.append(repId);
      sb.append("/folderc/snx%3Afiles");
      return sb.toString();
    }

    public static String generateDocumentEntryURL(String serverUrl, String apiContextRoot, String repId, String docId)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      sb.append("/repository/p%21");
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
      sb.append("/repository/p%21");
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
      sb.append("/repository/p%21");
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
     * @param type
     *          specifies the library type, for personal files, it should be "personalFiles", for community files, it should be
     *          "communityFiles".
     * @param folderUri
     *          specifies the folder URI, for personal files, it should be {user id}, for community files, it should be
     *          {widgetId}!{communityId}.
     * @param encodedTitle
     *          specifies the encoded file name
     * @return
     */
    public static String generateDocumentEntryURLFromLabel(String serverUrl, String apiContextRoot, String type, String folderUri,
        String encodedTitle)
    {
      StringBuffer sb = new StringBuffer(serverUrl);
      sb.append(apiContextRoot);
      if (Constants.LIB_TYPE_COMMUNITY.equalsIgnoreCase(type))
      {
        sb.append("/repository/co%21");
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
}
