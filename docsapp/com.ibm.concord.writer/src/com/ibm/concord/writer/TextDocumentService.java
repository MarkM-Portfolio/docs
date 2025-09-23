/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.writer;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.common.AbstractDocumentService;
import com.ibm.concord.document.common.util.DOMIdGenerator;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.conversion.ConversionComponentImpl;
import com.ibm.concord.platform.conversion.IConversionService;
import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.Participant;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.draft.IDraftJSONObjectSerializer;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.concord.writer.message.OTService;
import com.ibm.concord.writer.message.Transformer;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.docs.entitlement.gatekeeper.IGateKeeperService;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class TextDocumentService extends AbstractDocumentService
{
  private static final Logger LOG = Logger.getLogger(TextDocumentService.class.getName());

  // Here 'langclass_pending' class indicate the class of lang is pending now, waiting input at browser side.
  // private static final String EMPTY_TEXT_TEMPLATE =
  // "<html><head></head><body class=\"langclass_pending concord_Doc_Style_1\"><p><br class=\"hideInIE\"></p></body></html>";

  private static final String ODT_MIMETYPE = Platform.getMimeType(".odt");

  private static final String OTT_MIMETYPE = Platform.getMimeType(".ott");

  private static final String DOC_MIMETYPE = Platform.getMimeType(".doc");

  private static final String PDF_MIMETYPE = Platform.getMimeType(".pdf");

  private static final String DOCX_MIMETYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  private static final String HTML_MIMETYPE = "text/html";

  private static final String JSON_MIMETYPE = "application/json";

  private static final String DRAFT_FORMAT_VERSION = "1.2.0";

  // protected final static String CONTENT_HTML_FILE = "content.html";

  private final static String LOCALE = "locale";

  private static List<String> PRESERVED_FILE_LIST = new ArrayList<String>(1);

  // No Picture
  protected static String[] TEMPLATE_FILE = { "content", "numbering", "relations", "settings", "styles" };

  static
  {
    PRESERVED_FILE_LIST.add("content.html");
    // PRESERVED_FILE_LIST.add("Reserved/notify.json");
    PRESERVED_FILE_LIST.add("Reserved/comments.json");
    PRESERVED_FILE_LIST.add("draft.lck");
    PRESERVED_FILE_LIST.add("indextable");
    PRESERVED_FILE_LIST.add("meta.json");
    PRESERVED_FILE_LIST.add("msg.json");
    PRESERVED_FILE_LIST.add("state.0");
    PRESERVED_FILE_LIST.add("state.1");
    PRESERVED_FILE_LIST.add("state.2");
  }

  private static final String track_change_check_time = "docsTrackChangeCheckTime";

  private static final String track_change_on_time = "docsTrackChangeOnTime";

  private static long track_change_check_duration = 2 * 24 * 60 * 60 * 1000l; // if we checked 2 days ago, then we abort it.

  private static long track_change_check_live_days = -1; // default value;

  public TextDocumentService()
  {
    exportFormats.add(PDF_MIMETYPE);
    // exportFormats.add(HTML_MIMETYPE);
    exportFormats.add(DOC_MIMETYPE);
    exportFormats.add(DOCX_MIMETYPE);

    exportSourceFormats.add(ODT_MIMETYPE);
    exportSourceFormats.add(OTT_MIMETYPE);
    exportSourceFormats.add(DOC_MIMETYPE);
    exportSourceFormats.add(DOCX_MIMETYPE);

    format2Extension.put(MS_FORMAT_MANE, "docx");
    format2Extension.put(ODF_FORMAT_NAME, "odt");
    format2Mimetype.put(MS_FORMAT_MANE, DOCX_MIMETYPE);
    format2Mimetype.put(ODF_FORMAT_NAME, ODT_MIMETYPE);
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
    else if (mode != null && mode.equalsIgnoreCase("rte")) 
    {
      request.getRequestDispatcher("/WEB-INF/pages/apprichtext.jsp").forward(request, response);
    }
    else if (isMobileRequest(request))
    {
      request.getRequestDispatcher("/WEB-INF/pages/mobiletext.jsp").forward(request, response);
    }
    else
    {
      request.getRequestDispatcher("/WEB-INF/pages/apptext.jsp").forward(request, response);
    }
  }

  public void forwardViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    // TODO HTML Viewer
    request.getRequestDispatcher("/jsp/view_text.jsp").forward(request, response);
  }

  public void forwardRevisionViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    request.getRequestDispatcher("/WEB-INF/pages/revapptext.jsp").forward(request, response);
  }

  protected void applyMessageFiltered(DraftDescriptor draftDes, JSONArray msgList, boolean isClosed) throws Exception
  {
    Transformer.flushMessage(draftDes, msgList);
  }

  /**
   * Each document service implementation store their current state to a specified folder
   * 
   * @param toFolder
   *          folder where to store
   * @param contentState
   *          contains the state of the document
   * @throws Exception
   */
  protected void storeStateTo(File toFolder, JSONObject contentState) throws Exception
  {
    FileOutputStream fos = null;
    try
    {
      // 1. content.json
      JSONObject contentJson = (JSONObject) contentState.get("content"); // Must have content.json
      fos = new FileOutputStream(new File(toFolder + File.separator + WriterDocumentModel.CONTENT_FILE));
      contentJson.serialize(fos);
      fos.close();

      // 2. styles.json
      JSONObject stylesJson = (JSONObject) contentState.get("styles");
      if (stylesJson != null)
      {
        fos = new FileOutputStream(new File(toFolder + File.separator + WriterDocumentModel.STYLES_FILE));
        stylesJson.serialize(fos);
        fos.close();
      }

      // 3. settings.json
      JSONObject settingsJson = (JSONObject) contentState.get("settings");
      if (settingsJson != null)
      {
        fos = new FileOutputStream(new File(toFolder + File.separator + WriterDocumentModel.SETTINGS_FILE));
        settingsJson.serialize(fos);
        fos.close();
      }

      // 4. numbering.json
      JSONObject numberingJson = (JSONObject) contentState.get("numbering");
      if (numberingJson != null)
      {
        fos = new FileOutputStream(new File(toFolder + File.separator + WriterDocumentModel.NUMBERING_FILE));
        numberingJson.serialize(fos);
        fos.close();
      }

      // 5. relations.json
      JSONObject relationsJson = (JSONObject) contentState.get("relations");
      if (relationsJson != null)
      {
        fos = new FileOutputStream(new File(toFolder + File.separator + WriterDocumentModel.RELATIONS_FILE));
        relationsJson.serialize(fos);
        fos.close();
      }

      // 6. meta.json
      JSONObject metaJson = (JSONObject) contentState.get("meta");
      if (metaJson != null)
      {
        fos = new FileOutputStream(new File(toFolder + File.separator + WriterDocumentModel.META_FILE));
        metaJson.serialize(fos);
        fos.close();
      }

      // 7. nsDef.json
      JSONObject nsDefJson = (JSONObject) contentState.get("nsDef");
      if (nsDefJson != null)
      {
        fos = new FileOutputStream(new File(toFolder + File.separator + WriterDocumentModel.NSDEF_FILE));
        nsDefJson.serialize(fos);
        fos.close();
      }
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
        fos.close();
    }
  }

  protected File localizePublishedContent(File contentDir)
  {
    // File contentFile = new File(contentDir, "content.html");
    // String content = getContent(contentFile);
    // Draft2HtmlLocalizer.localizePublishedContent(contentFile, content);
    // return contentFile;
    return null;
  }

  protected String convert(String path, String sourceType, String targetType, String targetPath, Map<String, Object> options)
      throws ConversionException, UnsupportedMimeTypeException
  {
    if (sourceType.equals(JSON_MIMETYPE) && (targetType.equals(PDF_MIMETYPE)))
    {
      IConversionService cvtService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
          IConversionService.class);
      String resultPath = cvtService.convert(path, JSON_MIMETYPE, ODT_MIMETYPE, path, options);
      resultPath = cvtService.convert(resultPath, ODT_MIMETYPE, targetType, targetPath, options);
      return resultPath;
    }
    else
      return super.convert(path, sourceType, targetType, targetPath, options);
  }

  public List<String> getPreservedFileNameList()
  {
    return PRESERVED_FILE_LIST;
  }

  public TransformResult transformMessage(JSONObject msg, JSONArray baseMsgList, Object OTContext)
  {
    if (baseMsgList.size() == 0)
      return TransformResult.ACCEPT;
    return OTService.transform(msg, baseMsgList);
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

  protected JSONObject getCurrentStateFiltered(DraftDescriptor draftDes, JSONArray msgList, JSONObject criteria) throws Exception
  {
    return getCurrentStateJSON(draftDes, msgList);
  }

  public boolean setDocument(DraftDescriptor draftDes, JSONObject state)
  {
    // String content = (String) state.get("html");
    // try
    // {
    // DocumentServiceUtil.storeSubFile(draftDes, CONTENT_HTML_FILE, content.getBytes("UTF-8"));
    // }
    // catch (UnsupportedEncodingException e)
    // {
    // e.printStackTrace();
    // return false;
    // }
    // catch (IOException e)
    // {
    // e.printStackTrace();
    // return false;
    // }
    // catch (ConcordException e)
    // {
    // e.printStackTrace();
    // return false;
    // }
    return true;
  }

  protected String getMimeType()
  {
    return DOCX_MIMETYPE;
  }

  protected String getTargetMimeType()
  {
    // return HTML_MIMETYPE;
    return JSON_MIMETYPE;
  }

  protected String getTemplateMimeType()
  {
    return OTT_MIMETYPE;
  }

  protected String getTemplateExtension()
  {
    return "ott";
  }

  protected String getExtension()
  {
    return "docx";
  }

  private String updateId(String content)
  {
    String prefix = "id_";
    String idPlaceHold = "id_0000000000000";
    while (content != null && content.indexOf(idPlaceHold) != -1)
    {
      String newId = DOMIdGenerator.generate(prefix);
      content = content.replace(idPlaceHold, newId);
    }
    return content;
  }

  protected void createTemplateDocument(JSONObject data, File concordFolder) throws DocumentServiceException
  {
    FileOutputStream cos = null;
    try
    {
      JSONObject content = null;
      if (data != null && data.get("content") != null)
      {
        Object o = data.get("content");
        if (o instanceof JSONObject)
          content = (JSONObject) data.get("content");
        else if (o instanceof String)
          content = JSONObject.parse((String) o);
        if (content != null)
        {
          if (content.get("content") == null)
            content = null;
        }
      }

      // Get content from template.
      if (content == null)
      {
        String templateFolder = "/docTemplates/";
        String templateName = (data == null) ? null : (String) data.get("templateId");
        if (templateName == null)
          templateFolder += "defalut/template.json";
        else
        {
          String locale = (String) data.get(LOCALE);
          if (null != locale)
            locale = locale.replace("_", "-");
          else
            locale = "en-us";
          templateFolder += locale + "/" + templateName + ".json";
        }

        InputStream templateStream = TextDocumentService.class.getResourceAsStream(templateFolder);
        if (templateStream == null)
          templateStream = TextDocumentService.class.getResourceAsStream("/docTemplates/default/template.json");

        if (templateStream != null)
          content = JSONObject.parse(templateStream);
      }

      for (int i = 0; i < TextDocumentService.TEMPLATE_FILE.length; i++)
      {
        JSONObject obj = (JSONObject) content.get(TextDocumentService.TEMPLATE_FILE[i]);
        if (obj != null)
        {
          File newFile = new File(concordFolder, TextDocumentService.TEMPLATE_FILE[i] + ".json");
          if (!newFile.exists())
            newFile.createNewFile();
          cos = new FileOutputStream(newFile);
          String str = obj.toString();
          str = updateId(str);
          cos.write(str.getBytes());
          // obj.serialize(cos);
          cos.close();
        }
      }
    }
    catch (IOException e)
    {
      if (cos != null)
        try
        {
          cos.close();
        }
        catch (IOException e1)
        {
          // TODO Auto-generated catch block
          e1.printStackTrace();
        }

      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("io error when creating template document");
      throw dse;
    }
  }

  protected void cleanHeadlessImage(IDocumentEntry docEntry, UserBean caller)
  {
    /*
     * TODO, parse your document draft files to collect all zero reference images files, and delete them from draft.
     * 
     * The API of discard draft image attachments should be performed like below:
     * 
     * DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(caller, docEntry); SectionDescriptor sectionDesp = new
     * SectionDescriptor(draftDesp, DraftSection.getPictureSection("image_file_name.jpg")); try { JSONArray pictures =
     * DraftStorageManager.getDraftStorageManager().listDraftSections(draftDesp, DraftSection.getPictureSection(null));
     * DraftStorageManager.getDraftStorageManager().discardSection(sectionDesp); } catch (DraftStorageAccessException e) { // Handle
     * exception. } catch (DraftDataAccessException e) { // Handle exception. }
     */
    ;
  }

  public boolean isTransformCandidate(JSONObject baseMsg, JSONObject msg)
  {
    String clientId1 = (String) baseMsg.get("client_id");
    String clientId2 = (String) msg.get("client_id");
    // String baseType = (String) baseMsg.get("type");
    if (!clientId1.equals(clientId2))
    {
      return true;
    }
    // else if (baseType.equalsIgnoreCase(MessageHelper.SPLIT) || baseType.equalsIgnoreCase(MessageHelper.JOIN))
    // {
    // return true;
    // }
    return false;
  }

  @Override
  public String getDraftFormatVersion()
  {
    return DRAFT_FORMAT_VERSION;
  }

  @Override
  protected String getServiceName()
  {
    return "text";
  }

  public JSONObject getSection(DraftDescriptor draftDes, JSONArray msgList, String sectionId, String masterDoc)
  {
    // TODO Auto-generated method stub
    // For work privately document.
    return null;
  }

  public String getSubmittedContent(String content)
  {
    // TODO Auto-generated method stub
    // For work privately document.
    return null;
  }

  @Override
  protected void cleanTaskCommentsFromContent(File concordFolder)
  {
    // TODO Auto-generated method stub
    // Need clean task assignment, not comments.
  }

  private boolean isMobileRequest(HttpServletRequest request)
  {
    String ua = request.getHeader("User-Agent");
    ua = ua != null ? ua.toLowerCase() : null;
    if (ua == null)
      return false;
    if (ua.indexOf("ipad") != -1 && ua.indexOf("mobile") != -1 && ua.indexOf("safari") == -1)
    {
      return true;
    }
    return false;
  }

  @Override
  public boolean isDraftNeedFix(DraftDescriptor draftDes, JSONObject document)
  {
    DocumentSession docSess = SessionManager.getInstance().getSession(draftDes.getRepository(), draftDes.getDocId());
    if (docSess.isCoEditing())
      return false;

    JSONObject settings = (JSONObject) document.get("settings");

    if (!settings.containsKey(track_change_on_time))
      return false;

    boolean isGateKeeperOff = isTrackChangeGateKeeperOff(draftDes);

    if (isGateKeeperOff)
      return true;

    long trackChangeOnTime = Long.parseLong(settings.get(track_change_on_time).toString());
    if (System.currentTimeMillis() - trackChangeOnTime < track_change_check_duration)
      return false;

    boolean toRemoveAgedChanges = false;

    if (settings.containsKey(track_change_check_time))
    {
      long lastTrackChangeCheckTime = Long.parseLong(settings.get(track_change_check_time).toString());
      if (System.currentTimeMillis() - lastTrackChangeCheckTime > track_change_check_duration)
        toRemoveAgedChanges = true;
    }
    else
      toRemoveAgedChanges = true;
    // System.out.println("toRemoveAgedChanges " + toRemoveAgedChanges);
    return toRemoveAgedChanges;
  }

  @Override
  public JSONObject fixDraft(DraftDescriptor draftDes, JSONObject document)
  {
    JSONObject content = (JSONObject) document.get("content");
    JSONObject settings = (JSONObject) document.get("settings");

    long liveTime = 0;
    boolean isGateKeeperOff = isTrackChangeGateKeeperOff(draftDes);
    boolean toClean = true;
    if (!isGateKeeperOff)
    {
      long days = getDocTrackChangeGateKeeperLiveDays(draftDes);
      if (days >= 0)
        liveTime = days * 24 * 60 * 60 * 1000l;
      else
        toClean = false;
      settings.put(track_change_check_time, System.currentTimeMillis() + "");
    }
    else
    {
      settings.remove(track_change_check_time);
      settings.remove(track_change_on_time);
    }
    if (toClean)
    {
      JSONArray body = (JSONArray) content.get("body");
      if (isGateKeeperOff)
        TrackChangeCleaner.clean(body, 0);
      else
        TrackChangeCleaner.clean(body, System.currentTimeMillis() - liveTime); // remove changes happens 30 days ago.
      if (body.isEmpty())
      {
        body.add(ModelObject.createEmptyParagraph());
      }
      content.put("body", body);
    }
    return document;
  }

  private long getDocTrackChangeGateKeeperLiveDays(DraftDescriptor draftDes)
  {
    IGateKeeperService gkService = (IGateKeeperService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
        IGateKeeperService.class);
    DocumentSession docSess = SessionManager.getInstance().getSession(draftDes.getRepository(), draftDes.getDocId());
    Participant[] ps = docSess.getParticipants();
    try
    {
      for (Participant p : ps)
      {
        UserBean ub = p.getUserBean();
        JSONObject features = gkService.getUserFeatures(ub);
        if (features != null && features.containsKey("DocTrackChange"))
        {
          JSONObject jo = (JSONObject) features.get("DocTrackChange");
          Object obj = jo.get("featureDetail");
          if (obj != null)
          {
            JSONObject json = JSONObject.parse(obj.toString());
            if (json != null)
              return Long.parseLong(json.get("liveDays").toString());
          }
        }
        break;
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "==Get GateKeeper: DocTrackChange error: ", ex);
    }

    return track_change_check_live_days;
  }

  private boolean isTrackChangeGateKeeperOff(DraftDescriptor draftDes)
  {
    boolean isGateKeeperOff = false;
    IGateKeeperService gkService = (IGateKeeperService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
        IGateKeeperService.class);
    DocumentSession docSess = SessionManager.getInstance().getSession(draftDes.getRepository(), draftDes.getDocId());
    Participant[] ps = docSess.getParticipants();
    try
    {
      for (Participant p : ps)
      {
        UserBean ub = p.getUserBean();
        JSONObject features = gkService.getUserFeatures(ub);
        if (features != null && features.containsKey("DocTrackChange"))
        {
          JSONObject jo = (JSONObject) features.get("DocTrackChange");
          Object obj = jo.get("enabled");
          if (obj != null && obj.toString().equals("false"))
          {
            isGateKeeperOff = true;
            break;
          }
        }
      }
    }
    catch (Exception ex)
    {

    }
    return isGateKeeperOff;
  }

  @Override
  public Map<String, JSONObject> getFixedDraftSectionPair(DraftDescriptor draftDescriptor, JSONObject document)
  {
    String ds = WriterDocumentModel.CONTENT_FILE;
    String ds2 = WriterDocumentModel.SETTINGS_FILE;
    Map<String, JSONObject> map = new HashMap<String, JSONObject>();
    map.put(ds, (JSONObject) document.get("content"));
    map.put(ds2, (JSONObject) document.get("settings"));
    return map;
  }

  @Override
  public IDraftJSONObjectSerializer getJSONSerializer()
  {
    return new WriterDraftSerializer();
  }

  @Override
  protected void disableAndCleanTrackChange(File concordFolder)
  {
    File contentFile = new File(concordFolder, "content.json");
    File settingsFile = new File(concordFolder, "settings.json");
    try
    {
      FileInputStream fin = new FileInputStream(contentFile);
      JSONObject content = JSONObject.parse(fin);
      fin.close();
      
      FileInputStream fin2 = new FileInputStream(settingsFile);
      JSONObject settings = JSONObject.parse(fin2);
      fin2.close();
      
      settings.remove(track_change_check_time);
      settings.remove(track_change_on_time);
      
      JSONArray body = (JSONArray) content.get("body");
      if (body != null)
      {
        TrackChangeCleaner.clean(body, 0);
        if (body.isEmpty())
        {
          body.add(ModelObject.createEmptyParagraph());
        }
        content.put("body", body);
      }
      
      FileOutputStream fos = new FileOutputStream(contentFile);
      content.serialize(fos);
      fos.close();
      
      FileOutputStream fos2 = new FileOutputStream(settingsFile);
      settings.serialize(fos2);
      fos2.close();
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "io error when cleaning task", e);
    }
  }
}
