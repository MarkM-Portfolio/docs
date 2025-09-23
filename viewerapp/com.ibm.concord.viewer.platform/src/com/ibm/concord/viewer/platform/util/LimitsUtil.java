/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.util;

import com.ibm.json.java.JSONObject;

public class LimitsUtil
{
  public static boolean exceedLimits(long mediaSizeInByte, JSONObject limits)
  {
    if (limits != null && limits.get("max-size") != null)
    {
      Long maxSize = Long.valueOf((String) limits.get("max-size"));
      return mediaSizeInByte > maxSize.longValue() * 1024;
    }
    else
    {
      return mediaSizeInByte > 1024 * 10L * 1024; // By default, the max size limit is 10 MB.
    }
  }
  public static boolean exceedLimits(long mediaSizeInByte, String limits)
  {
    Long maxSize = Long.valueOf(limits);
    return mediaSizeInByte > maxSize.longValue() * 1024;
  }
  
  public static boolean exceedLimits(long mediaSizeInByte, JSONObject limits , String mimieType)
  {
    if (limits != null && limits.get(mimieType) != null)
    {
      Long maxSize = Long.valueOf((String) limits.get(mimieType));
      return mediaSizeInByte > maxSize.longValue() * 1024 * 1024;
    }
    else
    {
      return mediaSizeInByte > 1024 * 10L * 1024; // By default, the max size limit is 10 MB.
    }
  }
}
