/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.lc3.task;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.namespace.QName;

import org.apache.abdera.Abdera;
import org.apache.abdera.factory.Factory;
import org.apache.abdera.i18n.iri.IRI;
import org.apache.abdera.model.Category;
import org.apache.abdera.model.Content.Type;
import org.apache.abdera.model.Document;
import org.apache.abdera.model.Element;
import org.apache.abdera.model.Entry;
import org.apache.abdera.model.ExtensibleElement;
import org.apache.abdera.model.Feed;
import org.apache.abdera.protocol.client.AbderaClient;
import org.apache.abdera.protocol.client.ClientResponse;
import org.apache.abdera.protocol.client.RequestOptions;

import com.ibm.concord.lc3.Constants;
import com.ibm.concord.lc3.util.HttpClientInvoker;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.TaskAction;
import com.ibm.concord.spi.beans.TaskBean;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.exception.ActivityAccessException;
import com.ibm.concord.spi.task.IActivityAdapter;
import com.ibm.docs.common.security.CookieHelper;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ConnectionsActivityAdapter implements IActivityAdapter
{

  private static final String logName = ConnectionsActivityAdapter.class.getName();
  
  private static final String ASSOCITION_TYPE = "ACTIVITY"; // Activity type
  
  private static final Logger LOG = Logger.getLogger(logName);

  private String ACTIVITIES_URI;

  private String ACTIVITY_BASEURI;

  private String ACTIVITYACL_BASEURI;

  private String ACTIVITYNODE_BASEURI;

  private String TODOS_URI;

  private String CHILD_BASEURI;
  
  private static final String USER_AGENT = "User-Agent";

  public static final String OWNER = "owner";

  public static final String LABEL = "label";

  public static final String SCHEME = "scheme";

  public static final String DUEDATE = "duedate";

  public static final String COMPONENT = "component";

  public static final String ACTIVITY_CATEGORY_TERM = "activity";

  public static final String ENTRY_CATEGORY_TERM = "entry";

  public static final String ACTIVITY_CATEGORY_LABEL = "Activity";

  public static final String ENTRY_CATEGORY_LABEL = "Entry";

  public static final String TODO_CATEGORY_TERM = "todo";

  public static final String TODO_CATEGORY_LABEL = "To Do";

  public static final String PERSON_CATEGORY_TERM = "person";
  
  public static final String COMMUNITY_CATEGORY_TERM = "community";

  public static final String TODOFINISH_CATEGORY_TERM = "completed";

  public static final String CUSTOMFIELD_ASSIGNEE = "Assignee";

  public static final String CUSTOMFIELD_REVIEWER = "Reviewer";

  public static final String CUSTOMFIELD_STATE = "State";

  public static final String CUSTOMFIELD_DOCID = "docid";
  
  public static final String CUSTOMFIELD_CREATEDATE = "createDate";
  
  public static final String CUSTOMFIELD_FRAGID = "fragid";

  public static final String CUSTOMFIELD_ACTIONTYPE = "type";

  public static final String PREFIX_UUID = "urn:lsid:ibm.com:oa:";

  public static final String CATEGORY_SCHEME = "http://www.ibm.com/xmlns/prod/sn/type";

  public static final String SNX_SCHEME = "http://www.ibm.com/xmlns/prod/sn";

  public static final String ACTIVITY_SCHEME = "http://www.ibm.com/xmlns/prod/sn/activities";

  public static final String FLAG_SCHEME = "http://www.ibm.com/xmlns/prod/sn/flags";

  public static final String THR_SCHEME = "http://purl.org/syndication/thread/1.0";

  public static final String ATOM_SCHEME = "http://www.w3.org/2005/Atom";

  public static final QName QNAME_ACTIVITY = new QName(SNX_SCHEME, "activity", "snx");

  public static final QName QNAME_ROLE = new QName(SNX_SCHEME, "role", "snx");

  public static final QName QNAME_ASSIGNEDTO = new QName(SNX_SCHEME, "assignedto", "snx");

  public static final QName QNAME_DUEDATE = new QName(SNX_SCHEME, "duedate", "snx");

  public static final QName QNAME_FIELD = new QName(SNX_SCHEME, "field", "snx");
  
  public static final QName QNAME_USERID = new QName(SNX_SCHEME, "userid", "snx");

  public static final QName QNAME_PERSONEMAIL = new QName(ATOM_SCHEME, "email");

  public static final QName QNAME_TEXTSUMMARY = new QName(ATOM_SCHEME, "summary");

  public static final QName QNAME_REPLY = new QName(THR_SCHEME, "in-reply-to", "thr");

  private Abdera ABDERA;

  private Factory FACTORY;
  private HttpClientInvoker sonataInvoker;
  private String userAgent;

  public ConnectionsActivityAdapter()
  {
    ABDERA = new Abdera();
    FACTORY = ABDERA.getFactory();
  }

  public String addActivity(UserBean caller, String label, String content, String tag, Date dueDate) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addActivity entering:" + label + ", " + content + ", " + tag + ", " + dueDate + ", " + caller.getId());
    }
    Entry entry = createActivityEntry(label, content, tag, dueDate);
    AbderaClient client = new AbderaClient(ABDERA);
    
    client.addCookies(CookieHelper.getAllCookies());
    RequestOptions options = new RequestOptions();
    options.setHeader(USER_AGENT, userAgent); 
    ClientResponse cr = client.post(ACTIVITIES_URI, entry, options);

    int status = cr.getStatus();
    if (status != 200 && status != 201)
    {
      LOG.warning("failed to addActivity(" + label + ", " + content + ", " + tag + ", " + dueDate + ") " + caller.getId());
      throw new ActivityAccessException( "Unable to create activity", ActivityAccessException.EC_CREATE_ACTIVITY);
    }

    entry = (Entry) cr.getDocument().getRoot();
    String activityId = entry.getExtension(QNAME_ACTIVITY).getText();
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addActivity exiting: activityId=" + activityId);
    }
    return activityId;
  }
  
  public boolean isActivityExist(String activityId)
  {
//  AbderaClient client = new AbderaClient(ABDERA);
//  client.addCookies(CookieHelper.getAllCookies());
//  ClientResponse cr = client.get(ACTIVITY_BASEURI + activityId);
    
    try {
        //sonataInvoker.sendGetMessage(ACTIVITY_BASEURI + activityId + "&nodetype=activities");
    }
    catch(Exception e)
    {
        LOG.log(Level.WARNING, "Failed to get activity information");
        return false;
    }
    return true;
  }

  public JSONArray getAllActivities(UserBean caller) throws AccessException
  {
    AbderaClient client = new AbderaClient(ABDERA);
    client.addCookies(CookieHelper.getAllCookies());
    RequestOptions options = new RequestOptions();
    options.setHeader(USER_AGENT, userAgent);
    ClientResponse cr = client.get(ACTIVITIES_URI, options);

    int status = cr.getStatus();
    if (status != 200 && status != 201)
    {
      LOG.warning("failed to get all activities of " + caller.getId());
      throw new ActivityAccessException("Unable to get all activities", ActivityAccessException.EC_GET_ACTIVITY);
    }

    JSONArray activities = new JSONArray();

    Feed feed = (Feed) cr.getDocument().getRoot();
    List<Entry> entries = feed.getEntries();

    for (int i = 0; i < entries.size(); i++)
    {
      Entry entry = entries.get(i);
      JSONObject activity = new JSONObject();
      String id = entry.getId().toString();
      activity.put("activityId", id.toString().substring(PREFIX_UUID.length()));
      activity.put("activityName", entry.getTitle());

      activities.add(activity);
    }

    return activities;
  }
  
  public String getActivityTitle(UserBean caller, String activityId) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getActivityTitle entering: activityId=" + activityId);
    }

    String title = null;
    try{
        Document<Element> doc = sonataInvoker.sendGetMessage(caller, ACTIVITY_BASEURI + activityId + "&nodetype=activities");
        Feed entry = (Feed)doc.getRoot();
        title = entry.getTitle();
    }catch(Exception e){
	    throw new ActivityAccessException( "Unable to get activity's title", ActivityAccessException.EC_ACTIVITY_GETTITLE);     	
    }
    
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getActivityTitle exiting: activityId=" + activityId +", title=" + title);
    }
   
    return title;
    
  }

  private Entry createActivityEntry(String label, String content, String tag, Date dueDate)
  {
    Entry entry = FACTORY.newEntry();
    if (label != null)
    {
      entry.setTitle(label);
    }
    else
    {
      entry.setTitle("Unknown Title"); // TODO NLS
    }

    entry.addCategory(ACTIVITY_CATEGORY_TERM);
    entry.getCategories().get(0).setAttributeValue(LABEL, ACTIVITY_CATEGORY_LABEL);
    entry.getCategories().get(0).setAttributeValue(SCHEME, CATEGORY_SCHEME);
    if (tag != null)
    {
      entry.addCategory(tag);
    }

    if (content != null)
    {
      entry.setContent(content, Type.TEXT);
    }

    if (dueDate != null)
    {
      Element element = entry.addExtension(QNAME_DUEDATE);
      entry.setUpdated(dueDate);
      element.setText(entry.getUpdatedElement().getText());
    }

    entry.setUpdated(new Date());
    return entry;
  }

  public boolean addPerson(UserBean caller, String activityId, String name, String id) throws AccessException
  {
    return addMember(caller, activityId, name, id, Constants.MEMBER_TYPE_USER);
  }
  
  /**
   * Add a member for specified activity.
   * 
   * @param caller specifies the requester
   * @param activityId specifies the activity id
   * @param name specifies the member name
   * @param id specifies the member id
   * @param type specifies the member type, three types are supported: "person", "community", "group"
   * 
   */
  public boolean addMember(UserBean caller, String activityId, String name, String id, String type) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addMember entering: " + activityId + ", " + name + ", " + id + ", " + caller.getId() + ", " + type);
    }
    Entry entry = createMemberEntry(name, id, type);
    try
    {
        sonataInvoker.sendPostMessage(caller, ACTIVITYACL_BASEURI + activityId, entry, false);
    }
    catch (Exception e)
    {
        throw new ActivityAccessException( "Unable to add a member to activity owner list", ActivityAccessException.EC_ACTIVITY_ADDPERSON);     
    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addMember exiting");
    }
    return true;
  }

  public String getPersonRole(String activityId, String userId) throws AccessException
  {
	  String role = null;
	  if (LOG.isLoggable(Level.FINER))
	  {
	    LOG.finer("getPersonRole entering: " + activityId + ", " + userId);
	  }

/*	  Document doc = sonataInvoker.sendGetMessage( ACTIVITYACL_BASEURI + activityId);
	  Feed feed = (Feed) doc.getRoot();
	  List<Entry> entries = feed.getEntries();
	  for (Entry entry : entries)
	  {
		  Person person = entry.getContributors().get(0);
		  String id = person.getExtension(QNAME_USERID).getText();
		  if (id.equals(userId)){
			  role = person.getExtension(QNAME_ROLE).getText();
			  break;
		  }		  
	  }*/

	  if (LOG.isLoggable(Level.FINER))
	  {
	    LOG.finer("getPersonRole exiting");
	  }
	  
	  return role;
  }
  
  /**
   * 
   * @param name
   * @param memberId
   * @param type specifies the type of member, such as: "person" and "community".
   * @return
   */
  private Entry createMemberEntry(String name, String memberId, String type)
  {
    Entry entry = FACTORY.newEntry();
    entry.setTitle(name);
    entry.addContributor(name);
  
    // entry.getContributors().get(0).setEmail(email);
    // entry.getContributors().get(0).setUri(email);
    Element element = entry.getContributors().get(0).addExtension(QNAME_USERID);
    element.setText(memberId);
    
    if (Constants.MEMBER_TYPE_COMMUNITY.equalsIgnoreCase(type))
    {
      entry.addCategory(COMMUNITY_CATEGORY_TERM);
    }
    else
    {
      entry.addCategory(PERSON_CATEGORY_TERM);
    }
    entry.getCategories().get(0).setAttributeValue(SCHEME, CATEGORY_SCHEME);

    Element role = entry.addExtension(QNAME_ROLE);
    role.setAttributeValue(COMPONENT, ACTIVITY_SCHEME);
    role.setText(OWNER);
    return entry;
  }

  private Entry createTodoEntry(TaskBean task)
  {
    Entry entry = FACTORY.newEntry();
    if (task.getTitle() != null)
    {
      entry.setTitle(task.getTitle());
    }
    else
    {
      entry.setTitle("Unknown Title"); // TODO NLS
    }

    entry.addCategory(TODO_CATEGORY_TERM);
    entry.getCategories().get(0).setAttributeValue(LABEL, TODO_CATEGORY_LABEL);
    entry.getCategories().get(0).setAttributeValue(SCHEME, CATEGORY_SCHEME);
    if (task.getTag() != null)
    {
      entry.addCategory(task.getTag());
    }

    if (task.getContent() != null)
    {
      entry.setContent(task.getContent(), Type.HTML);
    }

    if (task.getDuedate() != null)
    {
      Element element = entry.addExtension(QNAME_DUEDATE);
      entry.setUpdated(task.getDuedate());
      element.setText(entry.getUpdatedElement().getText());
    }

    if (task.getOwner() != null)
    {
      ExtensibleElement element = entry.addExtension(QNAME_ASSIGNEDTO);
 
      element.setAttributeValue("userid", task.getOwner());
    }

    if (task.getAssignee() != null)
    {
      ExtensibleElement assigneeField = entry.addExtension(QNAME_FIELD);
      assigneeField.setAttributeValue("name", CUSTOMFIELD_ASSIGNEE);
      assigneeField.setAttributeValue("position", "1000");
      assigneeField.setAttributeValue("type", "person");
      Element person = assigneeField.addExtension(QNAME_USERID);
      person.setText(task.getAssignee());
    }

    if (task.getReviewer() != null)
    {
      ExtensibleElement reviewerField = entry.addExtension(QNAME_FIELD);
      reviewerField.setAttributeValue("name", CUSTOMFIELD_REVIEWER);
      reviewerField.setAttributeValue("position", "2000");
      reviewerField.setAttributeValue("type", "person");
      Element person = reviewerField.addExtension(QNAME_USERID);
      person.setText(task.getReviewer());
    }

    if (task.getState() != null)
    {
      ExtensibleElement stateField = entry.addExtension(QNAME_FIELD);
      stateField.setAttributeValue("name", CUSTOMFIELD_STATE);
      stateField.setAttributeValue("position", "3000");
      stateField.setAttributeValue("type", "text");
      Element summary = stateField.addExtension(QNAME_TEXTSUMMARY);
      summary.setText(task.getState());

    }

    if (task.getDocid() != null)
    {
      ExtensibleElement docField = entry.addExtension(QNAME_FIELD);
      docField.setAttributeValue("name", CUSTOMFIELD_DOCID);
      docField.setAttributeValue("position", "4000");
      docField.setAttributeValue("type", "text");
      docField.setAttributeValue("hidden", "true");
      Element doc = docField.addExtension(QNAME_TEXTSUMMARY);
      doc.setText(task.getDocid());
    }

    
    entry.setUpdated(new Date());
    
    ExtensibleElement cdField = entry.addExtension(QNAME_FIELD);
    cdField.setAttributeValue("name", CUSTOMFIELD_CREATEDATE);
    cdField.setAttributeValue("position", "5000");
    cdField.setAttributeValue("type", "date");
    cdField.setAttributeValue("hidden", "true");
    cdField.setText(entry.getUpdatedElement().getText());    

    if (task.getFragid() != null)
    {
      ExtensibleElement docField = entry.addExtension(QNAME_FIELD);
      docField.setAttributeValue("name", CUSTOMFIELD_FRAGID);
      docField.setAttributeValue("position", "6000");
      docField.setAttributeValue("type", "text");
      docField.setAttributeValue("hidden", "true");
      Element doc = docField.addExtension(QNAME_TEXTSUMMARY);
      doc.setText(task.getFragid());
    }

    
    return entry;
  }

  public boolean deleteTodo(UserBean caller, String activityId, String todoId, IDocumentEntry docEntry) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTodo entering: " + activityId + ", " + todoId + ", " + caller.getId());
    }
    
    try
    {
      deleteEntry(todoId);
    }
    catch(AccessException e){
      LOG.warning("deleteTodo: failed to deleteTodo(" + activityId + ", " + todoId + ") " + caller.getId());
      throw e;
    }
    
    List<TaskAction> actions = getActions(caller, activityId, todoId);
    if ((actions != null) && (actions.size() >0))
    {
      for (TaskAction action : actions)
      {
       try{
         deleteEntry(action.getId());
       }catch(AccessException e){
         LOG.warning("deleteTodo: failed to delete action entry(" + activityId + ", " + action.getId() + ") " + caller.getId());
         throw e;
       }
      }
    }
    
    // HTTP/1.1 204 No Content
    // Indicates the activity entry was successfully deleted (and no content
    // is returned).
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTodo exiting");
    }
    return true;
  }

  public List<String> deleteTasks(UserBean caller, String activityId, String docId, String state, IDocumentEntry docEntry) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTasks entering: " + activityId);
    }
    
    List<String> deletedEntries = new ArrayList<String>();
    
    String URL = CHILD_BASEURI + activityId + "&nodetype=activities%2Ftask"; 
    AbderaClient client = new AbderaClient(ABDERA);
    client.addCookies(CookieHelper.getAllCookies());
    RequestOptions options =new RequestOptions();
    options.setHeader(USER_AGENT, userAgent); 
    ClientResponse cr = client.get(URL ,options);

    int status = cr.getStatus();
    if (status != 200)
    {
      LOG.warning("failed to deleteTasks(" + activityId + ") ");
      throw new ActivityAccessException("Unable to delete TODOs in Activity", ActivityAccessException.EC_ACTIVITY_DELETETODO);      
    }

    Feed feed = (Feed) cr.getDocument().getRoot();
    List<Entry> entries = feed.getEntries();
    for (int i = 0; i < entries.size(); i++)
    {
      Entry entry = entries.get(i);
      TaskBean task = this.parseTodoBean(entry);
      if (task.getDocid() != null)
      {
        if (((docId == null) || (docId.equals(task.getDocid()))) 
          && ((state == null) || ( state.equals(task.getState()))))
        {
          boolean bSucc = false;
          try
          {
            bSucc = deleteTodo(caller, activityId, task.getId(), docEntry);
          }
          catch (AccessException e)
          {
            LOG.log(Level.WARNING, "deleteTasks: failed to delete tasks", e);
            throw e;
          }
          if (bSucc)
          {
            deletedEntries.add(task.getId());
          }
        }
      }
    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTasks exiting: activityId=" + activityId + ", state =" + state );
    }
 
    return deletedEntries;
    
  }
  
  private boolean deleteEntry(String entryId) throws AccessException
  {
    AbderaClient client = new AbderaClient(ABDERA);
    client.addCookies(CookieHelper.getAllCookies());
    RequestOptions options =new RequestOptions();
    options.setHeader(USER_AGENT, userAgent); 
    ClientResponse cr = client.delete(ACTIVITYNODE_BASEURI + entryId, options);

    int status = cr.getStatus();
    if (status != 204)
    {
      LOG.warning("failed to deleteEntry(" + entryId + ") ");
      throw new ActivityAccessException("Unable to delete TODO in Activity", ActivityAccessException.EC_ACTIVITY_DELETETODO);      
    }
    
    return true;
  }
  
  // TODO remove this function
  public Map<String, Object> doAction(UserBean caller, String activityId, String todoId, boolean finish, IDocumentEntry docEntry) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("doAction entering: " + activityId + ", " + todoId + ", " + finish + ", " + caller.getId());
    }

    Entry entry = null;
    if (finish)
    {
      TaskBean task = getTask(caller, activityId, todoId);
      task.setState(TaskBean.COMPLETE);
      task = updateTask(caller, task, docEntry);
      entry = getTodoEntry(caller, activityId, todoId);
    }
    else
    {
      entry = getTodoEntry(caller, activityId, todoId);

      String url = ACTIVITYNODE_BASEURI + todoId;
      entry = restoreTodoEntry(entry);

      AbderaClient client = new AbderaClient(ABDERA);
      client.addCookies(CookieHelper.getAllCookies());
      RequestOptions options =new RequestOptions();
      options.setHeader(USER_AGENT, userAgent); 
      ClientResponse cr = client.put(url, entry, options);

      int status = cr.getStatus();
      if (status < 200 || status >= 300)
      {
        LOG.warning("failed to doAction(" + activityId + ", " + todoId + ", " + finish + ") " + caller.getId() + " RETURN:" + status);
        throw new ActivityAccessException("Unable to change Todo in Activity", ActivityAccessException.EC_ACTIVITY_CHANGETODO);
      }
      entry = (Entry) cr.getDocument().getRoot();
    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("exiting");
    }
    return getState(entry);
  }

  private Entry restoreTodoEntry(Entry oldEntry)
  {
    Entry entry = FACTORY.newEntry();
    if (oldEntry.getTitle() != null)
    {
      entry.setTitle(oldEntry.getTitle());
    }
    else
    {
      entry.setTitle("Unknown Title"); // TODO NLS
    }

    List<Category> categories = oldEntry.getCategories();
    for (int i = 0; i < categories.size(); i++)
    {
      Category category = categories.get(i);
      if (!category.getTerm().toString().equalsIgnoreCase(TODOFINISH_CATEGORY_TERM))
      {
        entry.addCategory(category);
      }
    }

    if (oldEntry.getContentElement() != null)
    {
      entry.setContent(oldEntry.getContentElement());
    }

    List<Element> extensionList = oldEntry.getExtensions();
    for (int i = 0; i < extensionList.size(); i++)
    {
      entry.addExtension(extensionList.get(i));
    }
    entry.setUpdated(new Date());
    return entry;
  }

  // TODO remove this action
  private Map<String, Object> getState(Entry entry)
  {
    TaskBean task = this.parseTodoBean(entry);
    Map<String, Object> props = new HashMap<String, Object>();
    if (task != null)
    {
      if (task.getState().equals(TaskBean.COMPLETE))
      {
        props.put("state", "done");
      }
      else
      {
        props.put("state", "undone");
      }

      if (task.getOwner() != null)
      {
        props.put("assignee", task.getOwner());
      }
    }

    return props;
  }

  // TODO remove this function
  public JSONArray getAllTodos(UserBean caller, String assignedTo, String state)
  {
    JSONArray actArray = new JSONArray();
    AbderaClient client = new AbderaClient(ABDERA);
    client.addCookies(CookieHelper.getAllCookies());
    RequestOptions options =new RequestOptions();
    options.setHeader(USER_AGENT, userAgent); 
    
    String encode = "";
    try
    {
      encode = URLEncoder.encode(assignedTo, "utf-8");
    }
    catch (UnsupportedEncodingException e)
    {
      LOG.log(Level.WARNING, "error encoding for user's email: " + assignedTo, e);
    }

    ClientResponse cr = client.get(TODOS_URI + "?assignedto=" + encode, options);

    int status = cr.getStatus();
    if (status != 200)
    {
      return null;
    }

    Feed feed = (Feed) cr.getDocument().getRoot();
    List<Entry> entries = feed.getEntries();
    for (int i = 0; i < entries.size(); i++)
    {
      Entry entry = entries.get(i);

      JSONObject todoJSON = new JSONObject();
      if (entry.getCategories(FLAG_SCHEME).size() > 0)
        continue;
      else
        todoJSON.put("state", "undone");

      todoJSON.put("todoId", entry.getId().toString().substring(PREFIX_UUID.length()));
      todoJSON.put("assignee", entry.getExtension(QNAME_ASSIGNEDTO).getAttributeValue(QNAME_USERID));
      todoJSON.put("activityId", entry.getExtension(QNAME_ACTIVITY).getText());
      todoJSON.put("label", entry.getTitle());
      todoJSON.put("content", entry.getContent());

      actArray.add(todoJSON);
    }

    return actArray;
  }

  // TODO remove this function
  public Map<String, Object> getState(UserBean caller, String activityId, String todoId) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getState entering: " + activityId + ", " + todoId + ", " + caller.getId());
    }

    Map<String, Object> map = getState(getTodoEntry(caller, activityId, todoId));
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getState exiting: " + activityId + ", " + todoId + ", " + caller.getId());
    }

    return map;
  }

  private Entry getTodoEntry(UserBean caller, String activityId, String todoId) throws AccessException
  {
    AbderaClient client = new AbderaClient(ABDERA);
    client.addCookies(CookieHelper.getAllCookies());
    RequestOptions options =new RequestOptions();
    options.setHeader(USER_AGENT, userAgent);     
    ClientResponse cr = client.get(ACTIVITYNODE_BASEURI + todoId, options);

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getTodoEntry: url is: " + ACTIVITYNODE_BASEURI + todoId);
    }

    int status = cr.getStatus();
    if (status != 200)
    {
      throw new ActivityAccessException("Unable to access Todo", ActivityAccessException.EC_ACTIVITY_GETTODO);
    }

    Entry entry = (Entry) cr.getDocument().getRoot();
    return entry;
  }

  public void init(JSONObject config)
  {
    String server = (String) config.get(SERVER_KEY);
    ACTIVITIES_URI = server + "/service/atom2/activities";
    ACTIVITY_BASEURI = server + "/service/atom2/activity?activityUuid=";
    ACTIVITYACL_BASEURI = server + "/service/atom2/acl?activityUuid=";
    ACTIVITYNODE_BASEURI = server + "/service/atom2/activitynode?activityNodeUuid=";
    TODOS_URI = server + "/service/atom2/todos";
    CHILD_BASEURI = server + "/service/atom2/descendants?nodeUuid=";
    
    String j2cAlias = (String) config.get("j2c_alias");
    sonataInvoker = new HttpClientInvoker(j2cAlias);
    userAgent = ConcordUtil.getUserAgent("Activities");
  }

  // ////////////////newly updated API/////////////////////////////
  public TaskBean addTodo(UserBean caller, TaskBean task, IDocumentEntry docEntry) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addTodo2 entering: " + task.toString());
    }

    Entry entry = createTodoEntry(task);
    AbderaClient client = new AbderaClient(ABDERA);
    client.addCookies(CookieHelper.getAllCookies());
    RequestOptions options =new RequestOptions();
    options.setHeader(USER_AGENT, userAgent);     
    ClientResponse cr = client.post(ACTIVITY_BASEURI + task.getActivity(), entry, options);

    int status = cr.getStatus();
    if (status != 200 && status != 201)
    {
      LOG.warning("failed to addTodo" + task.toString() + ", " + caller.getId());
      throw new ActivityAccessException("Unable to create Todo", ActivityAccessException.EC_ACTIVITY_CREATETODO);
    }

    entry = (Entry) cr.getDocument().getRoot();
