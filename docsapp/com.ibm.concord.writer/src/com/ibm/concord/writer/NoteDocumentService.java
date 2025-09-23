/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.writer;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.Iterator;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;

import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.ImportDocumentContext;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.draft.IDraftJSONObjectSerializer;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.io.ZipUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class NoteDocumentService extends TextDocumentService
{
  private static final Logger LOG = Logger.getLogger(NoteDocumentService.class.getName());
  
  private static final String CLASS_NAME = NoteDocumentService.class.getName();

  private static final String PDF_MIMETYPE = Platform.getMimeType(".pdf");

  private static final String NOTE_MIMETYPE = "application/vnd.ibm-note";
  
  private static final String JSON_MIMETYPE = "application/json";
  
  public NoteDocumentService()
  {
    exportFormats.add(PDF_MIMETYPE);
  }

  public void init(JSONObject config)
  {
    super.init(config);
  }

  public void forwardEditPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    String mode = request.getParameter("mode");
    if (mode != null && mode.equalsIgnoreCase("htmlprint"))
    {
        request.getRequestDispatcher("/jsp/viewTextForHtmlPrint.jsp").forward(request, response);
    } 
    else
    {
      request.getRequestDispatcher("/WEB-INF/pages/apprichtextplus.jsp").forward(request, response);
    }
  }


  protected JSONObject getCurrentStateJSON(DraftDescriptor draftDes, JSONArray msgList)
  {
    // the msgList should always be null
    if (msgList.size() > 0)
    {
      LOG.log(Level.WARNING, "msgList not empty!", LogPurify.purify(msgList));
    }

    DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager();
    WriterDraftDeserializer deserializer = new WriterDraftDeserializer();
    JSONObject document = null;
    try
    {
      document = dsm.getDraftMediaAsJSONObject(draftDes, deserializer);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception in deserializing Document Draft.", e);
    }

    // No need to put sever sequence now since MsgList is always empty
    return document;
  }

  protected String getMimeType()
  {
    return NOTE_MIMETYPE;
  }

  protected String getTargetMimeType()
  {
    // return HTML_MIMETYPE;
    return JSON_MIMETYPE;
  }

  protected String getExtension()
  {
    return "note";
  }

  @Override
  protected String getServiceName()
  {
    return "note";
  }

  @Override
  public IDraftJSONObjectSerializer getJSONSerializer()
  {
    return new WriterDraftSerializer();
  }
  
  protected String getDefaultMimeType(String format)
  {
    return NOTE_MIMETYPE;
  }

  protected String getDefaultExtension(String format)
  {
    return "note";
  }
  
  @Override
  public IDocumentEntry importDocument(UserBean caller, IDocumentEntry entry, ImportDocumentContext parameters) throws Exception
  {
    LOG.entering(CLASS_NAME, "importDocument", new Object[] { entry.getDocUri() });
    
    LOG.info(new ActionLogEntry(caller, Action.CONVERTDOC, entry.getDocUri(), "sourceType: " + entry.getMimeType() + ", targetType: "
        + getTargetMimeType()).toString());
    
    DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(caller, entry);
    File mediaTempFolder = new File(draftDesc.getTempURI(UUID.randomUUID().toString()));
    if (!mediaTempFolder.mkdirs())
    {
      LOG.log(Level.WARNING, "failed to create directory " + mediaTempFolder.getAbsolutePath());
    }
    File draftTempFolder = new File(draftDesc.getTempURI(null), UUID.randomUUID().toString());
    if (!draftTempFolder.mkdirs())
    {
      LOG.log(Level.WARNING, "failed to create directory " + draftTempFolder.getAbsolutePath());
    }
    MediaDescriptor media = null;
    try
    {
      media = RepositoryServiceUtil.download(caller, entry, true);
      byte content[] = ZipUtil.decompress(media.getStream());
      importContent(content, draftTempFolder);
      //TODO please add your code to remove or add files
      DocumentServiceUtil.storeDraft(caller, entry, draftTempFolder.getAbsolutePath(), true);
    }
    catch(RepositoryAccessException e)
    {
      throw e;
    }
    finally
    {
      if(media != null)
      {
        media.dispose();
      }
      FileUtil.cleanDirectory(draftTempFolder);
      if(draftTempFolder.delete())
      {
        LOG.log(Level.WARNING, "failed to delete folder " + draftTempFolder);
      }
    }
    LOG.exiting(CLASS_NAME, "importDocument", new Object[] { entry.getDocUri() });
    return entry;
  }
  
  @Override
  public IDocumentEntry publish(IDocumentEntry docEntry, UserBean caller, JSONObject requestData, JSONArray msgList, boolean overwrite) throws Exception
  {
    LOG.entering(CLASS_NAME, "publish", new Object[] { docEntry.getTitle() });
    
    LOG.info(new ActionLogEntry(caller, Action.PUBLISHDOC, docEntry.getDocUri(), null).toString());
    
    DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
    File temp = new File(draftDesc.getTempURI(UUID.randomUUID().toString()));
    if(!temp.mkdirs())
    {
      LOG.warning("failed to create folder " + temp.getAbsolutePath());
      return null;
    }
    
    MediaDescriptor media = null;
    FileInputStream fis = null;
    IDocumentEntry newDocEntry = null;
    File concordFolder = new File(temp, "concord");
    if (!concordFolder.mkdirs())
    {
      LOG.log(Level.WARNING, "failed to create directory " + concordFolder.getAbsolutePath());
    }
    try
    {
      // copy draft files to temp concord folder
      copyDraftToDir(draftDesc, concordFolder.getAbsolutePath());
      //TODO add code to remove other files except content.json
      String newTitle = (String) requestData.get("newTitle");
      if (newTitle == null)
      {
        newTitle = docEntry.getTitle() + ".note";
      }
      String versionSummary = (String) requestData.get("changeSummary");
      byte[] content = exportContent(concordFolder);
      ByteArrayInputStream bais = new ByteArrayInputStream(ZipUtil.compress(content));
      media = new MediaDescriptor(newTitle, NOTE_MIMETYPE, bais);
      newDocEntry = DocumentServiceUtil.publishDocument(caller, docEntry, media, null, versionSummary, overwrite);
      DocumentEntryHelper.clearEntryCache(caller, newDocEntry.getDocUri());
    }
    catch (IOException e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("error when publishing a new version document");
      dse.getData().put("docUri", docEntry.getDocUri());
      throw dse;
    }
    catch(Exception e)
    {
      throw e;
    }
    finally
    {
      if(media != null)
      {
        media.dispose();
      }
      if(fis != null)
      {
        fis.close();
      }
      FileUtil.cleanDirectory(temp);
      temp.delete();
    }
    LOG.entering(CLASS_NAME, "publish", new Object[] { docEntry.getTitle() });
    return newDocEntry;
  }
  
  private String getLabel(String fileName)
  {
    int index = fileName.lastIndexOf(".");
    if (index == -1)
      return fileName;
    return fileName.substring(0, index);
  }

  /**
   * content.note is a compressed json file. this json file contains the files listed in TEMPLATE_FILE and pictures encoded by based64
   * this function will extract the file content of these files from content.note and serialize the content to draft folder.
   *  
   * @param contentFileFolder
   * @param draftTempFolder
   * @throws IOException
   */
  private void importContent(byte[] bytes, File draftTempFolder) throws IOException
  {
    JSONObject json = null;
    try
    {
      json = JSONObject.parse(new String(bytes, "UTF-8"));
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "failed to parse json");
      throw e;
    }
    // generate json files from content.note
    for (String file : TEMPLATE_FILE)
    {
      JSONObject content = (JSONObject) json.get(file);
      if (content == null)
      {
        content = new JSONObject();
      }
      FileOutputStream fos = null;
      File jsonFile = new File(draftTempFolder, file + ".json");
      try
      {
        fos = new FileOutputStream(jsonFile);
        content.serialize(fos);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "failed to write file " + jsonFile.getAbsolutePath());
        throw e;
      }
      finally
      {
        if (fos != null)
        {
          fos.close();
        }
      }
    }
    // generate pictures
    JSONObject pictures = (JSONObject) json.get("Pictures");
    if (pictures != null)
    {
      File pictureFolder = new File(draftTempFolder, "Pictures");
      if (!pictureFolder.mkdirs())
      {
        LOG.log(Level.WARNING, "failed to create folder " + pictureFolder);
        return;
      }
      importPictures(pictures, pictureFolder);
    }
  }

  private void importPictures(JSONObject pictures, File pictureFolder)
  {
    Iterator<?> iter = pictures.keySet().iterator();

    while (iter.hasNext())
    {
      String key = (String) iter.next();
      String content = (String) pictures.get(key);
      decode(content, new File(pictureFolder, key));
    }
  }

  private void decode(String content, File pictureFile)
  {
    FileOutputStream fos = null;
    try
    {
      byte[] base64 = Base64.decodeBase64(content.getBytes("UTF-8"));
      fos = new FileOutputStream(pictureFile);
      fos.write(base64);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "failed to write to " + pictureFile.getAbsolutePath());
    }
    finally
    {
      if (fos != null)
      {
        try
        {
          fos.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
  }

  private byte[] exportContent(File concordFolder) throws IOException
  {
    File[] list = concordFolder.listFiles(new FilenameFilter()
    {
      @Override
      public boolean accept(File dir, String name)
      {
        for (String filename : TEMPLATE_FILE)
        {
          if (filename.equals(getLabel(name)))
          {
            return true;
          }
          continue;
        }
        return false;
      }
    });
    JSONObject contentJson = new JSONObject();
    for (File file : list)
    {
      FileInputStream fis = null;
      try
      {
        fis = new FileInputStream(file);
        JSONObject jsonFile = JSONObject.parse(fis);
        contentJson.put(getLabel(file.getName()), jsonFile);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "failed to read file " + file.getAbsolutePath());
        throw e;
      }
      finally
      {
        if (fis != null)
        {
          fis.close();
        }
      }
    }
    File picturesFolder = new File(concordFolder, "Pictures");
    if (picturesFolder.exists())
    {
      exportPictures(contentJson, picturesFolder);
    }
    return contentJson.toString().getBytes("UTF-8");
  }

  private void exportPictures(JSONObject contentJson, File picturesFolder)
  {
    JSONObject pictures = new JSONObject();
    File files[] = picturesFolder.listFiles();
    for (File file : files)
    {
      try
      {
        byte content[] = toByteArray(file);
        byte bytes[] = Base64.encodeBase64(content);
        pictures.put(file.getName(), new String(bytes));
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
    }
    contentJson.put("Pictures", pictures);
  }

  private byte[] toByteArray(File file) throws IOException
  {
    ByteArrayOutputStream baos = new ByteArrayOutputStream((int) file.length());
    BufferedInputStream bis = null;
    try
    {
      bis = new BufferedInputStream(new FileInputStream(file));
      int bufSize = 4096;
      byte[] buffer = new byte[bufSize];
      int length = 0;
      while ((length = bis.read(buffer, 0, bufSize)) != -1)
      {
        baos.write(buffer, 0, length);
      }
      return baos.toByteArray();
    }
    catch (IOException e)
    {
      throw e;
    }
    finally
    {
      bis.close();
      baos.close();
    }
  }
}
