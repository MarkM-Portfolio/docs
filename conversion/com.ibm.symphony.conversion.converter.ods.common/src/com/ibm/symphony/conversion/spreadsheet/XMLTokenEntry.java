/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet;

import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

public class XMLTokenEntry
{
  public XMLUtil.NODENAME mTokenName;// elment name

  public String mStyleAttrName;// the style name of the element

  public OdfStyleFamily mFamily;// element style family

  XMLTokenEntry(XMLUtil.NODENAME tName, String styleName, OdfStyleFamily fam)
  {
    mTokenName = tName;
    mStyleAttrName = styleName;
    mFamily = fam;
  }
}
