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
import java.util.Map;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.exception.ConversionException;

public class PresentationProcessor extends DefaultProcessor
{

  private boolean hasHiddenElements = false;

  private static final String HIDDEN_ELEMENT = "HTML2PDFConverter_hidden_element";

  private static final String HIDDEN_ELEMENT_STYLE = "HTML2PDFConverter_hidden_element_style";

  @Override
  public void postProcess(File sourceFile, File targetFolder, Map parameters)
  {
    super.postProcess(sourceFile, targetFolder, parameters);
  }

  @Override
  public Document preProcess(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    Document doc = super.preProcess(sourceFile, targetFolder, parameters);
    // loops over p and ul tags to find unedited layout fields to hide
    String[] checkTags = { ODPConvertConstants.HTML_ELEMENT_P, ODPConvertConstants.HTML_ELEMENT_UL };
    for (int i = 0; i < checkTags.length; i++)
    {
      NodeList tags = doc.getElementsByTagName(checkTags[i]);
      for (int j = 0; j < tags.getLength(); j++)
      {
        Element tag = (Element) tags.item(j);
        String tagClass = tag.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
        // System.out.println("tag: " + checkTags[i] + " class: " + tagClass);
        // check if tag has classes identifying unedited layout fields
        if (tagClass != null
            && tagClass.length() > 0
            && tagClass.contains(ODPConvertConstants.CSS_DEFAULT_CONTENT_TEXT)
            && (tagClass.contains(ODPConvertConstants.CSS_CONTENT_BOX_TITLE_CLASS)
                || tagClass.contains(ODPConvertConstants.CSS_CONTENT_BOX_SUBTITLE_CLASS) || tagClass
                .contains(ODPConvertConstants.CSS_CONTENT_BOX_OUTLINE_CLASS)))
        {
          hasHiddenElements = true; // this flag is used later
          // to restore the document state
          // System.out.println(checkTags[i] +" tag must be hidden");
          tag.setAttribute(HIDDEN_ELEMENT, "true"); // mark
          // this element as hidden so it can be restored
          // sets css style to hidden and saves a copy of
          // current style if defined so it can be restored
          String styleAttr = tag.getAttribute(ODPConvertConstants.HTML_STYLE_TAG);
          if (styleAttr != null && styleAttr.length() > 0)
          {
            // System.out.println("saving style attribute: " + styleAttr);
            tag.setAttribute(HIDDEN_ELEMENT_STYLE, styleAttr);
          }
          tag.setAttribute(ODPConvertConstants.HTML_STYLE_TAG, ODPConvertConstants.HTML_VALUE_DISPLAY_NONE);
        }
      }
    }
    return doc;
  }

}
