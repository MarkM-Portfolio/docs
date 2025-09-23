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

public class PasswordPromptConversionTask extends ConversionTask
{

  public PasswordPromptConversionTask(String conversionServiceURL, String conversionResultURL, HttpClient httpClient)
  {
    super(conversionServiceURL, conversionResultURL, httpClient);
    this.setCategory(TaskCategory.HTML);
    this.setJobDone(Constant.JOB_HTML_DONE);
    this.setJobIdKey(Constant.HTML_JOBID_KEY);
    this.setTargetPathKey(Constant.HTML_TARGETPATH_KEY);
    this.isPasswordPrompt = true;
  }

}
