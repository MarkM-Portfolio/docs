package com.ibm.symphony.conversion.service.common.acf;

import java.util.ArrayList;
import java.util.List;

public class HtmlTag
{
  private String tagName;

  private List<Attribute> attributes;

  public static class Attribute
  {
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
