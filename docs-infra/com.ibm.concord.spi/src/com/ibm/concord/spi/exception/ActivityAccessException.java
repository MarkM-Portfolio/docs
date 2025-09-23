/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.exception;

/**
 * The numbers(20xx) are used to indicate the activity access related error
 * codes.
 * 
 */
public class ActivityAccessException extends AccessException {

	private static final long serialVersionUID = 1L;
	/**
	 * Exception code(2000) indicates that having exception when creating an activity.
	 */
	public static final int EC_CREATE_ACTIVITY = 2000;
	/**
	 * Exception code(2001) indicates that having exception when getting all activities.
	 */
	public static final int EC_GET_ACTIVITY = 2001;
	/**
	 * Exception code(2002) indicates that having exception when adding a person to activity owner list.
	 */
	public static final int EC_ACTIVITY_ADDPERSON = 2002;		
	/**
	 * Exception code(2003) indicates that having exception when deleting a todo.
	 */
	public static final int EC_ACTIVITY_DELETETODO = 2003;
	/**
	 * Exception code(2004) indicates that having exception when changing content of a todo.
	 */
	public static final int EC_ACTIVITY_CHANGETODO = 2004;
	/**
	 * Exception code(2005) indicates that having exception when getting a todo.
	 */
	public static final int EC_ACTIVITY_GETTODO = 2005;
	/**
	 * Exception code(2006) indicates that having exception when creating a todo.
	 */
	public static final int EC_ACTIVITY_CREATETODO = 2006;		
	/**
	 * Exception code(2007) indicates that having exception when adding a todo action's history.
	 */
	public static final int EC_ACTIVITY_ADDTODOHISTORY = 2007;	
	/**
	 * Exception code(2008) indicates that having exception when operating a todo action.
	 */
	public static final int EC_ACTIVITY_DOACTIONFAIL = 2008;	
	/**
	 * Exception code(2009) indicates that having exception when getting an activity's title.
	 */
	public static final int EC_ACTIVITY_GETTITLE = 2009;
	/**
	 * Exception code(2010) indicates that having exception when getting all todos from an activity.
	 */
	public static final int EC_ACTIVITY_GETALLTODOS = 2010;	

	private int errorCode;

 
	public ActivityAccessException(String errorMsg) {
	    super(errorMsg);
	}

	public ActivityAccessException(String errorMsg, int errorCode) {
		super(errorMsg,errorCode);
		this.errorCode = errorCode;
	}

	public int getCode() {
		return errorCode;
	}
}
