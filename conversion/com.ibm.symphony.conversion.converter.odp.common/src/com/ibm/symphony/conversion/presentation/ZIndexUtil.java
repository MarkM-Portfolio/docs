/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation;

import java.util.LinkedList;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class ZIndexUtil
{
  /**
   * Append the odfElement in the correct (z-index) order to the odfParent
   * 
   * @param context
   *          Conversion context
   * @param htmlElement
   *          HTML Element being processed
   * @param odfElement
   *          New OdfElement to be inserted
   * @param odfParent
   *          Parent to append the odfElement
   */
  @SuppressWarnings("unchecked")
  public static void appendInOrder(ConversionContext context, Element htmlElement, OdfElement odfElement, OdfElement odfParent)
  {
    // Get the z-index so that we can put the ODF draw:frame into the correct order
    String style = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    CSSProperties styleProperties = new CSSProperties(style.toLowerCase(), true);
    String zIndexValue = styleProperties.getProperty(ODPConvertConstants.HTML_ATTR_ZINDEX);
    int zIndex = 0; // Default to lowest priority (at the back)
    if (zIndexValue != null)
    {
      try
      {
        zIndex = Integer.parseInt(zIndexValue);
      }
      catch (NumberFormatException nfe)
      {
      } // Default to lowest priority
    }

    LinkedList<ZIndexedElement> zIndexList = (LinkedList<ZIndexedElement>) context.get(ODPConvertConstants.CONTEXT_PAGE_FRAME_LIST);

    // Insert the new draw:frame based on the z-index
    ZIndexUtil.appendInOrder(zIndexList, zIndex, odfElement, odfParent);
  }

  /**
   * Append the odfElement in the correct (z-index) order to the odfParent
   * 
   * @param zIndexList
   *          - the current zIndexList for this page
   * @param zIndex
   *          - the html specified z-index (or 0 if no z-index is specified)
   * @param odfElement
   *          - the new OdfElement to be inserted
   * @param odfParent
   *          - the parent to append the odfElement
   */
  @SuppressWarnings("restriction")
  public static void appendInOrder(LinkedList<ZIndexedElement> zIndexList, int zIndex, OdfElement odfElement, OdfElement odfParent)
  {
    // Insert the new draw:frame based on the z-index
    boolean elementInserted = false;
    ZIndexedElement zNewElement = new ZIndexedElement(zIndex, odfElement);
    for (int i = 0; !elementInserted && i < zIndexList.size(); ++i)
    {
      ZIndexedElement zElement = zIndexList.get(i);
      if (zElement.getZIndex() > zIndex)
      {
        // Add the new element at this location
        zIndexList.add(i, zNewElement);
        odfParent.insertBefore(odfElement, zElement.getElement());
        elementInserted = true;
      }
    }
    if (!elementInserted)
    {
      zIndexList.addLast(zNewElement);
      odfParent.appendChild(odfElement);
    }
  }

  /**
   * Update the location of the odfElement if it is not already in the correct (z-index) order
   * 
   * @param context
   *          Conversion context
   * @param htmlElement
   *          HTML Element being processed
   * @param odfElement
   *          - the OdfElement to move if necessary
   * @param odfParent
   *          - the parent which currently contains the odfElement needing re-ordering
   */
  @SuppressWarnings({ "unchecked" })
  public static void updateOrder(ConversionContext context, Element htmlElement, OdfElement odfElement, OdfElement odfParent)
  {
    // Get the z-index so that we can put the ODF draw:frame into the correct order
    String style = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    CSSProperties styleProperties = new CSSProperties(style.toLowerCase(), true);
    String zIndexValue = styleProperties.getProperty(ODPConvertConstants.HTML_ATTR_ZINDEX);
    int zIndex = 0; // Default to lowest priority (at the back)
    if (zIndexValue != null)
    {
      try
      {
        zIndex = Integer.parseInt(zIndexValue);
      }
      catch (NumberFormatException nfe)
      {
      } // Default to lowest priority
    }

    LinkedList<ZIndexedElement> zIndexList = (LinkedList<ZIndexedElement>) context.get(ODPConvertConstants.CONTEXT_PAGE_FRAME_LIST);

    // Insert the new draw:frame based on the z-index
    ZIndexUtil.updateOrder(zIndexList, zIndex, odfElement, odfParent);
  }

  /**
   * Update the location of the odfElement if it is not already in the correct (z-index) order
   * 
   * @param zIndexList
   *          - the current zIndexList for this page
   * @param zIndex
   *          - the html specified z-index (or 0 if no z-index is specified)
   * @param odfElement
   *          - the OdfElement to move if necessary
   * @param odfParent
   *          - the parent which currently contains the odfElement needing re-ordering
   */
  @SuppressWarnings("restriction")
  public static void updateOrder(LinkedList<ZIndexedElement> zIndexList, int zIndex, OdfElement odfElement, OdfElement odfParent)
  {
    // Move the existing draw:frame based on updates to the z-index
    boolean orderSet = false;
    ZIndexedElement zCurrentElement = new ZIndexedElement(zIndex, odfElement);
    int currentIndex = -1;
    for (int i = 0; !orderSet && i < zIndexList.size(); ++i)
    {
      ZIndexedElement zElement = zIndexList.get(i);
      currentIndex = zElement.getZIndex();
      if (currentIndex > zIndex)
      {
        if (odfElement == zElement.getElement())
        {
          // If element was part of a group which has already been added to the ZIndexList, we can't insert before
          // ourself so don't move it.
        }
        else
        {
          // Check to ensure we're not already the previous sibling
          Node prevSibling = zElement.getElement().getPreviousSibling();
          if (prevSibling == null || prevSibling != odfElement)
          {
            // Move the element prior to the element with the greater index
            odfParent.removeChild(odfElement);
            odfParent.insertBefore(odfElement, zElement.getElement());
          }
        }
        zIndexList.add(i, zCurrentElement);
        orderSet = true;
      }
    }
    if (!orderSet)
    {
      if (currentIndex > -1 && zIndex > currentIndex) // Node has higher index than any found thus far?
      {
        // Check to ensure we're not already the last child
        Node lastChild = odfParent.getLastChild();
        if (lastChild == null || lastChild != odfElement)
        {
          // Move the element to the end
          odfParent.removeChild(odfElement);
          odfParent.appendChild(odfElement);
        }
      }
      zIndexList.addLast(zCurrentElement);
    }
  }
}
