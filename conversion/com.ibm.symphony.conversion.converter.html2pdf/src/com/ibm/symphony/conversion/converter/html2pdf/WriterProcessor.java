/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2pdf;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Map;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;

public class WriterProcessor extends DefaultProcessor
{

  private String headerHTML = "";
  private String footerHTML = "";
  
  public Document preProcess(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    Document doc = super.preProcess(sourceFile, targetFolder, parameters);
    
    ConvertUtil.filterElement(doc.getFirstChild(), false, true, true);

    Node body = doc.getElementsByTagName("body").item(0);
    String innerStyle = ((Element) body).getAttribute("style");
    if (innerStyle != null && innerStyle.length() > 0)
    {
      ((Element) body).removeAttribute("style");
    }
    
    if (parameters!=null&&parameters.containsKey("header"))
    {

      if (parameters != null && parameters.containsKey("header"))
      {
        // It means that this function was called by Concord Document
        // export action.
        
        // Important get Header and Footer inner HTML to Generate PDF print Css.
        NodeList children = body.getChildNodes();
        Element header = null;
        Element footer = null;
        Element child = null;
        for (int i = 0; i < children.getLength(); i++)
        {
          Node node = children.item(i);
          if (node.getNodeType() != Node.ELEMENT_NODE)
            continue;
          child = (Element) node;
          if (child.getAttribute("id").equals("header_div"))
            header = child;
          else if (child.getAttribute("id").equals("footer_div"))
            footer = child;
        }
        if (header != null)
        {
          header.normalize();
          headerHTML = HTML2PDFUtil.getInnerHTML(tidy, header, true).replace(">#</", "></");
        }
        if (footer != null)
        {
          footer.normalize();
          footerHTML = HTML2PDFUtil.getInnerHTML(tidy, footer, true).replace(">#</", "></");
        }
      }
    }
    
    return doc;
  }
  
  public String getUserStyle(Map parameters)
  {
    String cssStr = HTML2PDFUtil.generateCssStr(parameters, headerHTML, footerHTML);

    return cssStr;
  }

}
