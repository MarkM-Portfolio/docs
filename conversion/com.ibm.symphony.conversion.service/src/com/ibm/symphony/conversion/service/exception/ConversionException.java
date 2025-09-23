/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.exception;

/**
 * All exceptions during during conversion should inherit from ConversionException
 * 
 */
public class ConversionException extends Exception {

	private static final long serialVersionUID = 1L;
	
	public ConversionException(){
	}
			
	public ConversionException(String message){
		super(message);
	}
}
