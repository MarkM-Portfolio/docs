package com.ibm.concord.viewer.platform.conversion;

import org.apache.commons.httpclient.HttpClient;

import com.ibm.concord.viewer.platform.util.Constant;

public class QuerySnapshotStatusTask extends ConversionTask
{

  public QuerySnapshotStatusTask(String conversionServiceURL, String conversionResultURL, HttpClient httpClient)
  {
    super(conversionServiceURL, conversionResultURL, httpClient);

    this.setCategory(TaskCategory.HTML);
    this.setJobDone(Constant.JOB_HTML_DONE);
    this.setJobIdKey(Constant.HTML_JOBID_KEY);
    this.setTargetPathKey(Constant.HTML_TARGETPATH_KEY);
  }
}
