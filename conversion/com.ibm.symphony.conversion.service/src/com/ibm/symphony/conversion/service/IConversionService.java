/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

/**
 * 
 */
package com.ibm.symphony.conversion.service;

import java.io.File;
import java.util.Map;
import java.util.concurrent.RejectedExecutionException;

import com.ibm.symphony.conversion.service.exception.ConversionException;

public interface IConversionService extends IConversionTaskManager{
	/**
	 * @param sourceMIMEType
	 *            - the MIME type of the input file or folder, such as
	 *            "text/html" or "application/vnd.oasis.opendocument.text"
	 * @param targetMIMEType
	 *            - the MIME type of the output file or folder, such as
	 *            "text/html" or "application/vnd.oasis.opendocument.text"
	 * @return - the IFormatConverter interface
	 */
	IFormatConverter getConverter(String sourceMIMEType, String targetMIMEType)
			throws ConversionException;

	/**
	 * @param sourceMIMEType
	 *            - the MIME type of the input file or folder, such as
	 *            "text/html" or "application/vnd.oasis.opendocument.text"
	 * @param targetMIMEType
	 *            - the MIME type of the output file or folder, such as
	 *            "text/html" or "application/vnd.oasis.opendocument.text"
	 * @return - true if support the conversion according to the given source
	 *         MIME type and target MIME type, otherwise return false
	 */
	boolean supports(String sourceMIMEType, String targetMIMEType)
			throws ConversionException;

	/**
	 * Load the configurations after OSGi bundle activated
	 * @param configPath
	 *             - directory path to the conversion configurations, e.g. conversion-config.json file 
	 */
	void loadConfigurations(String configPath);
	
	/**
	 * Get file directory to store temporary files
	 * 
	 * @return - the directory to store temporary files
	 */
	String getRepositoryPath();

	/**
	 * Get configuration
	 * 
	 * @param key
	 *            - the key of the object
	 * @return - the configuration
	 */
	Object getConfig(String key);
	
	/**
	 * Get the directory path to store conversion configuration files, 
	 * e.g. conversion-config.json file
	 * @return the directory path for conversion configurations
	 */
	String getConfigPath();
}
