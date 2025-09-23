/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.document.common.AbstractDocumentService;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.UserDocCacheBean;
import com.ibm.concord.platform.conversion.ConversionComponentImpl;
import com.ibm.concord.platform.conversion.IConversionService;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IUserDocCacheDAO;
import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.exceptions.OutOfCapacityException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.Constant;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.ImportDocumentContext;
import com.ibm.concord.spi.draft.IDraftJSONObjectSerializer;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.message.IDManager;
import com.ibm.concord.spreadsheet.document.message.Transformer;
import com.ibm.concord.spreadsheet.document.message.Transformer.CALCSTATUS;
import com.ibm.concord.spreadsheet.partialload.ImageDeserializer;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author mayue@cn.ibm.com
 * 
 */
public class SpreadsheetDocumentService extends AbstractDocumentService
{
  private static final String CLASS_NAME = SpreadsheetDocumentService.class.getName();
  
  private static final Logger LOG = Logger.getLogger(CLASS_NAME);
  
  // PITFALL: this field needs to align with ConversionConstants, server checks this version with the one in ConversionConstants, if not equal,
  // conversion is re-run each time the document is refreshed.
  // DRAFT_FORMAT_VERSION should updated with the ConversionConstant.CURRENT_CONVERTER_VERSION_SPREADSHEET in com.ibm.symphony.conversion.service package
  // upgrade feature details
  // 1.1.0: freeze window, chart
  // 1.2.0: sheet protection
  // 1.3.0: use ooxml formula format in json
  private static final String DRAFT_FORMAT_VERSION = "1.3.0";
  
  private static final String SheetContent = "{\"content\":{\"styles\":{\"defaultcellstyle\":{\"format\":{\"cat\":\"\",\"code\":\"\",\"cur\":\"\",\"clr\":\"\"},\"font\":{\"n\":\"Arial\",\"sz\":10,\"c\":\"#000000\",\"i\":false,\"u\":false,\"st\":false,\"bd\":false},\"borderstyle\":{\"bs\":\"solid\",\"rs\":\"solid\",\"ls\":\"solid\",\"ts\":\"solid\"},\"border\":{\"l\":\"0\",\"r\":\"0\",\"t\":\"0\",\"b\":\"0\"},\"bordercolor\":{\"lc\":\"#000000\",\"rc\":\"#000000\",\"tc\":\"#000000\",\"bc\":\"#000000\"},\"bg\":\"#ffffff\",\"indent\":0,\"wrap\":false,\"unlocked\":false,\"hidden\":false,\"align\":\"\",\"valign\":\"\",\"dir\":\"\"},\"defaultrowstyle\":{\"h\":16},\"defaultcolumnstyle\":{\"w\":80}},\"sheets\":{\"st0\":{\"rows\":{}},\"st1\":{\"rows\":{}},\"st2\":{\"rows\":{}}}},\"meta\":{\"version\":\"1.03\",\"locale\":\"\",\"sheets\":{\"st0\":{\"sheetindex\":1,\"sheetname\":\"Sheet1\"},\"st1\":{\"sheetindex\":2,\"sheetname\":\"Sheet2\"},\"st2\":{\"sheetindex\":3,\"sheetname\":\"Sheet3\"}},\"sheetsIdArray\":[\"st0\",\"st1\",\"st2\"],\"sheetsArray\":{}}}";
  
  private static final String SingleSheetContent = "{\"content\":{\"styles\":{\"defaultcellstyle\":{\"format\":{\"cat\":\"\",\"code\":\"\",\"cur\":\"\",\"clr\":\"\"},\"font\":{\"n\":\"Arial\",\"sz\":10,\"c\":\"#000000\",\"i\":false,\"u\":false,\"st\":false,\"bd\":false},\"borderstyle\":{\"bs\":\"solid\",\"rs\":\"solid\",\"ls\":\"solid\",\"ts\":\"solid\"},\"border\":{\"l\":\"0\",\"r\":\"0\",\"t\":\"0\",\"b\":\"0\"},\"bordercolor\":{\"lc\":\"#000000\",\"rc\":\"#000000\",\"tc\":\"#000000\",\"bc\":\"#000000\"},\"bg\":\"#ffffff\",\"indent\":0,\"wrap\":false,\"unlocked\":false,\"hidden\":false,\"align\":\"\",\"valign\":\"\",\"dir\":\"\"},\"defaultrowstyle\":{\"h\":16},\"defaultcolumnstyle\":{\"w\":80}},\"sheets\":{\"st0\":{\"rows\":{}}}},\"meta\":{\"version\":\"1.03\",\"locale\":\"\",\"sheets\":{\"st0\":{\"sheetindex\":1,\"sheetname\":\"Sheet1\"}},\"sheetsIdArray\":[\"st0\"],\"sheetsArray\":{}}}";
  private static final String PageSettingContent = "{\"marginLeft\":\"1.778cm\",\"marginRight\":\"1.778cm\",\"marginTop\":\"1.905cm\",\"marginBottom\":\"1.905cm\"}";
  private static List<String> PRESERVED_FILE_LIST = new ArrayList<String>(1);  
  
