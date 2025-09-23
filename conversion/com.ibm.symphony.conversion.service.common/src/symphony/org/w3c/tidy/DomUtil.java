/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package symphony.org.w3c.tidy;

import org.w3c.dom.Element;

import symphony.org.w3c.tidy.DOMElementImpl;

public class DomUtil
{
  public static void setElementName( Element element, String name )
  {
    if( element instanceof DOMElementImpl )
    {
      DOMElementImpl elmt = (DOMElementImpl) element;
      elmt.adaptee.element = name;
    }
  }
}
