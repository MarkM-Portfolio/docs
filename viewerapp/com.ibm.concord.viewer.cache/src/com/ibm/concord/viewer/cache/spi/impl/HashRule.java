package com.ibm.concord.viewer.cache.spi.impl;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;

public abstract class HashRule
{
  private static Map<ViewContext, HashRule> map = new HashMap<ViewContext, HashRule>();

  private static HashRule localHash = new LocalHash();

  private static HashRule editorHash = new EditorHash();

  private static HashRule thumbnailHash = new ThumbnailHash();

  static
  {
    map.put(ViewContext.VIEW_HTML_NON_SS, localHash);
    map.put(ViewContext.VIEW_IMAGE, localHash);
    map.put(ViewContext.VIEW_HTML_SS, editorHash);
    map.put(ViewContext.VIEW_PDF, localHash);
  }

  static class LocalHash extends HashRule
  {
    @Override
    public String[] doHash(IDocumentEntry docEntry, List<String> more)
    {
      String toHash = docEntry.getDocUri();
      if (!RepositoryServiceUtil.ECM_FILES_REPO_ID.equals(docEntry.getRepository()))
      {
        toHash = toHash + "@" + String.valueOf(docEntry.getModified().getTimeInMillis());
      }
      if (more != null)
      {
        for (Iterator<String> iter = more.iterator(); iter.hasNext();)
        {
          toHash += "@" + iter.next();
        }
      }
      return ViewerUtil.hash(toHash);
    }
  }

  static class EditorHash extends HashRule
  {
    @Override
    public String[] doHash(IDocumentEntry docEntry, List<String> more)
    {
      String toHash = docEntry.getDocUri();
      if (more != null)
      {
        for (Iterator<String> iter = more.iterator(); iter.hasNext();)
        {
          toHash += "@" + iter.next();
        }
      }
      return ViewerUtil.hash(toHash);
    }
  }

  static class ThumbnailHash extends HashRule
  {
    @Override
    public String[] doHash(IDocumentEntry docEntry, List<String> more)
    {
      return ViewerUtil.hash(docEntry.getDocUri());
    }
  }

  public static String[] getHash(ViewContext cxt, IDocumentEntry docEntry, List<String> more)
  {
    return map.get(cxt).doHash(docEntry, more);
  }

  public static String[] getLocalHash(ViewContext cxt, IDocumentEntry docEntry)
  {
    switch (cxt)
      {
        case VIEW_HTML_NON_SS :
        case VIEW_HTML_SS :
          return localHash.doHash(docEntry, Arrays.asList(new String[] { "HTML" }));
        case VIEW_IMAGE :
          return localHash.doHash(docEntry, null);
        case VIEW_PDF :
            return localHash.doHash(docEntry, null);
        case VIEW_THUMBNAIL :
          return thumbnailHash.doHash(docEntry, null);
        default:
          return null;
      }
  }

  public static String[] getLocalImageHash(IDocumentEntry docEntry)
  {
    return localHash.doHash(docEntry, null);
  }

  public static String[] getLocalPdfHash(IDocumentEntry docEntry)
  {
    return localHash.doHash(docEntry, null);
  }

  public static String[] getLocalHTMLHash(IDocumentEntry docEntry, List<String> more)
  {
    return localHash.doHash(docEntry, Arrays.asList(new String[] { "HTML" }));
  }

  public abstract String[] doHash(IDocumentEntry docEntry, List<String> more);
  
  /**
   * Description Folder to determine whether the name with hash roles
   * @param hash
   * @return
   */
  public static int validateHash(String hash)
  {
    try
    {
      return Integer.valueOf(hash).intValue();
    }
    catch (NumberFormatException e)
    {
      return -1;
    }
  }
}
