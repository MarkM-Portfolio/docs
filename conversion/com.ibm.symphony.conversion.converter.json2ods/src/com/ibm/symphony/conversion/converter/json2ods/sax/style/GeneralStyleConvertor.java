/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.style;

import java.util.Map;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;

public class GeneralStyleConvertor
{
  protected OdfStyleFamily getStyleFamily()
  {
    return null;
  }

  public OdfStyle convertStyle(ConversionContext context, String styleId, String oldStyleName)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("Target");
    Map<String, String> policyMap = (Map<String, String>) context.get("StylePolicy");
    OdfStyle oldStyle = null;
    try
    {
      OdfStyle newStyle = new OdfStyle(contentDom);
      String policy = policyMap.get(styleId);
      if (!ConversionConstant.STYLE_OVERWRITE.equals(policy))
      {
        oldStyle = ODSConvertUtil.getOldStyle(context, oldStyleName, getStyleFamily());
        copyPreservedProperties(newStyle, oldStyle);
      }
      return newStyle;
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    return null;
  }

  public static void copyPreservedProperties(OdfStyle newStyle, OdfStyle oldStyle)
  {
    if (newStyle != null && oldStyle != null)// need to copy preserved properties from old style to new style
    {
      Document doc = newStyle.getOwnerDocument();
      if (newStyle.getOwnerDocument().equals(oldStyle.getOwnerDocument()))
      {
        NamedNodeMap attrsOld = oldStyle.getAttributes();
        for (int i = 0; i < attrsOld.getLength(); i++)
        {
          Node node = attrsOld.item(i).cloneNode(false);
          if (!newStyle.hasAttribute(node.getNodeName()))
            newStyle.setAttributeNode((Attr) node);
        }

        NodeList list = oldStyle.getChildNodes();
        int length = list.getLength();
        for (int i = 0; i < length; i++)
        {
          try
          {
            Node node = list.item(i).cloneNode(true);
            newStyle.appendChild(node);
          }
          catch (IllegalArgumentException e)
          {

          }
        }
      }
      else
      {
        newStyle.setAttribute(ConversionConstant.ODF_ATTRIBUTE_STYLE_PARENT_STYLE_NAME, oldStyle.getStyleNameAttribute());
      }
    }
  }
}
