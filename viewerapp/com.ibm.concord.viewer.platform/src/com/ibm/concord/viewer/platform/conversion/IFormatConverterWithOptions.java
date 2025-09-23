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

import java.util.Map;

public interface IFormatConverterWithOptions extends IFormatConverter
{
  public String convert(String path, String sourceType, String targetType, Map<String, Object> options) throws Exception;
}
