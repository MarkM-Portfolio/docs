/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.presentation;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;

import com.ibm.concord.document.common.AbstractDocumentService;
import com.ibm.concord.document.common.util.Operation;
import com.ibm.concord.document.common.util.XHTMLDomUtil;
import com.ibm.concord.document.common.util.XHTMLTransformer;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobContext;
import com.ibm.concord.job.JobListener;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.conversion.ConversionComponentImpl;
import com.ibm.concord.platform.conversion.IConversionService;
import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.exceptions.OutOfCapacityException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.JTidyUtil;
import com.ibm.concord.presentation.common.DraftDomFixer;
import com.ibm.concord.presentation.common.DraftJSONConverter;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.draft.IDraftJSONObjectSerializer;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.security.ACFUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class PresentationDocumentService extends AbstractDocumentService
{
  private static final String CLASS = PresentationDocumentService.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  private final static String CONTENT_HTML_FILE = "content.html";

  private static final String ODP_MIMETYPE = "application/vnd.oasis.opendocument.presentation";

  private static final String PDF_MIMETYPE = Platform.getMimeType(".pdf");

  private static final String OTP_MIMETYPE = Platform.getMimeType(".otp");

  private static final String PPT_MIMETYPE = Platform.getMimeType(".ppt");

  private static final String PPTX_MIMETYPE = Platform.getMimeType(".pptx");

  private static final String HTML_MIMETYPE = "text/html";

  private static final String DRAFT_FORMAT_VERSION = "1.1.1";

  private static final String PARTIAL_FLAG = "inPartial";

  private static final String INIT_SLIDE = "initSlide";

  private static final String CHUNK_ID = "chunkId";

  private static final String PARTIAL_DIR = "partial.loading";

  private static final String SPLIT_COST = "splitCost";

  private static final String CONTENT_FILE_NAME = "moreContent.html";

  private static final String CONTENT_JSON_FILE_NAME = "moreContent.json";

  private static List<String> PRESERVED_FILE_LIST = new ArrayList<String>(1);

  private static final String PRESERVATION_SUFFIX = "-IBMDocs.png";

  private static final String SVG_FILE_SUFFIX = ".svg";

  private static final String SLIDE_TOKEN = "class=\"slideWrapper";

  private static final String IMAGE_TOKEN = "<img";

  private static final String SVG_TOKEN = "<svg";

  private static final String SRC_TOKEN = "src=\"";

  private static final String QUOTE_TOKEN = "\"";

  private static ContentSavingJobListener chunkJobListner;

  private static FixDomContentJobListener fixDomJobListner;

  private static JSONObject oTContext = new JSONObject();

  private String docURLPath = "";

  static
  {
    PRESERVED_FILE_LIST.add("content.html");
    chunkJobListner = new ContentSavingJobListener();
    fixDomJobListner = new FixDomContentJobListener();
  }

  public PresentationDocumentService()
  {
    exportFormats.add(PDF_MIMETYPE);
    exportFormats.add(HTML_MIMETYPE);
    exportFormats.add(PPT_MIMETYPE);

    exportSourceFormats.add(ODP_MIMETYPE);
    exportSourceFormats.add(OTP_MIMETYPE);
    exportSourceFormats.add(PPT_MIMETYPE);
    exportSourceFormats.add(PPTX_MIMETYPE);

    format2Extension.put(MS_FORMAT_MANE, "pptx");
    format2Extension.put(ODF_FORMAT_NAME, "odp");
    format2Mimetype.put(MS_FORMAT_MANE, PPTX_MIMETYPE);
    format2Mimetype.put(ODF_FORMAT_NAME, ODP_MIMETYPE);
  }

  public void init(JSONObject config)
  {
    super.init(config);
  }
  
  @Override
  protected void disableAndCleanTrackChange(File folder){};

  public void forwardEditPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    Object editRepo = request.getAttribute("editFromRepository");
    if (editRepo != null && editRepo.toString().equalsIgnoreCase("true"))
    {
      LOG.log(Level.INFO, "Does not set odfdraft for new imported pptx file...");
    }
    else
    {
      DraftDescriptor draftDesc = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
      File odfDraft = new File(draftDesc.getURI(), "odfdraft");
      if (odfDraft.exists())
      {
        request.setAttribute("odfdraft", true);
      }
    }
    docURLPath = request.getContextPath() + ConcordUtil.getStaticRootPath();
    // slide show will be redirected to slideShow.jsp, where also need to
    // support relative url
    String mode = request.getParameter("mode");
    if (mode != null && mode.equalsIgnoreCase("slideshow"))
    {
      request.getRequestDispatcher("/jsp/slideShow.jsp").forward(request, response);
    }
    else if (mode != null && mode.equalsIgnoreCase("htmlprint"))
    {
      request.getRequestDispatcher("/jsp/viewPresForHtmlPrint.jsp").forward(request, response);
    }
    else
    {
       request.getRequestDispatcher("/WEB-INF/pages/apppres.jsp").forward(request, response);
    }
  }

  public void forwardViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    docURLPath = request.getContextPath() + ConcordUtil.getStaticRootPath();
    // slide show will be redirected to slideShow.jsp, where also need to
    // support relative url
    String mode = request.getParameter("mode");
    if (mode != null && mode.equalsIgnoreCase("slideshow"))
    {
      request.getRequestDispatcher("/jsp/slideShow.jsp").forward(request, response);
    }
    else if (mode != null && mode.equalsIgnoreCase("htmlprint"))
    {
      request.getRequestDispatcher("/jsp/viewPresForHtmlPrint.jsp").forward(request, response);
    }
    else
    {
      request.getRequestDispatcher("/WEB-INF/pages/apppres.jsp").forward(request, response);
    }
  }

  public void forwardRevisionViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException
  {
    request.getRequestDispatcher("/WEB-INF/pages/revapppres.jsp").forward(request, response);
  }

  protected void applyMessageFiltered(DraftDescriptor draftDes, JSONArray msgList, boolean isClosed) throws Exception
  {
    this.applyXHTMLMessage(draftDes, msgList);

  }

  private String getFileString(String path)
  {
    InputStream is = null;
    BufferedReader br = null;

    String line = "";
    StringBuffer buf = new StringBuffer();
    try
    {
      is = getClass().getResourceAsStream(path);
      br = new BufferedReader(new InputStreamReader(is, "UTF-8"));

      while ((line = br.readLine()) != null)
        buf.append(line);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception while reading file", e);
    }
    finally
    {
      closeResource(is);
      closeResource(br);
    }
    return buf.toString();
  }

  public List<String> getPreservedFileNameList()
  {
    return PRESERVED_FILE_LIST;
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
    String html = (String) contentState.get("html");
    FileOutputStream fos = null;
    BufferedWriter writer = null;
    try
    {
      fos = new FileOutputStream(new File(toFolder + File.separator + "content.html"));
      writer = new BufferedWriter(new OutputStreamWriter(fos, "UTF8"));
      writer.write(html);
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.WARNING, "File not found", e);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "I/O error while writing content", e);
    }
    finally
    {
      closeResource(writer);
      closeResource(fos);
    }
  }

  protected File localizePublishedContent(File contentDir)
  {
    File contentFile = new File(contentDir, "content.html");
    String content = getContent(contentFile);
    // D28056: [Chrome][Regression] Every slide has redundant char of
    // previous slide in exported pdf.
    char a = 65279;
    content = content.replace(String.valueOf(a), "");
    Draft2HtmlLocalizer.localizePublishedContent(contentFile, content);
    return contentFile;
  }

  protected String convert(String path, String sourceType, String targetType, String targetPath, Map<String, Object> options)
      throws ConversionException, UnsupportedMimeTypeException
  {
    // D28056: [Chrome][Regression] Every slide has redundant char of
    // previous slide in exported pdf.
    File contentFile = new File(path, "content.html");
    String content = getContent(contentFile);
    char a = 65279;
    content = content.replace(String.valueOf(a), "");
    Draft2HtmlLocalizer.writeFile(path, content);

    Object extension = options.get("extension");
    File odfDraft = new File(path, "odfdraft");
    if (extension != null && extension.toString().equalsIgnoreCase("pptx") && (!odfDraft.exists()))
    {
      if (sourceType.equals(HTML_MIMETYPE) && (targetType.equals(PDF_MIMETYPE)))
      {
        IConversionService cvtService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
            IConversionService.class);
        // convert from html to pptx, put in temp folder too
        String resultPath = cvtService.convert(path, HTML_MIMETYPE, PPTX_MIMETYPE, path, options);
        // convert from pptx to pdf/ppt, put to target folder directly
        resultPath = cvtService.convert(resultPath, PPTX_MIMETYPE, targetType, targetPath, options);
        return resultPath;
      }
      else if (sourceType.equals(HTML_MIMETYPE))
      {
        IConversionService cvtService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
            IConversionService.class);
        // convert from html to pptx, put in temp folder too
        String resultPath = cvtService.convert(path, HTML_MIMETYPE, PPTX_MIMETYPE, targetPath, options);
        return resultPath;
      }
      else
        return super.convert(path, sourceType, targetType, targetPath, options);
    }
    else
    {
      if (sourceType.equals(HTML_MIMETYPE) && (targetType.equals(PDF_MIMETYPE)))
      {
        IConversionService cvtService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
            IConversionService.class);
        // convert from html to odp, put in temp folder too
        String resultPath = cvtService.convert(path, HTML_MIMETYPE, ODP_MIMETYPE, path, options);
        // convert from odp to pdf/ppt, put to target folder directly
        resultPath = cvtService.convert(resultPath, ODP_MIMETYPE, targetType, targetPath, options);
        return resultPath;
      }
      else
        return super.convert(path, sourceType, targetType, targetPath, options);
    }
  }

  public JSONObject processSuspiciousContent(JSONObject message)
  {
    String content = "";
    JSONArray json_updates = (JSONArray) message.get("updates");
    if (json_updates == null)
      return message;
    for (int index = 0; index < json_updates.size(); index++)
    {
      JSONObject json_update = (JSONObject) json_updates.get(index);
      String type = (String) json_update.get(Operation.TYPE);
      if (type == null)
        continue;
      else if (type.equals(Operation.INSERT_ELEMENT))
      {
        Object scontent = json_update.get(Operation.CONTENT);
        if (scontent != null)
        {
          content = scontent.toString();
          // D41819: [OCS139487][EH] Reflected XSS in Docs
          // Presentation Editor (msg)
          // content should be a HTML fragment
          StringBuilder sb = new StringBuilder();
          // D140582: [EH] XSS in Docs Presentation Editor (msg &
          // first name)
          // from comment team.The ACF library have a bug when parse
          // said html fragment, it return false. However the
          // vulnerable fragment
          // part can been removed indeed.
          boolean processed = ACFUtil.process(content, sb);
          if (processed)
            LOG.warning("found suspicious content: " + content);
          content = sb.toString();
          json_update.put(Operation.CONTENT, content);
          json_updates.remove(index);
          json_updates.add(index, json_update);
          message.put("updates", json_updates);
        }
      }
    }
    return message;
  }

  public TransformResult transformMessage(JSONObject msg, JSONArray baseMsgList, Object OTContext)
  {
    // if (baseMsgList.size() == 0)
    // return TransformResult.ACCEPT;
    JSONObject context = (JSONObject) OTContext;
    context.put("documentType", "pres");
    return XHTMLTransformer.transformMessage(msg, baseMsgList, context);
  }

  // /**
  // * Create a temporary odp file. Will be placed in the temp directory under
  // the draft directory file where the conversion files are
  // placed.
  // *
  // * @param caller
  // * @param docEntry
  // * @param prefix
  // * prefix of the name. Will have the structure of prefix.tmp. If empty
  // string will use concord.
  // * @return temp odp file named <prefix>.tmp
  // */
  // private File createTempOdpFile(UserBean caller, IDocumentEntry docEntry,
  // String prefix)
  // {
  // DraftDescriptor draftDesc =
  // DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
  // File draftTempFolder = new File(draftDesc.getTempURI(null));
  //
  // File tempFolder = new File(draftTempFolder, docEntry.getDocId());
  // FileUtil.nfs_forceCreateDirectory(tempFolder,
  // FileUtil.NFS_RETRY_SECONDS);
  //
  // // If prefix not specified, use concord
  // if (prefix == null || prefix.length() <= 0)
  // {
  // prefix = "concord";
  // }
  //
  // File tmpOdpFile = new File(tempFolder, prefix + ".tmp");
  //
  // return tmpOdpFile;
  // }

  protected boolean isInPartialDocumentLoading(JSONObject criteria)
  {
    if (criteria == null)
      return false;

    Object partial_flag_obj = criteria.get(PARTIAL_FLAG);
    if (partial_flag_obj == null)
      return false;

    return partial_flag_obj.toString().equalsIgnoreCase("true");
  }

  public Object genOTContext(DraftDescriptor draftDes)
  {
    JSONObject context = new JSONObject();
    oTContext.put(draftDes.getDocId(), context);
    return context;
  }

  public JSONObject OTContextSerialize(DraftDescriptor draftDes)
  {
    String docId = draftDes.getDocId();
    return (JSONObject) oTContext.get(docId);
  }

  public void removeOTContext(DraftDescriptor draftDes, String clientId)
  {
    String docId = draftDes.getDocId();
    JSONObject context = (JSONObject) oTContext.get(docId);
    if (context == null || context.size() == 0)
      return;

    try
    {
      Iterator iter = context.entrySet().iterator();
      while (iter.hasNext())
      {
        java.util.Map.Entry entry = (java.util.Map.Entry) iter.next();
        String id = (String) entry.getValue();
        if (clientId.equalsIgnoreCase(id))
        {
          // remove it
          iter.remove();
        }
      }
    }
    catch (Exception e)
    {
    }
  }

  protected JSONObject getCurrentStateFiltered(DraftDescriptor draftDes, JSONArray msgList, JSONObject criteria)
  {
    boolean bInPartial = isInPartialDocumentLoading(criteria);

    // get user info
    Object user_id = (criteria == null) ? null : criteria.get(MessageConstants.USER_ID);

    Object format = (criteria == null) ? null : criteria.get("format");
    Object presVersion = (criteria == null) ? null : criteria.get("presVersion");
    Object lang = (criteria == null) ? null : criteria.get("lang");
    String langClass = (lang != null) ? lang.toString() : "";
    boolean useJSON = format != null && format.toString().equals("json");
    boolean newPresVersion = presVersion != null && presVersion.toString().equals("2");

    // get more content by chunk id
    Object chunk_id_obj = (criteria == null) ? null : criteria.get(CHUNK_ID);
    if (bInPartial && (chunk_id_obj != null))
    {
      String chunkId = chunk_id_obj.toString();

      // get more content
      String moreContent = "";
      String statusFlag = "FAILED";
      String srcFrom = "unknown";

      ContentSavingContext jobContext = chunkJobListner.getJobContext(chunkId);

      JSONObject json = null;

      if (jobContext != null)
      {
        // get content from job context
        jobContext.setShouldStop(true);

        moreContent = jobContext.getContent();

        if (useJSON)
        {
          try
          {
            json = jobContext.getJson();
            if (json == null)
              json = DraftJSONConverter.convert(moreContent, docURLPath);
          }
          catch (Exception ex)
          {
          }
        }

        statusFlag = "OK";
        srcFrom = "context";
      }
      else
      {
        String userDir = "anonymous";
        if (user_id != null)
        {
          userDir = user_id.toString();
        }

        // get content from file
        String tempDir = draftDes.getTempURI(null) + File.separator + PARTIAL_DIR + File.separator + userDir; // keep
        // consistency
        // with the
        // one in
        // the 1st
        // package
        File workingDir = new File(tempDir);
        File resultFile = new File(tempDir, useJSON ? CONTENT_JSON_FILE_NAME : CONTENT_FILE_NAME);

        if (resultFile.exists() && resultFile.isFile())
        {
          try
          {
            moreContent = FileUtil.nfs_readFileAsString(resultFile, FileUtil.NFS_RETRY_SECONDS);
            if (useJSON)
              json = JSONObject.parse(moreContent);
            statusFlag = "OK";
            srcFrom = "file";
          }
          catch (IOException e)
          {
        	  LOG.log(Level.SEVERE, "IOException error: " + resultFile.getAbsolutePath(), e);
          }
        }

        // do clean work
        File idFile = new File(tempDir, chunkId);
        if (idFile.exists())
        {
          FileUtil.nfs_cleanDirectory(workingDir, FileUtil.NFS_RETRY_SECONDS);
          workingDir.delete();
        }
      }

      JSONObject state = new JSONObject();
      if (useJSON && json != null)
      {
        state.put("json", json);
      }
      else
      {
        state.put("html", moreContent);
      }
      state.put("status", statusFlag);
      state.put("srcfrom", srcFrom);
      return state;
    }

    // get content.html from Server
    JSONObject state = getCurrentStateXHTML(draftDes, msgList);
    String strContent = (String) (state.get("html"));
    strContent = strContent.replaceAll("fontsizeinpts=", "pfs=");
    // to remove "\r\n"
    strContent = strContent.replaceAll("[\r\n]", "");

    if (newPresVersion)
    {
      String bodyLangtag = "<body class=\"tundra langclass_pending\"";
      int bindex = strContent.indexOf(bodyLangtag);
      if(bindex != -1)
      {
    	  strContent = strContent.replace("langclass_pending", langClass);
      }
      String vtag = "<body fversion=\"";
      int findex = strContent.indexOf(vtag);
      if (findex == -1)
      {
        // to Fix HTML DOM Content For MVC
    	DraftDomFixer domfixer = new DraftDomFixer();
        strContent = domfixer.fixDom(strContent);// content.html
        String docid = draftDes.getDocId();
        // Save FixedDom content back to content.html, fixDomJobId : to
        // identify the job,
        String fixDomJobId = docid.replace(".", "");
        FixDomContentContext fixDomJobContext = fixDomJobListner.getJobContext(fixDomJobId);
        if (fixDomJobContext != null)
        {
          // update jobContext
          fixDomJobContext.updateContent(strContent);
        }
        else
        {
          fixDomJobContext = new FixDomContentContext(strContent, fixDomJobId, draftDes);
          FixDomContentJob fixDomJob = new FixDomContentJob(fixDomJobContext);
          fixDomJob.addListener(fixDomJobListner);
          fixDomJob.schedule();
        }
      }
    }

    // do not split package in normal mode
    if (!bInPartial)
    {
      if (useJSON)
      {
        state.put("json", DraftJSONConverter.convert(strContent, docURLPath));
        state.remove("html");
      }
      else
      {
        state.put("html", strContent);
      }
      return state;
    }

    long sttTime = System.currentTimeMillis();

    // get init number of slide in the first package
    // 0 --- all the slides
    int initSlide = 5;
    Object init_slide_obj = criteria.get(INIT_SLIDE);
    if (init_slide_obj != null)
    {
      initSlide = Integer.parseInt(init_slide_obj.toString());
    }

    if (initSlide <= 0)
    {
      if (useJSON)
      {
        state.put("json", DraftJSONConverter.convert(strContent, docURLPath));
        state.remove("html");
      }
      else
      {
        state.put("html", strContent);
      }
      return state;
    }

    // to count by slide in partial mode
    Matcher m2 = Pattern.compile("<\\s*div[^<]*\\s*class\\s*=\\s*[\'\"][^<]*\\s*slideWrapper[^<]*[\'\"][^<]*>").matcher(strContent);
    int slideNum = 0;
    int slideNewStart = -1;
    while (m2.find())
    {
      slideNum++;
      if (slideNum > initSlide)
      {
        slideNewStart = m2.start();
        break;
      }

    }

    // check start : no need to split package
    if (slideNewStart == -1)
    {
      if (useJSON)
      {
        state.put("json", DraftJSONConverter.convert(strContent, docURLPath));
        state.remove("html");
      }
      else
      {
        state.put("html", strContent);
      }
      return state;
    }

    // to split the content by slide
    String theFirstPackage = strContent.substring(0, slideNewStart);
    String theSecondPackage = strContent.substring(slideNewStart);

    // find the end of slideWrapper
    Matcher m3 = Pattern.compile("<\\s*/\\s*div\\s*>\\s*<\\s*div[^<]*\\s*id=[\'\"]tempStore[\'\"].*?>").matcher(theSecondPackage);
    if (m3.find())
    {
      // has "tempStore"
      int slideWrapperEnd = m3.start();
      theFirstPackage += theSecondPackage.substring(slideWrapperEnd);
      theSecondPackage = theSecondPackage.substring(0, slideWrapperEnd);
    }
    else
    {
      // no "tempStore"
      String endString = "</div></body></html>";
      theFirstPackage += endString;
      int endIndex = theSecondPackage.lastIndexOf(endString);
      if (endIndex > 0)
      {
        theSecondPackage = theSecondPackage.substring(0, endIndex);
      }
    }

    if (useJSON)
    {
      state.put("json", DraftJSONConverter.convert(theFirstPackage, docURLPath));
      state.remove("html");
    }
    else
    {
      state.put("html", theFirstPackage);
    }

    if (newPresVersion)
    {
      String listBeforeStyles = "";
      Pattern myPattern = Pattern.compile("<\\s*style\\s+stylename\\s*\\=\\s*\\\"list_before_style\\\"(.*?)<\\s*/\\s*style\\s*>");
      Matcher m = myPattern.matcher(theFirstPackage);
      if (m.find())
      {
        listBeforeStyles = m.group();
      }

      theSecondPackage = "<html><head>" + listBeforeStyles + "</head><body>" + theSecondPackage + "</body></html>";
    }
    // //// to store the second package
    // user id : to identify the temp dir
    String userDir = "anonymous";
    if (user_id != null)
    {
      userDir = user_id.toString();
    }

    // chunk id : to identify the job
    String chunkId = UUID.randomUUID().toString();

    String tempDir = draftDes.getTempURI(null) + File.separator + PARTIAL_DIR + File.separator + userDir;

    ContentSavingContext jobContext = chunkJobListner.getJobContext(chunkId);
    if (jobContext != null)
    {
      // update jobContext
      jobContext.updateContent(theSecondPackage);
    }
    else
    {
      jobContext = new ContentSavingContext(theSecondPackage, chunkId, tempDir, useJSON);
      ContentSavingJob job = new ContentSavingJob(jobContext);
      job.addListener(chunkJobListner);
      job.schedule();
    }

    state.put(CHUNK_ID, chunkId);

    long endTime = System.currentTimeMillis();
    // System.err.println("!!! time in package splitting : " +
    // (endTime-sttTime) + " ms !!!");
    state.put(SPLIT_COST, endTime - sttTime);

    return state;
  }

  public boolean setDocument(DraftDescriptor draftDes, JSONObject state)
  {
    String content = (String) state.get("html");
    try
    {
      DocumentServiceUtil.storeSubFile(draftDes, CONTENT_HTML_FILE, content.getBytes("UTF-8"));
    }
    catch (UnsupportedEncodingException e)
    {
      LOG.logp(Level.SEVERE, CLASS, "Unexpected exception in setDocument()", e.getLocalizedMessage(), e);
      return false;
    }
    catch (IOException e)
    {
      LOG.logp(Level.SEVERE, CLASS, "Unexpected exception in setDocument()", e.getLocalizedMessage(), e);
      return false;
    }
    catch (ConcordException e)
    {
      LOG.logp(Level.SEVERE, CLASS, "Unexpected exception in setDocument()", e.getLocalizedMessage(), e);
      return false;
    }
    return true;
  }

  public JSONObject getSection(DraftDescriptor draftDes, JSONArray msgList, String sectionId)
  {
    return getSection(draftDes, msgList, sectionId, null);
  }

  public JSONObject getSection(DraftDescriptor draftDes, JSONArray msgList, String sectionId, String masterDoc)
  {
    try
    {
      MediaDescriptor contentMedia = DocumentServiceUtil.getSubFile(draftDes, CONTENT_HTML_FILE, true);
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      XHTMLTransformer.getSection(msgList, contentMedia.getStream(), baos, sectionId, masterDoc);
      contentMedia.dispose();
      String content = baos.toString("UTF-8");
      baos.close();

      JSONObject section = new JSONObject();
      section.put("html", content);

      return section;
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.SEVERE, "File not found", e);
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "I/O exception while getting section", e);
    }
    return null;
  }

  protected String getMimeType()
  {
    return ODP_MIMETYPE;
  }

  protected String getTargetMimeType()
  {
    return HTML_MIMETYPE;
  }

  protected String getTemplateMimeType()
  {
    return OTP_MIMETYPE;
  }

  protected String getTemplateExtension()
  {
    return "otp";
  }

  protected String getExtension()
  {
    return "odp";
  }

  protected void createTemplateDocument(JSONObject data, File concordFolder) throws DocumentServiceException
  {
    String initTemplate = null;
    if (data != null)
    {
      initTemplate = (String) data.get("template");
    }
    if (initTemplate == null)
    {
      initTemplate = "default";
    }
    String templateFolder = "/com/ibm/concord/presentation/templates/" + initTemplate + "/";
    String content = getFileString(templateFolder + "content.html");

    // for new document, need to generate ids for elements
    BufferedReader br = null;
    ByteArrayOutputStream baos = null;
    FileOutputStream fos = null;
    try
    {
      Tidy tidy = JTidyUtil.getTidy();
      br = new BufferedReader(new StringReader(content));
      Document w3cDoc = tidy.parseDOM(br, null);
      XHTMLDomUtil.generateIdForDocument(w3cDoc);

      baos = new ByteArrayOutputStream();
      tidy.pprint(w3cDoc, baos);
      content = baos.toString("UTF-8");
      baos.close();
      File contentFile = new File(concordFolder, "content.html");
      fos = new FileOutputStream(contentFile);
      byte[] buf = content.getBytes("UTF-8");
      fos.write(buf);

      createTemplateFile(templateFolder, concordFolder, "office_styles.css");
      createTemplateFile(templateFolder, concordFolder, "office_automatic_styles.css");
      createTemplateFile(templateFolder, concordFolder, "master.html");
      File picutresFolder = new File(concordFolder, "Pictures");
      picutresFolder.mkdirs();
    }
    catch (UnsupportedEncodingException e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("unsupported encoding exception when creating template document");
      throw dse;
    }
    catch (IOException e)
    {
      DocumentServiceException dse = new DocumentServiceException(e);
      dse.setDefaultErrDetail("io error when creating template document");
      throw dse;
    }
    finally
    {
      closeResource(br);
      closeResource(fos);
    }
  }

  private void createTemplateFile(String sourceFolder, File targetFolder, String fileName) throws IOException
  {
    File tmpStylesFile = new File(targetFolder, fileName);
    FileUtil.nfs_createNewFile(tmpStylesFile, FileUtil.NFS_RETRY_SECONDS);

    InputStream is = null;
    try
    {
      is = getClass().getResourceAsStream(sourceFolder + fileName);
      FileUtil.copyInputStreamToFile(is, tmpStylesFile);
    }
    finally
    {
      closeResource(is);
    }
  }

  public String getSubmittedContent(String content)
  {
    return content;
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
     * DraftStorageManager.getDraftStorageManager().listDraftSections (draftDesp, DraftSection.getPictureSection(null)); DraftStorageManager
     * .getDraftStorageManager().discardSection(sectionDesp); } catch (DraftStorageAccessException e) { // Handle exception. } catch
     * (DraftDataAccessException e) { // Handle exception. }
     */

    ;
  }

  @Override
  protected void cleanTaskCommentsFromContent(File concordFolder)
  {
    File contentFile = new File(concordFolder, CONTENT_HTML_FILE);
    String content = getContent(contentFile);
    BufferedReader sReader = null;
    BufferedWriter writer = null;
    OutputStream bos = null;
    try
    {
      sReader = new BufferedReader(new StringReader(content));
      writer = new BufferedWriter(new OutputStreamWriter(new ByteArrayOutputStream(), "UTF8"));
      Tidy tidy = JTidyUtil.getTidy();
      Document document = tidy.parseDOM(sReader, writer);
      XHTMLTransformer.filterElement(document.getDocumentElement(), false, true, true, XHTMLTransformer.PRES_DOCUMENT);
      bos = new FileOutputStream(contentFile);
      tidy.pprint(document, bos);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "I/O error while removing task from content.html", e);
    }
    finally
    {
      closeResource(sReader);
      closeResource(writer);
      closeResource(bos);
    }
  }

  /**
   * Cleanup unneeded files from the Pictures directory that are duplicated in the ODF Pictures directory
   * 
   * This is Overriding the Abstract class so that only the files we want to be removed are removed.
   * 
   * NOTE: (1) Images that were initially from an imported document are deleted (since they are in the ODF Pictures) (2) Images that were
   * generated from Shapes are deleted (since they are copied to the ODF Pictures on export) (3) Images that were generated from Images
   * (Cropped, WMF, EMF, SVM) are preserved in the Concord Pictures directory (4) SVG Files that were generated and not deleted due to the
   * Graphics Debug setting are preserved in the Concord Pictures directory
   * 
   * @param concordFolder
   *          Concord Pictures directory
   */
  @Override
  protected void cleanPicturesDirectory(File concordFolder)
  {
    File pictures = new File(concordFolder, "Pictures");
    cleanDirectory(pictures);
  }

  /**
   * Cleanup unneeded files from the directory
   * 
   * @param dir
   *          Directory to clean
   */
  private static void cleanDirectory(File dir)
  {
    if (!dir.exists())
    {
      return;
    }

    File[] files = dir.listFiles();
    for (int i = 0; i < files.length; i++)
    {
      File f = files[i];
      if (f.isDirectory())
      {
        cleanDirectory(f);
      }
      else
      {
        String filename = f.getName();
        if ((!filename.endsWith(PRESERVATION_SUFFIX)) && (!filename.endsWith(SVG_FILE_SUFFIX)))
        {
          f.delete();
        }
      }
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
    return "pres";
  }

  /*
   * Quietly and cleanly closes the Closeable object (Streams, Readers, etc) if it is still open
   * 
   * @param closeable Closeable object (Streams, Readers, etc)
   */
  public static void closeResource(Closeable closeable)
  {
    if (closeable != null)
    {
      try
      {
        closeable.close();
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "close stream IOException", e);
      }
    }
  }

  /*
   * Determine if the Mobile limits have been exceeded by the content
   * 
   * @param draftDesc Draft descriptor
   * 
   * @return JSONObject Information about whether or not the limits are exceeded
   */
  public JSONObject exceedContentLimit(DraftDescriptor draftDesc)
  {
    String exceededCode = null;
    String exceededLimit = null;

    String contentFile = draftDesc.getURI() + File.separator + CONTENT_HTML_FILE;
    File contentFileF = new File(contentFile);

    if (contentFileF.exists())
    {
      BufferedReader is = null;
      long numPages = 0;
      long numGraphics = 0;
      HashSet<String> graphicList = new HashSet<String>();

      try
      {
        is = new BufferedReader(new FileReader(contentFileF));
        String line = is.readLine();
        while (line != null)
        {
          if (line.contains(SLIDE_TOKEN))
          {
            numPages++;
          }
          if (line.contains(IMAGE_TOKEN))
          {
            int graphicNameStart = line.indexOf(SRC_TOKEN) + SRC_TOKEN.length();
            if (graphicNameStart >= 0)
            {
              int graphicNameEnd = line.indexOf(QUOTE_TOKEN, graphicNameStart + 1);
              if (graphicNameEnd >= 0)
              {
                String graphicName = line.substring(graphicNameStart, graphicNameEnd);
                if (!graphicList.contains(graphicName))
                {
                  graphicList.add(graphicName);
                  numGraphics++;
                }
              }
            }
          }
          if (line.contains(SVG_TOKEN))
          {
            numGraphics++;
          }
          line = is.readLine();
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "File not found", e);
      }
      finally
      {
        closeResource(is);
      }

      if (PresentationConfig.exceedMobilePageLimits(numPages))
      {
        exceededCode = Integer.toString(OutOfCapacityException.EC_OUTOF_CAPACITY_Page_Count_Mobile);
        exceededLimit = Long.toString(PresentationConfig.getMobilePageLimit());
      }
//      else if (PresentationConfig.exceedMobileGraphicLimits(numGraphics))
//      {
//        exceededCode = Integer.toString(OutOfCapacityException.EC_OUTOF_CAPACITY_Image_Count_Mobile);
//        exceededLimit = Long.toString(PresentationConfig.getMobileGraphicLimit());
//      }
    }

    JSONObject json = new JSONObject();
    if (exceededCode != null)
    {
      json.put("result", "true");
      json.put("error_code", exceededCode);
      json.put("error_message", exceededLimit);
    }
    else
    {
      json.put("result", "false");
    }
    return json;
  }

  // //// internal class ContentSavingContext
  // / to save content into temp file
  private class ContentSavingContext extends JobContext
  {
    private String strContent;

    private String jobId;

    private String strTempDir;

    private boolean bShouldStop;

    private Object contentLock;

    private boolean useJson;

    private JSONObject json;

    public ContentSavingContext(String content, String chunkId, String tempDir, boolean useJson)
    {
      this.strContent = content;
      this.jobId = chunkId;
      this.strTempDir = tempDir;
      this.useJson = useJson;
      this.contentLock = new Object();

      File workingDir = new File(this.strTempDir);
      if (workingDir.exists())
      {
        FileUtil.nfs_cleanDirectory(workingDir, FileUtil.NFS_RETRY_SECONDS);
        File idFile = new File(this.strTempDir, this.jobId);
      }
      else
      {
        if (!workingDir.mkdirs())
        {
          LOG.warning("failed to create working dir for draft content.");
        }
      }

      setWorkingDir(workingDir);
      this.bShouldStop = false;
    }

    public String getJobId()
    {
      return this.jobId;
    }

    public String getContent()
    {
      String curContent;
      synchronized (this.contentLock)
      {
        curContent = this.strContent;
      }
      return curContent;
    }

    public void clearContent()
    {
      synchronized (this.contentLock)
      {
        this.strContent = null;
        this.json = null;
      }
    }

    public void updateContent(String newContent)
    {
      synchronized (this.contentLock)
      {
        this.strContent = newContent;
        this.json = null;
      }
    }

    public boolean isShouldStop()
    {
      return this.bShouldStop;
    }

    public void setShouldStop(boolean shouldStop)
    {
      this.bShouldStop = shouldStop;
    }

    protected String getJobIdString()
    {
      return "";
    }

    public void setJson(JSONObject json)
    {
      synchronized (this.contentLock)
      {
        this.json = json;
      }
    }

    public JSONObject getJson()
    {
      synchronized (this.contentLock)
      {
        return this.json;
      }
    }
  }

  // ////internal class ContentSavingJob
  // / to save content into temp file
  private class ContentSavingJob extends Job
  {
    public ContentSavingJob(JobContext jobContext)
    {
      super(jobContext);
    }

    public Object exec() throws JobExecutionException
    {
      // wait for 10s to avoid IO operation in normal case
      try
      {
        Thread.sleep(10 * 1000);
      }
      catch (InterruptedException e)
      {
    	  LOG.log(Level.SEVERE, "InterruptedException error: " + jobContext.getJobId(), e);
      }

      // get context
      ContentSavingContext jobContext = (ContentSavingContext) getJobContext();
      if (jobContext.isShouldStop())
      {
        return null;
      }

      // check id
      File idFile = new File(jobContext.getWorkingDir(), jobContext.getJobId());
      if (!idFile.exists())
        return null;

      // rewrite : get the content and write to file
      try
      {
        // create file
        File resultFile = new File(jobContext.getWorkingDir(), jobContext.useJson ? CONTENT_JSON_FILE_NAME : CONTENT_FILE_NAME);

        // deal with content
        boolean reWrite = false;

        do
        {
          // get content
          String curContent = jobContext.getContent();
          boolean usedJSON = jobContext.useJson;
          // rewrite file
          if (usedJSON)
          {
            JSONObject json = DraftJSONConverter.convert(curContent, docURLPath);
            FileUtil.nfs_writeStringToFile(resultFile, json.toString(), FileUtil.NFS_RETRY_SECONDS);
            jobContext.setJson(json);
          }
          else
          {
            FileUtil.nfs_writeStringToFile(resultFile, curContent, FileUtil.NFS_RETRY_SECONDS);
          }
          // check content
          String newContent = jobContext.getContent();

          // content updated or request format changed.
          if (newContent != curContent || jobContext.useJson != usedJSON)
          {
            reWrite = true;
            Thread.sleep(2 * 1000);
          }
        }
        while (reWrite);

        // result file is not needed, remove it
        if (jobContext.isShouldStop())
        {
          resultFile.delete();
        }

      }
      catch (IOException e)
      {
        putError(e);
      }
      catch (InterruptedException e)
      {
        putError(e);
      }

      return null;
    }

    public void putResult(Object result)
    {
      try
      {
        // just create an empty result file to mark the job as
        // completed.
        getResultFile().createNewFile();
      }
      catch (IOException e)
      {
        putError(e);
      }
    }

    public File getResultFile()
    {
      return new File(getJobContext().getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
    }

    public void release()
    {
      ContentSavingContext jobContext = (ContentSavingContext) getJobContext();
      jobContext.clearContent();

      File idFile = new File(jobContext.getWorkingDir(), jobContext.getJobId());
      if (!idFile.exists())
        return;

      if (jobContext.isShouldStop())
      {
        try
        {
          File workingDir = jobContext.getWorkingDir();
          if (workingDir.exists() && workingDir.isDirectory())
          {
            FileUtil.nfs_cleanDirectory(workingDir, FileUtil.NFS_RETRY_SECONDS);
            workingDir.delete();
          }
        }
        catch (Exception e)
        {
          // it has already deleted.
        }

      }
    }

  }

  // ////internal class ContentSavingJobListener
  // / to save content into temp file
  private static class ContentSavingJobListener implements JobListener
  {
    private Hashtable<String, ContentSavingContext> jobContextTable;

    public ContentSavingJobListener()
    {
      jobContextTable = new Hashtable<String, ContentSavingContext>();
    }

    public ContentSavingContext getJobContext(String jobId)
    {
      return jobContextTable.get(jobId);
    }

    public void aboutToSchedule(JobContext jobContext)
    {
      jobContextTable.put(jobContext.getJobId(), (ContentSavingContext) jobContext);
    }

    public boolean shouldSchedule(JobContext jobContext)
    {
      return true;
    }

    public void scheduled(JobContext jobContext)
    {
      // ;
    }

    public void joined(JobContext jobContext, boolean locally)
    {
      // ;
    }

    public void done(JobContext jobContext, boolean success)
    {
      jobContextTable.remove(jobContext.getJobId());
    }
  }

  // internal class FixDomContentContext
  // to save Dom Fixed html content back into content.html file
  private class FixDomContentContext extends JobContext
  {
    private String strContent;

    private String jobId;

    private DraftDescriptor curdraftDes;

    private Object contentLock;

    public FixDomContentContext(String content, String fixdomid, DraftDescriptor draftDes)
    {
      this.strContent = content;
      this.jobId = fixdomid;
      this.curdraftDes = draftDes;
      this.contentLock = new Object();

      String tempDir = draftDes.getTempURI(null) + File.separator + PARTIAL_DIR + File.separator + "domfix" + File.separator;
      File workingDir = new File(tempDir);

      if (workingDir.exists())
      {
        FileUtil.nfs_cleanDirectory(workingDir, FileUtil.NFS_RETRY_SECONDS);
      }
      else
      {
        FileUtil.nfs_mkdirs(workingDir, FileUtil.NFS_RETRY_SECONDS);
      }
      setWorkingDir(workingDir);
    }

    public DraftDescriptor getdraftDes()
    {
      return this.curdraftDes;
    }

    public String getJobId()
    {
      return this.jobId;
    }

    public String getContent()
    {
      String curContent;
      synchronized (this.contentLock)
      {
        curContent = this.strContent;
      }
      return curContent;
    }

    public void clearContent()
    {
      synchronized (this.contentLock)
      {
        this.strContent = null;
      }
    }

    public void updateContent(String newContent)
    {
      synchronized (this.contentLock)
      {
        this.strContent = newContent;
      }
    }

    protected String getJobIdString()
    {
      return "";
    }

  }

  // internal class FixDomContentJobListener
  // to save Dom Fixed html content back into content.html file
  private static class FixDomContentJobListener implements JobListener
  {
    private Hashtable<String, FixDomContentContext> jobContextTable;

    public FixDomContentJobListener()
    {
      jobContextTable = new Hashtable<String, FixDomContentContext>();
    }

    public FixDomContentContext getJobContext(String jobId)
    {
      return jobContextTable.get(jobId);
    }

    public void aboutToSchedule(JobContext jobContext)
    {
      jobContextTable.put(jobContext.getJobId(), (FixDomContentContext) jobContext);
    }

    public boolean shouldSchedule(JobContext jobContext)
    {
      return true;
    }

    public void scheduled(JobContext jobContext)
    {
      // ;
    }

    public void joined(JobContext jobContext, boolean locally)
    {
      // ;
    }

    public void done(JobContext jobContext, boolean success)
    {
      jobContextTable.remove(jobContext.getJobId());
    }
  }

  // internal class FixDomContentJob
  // to save Dom Fixed html content back into content.html file
  private class FixDomContentJob extends Job
  {
    public FixDomContentJob(JobContext jobContext)
    {
      super(jobContext);
    }

    public Object exec() throws JobExecutionException
    {
      FileInputStream fis = null;
      // get context
      FixDomContentContext jobContext = (FixDomContentContext) getJobContext();
      File tempFolder = jobContext.getWorkingDir();
      DraftDescriptor draftDes = jobContext.getdraftDes();
      File tmpContentFile = new File(tempFolder, "concord" + System.currentTimeMillis() + "tmp");
      try
      {
        FileUtil.nfs_createNewFile(tmpContentFile, FileUtil.NFS_RETRY_SECONDS);
        // deal with content
        boolean reWrite = false;
        do
        {
          // get content
          String curContent = jobContext.getContent();
          // rewrite file
          FileUtil.nfs_writeStringToFile(tmpContentFile, curContent, FileUtil.NFS_RETRY_SECONDS);
          // check content
          String newContent = jobContext.getContent();
          // content updated or request format changed.
          if (newContent != curContent)
          {
            reWrite = true;
            Thread.sleep(1000);
          }
        }
        while (reWrite);
        fis = new FileInputStream(tmpContentFile);
        DocumentServiceUtil.storeSubFile(draftDes, CONTENT_HTML_FILE, fis);
      }
      catch (FileNotFoundException e)
      {
        LOG.log(Level.SEVERE, "Error: Can't find " + draftDes.getDocId() + CONTENT_HTML_FILE, e);
        throw new IllegalStateException("Error: Can't find " + draftDes.getDocId() + CONTENT_HTML_FILE);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IO Error: " + draftDes.getDocId() + CONTENT_HTML_FILE, e);
        throw new IllegalStateException("IO Error: " + draftDes.getDocId() + CONTENT_HTML_FILE);
      }
      catch (ConcordException e)
      {
        LOG.log(Level.SEVERE, "Draft accessing error: " + draftDes.getDocId(), e);
        throw new IllegalStateException("Draft accessing error: " + draftDes.getDocId(), e);
      }
      catch (InterruptedException e)
      {
    	LOG.log(Level.SEVERE, "InterruptedException error: " + draftDes.getDocId(), e);
      }
      finally
      {
        try
        {
          if (fis != null)
          {
            fis.close();
          }
          tmpContentFile.delete();
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "io error when close stream ", e);
        }
      }
      return null;
    }

    public void putResult(Object result)
    {
      try
      {
        // just create an empty result file to mark the job as
        // completed.
        getResultFile().createNewFile();
      }
      catch (IOException e)
      {
        putError(e);
      }
    }

    public File getResultFile()
    {
      return new File(getJobContext().getWorkingDir(), RESULT + MEDIA_RESULT_SUFFIX);
    }

    public void release()
    {
      FixDomContentContext jobContext = (FixDomContentContext) getJobContext();
      jobContext.clearContent();
      try
      {
        File workingDir = jobContext.getWorkingDir();
        if (workingDir.exists() && workingDir.isDirectory())
        {
          FileUtil.nfs_cleanDirectory(workingDir, FileUtil.NFS_RETRY_SECONDS);
          workingDir.delete();
        }
      }
      catch (Exception e)
      {
        // it has already deleted.
      }
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
