/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation;

import org.odftoolkit.odfdom.OdfElement;

public class ZIndexedElement
{
  private int _zIndex;

  private OdfElement _element;

  /**
   * Constructor
   * 
   * @param zIndex
   *          - the z-index for the associated html
   * @param element
   *          - the OdfElement to which the z-index should be applied
   */
  public ZIndexedElement(int zIndex, OdfElement element)
  {
    this._zIndex = zIndex;
    this._element = element;
  }

  /**
   * @return the _zIndex
   */
  public int getZIndex()
  {
    return _zIndex;
  }

  /**
   * @param zIndex
   *          the zIndex to set
   */
  public void setZIndex(int zIndex)
  {
    this._zIndex = zIndex;
  }

  /**
   * @return the _element
   */
  public OdfElement getElement()
  {
    return _element;
  }

  /**
   * @param element
   *          the element to set
   */
  public void setElement(OdfElement element)
  {
    this._element = element;
  }
}
