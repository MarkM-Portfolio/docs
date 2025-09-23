/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.document.message;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.SocketTimeoutException;
import java.net.URLEncoder;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.channels.OverlappingFileLockException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.InitialContext;
import javax.naming.NamingException;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.HttpParams;
import org.apache.http.util.EntityUtils;
import org.codehaus.jackson.JsonFactory;

import com.ibm.concord.document.common.chart.ChartDocument;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.draft.section.DraftSection;
import com.ibm.concord.draft.section.SectionDescriptor;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.document.services.IDocumentService.TransformResult;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spreadsheet.ServiceConstants;
import com.ibm.concord.spreadsheet.SpreadsheetConfig;
import com.ibm.concord.spreadsheet.SpreadsheetDraftDeserializer;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.document.compare.DraftComparator;
import com.ibm.concord.spreadsheet.document.message.Message.Action;
import com.ibm.concord.spreadsheet.document.model.MessageDispatcher;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.io.Deserializer;
import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory;
import com.ibm.concord.spreadsheet.document.model.impl.io.Serializer;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.partialload.legacy.SpreadsheetPartialHelper;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.Work;
import com.ibm.websphere.asynchbeans.WorkItem;
import com.ibm.websphere.asynchbeans.WorkManager;

public class Transformer
{
  private static final Logger LOG = Logger.getLogger(Transformer.class.getName());
  
  private static ArrayList<ISemanticConflictCheck> semanticConflictCheckList = null;
  
  private static Set<String> cleanCalcFilters;
  
  public static boolean bPartialLoadModel = true; // only load the sub model to the memory
  
  private static boolean ENABLE_REGRESSION_TEST = false;
  
  private static JsonFactory jsonFactory;
  
  private static ModelIOFactory modelIOFactory;
  
  private static JSONArray debugMsgList = new JSONArray();
  
  private static final List<String> draftLabels;
  
  // variables for Formula Calculation
  private static final boolean hasNodeJSEnabled = SpreadsheetConfig.hasNodeJSEnabled();
  private static String HTTP_URL = "http://127.0.0.1:1337/"; //configurable 
  private static int socketTimeout = 60000; 
  private static int RETRY_NUM = 3;
  private static int RETRY_INTERVAL = 60000;
  private static int maxConn;
  private static int connManagerTimeout;
  private final static String CALC_RESULT = "calc.rst";
  private final static String DRAFT_CALC_LCK = "draft.lck";
  private static ThreadSafeClientConnManager connManager;
  private static FileLock draftLck;
  private static FileChannel lockFileChannel;
  private static FileOutputStream lockOS;
  
  private static final String WM_NODEJS_JNDI_NAME = "java:comp/env/com/ibm/docs/nodejscalc/workmanager";

  private static WorkManager nodeJSWM;
  
  private static ConcurrentHashMap<String, NodeCalcWork> calcThreads;
  
  public static enum CALCSTATUS {NOT_COMPLETE, FAIL, SUCC, SUCC_SAME_SEQUENCE};
  
  private static final String COMMENTS_JS_FILE = "comments.js";
  
  static
  {
    semanticConflictCheckList = new ArrayList<ISemanticConflictCheck>();
    MergeCellMsg mergeConflict = new MergeCellMsg();
    semanticConflictCheckList.add(mergeConflict);
    AssignTaskMsg taskConflict = new AssignTaskMsg();
    semanticConflictCheckList.add(taskConflict);
    NameRangeMsg nameConflict = new NameRangeMsg();
    semanticConflictCheckList.add(nameConflict);
    SetFilterConflictMsg insertFilterConflict = new SetFilterConflictMsg();
    semanticConflictCheckList.add(insertFilterConflict);
    SortConflictCheck sortConflict = new SortConflictCheck();
    semanticConflictCheckList.add(sortConflict);
    RangeMsgConflictCheck rangeConflict = new RangeMsgConflictCheck();
    semanticConflictCheckList.add(rangeConflict);
    ShapeRangeMsgConflictCheck shapeRangeConflict = new ShapeRangeMsgConflictCheck();
    semanticConflictCheckList.add(shapeRangeConflict);
    PermissionMsgConflictCheck permissionMsgConflictCheck = new PermissionMsgConflictCheck();
    semanticConflictCheckList.add(permissionMsgConflictCheck);
    jsonFactory = new JsonFactory();
    try
    {
      modelIOFactory = new ModelIOFactory(jsonFactory);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Failed to initialize ModelIOFactory, ", e);
      modelIOFactory = null;
    }
    
    if (SpreadsheetConfig.useReferenceJS())
    {
      draftLabels = Arrays.asList("meta.js", "content.js", "reference.js", "preserve.js");
    } 
    else 
    {
      draftLabels = Arrays.asList("meta.js", "content.js", "preserve.js");
    }
    
    // inject max ref sheet row to partial load constants
    ConversionConstant.MAX_REF_ROW_NUM = SpreadsheetConfig.getMaxSheetRows();
    
    
    if(hasNodeJSEnabled)
    {
      cleanCalcFilters = new HashSet<String>();
      cleanCalcFilters.add(DRAFT_CALC_LCK);//draft.lck shared by serializer on nodejs
      JSONObject calcConfig = SpreadsheetConfig.getCalculationService();
      if(calcConfig != null)
      {
        String url = (String)calcConfig.get("url");
        if(url != null){
          if(!url.endsWith("/"))
            url += "/";
          HTTP_URL = url;
        }
        String sTime = (String)calcConfig.get("socketTimeout");
        if(sTime != null)
          socketTimeout = Integer.valueOf(sTime);
        String retry = (String)calcConfig.get("numberofretry");
        if(retry != null)
          RETRY_NUM = Integer.valueOf(retry);
        String interval = (String)calcConfig.get("intervalofretry");
        if(interval != null)
          RETRY_INTERVAL = Integer.valueOf(interval);
      }

      connManager = new ThreadSafeClientConnManager();
      maxConn = 10;//TODO: consist with nodejs config
      connManagerTimeout = 1000;//return immediately if has not get connection 
      connManager.setMaxTotal(maxConn);
      connManager.setDefaultMaxPerRoute(maxConn);
      
      calcThreads = new ConcurrentHashMap<String, NodeCalcWork>();
      
      try
      {
        InitialContext context = new InitialContext();
        nodeJSWM = (WorkManager) context.lookup(WM_NODEJS_JNDI_NAME);
      }
      catch (NamingException e)
      {
        LOG.log(Level.WARNING, "Cannot initialize NodeJSCalcWorkManager, use ConcordWorkManager instead, exception message:{0} ", e.getMessage());
        nodeJSWM = Platform.getWorkManager();
      }
    }
  }

