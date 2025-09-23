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

public class DocAssociationBean
{
  private String associationid;
  private String associationType;
  private String label;
  private String content;
  private String tag;
  private String changeset;
  
  public DocAssociationBean(){
    
  }
  
  public DocAssociationBean(String associationid, String associationType, String label, String content, String tag, String changeset)
  {
    super();
    this.associationid = associationid;
    this.associationType = associationType;
    this.label = label;
    this.content = content;
    this.tag = tag;
    this.changeset = changeset;
  }
  public String getAssociationid()
  {
    return associationid;
  }
  public void setAssociationid(String associationid)
  {
    this.associationid = associationid;
  }
  public String getAssociationType()
  {
    return associationType;
  }
  public void setAssociationType(String associationType)
  {
    this.associationType = associationType;
  }
  public String getLabel()
  {
    return label;
  }
  public void setLabel(String label)
  {
    this.label = label;
  }
  public String getContent()
  {
    return content;
  }
  public void setContent(String content)
  {
    this.content = content;
  }
  public String getTag()
  {
    return tag;
  }
  public void setTag(String tag)
  {
    this.tag = tag;
  }

  public String getChangeset()
  {
    return changeset;
  }
  public void setChangeset(String changeset)
  {
    this.changeset = changeset;
  }
  
  public String toString()
  {
    return "DocAssociationBean [associationid=" + associationid + ", association_type=" + associationType + ", label=" + label + ", content="
        + content + ", tag=" + tag + ", changeset=" + changeset + "]";
  }
 
}
