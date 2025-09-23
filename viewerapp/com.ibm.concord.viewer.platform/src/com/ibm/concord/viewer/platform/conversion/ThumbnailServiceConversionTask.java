/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversion;

import org.apache.commons.httpclient.HttpClient;

import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.json.java.JSONObject;

public class ThumbnailServiceConversionTask extends ConversionTask
{
  public static final String STATUS_CODE = "statusCode"; //$NON-NLS-1$

  public ThumbnailServiceConversionTask(String conversionServiceURL, String conversionResultURL, HttpClient httpClient)
  {
    super(conversionServiceURL, conversionResultURL, httpClient);
    this.setCategory(TaskCategory.THUMBNAILSERVICE);
    this.setJobDone(Constant.JOB_THUMBNAILSERVICE_DONE);
    this.setJobIdKey(Constant.THUMBNAILSERVICE_JOBID_KEY);
    this.setTargetPathKey(Constant.THUMBNAILSERVICE_TARGETPATH_KEY);
  }

  public JSONObject getConversionResult(String jobID, String targetPATH) throws Exception
  {
   return null;
  }

}