//    IRI id = entry.getId();
//    String todoId = id.toString().substring(PREFIX_UUID.length());
//    task.setId(todoId);
    task = parseTodoBean(entry);

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addTodo2 exiting: todoId=" + task.getId());
    }
    return task;
  }

  private TaskBean parseTodoBean(Entry todoEntry)
  {
    TaskBean task = new TaskBean();
    task.setId(todoEntry.getId().toString().substring(PREFIX_UUID.length()));
    task.setTitle(todoEntry.getTitle());
    String content = todoEntry.getContent();
    if (content != null){
      content = content.replaceAll("^(\\n\\s*\\t)*", "");
    }else{
      content = "";
    }
    task.setContent(content);
    Element owner = todoEntry.getExtension(QNAME_ASSIGNEDTO);
    if (owner != null)
      task.setOwner(owner.getAttributeValue("userid"));
    Element activity = todoEntry.getExtension(QNAME_ACTIVITY);
    if (activity != null)
      task.setActivity(todoEntry.getExtension(QNAME_ACTIVITY).getText());

    Element authorId = todoEntry.getAuthor().getExtension(QNAME_USERID);
    task.setAuthor(authorId.getText());
    try
    {
      Element duedate = todoEntry.getExtension(QNAME_DUEDATE);
      if (duedate != null)
      {
        //Date date = DateFormat.getInstance().parse(duedate.getText());
        String strDate = duedate.getText().replace('T', ' ').replaceAll("Z", " GMT");
        Date date = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss ZZZ").parse(strDate);
        task.setDuedate(date);
      }
    }
    catch (ParseException e)
    {
      LOG.warning("getTodoBean: Error to parse duedate:" + e.getLocalizedMessage());
    }
    List<Element> extensions = todoEntry.getExtensions(QNAME_FIELD);
    for (Element extension : extensions)
    {
      if (extension.getAttributeValue("name").equalsIgnoreCase(CUSTOMFIELD_ASSIGNEE))
      {
        List<Element> assigneeElements = extension.getElements();
        for (Element element : assigneeElements)
        {
          if (element.getQName().equals(QNAME_USERID))
          {
            task.setAssignee(element.getText());
            break;
          }
        }

      }
      else if (extension.getAttributeValue("name").equalsIgnoreCase(CUSTOMFIELD_REVIEWER))
      {
        List<Element> reviewerElements = extension.getElements();
        for (Element element : reviewerElements)
        {
          if (element.getQName().equals(QNAME_USERID))
          {
            task.setReviewer(element.getText());
            break;
          }
        }
      }
      else if (extension.getAttributeValue("name").equalsIgnoreCase(CUSTOMFIELD_STATE))
      {
        List<Element> stateElements = extension.getElements();
        for (Element element : stateElements)
        {
          if (element.getQName().equals(QNAME_TEXTSUMMARY))
          {
            task.setState(element.getText());
            break;
          }
        }
      }
      else if (extension.getAttributeValue("name").equalsIgnoreCase(CUSTOMFIELD_DOCID))
      {
        List<Element> docElements = extension.getElements();
        for (Element element : docElements)
        {
          if (element.getQName().equals(QNAME_TEXTSUMMARY))
          {
            task.setDocid(element.getText());
            break;
          }
        }
      }

      else if (extension.getAttributeValue("name").equalsIgnoreCase(CUSTOMFIELD_CREATEDATE))
      {
        String theDate = extension.getText();
        if(theDate!= null){
           	String strDate = theDate.replaceAll("\n","").trim();
           	strDate = strDate.replace('T', ' ').replaceAll("Z", " GMT"); 
            try {
            	Date date = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss ZZZ").parse(strDate); 
				task.setCreateDate(date);
			} catch (ParseException e) {
				  LOG.warning("getTodoBean: Error to parse createDate:" + e.getLocalizedMessage());
			}
        }
      }
      else if (extension.getAttributeValue("name").equalsIgnoreCase(CUSTOMFIELD_FRAGID))
      {
        List<Element> fragElements = extension.getElements();
        for (Element element : fragElements)
        {
          if (element.getQName().equals(QNAME_TEXTSUMMARY))
          {
            task.setFragid(element.getText());
            break;
          }
        }
        
      }
    }
    return task;
  }

  private TaskAction parseAction(Entry entry)
  {
    String id = entry.getId().toString().substring(PREFIX_UUID.length());
    String creator = entry.getAuthor().getEmail();
    String summary = entry.getTitle();
    String comment = entry.getContent();
    String type = null;
    Element extension = getCustomElement(entry, CUSTOMFIELD_ACTIONTYPE);
    List<Element> docElements = extension.getElements();
    for (Element element : docElements)
    {
      if (element.getQName().equals(QNAME_TEXTSUMMARY))
      {
        type = element.getText();
        break;
      }
    }

    Element reply = entry.getExtension(QNAME_REPLY);
    String taskId = null;
    if (reply != null)
    {
      taskId = reply.getAttributeValue("ref").substring(PREFIX_UUID.length());
    }

    Date datetime = entry.getUpdated();

    return new TaskAction(id, creator, type, taskId, summary, comment, datetime, null);
  }

  private Element getCustomElement(Entry entry, String name)
  {
    List<Element> extensions = entry.getExtensions(QNAME_FIELD);
    for (Element extension : extensions)
    {
      if (extension.getAttributeValue("name").equalsIgnoreCase(name))
      {
        return extension;
      }
    }
    return null;
  }

  private Entry updateTodoEntry(Entry todoEntry, TaskBean task)
  {
    String todoId = todoEntry.getId().toString().substring(PREFIX_UUID.length());
    String taskId = task.getId();

    if ((todoId == null) || (taskId == null))
      return null;

    if (!todoId.equals(taskId))
    {
      LOG.warning("updateTodoEntry: the given todo is different from the given task. Todo id " + todoId + ", task id " + taskId);
      return null;
    }

    if (task.getTag() != null)
    {
      List<Category> categories = todoEntry.getCategories();
      boolean bNewTag = true;
      for (Category category : categories)
      {
        if (category.getTerm().equals(task.getTag()))
        {
          bNewTag = false;
          break;
        }
      }
      if (bNewTag)
        todoEntry.addCategory(task.getTag());
    }

    if (task.getContent() != null)
    {
      todoEntry.setContent(task.getContent(), Type.HTML);
    }

    if (task.getTitle() != null)
    {
      todoEntry.setTitle(task.getTitle());
    }

    Element duedateElement = todoEntry.getExtension(QNAME_DUEDATE);
    if (task.getDuedate() == null)
    {
      if (duedateElement != null)
        duedateElement.discard();

    }
    else
    {
      if (duedateElement == null)
      {
        duedateElement = todoEntry.addExtension(QNAME_DUEDATE);
      }
      todoEntry.setUpdated(task.getDuedate());
      duedateElement.setText(todoEntry.getUpdatedElement().getText());
    }

    ExtensibleElement ownerElement = todoEntry.getExtension(QNAME_ASSIGNEDTO);
    if (task.getOwner() == null)
    {
      if (ownerElement != null)
      {
        ownerElement.setText("");
      }
    }
    else
    {
      if (ownerElement != null)
        ownerElement.discard();
      ownerElement = todoEntry.addExtension(QNAME_ASSIGNEDTO);
      ownerElement.setAttributeValue("userid", task.getOwner());
    }

    Element assigneeElement = this.getCustomElement(todoEntry, CUSTOMFIELD_ASSIGNEE);
    if (task.getAssignee() == null)
    {
      if (assigneeElement != null)
      {
        assigneeElement.discard();
      }
    }
    else
    {
      Element person = null;
//      if (assigneeElement != null)
//        assigneeElement.discard();
//      assigneeElement = todoEntry.addExtension(QNAME_FIELD);
//      assigneeElement.setAttributeValue("name", CUSTOMFIELD_ASSIGNEE);
//      assigneeElement.setAttributeValue("position", "1000");
//      assigneeElement.setAttributeValue("type", "person");
//
//      person = ((ExtensibleElement) assigneeElement).addExtension(QNAME_USERID);
      if (assigneeElement == null){
       assigneeElement = todoEntry.addExtension(QNAME_FIELD);
      assigneeElement.setAttributeValue("name", CUSTOMFIELD_ASSIGNEE);
      assigneeElement.setAttributeValue("position", "1000");
      assigneeElement.setAttributeValue("type", "person");

      person = ((ExtensibleElement) assigneeElement).addExtension(QNAME_USERID);
      }else{
        List<Element> elements = assigneeElement.getElements();
        for (Element element: elements)
        {
          element.discard();
        }
       person = ((ExtensibleElement) assigneeElement).addExtension(QNAME_USERID);
      }

      person.setText(task.getAssignee());
    }

    Element reviewerElement = this.getCustomElement(todoEntry, CUSTOMFIELD_REVIEWER);
    if (task.getReviewer() == null)
    {
      if (reviewerElement != null)
      {
        reviewerElement.discard();
      }
    }
    else
    {
      Element person = null;
//      if (reviewerElement != null)
//          reviewerElement.discard();
//
//      reviewerElement = todoEntry.addExtension(QNAME_FIELD);
//      reviewerElement.setAttributeValue("name", CUSTOMFIELD_REVIEWER);
//      reviewerElement.setAttributeValue("position", "2000");
//      reviewerElement.setAttributeValue("type", "person");
//
//      person = ((ExtensibleElement) reviewerElement).addExtension(QNAME_USERID);
      if (reviewerElement == null){

        reviewerElement = todoEntry.addExtension(QNAME_FIELD);
        reviewerElement.setAttributeValue("name", CUSTOMFIELD_REVIEWER);
        reviewerElement.setAttributeValue("position", "2000");
        reviewerElement.setAttributeValue("type", "person");
    
        person = ((ExtensibleElement) reviewerElement).addExtension(QNAME_USERID);
      }
      else{
        List<Element> elements = reviewerElement.getElements();
        for (Element element: elements)
        {
          element.discard();
        }
       person = ((ExtensibleElement) reviewerElement).addExtension(QNAME_USERID);
      }
      person.setText(task.getReviewer());

    }

    Element stateElement = this.getCustomElement(todoEntry, CUSTOMFIELD_STATE);
    if (task.getState() == null)
    {
      if (stateElement != null)
        stateElement.discard();
    }
    else
    {
      Element summary = null;
      if (stateElement == null)
      {
        stateElement = todoEntry.addExtension(QNAME_FIELD);
        stateElement.setAttributeValue("name", CUSTOMFIELD_STATE);
        stateElement.setAttributeValue("position", "3000");
        stateElement.setAttributeValue("type", "text");
      }
      else
      {
        List<Element> stateElements = stateElement.getElements();
        for (Element element : stateElements)
        {
          if (element.getQName().equals(QNAME_TEXTSUMMARY))
          {
            summary = element;
            break;
          }
        }
      }
      if (summary == null)
      {
        summary = ((ExtensibleElement) stateElement).addExtension(QNAME_TEXTSUMMARY);
        summary.setText(task.getState());
      }
      summary.setText(task.getState());     
      
      if (task.getState().equals(TaskBean.COMPLETE))
      {// complete this To-do entry
        Category category = FACTORY.newCategory();
        category.setTerm(TODOFINISH_CATEGORY_TERM);
        category.setAttributeValue(SCHEME, FLAG_SCHEME);
        category.setAttributeValue(LABEL, (new Date()).toString());
        todoEntry.addCategory(category);
      }else
      {// remove the complete category
        List<Category> categories = todoEntry.getCategories();
        for (Category category : categories)
        {
          if (category.getTerm().equals(TODOFINISH_CATEGORY_TERM)){
             category.discard();
             break;
          }
        }
      }
    }
    Element docElement = this.getCustomElement(todoEntry, CUSTOMFIELD_DOCID);
    if(task.getDocid()!= null && docElement == null){
    	      
    	docElement = todoEntry.addExtension(QNAME_FIELD);
    	docElement.setAttributeValue("name", CUSTOMFIELD_DOCID);
    	docElement.setAttributeValue("position", "4000");
    	docElement.setAttributeValue("type", "text");
    	docElement.setAttributeValue("hidden", "true");
         
    	Element summary = ((ExtensibleElement) docElement).addExtension(QNAME_TEXTSUMMARY);
        summary.setText(task.getDocid());           	 
    }
    
    Element fragElement = this.getCustomElement(todoEntry, CUSTOMFIELD_FRAGID);
    if (task.getFragid() == null)
    {
      if (fragElement != null)
        fragElement.discard();
    }
    else
    {
      Element summary = null;
      if (fragElement == null)
      {
        fragElement = todoEntry.addExtension(QNAME_FIELD);
        fragElement.setAttributeValue("name", CUSTOMFIELD_FRAGID);
        fragElement.setAttributeValue("position", "6000");
        fragElement.setAttributeValue("type", "text");
        fragElement.setAttributeValue("hidden", "true");
      }
      else
      {
        List<Element> fragElements = fragElement.getElements();
        for (Element element : fragElements)
        {
          if (element.getQName().equals(QNAME_TEXTSUMMARY))
          {
            summary = element;
            break;
          }
        }
      }
      if (summary == null)
      {
        summary = ((ExtensibleElement) fragElement).addExtension(QNAME_TEXTSUMMARY);
        summary.setText(task.getFragid());
      }
      summary.setText(task.getFragid());    
    }
    

    
    Element cdateElement = this.getCustomElement(todoEntry, CUSTOMFIELD_CREATEDATE);
    if(task.getCreateDate()!= null && cdateElement == null){
    	
    	cdateElement = todoEntry.addExtension(QNAME_FIELD);
        cdateElement.setAttributeValue("name", CUSTOMFIELD_CREATEDATE);
        cdateElement.setAttributeValue("position", "5000");
        cdateElement.setAttributeValue("type", "date");
        cdateElement.setAttributeValue("hidden", "true");    	 
    	todoEntry.setUpdated(task.getCreateDate());
    	cdateElement.setText(todoEntry.getUpdatedElement().getText());            	 
    }

    todoEntry.setUpdated(new Date());
    
    return todoEntry;
  }

  public TaskBean getTask(UserBean caller, String activityId, String todoId) throws AccessException
  {
    TaskBean task = null;
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getTask entering: " + todoId);
    }

    try
    {
      Entry todoEntry = getTodoEntry(caller, null, todoId);
      task = parseTodoBean(todoEntry);
    }
    catch (AccessException e)
    {
      LOG.warning("getTask: No such todo found in activities,todoId=" + todoId);
      throw e;
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getTask exiting: " + todoId);
    }

    return task;
  }

  public TaskBean updateTask(UserBean caller, TaskBean task, IDocumentEntry docEntry ) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("updateTask entering: " + task.toString());
    }

    Entry todoEntry = getTodoEntry(caller, task.getActivity(), task.getId());
    todoEntry = this.updateTodoEntry(todoEntry, task);
    if (todoEntry == null)
    {
      throw new ActivityAccessException("Unable to change Todo " + task.getId() + " in Activity", ActivityAccessException.EC_ACTIVITY_CHANGETODO);
    }
    else
    {
      String url = ACTIVITYNODE_BASEURI + task.getId();

      AbderaClient client = new AbderaClient(ABDERA);
      client.addCookies(CookieHelper.getAllCookies());
      RequestOptions options =new RequestOptions();
      options.setHeader(USER_AGENT, userAgent);       
      ClientResponse cr = client.put(url, todoEntry,options);

      int status = cr.getStatus();
      if (status < 200 || status >= 300)
      {
        LOG.warning("failed to updateTodo(" + task.getActivity() + ", " + task.getId() + ") " + caller.getId() + " RETURN:" + status);
        throw new ActivityAccessException("Unable to change Todo in Activity", ActivityAccessException.EC_ACTIVITY_CHANGETODO);
      }

      Entry entry = (Entry) cr.getDocument().getRoot();
      task = parseTodoBean(entry);
      
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("updateTask exiting");
    }
    return task;
  }

  private Entry createActionHistoryEntry(TaskAction action)
  {
    Entry entry = FACTORY.newEntry();
    if (action.getSummary() != null)
    {
      entry.setTitle(action.getSummary());
    }
    else
    {
      entry.setTitle(action.getType());
    }

    entry.addCategory(ENTRY_CATEGORY_TERM);
    entry.getCategories().get(0).setAttributeValue(LABEL, ENTRY_CATEGORY_LABEL);
    entry.getCategories().get(0).setAttributeValue(SCHEME, CATEGORY_SCHEME);

    if (action.getDescription() != null)
    {
      entry.setContent(action.getDescription(), Type.HTML);
    }

    if (action.getType() != null)
    {
      ExtensibleElement typeField = entry.addExtension(QNAME_FIELD);
      typeField.setAttributeValue("name", CUSTOMFIELD_ACTIONTYPE);
      typeField.setAttributeValue("position", "1000");
      typeField.setAttributeValue("type", "text");
      Element summary = ((ExtensibleElement) typeField).addExtension(QNAME_TEXTSUMMARY);
      summary.setText(action.getType());
    }

    if (action.getTaskid() != null)
    {
      Element reply = entry.addExtension(QNAME_REPLY);
      reply.setAttributeValue("ref", PREFIX_UUID + action.getTaskid());
      reply.setAttributeValue("href", ACTIVITYNODE_BASEURI + action.getTaskid());
    }
    if (action.getCreateDate() != null)
    {
      entry.setUpdated(action.getCreateDate());
    }
    else
    {
      entry.setUpdated(new Date());
    }
    return entry;
  }

  public void addActionHistory(UserBean caller, TaskAction action, String activityId) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addActionHistory entering: " + action.toString());
    }

    Entry entry = createActionHistoryEntry(action);
    AbderaClient client = new AbderaClient(ABDERA);
    client.addCookies(CookieHelper.getAllCookies());
    RequestOptions options =new RequestOptions();
    options.setHeader(USER_AGENT, userAgent);     
    ClientResponse cr = client.post(ACTIVITY_BASEURI + activityId, entry,options);

    int status = cr.getStatus();
    if (status != 200 && status != 201)
    {
      LOG.warning("failed to addTodo" + action.toString() + ", " + caller.getId());
      throw new ActivityAccessException("Unable to create action history", ActivityAccessException.EC_ACTIVITY_ADDTODOHISTORY);
    }

    entry = (Entry) cr.getDocument().getRoot();
    IRI id = entry.getId();
    String entryId = id.toString().substring(PREFIX_UUID.length());

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addActionHistory exiting: entryid=" + entryId);
    }
  }

  public List<TaskBean> getTasks(UserBean caller, String activityId, String docId, boolean bStrict) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getTasks entering: " + activityId);
    }
    List<TaskBean> tasks = new ArrayList<TaskBean>();
    String URL = CHILD_BASEURI + activityId + "&nodetype=activities%2Ftask&sortfileds=POSITION&sortorder=0";
    AbderaClient client = new AbderaClient(ABDERA);
    client.addCookies(CookieHelper.getAllCookies());
    RequestOptions options =new RequestOptions();
    options.setHeader(USER_AGENT, userAgent);     
    ClientResponse cr = client.get(URL,options);

    int status = cr.getStatus();
    if (status != 200)
    {
	    throw new ActivityAccessException( "Unable to get all tasks", ActivityAccessException.EC_ACTIVITY_GETALLTODOS);	    
    }

    Feed feed = (Feed) cr.getDocument().getRoot();
	List<Entry> entries = feed.getEntries();
	for (int i = 0; i < entries.size(); i++) {
		Entry entry = entries.get(i);
		TaskBean task = this.parseTodoBean(entry);

		if (task.getDocid() != null) {
        if ((docId == null) || (docId.equals(task.getDocid())) || (task.getDocid().endsWith(docId)))
				tasks.add(task);
		} else if (!bStrict) {
			tasks.add(task);
		}
	}
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getTasks exiting: activityId=" + activityId + ", " + tasks.size() + " are found");
    }
    return tasks;
  }

  public List<TaskAction> getActions(UserBean caller, String activityId, String todoId)
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getActions entering: " + todoId);
    }
    List<TaskAction> actions = new ArrayList<TaskAction>();
    String URL = CHILD_BASEURI + todoId + "&nodetype=activities%2Fentry";
    AbderaClient client = new AbderaClient(ABDERA);
    client.addCookies(CookieHelper.getAllCookies());
    RequestOptions options =new RequestOptions();
    options.setHeader(USER_AGENT, userAgent); 

    ClientResponse cr = client.get(URL,options);
    int status = cr.getStatus();
    if (status != 200)
    {
      return null;
    }

    Feed feed = (Feed) cr.getDocument().getRoot();
    List<Entry> entries = feed.getEntries();
    for (int i = 0; i < entries.size(); i++)
    {
      Entry entry = entries.get(i);
      TaskAction action = this.parseAction(entry);
      actions.add(action);
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getActions exiting: todoId=" + todoId + ", " + actions.size() + " actions are found");
    }
    return actions;

  }
}
