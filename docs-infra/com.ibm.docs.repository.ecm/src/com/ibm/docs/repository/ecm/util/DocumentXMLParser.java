package com.ibm.docs.repository.ecm.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentXMLParser extends DefaultHandler
{
  private static final Logger logger = Logger.getLogger(DocumentXMLParser.class.getName());  
 
  private SAXParserFactory parserFactory = SAXParserFactory.newInstance();  
  
  public static final String AUTHOR = "author";
  
  public static final String LOCK_OWNER = "lockowner";
  
  public static final String MODIFIER = "modifier";
  
  public static final String CCM_USER_UID = "id";
  
  public static final String CCM_USER_EMAIL = "email";
  
  public static final String CCM_USER_NAME = "name";
  
  public static final String APPROVAL_PROCESS = "approvalProcess";
  
  public static final String APPROVAL_STATE = "approvalState";
  
  public static final String APPROVAL_SCOPE = "approvalScope";
  
  private static final String APPROVAL_SELF = "approverSelf";
  
  public static final String APPROVAL_TYPE = "approverType";
  
  public static final String APPROVAL_ID = "approverId";
  
  public static final String LOCKED = "locked";
  
  public static final String APPROVERS = "approvers";
  
  public static final String GLOBAL_APPROVAL_PROP = "globalApprovalProperties";
  
  private static final String LOCKED_TAG = "td:locked";
  
  private static final String LOCK_OWNER_TAG = "td:lockOwner";
  
  private static final String MODIFIER_TAG = "td:modifier";
  
  private static final String LOCK_OWNER_UID_TAG = "td:uid";
  
  private static final String LOCK_OWNER_EMAIL_TAG = "td:email";
  
  private static final String LOCK_OWNER_NAME_TAG = "td:name";
  
  private static final String AUTHOR_TAG = "author";
  
  private static final String AUTHOR_UID_TAG = "td:uid";
  
  private static final String AUTHOR_EMAIL_TAG = "email";
  
  private static final String AUTHOR_NAME_TAG = "name";

  
  private static final String APPROVAL_PROCESS_TAG = "td:approvalProcess";
  
  private static final String APPROVAL_APPROVER_TAG = "td:approver";
  
  private static final String APPROVAL_STATE_TAG = "td:approvalState";
  
  private static final String APPROVAL_SCOPE_TAG = "td:approvalScope";
  
  private static final String APPROVAL_SELF_TAG = "td:approverSelf";
  
  private static final String APPROVAL_TYPE_TAG = "td:approverType";
  
  private static final String APPROVAL_ID_TAG = "td:approverId";
    
  boolean loadLockOwner = false;
  
  boolean loadModifier = false;
  
  boolean loadAuthor = false;
  
  private JSONObject lockowner;
  
  private JSONObject author;
  
  private JSONObject modifier;
  
  private Boolean locked;
  
  private String loadProp;
  
  private String approveProcess;
  
  private String globalApproveState;
  
  private JSONObject approver = null;
  
  private JSONArray approvers = new JSONArray();
  
  private StringBuilder sb = new StringBuilder();
  
  public DocumentXMLParser(InputStream is)
  {
    this.init(is);
  }
  
  private void init(InputStream is) 
  {
    SAXParser parser = null;
    try
    {
      parser = parserFactory.newSAXParser();
      parser.parse(is, this);
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Unable to read the DocumentEntry.", e);
    }
    finally
    {
      try
      {
        is.close();
      }
      catch (IOException e)
      {
        logger.log(Level.SEVERE, "Unable to close InputStream for the DocumentEntry.", e);
      }
    }  
  }
  
  public JSONObject getJson()
  {    
    JSONObject globalJson = new JSONObject();
    globalJson.put(APPROVAL_PROCESS, approveProcess);
    globalJson.put(APPROVAL_STATE, globalApproveState);
    
    JSONObject json = new JSONObject();
    json.put(APPROVERS, approvers);
    json.put(GLOBAL_APPROVAL_PROP, globalJson);
    json.put(AUTHOR, author);
    if(lockowner != null)
    {
      json.put(LOCK_OWNER, lockowner);
    }
    else
    {
      json.put(LOCK_OWNER, author);
    }
    if(modifier != null)
    {
      json.put(MODIFIER, modifier);
    }
    json.put(LOCKED, locked);
    return json;
  }
  
  private void initStringBuilder()
  {
    sb.setLength(0);
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    loadProp = null;
    if(LOCK_OWNER_TAG.equalsIgnoreCase(qName))
    {
      loadLockOwner = true;
      lockowner = new JSONObject();
    }
    if(MODIFIER_TAG.equalsIgnoreCase(qName))
    {
      loadModifier = true;
      modifier = new JSONObject();
    }
    if(AUTHOR_TAG.equalsIgnoreCase(qName))
    {
      loadAuthor = true;
      author = new JSONObject();
    }    
    if (APPROVAL_APPROVER_TAG.equals(qName))
    {      
      approver = new JSONObject();
    }
    
    if(LOCKED_TAG.equalsIgnoreCase(qName))
    {
      loadProp = qName;
      initStringBuilder();
    }

    
    if(APPROVAL_PROCESS_TAG.equalsIgnoreCase(qName))
    {
      loadProp = qName;
      initStringBuilder();
    }
    if(qName.equalsIgnoreCase(APPROVAL_STATE_TAG) ||
        qName.equalsIgnoreCase(APPROVAL_SCOPE_TAG) ||
        qName.equalsIgnoreCase(APPROVAL_SELF_TAG) ||
        qName.equalsIgnoreCase(APPROVAL_TYPE_TAG) ||
        qName.equalsIgnoreCase(APPROVAL_ID_TAG))
    {
      loadProp = qName;
      initStringBuilder();
    }
    
    if(qName.equalsIgnoreCase(LOCK_OWNER_UID_TAG) ||
       qName.equalsIgnoreCase(LOCK_OWNER_EMAIL_TAG) ||
       qName.equalsIgnoreCase(LOCK_OWNER_NAME_TAG))
    {
      if(loadLockOwner || loadModifier)
      {
        loadProp = qName; 
        initStringBuilder();
      }   
    }
    
    if(qName.equalsIgnoreCase(AUTHOR_UID_TAG) ||
        qName.equalsIgnoreCase(AUTHOR_EMAIL_TAG) ||
        qName.equalsIgnoreCase(AUTHOR_NAME_TAG))
     {
       if(loadAuthor)
       {
         loadProp = qName; 
         initStringBuilder();
       }      
     }
    
  }
  
  public void characters(char ch[], int start, int length) throws SAXException
  {
    if(loadProp != null)
    {
      sb.append(ch, start, length);
    }    
  }
  
  public void endElement(String uri, String localName, String qName) throws SAXException 
  {
    if(loadProp!= null)
    {
      if(loadLockOwner)
      {
        if(loadProp.equalsIgnoreCase(LOCK_OWNER_UID_TAG))
        {
          lockowner.put(CCM_USER_UID, sb.toString());
        }
        if(loadProp.equalsIgnoreCase(LOCK_OWNER_EMAIL_TAG))
        {
          lockowner.put(CCM_USER_EMAIL, sb.toString());
        }
        if(loadProp.equalsIgnoreCase(LOCK_OWNER_NAME_TAG))
        {
          lockowner.put(CCM_USER_NAME, sb.toString());
        }        
      }
      if(loadModifier)
      {
        if(loadProp.equalsIgnoreCase(LOCK_OWNER_UID_TAG))
        {
          modifier.put(CCM_USER_UID, sb.toString());
        }
        if(loadProp.equalsIgnoreCase(LOCK_OWNER_EMAIL_TAG))
        {
          modifier.put(CCM_USER_EMAIL, sb.toString());
        }
        if(loadProp.equalsIgnoreCase(LOCK_OWNER_NAME_TAG))
        {
          modifier.put(CCM_USER_NAME, sb.toString());
        }        
      }
      
      if(loadAuthor)
      {
        if(loadProp.equalsIgnoreCase(AUTHOR_UID_TAG))
        {
          author.put(CCM_USER_UID, sb.toString());
        }
        if(loadProp.equalsIgnoreCase(AUTHOR_EMAIL_TAG))
        {
          author.put(CCM_USER_EMAIL, sb.toString());
        }
        if(loadProp.equalsIgnoreCase(AUTHOR_NAME_TAG))
        {
          author.put(CCM_USER_NAME, sb.toString());
        }        
      }
         
      if(approver!=null)
      {
        if(loadProp.equalsIgnoreCase(APPROVAL_SCOPE_TAG))
         {
          approver.put(APPROVAL_SCOPE, sb.toString());         
         }
         if(loadProp.equalsIgnoreCase(APPROVAL_SELF_TAG))
         {
           approver.put(APPROVAL_SELF, sb.toString());                 
         }
         if(loadProp.equalsIgnoreCase(APPROVAL_TYPE_TAG))
         {
           approver.put(APPROVAL_TYPE, sb.toString());
         }
         if(loadProp.equalsIgnoreCase(APPROVAL_ID_TAG))
         {
           approver.put(APPROVAL_ID, sb.toString());
         }
      }
      
      if(loadProp.equalsIgnoreCase(APPROVAL_STATE_TAG))
      {
        if(approver!=null)
        {// approver approvalState
          approver.put(APPROVAL_STATE, sb.toString()); 
        }
        else
        {// global appprovalState
          globalApproveState = sb.toString();
        }
        
      }
      
      if(loadProp.equalsIgnoreCase(LOCKED_TAG))
      {
        locked = Boolean.valueOf(sb.toString());
      }
      
      if(loadProp.equalsIgnoreCase(APPROVAL_PROCESS_TAG))
      {
        approveProcess = sb.toString();
      }
      
      loadProp = null;      
    }
    
    if(APPROVAL_APPROVER_TAG.equalsIgnoreCase(qName))
    {
      approvers.add(approver);
      approver = null;
    } 
    
    if(LOCK_OWNER_TAG.equalsIgnoreCase(qName))
    {
      loadLockOwner = false;
    }
    
    if(MODIFIER_TAG.equalsIgnoreCase(qName))
    {
      loadModifier = false;
    }    
    
    if(AUTHOR_TAG.equalsIgnoreCase(qName))
    {
      loadAuthor = false;
    }
  }
}
