/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.content;

import java.util.logging.Logger;

import org.odftoolkit.odfdom.dom.element.draw.DrawFrameElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawImageElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawTextBoxElement;
import org.odftoolkit.odfdom.dom.element.svg.SvgTitleElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;

public class SVGTitleDescConvertor extends AbstractContentHtmlConvertor
{
  private static final String CLASS = SVGTitleDescConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    
    // Note: the ALT and aria label tags for shapes are processed in ODFDrawingParser to support Documents and
    //       to support asynchronous processing
    if (odfElement instanceof SvgTitleElement) // svg:title
    {
      // Turn the "svg:title" element into the ALT tag or aria-label on the image or text box
      Node odfParent = odfElement.getParentNode();
      if (odfParent != null)
      {
        if (odfParent instanceof DrawFrameElement)
        {
        
          // Either a text box or an image.  Process based on the sibling type.
          Node odfSibling = odfParent.getFirstChild();
          while (odfSibling != null)
          {
            if (odfSibling instanceof DrawTextBoxElement)
            {
              //*******************************************************************
              // For Text Boxes, we will put the title as an aria-label on the  
              // draw_text-box <div> element
              //*******************************************************************
              Node htmlNode = htmlParent.getFirstChild();
              if (htmlNode != null)
              {
                ((Element) htmlNode).setAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL, odfElement.getTextContent());
              }
              odfSibling = null; // Done
            }
            else if (odfSibling instanceof TableTableElement)
            {
              //*******************************************************************
              // For Tables, we will put the title as an aria-label on the  
              // <table> element
              //*******************************************************************
              Node htmlNode = htmlParent.getFirstChild();
              if (htmlNode != null)
              {
                ((Element) htmlNode).setAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL, odfElement.getTextContent());
              }
              odfSibling = null; // Done
            }
            else if (odfSibling instanceof DrawImageElement)
            {
              //*******************************************************************
              // For Images, we will put the ALT tag on the <img> element
              //*******************************************************************
              Node htmlNode = htmlParent.getFirstChild();
              while (htmlNode != null)
              {
                if (HtmlCSSConstants.IMG.equals(htmlNode.getNodeName()))
                {
                  ((Element) htmlNode).setAttribute(HtmlCSSConstants.ALT, odfElement.getTextContent());
                  htmlNode = null;
                }
                else
                  htmlNode = htmlNode.getFirstChild();
              }              
              odfSibling = null; // Done
            }
            else
              odfSibling = odfSibling.getNextSibling();
          }
        }
      }
    }
    else // svg:desc
    {
      // Turn the "svg:desc" element into an aria-describeby label for the image or text box
      Node odfParent = odfElement.getParentNode();
      if (odfParent != null)
      {
        if (odfParent instanceof DrawFrameElement)
        {
          // Either a text box or an image.  Process based on the sibling type.
          Node odfSibling = odfParent.getFirstChild();
          while (odfSibling != null)
          {
            if (odfSibling instanceof DrawTextBoxElement)
            {
              //***************************************************************************
              // For Text Boxes, we will put the aria-describeby label as a child  
              // on the draw_text-box <div> element
              //***************************************************************************
              Node htmlNode = htmlParent.getFirstChild();
              if (htmlNode != null)
              {
                Element ariaLabel = addAriaDescribeBy(context, ((Element)htmlNode), odfElement.getTextContent());
                if (ariaLabel != null)
                  htmlNode.appendChild(ariaLabel);
              }
              odfSibling = null; // Done
            }
            else if (odfSibling instanceof TableTableElement)
            {
              //***************************************************************************
              // For Tables, we will put the aria-describeby label as a sibling  
              // to the <table> element
              //***************************************************************************
              Node htmlNode = htmlParent.getFirstChild();
              if (htmlNode != null)
              {
                Element ariaLabel = addAriaDescribeBy(context, ((Element)htmlNode), odfElement.getTextContent());
                if (ariaLabel != null)
                  htmlParent.appendChild(ariaLabel);
              }
              odfSibling = null; // Done
            }
            else if (odfSibling instanceof DrawImageElement)
            {
              //***************************************************************************
              // For Images, we will put the aria-describeby label as the next sibling to  
              // the <img> element since we aren't allowed to put a child on the <img>
              //***************************************************************************
              Node htmlNode = htmlParent.getFirstChild();
              while (htmlNode != null)
              {
                if (HtmlCSSConstants.IMG.equals(htmlNode.getNodeName()))
                {
                  Element ariaLabel = addAriaDescribeBy(context, ((Element)htmlNode), odfElement.getTextContent());
                  if (ariaLabel != null)
                  {
                    Node nextSibling = htmlNode.getNextSibling();
                    if (nextSibling == null)
                    {
                      // Append the aria label 
                      htmlNode.getParentNode().appendChild(ariaLabel);
                    }
                    else
                    {
                      // Insert the aria label right after the <img>
                      htmlNode.getParentNode().insertBefore(nextSibling, ariaLabel);
                    }
                  }
                  
                  htmlNode = null;
                }
                else
                  htmlNode = htmlNode.getFirstChild();
              }              
              odfSibling = null; // Done
            }
            else
              odfSibling = odfSibling.getNextSibling();
          }
        }
      }
    }
  }
  
  /**
   * Build an aria label containing the descriptive text for the image generated for the shape
   * @param context - the current ConversionContext
   * @param parent - the parent element to update with the aria-describeby id.
   * @return Element - ariaLabel element created (to be appended by the caller to the desired parent
   *                   element.  null will be returned if there is no description to add.
   */
  private Element addAriaDescribeBy(ConversionContext context, Element parent, String description)
  {
    if (description == null || description.length() == 0)
      return null; // Nothing to add
    // Obtain a new ID
    String id = DOMIdGenerator.generate();
    Document doc = (Document) context.getTarget();
    // Create the aria label
    Element ariaLabel = doc.createElement(ODFConstants.HTML_ELEMENT_LABEL);
    // Add the attributes
    ariaLabel.setAttribute(ODFConstants.HTML_ATTR_ID, id);
    ariaLabel.setAttribute(ODFConstants.HTML_ATTR_STYLE, ODFConstants.HTML_VALUE_DISPLAY_NONE);
    Text t = doc.createTextNode(description);
    ariaLabel.appendChild(t);
    parent.setAttribute(ODFConstants.HTML_ATTR_ARIA_DESCRIBEDBY, id);
    return ariaLabel;
  }
}
