/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html;

import java.util.List;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.UnsupportedFeatures;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;

import com.ibm.symphony.conversion.presentation.StackableProperties;

public abstract class AbstractHtmlConvertor implements IConvertor
{
  Logger log = Logger.getLogger(AbstractHtmlConvertor.class.getName());

  public void convert(ConversionContext context, Object input, Object output)
  {
    Node element = (Node) input;
    Element parent = (Element) output;
    detectUnsupportedFeatures(context, element);

    StackableProperties.pushInContext(context);

    doConvertHtml(context, element, parent);

    StackableProperties.popInContext(context);
  }

  private void detectUnsupportedFeatures(ConversionContext context, Node element)
  {
    String nodeName = element.getNodeName();
    if (ODPConvertConstants.ODF_STYLE_OBJECT_GROUPING.equals(nodeName))
    {
      UnsupportedFeatures.addUnsupportedWarning(context, UnsupportedFeatures.UNSUPPORT_FEATURE_OBJECT_GROUPING);
    }
    else if (ODFConstants.DRAW_CUSTOM_SHAPE.equals(nodeName))
    {
      UnsupportedFeatures.addUnsupportedWarning(context, UnsupportedFeatures.UNSUPPORT_FEATURE_CUSTOM_SHAPE);
    }
    else if (ODFConstants.DRAW_PLUGIN.equals(nodeName))
    {
      UnsupportedFeatures.addUnsupportedWarning(context, UnsupportedFeatures.UNSUPPORT_FEATURE_VIDEO_SOUND);
    }
  }

  abstract protected void convertChildren(ConversionContext context, Node element, Element htmlElement);

  abstract protected void doConvertHtml(ConversionContext context, Node element, Element htmlParent);

  abstract protected Node addHtmlElement(Node node, Node htmlParentNode, ConversionContext context);

  abstract protected Element parseAttributes(Node node, Element htmlNode, ConversionContext context);

  abstract protected List<Node> getClassElements(Node element, OdfDocument doc, ConversionContext context);

  abstract protected String parseClassAttribute(List<Node> attr, ConversionContext context);

}
