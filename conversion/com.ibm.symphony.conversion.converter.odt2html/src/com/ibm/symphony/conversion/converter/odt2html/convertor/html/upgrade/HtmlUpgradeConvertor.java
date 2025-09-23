/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html.upgrade;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.odt2html.convertor.ODTConvertorUtil;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.DocUnsupportFeature;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.DocUnsupportFeature.FeatureInfo;


public abstract class HtmlUpgradeConvertor implements IConvertor
{
  public void convert(ConversionContext context, Object input, Object output)
  {
    OdfElement element = (OdfElement) input;
    Element parent = (Element) output;
    detectUnsupportedFeatures(context, element);
    doConvertHtml(context, element, parent);
  }

  private void detectUnsupportedFeatures(ConversionContext context, OdfElement element)
  {
    String nodeName = element.getNodeName();
    if (ODTConvertorUtil.ALL_DETECTION_ELEMENTS.contains(nodeName))
    {
      ConversionResult result = (ConversionResult) context.get("result");
      ConversionWarning cw = null;
      FeatureInfo featureInfo = DocUnsupportFeature.OdtUnsupportFeatureMap.get(nodeName);
      if(featureInfo != null && !result.hasWarning(featureInfo.errorCode))
      {
        cw = new ConversionWarning(featureInfo.errorCode, featureInfo.preserved, "", featureInfo.featureText);
      }
      else if (ODTConvertorUtil.DRAWING_ELEMENTS.contains(nodeName) && !result.hasWarning(DocUnsupportFeature.UNSUPPORT_FEATURE_CUSTOM_SHAPE))
      {
        cw = new ConversionWarning(DocUnsupportFeature.UNSUPPORT_FEATURE_CUSTOM_SHAPE, true,"",DocUnsupportFeature.FEATURE_CUSTOM_SHAPE);
      }
      else if (ODTConvertorUtil.FIELD_ELEMENTS.contains(nodeName) && !result.hasWarning(DocUnsupportFeature.UNSUPPORT_FEATURE_TEXT_FIELD))
      {
        cw = new ConversionWarning(DocUnsupportFeature.UNSUPPORT_FEATURE_TEXT_FIELD, true,"",DocUnsupportFeature.FEATURE_TEXT_FIELD);
      }
      if (cw != null)
      {
        result.addWarning(cw);
      }
    }
  }

  protected abstract void doConvertHtml(ConversionContext context, OdfElement element, Element parent);
}
