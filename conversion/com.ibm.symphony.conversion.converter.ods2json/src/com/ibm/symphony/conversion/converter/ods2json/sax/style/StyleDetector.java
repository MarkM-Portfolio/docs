/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.style;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.ods2json.sax.DetectorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class StyleDetector
{
  
  private static final Logger LOG = Logger.getLogger(StyleDetector.class.getName());
  
  public void detect(ConversionContext context)
  {
    try
    {
      OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles) context.get("autostyles");
      NodeList children = autoStyles.getChildNodes();
      this.detectStyle(context, children);

      OdfSpreadsheetDocument odfSheetDoc = (OdfSpreadsheetDocument) context.get("Source");
      OdfFileDom styleDom = odfSheetDoc.getStylesDom();
      children = styleDom.getAutomaticStyles().getChildNodes();
      this.detectStyle(context, children);
      children = styleDom.getOfficeStyles().getChildNodes();
      this.detectStyle(context, children);
    }
    catch (Exception e)
    {
      LOG.severe("Can't get the ODF DOM");
    }
  }

  private void detectStyle(ConversionContext context, NodeList children)
  {
    int length = children.getLength();
    for (int i = 0; i < length; i++)
    {
      Node child = children.item(i);
      if (child instanceof Element)
      {
        boolean flag = this.detectElement(context, (Element) child);
        if (flag)
          return;
      }
    }
  }


  private boolean detectElement(ConversionContext context, Element element)
  {
    Set<String> styleUnsupFeatureSet = (Set<String>) context.get("StyleUnsupportFeatureSet");
    HashMap<String, Integer> result = (HashMap<String, Integer>) context.get("UnsupportFeatureResult");
    String tagName = element.getNodeName();
    String type = DetectorUtil.unsupStyleTagMap.get(tagName);
    boolean bMatch = false;
    if (null != type)
      bMatch = DetectorUtil.isAttrsMatch(tagName, element);
    if (null != type && bMatch)
    {
      Integer count = result.get(tagName);
      if (count == null)
      {
        result.put(tagName, 1);
        styleUnsupFeatureSet.add(type);
        if (!DetectorUtil.bRecordCount)
        {
          if (styleUnsupFeatureSet.size() == DetectorUtil.style_feature_num)
            return true;
        }
      }
      else
      {
        if (DetectorUtil.bRecordCount)
          result.put(tagName, count + 1);
      }
    }
    NodeList children = element.getChildNodes();
    int length = children.getLength();
    for (int i = 0; i < length; i++)
    {
      Node child = children.item(i);
      if (child instanceof Element)
      {
        boolean flag = this.detectElement(context, (Element) child);
        if (flag)
          return true;
      }
    }
    return false;
  }

}
