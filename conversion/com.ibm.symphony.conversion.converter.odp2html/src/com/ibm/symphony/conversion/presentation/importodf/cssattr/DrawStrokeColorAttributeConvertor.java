/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.cssattr;

import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;

public class DrawStrokeColorAttributeConvertor extends SimpleGraphicAttributeConvertor
{
  /**
   * Gets the name of the Controlling Attribute (e.g. draw:stoke)
   * 
   * @return String name of the controlling attribute
   */
  @Override
  protected String getControllingName()
  {
    return ODPConvertConstants.ODF_ATTR_DRAW_STROKE;
  }

  /**
   * Gets the property type of the Controlling Attribute (e.g. OdfStyleGraphicProperties.Stroke)
   * 
   * @return OdfStyleProperty property type of the controlling attribute
   */
  @Override
  protected OdfStyleProperty getControllingProperty()
  {
     return OdfStyleGraphicProperties.Stroke;
  }

}
