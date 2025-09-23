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

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.util.FileTypeUtil;
import com.ibm.symphony.conversion.service.common.util.FileUtil;

public class TXTDetector implements IMimeTypeDetector
{
  public boolean isCorrectMimeType(File sourceFile, String source_MIMETYPE, Map<String, String> options)
  {
    if (FileUtil.isZIPFile(sourceFile) || FileTypeUtil.isCorrectFileType(sourceFile, MimeTypeConstants.DOC_MIMETYPE, null)
        || FileTypeUtil.isCorrectFileType(sourceFile, MimeTypeConstants.XLS_MIMETYPE, null)
        || FileTypeUtil.isCorrectFileType(sourceFile, MimeTypeConstants.PPT_MIMETYPE, null))
      return false;
    return true;
  }

  public void updateTemplateMimeType(File sourceFile, String source_MIMETYPE, File targetFolder, Map obj)
  {
    // TODO
  }

}
