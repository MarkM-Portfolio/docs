package com.ibm.concord.viewer.platform.util;

public class ImageMeta
{
  private String order;
  private String name;
  private String width;
  private String height;
  
  public final static String DATA_SEP = ",";
  public final static String ROW_END = ";";
  
  public ImageMeta(String order, String name, String w, String h) 
  {
    this.order = order;
    this.name = name;
    this.width = w;
    this.height = h;
  }
  
  public ImageMeta()
  {
    
  }

  @Override
  public String toString()
  {
    StringBuffer sMeta = new StringBuffer(order);
    sMeta.append(ImageMeta.DATA_SEP);
    sMeta.append(name);
    sMeta.append(ImageMeta.DATA_SEP);
    sMeta.append(width);
    sMeta.append(ImageMeta.DATA_SEP);
    sMeta.append(height);
    sMeta.append(ImageMeta.ROW_END);
    return sMeta.toString();
  }
  
  public void setOrder(String order)
  {
    this.order = order;
  }

  public void setName(String name)
  {
    this.name = name;
  }

  public void setWidth(String width)
  {
    this.width = width;
  }

  public void setHeight(String height)
  {
    this.height = height;
  }



}

