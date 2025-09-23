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

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.json.java.JSONObject;

public class ODFConversionPostProcessingData
{
  private boolean _successful = true;   // The conversion results.  Review for success prior to post processing.
  
  private String _errorDescription = null;  // The error description text.
  
  private Element _htmlElement = null;  // The image html div created
  
  private Element _ariaElement = null;  // The aria label created
  
  private JSONObject _sizeMap = null;   // The sizeMap used to create the image
  
  private Element _parent = null;       // The parent html node to which the image div should be applied in post processing
  
  private Node _root = null;            // The root ODF element from which the image was generated
  
  private long _conversionTime = 0;      // Time (in ms) to complete the asynchronous conversion
  
  /**
   * @return the _successful
   */
  public boolean isSuccessful()
  {
    return _successful;
  }

  /**
   * @param successful true if successful (the default), otherwise false
   */
  public void setSuccessful(boolean successful)
  {
    this._successful = successful;
  }
  
  /**
   * @return the _errorDescription
   */
  public String getErrorDescription()
  {
    return _errorDescription;
  }

  /**
   * @param errorDescription the errorDescription to set
   */
  public void setErrorDescription(String errorDescription)
  {
    this._errorDescription = errorDescription;
  }

  /**
   * @return the htmlElement generated.  Used during post processing to update
   *         the DOM.
   */
  public Element getHtmlElement()
  {
    return _htmlElement;
  }

  /**
   * @param htmlElement the htmlElement generated to reference the converted content
   */
  public void setHtmlElement(Element htmlElement)
  {
    this._htmlElement = htmlElement;
  }

  /**
   * @return the ariaElement generated.  Used during post processing to update
   *         the DOM.
   */
  public Element getAriaElement()
  {
    return _ariaElement;
  }

  /**
   * @param ariaElement the ariaElement generated to provide a descriptive label for the converted content
   */
  public void setAriaElement(Element ariaElement)
  {
    this._ariaElement = ariaElement;
  }
  
  /**
   * @return the sizeMap used while generating the image
   */
  public JSONObject getSizeMap()
  {
    return _sizeMap;
  }

  /**
   * @param sizeMap the sizeMap used while generating the image
   */
  public void setSizeMap(JSONObject sizeMap)
  {
    this._sizeMap = sizeMap;
  }

  /**
   * @return the parent Node to which post processing should be applied.  
   *         Used to update the correct location in the DOM.
   */
  public Element getParent()
  {
    return _parent;
  }

  /**
   * @param parent the Parent Node to which post processing 
   *               should be applied
   */
  public void setParent(Element parent)
  {
    this._parent = parent;
  }

  /**
   * @return the root Node from which the image was generated.  Used to 
   *         complete post processing
   */
  public Node getRoot()
  {
    return _root;
  }

  /**
   * @param root the root Node used to generate the image.  Needed for completion
   *             of post processing
   */
  public void setRoot(Node root)
  {
    this._root = root;
  }

  /**
   * @return the _conversionTime
   */
  public long getConversionTime()
  {
    return _conversionTime;
  }

  /**
   * @param conversionTime the conversionTime to set
   */
  public void setConversionTime(long conversionTime)
  {
    this._conversionTime = conversionTime;
  }
 
  
}