  public static ModelIOFactory getModelIOFactory()
  {
    return modelIOFactory;
  }
  
  public static boolean isOperationMessage(JSONObject jsonMsg)
  {
    boolean ret = true;

    JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
    if (events == null) return false; // invalid message

    // use the first event
    JSONObject event = (JSONObject) events.get(0);
    String action = (String) event.get(ConversionConstant.ACTION);
    if (action.equalsIgnoreCase(ConversionConstant.ACTION_LOCK) || action.equalsIgnoreCase(ConversionConstant.ACTION_RELEASE))
      ret = false;

    return ret;
  }
  public static void LogMessageSeqs(DraftDescriptor draftDesc, JSONArray msgList)
  {
    try {
      StringBuffer b = new StringBuffer();
      for (int i =0 ; i < msgList.size(); i++) 
      {
        JSONObject msg= (JSONObject) msgList.get(i);
        if (msg.containsKey("server_seq")) 
        {
          int seq = Integer.parseInt(msg.get("server_seq").toString());
          b.append(seq);
          b.append(":[");
          if (msg.containsKey("updates"))
          {
            JSONArray updates = (JSONArray) msg.get("updates");
            for (int j=0;j<updates.size();j++) 
            {
              JSONObject update = (JSONObject) updates.get(j);
              if (update.containsKey("action")) 
              {
                String action = (String) update.get("action");
                b.append(action);
              }
              String content = "";
              if (update.containsKey("data")) 
              {
                JSONObject data = (JSONObject) update.get("data");
                if (data.containsKey("usage")) 
                {
                  String usage = (String) data.get("usage");
                  content = "(" + usage;
                }
              }
              if (update.containsKey("reference")) 
              {
                JSONObject reference = (JSONObject) update.get("reference");
                if (reference.containsKey("refType")) 
                {
                  String refType = (String) reference.get("refType");
                  if (content.isEmpty()) 
                    content = "(";
                  content = content + "/" + refType;
                }
              }
              if (!content.isEmpty())
              { 
                b.append(content);
                b.append(")");
              }
              
              if (j<updates.size()-1)
                b.append(",");
            }
          }
          b.append("] ");
        }
      }
      LOG.log(Level.INFO, "[docid:"+draftDesc.getDocId()+"] Applying " + msgList.size() +" messages : " + b.toString());
    } 
    catch (Exception e) 
    {
      // e.printStackTrace();
      LOG.log(Level.INFO, "[docid:"+draftDesc.getDocId()+"] Applying " + msgList.size() +" messages");
    }
  }
  public static void flushMessage(DraftDescriptor draftDesc, JSONArray msgList, boolean isClosed) throws Exception
  {
    if (msgList.size() == 0)
      return;

    LOG.log(Level.INFO, "[docid:"+draftDesc.getDocId()+"] flushMessage begin for " + msgList.size() +" messages");
    // deserialize model
    DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager(false);
    Deserializer draftDeserializer = modelIOFactory.createDeserializer();
    Document document = (Document) dsm.getDraftMediaAsObject(draftDesc, draftDeserializer);
    //do not apply message if the document is corrupt
    if (!document.isValid())
    {
      LOG.log(Level.WARNING, "No sheet or invalid sheets are contained in draft. Do not apply Message to draft " + draftDesc.getURI() );
      Exception e = new Exception("No sheet or invalid sheets are contained in draft" + draftDesc.getURI());
      throw e;
    }
    List<StyleObject> styleList = draftDeserializer.getStyleList();
    // dispatch messages
    MessageDispatcher md = new MessageDispatcher();
    md.setDocument(document);
    LogMessageSeqs(draftDesc, msgList);
    processMessageList(md, msgList);
    // serialize model
    document.getRecoverManager().serialize(styleList);
    Serializer ser = modelIOFactory.createSerializer();
    ser.setStyleList(styleList);
    ser.setDraftFileCount(draftLabels.size());
    ser.setNodeJSEnabled(hasNodeJSEnabled);
    ser.setIsClosed(isClosed);
    dsm.storeDraft(draftDesc, document, ser, getDraftSections(document));
    resetACLFlag(document,dsm,draftDesc);
    LOG.log(Level.INFO, "[docid:"+draftDesc.getDocId()+"] flushMessage finished for " + msgList.size() +" messages");
  }
  