  @Override
  protected void disableAndCleanTrackChange(File folder){};

  public SpreadsheetDocumentService()
  {
    exportFormats.add(ServiceConstants.PDF_MIMETYPE);
    exportFormats.add(ServiceConstants.HTML_MIMETYPE);
    exportFormats.add(ServiceConstants.XLS_MIMETYPE);
    
    exportSourceFormats.add(ServiceConstants.ODS_MIMETYPE);
    exportSourceFormats.add(ServiceConstants.OTS_MIMETYPE);
    exportSourceFormats.add(ServiceConstants.XLS_MIMETYPE);
    exportSourceFormats.add(ServiceConstants.XLSX_MIMETYPE);
    exportSourceFormats.add(ServiceConstants.XLSM_MIMETYPE);
    exportSourceFormats.add(ServiceConstants.XLSM_12_MIMETYPE);
    exportSourceFormats.add(ServiceConstants.CSV_MIMETYPE);
    
    format2Extension.put(MS_FORMAT_MANE, "xlsx");
	format2Extension.put(ODF_FORMAT_NAME, "ods");
	format2Mimetype.put(MS_FORMAT_MANE, ServiceConstants.XLSX_MIMETYPE);
	format2Mimetype.put(ODF_FORMAT_NAME, ServiceConstants.ODS_MIMETYPE);
  }

  private void createBlankDocument(JSONObject sheetContent, File parentFolder)
  {
    try
    {
      JSONObject content = (JSONObject) sheetContent.get(ConversionConstant.CONTENT);
      JSONObject meta = (JSONObject) sheetContent.get(ConversionConstant.META);
      JSONObject reference = (JSONObject) sheetContent.get(ConversionConstant.REFERENCE);

      File contentFilePath = new File(parentFolder, "content.js");
      FileOutputStream cos = new FileOutputStream(contentFilePath);
      content.serialize(cos);
      cos.close();

      File metaFilePath = new File(parentFolder, "meta.js");
      FileOutputStream mos = new FileOutputStream(metaFilePath);
      meta.serialize(mos);
      mos.close();

      File pageSettingFilePath = new File(parentFolder, "page-settings.js");
      FileOutputStream pos = new FileOutputStream(pageSettingFilePath);
      JSONObject pagesetting = JSONObject.parse(PageSettingContent);
      pagesetting.serialize(pos);
      pos.close();

      if (reference != null)
      {
        File referenceFilePath = new File(parentFolder, "reference.js");
        FileOutputStream fos = new FileOutputStream(referenceFilePath);
        reference.serialize(fos);
        fos.close();
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "io error when create blakn document", e);
    }
  }

  public List<String> getPreservedFileNameList()
  {
    return PRESERVED_FILE_LIST;
  }

  public void init(JSONObject config)
  {
    super.init(config);
  }

