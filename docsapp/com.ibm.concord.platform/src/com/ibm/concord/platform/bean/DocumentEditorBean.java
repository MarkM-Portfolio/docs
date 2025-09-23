/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.bean;

import java.sql.Timestamp;
import java.util.logging.Logger;

import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class DocumentEditorBean extends UserBean implements Comparable<Object>
{
  private static final Logger LOG = Logger.getLogger(DocumentEditorBean.class.getName());

  public static final String USER_ID = "userId";

  public static final String ORG_ID = "orgId";

  public static final String DOC_ID = "docId";

  public static final String REPO_ID = "repoId";

  public static final String DISPLAY_NAME = "displayName";

  public static final String COLOR = "color";

  public static final String BORDER_COLOR = "borderColor";

  public static final String INDICATORS = "indicators";

  public static final String LEAVE_SESSION = "leaveSession";

  private String docId;

  private String docRepoId;

  private String color;

  private String borderColor;

  private JSONObject indicators = null;

  private Timestamp leaveSession;

  public DocumentEditorBean()
  {
    ;
  }

  public DocumentEditorBean(String repoId, String docUri, DocumentEditorBean deb)
  {
    super(deb.getUserId(), deb.getOrgId(), deb.getDisplayName(), deb.getEmail());

    this.color = deb.color;
    this.docId = docUri;
    this.docRepoId = repoId;
    this.indicators = deb.indicators;
  }

  public DocumentEditorBean(UserBean editor, IDocumentEntry doc)
  {
    super(editor.getId(), editor.getOrgId(), editor.getDisplayName(), editor.getEmail());
    this.docId = doc.getDocUri();
    this.docRepoId = doc.getRepository();
  }

  public String getUserId()
  {
    return super.getId();
  }

  public void setUserId(String userId)
  {
    super.setProperty(UserBean.ID, userId);
  }

  public String getOrgId()
  {
    return super.getProperty(UserBean.ORG_ID);
  }

  public void setOrgId(String orgId)
  {
    super.setProperty(UserBean.ORG_ID, orgId);
  }

  public String getDocId()
  {
    return docId;
  }

  public void setDocId(String docId)
  {
    this.docId = docId;
  }

  public String getDocRepoId()
  {
    return docRepoId;
  }

  public void setDocRepoId(String docRepoId)
  {
    this.docRepoId = docRepoId;
  }

  public String getDisplayName()
  {
    return super.getProperty(UserBean.DISPLAY_NAME);
  }

  public void setDisplayName(String displayName)
  {
    super.setProperty(UserBean.DISPLAY_NAME, displayName);
  }

  public String getEmail()
  {
    return super.getProperty(UserBean.EMAIL);
  }

  public void setEmail(String email)
  {
    super.setProperty(UserBean.EMAIL, email);
  }

  public String getColor()
  {
    return color;
  }

  public void setColor(String color)
  {
    this.color = color;
  }

  public Timestamp getLeaveSession()
  {
    return leaveSession;
  }

  public void setLeaveSession(Timestamp leaveSession)
  {
    this.leaveSession = leaveSession;
  }

  @Override
  public boolean equals(Object o)
  {
    if (o instanceof DocumentEditorBean)
    {
      DocumentEditorBean editor = (DocumentEditorBean) o;

      return (this.docId.equals(editor.docId) && this.docRepoId.equals(editor.docRepoId) && this.getUserId().equals(editor.getUserId()) && this
          .getOrgId().equals(editor.getOrgId()));
    }

    return false;
  }

  public JSONObject toJSON()
  {
    JSONObject json = new JSONObject();

    json.put(DocumentEditorBean.USER_ID, this.getUserId());
    json.put(DocumentEditorBean.ORG_ID, this.getOrgId());
    json.put(DocumentEditorBean.DOC_ID, this.docId);
    json.put(DocumentEditorBean.REPO_ID, this.docRepoId);
    json.put(DocumentEditorBean.DISPLAY_NAME, this.getDisplayName());
    json.put(DocumentEditorBean.EMAIL, this.getEmail());
    json.put(DocumentEditorBean.COLOR, this.color);
    json.put(DocumentEditorBean.BORDER_COLOR, this.borderColor);
    if (this.indicators != null)
      json.put(DocumentEditorBean.INDICATORS, this.indicators);
    if (this.leaveSession != null)
      json.put(DocumentEditorBean.LEAVE_SESSION, this.leaveSession.getTime());
    return json;
  }

  public static DocumentEditorBean fromJSON(JSONObject json)
  {
    DocumentEditorBean bean = new DocumentEditorBean();

    String userId = (String) json.get(DocumentEditorBean.USER_ID);
    if (userId == null || userId.length() <= 0)
    {
      return null;
    }

    String orgId = (String) json.get(DocumentEditorBean.ORG_ID);
    if (orgId == null || orgId.length() <= 0)
    {
      return null;
    }

    bean.setUserId(userId);
    bean.setOrgId(orgId);

    // Display is not must-have from a JSON object.
    String displayName = (String) json.get(DocumentEditorBean.DISPLAY_NAME);
    if (displayName != null && displayName.length() > 0)
    {
      bean.setDisplayName(displayName);
    }

    // email is not must-have from a JSON object.
    String email = (String) json.get(DocumentEditorBean.EMAIL);
    if (email != null && email.length() > 0)
    {
      bean.setEmail(email);
    }

    // indicators is not must-have from a JSON object.
    String indicators = (String) json.get(DocumentEditorBean.INDICATORS);
    if (indicators != null && indicators.length() > 0)
    {
      try
      {
        JSONObject obj = JSONObject.parse(indicators);
        bean.setIndicators(obj);
      }
      catch (Exception e)
      {
        LOG.warning("Error happens when parse indicator JSON object from string: " + e);
      }

    }

    Object lsObj = json.get(DocumentEditorBean.LEAVE_SESSION);
    if (lsObj != null && lsObj instanceof Long)
    {
      long ls = ((Long) lsObj).longValue();
      bean.setLeaveSession(new Timestamp(ls));
    }

    return bean;
  }

  /**
   * Compare UserId used by EditorList.java for now. Compares this object with the specified object for order. Returns a negative integer,
   * zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
   */
  public int compareTo(Object obj)
  {
    if ((obj == null) || (obj.getClass() != DocumentEditorBean.class))
    {
      // int "1" means "this" is greater than "obj"
      return 1;
    }

    DocumentEditorBean documentEditorBean = (DocumentEditorBean) obj;
    String thisDisplayName = this.getDisplayName();
    String objDisplayName = documentEditorBean.getDisplayName();
    if ((thisDisplayName != null) && (!"".equals(thisDisplayName)))
    {
      return thisDisplayName.compareTo(objDisplayName);
    }
    else
    {
      // int "-1" means "this" is less than "obj"
      return -1;
    }
  }

  public void setBorderColor(String borderColor)
  {
    this.borderColor = borderColor;
  }

  public String getBorderColor()
  {
    return borderColor;
  }

  public JSONObject getIndicators()
  {
    return this.indicators;
  }

  public void setIndicators(JSONObject indicators)
  {
    this.indicators = indicators;
  }

}
