/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.conversion;

import java.io.IOException;
import java.util.Map;

import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public interface IConversionService
{
  /**
   * convert a input stream, write back in output stream
   * 
   * @param sourceType
   *          Mime type of source format
   * @param in
   *          stream for reading source content
   * @param targetType
   *          Mime type of target format
   * @param out
   *          stream for writing target content
   * @return TRUE if conversion has done successfully
   * @throws UnsupportedMimeTypeException 
   * @throws IOException
   */
  public String convert(String path, String sourceType, String targetType) throws ConversionException, UnsupportedMimeTypeException;
  
  public String convert(String path, String sourceType, String targetType, Map<String, Object> options) throws ConversionException, UnsupportedMimeTypeException;

  public String convert(String path, String sourceType, String targetType, String targetPath) throws ConversionException, UnsupportedMimeTypeException;
 
  public String convert(String path, String sourceType, String targetType, String targetPath, Map<String, Object> options) throws ConversionException, UnsupportedMimeTypeException;
  
}
