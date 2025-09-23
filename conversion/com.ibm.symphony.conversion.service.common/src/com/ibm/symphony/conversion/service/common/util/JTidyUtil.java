/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.util;

import symphony.org.w3c.tidy.Tidy;

public class JTidyUtil
{

  // FIXME: JTidy has memory leak issue, cannot be used as a static variable
  // have to clean tidy each time it was used.
  // private static Tidy tidy;

  public static Tidy getTidy()
  {
    Tidy tidy = null;
    // if (tidy == null){
    tidy = new Tidy();
    tidy.setXHTML(true);
    tidy.setDocType("omit");
    tidy.setXmlOut(true);
    tidy.setXmlPIs(false);
    tidy.setInputEncoding("UTF8");
    tidy.setOutputEncoding("UTF8");
    tidy.setTidyMark(false);
    tidy.setLiteralAttribs(false);
    tidy.setRawOut(false);
    tidy.setEmacs(false);
    tidy.setQuiet(true);
    tidy.setShowErrors(0);
    tidy.setShowWarnings(false);
    tidy.setForceOutput(true);
    tidy.setMakeClean(false);
    tidy.setXmlTags(false);
    tidy.setSpaces(0);
    tidy.setWraplen(Integer.MAX_VALUE);
    tidy.setWrapAttVals(false);
    tidy.setWrapSection(false);
    tidy.setQuoteNbsp(true);
    tidy.setNumEntities(false);
    tidy.setTrimEmptyElements(false);
    tidy.setTrimSpaces(false);
    tidy.setIgnoreCDATA(true);
    tidy.setDropFontTags(false);
    tidy.setList2Bq(false);
    tidy.setBq2Div(false);
    // }
    return tidy;
  }
}
