/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.sym;

public class SymConversionResult
{

  // target file
  private String targetFile;

  // if converted successfully
  private boolean isSucceed;
  
  // fail Code
  private String errorCode;

  // fail message
  private String errorMsg;

  public SymConversionResult()
  {
    this.isSucceed = true;
  }
  
  /**
   * @return the error Code
   */
  public String getErrorCode()
  {
    return errorCode;
  }

  /**
   * @param errorCode
   *          the errorCode to set
   */
  public void setErrorMsg(String errorMsg)
  {
    this.errorMsg = errorMsg;
  }

  /**
   * @return the error Code
   */
  public String getErrorMsg()
  {
    return errorMsg;
  }

  /**
   * @param errorCode
   *          the errorCode to set
   */
  public void setErrorCode(String errorCode)
  {
    this.errorCode = errorCode;
  }

  /**
   * @return the path to target File 
   */
  public String getTargetFile()
  {
    return targetFile;
  }

  /**
   * @param convertedFile
   *          the path to target File to set
   */
  public void setTargetFile(String targetFile)
  {
    this.targetFile = targetFile;
  }

  /**
   * If completed successfully
   * 
   * @return
   */
  public boolean isSucceed()
  {
    return isSucceed;
  }

  
  /**
   * @param isSucceed
   *          the isSucceed to set
   */
  public void setSucceed(boolean isSucceed)
  {
    this.isSucceed = isSucceed;
  }

}