  public static void resetACLFlag(Document document, DraftStorageManager dsm, DraftDescriptor draftDesc)
  {
	try{
	  SectionDescriptor sd = dsm.getSectionDescriptor(draftDesc, new DraftSection("page-settings.js"));
	  JSONObject json = dsm.getSectionAsJSONObject(sd);
	  json.put("hasACL", document.hasACL());
	  dsm.storeSectionAsJSONObject(sd, json);
	}
	catch(ConcordException e){
	  LOG.log(Level.WARNING, "Error when resetACLFlag" , e);
	}
  }
  /**
   * send http request to nodejs
   * @param draftDesc
   * @param calcId          only given when it is used for publish/saveas
   * @param draftFolder     only given when it is used for publish/saveas
   * @param bSync           true when it is used for publish/saveas
   * @param savedSequence   only accept the calc result with the same server sequence when nodejs return the calc result
   * @throws Exception 
   */
  public static String calc(DraftDescriptor draftDesc, String calcId, File draftFolder, boolean bSync, long savedSequence) throws Exception
  {
    String calcPath = null;
    if (hasNodeJSEnabled)
    {
      File calcFolder = getCurrentCalcPath(draftDesc, calcId);
      try
      {
        boolean bLock = lockCalc(calcFolder);
        if (!bLock)
          return null;
        FileUtil.nfs_cleanDirectory(calcFolder, cleanCalcFilters, FileUtil.NFS_RETRY_SECONDS);
        calcPath = calcFolder.getAbsolutePath();
        DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager(false);
        if (draftFolder == null)
          dsm.getDraftMedia(draftDesc, calcPath);
        else
          FileUtil.nfs_copyDirToDir(draftFolder, calcFolder, FileUtil.NFS_RETRY_SECONDS);

      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "Error when aquire file lock for draft calculation path at" + calcFolder.getPath(), e);
      }
      finally
      {
        releaseCalc();
      }
      
      NodeCalcWork nodeCalcWork = calcThreads.get(draftDesc.getDocId());
      if (nodeCalcWork != null)
      {
        long seq = nodeCalcWork.getSeq();
        if ((seq <= savedSequence) || (savedSequence == -1))
        {
          if (seq < savedSequence)
            nodeCalcWork.cancelCalc();
        }
        else
        {
          LOG.log(Level.WARNING,
              "NodeJS ACTION: The document {0} for calc has the old sequence {1}, while the calc thread sequence is {2}", new Object[] {
                  draftDesc.getDocId(), savedSequence, seq });
          return null;
        }
      }

      // will create calc thread even seq == savedSequence
      // it is happened when prepublish
      nodeCalcWork = new NodeCalcWork(draftDesc, calcPath, calcId, savedSequence);
      WorkItem workItem = nodeJSWM.startWork(nodeCalcWork);
      if (bSync)
      {
        // sync get result
        ArrayList<WorkItem> list = new ArrayList<WorkItem>();
        list.add(workItem);
        nodeJSWM.join(list, WorkManager.JOIN_OR, socketTimeout);
        int status = nodeCalcWork.getStatusCode();
        if (status == 202 || status == 204)
          return calcPath;
        else
        {
          return null;
        }
      }
      else
      {
        // do not need put publish calc thread to map
        // because this thread should not be canceled even its sequence is less than the latest save sequence for autosave
        calcThreads.put(draftDesc.getDocId(), nodeCalcWork);
      }
    }

