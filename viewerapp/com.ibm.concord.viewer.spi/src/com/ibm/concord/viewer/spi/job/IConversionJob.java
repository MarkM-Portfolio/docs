/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.job;


public interface IConversionJob
{
  public boolean shouldCancel();

  public String getJobId();

  public String getDocumentId();

  public String getCurrentType();

  public void setCurrentType(String currentType);

  public boolean hasUploadConversion();
  
  public JOB_PRIORITY_TYPE getJobPriority();
  
  public void setPassword(String password);
  
  public String getPassword();
  
  public enum JOB_PRIORITY_TYPE {
    NORMAL, HIGH, LOW;
  }
}
