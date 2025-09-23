/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.shape2image;

import java.util.List;

import org.w3c.dom.Document;

import com.ibm.json.java.JSONObject;

public class SVGDocumentWrapper
{
  private Document doc;

  private int width;

  private int height;

  private int stroke_width;

  private String viewBox;

  private List<String> paths;

  private JSONObject pos;

  private String type;

  private boolean isClosed = false;  // Assume the shape is not closed initially

  public String getOriginalViewBox()
  {
    return originalViewBox;
  }

  public void setOriginalViewBox(String originalViewBox)
  {
    this.originalViewBox = originalViewBox;
  }

  public String getRevisedViewBox()
  {
    return revisedViewBox;
  }

  public void setRevisedViewBox(String revisedViewBox)
  {
    this.revisedViewBox = revisedViewBox;
  }

  private String originalViewBox;

  private String revisedViewBox;

  public SVGDocumentWrapper(Document doc)
  {
    this.doc = doc;
    pos = new JSONObject();
  }

  public Document getDocument()
  {
    return doc;
  }

  public void setDocument(Document doc)
  {
    this.doc = doc;
  }

  public int getWidth()
  {
    return width;
  }

  public void setWidth(int width)
  {
    this.width = width;
  }

  public int getHeight()
  {
    return height;
  }

  public void setHeight(int height)
  {
    this.height = height;
  }

  public int getStroke_width()
  {
    return stroke_width;
  }

  public void setStroke_width(int stroke_width)
  {
    this.stroke_width = stroke_width;
  }

  public String getViewBox()
  {
    return viewBox;
  }

  public void setViewBox(String viewBox)
  {
    this.viewBox = viewBox;
  }

  public List<String> getPaths()
  {
    return paths;
  }

  public void setPaths(List<String> paths)
  {
    this.paths = paths;
  }

  public void putPosAttributeMap(String key, String value)
  {
    pos.put(key, value);
  }

  public JSONObject getPosAttributeMap()
  {
    return pos;
  }

  public void setType(String type)
  {
    this.type = type;
  }

  public String getType()
  {
    return type;
  }

  public boolean isClosed()
  {
    return isClosed;
  }

  public void setClosed(boolean isClosed)
  {
    this.isClosed = isClosed;
  }
}