  public void forwardEditPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    request.getRequestDispatcher("/WEB-INF/pages/appsheet.jsp").forward(request, response);
  }
  
  public void forwardViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    request.getRequestDispatcher("/jsp/view_sheet.jsp").forward(request, response);
  }
  
  public void forwardRevisionViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    request.getRequestDispatcher("/WEB-INF/pages/revappsheet.jsp").forward(request, response);
  }  

  public IDocumentEntry importDocument(UserBean caller, IDocumentEntry entry, ImportDocumentContext parameters) throws Exception
  {
    LOG.entering(CLASS_NAME, "importDocument", new Object[] {entry.getDocUri()});
    String csvMime = Platform.getMimeType(".csv");
    String mimeType = entry.getMimeType();
    if(csvMime.equals(mimeType))
    {
      if (parameters != null)
      {
        String upgradeStr = String.valueOf(parameters.upgradeConvert);
        if (upgradeStr != null)
        {
          boolean upgradeConvert = Boolean.parseBoolean(upgradeStr);
          if (upgradeConvert)
            return entry;
        }
      }
      File convertFolder = null;
      try
      {
        UUID docId = UUID.randomUUID();
        convertFolder = new File(CONVERSION_FOLDER, docId.toString());
        FileUtil.nfs_mkdirs(convertFolder, FileUtil.NFS_RETRY_SECONDS);
        File concordFolder = new File(convertFolder, "concord");
        FileUtil.nfs_mkdirs(concordFolder, FileUtil.NFS_RETRY_SECONDS);
        createVersionFile(concordFolder);
        JSONObject data = new JSONObject();
        String content = SingleSheetContent.replaceAll("Sheet1", entry.getTitle());
        createTemplateDocument(data, concordFolder,content);

        //store as draft
        DocumentServiceUtil.storeDraft(caller, entry, concordFolder.getAbsolutePath(), true);
        LOG.exiting(CLASS_NAME, "importDocument", new Object[] {entry.getDocUri()});
      }
      catch(Exception e)
      {
        LOG.log(Level.SEVERE, "unknown errors when importing document", e);
        throw e; 
      }
      finally
      {
        FileUtil.cleanDirectory(convertFolder);
        if (!convertFolder.delete())
        {
          LOG.log(Level.SEVERE, "failed to delete folder " + convertFolder);
        }
      }
    }
    else
      entry = super.importDocument(caller, entry, parameters);
    return entry;
  }
  
  /**
   * Each document service implementation store their current state to a specified folder
   * @param toFolder
   *        folder where to store
   * @param contentState
   *        contains the state of the document
   * @throws Exception
   */
  protected void storeStateTo(File toFolder, JSONObject contentState) throws Exception
  {
    FileOutputStream fos = null;
    try
    {
      JSONObject contentJson = (JSONObject)contentState.get("content");
      fos = new FileOutputStream(new File(toFolder + File.separator + "content.js"));
      contentJson.serialize(fos);
      fos.close();
      
      JSONObject metaJson = (JSONObject)contentState.get("meta");
      fos = new FileOutputStream(new File(toFolder + File.separator + "meta.js"));
      metaJson.serialize(fos);
      fos.close();
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.WARNING, "file not found", e);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "io error when writing content", e);
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
          LOG.log(Level.WARNING, "io error when closing stream", e);
        }
      }
    }
  }

  protected File localizePublishedContent(File contentDir)
  {
    return null;
  }
  
  protected String exportFromDraft(UserBean caller, IDocumentEntry docEntry, String targetExtension, Map<String, Object> options, String toDir, DraftDescriptor draftDesc) throws Exception
  {
    String targetMimeType = Platform.getMimeType("." + targetExtension);
    if (ServiceConstants.CSV_MIMETYPE.equals(targetMimeType))
    {
      String cid = (String) options.get("CSVPATH");
      if(cid != null)
        return toDir + File.separator + cid + File.separator + "content.csv";
      return null;
    }
    else
      return super.exportFromDraft(caller, docEntry, targetExtension, options, toDir, draftDesc);
  }    

  protected String convert(String path, String sourceType, String targetType, Map<String, Object> options) throws ConversionException, UnsupportedMimeTypeException
  {
    if (sourceType.equals(ServiceConstants.ODS_MIMETYPE) && targetType.equals(ServiceConstants.HTML_MIMETYPE))
    {
    IConversionService cvtService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
        IConversionService.class);
    String resultPath = cvtService.convert(path, sourceType, ServiceConstants.JSON_MIMETYPE, options);
    resultPath = cvtService.convert(resultPath, ServiceConstants.JSON_MIMETYPE, targetType, options);
    return resultPath;
    }
    else 
      return super.convert(path, sourceType, targetType, options);
  }
  
  // public String getEditorForwardPage()
  // {
  // return "/WEB-INF/pages/appsheet.jsp";
  // }

  public TransformResult transformMessage(JSONObject msgData, JSONArray baseMsgList, Object OTContext)
  {
    IDManager idm = (IDManager) OTContext;
    return Transformer.transform(msgData, baseMsgList, idm);
  }

  protected void applyMessageFiltered(DraftDescriptor draftDesc, JSONArray msgList, boolean isClosed) throws Exception
  {
    Transformer.flushMessage(draftDesc, msgList, isClosed);
  }

  //useless?
  public JSONObject getResultDocument(JSONObject baseDoc, JSONArray msgList, boolean trackingChange)
  {
    return null;
  }

  protected JSONObject getCurrentStateFiltered(DraftDescriptor draftDes, JSONArray msgList, JSONObject criteria) throws Exception
  {
    // the msgList should always be null
    if (msgList.size() > 0)
    {
      LOG.log(Level.WARNING, "msgList not empty!", msgList);
    }
    
    JSONObject state = Transformer.getCurrentState(draftDes, criteria);
    
    return state;    
  }

  public Object genOTContext(DraftDescriptor draftDes) throws Exception
  {
    JSONObject state = (JSONObject)getCurrentState(draftDes, new JSONArray(), null).get(MessageConstants.CONTENT_STATE_KEY);
    state.put("doc_id", draftDes.getDocId());
    return new IDManager(state);
  }

  private static File createTempDir()
  {
    for (;;)
    {
      File tmpContentFile = null;
      try
      {
        tmpContentFile = File.createTempFile("concord", "tmp");
      }
      catch (IOException e)
      {
        e.printStackTrace();
        return null;
      }
      tmpContentFile.delete();
      if (tmpContentFile.mkdir())
      {
        tmpContentFile.deleteOnExit();
        return tmpContentFile;
      }
    }
  }

  public static void saveDraft(JSONObject draft, String dir) throws IOException
  {
    JSONObject content = (JSONObject) draft.get(ConversionConstant.CONTENT);
    JSONObject meta = (JSONObject) draft.get(ConversionConstant.META);
    JSONObject reference = (JSONObject) draft.get(ConversionConstant.REFERENCE);

    File path = new File(dir);
    path.mkdirs();

    String contentFilePath = dir + File.separator + "content.js";
    FileOutputStream cos = new FileOutputStream(contentFilePath);
    content.serialize(cos);
    cos.close();

    String metaFilePath = dir + File.separator + "meta.js";
    FileOutputStream mos = new FileOutputStream(metaFilePath);
    meta.serialize(mos);
    mos.close();

    if (reference != null)
    {
      String referenceFilePath = dir + File.separator + "reference.js";
      FileOutputStream fos = new FileOutputStream(referenceFilePath);
      reference.serialize(fos);
      fos.close();
    }
  }

  public boolean setDocument(DraftDescriptor draftDes, JSONObject state)
  {
    try
    {
      saveDraft(state, draftDes.getURI());
    }
    catch (IOException e)
    {
      throw new RuntimeException("SpreadsheetDocumentService.setDocument error", e);
    }
    return true;
  }

  public static String getFileType(String mimeType)
  {
    String fileType = "ods";
    if (mimeType.equalsIgnoreCase(ServiceConstants.ODS_MIMETYPE))
      fileType = "ods";
    else if (mimeType.equalsIgnoreCase(ServiceConstants.OTS_MIMETYPE))
      fileType = "ots";
    else if (mimeType.equalsIgnoreCase(ServiceConstants.XLS_MIMETYPE))
      fileType = "xls";
    else if (mimeType.equalsIgnoreCase(ServiceConstants.PDF_MIMETYPE))
      fileType = "pdf";

    return fileType;
  }
  
  public JSONObject getSection(DraftDescriptor draftDes, JSONArray msgList, String sectionId)
  {
    return getSection(draftDes, msgList, sectionId, null);
  }

  //TODO: should implement it when task work privately enabled
  public JSONObject getSection(DraftDescriptor draftDes, JSONArray msgList, String sectionId, String masterDoc)
  {
    return null;
  }

  protected String getTargetMimeType()
  {
    return ServiceConstants.JSON_MIMETYPE;
  }
  
  protected String getTemplateMimeType()
  {
    return ServiceConstants.OTS_MIMETYPE;
  }
  
  protected String getTemplateExtension()
  {
    return "ots";
  }
  
  protected void createTemplateDocument(JSONObject data, File concordFolder) throws DocumentServiceException
  {
    createTemplateDocument(data, concordFolder, SheetContent);
  }
  
  protected void createTemplateDocument(JSONObject data, File concordFolder,String SheetContent) throws DocumentServiceException
  {
    try
    {
      JSONObject content = null;
      if (data != null)
      {
        content = (JSONObject) data.get("content");
      }
      if (content == null)
      {
        content = JSONObject.parse(SheetContent);
      }

      // parse sheet name
      if (data != null)
      {
        JSONObject meta = (JSONObject) content.get(ConversionConstant.META);
        JSONObject sheets = (JSONObject) meta.get(ConversionConstant.SHEETS);
        // 3 sheets
        for (int i = 0; i < 3; i++)
        {
          String key = ConversionConstant.ST + i;
          JSONObject sheet = (JSONObject) sheets.get(key);
          Object o = data.get(key);
          if (o != null)
          {
            sheet.put(ConversionConstant.SHEETNAME, o);
          }
        }
        
        // put spreadsheet document locale info to meta
        String locale = (String)data.get(ConversionConstant.LOCALE);
        if(null != locale)
            meta.put(ConversionConstant.LOCALE, locale.replace("_", "-"));
        else
        {
            meta.put(ConversionConstant.LOCALE, "en-us");
            locale = "en-us";
        }
        
        // put spreadsheet document font info to meta
        String fontName = (String)data.get(ConversionConstant.FONT);
        if (fontName != null) {
            JSONObject sheetContent = (JSONObject)content.get(ConversionConstant.CONTENT);
            JSONObject styles = (JSONObject)sheetContent.get(ConversionConstant.STYLES);
            JSONObject defaultCellStyle = (JSONObject)styles.get(ConversionConstant.DEFAULT_CELL_STYLE);
            JSONObject font = (JSONObject)defaultCellStyle.get(ConversionConstant.FONT);
            font.put(ConversionConstant.FONTNAME, fontName);
        }
        
        String templateId = (String) data.get("templateId");
        if (null != templateId)
        {
          String templateFolder = "/com/ibm/concord/spreadsheet/templates/";
          locale = locale.toLowerCase();
          String templatePath = templateFolder + locale + "/" + templateId.toLowerCase() + ".js";
          InputStream in = getClass().getResourceAsStream(templatePath);
          if(null == in)
          {
            LOG.info("get file in " + templatePath + "failed");
            String[] array = locale.split("-");
            if(array.length > 1)
            {
              String lang = array[0];
              if(null != lang)
                in =  getClass().getResourceAsStream(templateFolder + lang + "/" + templateId.toLowerCase() + ".js");
            }  
          }  
          if(null == in)
          {
            templatePath =  "/com/ibm/concord/spreadsheet/templates/en-us/" + templateId.toLowerCase() + ".js";
            LOG.info("get file in " + templatePath  + "again");
            in = getClass().getResourceAsStream(templatePath);
          }  
          if (in != null)
          {
            JSONObject templateJson = JSONObject.parse(in);
            if (templateJson != null)
              content = templateJson;
            //update template locale with value retrived from meta.js
            JSONObject tplMeta = (JSONObject) content.get("meta");
            tplMeta.put(ConversionConstant.LOCALE, data.get(ConversionConstant.LOCALE));
          }
        }
      }

      createBlankDocument(content, concordFolder);
    }
    catch (IOException e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("io error when creating template document");
      throw dse;
    }
  }
  
  public String getSubmittedContent(String content)
  {
    return content;
  }

  /*
   * before clear up, the message would be apply
   * however, if the user offline for a while( debug and no response to the sever), then the sever would delte the recover.js
   * and then reconnect to the sever, want to read the recover.js, then would have error....
   */
  public void clearup(DraftDescriptor draftDes)
  {
    try
    {
      String baseUri = draftDes.getURI();
      //clean recover doc storage
      String recoverUri = baseUri + File.separator + "recover_content.js";
      File recoverFile = new File(recoverUri);
      if(recoverFile.exists())
      {
        recoverFile.delete();
        recoverUri = baseUri + File.separator + "recover_meta.js";
        recoverFile = new File(recoverUri);
        if(recoverFile.exists())
          recoverFile.delete();
        recoverUri = baseUri + File.separator + "recover_reference.js";
        recoverFile = new File(recoverUri);
        if(recoverFile.exists())
          recoverFile.delete();
        recoverUri = baseUri + File.separator + "recover_preserve.js";
        recoverFile = new File(recoverUri);
        if(recoverFile.exists())
          recoverFile.delete();
      }
      if(SpreadsheetConfig.getDebugEnabled())
      {
        //old model
        String dltFileUri = baseUri + File.separator + "recover.js";
        File file = new File(dltFileUri);
        if(file.exists())
          file.delete();
      }
      
      ImageDeserializer.cleanUselessImages(baseUri);
      
      //the server sequence will be reset when clearup(due to close session)
      // so the sequence of calc thread will be out of date, so do not keep it
      Transformer.deleteCalc(draftDes);
    }
    catch(Exception e)
    {
      LOG.log(Level.WARNING, "error happened in clear the recover.js ", e);
    }
  }
  
  protected void cleanHeadlessImage(IDocumentEntry docEntry, UserBean caller)
  {
    /* 
     * TODO, parse your document draft files to collect all zero reference images files, and delete them from draft.
     * 
     * The API of discard draft image attachments should be performed like below: 
     * 
     * DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
     * SectionDescriptor sectionDesp = new SectionDescriptor(draftDesp, DraftSection.getPictureSection("image_file_name.jpg"));
     * try
     * {
     *  JSONArray pictures = DraftStorageManager.getDraftStorageManager().listDraftSections(draftDesp, DraftSection.getPictureSection(null));
     *  DraftStorageManager.getDraftStorageManager().discardSection(sectionDesp);
     * }
     * catch (DraftStorageAccessException e)
     * {
     *  // Handle exception.
     * }
     * catch (DraftDataAccessException e)
     * {
     *  // Handle exception.
     * }
     */

    ;
  }
 
  @Override
  protected void cleanTaskCommentsFromContent(File concordFolder)
  {
    File contentFile = new File(concordFolder, "content.js");
    try
    {
      FileInputStream fin = new FileInputStream(contentFile);
      JSONObject content = JSONObject.parse(fin);
      fin.close();
      
      boolean bUpdated = false;
      // remove task ranges
      JSONObject unnamesJSON = (JSONObject)content.get(ConversionConstant.UNNAME_RANGE);
      if (unnamesJSON != null)
      {
        Iterator<String> unnameIter = unnamesJSON.keySet().iterator();
        JSONObject unnamesJSON2 = new JSONObject();
        while(unnameIter.hasNext())
        {
          String rangeId = unnameIter.next();
          JSONObject unnameJSON = (JSONObject) unnamesJSON.get(rangeId);
          if (unnameJSON.containsKey(ConversionConstant.RANGE_USAGE))
          {
            String usage = (String) unnameJSON.get(ConversionConstant.RANGE_USAGE);
            RangeUsage usageType = RangeUsage.enumValueOf(usage);
            if (usageType != RangeUsage.TASK && usageType != RangeUsage.COMMENT)
              unnamesJSON2.put(rangeId, unnameJSON);
            else
              bUpdated = true;
          }
        }
        
        if (bUpdated)
          content.put(ConversionConstant.UNNAME_RANGE, unnamesJSON2);
      }
      
      // write back to content.js
      if (bUpdated){
        FileOutputStream fos = new FileOutputStream(contentFile);
        content.serialize(fos);
        fos.close();
      }
      // for spreadsheet doc, it has another place to store comments. Also need delete
      File spreadsheet_commentsFile = new File(concordFolder, "comments.js");
      cleanCommentsDataFromFile(spreadsheet_commentsFile);
      
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "io error when cleaning task", e);
    }
  }
  
  public void processLeaveData(UserBean caller, String docId, JSONObject data)
  {
    try
    {
      if(data==null)
        return;
      
      String lastVisitSheet = (String)data.get("leftSheet");
      if(lastVisitSheet==null)
        return;
      
      IUserDocCacheDAO dao = (IUserDocCacheDAO)Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IUserDocCacheDAO.class);
      UserDocCacheBean bean = dao.getCacheValue(caller.getId(), docId, "sheet");
      if(bean==null)
      {
        bean = new UserDocCacheBean();
        bean.setUserId(caller.getId());
        bean.setDocId(docId);
        bean.setCacheKey("sheet");
        bean.setCacheValue(lastVisitSheet);
        dao.add(bean);
      }
      else
      {
        if(!bean.getCacheValue().equals(lastVisitSheet))
        {
          bean.setCacheValue(lastVisitSheet);
          dao.update(bean);
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when process spreadsheet leave data", e);
    }
  }
  
  @Override
  public String getDraftFormatVersion()
  {
    return DRAFT_FORMAT_VERSION;
  }

  @Override
  protected String getServiceName()
  {
	return "sheet";
  }

  @Override
  protected JSONObject exceedContentLimit(File file, String mimeType, boolean bMobile) throws Exception
  {
    JSONObject json = new JSONObject();
    json.put("result", "false");
    return json;
  }
  
  public void preSaveDraft(DraftDescriptor draftDescriptor)
  {
    Transformer.checkCalcResult(draftDescriptor);
  }
  
  /**
   * Do something after save draft
   * For spreadsheet, it will start calculation on node.js
   * @param draftDescriptor
   */
  @Override
  public void postSaveDraft(DraftDescriptor draftDescriptor, long savedSequence)
  {
    try
    {
      Transformer.calc(draftDescriptor, null, null, false, savedSequence);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error when start nodejs calculation after save draft", e);
    }
  }
  
  /**
   * Do something before publish/saveas 
   * It will return before calculation done or timeout
   * @param draftDescriptor
   */
  public void prePublish(DraftDescriptor draftDescriptor, IDocumentEntry docEntry, File convertFolder)
  {
    if(!SpreadsheetConfig.hasNodeJSEnabled())
      return;
    //first get the current job id
    String calcPath = null;
    int maxTryNum = 60;
    int timeInterval = 1000;
    int triedNum = 0;
    try
    {
      JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDescriptor);
      String mediaURI = docEntry.getDocUri();
      String mimeType = docEntry.getMimeType();
      long draftModified = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey())).getTime();
      String uuid = ConcordUtil.generateMD5Id(mediaURI + draftModified + mimeType);
      SessionManager mgr = SessionManager.getInstance();
      DocumentSession docSess = mgr.getSession(draftDescriptor.getRepository(), draftDescriptor.getDocId());
      long sequence = -1;
      if(docSess != null)
        sequence = docSess.getSavedSeq();
      
      calcPath = Transformer.calc(draftDescriptor, uuid, convertFolder, true, sequence);
    
      //sync get calculation result
      if(calcPath != null)
      {
        //check if calc.json is there, if yes, copy it to draft media
        File calcFolder = new File(calcPath);
        CALCSTATUS status = Transformer.getCalcStatus(calcFolder, draftDescriptor);
        
        while(triedNum++ < maxTryNum && status == CALCSTATUS.NOT_COMPLETE)
        {
          try
          {
            Thread.sleep(timeInterval);
          }
          catch (InterruptedException e)
          {
            LOG.log(Level.WARNING, "Thread is interrupted abnormaly.", e);
          }
          status = Transformer.getCalcStatus(calcFolder, draftDescriptor);
        }
        
        if(status == CALCSTATUS.SUCC || status == CALCSTATUS.SUCC_SAME_SEQUENCE)
        {
          // copy the draft with calculation result to the conversion folder
          FileUtil.nfs_copyDirToDir(calcFolder, convertFolder, FileUtil.NFS_RETRY_SECONDS);
        }
      }
      else
      {
        LOG.log(Level.WARNING, "NodeJS Action: Do nothing before publish, the draft does not contain the caluclate value");
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error when start nodejs calculation before publish", e);
    }
  }
  
  @Override
  public boolean isDraftNeedFix(DraftDescriptor draftDes, JSONObject document)
  {
    return false;
  }

  @Override
  public JSONObject fixDraft(DraftDescriptor draftDescriptor, JSONObject document)
  {
    return document;
  }

  @Override
  public Map<String, JSONObject> getFixedDraftSectionPair(DraftDescriptor draftDescriptor, JSONObject document)
  {
    return null;
  }

  @Override
  public IDraftJSONObjectSerializer getJSONSerializer()
  {
    return null;
  }

}
