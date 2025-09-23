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

import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.platform.browsers.BrowserFilterHelper.Browser;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.json.java.JSONObject;

public class LimitsUtil
{
  private static final String BROWSER_TYPE_FOR_ENCODING = "browser_type";
  /**
   * Get the file size limit that being shown on the error page from the Docs configuration.
   * 
   * @param limits
   * @return
   */
  public static long getShownSizeLimit(JSONObject limits, String fileType)
  {
    Long maxSize = null;
    if("text/csv".equals(fileType))
    {
      if (limits != null && limits.get("max-text-size") != null)
      {
        maxSize = Long.valueOf((String) limits.get("max-text-size"));
      }
    }
    else
    {
      if (limits != null && limits.get("max-size") != null)
      {
        maxSize = Long.valueOf((String) limits.get("max-size"));
      }
    }
    if (maxSize != null)
    {
      return maxSize.longValue();
    }
    else
    {
      return 10240; // By default, the max size limit is 10 MB.
    }
  }
  
  /**
   * Get the actual file size limit from the Docs configuration.
   * 
   * @param limits
   * @return
   */
  public static long getActualSizeLimit(JSONObject limits)
  {
    Long maxSize = null;
    if (limits != null && limits.get("actual-max-size") != null)
    {
      maxSize = Long.valueOf((String) limits.get("actual-max-size"));
    }
    if (maxSize == null && limits != null && limits.get("max-size") != null)
    {
      maxSize = Long.valueOf((String) limits.get("max-size"));
    }
    if (maxSize != null)
    {
      return maxSize.longValue() * 1024;
    }
    else
    {
      return 1024 * 10L * 1024; // By default, the max size limit is 10 MB.
    }
  }
  
  public static boolean exceedLimits(long mediaSizeInByte, JSONObject limits)
  {
    return mediaSizeInByte > getActualSizeLimit(limits);
  }
  
  public static boolean exceedImageSizeLimit(long mediaSizeInByte, JSONObject limits)
  {
    if (limits != null && limits.get("max-image-size") != null)
    {
      Long maxSize = Long.valueOf((String) limits.get("max-image-size"));
      return mediaSizeInByte > maxSize.longValue() * 1024;
    }
    else
    {
      return mediaSizeInByte > 1024 * 8L * 1024; // By default, the max size limit is 10 MB.
    }
  }
  
  public static boolean exceedTextFileSizeLimit(long mediaSizeInByte, JSONObject limits)
  {
    if (limits != null && limits.get("max-text-size") != null)
    {
      Long maxSize = Long.valueOf((String) limits.get("max-text-size"));
      return mediaSizeInByte > maxSize.longValue() * 1024;
    }
    else
    {
      return mediaSizeInByte > 1024 * 2L * 1024; // By default, the max size limit is 2 MB.
    }
  }
  
  public static JSONObject exceedContentLimit(IDocumentService ds,DraftDescriptor draftDes)
  {
      return ds.exceedContentLimit(draftDes);
  }
  
  public static boolean exceedMobileSizeLimit(HttpServletRequest request,IDocumentEntry docEntry,IDocumentService docSrv)
  {
    if (request == null || docEntry == null || docSrv == null || docSrv.getConfig() == null)
    {
      return false;
    }
    long limitedSizeInByte ;
    long mediaSizeInByte = docEntry.getMediaSize();
    JSONObject mobileLimits = (JSONObject)((JSONObject)docSrv.getConfig()).get("mobile_limits");
    if (mobileLimits != null && mobileLimits.get("actual-max-size") != null)
    {
      limitedSizeInByte = Long.valueOf((String) mobileLimits.get("actual-max-size"))*1024;
    }
    else
    {
      limitedSizeInByte = 1024 * 10L * 1024;
    }    
    if (mediaSizeInByte > limitedSizeInByte)
    {
      return true;
    }
    return false;	  
  }
  public static long getShowSizeOfMobile(IDocumentService docSrv)
  {
    long limitedSizeInKB ;
    if (docSrv != null && docSrv.getConfig() != null)
    {
      JSONObject mobileLimits = (JSONObject)((JSONObject)docSrv.getConfig()).get("mobile_limits");
      if (mobileLimits != null && mobileLimits.get("max-size") != null)
      {
        limitedSizeInKB = Long.valueOf((String) mobileLimits.get("max-size"));
        return limitedSizeInKB;
      }
    }
    return 1024 * 10L;
    
  }
  public static boolean accessByMobile(HttpServletRequest request)
  {
    if (request == null)
    {
      return false;
    }
    Browser browser = (Browser)request.getAttribute(BROWSER_TYPE_FOR_ENCODING);
   
    if(browser != null && browser.equals(Browser.MOBILE_NATIVE))
    {
      return true;
    }
    return false;
  }
}
