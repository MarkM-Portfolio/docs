/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.document.services;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.ImportDocumentContext;
import com.ibm.concord.spi.draft.IDraftJSONObjectSerializer;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public interface IDocumentService
{
  public void init(JSONObject config);
  
  public String getDraftFormatVersion();
  
  public enum TransformResult {ACCEPT,CONFLICT,IGNORE,SPLIT};

  /**
   * Check if a base message is a OT candidate with incoming message
   * @param baseMsg
   *        base message itself
   * @param msg
   *        incoming message
   * @return true if the base message need to be added to transform base list
   */
  public boolean isTransformCandidate(JSONObject baseMsg, JSONObject msg);

  /**
   * Called when an incoming message need to be transformed. Document implementation should perform their own OT algorithm in this method.
   * The input of transforming message and result of transformed message use the same parameter. After transformation, the message will be
   * published to clients, and append to transformed list
   * 
   * @param msgData
   *          the message will be transformed, it's also a return value of transformed message
   * @param baseMsgList
   *          messages you need to transform with one by one, null if none    
   * @param OTContext
   * 		  Document context for operation transform usage      
   * @return TransformResult(ACCEPT,CONFLICT,IGNORE)
   */
  public TransformResult transformMessage(JSONObject msgData, JSONArray baseMsgList, Object OTContext);

  /**
   * Called when messages should be merged to document model, then save to draft storage.
   * 
   * @param msgList
   *          messages should be merged
   * @param draftDes
   *          the instance of DraftDescriptor        
   */
  public void applyMessage(DraftDescriptor draftDes, JSONArray msgList, boolean isClosed) throws Exception;

  /**
   * Called when a client wants to get partial or whole content of the document model according to the criteria.
   * 
   * @param draftDes
   *         the draft document reference
   * @param msgList
   *         messages have been transformed, but need to be merged to document model      
   * @param criteria
   *         specifies the condition of getting the content, can get partial content of the document model through this parameter.
   *         null means all
   * @return JSON representation of current document model, detailed format is determined by document type.
   */
  public JSONObject getCurrentState(DraftDescriptor draftDes, JSONArray msgList, JSONObject criteria) throws Exception;


  /**
   * Generate the draft content of one revision
   * 
   * @param user
   *          caller of the request
   * @param docEntry
   *          reference of the IDocumentEntry
   * @param major
   *          major revision number
   * @param minor
   *          minor revision number
   * @return draft descriptor
   * @throws Exception
   */
  public DraftDescriptor generateDraftForRevision(UserBean user, IDocumentEntry docEntry, int major, int minor) throws Exception;
  
  /**
   * Restore the draft content from one revision
   * 
   * @param user
   *          caller of the request
   * @param docEntry
   *          reference of the IDocumentEntry
   * @param major
   *          major revision number
   * @param minor
   *          minor revision number
   * @return draft descriptor
   * @throws Exception
   */
  public DraftDescriptor restoreDraftFromRevision(UserBean user, IDocumentEntry docEntry, int major, int minor) throws Exception;

  /**
   * Called when a client wants to publish current draft document as a new version on repository.
   * @param docEntry
   *        reference of the IDocumentEntry
   * @param caller
   *          caller of this request
   * @param requestData
   *          request data posted by client, if any
   * @param msgList
   *          unflushed message list in document session, if any
   * @param overwrite -- overwrite current version in the repository
   * @return new value for IDocumentEntry
   * @throws Exception
   */
  public IDocumentEntry publish(IDocumentEntry docEntry, UserBean caller, JSONObject requestData, JSONArray msgList, boolean overwrite) throws Exception;
  
  /**
   * Called when a client wants to save current draft document as new document on repository.
   * @param docEntry
   *        reference of the IDocumentEntry
   * @param caller caller of this request
   * 
   * @param requestData request data posted by client, if any
   * 
   * @param msgList unflushed message list in document session, if any
   * @return new value for IDocumentEntry
   */
  public IDocumentEntry saveAs(IDocumentEntry docEntry, UserBean caller, JSONObject requestData, JSONArray msgList) throws Exception;

  /**
   * Called when a client wants to get a section of the document model.
   * 
   * @param sectionId
   *          id of section
   * @param   draftDes
   *          reference of the draft document       
   * @param masterDoc
   *          the combined string with repository and uri of the master doc 
   * @return JSON representation of section content of current document model, detailed format is determined by document type.
   */
  public JSONObject getSection(DraftDescriptor draftDes,JSONArray msgList, String sectionId, String masterDoc);

  /**
   * Called when it need to import a document from repository to Concord for EDIT. Document service implementation may need to perform conversion
   * job, modify or initialize the document if necessary, then, store the document content in draft storage.
   * 
   * @param caller
   *          caller of this request
   * @param entry
   *          entry to describe the document on repository
   * @param parameters
   *          parameters to convert the document
   * @return new value for IDocumentEntry
   * @throws Exception
   */
  public IDocumentEntry importDocument(UserBean caller, IDocumentEntry entry, ImportDocumentContext paramters) throws Exception;

  /**
   * Create a new document, on specific repository
   * @param caller
   *        caller of this request
   * @param repository
   *        repository id for the creating document.
   *        e.g, "lcfiles" or "concord.storage"
   * @param folderUri
   *        parent folder uri for the creating document.
   *        e.g, null for personal Files of current login user or {widgetId!communityId} or UUID like id string for community Files.
   * @param data
   *        Different document can specify there own data format here.
   *        e.g, specify document title, default content, or which template should use
   * @return
   *        new value for IDocumentEntry
   * @throws Exception
   */
  public IDocumentEntry createDocument(UserBean caller, String repository, String folderUri, JSONObject data) throws Exception;
  
  /**
   * 
   * @param caller
   * @param repository
   * @param folderUri
   * @param data
   * @param upload
   *        If upload the new document to repository
   * @param docEntry
   *        The docEntry to generate draft
   * @return
   * @throws Exception
   */
  public IDocumentEntry createDocument(UserBean caller, String repository, String folderUri, JSONObject data, IDocumentEntry docEntry) throws Exception;

  /**
   * Call this API to convert a document to another format, e.g, html, pdf, etc.
   * If the input draft descriptor is not null, which indicate the content need to get from latest draft content,
   * if null, which indicate the content need to be get from repository
   * @param caller
   *        caller of this request
   * @param docEntry
   *        IDocumentEntry which represents the document in repository
   * @param targetExtension
   *        target format
   * @param options
   *        any additional options for export
   * @param toDir
   *        directory that need to put result in
   * @param draftDesc
   *        true if need to export document from draft content
   * @return
   *        if the result is a single file (e.g pdf), then return is the file path to the result file.
   *        if the result is a set of files (e.g html), then return is the file path to the result folder.
   * @throws Exception
   */
  public String export(UserBean caller, IDocumentEntry docEntry, String targetExtension, String toDir, Map<String, Object> options, DraftDescriptor draftDesc) throws Exception;
  
  /**
   * forward the request to document's editor JSP page
   * @param caller
   *        caller of this request
   * @param docEntry
   *        IDocumentEntry which represents the document in repository
   * @param request
   * @param response
   */
  public void forwardEditPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;
  
  /**
   * forward the request to document's viewer JSP page
   * @param caller
   *        caller of this request
   * @param docEntry
   *        IDocumentEntry which represents the document in repository
   * @param request
   * @param response
   */
  public void forwardViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;

  /**
   * forward the request to document's revision view JSP page
   * @param caller
   *        caller of this request
   * @param docEntry
   *        IDocumentEntry which represents the document in repository
   * @param request
   * @param response
   */
  public void forwardRevisionViewPage(UserBean caller, IDocumentEntry docEntry, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;  
  
  /**
   * Get the config of document service
   * @return config of JSONObject
   */
  public JSONObject getConfig();
  
  /**
   * clear the useless files in the draft
   */
  public void clearup(DraftDescriptor draftDes);
  /**
   * Get file path(relative) name list that are preserved by document types 
   * Word processor as an example, "content.html" is a preserved file name
   * @return
   *        List of preserved file path
   */
  List<String> getPreservedFileNameList();
  
  /**
   * Get the OTContext for session 
   * 
   *  @return
   *        IDManager for spreadsheet
   */  
  Object genOTContext(DraftDescriptor draftDes) throws Exception;
  
  /**
   * Get the json output of OTContext
   * @param draftDes
   * @return json object
   */
  public JSONObject OTContextSerialize(DraftDescriptor draftDes);
 
  /**
   * remove the client's information from OTContext
   * @param draftDes
   * @param userBean
   */
  public void removeOTContext(DraftDescriptor draftDes, String clientId);
  
  public String getSubmittedContent(String content);
  
  public IDocumentEntry createDocumentFromTemplate(UserBean caller, IDocumentEntry entry, String repository, String folderUri,
      JSONObject data) throws Exception;
  
  /**
   * Process the leave information when user leave. Only spreadsheet will call this interface in current version
   * @param caller
   * @param docId
   * @param data.  For spreadsheet: {leftSheet:xxx}, xxx is the last visited sheet name of the caller.
   */
  public void processLeaveData(UserBean caller, String docId, JSONObject data);
  
  /**
   * Process the Suspicious Content before message be publish to clients
   * @param Message 
   */
  public JSONObject processSuspiciousContent(JSONObject message);
  
  /**
   * Check if document's content exceed limitation on iPad, like max-row, max-pages, etc.
   * @param draftDes
   * 		reference of the draft document
   * @return json
   *         {
   *         	"result" : "true",  //if exceed limit, set "true", else "false"(then ignore remaining two items)
   *            "error_code" : "1501", //this error code 150x should be defined in Class OutOfCapacityException 
   *                                     for each document type, and must process this error in ErrorScene.js
   *            "error_message" : "50" //this message should be used in ErrorScene for detailed cause, like 
   *                                     "The presentation cannot be opened, because it contains more than ${error_message} pages." 
   *         }
   */
  public JSONObject exceedContentLimit(DraftDescriptor draftDes);

  /**
   * Do something before save draft, such as copy the calculation result
   * @param savedSequence 
   */
  public void preSaveDraft(DraftDescriptor draftDescriptor);
  
  /**
   * Do something after save draft, such as start calculation in spreadsheet
   * @param savedSequence 
   */
  public void postSaveDraft(DraftDescriptor draftDescriptor, long savedSequence);

  public boolean isDraftNeedFix(DraftDescriptor draftDescriptor,
		JSONObject result);

  public JSONObject fixDraft(DraftDescriptor draftDescriptor, JSONObject result);

  public  Map<String, JSONObject> getFixedDraftSectionPair(DraftDescriptor draftDescriptor, JSONObject result);

  public IDraftJSONObjectSerializer getJSONSerializer();
  
}
