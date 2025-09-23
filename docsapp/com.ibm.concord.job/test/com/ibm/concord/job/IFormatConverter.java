/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job;


import java.io.InputStream;

public interface IFormatConverter
{
  public static final String MOCK_CONVERSION = "MOCK_CONVERSION";

  public String postConversionTask(String sourceMime, String targetMime, InputStream mediaStream, long mediaLength)
      throws IllegalConvertException, FormatConversionException, MediaSizeExceededException;

  public String postConversionTask(String sourceMime, String targetMime, String mediaUri, long mediaLength)
      throws IllegalConvertException, FormatConversionException, MediaSizeExceededException;

  public InputStream getConversionResultAsStream(String jobId) throws IllegalConvertException, FormatConversionException;

  public String getConversionResultAsURI(String jobId) throws IllegalConvertException, FormatConversionException;
}
