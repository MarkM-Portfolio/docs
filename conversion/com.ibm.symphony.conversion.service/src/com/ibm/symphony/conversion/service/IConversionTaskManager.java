/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service;

import java.io.File;
import java.util.Map;
import java.util.concurrent.RejectedExecutionException;

import com.ibm.symphony.conversion.service.exception.ConversionException;

public interface IConversionTaskManager
{
  /**
   * 
   *@param sourceMIMEType
   *          - the MIME type of the input file or folder, such as "text/html" or "application/vnd.oasis.opendocument.text"
   * @param targetMIMEType
   *          - the MIME type of the output file or folder, such as "text/html" or "application/vnd.oasis.opendocument.text"
   * @param sourceFile
   *          - the file to be converted
   * @param parameters
   *          - the parameters
   * @return - job id, used to get result later by client
   */
  String submitConversionTask(String sourceMIMEType, String targetMIMEType, File sourceFile, Map parameters) throws ConversionException,
      RejectedExecutionException;

  /**
   * 
   *@param sourceMIMEType
   *          - the MIME type of the input file or folder, such as "text/html" or "application/vnd.oasis.opendocument.text"
   * @param targetMIMEType
   *          - the MIME type of the output file or folder, such as "text/html" or "application/vnd.oasis.opendocument.text"
   * @param sourceFile
   *          - the file to be converted
   * @param targetFolder
   *          - the target folder to store converted file
   * @param parameters
   *          - the parameters
   * @return - job id, used to get result later by client
   */
  String submitConversionTask(String sourceMIMEType, String targetMIMEType, File sourceFile, File targetFolder, Map parameters)
      throws ConversionException, RejectedExecutionException;

  /**
   * 
   * @param jobId
   *          - the job ID returned by calling {@link #submitConversionTask(String, String, File, Map)}
   * @return - true if completed, false if not
   */
  boolean isCompleted(String jobId) throws ConversionException;

  /**
   * 
   * @param jobId
   *          - the job ID returned by calling {@link #submitConversionTask(String, String, File, Map)}
   * @param targetFolder
   *          - the file folder that will store converted result
   * @return - true if completed, false if not
   */
  boolean isCompleted(String jobId, String targetFolder) throws ConversionException;

  /**
   * Get conversion result with given job id. Note: the task will be removed once the result is fetched. So that the result can be only
   * returned for one time.
   * 
   * @param jobId
   *          - the job ID returned by calling {@link #submitConversionTask(String, String, File, Map)}
   * @return - the conversion result {@link ConversionResult}
   */
  ConversionResult getConversionResult(String jobId) throws ConversionException;
 
  /**
   * Get conversion result with given job id. Note: the task will be removed once the result is fetched. So that the result can be only
   * returned for one time.
   * 
   * @param jobId
   *          - the job ID returned by calling {@link #submitConversionTask(String, String, File, Map)}
   * @param targetFolder
   *          - the file folder that will store converted result
   * @return - the conversion result {@link ConversionResult}
   */
  ConversionResult getConversionResult(String jobId, String targetFolder) throws ConversionException;
  
  /**
   * Cancel the conversion task according to given job id,
   * will interrupt the Java thread if the task is running, or do nothing if the task is not started or already canceled
   * or return immediately when the task just enter into working from task queue.
   * @param jobId
   * @throws ConversionException
   */
  public void cancelConversionTask(String jobId) throws ConversionException;

}
