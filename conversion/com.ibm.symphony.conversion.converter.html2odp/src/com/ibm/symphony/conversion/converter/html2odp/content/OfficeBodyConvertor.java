/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.content;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class OfficeBodyConvertor extends AbstractODPConvertor
{

  @SuppressWarnings("restriction")
  @Override
  protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
    // TODO Auto-generated method stub
    OdfElement odfBody = (OdfElement) odfParent.getElementsByTagName("office:body").item(0);
//    odfBody.setAttribute("id", ((Element) htmlNode).getAttribute("id"));

    // get the presentation element.
    Element subNode = (Element) htmlNode.getFirstChild();
    if("custom_style_mode_value".equals(subNode.getAttribute("id")))
    {
      Element temp = subNode;
      subNode = (Element) subNode.getNextSibling();
      htmlNode.removeChild(temp);
    }
    OdfElement presRoot = (OdfElement) odfBody.getFirstChild();
//    presRoot.setAttribute("id", ((Element) subNode).getAttribute("id"));

    // the first draw:frame has already been created. we need remove this draw:frame and insert new ones freely.
    boolean isNew = (Boolean)context.get("isNewDoc");
    if(isNew){
      presRoot.removeChild(presRoot.getFirstChild());
    }

    // convert children.
    this.convertChildren(context, subNode, presRoot);
  }

}
