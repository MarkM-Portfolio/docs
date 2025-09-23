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

import java.util.HashMap;

public interface ISymphonyConverter {
  /**
   * Convert source file to target type by symphony
   * @param source
   * @param sourceType
   * @param targetType
   * @param options
   * @return
   * @throws Exception
   */
  SymConversionResult convert(String source, String sourceType, String targetType, HashMap<String, String> options) throws Exception;

  /**
   * Convert source file to target type by symphony and store converted file to target folder
   * @param source
   * @param targetFolder
   * @param sourceType
   * @param targetType
   * @param options
   * @return
   * @throws Exception
   */
  SymConversionResult convert(String source, String targetFolder, String sourceType, String targetType, HashMap<String, String> options) throws Exception;

  /**
   * Check if symphony is available.
   * @param
   * @return
   */
  boolean hasAvailableInstance();

}
