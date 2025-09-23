/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.document.services;

import java.io.File;
import java.io.FileInputStream;
import java.io.RandomAccessFile;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.spi.impl.CacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.HTMLCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.SnapshotDescriptor;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.MediaDescriptor;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.util.MimeTypeUtil;

public class AttachmentsUtil
{
  private static final Logger LOG = Logger.getLogger(AttachmentsUtil.class.getName());

  public static MediaDescriptor getDraftAttachment(ICacheDescriptor cacheDesc, /*UserBean caller, IDocumentEntry docEntry, */String path/*, boolean isHTML*/) throws Exception
  {
    // Draft root folder must exist and is a directory
    String rootPath = cacheDesc.getMediaURI();//DocumentServiceUtil.getCacheDescriptor(caller, docEntry,isHTML).getMediaURI();
    File rootFolder = new File(rootPath);
    if (!rootFolder.exists() || !rootFolder.isDirectory())
    {
      LOG.log(Level.WARNING, "Root Folder doesn't exists; " + rootFolder.getAbsolutePath() + " Docentry: " + cacheDesc.getDocId());
      return null;
    }

    // Draft file accessed must exist and is a file
    File attFile = new File(rootFolder, path);
    if (!attFile.exists() || !attFile.isFile())
    {
      LOG.log(Level.WARNING, "AttFile doesn't exists; " + attFile.getAbsolutePath());
      return null;
    }
    
    // avoid traverse the upper directory out of the rootPath
    if (path.indexOf("..") > -1)
    {
    	LOG.log(Level.WARNING, "AttFile is not allowed to access: " + attFile.getAbsolutePath());
    	return null;
    }
    
    FileInputStream fis = new FileInputStream(attFile);
    String mimeType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(attFile);
    MediaDescriptor media = new MediaDescriptor(attFile.getName(), mimeType, fis);
    media.setLength(attFile.length());
    return media;
  }

  public static MediaDescriptor getPDFViewAttachment(ICacheDescriptor cacheDesc, /*UserBean caller, IDocumentEntry docEntry, */String path/*, boolean isHTML*/) throws Exception
  {
    // Draft root folder must exist and is a directory
    String rootPath = cacheDesc.getMediaURI();//DocumentServiceUtil.getCacheDescriptor(caller, docEntry,isHTML).getMediaURI();
    File rootFolder = new File(rootPath);
    if (!rootFolder.exists() || !rootFolder.isDirectory())
    {
      LOG.log(Level.WARNING, "Root Folder doesn't exists; " + rootFolder.getAbsolutePath() + " Docentry: " + cacheDesc.getDocId());
      return null;
    }

    // Draft file accessed must exist and is a file
    File attFile = new File(rootFolder, path);
    if (!attFile.exists() || !attFile.isFile())
    {
      LOG.log(Level.WARNING, "AttFile doesn't exists; " + attFile.getAbsolutePath());
      return null;
    }
    RandomAccessFile raf = new RandomAccessFile(attFile,"r");
    String mimeType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(attFile);
    MediaDescriptor media = new MediaDescriptor(attFile.getName(), mimeType, raf);
    media.setLength(attFile.length());
    return media;
  }
  
  public static MediaDescriptor getHtmlDraftAttachment(UserBean caller, IDocumentEntry docEntry, String path) throws Exception
  {
    // Draft root folder must exist and is a directory
    ICacheDescriptor desc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(caller, docEntry);   
    String rootPath = desc.getHtmlURI();
    File rootFolder = new File(rootPath);
    if (!rootFolder.exists() || !rootFolder.isDirectory())
    {
      LOG.log(Level.WARNING, "Root Folder doesn't exists; " + rootFolder.getAbsolutePath() + " Docentry: " + docEntry.getDocUri());
      return null;
    }

    // Draft file accessed must exist and is a file
    File attFile = new File(rootFolder, path);
    if (!attFile.exists() || !attFile.isFile())
    {
      LOG.log(Level.WARNING, "AttFile doesn't exists; " + attFile.getAbsolutePath());
      return null;
    }
    FileInputStream fis = new FileInputStream(attFile);
    String mimeType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(attFile);
    MediaDescriptor media = new MediaDescriptor(attFile.getName(), mimeType, fis);
    media.setLength(attFile.length());
    return media;
  }

}
