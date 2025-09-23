/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.entitlement.util;

import com.ibm.docs.entitlement.IEntitlementService.EntitlementLevel;

public class EntitlementUtil
{
  public static final String DEFAULT_ENTITLEMENT = "bh_docs_mode";
  public static final String DEFAULT_LOCALE = "EN";

  public static String to(Object entitlement)
  {
    String result = null;
    if (entitlement instanceof Integer || entitlement instanceof Long)
    {
      Integer i = (entitlement instanceof Integer) ? ((Integer)entitlement).intValue() : 
        ((Long)entitlement).intValue();
      switch (i)
      {
        case 0:
          result = EntitlementLevel.NONE.toString();
          break;
        case 1:
          result = EntitlementLevel.BASIC.toString();
          break;
        case 2:
          result = EntitlementLevel.SOCIAL.toString();
          break;
        case 3:
          result = EntitlementLevel.FULL.toString();
          break;
        case 4:
          result = EntitlementLevel.CUSTOM_1.toString();
          break;
        case 5:
          result = EntitlementLevel.CUSTOM_2.toString();
          break;
        case 6:
          result = EntitlementLevel.CUSTOM_3.toString();
          break;
        default:
          result = EntitlementLevel.NONE.toString();
          break;
      }
    }
    else
    {
      throw new IllegalStateException("Invalid Type Found, only Integer is Expected.");
    }
    return result;
  }

  public static int from(String entitlement)
  {
    if (EntitlementLevel.NONE.toString().equalsIgnoreCase(entitlement))
    {
      return EntitlementLevel.NONE.ordinal();
    }
    else if (EntitlementLevel.BASIC.toString().equalsIgnoreCase(entitlement))
    {
      return EntitlementLevel.BASIC.ordinal();
    }
    else if (EntitlementLevel.SOCIAL.toString().equalsIgnoreCase(entitlement))
    {
      return EntitlementLevel.SOCIAL.ordinal();
    }
    else if (EntitlementLevel.FULL.toString().equalsIgnoreCase(entitlement))
    {
      return EntitlementLevel.FULL.ordinal();
    }
    else if (EntitlementLevel.CUSTOM_1.toString().equalsIgnoreCase(entitlement))
    {
      return EntitlementLevel.CUSTOM_1.ordinal();
    }
    else if (EntitlementLevel.CUSTOM_2.toString().equalsIgnoreCase(entitlement))
    {
      return EntitlementLevel.CUSTOM_2.ordinal();
    }
    else if (EntitlementLevel.CUSTOM_3.toString().equalsIgnoreCase(entitlement))
    {
      return EntitlementLevel.CUSTOM_3.ordinal();
    }
    else
    {
      return EntitlementLevel.NONE.ordinal();
    }
  }
}
