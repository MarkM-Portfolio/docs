/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.css;



import org.w3c.dom.Node;
//import java.util.Map;

//import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class TextListStyleConvertor extends ODFStyleElementConvertor
{

  @Override
  protected void doConvert(ConversionContext context, Node element, Object output)
  {
    // don't convert this element or any children, we process the text:list-style's
    // as they are referenced during text:list processing in TextListElementConvertor()
  }
}