    return calcPath;
  }

  public static void deleteCalc(DraftDescriptor draftDesc)
  {
    if(hasNodeJSEnabled)
    {
      calcThreads.remove(draftDesc.getDocId());
    }
  }
  
  private static File getCurrentCalcPath(DraftDescriptor draftDesc, String calcId)
  {
    File draftTempFolder = new File(draftDesc.getTempURI(null));
    File calcFolder = new File(draftTempFolder, "calculate");

    if(calcId != null)
      calcFolder = new File(calcFolder, calcId);
    
    //TODO: pick up one node to serve this request, and use nodejs port as the folder name
    //name it as "port-1337", if the folder already exist, reuse it
    File portFolder = new File(calcFolder, "port");
    
    return portFolder;
  }
  
  public static List<DraftSection> getDraftSections(Document doc)
  {
	List<DraftSection> sections = new ArrayList<DraftSection>();
	for(int i=0;i<draftLabels.size();i++)
	{
		sections.add(new DraftSection(draftLabels.get(i)));
	}
	
	sections.add(new DraftSection(COMMENTS_JS_FILE));
	
	List<ChartDocument> charts = doc.getCharts();
	for(int i=0;i<charts.size();i++)
	{
		ChartDocument chart = charts.get(i);
		sections.add(DraftSection.getChartSection(chart.getChartId()+".js"));
	}
	return sections;
  }

  private static void processMessageList(MessageDispatcher md, JSONArray msgList)
  {
    boolean bDebugEnable = SpreadsheetConfig.getDebugEnabled();
    JSONArray arr = msgList;
    if(bDebugEnable && ENABLE_REGRESSION_TEST)
      arr = debugMsgList;
    while (arr.size() > 0)
    {
      JSONObject jsonMsg = (JSONObject) arr.remove(0);
      try{
        if (isContentMessage(jsonMsg) && isOperationMessage(jsonMsg))
        {
          md.dispatchMessage(jsonMsg);
        }
      }catch (Exception e)
      {
        LOG.log(Level.WARNING, "==Apply message error: ", e);
      }
    }
  }
  
  /**
   * Get the calc status, if successful, it will copy the calc result to draft media
   * @param calcFolder
   * @param draftDesc
   */
  public static CALCSTATUS getCalcStatus(File calcFolder, DraftDescriptor draftDesc)
  {
    CALCSTATUS status = CALCSTATUS.FAIL;
    if(calcFolder.exists())
    {
      File resultFile = new File(calcFolder, CALC_RESULT);
      if(resultFile.exists())
      {
        FileInputStream is = null;
        try
        {
          boolean bLock = lockCalc(calcFolder);
          if(!bLock)
            return status;
          is = new FileInputStream(resultFile);
          JSONObject result = JSONObject.parse(is);
          if(result != null && result.containsKey("isSuccess"))
          {
            boolean isSuccess = (Boolean)result.get("isSuccess");
            if(isSuccess)
            {
              status = CALCSTATUS.SUCC;
              long seq = Long.parseLong((String)result.get("seq"));
              SessionManager mgr = SessionManager.getInstance();
              DocumentSession docSess = mgr.getSession(draftDesc.getRepository(), draftDesc.getDocId());
              if(docSess != null)
              {
                long newSeq = docSess.getSavedSeq();
                if(seq == newSeq)
                {
//                  FileUtil.nfs_copyDirToDir(calcFolder, new File(draftDesc.getURI()), copyCalcFilters, FileUtil.NFS_RETRY_SECONDS);
                  //only copy content.js
                  String dirPath = draftDesc.getURI();
                  if(draftDesc.getInTransacting())
                    dirPath = draftDesc.getTransURI();
                  File DestFile = new File(dirPath);
                  for(int i=0;i<draftLabels.size();i++)
                  {
                    File copyFile = new File(calcFolder, draftLabels.get(i));
                    FileUtil.nfs_copyFileToDir(copyFile, DestFile, null, FileUtil.NFS_RETRY_SECONDS);
                  }
                  status = CALCSTATUS.SUCC_SAME_SEQUENCE;
                }
              }
            }
          }
        }
        catch (FileNotFoundException e)
        {
          LOG.log(Level.WARNING, "NodeJS Action: {0} does not found when get calculation status", new Object[]{resultFile.getAbsolutePath()});
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "NodeJS Action: Exception when get calculation status for doc " + draftDesc.getDocId());
        }
        finally
        {
          IOUtils.closeQuietly(is);
          releaseCalc();
        }
      }
      else
        status = CALCSTATUS.NOT_COMPLETE;
    }
    return status;
  }
  
  private static boolean lockCalc(File calcFolder) throws IOException
  {
    if(!calcFolder.exists())
      return true;
    File draftFile = new File(calcFolder, DRAFT_CALC_LCK);
    try
    {
      draftFile.createNewFile();
      lockOS = new FileOutputStream(draftFile);
      lockFileChannel = lockOS.getChannel();
      draftLck = lockFileChannel.tryLock();//non-block
    }
    catch (OverlappingFileLockException e)
    {
      LOG.log(Level.WARNING, "Lock Failed due to OverlappingFileLockException for doc {0} which is serializing by nodejs", calcFolder.getPath());
      return false;
    }
    
    return true;
  }
  
  private static void releaseCalc()
  {
    try
    {
      if (draftLck != null)
      {
        draftLck.release();
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, " Release lock file failed.", e);
    }
    finally
    {
      draftLck = null;
    }
    try
    {
      if (lockFileChannel != null)
      {
        lockFileChannel.close();
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, " Release lock file channel failed.", e);
    }
    finally
    {
      lockFileChannel = null;
    }
    try
    {
      if (lockOS != null)
      {
        lockOS.close();
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, " Close lock file failed.", e);
    }
    finally
    {
      lockOS = null;
    }
  }
  
  //copy draft from calcFolder to draft folder if calc.json is exist with success flag
  public static void checkCalcResult(DraftDescriptor draftDesc)
  {
    if(hasNodeJSEnabled)
    {
      File calcFolder = getCurrentCalcPath(draftDesc, null);
      CALCSTATUS status = getCalcStatus(calcFolder, draftDesc);
      if(status != CALCSTATUS.NOT_COMPLETE && calcFolder.exists())
      {
        FileUtil.nfs_cleanDirectory(calcFolder, FileUtil.NFS_RETRY_SECONDS);
        FileUtil.nfs_delete(calcFolder, FileUtil.NFS_RETRY_SECONDS);
      }
        
    }
  }
  
  public static JSONObject getCurrentState(DraftDescriptor draftDesc, JSONObject criteria) throws Exception
  {    
    checkCalcResult(draftDesc);
    //compare the draft generated by old model and new model
    String htmlResult = regressionTest(draftDesc);
    DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager();
    
    SpreadsheetDraftDeserializer deserializer = new SpreadsheetDraftDeserializer(criteria, jsonFactory);
    
    JSONObject document = null;
    
    try
    {
      document = dsm.getDraftMediaAsJSONObject(draftDesc, deserializer);
    }
    catch (Exception e)
    {
      if(e instanceof DraftStorageAccessException)
      {
        if(((DraftStorageAccessException) e).getErrCode() == 9999)
        {
          throw e;
        }
      }
      LOG.log(Level.SEVERE, "Exception in deserializing Spreadsheet Draft.", e);
    }
    if(htmlResult != null)
      document.put("html", htmlResult);
    // No need to put sever sequence now since MsgList is always empty
    return document;
  }
  
  private static String regressionTest(DraftDescriptor draftDesc)
  {
    String htmlResult = null;
    if(ENABLE_REGRESSION_TEST && SpreadsheetConfig.getDebugEnabled())
    {
      String docUri = draftDesc.getURI();
      String docPath = docUri + File.separator;
      String contentPath = "content.js";
      String metaPath = "meta.js";
      String refPath = "reference.js";
      String prePath = "preserve.js";
      
      try
      {
        String oPrefix = "o";
        File oldContentFile = new File(docPath + oPrefix + contentPath);
        if(!oldContentFile.exists())
          return htmlResult;
        
        DraftComparator comp = new DraftComparator(docUri, "o", "");
        htmlResult = comp.compare();
        
        oldContentFile.delete();
        File oldMetaFile = new File(docPath + oPrefix + metaPath);
        oldMetaFile.delete();
        File oldRefFile = new File(docPath + oPrefix + refPath);
        oldRefFile.delete();
        File oldPreFile = new File(docPath + oPrefix + prePath);
        oldPreFile.delete();
        
      }catch (Exception e)
      {
        LOG.log(Level.WARNING, null, e);
        htmlResult = "<html><body>" + e.toString() + "</body></html>";
      }
    }
    return htmlResult;
  }
  
  private static JSONObject loadJsContent(String docUri)
  {
    String uri = docUri + File.separator + "meta.js";
    JSONObject meta = loadJsFile(uri);
    uri = docUri + File.separator + "content.js";
    JSONObject content = loadJsFile(uri);
    uri = docUri + File.separator + "reference.js";

    // client model doesn't need reference
//    JSONObject reference = SpreadsheetDocumentModel.loadJsFile(uri);
    uri = docUri + File.separator + "unsupport_feature.js";
    JSONObject unsupFeature = loadJsFile(uri);
    
    JSONObject docJson = new JSONObject();
    docJson.put(ConversionConstant.CONTENT, content);
    docJson.put(ConversionConstant.META, meta);
    if(null != unsupFeature)
      docJson.put("unsupport_feature", unsupFeature);
//    if (reference != null)
//      docJson.put(ConversionConstant.REFERENCE, reference);

    return docJson;
  }
  
  /**
   * @deprecated
   */
  public static JSONObject getCurrentState(String docUri, JSONArray msgList, JSONObject criteria)
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.entering(Transformer.class.getName(), "getCurrentState", new Object[] { docUri, msgList, criteria });
    }
    
    if (criteria != null && !criteria.isEmpty() && SpreadsheetConfig.getPartialLevel() != ServiceConstants.PARTIAL_LEVEL_ALL)
    {
      JSONObject doc = null;
      int seq = getLatestSeverSeq(msgList); 
      int maxRowCnt = 0;
      int maxColCnt = 0;
      if (msgList.size() == 0){
        doc = loadJsContent(docUri);
        if(!doc.containsKey(ConversionConstant.REFERENCE))
        {
          String uri = docUri + File.separator + "reference.js";
          JSONObject reference = loadJsFile(uri);
          if(reference != null)
            doc.put(ConversionConstant.REFERENCE, reference);
        }
      }else{
        LOG.log(Level.WARNING, "getCurrentState(docUri, msgList, criteria) is deprecated method for msgList which size is larger than 0");
        return null;
      }
    
      SpreadsheetPartialHelper partialHelper = new SpreadsheetPartialHelper(doc, maxRowCnt, maxColCnt);
      JSONObject pDoc = partialHelper.getCurrentPartialDoc(criteria);
      if(pDoc == null)
        pDoc = doc;
      if (seq > -1)
        pDoc.put("seq", seq);
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(Transformer.class.getName(), "getCurrentState");
      }

      return pDoc;
    }else{
      LOG.log(Level.WARNING, "getCurrentState(docUri, msgList, criteria) is deprecated method for criteria is empty or partial level is all");
      return null;
    }
  }

  public static JSONObject loadJsFile(String uri)
  {
    JSONObject json = null;
    File file = new File(uri);
    if (!file.exists())
      return null;
    try
    {
      FileInputStream fin = new FileInputStream(file);
      json = JSONObject.parse(fin);
      fin.close();
    }
    catch (IOException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return json;
  }

  private static int getLatestSeverSeq(JSONArray msgList)
  {
    int size = msgList.size();
    for(int i=size-1; i>=0; i--)
    {
      JSONObject msg = (JSONObject)msgList.get(i);
      if(msg.containsKey("server_seq")){
        int seq = Integer.parseInt(msg.get("server_seq").toString());
        return seq;
      }
    }
    return -1;
  }
  ////////////////////////////////////////////////////////////////
  ////////////// MESSAGE TRANSFORMATION //////////////////////////
  ////////////////////////////////////////////////////////////////

  private static boolean hasInsDelRowCol(JSONArray msgList) {
	for (int i = 0; i < msgList.size(); i++) {
		JSONObject jsonMsg = (JSONObject) msgList.get(i);
		JSONArray events = (JSONArray) jsonMsg
				.get(ConversionConstant.UPDATES);
		if(events != null) {
			for (int j = 0; j < events.size(); j++) {
				JSONObject event = (JSONObject) events.get(j);
				String action = (String) event.get(ConversionConstant.ACTION);
				JSONObject reference = (JSONObject) event.get(ConversionConstant.REFERENCE);
				String refType = (String) reference.get(ConversionConstant.REF_TYPE);
				if ((action.equalsIgnoreCase(ConversionConstant.ACTION_INSERT) || action.equalsIgnoreCase(ConversionConstant.ACTION_DELETE))
				      && (refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_ROW) || refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_COLUMN))) {
					return true;
				}
			}
		}
	}
	
	return false;
  }
  
  private static boolean isStructChangeMessage(JSONObject jsonMsg)
  {
    boolean ret = false;
    JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
    // TODO use the first event
    JSONObject event = (JSONObject) events.get(0);
    String action = (String) event.get(ConversionConstant.ACTION);
    JSONObject reference = (JSONObject) event.get(ConversionConstant.REFERENCE);
    JSONObject data = (JSONObject) event.get(ConversionConstant.DATA);
    String usage = "";
	if(data!=null) {
		usage = (String) data.get(ConversionConstant.RANGE_USAGE);
	}
    String refType = (String) reference.get(ConversionConstant.REF_TYPE);
    if (((action.equalsIgnoreCase(ConversionConstant.ACTION_INSERT) || action.equalsIgnoreCase(ConversionConstant.ACTION_DELETE)) && !refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_UNNAMERANGE))|| 
        action.equalsIgnoreCase(ConversionConstant.ACTION_MOVE) ||
        (action.equalsIgnoreCase(ConversionConstant.ACTION_SET) && refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_SHEET))||
        (!action.equalsIgnoreCase(ConversionConstant.ACTION_DELETE) && refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_UNNAMERANGE) && usage!=null && usage.equalsIgnoreCase("ACCESS_PERMISSION")) ||
        (action.equalsIgnoreCase(ConversionConstant.ACTION_SET) && refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_RANGE) && usage!=null && usage.equalsIgnoreCase("names"))||
        action.equalsIgnoreCase(ConversionConstant.ACTION_MERGE) || action.equalsIgnoreCase(ConversionConstant.ACTION_SPLIT)
        || action.equalsIgnoreCase(ConversionConstant.ACTION_FILTER))
      ret = true;

    return ret;
  }
  
  private static boolean hasStructChangeMessage(JSONArray msgList)
  {
    boolean ret = false;

    for (int i = 0; i < msgList.size(); ++i)
    {
      JSONObject jsonMsg = (JSONObject) msgList.get(i);
      if (isContentMessage (jsonMsg) && isStructChangeMessage(jsonMsg))
      {
        ret = true;
        break;
      }
    }

    return ret;
  }
  
  /*
   * update the current IDManager by   
   * @param idm         current IDManager 
   * according to both message action and content create new id if id doesn't exist for cell address
   * @return            true if successfully update IDManager
   *                    false if fail to update IDManager
   */
  private static boolean updateIDManager(IDManager idm, Message message)
  {
    boolean success = true;
    
    //transformMessageByIndex (idm, message,false);
    
    if (message.isStructChange())
      success = updateIDManagerByAction (idm, message, false);
    
    return success;
  }
  
  /*
   * update IDManager according to message action: delete, insert, move or rename sheet
   * 
   * @param reverse            true, apply reverse action to IDManager
   */
  private static boolean updateIDManagerByAction(IDManager idm, Message message, boolean reverse)
  {
    return message.updateIDManager(idm, reverse);
  }

  /*
   * Traverse transformBase to update IDManager by message action
   */
  private static void transformIDManager(IDManager idm, JSONArray jsonMsgList, boolean reverse,List<Message> incomingList)
  {
    if (reverse)
    {
      for (int i = jsonMsgList.size() - 1; i >= 0; --i)
      {
        JSONObject jsonMsg = (JSONObject) jsonMsgList.get(i);
        if (!isContentMessage(jsonMsg)) continue;
        JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
        List<Message> msgList = Message.fromJSONArray(events, idm);
        for (int j = 0; j < msgList.size(); ++j) {
          Message message = msgList.get(j);
          if (!message.isStructChange()) continue;
        
          updateIDManagerByAction(idm, message, true);
        }
      }
    }
    else
    {
      for (int i = 0; i < jsonMsgList.size(); ++i)
      {
        JSONObject jsonMsg = (JSONObject) jsonMsgList.get(i);
        if (!isContentMessage(jsonMsg)) continue;
        JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
        List<Message> msgList = Message.fromJSONArray(events, idm);
        for (int j = 0; j < msgList.size(); ++j) {
          Message message = msgList.get(j);
          if (!message.isStructChange()) continue;
        
          updateIDManagerByAction(idm, message, false);
          
          for(int t=0;t<incomingList.size();t++)
            incomingList.get(t).updateIndex(message);
        }
      }
    }
  }

  /*
   * Use IDManager to transform message's refValue and data from index to id
   */
  private static void transformMessageByIndex(IDManager idm, Message message,boolean bCreat)
  {
    message.transformRefByIndex(idm,bCreat);
    message.transformDataByIndex(idm);
  }

  /*
   * Use IDManager to transform message's refValue and data from id to index
   * @return        true if successfully transformed
   *                false otherwise
   */
  private static boolean transformMessageById(IDManager idm, Message message)
  {
    boolean success = true;
    
    success = message.transformRefById(idm);
    if (!success) return success;
    
    return message.transformDataById(idm);
  }
  
  
  private static TransformResult checkSemanticConflict(JSONObject jsonMsg,JSONArray baseJSONMsgList)
  {
	  for(int i = 0; i < semanticConflictCheckList.size(); i++)
	  {
		  ISemanticConflictCheck checker = semanticConflictCheckList.get(i);
		  if(checker.preCondition(jsonMsg, baseJSONMsgList))
		  {
			  TransformResult res = checker.conflictCheck(jsonMsg, baseJSONMsgList);
			  if(res!=TransformResult.ACCEPT)
				  return res;
		  }
	  }
	  return TransformResult.ACCEPT;
  }
  
  /*
   * check whether it's content message or not 
   * need to filter out non-content message such as comments and task message etc
   */

  public static boolean isContentMessage(JSONObject jsonMsg)
  {
	  if(null == jsonMsg.get(ConversionConstant.UPDATES))
		  return false;
	  else {
	    JSONArray updates = (JSONArray)jsonMsg.get(ConversionConstant.UPDATES);
	    JSONObject update = (JSONObject)updates.get(0);
	    JSONObject reference = (JSONObject)update.get(ConversionConstant.REFERENCE);
	    if ((reference != null) && (reference.get(ConversionConstant.REF_TYPE).equals("fragment")))
	      return false;
	  }
	  
	  return true;
  }
  
  //get the sheet name from a json event
  private static String getSheetNameOfEvent(JSONObject jsonEvent)
  {
    String sheetName = null;
    JSONObject reference = (JSONObject) jsonEvent.get(ConversionConstant.REFERENCE);
    String refType = (String) reference.get(ConversionConstant.REF_TYPE);
    String refValue = (String) reference.get(ConversionConstant.REF_VALUE);
    if(refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_SHEET))
    {
      sheetName = refValue.split("\\|")[0];
    }
    else
    {
      ReferenceParser.ParsedRef ref = ReferenceParser.parse(refValue);
      sheetName = ref.getSheetName();
    }
    
    return sheetName;
  }
  
  /**
   * Get a map from old sheet name to new sheet name.
   * If baseJSONMsgList contains rename sheet message, a map will created: oldname:newname.
   * @param baseJSONMsgList: the message list
   * @return a map from old sheet name to new sheet name.
   */
  private static HashMap<String,String> getSheetMap(JSONArray baseJSONMsgList)
  {
    HashMap<String,String> new2OldMap = new HashMap<String,String>();
    for(int j=0;j<baseJSONMsgList.size();j++)
    {
      JSONObject msg = (JSONObject)baseJSONMsgList.get(j);
      if (!isContentMessage(msg)) 
        continue;
      JSONArray msgEvents = (JSONArray) msg.get(ConversionConstant.UPDATES);
      for(int t=0;t<msgEvents.size();t++)
      {
        JSONObject jsonEvent = (JSONObject) msgEvents.get(t); 
        String oldName = getSheetNameOfEvent(jsonEvent);
        
        String action = (String) jsonEvent.get(ConversionConstant.ACTION);
        JSONObject reference = (JSONObject) jsonEvent.get(ConversionConstant.REFERENCE);
        String refType = (String) reference.get(ConversionConstant.REF_TYPE);
        //rename sheet
        if(refType.equalsIgnoreCase(ConversionConstant.REF_TYPE_SHEET) && action.equalsIgnoreCase(ConversionConstant.ACTION_SET))
        {
          JSONObject data = (JSONObject)jsonEvent.get(ConversionConstant.DATA);
          JSONObject sheet = (JSONObject)data.get("sheet");
          String newName = (String)sheet.get("sheetname");
          String oriName = new2OldMap.remove(oldName);
          if(oriName==null)
            oriName = oldName;
          new2OldMap.put(newName, oriName);
        }
      }
    }
    HashMap<String,String> old2NewMap = new HashMap<String,String>();
    Iterator<Entry<String, String>> itor = new2OldMap.entrySet().iterator();
    while(itor.hasNext())
    {
      Entry<String, String> entry = itor.next();
      old2NewMap.put(entry.getValue(), entry.getKey());
    }
    return old2NewMap;
  }
  
  /**
   * Get all the sheet name that used in incoming message
   * @param incomingEvents
   * @param baseJSONMsgList
   * @return
   */
  private static ArrayList<String> getReferedSheets(JSONArray incomingEvents,JSONArray baseJSONMsgList)
  {
    HashMap<String,String> sheetNameMap = getSheetMap(baseJSONMsgList);
    ArrayList<String> sheetList = new ArrayList<String>();
    for(int i=0;i<incomingEvents.size();i++)
    {
      String sheetName = getSheetNameOfEvent((JSONObject)incomingEvents.get(i));
      String newName = sheetNameMap.get(sheetName);
      if(newName==null)
        newName = sheetName;
      if(!sheetList.contains(newName))
        sheetList.add(newName);
    }
    
    for(int i =0; i<baseJSONMsgList.size(); i++)
    {
    	JSONObject msg = (JSONObject)baseJSONMsgList.get(i);    	
    	JSONArray msgEvents = (JSONArray) msg.get(ConversionConstant.UPDATES);
    	if(msgEvents==null){
    		LOG.log(Level.WARNING, "OT base message does not have updates body : {0}", msg.toString() );
    		continue;
    	}
    	for(int t=0;t<msgEvents.size();t++)
        {
    		String sheetName = getSheetNameOfEvent((JSONObject)msgEvents.get(t));
	        String newName = sheetNameMap.get(sheetName);
	        if(newName==null)
	          newName = sheetName;
	        if(!sheetList.contains(newName))
	          sheetList.add(newName);
         }
    }
  
    return sheetList;
  }  
  /*
   * message transformation
   */
  public static TransformResult transform(JSONObject jsonMsg, JSONArray baseJSONMsgList, IDManager idm)
  {
	TransformResult conflict = TransformResult.ACCEPT;
    if (!isContentMessage(jsonMsg) || !isOperationMessage(jsonMsg)) 
      return TransformResult.ACCEPT;
    
    Object obAtomic = jsonMsg.get(ConversionConstant.ATOMIC);
    boolean atomicMsg = (obAtomic != null) ? ((Boolean)obAtomic).booleanValue() : false;
    
    JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
    List<Message> msgList = Message.fromJSONArray(events, idm);
    
    //  check if transformBase contains any message that causes document structure change
    if (baseJSONMsgList.size() == 0 || !hasStructChangeMessage(baseJSONMsgList))
    {
      // no need to do message transformation
      // use the message to update current IDManager
      for (int i = 0; i < msgList.size(); ++i)
        updateIDManager(idm, msgList.get(i));
      
      return TransformResult.ACCEPT;
    }
    
    int length =  msgList.size();
    
    if(hasInsDelRowCol(baseJSONMsgList))
    {
	    for (int i = 0; i < length; i++) 
	    {
	        Message message = msgList.get(i);
	        if(message instanceof RangeMsg && message.action == Action.Set)
	        {
	          ((RangeMsg)message).transformData();
	        }
	    }
    }

    ArrayList<String> sheetList = getReferedSheets(events,baseJSONMsgList);
    // make a copy of current IDManager
    IDManager tim = new IDManager(idm,sheetList);
    // get one temporary IDManager that is associated with current message
    transformIDManager(tim, baseJSONMsgList, true,msgList);
    
    // transform message from index to id with the temporary IDManager
    for (int i = 0; i < msgList.size(); ++i)  
      transformMessageByIndex(tim, msgList.get(i),true);

    // apply all messages in transformBase to the temporary IDManager
    transformIDManager(tim, baseJSONMsgList, false, msgList);

    boolean [] flag = new boolean[length];
    for (int i = 0; i < length; ++i) 
    {
        Message message = msgList.get(i);
        // now get the latest version of temporary IDManager
        // transform message from id to index with the latest version of temporary IDManager 
        flag[i] = transformMessageById(tim, message);
		if(flag[i])
        	message.toJSON(idm);
    }
    for(int i = length -1; i >= 0; i--)
    {
    	if(!flag[i])
    	{
    		if(atomicMsg){ //drop atomic message if any contained event conflict with base message.
    			msgList.clear();
    			events.clear();
    			break;
    		}
    		else{
    			msgList.remove(i);
    			events.remove(i);
    			
    		}
    	}
    }
    if(msgList.size() == 0)
    	conflict = TransformResult.IGNORE;
    
    if(conflict==TransformResult.ACCEPT)
    {
    	conflict = checkSemanticConflict(jsonMsg, baseJSONMsgList);
    }
    if(conflict == TransformResult.SPLIT)
    {
    	for (int i = 0; i < length; ++i) 
        {
    		if(flag[i])
    		{
    			Message message = msgList.get(i);    			
        		JSONArray jsonEvents = message.getEvents(tim);
        		boolean splited = jsonEvents != null;
        		if (splited)
        		{
            		//if message is setunnamerange and splited, add events.
        			events.remove(i);
        			events.addAll(i, jsonEvents);
        		}
    		}    			
        }
    	conflict = TransformResult.ACCEPT;
    }
    if (conflict==TransformResult.ACCEPT) {
      boolean success = true;
      // update the latest version of IDManager with transformed message
      for (int i = 0; i < msgList.size(); ++i) {
        success = updateIDManager (idm, msgList.get(i));
        if (!success) {
          conflict = TransformResult.CONFLICT;
          break;
        }
      }
    }
    
    return conflict;
  }
  
  private static class NodeCalcWork implements Work
  {
    private DraftDescriptor draft;
    private String targetPath;
    private String calcId;
    private long seq;
    private int status;
    
    private int retryNum;
    
    private boolean bCanceled;
    
    NodeCalcWork(DraftDescriptor draftDesc, String targetPath, String calcId, long savedSequence)
    {
      this.draft = draftDesc;
      this.targetPath = targetPath;
      this.calcId = calcId;
      this.seq = savedSequence;
    }
    
    public void cancelCalc()
    {
      bCanceled = true;
    }

    public int getStatusCode()
    {
      return status;
    }
    
    public long getSeq()
    {
      return seq;
    }
    
    private HttpClient createHttpClient()
    {
      HttpClient httpClient = new DefaultHttpClient(connManager);
      int count = connManager.getConnectionsInPool();
      LOG.info("Count of http connections in connection pool is " + count);
      HttpParams clientParams = httpClient.getParams();
      clientParams.setParameter("http.socket.timeout", socketTimeout);
//      clientParams.setParameter("http.connection.timeout", connectionTimeOut);
      clientParams.setParameter("http.connection-manager.timeout", connManagerTimeout);
      return httpClient;
    }
    
    public void run()
    {
      try
      {
        LOG.entering(this.getClass().getName(), "start", new Object[] { draft.getURI() });

        HttpClient httpClient = createHttpClient();
        List<NameValuePair> params = new ArrayList<NameValuePair>();
        StringBuffer buf = new StringBuffer();
        try
        {
          params.add(new BasicNameValuePair("path", targetPath));
          params.add(new BasicNameValuePair("seq", String.valueOf(seq)));
          String parameterString = URLEncodedUtils.format(params, "utf-8");
  
          buf.append(HTTP_URL);
          buf.append(URLEncoder.encode(draft.getDocId(), "utf-8"));
          if (calcId != null)
          {
            buf.append("/");
            buf.append(URLEncoder.encode(calcId, "utf-8"));
          }
          buf.append("?");
          buf.append(parameterString);
        }
        catch (UnsupportedEncodingException e)
        {
          LOG.log(Level.WARNING, "NodeJS Action: Have not send the calc request succesfully due to unsupport encoding exception." + targetPath, e);
          return;
        }

        HttpPost post = null;
        HttpEntity entity = null;
        
        while( (retryNum++ < RETRY_NUM) && !bCanceled )
        {
          try
          {
            post = new HttpPost(buf.toString());
            if (bCanceled)
              break;
            HttpResponse resp = httpClient.execute(post);
            entity = resp.getEntity();
            status = resp.getStatusLine().getStatusCode();
            switch (status)
              {
                case 204 :
                  LOG.log(Level.INFO, "NodeJS Action: Stop the previous calculation " + targetPath);
                  break;
                case 202 :
                  LOG.log(Level.INFO, "NodeJS Action: Start calculation " + targetPath);
                  break;
                case 500 :
                  LOG.log(Level.INFO, "NodeJS Action: Start calc request return wrong for calculation exception or serialzation error " + targetPath);
                  break;
                case 503 :
                  LOG.log(Level.INFO, "NodeJS Action: Server can not handle this calc request due to heavy work load " + targetPath);
                  break;
                default:
                  LOG.log(Level.INFO, "NodeJS Action: Not expected status code {0} {1}", new Object[] { status, targetPath });
                  break;
              }
            
            if (status == 202 || status == 204 || status == 500)
            {
              calcThreads.remove(this.draft.getDocId());
              break;
            }
            else if(calcId != null)
            {
              // publish calc thread status is not right, should return directly
              break;
            }
          }
          catch (ClientProtocolException e)
          {
            LOG.log(Level.WARNING, "NodeJS Action: Have not send the calc request succesfully due to Client protocol error. " + targetPath, e);
            post.abort();
          }
          catch (SocketTimeoutException e)
          {
            LOG.log(Level.WARNING, "NodeJS Action: Have not send the calc request succesfully due to Socket connection is timed out." + targetPath, e);
            post.abort();
          }
          catch (IOException e)
          {
            LOG.log(Level.WARNING, "NodeJS Action: Have not send the calc request succesfully due to IO error happened." + targetPath, e);
            post.abort();
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "NodeJS Action: Have not send the calc request succesfully due to Unknown error happened." + targetPath, e);
            post.abort();
          }
          finally
          {
            try
            {
              if(entity != null)
                EntityUtils.consume(entity);
            }catch(IOException e)
            {
            }
            if (status == 202 || status == 204 || status == 500)
            {
              calcThreads.remove(this.draft.getDocId());
              break;
            }
            else if(calcId != null)
            {
              // publish calc thread status is not right, should return directly
              break;
            }
            else
            {
              LOG.log(Level.WARNING, "NodeJS Action: Retry to send calc task to NodeJS" + targetPath);
              try
              {
                Thread.sleep(RETRY_INTERVAL);
              }
              catch (InterruptedException e)
              {
                LOG.log(Level.WARNING, "NodeJS Action: NodeJS Thread has been interrupted when retry to send calc request");
              }
            }
          }
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "NodeJS Action: Have not send the calc request succesfully due to Unknown error happened." + targetPath, e);
      }
      finally
      {
        LOG.exiting(this.getClass().getName(), "end", new Object[] { draft.getURI() });
      }
    }

    public void release()
    {
    }
  }
}