/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.style;

import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

public class DrawingPageStyleConvertor extends GeneralCSSStyleConvertor
{
  /**
   * Return the ODFStyleFamily for this convert.  
   * @return OdfStyleFamily of type DrawingPage
   */
  @Override
  protected OdfStyleFamily getStyleFamily()
  {
    return OdfStyleFamily.DrawingPage;
  }

}
