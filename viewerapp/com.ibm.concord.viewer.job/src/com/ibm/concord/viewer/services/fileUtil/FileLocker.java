/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.fileUtil;

public class FileLocker
{

  /*
   * @param filename
   * 
   * @return The file handler if open successfully,null if open failed.
   */
  public native int lock(String filename);

  /*
   * @param file
   * 
   * @return true if close successfully,false if close failed.
   */
  public native int unlock(int fd);
}