/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;

public class EmptyHtmlConvertor extends HtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    // add id to empty span with only unsupport element child,and its next doesn't contain txt node
    OdfElement odfParentElement = (OdfElement) element.getParentNode();
    OdfElement odfNextElement = null;
    Object parentNextSibling = odfParentElement.getNextSibling();
    if(null != parentNextSibling &&!(parentNextSibling instanceof OdfElement))
      return;
    odfNextElement  = (OdfElement)parentNextSibling;
    boolean nextNodeisSpan=true,parentIsSpan = true;
    if (null != odfNextElement)
    {
      if (!odfNextElement.getNodeName().toLowerCase().equals(ODFConstants.TEXT_SPAN))
        nextNodeisSpan = false;
    }
    if(!odfParentElement.getNodeName().toLowerCase().equals(ODFConstants.TEXT_SPAN))
      parentIsSpan = false;
    if (parentIsSpan && parent.getNodeName().toLowerCase().equals(HtmlCSSConstants.SPAN)
        && !context.getOdfToHtmlIndexTable().isOdfNodeIndexed(odfParentElement) && nextNodeisSpan)
    {
      if (HtmlConvertorUtil.isUnsupportElement(element))
      {
        boolean isNeedAddId = true;
        if (null != odfNextElement)
        {
          NodeList children = odfNextElement.getChildNodes();
          int length = children.getLength();
          for (int i = 0; i < length; i++)
          {
            Node child = children.item(i);
            if (child instanceof Text)
            {
              isNeedAddId = false;
              break;
            }
          }
        }
        if (isNeedAddId)
          context.getOdfToHtmlIndexTable().addEntryByOdfNodeWithForceId(odfParentElement, parent, IndexUtil.RULE_NORMAL);
      }
    }
  }

}
