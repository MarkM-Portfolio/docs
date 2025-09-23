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


/**
 * @author gaowwei@cn.ibm.com
 *
 */
public interface IFormatConverter
{
  /**
   * Convert a source file to target
   * @param sourceType
   *        mime-type of source file
   * @param path
   *        can either be path to a file or folder, depending on source type
   * @param targetType
   *        mime-type of target file
   * @return
   *        can either be path to a file or folder, depending on target type
   */
  public String convert(String path, String sourceType, String targetType) throws Exception;
}
