/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.template;

import java.util.HashSet;

public class TableTemplateUtils
{
  // Default Initial Capacity for the TABLE_TEMPLATE_ATTRS HashSet
  private static final int TABLE_TEMPLATE_ATTRS_SET_CAPACITY = (int) (7 * 1.33) + 1;

  // Default Initial Capacity for the PLAIN_TABLE HashSet
  private static final int PLAIN_TABLE_SET_CAPACITY = (int) (1 * 1.33) + 1;

  public static HashSet<String> TABLE_TEMPLATE_ATTRS = null;

  public static HashSet<String> PLAIN_TABLE = null;
  static
  {
    TABLE_TEMPLATE_ATTRS = new HashSet<String>(TABLE_TEMPLATE_ATTRS_SET_CAPACITY);
    TABLE_TEMPLATE_ATTRS.add("table:use-banding-rows-styles");
    TABLE_TEMPLATE_ATTRS.add("table:use-first-row-styles");
    TABLE_TEMPLATE_ATTRS.add("table:use-last-row-styles");
    TABLE_TEMPLATE_ATTRS.add("table:use-first-column-styles");
    TABLE_TEMPLATE_ATTRS.add("table:use-last-column-styles");
    TABLE_TEMPLATE_ATTRS.add("table:use-banding-rows-styles");
    TABLE_TEMPLATE_ATTRS.add("table:use-banding-columns-styles");

    PLAIN_TABLE = new HashSet<String>(PLAIN_TABLE_SET_CAPACITY);
    PLAIN_TABLE.add("table:use-banding-rows-styles");
  }

  public static void processTableTemplateAttrs(String styles)
  {
    if (styles.equals("st_border_plain"))
    {

    }
  }
}
