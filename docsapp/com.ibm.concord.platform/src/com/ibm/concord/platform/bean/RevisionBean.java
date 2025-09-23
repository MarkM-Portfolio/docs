/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.bean;

import java.util.Calendar;
import java.util.List;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.platform.revision.IRevision;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;


public class RevisionBean implements IRevision
{
  private static final Logger LOGGER = Logger.getLogger(RevisionBean.class.getName());
  
  private String repoId;  
  private String docUri;
  private int majorNo;
  private int minorNo;
  private JSONArray modifiers;
  private String type;
  private Calendar createTime;
  private String reference;
  
  public RevisionBean(String repoId, String docUri, int majorNo, int minorNo, String type, String reference, Calendar createTime, List<String> modifiers)
  {
    this.repoId = repoId;
    this.docUri = docUri;
    this.majorNo = majorNo;
    this.minorNo = minorNo;
    this.type = type;
    this.createTime = createTime;
    this.modifiers = new JSONArray();
    
    if (modifiers != null)
    {
      this.modifiers.addAll(modifiers);
    }
    this.reference = reference;
  }
  
  public RevisionBean(String repoId, String docUri, int majorNo, int minorNo, String type, String reference, Calendar createTime)
  {
    this(repoId, docUri, majorNo, minorNo, type, reference, createTime,  null);
  }
  
  public String getRepository()
  {
    return this.repoId;
  }
  
  public String getDocUri()
  {
    return this.docUri;
  }

  public int getMajorRevisionNo()
  {
    return this.majorNo;
  }

  public int getMinorRevisionNo()
  {
    return this.minorNo;
  }

  public JSONArray getModifiers()
  {
    return this.modifiers;
  }

  public String getType()
  {
    return this.type;
  }

  public boolean isMajor()
  {
    return (this.minorNo == 0);
  }

  public Calendar getPublishTime()
  {
    return this.createTime;
  }

  public String getRevisionNo()
  {
    if (this.minorNo == 0)
      return this.majorNo + "";
    else
      return this.majorNo + "." + this.minorNo;
  }
  
  public String getReferenceRevision()
  {
    return this.reference;
  }

  public void addModifier(String user)
  {
    this.modifiers.add(user);
  }
  
  public boolean equals(Object obj)
  {
    IRevision revision = null;
    if (obj == null)
       return false;
    if (obj instanceof IRevision)
      revision = (IRevision) obj;
    if (revision == null)
      return false;
    if (!this.getDocUri().equals(revision.getDocUri()))
      return false;
    if (!this.getRepository().equals(revision.getRepository()))
      return false;
    if (!this.getType().equals(revision.getType()))
      return false;
    if (this.getMajorRevisionNo() != revision.getMajorRevisionNo() )
      return false;
    if (this.getMinorRevisionNo() != revision.getMinorRevisionNo())
      return false;
    if (!this.getPublishTime().equals(revision.getPublishTime()))
      return false;
    if ((this.getReferenceRevision() == null) && (revision.getReferenceRevision() != null))
      return false;
    if ((this.getReferenceRevision() != null) && (revision.getReferenceRevision() == null))
      return false;
    if ((this.getReferenceRevision() != null) && (revision.getReferenceRevision() != null) && (!revision.getReferenceRevision().equals(this.getReferenceRevision())))
      return false;
    if (!this.getModifiers().equals(revision.getModifiers()))
      return false;
    
    return true;
  }
  
  public String toString()
  {
    StringBuffer buffer = new StringBuffer();
    buffer.append(this.docUri);
    buffer.append('@');
    buffer.append(this.getRevisionNo());
    buffer.append('(');
    buffer.append(this.type);
    buffer.append(')');
    return buffer.toString();
  }

  public JSONObject toJson()
  {
    JSONObject jsonObj = new JSONObject();
    jsonObj.put("repoId", repoId);
    jsonObj.put("docUri", docUri);
    jsonObj.put("type", type);
    jsonObj.put("majorRevNo", majorNo);
    jsonObj.put("minorRevno", minorNo);
    jsonObj.put("label", this.getRevisionNo());
    jsonObj.put("modifiers", modifiers);
    jsonObj.put("isMajor", this.isMajor());
    if (reference != null)
      jsonObj.put("reference", reference);
    if (createTime != null)
      jsonObj.put("date", AtomDate.valueOf(createTime).getValue());
    else
      LOGGER.warning("publish date for " + this.toString() + "is null.");
    return jsonObj;
  }

}
