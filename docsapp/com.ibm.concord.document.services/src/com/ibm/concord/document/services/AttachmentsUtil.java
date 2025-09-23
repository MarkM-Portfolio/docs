/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.services;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.section.DraftSection;
import com.ibm.concord.draft.section.SectionDescriptor;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.revision.util.RevisionUtil;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.security.ACFUtil;
import com.ibm.docs.common.util.MimeTypeUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class AttachmentsUtil
{
  private static final String HTML = "text/html";
  private static final String PNG = "image/png";
  private static final String JPG= "image/jpeg";
  private static final String BMP = "image/bmp";
  private static final String GIF = "image/gif";
  
  private static final Logger LOG = Logger.getLogger(AttachmentsUtil.class.getName());

  public static boolean validateImage(File f)
  {
    ImageInputStream iis = null;
    ImageReader reader = null;
    try
    {
      iis = ImageIO.createImageInputStream(f);
      final Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
      if(readers.hasNext())
      {
        reader = (ImageReader) readers.next();
        reader.setInput(iis);
        return true;
      }
      else
      {
        return false;
      }
    }
    catch (IOException e)
    {
      return false;
    }
    catch (Exception e)
    {
      return false;
    }
    finally
    {
      if(reader != null)
      {
        try
        {
          reader.dispose();
        }
        catch (Exception e)
        {
        }
      }
      if(iis != null)
      {
        try
        {
          iis.close();
        }
        catch (IOException e)
        {
        }
      }
    }
  }

  public static String uploadAttachment(UserBean caller, IDocumentEntry docEntry, String path, InputStream is) throws Exception
  {
    DraftDescriptor draftDesp = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
    SectionDescriptor sectionDesp = new SectionDescriptor(draftDesp, new DraftSection(path));
    DraftStorageManager.getDraftStorageManager().storeSection(sectionDesp, is);
    return path;
  }

  private static MediaDescriptor getAttachment(String rootPath, String path) throws Exception
  {
    File rootFolder = new File(rootPath);
    if (!FileUtil.nfs_assertExistsDirectory(rootFolder, FileUtil.NFS_RETRY_SECONDS))
    {
      return null;
    }

    // Draft file accessed must exist and is a file
    File attFile = new File(rootFolder, path);
    if (!attFile.exists())
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
    
// getCanonicalPath() have performance issue for SMB/CIFS
//    // Draft file must under draft root
//    String canonicalPath = attFile.getCanonicalPath();
//    if (!canonicalPath.startsWith(rootFolder.getCanonicalPath()))
//    {
//      return null;
//    }

    // All check passed, return the target file stream
    FileInputStream fis = new FileInputStream(attFile);
    String mimeType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(attFile);
    MediaDescriptor media = null;
    if (mimeType.equalsIgnoreCase(HTML))
    {
      ByteArrayOutputStream os = new ByteArrayOutputStream();
      ACFUtil.process(fis, os);
      InputStream is = new ByteArrayInputStream(os.toByteArray());
      media = new MediaDescriptor(attFile.getName(), mimeType, is);
      os.close();
      fis.close();
    }
    else if (mimeType.equalsIgnoreCase(BMP) || mimeType.equalsIgnoreCase(JPG) || mimeType.equalsIgnoreCase(PNG)
        || mimeType.equalsIgnoreCase(GIF))
    {
      if (validateImage(attFile))
      {
        media = new MediaDescriptor(attFile.getName(), mimeType, fis);
      }
      else
      {
        throw new Exception("Invalid image found!");
      }
    }
    else
    {
      media = new MediaDescriptor(attFile.getName(), mimeType, fis);
    }

    return media;
  }
  
  public static MediaDescriptor getRevisionAttachment(UserBean user, IDocumentEntry docEntry, String revision, String contentPath) throws Exception
  {    
    String rootPath = RevisionUtil.getContentMediaFolder(user, docEntry, revision);
    
    return getAttachment(rootPath, contentPath);
  }
  
  public static MediaDescriptor getDraftAttachment(UserBean caller, IDocumentEntry docEntry, String path) throws Exception
  {
    // Draft root folder must exist and is a directory
    String rootPath = DocumentServiceUtil.getDraftDescriptor(caller, docEntry).getURI();

    return getAttachment(rootPath, path);
  }

  public static boolean deleteDraftAttachment(UserBean caller, IDocumentEntry docEntry, String path)
  {
    boolean result = true;
    DraftDescriptor draftDesp = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
    SectionDescriptor sectionDesp = new SectionDescriptor(draftDesp, new DraftSection(path));
    // avoid traverse the upper directory out of the rootPath
    if (path != null && path.indexOf("..") > -1)
    {
    	LOG.log(Level.WARNING, "AttFile is not allowed to delete: " + sectionDesp.getSectionUri());
    	return false;
    }
    try
    {
      DraftStorageManager.getDraftStorageManager().discardSection(sectionDesp);
    }
    catch (ConcordException e)
    {
      result = false;
    }
    
    return result;
  }

  public static JSONArray getDraftAttachmentList(UserBean caller, IDocumentEntry docEntry) throws Exception
  {
    DraftDescriptor draftDesp = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
    JSONArray jArray = DraftStorageManager.getDraftStorageManager().listDraftSections(draftDesp, null);
    JSONArray filteredList = new JSONArray();
    List<String> presList = getPreservedFileNameList(docEntry);
    for (int i = 0; i < jArray.size(); i++)
    {
      String path = (String) ((JSONObject) jArray.get(i)).get("rel_path");
      if (presList.contains(path))
      {
        continue;
      }
      filteredList.add(jArray.get(i));
    }

    return filteredList;
  }

  public static List<String> getPreservedFileNameList(IDocumentEntry docEntry)
  {
    List<String> list = DocumentServiceUtil.getDocumentService(docEntry.getMimeType()).getPreservedFileNameList();
    list.add(DraftSection.getReservedSection(null).getSectionPath());

    return list;
  }
  
  public static List<String> getPreservedFileNameList(IDocumentService docService)
  {
    List<String> list = docService.getPreservedFileNameList();
    list.add(DraftSection.getReservedSection(null).getSectionPath());

    return list;
  }

  public static void cleanDraftAttachments(UserBean caller, IDocumentEntry docEntry, List<String> keptList) throws Exception
  {
    JSONArray existsList = getDraftAttachmentList(caller, docEntry);
    for (int i = 0; i < existsList.size(); i++)
    {
      String path = (String) ((JSONObject) existsList.get(i)).get("rel_path");
      if (keptList.contains(path))
      {
        continue;
      }
      deleteDraftAttachment(caller, docEntry, path);
    }
  }

  public static String copyDraftAttachment(UserBean caller, IDocumentEntry toDoc, IDocumentEntry fromDoc, String path) throws Exception
  {
    MediaDescriptor media = getDraftAttachment(caller, fromDoc, path);

    path = path.replaceFirst("/wmf/", "/"); // FIXME: this is a workaround fix for defect 8229. Ideally, this should be fixed in Conversion
                                            // server side.
    path = path.substring(0, path.lastIndexOf("/") + 1) + generateNewFileName(path);
    uploadAttachment(caller, toDoc, path, media.getStream());
    media.dispose();

    return path;
  }

  private static String generateNewFileName(String path)
  {
    String randomId = ConcordUtil.generateTaskId();
    int index = path.lastIndexOf('.');
    if (index != -1)
    {
      String ext = path.substring(index + 1, path.length());
      return randomId + "." + ext;
    }
    else
    {
      return randomId;
    }
  }

  public static List<String> copyAllDraftAttachments(UserBean caller, IDocumentEntry toDoc, IDocumentEntry fromDoc) throws Exception
  {
    JSONArray list = getDraftAttachmentList(caller, fromDoc);
    List<String> uriList = new ArrayList<String>(list.size());
    for (int i = 0; i < list.size(); i++)
    {
      JSONObject item = (JSONObject) list.get(i);
      String path = (String) item.get("rel_path");
      String uri = copyDraftAttachment(caller, toDoc, fromDoc, path);
      uriList.add(uri);
    }
    return uriList;
  }

  public static boolean isPreservedFileName(IDocumentEntry docEntry, String path)
  {
    List<String> list = getPreservedFileNameList(docEntry);
    return list.contains(path);
  }
  
  public static boolean isPreservedFileName(IDocumentService docService, String path)
  {
    List<String> list = getPreservedFileNameList(docService);
    return list.contains(path);
  }
}
