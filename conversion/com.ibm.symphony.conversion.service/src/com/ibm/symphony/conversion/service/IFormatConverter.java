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

import com.ibm.symphony.conversion.service.exception.ConversionException;


public interface IFormatConverter {

	/**
	 * @param sourceFile
	 *            - the input File
	 * @param parameters
	 *            - parameters
	 * @return - the {@code ConversionResult}
	 */
	ConversionResult convert(File sourceFile, Map parameters)
			throws ConversionException;
	
	/**
	 * @param sourceFile
	 *            - the input File
	 * @param targetFolderPath
	 *            - the target folder path
	 * @param parameters
	 *            - parameters
	 * @return - the {@code ConversionResult}
	 */
	ConversionResult convert(File sourceFile, File targetFolder, Map parameters)
	throws ConversionException;
	/**
	 * 
	 * @return - if the dependent resource(such as Symphony, stellent) is available
	 */
	boolean isRunnableAvailable();
}
