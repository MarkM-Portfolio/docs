/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversion;

import org.apache.commons.httpclient.HttpClient;

import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.json.java.JSONObject;

public class ThumbnailConversionTask extends ConversionTask
{
  public ThumbnailConversionTask(String conversionServiceURL, String conversionResultURL, HttpClient httpClient)
  {
    super(conversionServiceURL, conversionResultURL, httpClient);
    this.setCategory(TaskCategory.THUMBNAILS);
    this.setJobDone(Constant.JOB_THUMBNAIL_DONE);
    this.setJobIdKey(Constant.THUMBNAILS_JOBID_KEY);
    this.setTargetPathKey(Constant.THUMBNAILS_TARGETPATH_KEY);
  }
  public JSONObject getConversionResult(String jobID, String targetPATH) throws Exception
  {
    return null;
  }
}
