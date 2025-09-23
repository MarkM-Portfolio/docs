/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.util;

import lotus.org.w3c.tidy.Tidy;

/**
 * @author mayue@cn.ibm.com
 *
 */
public class JTidyUtil {

  // FIXME: JTidy has memory leak issue, cannot be used as a static variable
  // have to clean tidy each time it was used.
  //	private static Tidy tidy;

  public static Tidy getTidy(){
    Tidy tidy = null;
    //if (tidy == null){
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
      tidy.setShowErrors(10);
      tidy.setShowWarnings(false);
      tidy.setForceOutput(true);
      tidy.setMakeClean(false);
      tidy.setXmlTags(false);
      tidy.setSpaces(0);
      tidy.setWraplen(0);
      tidy.setWrapAttVals(false);
      tidy.setWrapSection(false);
      tidy.setQuoteNbsp(true);
      tidy.setNumEntities(false);
      tidy.setTrimEmptyElements(false);
      tidy.setTrimSpaces(false);
      tidy.setIgnoreCDATA(true);
      tidy.setDropFontTags(false);
    //}
    return tidy;
  }
}
