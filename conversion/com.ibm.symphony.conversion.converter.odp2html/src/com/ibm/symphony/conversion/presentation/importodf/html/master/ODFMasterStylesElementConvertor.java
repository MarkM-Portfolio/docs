/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.master;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.importodf.css.AutoMaticStyleContainerConvertor;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class ODFMasterStylesElementConvertor extends AbstractMasterHtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, Node element, Element htmlParent)
  {
    convertChildren(context, element, htmlParent);
    
    // Need to write the automatic css styles now because they can be changed while processing the master html
    AutoMaticStyleContainerConvertor convertor = new AutoMaticStyleContainerConvertor();
    convertor.writeAutomaticStyles(context);
  }

}
