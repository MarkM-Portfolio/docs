/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.filetype;

import java.io.File;
import java.util.Map;

public interface IMimeTypeDetector
{

  /**
   * @param sourceFile
   *          - the input File
   * @param parameters
   *          - parameters
   * @return - the {@code ConversionResult}
   */
  boolean isCorrectMimeType(File sourceFile, String source_MIMETYPE, Map<String, String> options);

  void updateTemplateMimeType(File sourceFile, String source_MIMETYPE, File targetFolder, Map obj);
}
