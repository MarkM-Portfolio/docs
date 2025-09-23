package com.ibm.docs.repository.ecm.util;

public class URLGenerater
{
  public static String generateCCMFeedURL(String serverUrl, String communityUuid, String componentId, String documentId)
  {
    // {contextRoot}/service/html/widgetview?communityUuid={communityId}&componentId={filenet library id}&hash=file{documentId}
    StringBuffer sb = null;
    if(serverUrl!=null)
    {
      sb = new StringBuffer(serverUrl);
      if(serverUrl.endsWith("/"))
        sb.append("service/html/widgetview?communityUuid=");
      else
        sb.append("/service/html/widgetview?communityUuid=");      
    }
    else
    {
      sb = new StringBuffer("/communities/service/html/widgetview?communityUuid=");
    }
    sb.append(communityUuid);
    sb.append("&componentId=");
    sb.append(componentId);
    if (documentId != null)
    {
      sb.append("&hash=file={");
      String uuid = documentId.replace("idd_", "");
      uuid = uuid.replace("idv_", "");
      sb.append(uuid);
      sb.append("}");      
    }
    return sb.toString();    
  }
}
