/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of HCL                              */
/*                                                                   */
/* Copyright HCL Technologies Ltd. 2021                       		 */
/*                                                                   */
/* US Government Users Restricted Rights                             */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.libre;

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

}
