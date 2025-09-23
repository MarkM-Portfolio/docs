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

import java.io.IOException;
import java.util.Map;

import org.apache.commons.httpclient.HttpClient;

import com.ibm.concord.viewer.platform.conversion.ConversionTask.TaskCategory;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.spi.job.IConversionJob;


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
  public ConversionTask convert(String path, String sourceType, String targetType) throws ConversionException, UnsupportedMimeTypeException, IOException;

  public ConversionTask convert(String path, String sourceType, String targetType, Map<String, Object> options) throws ConversionException,
      UnsupportedMimeTypeException, IOException;

  public ConversionTask convert(String path, String sourceType, String targetType, String targetPath) throws ConversionException,
      UnsupportedMimeTypeException, IOException;

  public ConversionTask convert(String path, String sourceType, String targetType, String targetPath, Map<String, Object> options,
      boolean async, IConversionJob job) throws ConversionException, UnsupportedMimeTypeException, IOException;

  public boolean queryState(ConversionTask[] tasks, IConversionJob job) throws ConversionException, IOException; 
  
  public ConversionTask createConversionTask(TaskCategory category);
  
  public HttpClient getHttpClient();
}
