/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.util;

import java.util.ArrayList;
import java.util.List;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class HtmlTag
{
  private String tagName;
  private List<Attribute> attributes;
  
  public static class Attribute {
    public String name;
    public String value;
    public Attribute(String n, String v)
    {
      name = n;
      value = v;
    }
  }
  HtmlTag()
  {
    tagName = "";
    attributes = new ArrayList<Attribute>();
  }
  
  public String getTagName()
  {
    return tagName;
  }
  
  public void setTagName(String tagName)
  {
    this.tagName = tagName;
  }
  
  public List<Attribute> getAttributes()
  {
    return attributes;
  }
  
  public void addAttribute(String n, String v)
  {
    Attribute attr = new Attribute(n, v);
    attributes.add(attr);
  }
}
