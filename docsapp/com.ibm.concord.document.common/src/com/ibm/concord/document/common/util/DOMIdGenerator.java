/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.util;

import java.util.Random;

import org.w3c.dom.Element;

/**
 * @author qins@cn.ibm.com
 *
 */
public class DOMIdGenerator
{

  private static Random random;

  static
  {
    random = new Random();
    random.setSeed(System.currentTimeMillis());
  }

  /**
   * Each node in RDOM should has rdom:id attribute for position. The checkId() function checks this attribute, and set it if there is none.
   * 
   * @param element
   */
  public void checkId(Element element)
  {
    // has id already
    if (XHTMLDomUtil.hasAttribute(element, "id"))
    {
      return;
    }

    long rid = System.currentTimeMillis() + random.nextInt();
    element.setAttribute("id", String.valueOf(rid));
  }

  public static String generate()
  {
    long rid = 0;
    rid = System.currentTimeMillis() + random.nextInt();
    String id = String.valueOf(rid);
    return "id_" + id.substring(id.length()-4);
  }
  public static String generate(String prefix)
  {
    long rid = System.currentTimeMillis() + random.nextInt();
    return prefix + String.valueOf(rid);
  }
}