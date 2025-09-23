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

public class TaskNotFoundException extends ConversionException {

	private static final long serialVersionUID = 1L;
	
	public TaskNotFoundException(){
		
	}
	
	public TaskNotFoundException(String message) {
		super(message);
	}

}
