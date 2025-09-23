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

public class FullImageConversionTask extends ConversionTask
{

  public FullImageConversionTask(String conversionServiceURL, String conversionResultURL, HttpClient httpClient)
  {
    super(conversionServiceURL, conversionResultURL, httpClient);
    this.setCategory(TaskCategory.FULLIMAGES);
    this.setJobDone(Constant.JOB_FULLIMAGE_DONE);
    this.setJobIdKey(Constant.FULLIMAGE_JOBID_KEY);
    this.setTargetPathKey(Constant.FULLIMAGE_TARGETPATH_KEY);
  }

}
